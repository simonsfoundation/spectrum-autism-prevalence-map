# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.http import JsonResponse

#import all apartment models and forms
from autism_prevalence_map.models import *

# Create your views here.
def index(request):
	"""
	  Index page/Main Map
	"""
	context_dict = {}
	return render(request, 'autism_prevalence_map/map.html', context_dict)


def studiesApi(request):
	#add in the items geojson requires 
	response = {}
	response['type'] = "FeatureCollection"
	response['features'] = []
	
	if request.method == 'GET':
		kwargs = {}
		# filters
		# someFilter = request.GET.get("someFilter","")
		
		#pull data with lat/lngs only
		kwargs['latitude__isnull'] = False
		kwargs['longitude__isnull'] = False
		
		pulled_studies = studies.objects.filter(**kwargs)
		for study in pulled_studies:
			data = {}
			data['type'] = 'Feature'
			data['properties'] = {}
			data['properties']['year'] = study.year
			data['properties']['authors'] = study.authors
			data['properties']['country'] = study.country
			data['properties']['area'] = study.area
			data['properties']['population'] = study.population
			data['properties']['age'] = study.age
			data['properties']['number_affected'] = study.number_affected
			data['properties']['diagnostic_criteria'] = study.diagnostic_criteria
			data['properties']['pct_with_normal_iq'] = study.pct_with_normal_iq
			data['properties']['gender_ratio'] = study.gender_ratio
			data['properties']['prevalence_rate'] = study.prevalence_rate
			data['properties']['confidence_interval'] = study.confidence_interval
			data['geometry'] = {}
			data['geometry']['type'] = 'Point'
			data['geometry']['coordinates'] = [study.longitude, study.latitude]
			response['features'].append(data)
	else:
		print request.method

	return JsonResponse(response)