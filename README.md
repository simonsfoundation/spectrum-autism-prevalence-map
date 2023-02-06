# spectrum-autism-prevalence-map

To set this up:

If you don’t have postgresql,
`brew install postgresql`

Create an empty db in postgres.
`createdb prevalence`

add GMAP_API_KEY(the actual value is in team's doc) to file .env like the following.
```
GMAP_API_KEY='ddN3i59_QccZTqB4cWGy'
```
Adapt your local DJANGO_STATIC_ROOT value accordingly in your .env file. The following is an example.

```
DJANGO_STATIC_ROOT='/Users/mkranz/Documents/Spectrum/PrevalenceMap/spectrum-autism-prevalence-map/spectrum/autism_prevalence_map/static'
```

Add your postgres db info into .env. The following is an example.

```

DB_HOST='localhost'

DB_NAME='prevalence'

DB_PASSWORD='prevalence'

DB_USER='mcho'
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

If you get a certificate error, then go to Applications/python and run 'Install Certificates.command'.

Run the server to see the app on http://127.0.0.1:8000/.
`python manage.py runserver`

Notes:

1. If you want to change the schema,

First change models.py and then run `python manage.py makemigrations` to automatically generate a migration file. After you confirm that your new migration file is in autism_prevalence_map/migrations, you can run `python manage.py migrate` to apply the changes to the database.

2. If you want to access the postgresql database,

Run `python manage.py dbshell`.

3. If you want to access the backend admin site on http://127.0.0.1:8000/submarine/ but without a user.

Run `python manage.py createsuperuser` to create a super user.

4. Removed hardcoded GMAP_API_KEY value from code and added it to file .env for security reason.

5. Currently we still haven't had scripts to import production data. After creating a super user locally, please access our google drive to get the csv file to import it at the backend admin. 
