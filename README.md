# spectrum-autism-prevalence-map

To set this up:
`python3 -m venv prevlance` to set up the virtual environment
`pip3 install Django` to install Django
`pip3 install -r requirements.txt` to install all the dependencies of the application
`source prevalence/bin/activate` to activate and enter the virtual environment
to fetch data from Google Sheets, go into the spectrum directory and run `python3 manage.py pull_studies_from_gsheets`
to start the server itself, from the same directory, run `python3 manage.py runserver`
to visit the local site, visit the IP address that the runserver command returns (include the port address)
