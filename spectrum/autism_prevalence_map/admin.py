# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.conf import settings
import sys, os, urllib.request, json, time, datetime, re
from django.contrib import admin
from .models import studies, options, AboutPage, AboutSection
from django import forms
from django.conf.urls import url
from django.template.response import TemplateResponse
from django.shortcuts import redirect
import csv
import io

class StudiesForm(forms.ModelForm):
    
    yearpublished = forms.CharField(label='Year Published', required=False, initial='')
    authors = forms.CharField(label="Authors", required=False, initial='')
    country = forms.CharField(required=False, initial='')
    area = forms.CharField(required=False, initial='')
    samplesize = forms.CharField(label='Sample Size',required=False, initial='')
    age = forms.CharField(label="Age(years)",required=False, initial='')
    individualswithautism = forms.CharField(label='Individuals with Autism',required=False, initial='')
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
        exclude = ['gsheet_id', 'latitude', 'longitude', 'yearpublished_number',
                   'yearsstudied_number_min', 'yearsstudied_number_max', 'prevalenceper10000_number', 'samplesize_number',
                   'num_yearsstudied'
                   ]

class CsvImportForm(forms.Form):
    csv_file = forms.FileField()

@admin.register(studies)
class StudiesAdmin(admin.ModelAdmin):
    list_display = ("id", "yearpublished", "authors", "country", "area",
                    "samplesize", "age", "individualswithautism", "diagnosticcriteria",
                    "diagnostictools", "percentwaverageiq", "sexratiomf", "prevalenceper10000",
                    "confidenceinterval", "categoryadpddorasd", "yearsstudied", "recommended",
                    "studytype", "meanincomeofparticipants", "educationlevelofparticipants", "citation",
                    "link1title", "link1url", "link2title", "link2url",
                    "link3title", "link3url", "link4title", "link4url",
                    "latitude", "longitude"
                    )
    search_fields = ("yearpublished", "authors", "country", "area",
                     "age", "samplesize", "individualswithautism", "diagnosticcriteria",
                     "diagnostictools", "percentwaverageiq", "sexratiomf", "prevalenceper10000",
                     "confidenceinterval", "categoryadpddorasd", "yearsstudied", "recommended",
                     "studytype", "meanincomeofparticipants", "educationlevelofparticipants",
                     "citation", "link1title", "link1url", "link2title",
                     "link2url", "link3title", "link3url", "link4title",
                     "link4url", "latitude", "longitude"
                     )
    form = StudiesForm

    def get_urls(self):
        urls = super().get_urls()
        bulk_import_urls = [
            url(r'bulk-import/', self.bulk_import_vew),
        ]
        return bulk_import_urls + urls

    def bulk_import_vew(self, request):
        if request.method == 'POST':
            with io.TextIOWrapper(request.FILES["csv_file"], encoding="utf-8", newline='\n') as text_file:
                studies.objects.all().delete()
                reader = csv.DictReader(text_file)
                index = 0
                for row in reader:
                    index = index + 1
                    try:
                        #skip if year not a date
                        yearpublished = row['Year published']
                        if yearpublished:
                            try:
                                yearpublished_number = datetime.datetime.strptime(yearpublished, '%Y')
                            except ValueError:
                                yearpublished_number = None
                        else:
                            yearpublished_number = None
                        if yearpublished_number:
                            updated_values = {
                                'yearpublished': row['Year published'] if row['Year published'] is not None else '',
                                'authors': row['Authors'] if row['Authors'] is not None else '', 
                                'country': row['Country'] if row['Country'] is not None else '', 
                                'area': row['Area'] if row['Area'] is not None else '', 
                                'samplesize': row['Sample size'] if row['Sample size'] is not None else '', 
                                'age': row['Age (years)'] if row['Age (years)'] is not None else '', 
                                'individualswithautism': row['Individuals with autism'] if row['Individuals with autism'] is not None else '', 
                                'diagnosticcriteria': row['Diagnostic criteria'] if row['Diagnostic criteria'] is not None else '', 
                                'diagnostictools': row['Diagnostic tools'] if row['Diagnostic tools'] is not None else '', 
                                'percentwaverageiq': row['Percent w/ average IQ'] if row['Percent w/ average IQ'] is not None else '', 
                                'sexratiomf': row['Sex ratio (M:F)'] if row['Sex ratio (M:F)'] is not None else '', 
                                'prevalenceper10000': row['Prevalence (per 10,000)'] if row['Prevalence (per 10,000)'] is not None else '', 
                                'confidenceinterval': row['95% Confidence interval'] if row['95% Confidence interval'] is not None else '', 
                                'categoryadpddorasd': row['Category (AD, PDD or ASD)'] if row['Category (AD, PDD or ASD)'] is not None else '',
                                'yearsstudied': row['Year(s) studied'] if row['Year(s) studied'] is not None else '',
                                'recommended': row['Recommended'] if row['Recommended'] is not None else '', 
                                'studytype': row['Study type'] if row['Study type'] is not None else '',
                                'meanincomeofparticipants': row['Mean income of participants'] if row['Mean income of participants'] is not None else '',
                                'educationlevelofparticipants': row['Education level of participants'] if row['Education level of participants'] is not None else '',
                                'citation': row['Citation'] if row['Citation'] is not None else '',
                                'link1title': row['Link 1 Title'] if row['Link 1 Title'] is not None else '',
                                'link1url': row['Link 1 URL'] if row['Link 1 URL'] is not None else '',
                                'link2title': row['Link 2 Title'] if row['Link 2 Title'] is not None else '',
                                'link2url': row['Link 2 URL'] if row['Link 2 URL'] is not None else '',
                                'link3title': row['Link 3 Title'] if row['Link 3 Title'] is not None else '',
                                'link3url': row['Link 3 URL'] if row['Link 3 URL'] is not None else '',
                                'link4title': row['Link 4 Title'] if row['Link 4 Title'] is not None else '',
                                'link4url': row['Link 4 URL'] if row['Link 4 URL'] is not None else ''
                            }
                            
                            obj, created = studies.objects.update_or_create(gsheet_id=index,defaults=updated_values)
                            self.parse_data(obj)
                            self.geocode(obj)
                            obj.save()

                    except Exception as e:
                        print('load research data error')
                        print(e)
            self.last_updated_on()
            self.message_user(request, "Your csv file has been imported")
            return redirect("..")
        form = CsvImportForm()
        payload = {"form": form}
        return TemplateResponse(request, "admin/bulk_import.html", payload)
        
    def save_model(self, request, obj, form, change):
        self.parse_data(obj)
        self.geocode(obj)
        self.last_updated_on()
        return super().save_model(request, obj, form, change)

    def delete_model(self, request, obj):
        self.last_updated_on()
        return super().delete_model(request, obj)

    def geocode(self, study):
        gmaps_api_key = '&key=' + settings.GMAP_API_KEY
        base_url = 'https://maps.googleapis.com/maps/api/geocode/json'

        # call the geocode URL
        area = study.area
        country = study.country

        if not country:
            return None 
    
        if area in ('Mainland and Azores', 'Northern Ostrobothnia County', 'Nationwide'):
            area = ''
        if area == 'Middlesex':
            country = 'London'
            
        address = '?address=' + urllib.parse.quote(area) + ',' + urllib.parse.quote(country)
        #add region codes for the countries/areas that are being located wrongly by google geocode API
        countrymap = {'Japan': 'jp', 'Qatar': 'qa',
                      'Iran': 'ir', 'Greece': 'gr',
                      'Scotland': 'gb', 'Taiwan': 'tw',
                      'South Korea': 'kr', 'Wales': 'gb',
                      'France': 'fr', 'Norway': 'no'
                      }
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
        
    def last_updated_on(self):
        option_obj, _ = options.objects.update_or_create(name='last_updated_on')
        option_obj.value = datetime.date.today().strftime("%-d %B %Y")
        option_obj.save()

class AboutSectionInline(admin.StackedInline):
    model = AboutSection
    extra = 0
    fields = ('section_type', 'title', 'content', 'newsletter_title', 'newsletter_support_line', 'newsletter_id', 'section_title_text', 'section_title_id', 'links', 'order')

    class Media:
        js = ('autism_prevalence_map/dist/admin.min.js' if os.environ['DJANGO_ALLOWED_HOSTS'] != '127.0.0.1' else 'autism_prevalence_map/dist/admin.js',)

admin.site.register(options)

@admin.register(AboutPage)
class AboutPageAdmin(admin.ModelAdmin):
    inlines = [AboutSectionInline]
    list_display = ('title',)
    fields = ('title', 'meta_title', 'meta_description', 'meta_thumbnail')
