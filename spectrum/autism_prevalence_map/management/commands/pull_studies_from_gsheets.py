import sys, os, urllib.request, json, time, datetime, re
from django.core.management.base import BaseCommand, CommandError
from autism_prevalence_map.models import *


"""
  Loads research studies data from google spreadsheets API
"""
class Command(BaseCommand):

    def load_research_data(self):
        # Old (v3) style of fetching data from Gsheets
        # https://spreadsheets.google.com/feeds/list/1l8Ih7BGIo9AyPRwX7Vb2jPLZkRMo0d7QA7SboM9-JNk/4/public/values?alt=json
        key = '1l8Ih7BGIo9AyPRwX7Vb2jPLZkRMo0d7QA7SboM9-JNk'
        # base_url = 'https://spreadsheets.google.com/feeds/list/'
        # params = '/4/public/values?alt=json'
        base_url = 'https://docs.google.com/spreadsheets/d/'
        # production sheet
        params = '/gviz/tq?tqx=out:json&gid=536000761'
        # params = '/gviz/tq?tqx=out:json'
        url = base_url + key + params

        print('response')
        response = urllib.request.urlopen(url)
        read_response = response.read()
        trimmed_response = re.sub(r'(?<!\\)\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})', r'', read_response[47:-2].decode("utf-8"))
        source = json.loads(trimmed_response)
        print(source['table']['cols'])

        for index, data in enumerate(source['table']['rows']):
            # print(data['c'])
            try:
                #skip if year not a date
                # print(data['c'][0]['f'] + ', ' + data['c'][1]['v'])
                yearpublished = data['c'][0]['f']

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
                        'yearpublished': data['c'][0]['f'] if data['c'][0] is not None else '',
                        'authors': data['c'][1]['v'] if data['c'][1] is not None else '', 
                        'country': data['c'][2]['v'] if data['c'][2] is not None else '', 
                        'area': data['c'][3]['v'] if data['c'][3] is not None else '', 
                        'samplesize': data['c'][4]['v'] if data['c'][4] is not None else '', 
                        'age': data['c'][5]['v'] if data['c'][5] is not None else '', 
                        'individualswithautism': data['c'][6]['v'] if data['c'][6] is not None else '', 
                        'diagnosticcriteria': data['c'][7]['v'] if data['c'][7] is not None else '', 
                        'percentwaverageiq': data['c'][8]['v'] if data['c'][8] is not None else '', 
                        'sexratiomf': data['c'][9]['v'] if data['c'][9] is not None else '', 
                        'prevalenceper10000': data['c'][10]['v'] if data['c'][10] is not None else '', 
                        'confidenceinterval': data['c'][11]['v'] if data['c'][11] is not None else '', 
                        'categoryadpddorasd': data['c'][12]['v'] if data['c'][12] is not None else '',
                        'yearsstudied': data['c'][13]['v'] if data['c'][13] is not None else '',
                        'recommended': data['c'][14]['v'] if data['c'][14] is not None else '', 
                        'studytype': data['c'][15]['v'] if data['c'][15] is not None else '',
                        'meanincomeofparticipants': data['c'][16]['v'] if data['c'][16] is not None else '',
                        'educationlevelofparticipants': data['c'][17]['v'] if data['c'][17] is not None else '',
                        'citation': data['c'][18]['v'] if data['c'][18] is not None else '',
                        'link1title': data['c'][19]['v'] if data['c'][19] is not None else '',
                        'link1url': data['c'][20]['v'] if data['c'][20] is not None else '',
                        'link2title': data['c'][21]['v'] if data['c'][21] is not None else '',
                        'link2url': data['c'][22]['v'] if data['c'][22] is not None else '',
                        'link3title': data['c'][23]['v'] if data['c'][23] is not None else '',
                        'link3url': data['c'][24]['v'] if data['c'][24] is not None else '',
                        'link4title': data['c'][25]['v'] if data['c'][25] is not None else '',
                        'link4url': data['c'][26]['v'] if data['c'][26] is not None else '',
                        'sourceofdataforthisspreadsheet': data['c'][27]['v'] if data['c'][27] is not None else '', 
                        'ericsqualityassessment': data['c'][28]['v'] if data['c'][28] is not None else '', 
                        'ericsreasonsbasedonmyrecallofthestudies': data['c'][29]['v'] if data['c'][29] is not None else '',
                        'commentsfromotheradvisors': data['c'][30]['v'] if data['c'][30] is not None else ''

                    }
                    obj, created = studies.objects.update_or_create(gsheet_id=index, defaults=updated_values)


            except Exception as e:
                # if error
                print(index)
                print('load research data error')
                print(e)

    def geocode(self):
        gmaps_api_key = '&key=AIzaSyACddN3i59_QccZTqB4cWGyK6ZDFCLCVBE'
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
            address = '?address=' + urllib.parse.quote(study.area) + ',' + urllib.parse.quote(study.country)
            url = base_url + address + gmaps_api_key
            response = urllib.request.urlopen(url)
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



            studies.objects.filter(gsheet_id=study.gsheet_id).update(yearpublished_number=yearpublished_number, samplesize_number=samplesize_number, prevalenceper10000_number=prevalenceper10000_number, yearsstudied_number_min=yearsstudied_number_min, yearsstudied_number_max=yearsstudied_number_max, num_yearsstudied=num_yearsstudied)




    def handle(self, *args, **options):
        print("Loading Academic Research Data....")
        self.load_research_data()
        print("Done.")
        print("Parse strings to numbers...")
        self.parse_data()
        print("Done.")
        print("Geocode research papers where lat/lon is null...")
        self.geocode()
        print("Done.")
