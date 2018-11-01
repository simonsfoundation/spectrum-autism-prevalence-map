#!/bin/bash

exit_check() {
  if [[ ${1} != '0' ]]; then
    exit "${1}"
  fi
}

cd "${WORKSPACE}"
mkdir -p ".elasticbeanstalk"
cp "jenkins/config.yml" ".elasticbeanstalk/config.yml"

if [[ -n "${ACTION_BRANCH}" ]]; then
  git checkout "${ACTION_BRANCH}"
  git pull
fi

if $(grep -q \$ANSIBLE_VAULT jenkins/ssl.config) ; then 
  ansible-vault decrypt jenkins/ssl.config --vault-password-file=~/\ /ansible.vault ;
fi

if [[ -z "${OUTPUT_ENV}" ]]; then
  exit 1
fi

eb deploy "${OUTPUT_ENV}" --timeout 10

if ! $(grep -q \$ANSIBLE_VAULT jenkins/ssl.config) ; then 
  ansible-vault encrypt jenkins/ssl.config --vault-password-file=~/\ /ansible.vault ;
fi
