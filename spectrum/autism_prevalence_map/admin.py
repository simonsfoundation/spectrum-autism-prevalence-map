# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import sys, os, urllib.request, json, time, datetime, re
from django.contrib import admin
from .models import studies

# Register your models here.

@admin.register(studies)
class AdminStudies(admin.ModelAdmin):
    list_display = ("id","yearpublished", "authors", "country", "area", "samplesize", "age", "individualswithautism", "diagnosticcriteria")
    exclude = ('gsheet_id','latitude','longitude','yearpublished_number','yearsstudied_number_min', 'yearsstudied_number_max','prevalenceper10000_number', 'samplesize_number', 'num_yearsstudied')
    
    def save_model(self, request, obj, form, change):
        self.parse_data(obj)
        self.geocode(obj)
        return super().save_model(request, obj, form, change)

    def geocode(self, study):
        gmaps_api_key = '&key=AIzaSyACddN3i59_QccZTqB4cWGyK6ZDFCLCVBE'
        base_url = 'https://maps.googleapis.com/maps/api/geocode/json'

        # try to geocode only where country and area are not null, and where lat and lon are null
        kwargs = {}
        kwargs['country__isnull'] = False
        kwargs['area__isnull'] = False

        # call the geocode URL
        area = study.area
        country = study.country
        if area in ('Mainland and Azores', 'Northern Ostrobothnia County') :
            area = ''
        address = '?address=' + urllib.parse.quote(area) + ',' + urllib.parse.quote(country)
        #add region codes for the countries that are being located wrongly by google geocode API
        countrymap = {'Japan': 'jp', 'Qatar': 'qa', 'Iran': 'ir', 'Greece': 'gr', 'Scotland': 'gb', 'Taiwan': 'tw', 'South Korea': 'kr', 'Wales': 'gb', 'France': 'fr', 'Norway': 'no'};
        if country in countrymap.keys() :
            address = address + '&region=' + countrymap[country]
        url = base_url + address + gmaps_api_key
        response = urllib.request.urlopen(url)
        data = json.loads(response.read())

        if data['status'] == "OK":
            latitude = float(data['results'][0]['geometry']['location']['lat'])
            longitude = float(data['results'][0]['geometry']['location']['lng'])
        else:
            latitude = None
            longitude = None
        study.latitude=latitude
        study.longitude=longitude
        time.sleep(1)

    def parse_data(self, study):
        # for year, population, and prevalence rate, convert from strings to dates and numbers and store in DB


        # ensure year string has no non-number characters, convert to date
        yearpublished = re.sub("[^0-9]", "", study.yearpublished)
        if yearpublished:
            try:
                yearpublished_number = datetime.datetime.strptime(yearpublished, '%Y')
            except ValueError:
                yearpublished_number = None
        else:
            yearpublished_number = None

        # ensure population string has no non-number characters, convert to integer
        samplesize = re.sub("[^0-9]", "", study.samplesize)

        if samplesize:
            try:
                samplesize_number = int(samplesize)
            except ValueError:
                samplesize_number = None
        else:
            samplesize_number = None

        # ensure prevalence rate string has no non-number characters, convert to float
        try:
            prevalenceper10000 = re.findall(r"[-+]?\d*\.\d+|\d+", study.prevalenceper10000)[0]
        except IndexError:
            prevalenceper10000 = None

        if prevalenceper10000:
            try:
                prevalenceper10000_number = float(prevalenceper10000)
            except ValueError:
                prevalenceper10000_number = None
        else:
            prevalenceper10000_number = None

        # extract the maximum and minimum dates from the `yearstudied` field
        years = study.yearsstudied.split('-')
        yearsstudied_min = None
        yearsstudied_max = None

        try:
            yearsstudied_min = re.sub("[^0-9]", "", years[0])
            if yearsstudied_min:
                try:
                    yearsstudied_number_min = datetime.datetime.strptime(yearsstudied_min, '%Y')
                except ValueError:
                    yearsstudied_number_min = None
            else:
                yearsstudied_number_min = None
        except IndexError:
            yearsstudied_number_min = None
            yearsstudied_min = None

        try:
            yearsstudied_max = re.sub("[^0-9]", "", years[1])
            if yearsstudied_max:
                try:
                    yearsstudied_number_max = datetime.datetime.strptime(yearsstudied_max, '%Y')
                except ValueError:
                    yearsstudied_number_max = None
            else:
                yearsstudied_number_max = None
        except IndexError:
            yearsstudied_number_max = None
            yearsstudied_max = None

        if yearsstudied_number_min and yearsstudied_number_max is None:
            yearsstudied_number_max = yearsstudied_number_min
            yearsstudied_min = yearsstudied_max

        #calculate the span of years of study
        if yearsstudied_min and yearsstudied_max:
            try:
                num_yearsstudied = (int(yearsstudied_max) - int(yearsstudied_min)) + 1
            except ValueError:
                num_yearsstudied = None
        elif yearsstudied_min:
            num_yearsstudied = 1
        else:
            num_yearsstudied = None

        study.yearpublished_number=yearpublished_number
        study.samplesize_number=samplesize_number
        study.prevalenceper10000_number=prevalenceper10000_number
        study.yearsstudied_number_min=yearsstudied_number_min
        study.yearsstudied_number_max=yearsstudied_number_max 
        study.num_yearsstudied=num_yearsstudied

