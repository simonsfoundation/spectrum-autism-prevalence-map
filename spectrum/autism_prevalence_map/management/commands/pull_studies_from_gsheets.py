import sys,os
from django.core.management.base import BaseCommand, CommandError
from autism_prevalence_map.models import *
import urllib, json
import time


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
            


    def handle(self, *args, **options):
        print "Loading Academic Research Data...."
        self.load_research_data()
        print "Done."
        print "Geocode research papers where lat/lon is null..."
        self.geocode()
        print "Done."
        




