#!/bin/bash
set -x

cd "$(dirname ${BASH_SOURCE[0]})"

SUBJ="/C=FI/ST=Uusimaa/L=Helsinki/O=Nitor/OU=Nitor/CN=buttonthing"

if [ ! -f deviceCert.key ] || [ ! -f deviceCert.pem ]; then

  vault -l deviceCert.key -p buttonthing -o deviceCert.key
  vault -l deviceCert.pem -p buttonthing -o deviceCert.pem

fi

if [ ! -f deviceCert.key ] || [ ! -f deviceCert.pem ]; then

  openssl genrsa -out deviceCert.key 2048

  openssl req -new -key deviceCert.key -out deviceCert.csr -subj "$SUBJ"

  openssl x509 -req -in deviceCert.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out deviceCert.pem -days 5000 -sha256

  vault -s -w -f deviceCert.key -p buttonthing
  vault -s -w -f deviceCert.pem -p buttonthing

  rm deviceCert.csr

fi
