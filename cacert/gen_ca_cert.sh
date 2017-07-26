#!/bin/bash
set -x

cd "$(dirname ${BASH_SOURCE[0]})"

SUBJ="/C=FI/ST=Uusimaa/L=Helsinki/O=Nitor/OU=Nitor/CN=buttonthingCA"

if [ ! -f rootCA.key ] || [ ! -f rootCA.pem ] || [ ! -f rootCA.srl ]; then

  vault -l rootCA.key -p buttonthing -o rootCA.key
  vault -l rootCA.pem -p buttonthing -o rootCA.pem
  vault -l rootCA.srl -p buttonthing -o rootCA.srl

fi

if [ ! -f rootCA.key ] || [ ! -f rootCA.pem ] || [ ! -f rootCA.srl ]; then

  openssl genrsa -out rootCA.key 2048
  openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 5000 -out rootCA.pem -subj "$SUBJ"

  vault -s -w -f rootCA.key -p buttonthing
  vault -s -w -f rootCA.pem -p buttonthing
  vault -s -w -f rootCA.srl -p buttonthing

fi
