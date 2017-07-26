#!/bin/bash

set +x

../cacert/gen_ca_cert.sh
../cacert/register_ca_certificate.sh
../cacert/gen_device_cert.sh
