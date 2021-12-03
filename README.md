# spectrum-autism-prevalence-map

To set this up:

If you don’t have postgresql,
`brew install postgresql`

Create an empty db in postgres and add your postgres db info into .env. The following is an example.

```
DB_HOST='localhost'

DB_NAME='prevalence'

DB_PASSWORD='prevalence'

DB_USER='mcho'
```

Create a python virtual env:
`python3 -m venv prevalence`

Activate the virutal environment
`source prevalence/bin/activate`

Now you are in the virtualenv with python3, so you don’t need to use python3 or pip3 any more. You can just use python and pip.

Inside the virtual env, install the requirements, including Django. There is no need to install Django separately.
`pip install -r requirements.txt`

Change directory
`cd spectrum`

Get the schema for your empty database from earlier
`python manage.py migrate`

Clear all the data in your current tables and pull data from google sheets
`python manage.py pull_studies_from_gsheets`

Run the server to see the app on http://127.0.0.1:8000/
`python manage.py runserver`
