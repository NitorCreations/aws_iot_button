#!/bin/bash

set -x
set -e

cd "$(dirname ${BASH_SOURCE[0]})"

../cacert/gen_ca_cert.sh
../cacert/register_ca_certificate.sh
../cacert/gen_device_cert.sh
sls deploy
./init_iot_logging.sh
