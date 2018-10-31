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
                yearpublished = re.sub("[^0-9]", "", data['gsx$yearpublished']['$t'])

                if yearpublished:
                    try:
                        yearpublished_number = datetime.datetime.strptime(yearpublished, '%Y')
                    except ValueError:
                        yearpublished_number = None
                else:
                    yearpublished_number = None

                if yearpublished_number:

                    #use get or create to only create records for objects newly added to the spreadsheets
                    updated_values = {
                        'yearpublished': data['gsx$yearpublished']['$t'],
                        'authors': data['gsx$authors']['$t'], 
                        'country': data['gsx$country']['$t'], 
                        'area': data['gsx$area']['$t'], 
                        'samplesize': data['gsx$samplesize']['$t'], 
                        'age': data['gsx$ageyears']['$t'], 
                        'individualswithautism': data['gsx$individualswithautism']['$t'], 
                        'diagnosticcriteria': data['gsx$diagnosticcriteria']['$t'], 
                        'percentwaverageiq': data['gsx$percentwaverageiq']['$t'], 
                        'sexratiomf': data['gsx$sexratiomf']['$t'], 
                        'prevalenceper10000': data['gsx$prevalenceper10000']['$t'], 
                        'confidenceinterval': data['gsx$confidenceinterval']['$t'], 
                        'categoryadpddorasd': data['gsx$categoryadpddorasd']['$t'],
                        'yearsstudied': data['gsx$yearsstudied']['$t'],
                        'recommended': data['gsx$recommended']['$t'], 
                        'studytype': data['gsx$studytype']['$t'],
                        'meanincomeofparticipants': data['gsx$meanincomeofparticipants']['$t'],
                        'educationlevelofparticipants': data['gsx$educationlevelofparticipants']['$t'],
                        'citation': data['gsx$citation']['$t'],
                        'link1title': data['gsx$link1title']['$t'],
                        'link1url': data['gsx$link1url']['$t'],
                        'link2title': data['gsx$link2title']['$t'],
                        'link2url': data['gsx$link2url']['$t'],
                        'link3title': data['gsx$link3title']['$t'],
                        'link3url': data['gsx$link3url']['$t'],
                        'link4title': data['gsx$link4title']['$t'],
                        'link4url': data['gsx$link4url']['$t'],
                        'sourceofdataforthisspreadsheet': data['gsx$sourceofdataforthisspreadsheet']['$t'], 
                        'ericsqualityassessment': data['gsx$ericsqualityassessment']['$t'], 
                        'ericsreasonsbasedonmyrecallofthestudies': data['gsx$ericsreasonsbasedonmyrecallofthestudies']['$t'],
                        'commentsfromotheradvisors': data['gsx$commentsfromotheradvisors']['$t']

                    }
                    
                    obj, created = studies.objects.update_or_create(gsheet_id=data['id']['$t'], defaults=updated_values)

            
            except Exception as e: 
                # if error
                print e

    def geocode(self):
        gmaps_api_key = '&key=' + 'AIzaSyACddN3i59_QccZTqB4cWGyK6ZDFCLCVBE'
        base_url = 'https://maps.googleapis.com/maps/api/geocode/json'

        # try to geocode only where country and area are not null, and where lat and lon are null
        kwargs = {}
        kwargs['country__isnull'] = False
        kwargs['area__isnull'] = False

        pulled_studies = studies.objects.filter(**kwargs)

        for study in pulled_studies:
            # call the geocode URL
            # TODO we need a more elegant solution, but, for now, we will hide these two areas
            if study.area in ('Mainland and Azores', 'Northern Ostrobothnia County') :
                study.area = ''
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

            #calculate the span of years of study
            if yearsstudied_min and yearsstudied_max:
                try:
                    num_yearsstudied = int(yearsstudied_max) - int(yearsstudied_min)
                except ValueError:
                    num_yearsstudied = None
            else:
                num_yearsstudied = None


            studies.objects.filter(gsheet_id=study.gsheet_id).update(yearpublished_number=yearpublished_number, samplesize_number=samplesize_number, prevalenceper10000_number=prevalenceper10000_number, yearsstudied_number_min=yearsstudied_number_min, yearsstudied_number_max=yearsstudied_number_max, num_yearsstudied=num_yearsstudied)




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


        




