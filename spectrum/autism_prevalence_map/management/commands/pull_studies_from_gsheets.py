import sys, os, urllib, json, time, datetime, re
from django.core.management.base import BaseCommand, CommandError
from autism_prevalence_map.models import *


"""
  Loads research studies data from google spreadsheets API
"""
class Command(BaseCommand):

    def load_research_data(self):
        # https://spreadsheets.google.com/feeds/list/1l8Ih7BGIo9AyPRwX7Vb2jPLZkRMo0d7QA7SboM9-JNk/4/public/values?alt=json
        key = '1l8Ih7BGIo9AyPRwX7Vb2jPLZkRMo0d7QA7SboM9-JNk'
        base_url = 'https://spreadsheets.google.com/feeds/list/'
        params = '/4/public/values?alt=json'
        url = base_url + key + params
        response = urllib.urlopen(url.encode('utf8'))
        data = json.loads(response.read())

        for data in data['feed']['entry']:
            try:
                #skip if year not a date
                year_of_publication = re.sub("[^0-9]", "", data['gsx$yearofpublication']['$t'])

                if year_of_publication:
                    try:
                        year_of_publication_number = datetime.datetime.strptime(year_of_publication, '%Y')
                    except ValueError:
                        year_of_publication_number = None
                else:
                    year_of_publication_number = None

                if year_of_publication_number:

                    #use get or create to only create records for objects newly added to the spreadsheets
                    updated_values = {
                        'year_of_publication': data['gsx$yearofpublication']['$t'],
                        'authors': data['gsx$authors']['$t'], 
                        'country': data['gsx$country']['$t'], 
                        'area': data['gsx$area']['$t'], 
                        'study_size': data['gsx$studysize']['$t'], 
                        'age': data['gsx$age']['$t'], 
                        'number_affected': data['gsx$numberaffected']['$t'], 
                        'diagnostic_criteria': data['gsx$diagnosticcriteria']['$t'], 
                        'pct_with_normal_iq': data['gsx$withnormaliq']['$t'], 
                        'gender_ratio': data['gsx$genderratiomf']['$t'], 
                        'prevalence_rate': data['gsx$prevalenceper10000']['$t'], 
                        'confidence_interval': data['gsx$ci']['$t'], 
                        'category': data['gsx$categoryasdoradorpdd']['$t'],
                        'time_period_studied': data['gsx$timeperiodstudied']['$t'],
                        'reliability_quality': data['gsx$reliabilityquality']['$t'], 
                        'methodology': data['gsx$methodologycdcsurveillancedataregistryclinicalsurveyorpopulationsurvey']['$t'],
                        'mean_income_of_participants': data['gsx$meanincomeofparticipants']['$t'],
                        'education_level_of_participants': data['gsx$educationlevelofparticipants']['$t'],
                        'citation': data['gsx$citation']['$t'],
                        'url': data['gsx$url']['$t'],
                        'link_to_news_coverage_by_spectrum': data['gsx$linktonewscoveragebyspectrum']['$t'], 
                        'erics_quality_assessment': data['gsx$ericsqualityassessment']['$t'], 
                        'erics_reasons_for_lower_quality': data['gsx$ericsreasonsforlowerqualitybasedonmyrecallofthestudies']['$t']
                    }
                    
                    obj, created = studies.objects.update_or_create(gsheet_id=data['id']['$t'], defaults=updated_values)

            
            except Exception as e: 
                # if error
                print e

    def geocode(self):
        gmaps_api_key = '&key=' + 'AIzaSyDf-cF98Txqwy7t1Bks58-iFBFS6xkNgf0'
        base_url = 'https://maps.googleapis.com/maps/api/geocode/json'

        # try to geocode only where country and area are not null, and where lat and lon are null
        kwargs = {}
        kwargs['country__isnull'] = False
        kwargs['area__isnull'] = False
        kwargs['latitude__isnull'] = True
        kwargs['longitude__isnull'] = True

        pulled_studies = studies.objects.filter(**kwargs)

        for study in pulled_studies:
            # call the geocode URL
            address = '?address=' + study.area + ', ' + study.country
            url = base_url + address + gmaps_api_key
            response = urllib.urlopen(url.encode('utf8'))
            data = json.loads(response.read())

            if data['status'] == "OK":
                latitude = float(data['results'][0]['geometry']['location']['lat'])
                longitude = float(data['results'][0]['geometry']['location']['lng'])             
            else:
                latitude = None
                longitude = None

            
            studies.objects.filter(gsheet_id=study.gsheet_id).update(latitude=latitude, longitude=longitude)

            time.sleep(1)
            
    def parse_data(self):
        # for year, population, and prevalence rate, convert from strings to dates and numbers and store in DB

        pulled_studies = studies.objects.all()

        for study in pulled_studies:
            # ensure year string has no non-number characters, convert to date
            year_of_publication = re.sub("[^0-9]", "", study.year_of_publication)
            if year_of_publication:
                try:
                    year_of_publication_number = datetime.datetime.strptime(year_of_publication, '%Y')
                except ValueError:
                    year_of_publication_number = None
            else:
                year_of_publication_number = None

            # ensure population string has no non-number characters, convert to integer
            study_size = re.sub("[^0-9]", "", study.study_size)

            if study_size:
                try:
                    study_size_number = int(study_size)
                except ValueError:
                    study_size_number = None
            else:
                study_size_number = None 

            # ensure prevalence rate string has no non-number characters, convert to float            
            try:
                prevalence_rate = re.findall(r"[-+]?\d*\.\d+|\d+", study.prevalence_rate)[0]
            except IndexError:
                prevalence_rate = None

            if prevalence_rate:
                try:
                    prevalence_rate_number = float(prevalence_rate)
                except ValueError:
                    prevalence_rate_number = None
            else:
                prevalence_rate_number = None 



            studies.objects.filter(gsheet_id=study.gsheet_id).update(year_of_publication_number=year_of_publication_number, study_size_number=study_size_number, prevalence_rate_number=prevalence_rate_number)




    def handle(self, *args, **options):
        print "Loading Academic Research Data...."
        self.load_research_data()
        print "Done."
        print "Parse strings to numbers..."
        self.parse_data()
        print "Done."
        print "Geocode research papers where lat/lon is null..."
        self.geocode()
        print "Done."


        




