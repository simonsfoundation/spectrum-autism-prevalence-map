import sys, os, urllib, json, time, datetime, re
from django.core.management.base import BaseCommand, CommandError
from autism_prevalence_map.models import *


"""
  Loads research studies data from google spreadsheets API
"""
class Command(BaseCommand):

    def load_research_data(self):
        key = '1_cvjG5FD9ZsErdguV5se3IMqi3AxcSKl_JBB1JRyOMo'
        base_url = 'https://spreadsheets.google.com/feeds/list/'
        params = '/1/public/values?alt=json'
        url = base_url + key + params
        response = urllib.urlopen(url.encode('utf8'))
        data = json.loads(response.read())

        for data in data['feed']['entry']:
            try:
                #skip if header
                if data['gsx$year']['$t'] != 'Year':

                    #use get or create to only create records for objects newly added to the spreadsheets
                    updated_values = {
                        'year': data['gsx$year']['$t'], 
                        'authors': data['gsx$authors']['$t'], 
                        'country': data['gsx$country']['$t'], 
                        'area': data['gsx$area']['$t'], 
                        'population': data['gsx$population']['$t'], 
                        'age': data['gsx$age']['$t'], 
                        'number_affected': data['gsx$numberaffected']['$t'], 
                        'diagnostic_criteria': data['gsx$diagnosticcriteria']['$t'], 
                        'pct_with_normal_iq': data['gsx$withnormaliq']['$t'], 
                        'gender_ratio': data['gsx$genderratiomf']['$t'], 
                        'prevalence_rate': data['gsx$prevalencerate10000']['$t'], 
                        'confidence_interval': data['gsx$ci']['$t'] 
                    }
                    
                    obj, created = studies.objects.update_or_create(gsheet_id=data['id']['$t'], defaults=updated_values)


            except Exception: 
                # if error
                print data['feed']['entry']

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
            year = re.sub("[^0-9]", "", study.year)
            if year:
                try:
                    year_number = datetime.datetime.strptime(year, '%Y')
                except ValueError:
                    year_number = None
            else:
                year_number = None

            # ensure population string has no non-number characters, convert to integer
            population = re.sub("[^0-9]", "", study.population)

            if population:
                try:
                    population_number = int(population)
                except ValueError:
                    population_number = None
            else:
                population_number = None 

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



            studies.objects.filter(gsheet_id=study.gsheet_id).update(year_number=year_number, population_number=population_number, prevalence_rate_number=prevalence_rate_number)




    def handle(self, *args, **options):
        print "Loading Academic Research Data...."
        self.load_research_data()
        print "Done."
        print "Geocode research papers where lat/lon is null..."
        self.geocode()
        print "Done."
        print "Parse strings to numbers..."
        self.parse_data()
        print "Done."

        




