# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import sys, os, urllib.request, json, time, datetime, re
from django.contrib import admin
from .models import studies
from django import forms
class StudiesForm(forms.ModelForm):
    
    yearpublished = forms.CharField(label='Year Published', required=False, initial='')
    authors = forms.CharField(label="Authors", required=False, initial='')
    country = forms.CharField(required=False, initial='')
    area = forms.CharField(required=False, initial='')
    samplesize = forms.CharField(label='Sample Size',required=False, initial='')
    age = forms.CharField(label="Age(years)",required=False, initial='')
    individualswithautism = forms.CharField(label='Individual with Autism',required=False, initial='')
    diagnosticcriteria = forms.CharField(label='Diagnostic Criteria',required=False, initial='')
    diagnostictools = forms.CharField(label='Diagnostic Tools',required=False, initial='')
    percentwaverageiq = forms.CharField(label='Percent w/ Average IQ',required=False, initial='')
    sexratiomf = forms.CharField(label='Sex Ratio (M:F)',required=False, initial='')
    prevalenceper10000 = forms.CharField(label='Prevalence (per 10,000)',required=False, initial='')
    confidenceinterval = forms.CharField(label='95% Confidence interval',required=False, initial='')
    categoryadpddorasd = forms.CharField(label='Category (AD, PDD or ASD)',required=False, initial='')
    yearsstudied = forms.CharField(label='Year(s) Studied',required=False, initial='')
    recommended = forms.CharField(required=False, initial='')
    studytype = forms.CharField(label='Study Type', required=False, initial='')
    meanincomeofparticipants = forms.CharField(label='Income', required=False, initial='')
    educationlevelofparticipants = forms.CharField(label='Education', required=False, initial='')
    citation = forms.CharField( required=False, initial='')
    link1title = forms.CharField(label='Link 1 Title', required=False, initial='')
    link1url = forms.CharField(label='Link 1 Url', required=False, initial='')
    link2title = forms.CharField(label='Link 2 Title', required=False, initial='')
    link2url = forms.CharField(label='Link 2 Url', required=False, initial='')
    link3title = forms.CharField(label='Link 3 Title', required=False, initial='')
    link3url = forms.CharField(label='Link 3 Url', required=False, initial='')
    link4title = forms.CharField(label='Link 4 Title', required=False, initial='')
    link4url = forms.CharField(label='Link 4 Url', required=False, initial='')

    class Meta:
        model = studies
        exclude = ['gsheet_id','latitude','longitude','yearpublished_number','yearsstudied_number_min', 'yearsstudied_number_max','prevalenceper10000_number', 'samplesize_number', 'num_yearsstudied']

@admin.register(studies)
class StudiesAdmin(admin.ModelAdmin):
    list_display = ("id","yearpublished", "authors", "country", "area", "samplesize", "age", "individualswithautism", "diagnosticcriteria", "diagnostictools", "percentwaverageiq", "sexratiomf", "prevalenceper10000", "confidenceinterval", "categoryadpddorasd", "yearsstudied", "recommended", "studytype", "meanincomeofparticipants", "educationlevelofparticipants", "citation", "link1title","link1url", "link2title", "link2url", "link3title", "link3url", "link4title", "link4url", "latitude", "longitude")
    search_fields = ("yearpublished", "authors", "country", "area", "age", "samplesize", "individualswithautism", "diagnosticcriteria", "diagnostictools", "percentwaverageiq", "sexratiomf", "prevalenceper10000", "confidenceinterval", "categoryadpddorasd", "yearsstudied", "recommended", "studytype", "meanincomeofparticipants", "educationlevelofparticipants", "citation", "link1title", "link1url", "link2title", "link2url", "link3title", "link3url", "link4title", "link4url", "latitude", "longitude")
    form = StudiesForm

    def save_model(self, request, obj, form, change):
        self.parse_data(obj)
        self.geocode(obj)
        return super().save_model(request, obj, form, change)

    def geocode(self, study):
        gmaps_api_key = '&key=AIzaSyACddN3i59_QccZTqB4cWGyK6ZDFCLCVBE'
        base_url = 'https://maps.googleapis.com/maps/api/geocode/json'

        # call the geocode URL
        area = study.area
        country = study.country

        if not area or not country:
            return None 
    
        if area in ('Mainland and Azores', 'Northern Ostrobothnia County') :
            area = ''
        address = '?address=' + urllib.parse.quote(area) + ',' + urllib.parse.quote(country)
        #add region codes for the countries that are being located wrongly by google geocode API
        countrymap = {'Japan': 'jp', 'Qatar': 'qa', 'Iran': 'ir', 'Greece': 'gr', 'Scotland': 'gb', 'Taiwan': 'tw', 'South Korea': 'kr', 'Wales': 'gb', 'France': 'fr', 'Norway': 'no'}
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

