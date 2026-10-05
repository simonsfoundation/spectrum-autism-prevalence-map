#!/bin/bash

if [[ -z "${1}" ]]; then
	exit 1
fi
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_ENV="${1}"

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com
docker tag prevalencemap:latest ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/prevalencemap-${AWS_ENV}:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/prevalencemap-${AWS_ENV}:latest

