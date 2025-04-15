# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from datetime import date
import re, csv, os
from django.contrib.postgres.search import SearchVector, SearchQuery
from django.db.models import Avg, FloatField
from django.db.models.functions import Cast

#import all apartment models and forms
from autism_prevalence_map.models import *

country_to_continent = {
  'Algeria': 'Africa',
  'Angola': 'Africa',
  'Benin': 'Africa',
  'Botswana': 'Africa',
  'Burkina Faso': 'Africa',
  'Burundi': 'Africa',
  'Cabo Verde': 'Africa',
  'Cameroon': 'Africa',
  'Central African Republic': 'Africa',
  'Chad': 'Africa',
  'Comoros': 'Africa',
  'Democratic Republic of the Congo': 'Africa',
  'Republic of the Congo': 'Africa',
  'Côte d\'Ivoire': 'Africa',
  'Djibouti': 'Africa',
  'Egypt': 'Africa',
  'Equatorial Guinea': 'Africa',
  'Eritrea': 'Africa',
  'Eswatini': 'Africa',
  'Ethiopia': 'Africa',
  'Gabon': 'Africa',
  'Gambia': 'Africa',
  'Ghana': 'Africa',
  'Guinea': 'Africa',
  'Guinea-Bissau': 'Africa',
  'Kenya': 'Africa',
  'Lesotho': 'Africa',
  'Liberia': 'Africa',
  'Libya': 'Africa',
  'Madagascar': 'Africa',
  'Malawi': 'Africa',
  'Mali': 'Africa',
  'Mauritania': 'Africa',
  'Mauritius': 'Africa',
  'Morocco': 'Africa',
  'Mozambique': 'Africa',
  'Namibia': 'Africa',
  'Niger': 'Africa',
  'Nigeria': 'Africa',
  'Rwanda': 'Africa',
  'Sao Tome and Principe': 'Africa',
  'Senegal': 'Africa',
  'Seychelles': 'Africa',
  'Sierra Leone': 'Africa',
  'Somalia': 'Africa',
  'South Africa': 'Africa',
  'South Sudan': 'Africa',
  'Sudan': 'Africa',
  'Tanzania': 'Africa',
  'Togo': 'Africa',
  'Tunisia': 'Africa',
  'Uganda': 'Africa',
  'Zambia': 'Africa',
  'Zimbabwe': 'Africa',
  'Afghanistan': 'Asia',
  'Armenia': 'Asia',
  'Azerbaijan': 'Asia',
  'Bahrain': 'Asia',
  'Bangladesh': 'Asia',
  'Bhutan': 'Asia',
  'Brunei': 'Asia',
  'Cambodia': 'Asia',
  'China': 'Asia',
  'Cyprus': 'Asia',
  'Georgia': 'Asia',
  'India': 'Asia',
  'Indonesia': 'Asia',
  'Iran': 'Asia',
  'Iraq': 'Asia',
  'Israel': 'Asia',
  'Japan': 'Asia',
  'Jordan': 'Asia',
  'Kazakhstan': 'Asia',
  'Kuwait': 'Asia',
  'Kyrgyzstan': 'Asia',
  'Laos': 'Asia',
  'Lebanon': 'Asia',
  'Malaysia': 'Asia',
  'Maldives': 'Asia',
  'Mongolia': 'Asia',
  'Myanmar': 'Asia',
  'Nepal': 'Asia',
  'North Korea': 'Asia',
  'Oman': 'Asia',
  'Pakistan': 'Asia',
  'Philippines': 'Asia',
  'Qatar': 'Asia',
  'Saudi Arabia': 'Asia',
  'Singapore': 'Asia',
  'South Korea': 'Asia',
  'Sri Lanka': 'Asia',
  'Syria': 'Asia',
  'Taiwan': 'Asia',
  'Tajikistan': 'Asia',
  'Thailand': 'Asia',
  'Timor-Leste': 'Asia',
  'Turkey': 'Asia',
  'Turkmenistan': 'Asia',
  'United Arab Emirates': 'Asia',
  'Uzbekistan': 'Asia',
  'Vietnam': 'Asia',
  'Yemen': 'Asia',
  'Albania': 'Europe',
  'Andorra': 'Europe',
  'Austria': 'Europe',
  'Belarus': 'Europe',
  'Belgium': 'Europe',
  'Bosnia and Herzegovina': 'Europe',
  'Bulgaria': 'Europe',
  'Croatia': 'Europe',
  'Czech Republic': 'Europe',
  'Denmark': 'Europe',
  'Estonia': 'Europe',
  'Finland': 'Europe',
  'France': 'Europe',
  'Germany': 'Europe',
  'Greece': 'Europe',
  'Hungary': 'Europe',
  'Iceland': 'Europe',
  'Ireland': 'Europe',
  'Italy': 'Europe',
  'Kosovo': 'Europe',
  'Latvia': 'Europe',
  'Liechtenstein': 'Europe',
  'Lithuania': 'Europe',
  'Luxembourg': 'Europe',
  'Malta': 'Europe',
  'Moldova': 'Europe',
  'Monaco': 'Europe',
  'Montenegro': 'Europe',
  'Netherlands': 'Europe',
  'North Macedonia': 'Europe',
  'Norway': 'Europe',
  'Poland': 'Europe',
  'Portugal': 'Europe',
  'Romania': 'Europe',
  'Russia': 'Europe',
  'San Marino': 'Europe',
  'Serbia': 'Europe',
  'Slovakia': 'Europe',
  'Slovenia': 'Europe',
  'Spain': 'Europe',
  'Sweden': 'Europe',
  'Switzerland': 'Europe',
  'Ukraine': 'Europe',
  'United Kingdom': 'Europe',
  'Vatican City': 'Europe',
  'Antigua and Barbuda': 'North America',
  'Bahamas': 'North America',
  'Barbados': 'North America',
  'Belize': 'North America',
  'Canada': 'North America',
  'Costa Rica': 'North America',
  'Cuba': 'North America',
  'Dominica': 'North America',
  'Dominican Republic': 'North America',
  'El Salvador': 'North America',
  'Grenada': 'North America',
  'Guatemala': 'North America',
  'Haiti': 'North America',
  'Honduras': 'North America',
  'Jamaica': 'North America',
  'Mexico': 'North America',
  'Nicaragua': 'North America',
  'Panama': 'North America',
  'Saint Kitts and Nevis': 'North America',
  'Saint Lucia': 'North America',
  'Saint Vincent and the Grenadines': 'North America',
  'Trinidad and Tobago': 'North America',
  'United States': 'North America',
  'Argentina': 'South America',
  'Bolivia': 'South America',
  'Brazil': 'South America',
  'Chile': 'South America',
  'Colombia': 'South America',
  'Ecuador': 'South America',
  'Guyana': 'South America',
  'Paraguay': 'South America',
  'Peru': 'South America',
  'Suriname': 'South America',
  'Uruguay': 'South America',
  'Venezuela': 'South America',
  'Australia': 'Australia and Oceania',
  'Federated States of Micronesia': 'Australia and Oceania',
  'Fiji': 'Australia and Oceania',
  'Kiribati': 'Australia and Oceania',
  'Marshall Islands': 'Australia and Oceania',
  'Nauru': 'Australia and Oceania',
  'New Zealand': 'Australia and Oceania',
  'Palau': 'Australia and Oceania',
  'Papua New Guinea': 'Australia and Oceania',
  'Samoa': 'Australia and Oceania',
  'Solomon Islands': 'Australia and Oceania',
  'Tonga': 'Australia and Oceania',
  'Tuvalu': 'Australia and Oceania',
  'Vanuatu': 'Australia and Oceania'
}

# Create your views here.
def index(request):
    """
      Index page/Main Map
    """
    if os.environ['DJANGO_ALLOWED_HOSTS'] == '127.0.0.1' :
        style_sheet = 'autism_prevalence_map/dist/main.css'
        script = 'autism_prevalence_map/dist/main.js'
    else :
        style_sheet = 'autism_prevalence_map/dist/main.min.css'
        script = 'autism_prevalence_map/dist/main.min.js'

    if request.method == 'GET':
        min_yearpublished = request.GET.get('min_yearpublished', '')
        max_yearpublished = request.GET.get('max_yearpublished', '')
        yearsstudied_number_min = request.GET.get('yearsstudied_number_min', '')
        yearsstudied_number_max = request.GET.get('yearsstudied_number_max', '')
        min_samplesize = request.GET.get('min_samplesize', '')
        max_samplesize = request.GET.get('max_samplesize', '')
        min_prevalenceper10000 = request.GET.get('min_prevalenceper10000', '')
        max_prevalenceper10000 = request.GET.get('max_prevalenceper10000', '')
        studytype = request.GET.get('studytype', '')
        keyword = request.GET.get('keyword', '')
        timeline_type = request.GET.get('timeline_type', 'published')
        meanincome = request.GET.get('meanincome', '')
        education = request.GET.get('education', '')
        country = request.GET.get('country', '')
        continent = request.GET.get('continent', '')
        try:
            last_updated_on_obj = options.objects.get(name='last_updated_on')
            last_updated_on = last_updated_on_obj.value
        except:
            last_updated_on = ''

    context_dict = {'min_yearpublished': min_yearpublished,
                    'max_yearpublished': max_yearpublished,
                    'yearsstudied_number_min': yearsstudied_number_min,
                    'yearsstudied_number_max': yearsstudied_number_max,
                    'min_samplesize': min_samplesize,
                    'max_samplesize': max_samplesize,
                    'min_prevalenceper10000': min_prevalenceper10000,
                    'max_prevalenceper10000': max_prevalenceper10000,
                    'studytype': studytype,
                    'keyword': keyword,
                    'timeline_type': timeline_type,
                    'meanincome': meanincome,
                    'education': education,
                    'country': country,
                    'continent': continent,
                    'last_updated_on': last_updated_on,
                    'style_sheet': style_sheet,
                    'script': script,}
    
    return render(request, 'autism_prevalence_map/map.html', context_dict)

def list_view(request):
    """
      List of studies page
    """
    if os.environ['DJANGO_ALLOWED_HOSTS'] == '127.0.0.1' :
        style_sheet = 'autism_prevalence_map/dist/main.css'
        script = 'autism_prevalence_map/dist/main.js'
    else :
        style_sheet = 'autism_prevalence_map/dist/main.min.css'
        script = 'autism_prevalence_map/dist/main.min.js'

    if request.method == 'GET':
        min_yearpublished = request.GET.get('min_yearpublished','')
        max_yearpublished = request.GET.get('max_yearpublished','')
        yearsstudied_number_min = request.GET.get('yearsstudied_number_min','')
        yearsstudied_number_max = request.GET.get('yearsstudied_number_max','')
        min_samplesize = request.GET.get('min_samplesize','')
        max_samplesize = request.GET.get('max_samplesize','')
        min_prevalenceper10000 = request.GET.get('min_prevalenceper10000','')
        max_prevalenceper10000 = request.GET.get('max_prevalenceper10000','')
        studytype = request.GET.get('studytype','')
        keyword = request.GET.get('keyword','')
        timeline_type = request.GET.get('timeline_type','published')
        meanincome = request.GET.get('meanincome','')
        education = request.GET.get('education','')
        country = request.GET.get('country', '')
        continent = request.GET.get('continent', '')
        try:
            last_updated_on_obj = options.objects.get(name='last_updated_on')
            last_updated_on = last_updated_on_obj.value
        except:
            last_updated_on = ''

    context_dict = {
        'min_yearpublished':min_yearpublished,
        'max_yearpublished':max_yearpublished,
        'yearsstudied_number_min':yearsstudied_number_min,
        'yearsstudied_number_max':yearsstudied_number_max,
        'min_samplesize':min_samplesize,
        'max_samplesize':max_samplesize,
        'min_prevalenceper10000':min_prevalenceper10000,
        'max_prevalenceper10000':max_prevalenceper10000,
        'studytype':studytype,
        'keyword':keyword,
        'timeline_type':timeline_type,
        'meanincome':meanincome,
        'education':education,
        'country': country,
        'continent': continent,
        'last_updated_on': last_updated_on,
        'style_sheet': style_sheet,
        'script': script,}

    return render(request, 'autism_prevalence_map/list.html', context_dict)

def about(request):
    """
      About page
    """
    if os.environ['DJANGO_ALLOWED_HOSTS'] == '127.0.0.1' :
        style_sheet = 'autism_prevalence_map/dist/main.css'
        script = 'autism_prevalence_map/dist/main.js'
    else :
        style_sheet = 'autism_prevalence_map/dist/main.min.css'
        script = 'autism_prevalence_map/dist/main.min.js'

    if request.method == 'GET':
        min_yearpublished = request.GET.get('min_yearpublished','')
        max_yearpublished = request.GET.get('max_yearpublished','')
        yearsstudied_number_min = request.GET.get('yearsstudied_number_min','')
        yearsstudied_number_max = request.GET.get('yearsstudied_number_max','')
        min_samplesize = request.GET.get('min_samplesize','')
        max_samplesize = request.GET.get('max_samplesize','')
        min_prevalenceper10000 = request.GET.get('min_prevalenceper10000','')
        max_prevalenceper10000 = request.GET.get('max_prevalenceper10000','')
        studytype = request.GET.get('studytype','')
        keyword = request.GET.get('keyword','')
        timeline_type = request.GET.get('timeline_type','published')
        meanincome = request.GET.get('meanincome','')
        education = request.GET.get('education','')
        country = request.GET.get('country', '')
        continent = request.GET.get('continent', '')
        try:
            last_updated_on_obj = options.objects.get(name='last_updated_on')
            last_updated_on = last_updated_on_obj.value
        except:
            last_updated_on = ''

    context_dict = {
        'min_yearpublished':min_yearpublished,
        'max_yearpublished':max_yearpublished,
        'yearsstudied_number_min':yearsstudied_number_min,
        'yearsstudied_number_max':yearsstudied_number_max,
        'min_samplesize':min_samplesize,
        'max_samplesize':max_samplesize,
        'min_prevalenceper10000':min_prevalenceper10000,
        'max_prevalenceper10000':max_prevalenceper10000,
        'studytype':studytype,
        'keyword':keyword,
        'timeline_type':timeline_type,
        'meanincome':meanincome,
        'education':education,
        'country': country,
        'continent': continent,
        'last_updated_on': last_updated_on,
        'style_sheet': style_sheet,
        'script': script,}
        
    return render(request, 'autism_prevalence_map/about.html', context_dict)

def studiesApi(request):
    #add in the items geojson requires
    response = {}
    response['type'] = 'FeatureCollection'
    response['features'] = []

    if request.method == 'GET':
        kwargs = {}
        # filters
        min_yearpublished = request.GET.get('min_yearpublished','')
        max_yearpublished = request.GET.get('max_yearpublished','')
        yearsstudied_number_min = request.GET.get('yearsstudied_number_min','')
        yearsstudied_number_max = request.GET.get('yearsstudied_number_max','')
        min_samplesize = request.GET.get('min_samplesize','')
        max_samplesize = request.GET.get('max_samplesize','')
        min_prevalenceper10000 = request.GET.get('min_prevalenceper10000','')
        max_prevalenceper10000 = request.GET.get('max_prevalenceper10000','')
        studytype = request.GET.get('studytype','')
        keyword = request.GET.get('keyword','')
        timeline_type = request.GET.get('timeline_type','published')
        meanincome = request.GET.get('meanincome','')
        education = request.GET.get('education','')
        country = request.GET.get('country', '')
        continent = request.GET.get('continent', '')

        #apply filters
        if min_yearpublished:
            try:
                min_yearpublished_re = re.sub('[^0-9]', '', min_yearpublished)
                kwargs['yearpublished_number__gte'] = date(int(min_yearpublished_re), 1, 1)
            except TypeError:
                response['status'] = 'The minimum year of publication you entered was not a recognizable 4-digit year. Please try again.'

        if max_yearpublished:
            try:
                max_yearpublished_re = re.sub('[^0-9]', '', max_yearpublished)
                kwargs['yearpublished_number__lte'] = date(int(max_yearpublished_re), 1, 1)
            except TypeError:
                response['status'] = 'The maximum year of publication you entered was not a recognizable 4-digit year. Please try again.'

        if yearsstudied_number_min:
            kwargs['yearsstudied__isnull'] = False
            try:
                yearsstudied_number_min_re = re.sub('[^0-9]', '', yearsstudied_number_min)
                kwargs['yearsstudied_number_min__gte'] = date(int(yearsstudied_number_min_re), 1, 1)
            except TypeError:
                response['status'] = 'The minimum year studied you entered was not a recognizable 4-digit year. Please try again.'

        if yearsstudied_number_max:
            try:
                yearsstudied_number_max_re = re.sub('[^0-9]', '', yearsstudied_number_max)
                kwargs['yearsstudied_number_max__lte'] = date(int(yearsstudied_number_max_re), 1, 2)
            except TypeError:
                response['status'] = 'The maximum year studied you entered was not a recognizable 4-digit year. Please try again.'

        if min_samplesize:
            try:
                min_samplesize_re = re.sub('[^0-9]', '', min_samplesize)
                kwargs['samplesize_number__gte'] = int(min_samplesize_re)
            except ValueError:
                response['status'] = 'The minimum study size you entered was not a recognizable number. Please try again.'

        if max_samplesize:
            try:
                max_samplesize_re = re.sub('[^0-9]', '', max_samplesize)
                kwargs['samplesize_number__lte'] = int(max_samplesize_re)
            except ValueError:
                response['status'] = 'The maximum study size you entered was not a recognizable number. Please try again.'

        if min_prevalenceper10000:
            try:
                min_prevalenceper10000_re = re.findall(r'[-+]?\d*\.\d+|\d+', min_prevalenceper10000)[0]
                kwargs['prevalenceper10000_number__gte'] = float(min_prevalenceper10000_re)
            except ValueError:
                response['status'] = 'The minimum prevalence rate you entered was not a recognizable number. Please try again.'

        if max_prevalenceper10000:
            try:
                max_prevalenceper10000_re = re.findall(r'[-+]?\d*\.\d+|\d+', max_prevalenceper10000)[0]
                kwargs['prevalenceper10000_number__lte'] = float(max_prevalenceper10000_re)
            except ValueError:
                response['status'] = 'The maximum prevalence rate you entered was not a recognizable number. Please try again.'

        if meanincome:
            kwargs['meanincomeofparticipants'] = meanincome
        if education:
            kwargs['educationlevelofparticipants'] = education
        if studytype:
            kwargs['studytype__icontains'] = studytype
        if timeline_type == 'studied':
            kwargs['yearsstudied_number_min__isnull'] = False
        if country:
            kwargs['country__iexact'] = country
        if continent:
            # find all countries in that continent
            matched_countries = []
            for ctry, cont in country_to_continent.items():
                if cont == continent:
                    matched_countries.append(ctry)
            kwargs['country__in'] = matched_countries

        #pull data with lat/lngs only
        kwargs['latitude__isnull'] = False
        kwargs['longitude__isnull'] = False

        # add postgres keyword search
        if keyword:
            #search vectors
            vector = (
                SearchVector('yearpublished') +
                SearchVector('authors') +
                SearchVector('country') +
                SearchVector('area') +
                SearchVector('age') +
                SearchVector('samplesize') +
                SearchVector('individualswithautism') +
                SearchVector('diagnosticcriteria') +
                SearchVector('diagnostictools') +
                SearchVector('percentwaverageiq') +
                SearchVector('sexratiomf') +
                SearchVector('prevalenceper10000') +
                SearchVector('confidenceinterval') +
                SearchVector('categoryadpddorasd') +
                SearchVector('yearsstudied') +
                SearchVector('recommended') +
                SearchVector('studytype') +
                SearchVector('meanincomeofparticipants') +
                SearchVector('educationlevelofparticipants') +
                SearchVector('citation') +
                SearchVector('link1title') +
                SearchVector('link1url') +
                SearchVector('link2title') +
                SearchVector('link2url') +
                SearchVector('link3title') +
                SearchVector('link3url') +
                SearchVector('link4title') +
                SearchVector('link4url')
            )

            pulled_studies = studies.objects.annotate(search=vector).filter(search=keyword).filter(**kwargs)
        else:
            pulled_studies = studies.objects.filter(**kwargs)

        # calculate the mean on page load, and after filtering, and include that value in the JSON response
        mean_agg = pulled_studies.aggregate(mean=Avg(Cast('prevalenceper10000_number', FloatField())))
        mean_value = mean_agg.get('mean')
        if mean_value is None:
            mean_value = 0
        mean_formatted = f"{mean_value:.2f}"
        response['mean'] = mean_formatted

        for study in pulled_studies:
            data = {}
            data['type'] = 'Feature'
            data['properties'] = {}
            data['properties']['pk'] = study.pk
            data['properties']['yearpublished'] = study.yearpublished
            data['properties']['authors'] = study.authors
            data['properties']['country'] = study.country
            data['properties']['area'] = study.area
            data['properties']['samplesize'] = study.samplesize
            data['properties']['age'] = study.age
            data['properties']['individualswithautism'] = study.individualswithautism
            data['properties']['diagnosticcriteria'] = study.diagnosticcriteria
            data['properties']['diagnostictools'] = study.diagnostictools
            data['properties']['percentwaverageiq'] = study.percentwaverageiq
            data['properties']['sexratiomf'] = study.sexratiomf
            data['properties']['prevalenceper10000'] = study.prevalenceper10000
            data['properties']['confidenceinterval'] = study.confidenceinterval
            data['properties']['categoryadpddorasd'] = study.categoryadpddorasd
            data['properties']['yearsstudied'] = study.yearsstudied
            data['properties']['yearsstudied_number_min'] = study.yearsstudied_number_min
            data['properties']['yearsstudied_number_max'] = study.yearsstudied_number_max
            data['properties']['num_yearsstudied'] = study.num_yearsstudied
            data['properties']['recommended'] = study.recommended
            data['properties']['studytype'] = study.studytype
            data['properties']['meanincomeofparticipants'] = study.meanincomeofparticipants
            data['properties']['educationlevelofparticipants'] = study.educationlevelofparticipants
            data['properties']['citation'] = study.citation
            data['properties']['link1title'] = study.link1title
            data['properties']['link1url'] = study.link1url
            data['properties']['link2title'] = study.link2title
            data['properties']['link2url'] = study.link2url
            data['properties']['link3title'] = study.link3title
            data['properties']['link3url'] = study.link3url
            data['properties']['link4title'] = study.link4title
            data['properties']['link4url'] = study.link4url
            data['geometry'] = {}
            data['geometry']['type'] = 'Point'
            data['geometry']['coordinates'] = [study.longitude, study.latitude]
            response['features'].append(data)

        response['status'] = '200'

    else:
        print(request.method)

    return JsonResponse(response)

def studiesCsv(request):
    #create header for CSV file download
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="transmitter_autism_prevalence_map_data_download.csv"'

    if request.method == 'GET':
        kwargs = {}
        # filters
        min_yearpublished = request.GET.get('min_yearpublished','')
        max_yearpublished = request.GET.get('max_yearpublished','')
        yearsstudied_number_min = request.GET.get('yearsstudied_number_min','')
        yearsstudied_number_max = request.GET.get('yearsstudied_number_max','')
        min_samplesize = request.GET.get('min_samplesize','')
        max_samplesize = request.GET.get('max_samplesize','')
        min_prevalenceper10000 = request.GET.get('min_prevalenceper10000','')
        max_prevalenceper10000 = request.GET.get('max_prevalenceper10000','')
        studytype = request.GET.get('studytype','')
        keyword = request.GET.get('keyword','')
        timeline_type = request.GET.get('timeline_type','published')
        meanincome = request.GET.get('meanincome','')
        education = request.GET.get('education','')
        country = request.GET.get('country', '')
        continent = request.GET.get('continent', '')

        #apply filters
        if min_yearpublished:
            try:
                min_yearpublished_re = re.sub('[^0-9]', '', min_yearpublished)
                kwargs['yearpublished_number__gte'] = date(int(min_yearpublished_re), 1, 1)
            except TypeError:
                response['status'] = 'The minimum year of publication you entered was not a recognizable 4-digit year. Please try again.'

        if max_yearpublished:
            try:
                max_yearpublished_re = re.sub('[^0-9]', '', max_yearpublished)
                kwargs['yearpublished_number__lte'] = date(int(max_yearpublished_re), 1, 1)
            except TypeError:
                response['status'] = 'The maximum year of publication you entered was not a recognizable 4-digit year. Please try again.'

        if yearsstudied_number_min:
            try:
                yearsstudied_number_min_re = re.sub('[^0-9]', '', yearsstudied_number_min)
                kwargs['yearsstudied_number_min__gte'] = date(int(yearsstudied_number_min_re), 1, 1)
            except TypeError:
                response['status'] = 'The minimum year studied you entered was not a recognizable 4-digit year. Please try again.'

        if yearsstudied_number_max:
            try:
                yearsstudied_number_max_re = re.sub('[^0-9]', '', yearsstudied_number_max)
                kwargs['yearsstudied_number_max__lte'] = date(int(yearsstudied_number_max_re), 1, 1)
            except TypeError:
                response['status'] = 'The maximum year studied you entered was not a recognizable 4-digit year. Please try again.'

        if min_samplesize:
            try:
                min_samplesize_re = re.sub('[^0-9]', '', min_samplesize)
                kwargs['samplesize_number__gte'] = int(min_samplesize_re)
            except ValueError:
                response['status'] = 'The minimum study size you entered was not a recognizable number. Please try again.'

        if max_samplesize:
            try:
                max_samplesize_re = re.sub('[^0-9]', '', max_samplesize)
                kwargs['samplesize_number__lte'] = int(max_samplesize_re)
            except ValueError:
                response['status'] = 'The maximum study size you entered was not a recognizable number. Please try again.'

        if min_prevalenceper10000:
            try:
                min_prevalenceper10000_re = re.findall(r'[-+]?\d*\.\d+|\d+', min_prevalenceper10000)[0]
                kwargs['prevalenceper10000_number__gte'] = float(min_prevalenceper10000_re)
            except ValueError:
                response['status'] = 'The minimum prevalence rate you entered was not a recognizable number. Please try again.'

        if max_prevalenceper10000:
            try:
                max_prevalenceper10000_re = re.findall(r'[-+]?\d*\.\d+|\d+', max_prevalenceper10000)[0]
                kwargs['prevalenceper10000_number__lte'] = float(max_prevalenceper10000_re)
            except ValueError:
                response['status'] = 'The maximum prevalence rate you entered was not a recognizable number. Please try again.'

        if meanincome:
            kwargs['meanincomeofparticipants'] = meanincome
        if education:
            kwargs['educationlevelofparticipants'] = education
        if studytype:
            kwargs['studytype__icontains'] = studytype
        if timeline_type == 'studied':
            kwargs['yearsstudied_number_min__isnull'] = False
        if country:
            kwargs['country__iexact'] = country
        if continent:
            matched_countries = []
            for ctry, cont in country_to_continent.items():
                if cont == continent:
                    matched_countries.append(ctry)
            kwargs['country__in'] = matched_countries

        #pull data with lat/lngs only
        kwargs['latitude__isnull'] = False
        kwargs['longitude__isnull'] = False

        # add postgres keyword search
        if keyword:
            #search vectors
            vector = (
                SearchVector('yearpublished') + 
                SearchVector('authors') +
                SearchVector('country') +
                SearchVector('area') +
                SearchVector('age') +
                SearchVector('samplesize') +
                SearchVector('individualswithautism') +
                SearchVector('diagnosticcriteria') +
                SearchVector('diagnostictools') +
                SearchVector('percentwaverageiq') +
                SearchVector('sexratiomf') +
                SearchVector('prevalenceper10000') +
                SearchVector('confidenceinterval') +
                SearchVector('categoryadpddorasd') +
                SearchVector('yearsstudied') +
                SearchVector('recommended') +
                SearchVector('studytype') +
                SearchVector('meanincomeofparticipants') +
                SearchVector('educationlevelofparticipants') +
                SearchVector('citation') +
                SearchVector('link1title') +
                SearchVector('link1url') +
                SearchVector('link2title') +
                SearchVector('link2url') +
                SearchVector('link3title') +
                SearchVector('link3url') +
                SearchVector('link4title') +
                SearchVector('link4url')
            )

            pulled_studies = studies.objects.annotate(search=vector).filter(search=keyword).filter(**kwargs)
        else:
            pulled_studies = studies.objects.filter(**kwargs)

        writer = csv.writer(response)

        # CSV header
        writer.writerow(['Year published', 'Authors', 'Country', 'Area', 'Sample size', 'Age (years)',
        'Individuals with autism', 'Diagnostic criteria', 'Diagnostic tools', 'Percent w/ average IQ',
        'Sex ratio (M:F)', 'Prevalence (per 10,000)', '95% Confidence interval', 'Category (AD, PDD or ASD)',
        'Year(s) studied', 'Recommended', 'Study type', 'Citation', 'Link 1 Title', 'Link 1 URL', 'Link 2 Title',
        'Link 2 URL', 'Link 3 Title', 'Link 3 URL', 'Link 4 Title', 'Link 4 URL'])
        
        # print(pulled_studies)
        for study in pulled_studies:
            writer.writerow([study.yearpublished, study.authors, study.country, study.area, study.samplesize, study.age,
            study.individualswithautism, study.diagnosticcriteria, study.diagnostictools, study.percentwaverageiq, study.sexratiomf,
            study.prevalenceper10000, study.confidenceinterval, study.categoryadpddorasd, study.yearsstudied, study.recommended,
            study.studytype, study.citation, study.link1title, study.link1url, study.link2title,  study.link2url, study.link3title,
            study.link3url, study.link4title,  study.link4url])

        response['status'] = '200'
        
    else:
        print(request.method)

    return response
