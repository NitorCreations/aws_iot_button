#!/bin/bash
set -x

cd "$(dirname ${BASH_SOURCE[0]})"

REG_CODE=$(aws iot get-registration-code | jq -r .registrationCode)

openssl genrsa -out verificationCert.key 2048

VERIFICATION_SUBJ="/C=FI/ST=Uusimaa/L=Helsinki/O=Nitor/OU=Nitor/CN=$REG_CODE"

openssl req -new -key verificationCert.key -out verificationCert.csr -subj $VERIFICATION_SUBJ

openssl x509 -req -in verificationCert.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out verificationCert.pem -days 500 -sha256

REGISTER_RESULT=$(aws iot register-ca-certificate --ca-certificate file://rootCA.pem --verification-cert file://verificationCert.pem --allow-auto-registration --set-as-active 2>&1)
if [ "$(echo $?)" -gt "0" ]; then
  CA_CERT_ID=$(echo $REGISTER_RESULT | sed -n -e 's/^.*ID://p')
else
  CA_CERT_ID=$(echo $REGISTER_RESULT | jq -r .certificateId)
fi

rm verificationCert*

cat > cacertid.yml << MARKER
caCertificateId: $CA_CERT_ID
MARKER
