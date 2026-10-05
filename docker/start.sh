#!/bin/bash

cd /opt/app
python manage.py migrate
python manage.py collectstatic --noinput

uwsgi --http :8000 --wsgi-file spectrum/wsgi.py --master --processes 1 --threads 4 --static-map /static=/opt/app/static -b 32768
