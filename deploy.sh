#!/bin/bash

set -x
set -e

cd "$(dirname ${BASH_SOURCE[0]})"

cacert/gen_ca_cert.sh
cacert/register_ca_certificate.sh
cacert/gen_device_cert.sh
cd button-service
npm install
sls deploy
./init_iot_logging.sh
./setup_app_env.sh
cd ../app
npm install
npm run build
APP_BUCKET=$(aws s3api list-buckets | jq -r '.Buckets[] | select(.Name | contains("apphostingbucket")) | .Name')
aws s3 sync build s3://$APP_BUCKET

cat << MARKER

****************************************************************
App available at $(aws cloudformation describe-stacks --stack-name button-service-dev | jq -r '.Stacks[] | .Outputs[] | select(.OutputKey == "AppURL") | .OutputValue')
****************************************************************

MARKER
