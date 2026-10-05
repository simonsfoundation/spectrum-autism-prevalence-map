#!/usr/bin/env bash

. $(dirname "$0")/errorcheck.function

docker compose build
docker compose run -w /opt/app/autism_prevalence_map/static/autism_prevalence_map app npm install
errorcheck "${?}"
docker compose run -w /opt/app/autism_prevalence_map/static/autism_prevalence_map app npm run build
errorcheck "${?}"

exit 0
