#!/bin/bash

cd /opt/app
python manage.py migrate

uwsgi --http :8000 --wsgi-file spectrum/wsgi.py --master --processes 1 --threads 4 --static-map /static=/opt/app/autism_prevalence_map/static -b 32768
