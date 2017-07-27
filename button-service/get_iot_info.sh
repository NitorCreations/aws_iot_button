#!/bin/bash

set -x

ENDPOINT=$(aws iot describe-endpoint | jq -r .endpointAddress)

echo "endpoint: $ENDPOINT" > iotInfo.yml
