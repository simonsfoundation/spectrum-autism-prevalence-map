# spectrum-autism-prevalence-map

To set this up:

If you don’t have postgresql,
`brew install postgresql`

Create an empty db in postgres.
`createdb prevalence`

Add your postgres db info into .env. The following is an example.

```
DB_HOST='localhost'

DB_NAME='prevalence'

DB_PASSWORD='prevalence'

DB_USER='mcho'

DJANGO_DEBUG=True
DJANGO_SECRET_KEY='uopxp*9s18aul82xmg_y6zc+bf%ovr4h*oulcx4p45z#elt)k8'
DJANGO_STATIC_URL='/static/'
DJANGO_STATIC_ROOT='/Users/skhaled/Desktop/Simons_dev/prevalence/spectrum-autism-prevalence-map/spectrum/autism_prevalence_map/static'
DJANGO_ALLOWED_HOSTS='127.0.0.1'
```

Create a python virtual env:
`python3 -m venv prevalence`

Activate the virutal environment.
`source prevalence/bin/activate`

Now you should see `(prevalence)` in front of your name in the terminal, which means that you are in the virtualenv. Your virtualenv already points to `python3` or `pip3` if you use `python` or `pip` commands in the terminal, so you don’t need to use `python3` or `pip3` from here on.

Inside the virtual env, install the requirements, including Django. There is no need to install Django separately.
`pip install -r requirements.txt`

Change directory.
`cd spectrum`

Get the schema for your empty database from earlier. The schema files are in autism_prevalence_map/migrations. 
`python manage.py migrate`

Clear all the data in your current tables and pull data from google sheets.
`python manage.py pull_studies_from_gsheets`

if you get a certificate error, then go to Applications/python and run 'Install Certificates.command'. 

Run the server to see the app on http://127.0.0.1:8000/.
`python manage.py runserver`

Notes:

1. If you want to change the schema,

First change models.py and then run `python manage.py makemigrations` to automatically generate a migration file. After you confirm that your new migration file is in autism_prevalence_map/migrations, you can run `python manage.py migrate` to apply the changes to the database.

2. If you want to access the postgresql database,

Run `python manage.py dbshell`.
