#!/bin/bash

exit_check() {
  if [[ ${1} != '0' ]]; then
    exit "${1}"
  fi
}

echo "Creating elasticbeanstalk config.yml ..."
cd "${WORKSPACE}" && mkdir -p ".elasticbeanstalk"
cat << EOF > .elasticbeanstalk/config.yml
branch-defaults:
  main:
    environment: prevalencemap-prod
  develop:
    environment: prevalencemap-staging
  testing:
    environment: prevalencemap-staging
environment-defaults:
  prevalencemap-staging:
    branch: null
    repository: null
  prevalencemap-prod:
    branch: null
    repository: null
global:
  application_name: spectrumnews.org
  default_ec2_keyname: null
  default_platform: Python 3.8 running on 64bit Amazon Linux 2
  default_region: us-east-1
  include_git_submodules: true
  instance_profile: null
  platform_name: null
  platform_version: null
  profile: null
  sc: git
  workspace_type: Application
EOF

echo "Git checkout $ACTION_BRANCH ..."
if [[ -n "${ACTION_BRANCH}" ]]; then
  git checkout "${ACTION_BRANCH}"
  git pull
fi

if [[ -z "${OUTPUT_ENV}" ]]; then
  exit 1
fi

# Build CSS
cd "spectrum/autism_prevalence_map/static/autism_prevalence_map/"
npm install
npm run build
cd "${OLDPWD}"

echo "Starting deploy to $OUTPUT_ENV ..."
eb deploy "${OUTPUT_ENV}" --timeout 30
exit_check "${?}"

echo "Removing private ssl certificate key."
rm -f .ebextensions/ssl.config

echo "Complete. "
