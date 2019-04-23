# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from datetime import date
import re, csv
from django.contrib.postgres.search import SearchVector, SearchQuery

#import all apartment models and forms
from autism_prevalence_map.models import *

# Create your views here.
def index(request):
	"""
	  Index page/Main Map
	"""
	if request.method == 'GET':
		min_yearpublished = request.GET.get("min_yearpublished","")
		max_yearpublished = request.GET.get("max_yearpublished","")
		yearsstudied_number_min = request.GET.get("yearsstudied_number_min","")
		yearsstudied_number_max = request.GET.get("yearsstudied_number_max","")
		min_samplesize = request.GET.get("min_samplesize","")
		max_samplesize = request.GET.get("max_samplesize","")
		min_prevalenceper10000 = request.GET.get("min_prevalenceper10000","")
		max_prevalenceper10000 = request.GET.get("max_prevalenceper10000","")
		studytype = request.GET.get("studytype","")
		keyword = request.GET.get("keyword","")
		timeline_type = request.GET.get("timeline_type","published")
		meanincome = request.GET.get("meanincome","")
		education = request.GET.get("education","")

	context_dict = {"min_yearpublished":min_yearpublished, "max_yearpublished":max_yearpublished, "yearsstudied_number_min":yearsstudied_number_min, "yearsstudied_number_max":yearsstudied_number_max, "min_samplesize":min_samplesize, "max_samplesize":max_samplesize, "min_prevalenceper10000":min_prevalenceper10000, "max_prevalenceper10000":max_prevalenceper10000, "studytype":studytype , "keyword":keyword, "timeline_type":timeline_type, "meanincome":meanincome, "education":education}
	return render(request, 'autism_prevalence_map/map.html', context_dict)


def list_view(request):
	"""
	  List of studies page
	"""
	if request.method == 'GET':
		min_yearpublished = request.GET.get("min_yearpublished","")
		max_yearpublished = request.GET.get("max_yearpublished","")
		yearsstudied_number_min = request.GET.get("yearsstudied_number_min","")
		yearsstudied_number_max = request.GET.get("yearsstudied_number_max","")
		min_samplesize = request.GET.get("min_samplesize","")
		max_samplesize = request.GET.get("max_samplesize","")
		min_prevalenceper10000 = request.GET.get("min_prevalenceper10000","")
		max_prevalenceper10000 = request.GET.get("max_prevalenceper10000","")
		studytype = request.GET.get("studytype","")
		keyword = request.GET.get("keyword","")
		timeline_type = request.GET.get("timeline_type","published")
		meanincome = request.GET.get("meanincome","")
		education = request.GET.get("education","")

	context_dict = {"min_yearpublished":min_yearpublished, "max_yearpublished":max_yearpublished,"yearsstudied_number_min":yearsstudied_number_min, "yearsstudied_number_max":yearsstudied_number_max, "min_samplesize":min_samplesize, "max_samplesize":max_samplesize, "min_prevalenceper10000":min_prevalenceper10000, "max_prevalenceper10000":max_prevalenceper10000, "studytype":studytype ,"keyword":keyword, "timeline_type":timeline_type, "meanincome":meanincome, "education":education}

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
		min_yearpublished = request.GET.get("min_yearpublished","")
		max_yearpublished = request.GET.get("max_yearpublished","")
		yearsstudied_number_min = request.GET.get("yearsstudied_number_min","")
		yearsstudied_number_max = request.GET.get("yearsstudied_number_max","")
		min_samplesize = request.GET.get("min_samplesize","")
		max_samplesize = request.GET.get("max_samplesize","")
		min_prevalenceper10000 = request.GET.get("min_prevalenceper10000","")
		max_prevalenceper10000 = request.GET.get("max_prevalenceper10000","")
		studytype = request.GET.get("studytype","")
		keyword = request.GET.get("keyword","")
		timeline_type = request.GET.get("timeline_type","published")
		meanincome = request.GET.get("meanincome","")
		education = request.GET.get("education","")


		#apply filters
		if min_yearpublished:
			try:
				min_yearpublished_re = re.sub("[^0-9]", "", min_yearpublished)
				kwargs['yearpublished_number__gte'] = date(int(min_yearpublished_re), 1, 1)
			except TypeError:
				response['status'] = "The minimum year of publication you entered was not a recognizable 4-digit year. Please try again."

		if max_yearpublished:
			try:
				max_yearpublished_re = re.sub("[^0-9]", "", max_yearpublished)
				kwargs['yearpublished_number__lte'] = date(int(max_yearpublished_re), 1, 1)
			except TypeError:
				response['status'] = "The maximum year of publication you entered was not a recognizable 4-digit year. Please try again."

		if yearsstudied_number_min:
			kwargs['yearsstudied__isnull'] = False
			try:
				yearsstudied_number_min_re = re.sub("[^0-9]", "", yearsstudied_number_min)
				kwargs['yearsstudied_number_min__gte'] = date(int(yearsstudied_number_min_re), 1, 1)
			except TypeError:
				response['status'] = "The minimum year studied you entered was not a recognizable 4-digit year. Please try again."

		if yearsstudied_number_max:
			try:
				yearsstudied_number_max_re = re.sub("[^0-9]", "", yearsstudied_number_max)
				kwargs['yearsstudied_number_max__lte'] = date(int(yearsstudied_number_max_re), 1, 2)
			except TypeError:
				response['status'] = "The maximum year studied you entered was not a recognizable 4-digit year. Please try again."


		if min_samplesize:
			try:
				min_samplesize_re = re.sub("[^0-9]", "", min_samplesize)
				kwargs['samplesize_number__gte'] = int(min_samplesize_re)
			except ValueError:
				response['status'] = "The minimum study size you entered was not a recognizable number. Please try again."

		if max_samplesize:
			try:
				max_samplesize_re = re.sub("[^0-9]", "", max_samplesize)
				kwargs['samplesize_number__lte'] = int(max_samplesize_re)
			except ValueError:
				response['status'] = "The maximum study size you entered was not a recognizable number. Please try again."

		if min_prevalenceper10000:
			try:
				min_prevalenceper10000_re = re.findall(r"[-+]?\d*\.\d+|\d+", min_prevalenceper10000)[0]
				kwargs['prevalenceper10000_number__gte'] = float(min_prevalenceper10000_re)
			except ValueError:
				response['status'] = "The minimum prevalence rate you entered was not a recognizable number. Please try again."

		if max_prevalenceper10000:
			try:
				max_prevalenceper10000_re = re.findall(r"[-+]?\d*\.\d+|\d+", max_prevalenceper10000)[0]
				kwargs['prevalenceper10000_number__lte'] = float(max_prevalenceper10000_re)
			except ValueError:
				response['status'] = "The maximum prevalence rate you entered was not a recognizable number. Please try again."

		if meanincome:
			kwargs['meanincomeofparticipants'] = meanincome
		if education:
			kwargs['educationlevelofparticipants'] = education
		if studytype:
			kwargs['studytype__icontains'] = studytype

		if timeline_type == "studied":
			kwargs['yearsstudied_number_min__isnull'] = False

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
				SearchVector('link4url') +
				SearchVector('sourceofdataforthisspreadsheet') +
				SearchVector('ericsqualityassessment') +
				SearchVector('ericsreasonsbasedonmyrecallofthestudies') +
				SearchVector('commentsfromotheradvisors')
			)


			pulled_studies = studies.objects.annotate(search=vector).filter(search=keyword).filter(**kwargs)
		else:
			pulled_studies = studies.objects.filter(**kwargs)


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
			data['properties']['sourceofdataforthisspreadsheet'] = study.sourceofdataforthisspreadsheet
			data['properties']['ericsqualityassessment'] = study.ericsqualityassessment
			data['properties']['ericsreasonsbasedonmyrecallofthestudies	'] = study.ericsreasonsbasedonmyrecallofthestudies	
			data['properties']['commentsfromotheradvisors'] = study.commentsfromotheradvisors
			data['geometry'] = {}
			data['geometry']['type'] = 'Point'
			data['geometry']['coordinates'] = [study.longitude, study.latitude]
			response['features'].append(data)

		response['status'] = "OK"

	else:
		print request.method

	return JsonResponse(response)


def studiesCsv(request):
	#create header for CSV file download
	response = HttpResponse(content_type='text/csv')
	response['Content-Disposition'] = 'attachment; filename="spectrum_autism_prevalence_map_data_download.csv"'

	if request.method == 'GET':
		kwargs = {}
		# filters
		min_yearpublished = request.GET.get("min_yearpublished","")
		max_yearpublished = request.GET.get("max_yearpublished","")
		yearsstudied_number_min = request.GET.get("yearsstudied_number_min","")
		yearsstudied_number_max = request.GET.get("yearsstudied_number_max","")
		min_samplesize = request.GET.get("min_samplesize","")
		max_samplesize = request.GET.get("max_samplesize","")
		min_prevalenceper10000 = request.GET.get("min_prevalenceper10000","")
		max_prevalenceper10000 = request.GET.get("max_prevalenceper10000","")
		studytype = request.GET.get("studytype","")
		keyword = request.GET.get("keyword","")
		timeline_type = request.GET.get("timeline_type","published")
		meanincome = request.GET.get("meanincome","")
		education = request.GET.get("education","")


		#apply filters
		if min_yearpublished:
			try:
				min_yearpublished_re = re.sub("[^0-9]", "", min_yearpublished)
				kwargs['yearpublished_number__gte'] = date(int(min_yearpublished_re), 1, 1)
			except TypeError:
				response['status'] = "The minimum year of publication you entered was not a recognizable 4-digit year. Please try again."

		if max_yearpublished:
			try:
				max_yearpublished_re = re.sub("[^0-9]", "", max_yearpublished)
				kwargs['yearpublished_number__lte'] = date(int(max_yearpublished_re), 1, 1)
			except TypeError:
				response['status'] = "The maximum year of publication you entered was not a recognizable 4-digit year. Please try again."

		if yearsstudied_number_min:
			try:
				yearsstudied_number_min_re = re.sub("[^0-9]", "", yearsstudied_number_min)
				kwargs['yearsstudied_number_min__gte'] = date(int(yearsstudied_number_min_re), 1, 1)
			except TypeError:
				response['status'] = "The minimum year studied you entered was not a recognizable 4-digit year. Please try again."

		if yearsstudied_number_max:
			try:
				yearsstudied_number_max_re = re.sub("[^0-9]", "", yearsstudied_number_max)
				kwargs['yearsstudied_number_max__lte'] = date(int(yearsstudied_number_max_re), 1, 1)
			except TypeError:
				response['status'] = "The maximum year studied you entered was not a recognizable 4-digit year. Please try again."

		if min_samplesize:
			try:
				min_samplesize_re = re.sub("[^0-9]", "", min_samplesize)
				kwargs['samplesize_number__gte'] = int(min_samplesize_re)
			except ValueError:
				response['status'] = "The minimum study size you entered was not a recognizable number. Please try again."

		if max_samplesize:
			try:
				max_samplesize_re = re.sub("[^0-9]", "", max_samplesize)
				kwargs['samplesize_number__lte'] = int(max_samplesize_re)
			except ValueError:
				response['status'] = "The maximum study size you entered was not a recognizable number. Please try again."


		if min_prevalenceper10000:
			try:
				min_prevalenceper10000_re = re.findall(r"[-+]?\d*\.\d+|\d+", min_prevalenceper10000)[0]
				kwargs['prevalenceper10000_number__gte'] = float(min_prevalenceper10000_re)
			except ValueError:
				response['status'] = "The minimum prevalence rate you entered was not a recognizable number. Please try again."

		if max_prevalenceper10000:
			try:
				max_prevalenceper10000_re = re.findall(r"[-+]?\d*\.\d+|\d+", max_prevalenceper10000)[0]
				kwargs['prevalenceper10000_number__lte'] = float(max_prevalenceper10000_re)
			except ValueError:
				response['status'] = "The maximum prevalence rate you entered was not a recognizable number. Please try again."

		if meanincome:
			kwargs['meanincomeofparticipants'] = meanincome
		if education:
			kwargs['educationlevelofparticipants'] = education
		if studytype:
			kwargs['studytype__icontains'] = studytype

		if timeline_type == "studied":
			kwargs['yearsstudied_number_min__isnull'] = False

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
				SearchVector('link4url') +
				SearchVector('sourceofdataforthisspreadsheet') +
				SearchVector('ericsqualityassessment') +
				SearchVector('ericsreasonsbasedonmyrecallofthestudies') +
				SearchVector('commentsfromotheradvisors')
			)


			pulled_studies = studies.objects.annotate(search=vector).filter(search=keyword).filter(**kwargs)
		else:
			pulled_studies = studies.objects.filter(**kwargs)


		writer = csv.writer(response)

		# CSV header
		writer.writerow(['Year published', 'Authors', 'Country', 'Area', 'Sample size', 'Age (years)', 'Individuals with autism', 'Diagnostic criteria', 'Percent w/ average IQ', 'Sex ratio (M:F)', 'Prevalence (per 10,000)', '95% Confidence interval', 'Category (AD, PDD or ASD)', 'Year(s) studied', 'Recommended', 'Study type', 'Mean income of participants', 'Education level of participants', 'Citation', 'Link 1 Title', 'Link 1 URL', 'Link 2 Title', 'Link 2 URL', 'Link 3 Title', 'Link 3 URL', 'Link 4 Title', 'Link 4 URL'])


		for study in pulled_studies:
			writer.writerow([study.yearpublished.encode('utf8'), study.authors.encode('utf8'), study.country.encode('utf8'), study.area.encode('utf8'), study.samplesize.encode('utf8'), study.age.encode('utf8'), study.individualswithautism.encode('utf8'), study.diagnosticcriteria.encode('utf8'), study.percentwaverageiq.encode('utf8'), study.sexratiomf.encode('utf8'), study.prevalenceper10000.encode('utf8'), study.confidenceinterval.encode('utf8'), study.categoryadpddorasd.encode('utf8'), study.yearsstudied.encode('utf8'), study.recommended.encode('utf8'), study.studytype.encode('utf8'), study.meanincomeofparticipants.encode('utf8'), study.educationlevelofparticipants.encode('utf8'), study.citation.encode('utf8'), study.link1title.encode('utf8'),  study.link1url.encode('utf8'), study.link2title.encode('utf8'),  study.link2url.encode('utf8'), study.link3title.encode('utf8'),  study.link3url.encode('utf8'), study.link4title.encode('utf8'),  study.link4url.encode('utf8')])

		response['status'] = "OK"

	else:
		print request.method

	return response	