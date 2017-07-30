#!/bin/bash

set -x
set -e

cd "$(dirname ${BASH_SOURCE[0]})"

../cacert/gen_ca_cert.sh
../cacert/register_ca_certificate.sh
../cacert/gen_device_cert.sh
sls deploy
./init_iot_logging.sh
./setup_app_env.sh
cd ../app
npm run build
APP_BUCKET=$(aws s3api list-buckets | jq -r '.Buckets[] | select(.Name | contains("apphostingbucket")) | .Name')
aws s3 sync build s3://$APP_BUCKET
BUCKET_REGION=aws s3api get-bucket-location --bucket $APP_BUCKET | jq -r '.LocationConstraint'
APP_URL="https://$APP_BUCKET.s3-$BUCKET_REGION.amazonaws.com"
echo "App at $APP_URL"
