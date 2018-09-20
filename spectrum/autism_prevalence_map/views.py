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
	if request.method == 'GET':
		min_year_of_publication = request.GET.get("min_year_of_publication","")
		max_year_of_publication = request.GET.get("max_year_of_publication","")
		min_study_size = request.GET.get("min_study_size","")
		max_study_size = request.GET.get("max_study_size","")
		min_prevalence_rate = request.GET.get("min_prevalence_rate","")
		max_prevalence_rate = request.GET.get("max_prevalence_rate","")
		category = request.GET.get("category","")
		keyword = request.GET.get("keyword","")


	context_dict = {"min_year_of_publication":min_year_of_publication, "max_year_of_publication":max_year_of_publication, "min_study_size":min_study_size, "max_study_size":max_study_size, "min_prevalence_rate":min_prevalence_rate, "max_prevalence_rate":max_prevalence_rate, "category":category , "keyword":keyword}
	return render(request, 'autism_prevalence_map/map.html', context_dict)

def list_view(request):
	"""
	  List of studies page
	"""
	if request.method == 'GET':
		min_year_of_publication = request.GET.get("min_year_of_publication","")
		max_year_of_publication = request.GET.get("max_year_of_publication","")
		min_study_size = request.GET.get("min_study_size","")
		max_study_size = request.GET.get("max_study_size","")
		min_prevalence_rate = request.GET.get("min_prevalence_rate","")
		max_prevalence_rate = request.GET.get("max_prevalence_rate","")
		category = request.GET.get("category","")
		keyword = request.GET.get("keyword","")


	context_dict = {"min_year_of_publication":min_year_of_publication, "max_year_of_publication":max_year_of_publication, "min_study_size":min_study_size, "max_study_size":max_study_size, "min_prevalence_rate":min_prevalence_rate, "max_prevalence_rate":max_prevalence_rate, "category":category ,"keyword":keyword}

	return render(request, 'autism_prevalence_map/list.html', context_dict)

def about(request):
	"""
	  About page
	"""
	context_dict = {}
	return render(request, 'autism_prevalence_map/about.html', context_dict)


def studiesApi(request):
	#add in the items geojson requires 
	response = {}
	response['type'] = "FeatureCollection"
	response['features'] = []
	
	if request.method == 'GET':
		kwargs = {}
		# filters
		min_year_of_publication = request.GET.get("min_year_of_publication","")
		max_year_of_publication = request.GET.get("max_year_of_publication","")
		min_study_size = request.GET.get("min_study_size","")
		max_study_size = request.GET.get("max_study_size","")
		min_prevalence_rate = request.GET.get("min_prevalence_rate","")
		max_prevalence_rate = request.GET.get("max_prevalence_rate","")
		category = request.GET.get("category","")
		keyword = request.GET.get("keyword","")


		#apply filters
		if min_year_of_publication:
			try:
				min_year_of_publication_re = re.sub("[^0-9]", "", min_year_of_publication)
				kwargs['year_of_publication_number__gte'] = date(int(min_year_of_publication_re), 1, 1)
			except TypeError:
				response['status'] = "The minimum year of publication you entered was not a recognizable 4-digit year. Please try again."
				
		if max_year_of_publication:
			try:
				max_year_of_publication_re = re.sub("[^0-9]", "", max_year_of_publication)
				kwargs['year_of_publication_number__lte'] = date(int(max_year_of_publication_re), 1, 1)
			except TypeError:
				response['status'] = "The maximum year of publication you entered was not a recognizable 4-digit year. Please try again."

		if min_study_size:
			try:
				min_study_size_re = re.sub("[^0-9]", "", min_study_size)
				kwargs['study_size_number__gte'] = int(min_study_size_re)
			except ValueError:
				response['status'] = "The minimum study size you entered was not a recognizable number. Please try again."

		if max_study_size:
			try:
				max_study_size_re = re.sub("[^0-9]", "", max_study_size)
				kwargs['study_size_number__lte'] = int(max_study_size_re)
			except ValueError:
				response['status'] = "The maximum study size you entered was not a recognizable number. Please try again."
			

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
		
		if category:
			kwargs['category__iexact'] = category

		#pull data with lat/lngs only
		#kwargs['latitude__isnull'] = False
		#kwargs['longitude__isnull'] = False

		# add postgres keyword search
		if keyword:
			#search vectors
			vector = (
				SearchVector('year_of_publication') + 
				SearchVector('authors') +
				SearchVector('country') +
				SearchVector('area') +
				SearchVector('age') +
				SearchVector('number_affected') +
				SearchVector('diagnostic_criteria') +
				SearchVector('pct_with_normal_iq') +
				SearchVector('gender_ratio') +
				SearchVector('confidence_interval') +
				SearchVector('category') +
				SearchVector('reliability_quality') +
				SearchVector('methodology') +
				SearchVector('mean_income_of_participants') +
				SearchVector('education_level_of_participants') +
				SearchVector('citation') +
				SearchVector('url') +
				SearchVector('link_to_news_coverage_by_spectrum') +
				SearchVector('erics_quality_assessment') +
				SearchVector('erics_reasons_for_lower_quality')
			)


			pulled_studies = studies.objects.annotate(search=vector).filter(search=keyword).filter(**kwargs)
		else:
			pulled_studies = studies.objects.filter(**kwargs)


		for study in pulled_studies:
			data = {}
			data['type'] = 'Feature'
			data['properties'] = {}
			data['properties']['pk'] = study.pk
			data['properties']['year_of_publication'] = study.year_of_publication
			data['properties']['authors'] = study.authors
			data['properties']['country'] = study.country
			data['properties']['area'] = study.area
			data['properties']['study_size'] = study.study_size
			data['properties']['age'] = study.age
			data['properties']['number_affected'] = study.number_affected
			data['properties']['diagnostic_criteria'] = study.diagnostic_criteria
			data['properties']['pct_with_normal_iq'] = study.pct_with_normal_iq
			data['properties']['gender_ratio'] = study.gender_ratio
			data['properties']['prevalence_rate'] = study.prevalence_rate
			data['properties']['confidence_interval'] = study.confidence_interval
			data['properties']['category'] = study.category
			data['properties']['time_period_studied'] = study.time_period_studied
			data['properties']['reliability_quality'] = study.reliability_quality
			data['properties']['methodology'] = study.methodology
			data['properties']['mean_income_of_participants'] = study.mean_income_of_participants
			data['properties']['education_level_of_participants'] = study.education_level_of_participants
			data['properties']['citation'] = study.citation
			data['properties']['url'] = study.url
			data['properties']['link_to_news_coverage_by_spectrum'] = study.link_to_news_coverage_by_spectrum
			data['properties']['erics_quality_assessment'] = study.erics_quality_assessment
			data['properties']['erics_reasons_for_lower_quality'] = study.erics_reasons_for_lower_quality
			data['geometry'] = {}
			data['geometry']['type'] = 'Point'
			data['geometry']['coordinates'] = [study.longitude, study.latitude]
			response['features'].append(data)

		response['status'] = "OK"

	else:
		print request.method

	return JsonResponse(response)