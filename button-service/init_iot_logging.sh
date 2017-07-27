#!/bin/bash

# Configures AWS IOT to log to cloudwatch using a specific role.

set -x

ACCOUNT_ID=$(aws sts get-caller-identity --output text --query 'Account')
ROLE_NAME=$(aws iam list-roles | jq -r '[.Roles[] | select(.AssumeRolePolicyDocument.Statement[].Principal.Service == "iot.amazonaws.com") | .RoleName][0]')
aws iot set-logging-options --logging-options-payload roleArn="arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME",logLevel="DEBUG"
