# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.http import JsonResponse
from datetime import date
import re
from django.contrib.postgres.search import SearchVector, SearchQuery

#import all apartment models and forms
from autism_prevalence_map.models import *

# Create your views here.
def index(request):
	"""
	  Index page/Main Map
	"""
	context_dict = {}
	return render(request, 'autism_prevalence_map/map.html', context_dict)

def list_view(request):
	"""
	  List of studies page
	"""
	kwargs = {}
	#pull data with lat/lngs only
	kwargs['latitude__isnull'] = False
	kwargs['longitude__isnull'] = False

	pulled_studies = studies.objects.filter(**kwargs).order_by('year')

	context_dict = {'pulled_studies':pulled_studies}
	return render(request, 'autism_prevalence_map/list.html', context_dict)


def studiesApi(request):
	#add in the items geojson requires 
	response = {}
	response['type'] = "FeatureCollection"
	response['features'] = []
	
	if request.method == 'GET':
		kwargs = {}
		# filters
		min_year = request.GET.get("min_year","")
		max_year = request.GET.get("max_year","")
		min_population = request.GET.get("min_population","")
		max_population = request.GET.get("max_population","")
		min_prevalence_rate = request.GET.get("min_prevalence_rate","")
		max_prevalence_rate = request.GET.get("max_prevalence_rate","")
		keyword = request.GET.get("keyword","")


		#apply filters
		if min_year:
			try:
				min_year_re = re.sub("[^0-9]", "", min_year)
				kwargs['year_number__gte'] = date(int(min_year_re), 1, 1)
			except TypeError:
				response['status'] = "The minimum year you entered was not a recognizable 4-digit year. Please try again."
				
		if max_year:
			try:
				max_year_re = re.sub("[^0-9]", "", max_year)
				kwargs['year_number__lte'] = date(int(max_year_re), 1, 1)
			except TypeError:
				response['status'] = "The maximum year you entered was not a recognizable 4-digit year. Please try again."

		if min_population:
			try:
				min_population_re = re.sub("[^0-9]", "", min_population)
				kwargs['population_number__gte'] = int(min_population_re)
			except ValueError:
				response['status'] = "The minimum population you entered was not a recognizable number. Please try again."

		if max_population:
			try:
				max_population_re = re.sub("[^0-9]", "", max_population)
				kwargs['population_number__lte'] = int(max_population_re)
			except ValueError:
				response['status'] = "The maximum population you entered was not a recognizable number. Please try again."
			

		if min_prevalence_rate:
			try:
				min_prevalence_rate_re = re.findall(r"[-+]?\d*\.\d+|\d+", min_prevalence_rate)[0]
				kwargs['prevalence_rate_number__gte'] = float(min_prevalence_rate_re)
			except ValueError:
				response['status'] = "The minimum prevalence rate you entered was not a recognizable number. Please try again."
		
		if max_prevalence_rate:
			try:
				max_prevalence_rate_re = re.findall(r"[-+]?\d*\.\d+|\d+", max_prevalence_rate)[0]
				kwargs['prevalence_rate_number__lte'] = float(max_prevalence_rate_re)
			except ValueError:
				response['status'] = "The maximum prevalence rate you entered was not a recognizable number. Please try again."			
		
		#pull data with lat/lngs only
		kwargs['latitude__isnull'] = False
		kwargs['longitude__isnull'] = False

		# add postgres keyword search
		if keyword:
			#search vectors
			vector = (
				SearchVector('year') + 
				SearchVector('authors') +
				SearchVector('country') +
				SearchVector('area') +
				SearchVector('age') +
				SearchVector('number_affected') +
				SearchVector('diagnostic_criteria') +
				SearchVector('pct_with_normal_iq') +
				SearchVector('gender_ratio') +
				SearchVector('confidence_interval')
			)


			pulled_studies = studies.objects.annotate(search=vector).filter(search=keyword).filter(**kwargs)
		else:
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

		response['status'] = "OK"

	else:
		print request.method

	return JsonResponse(response)