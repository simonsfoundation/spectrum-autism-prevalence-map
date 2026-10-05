#!/usr/bin/env bash
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
cat << EOF > appspec.yaml
version: 0.0
Resources:
  - TargetService:
      Type: AWS::ECS::Service
      Properties:
        TaskDefinition: "arn:aws:ecs:us-east-1:${AWS_ACCOUNT_ID}:task-definition/prevalencemap-${1}:${2}"
        LoadBalancerInfo:
          ContainerName: "prevalencemap-${1}"
          ContainerPort: 8000
        PlatformVersion: "LATEST"
EOF
