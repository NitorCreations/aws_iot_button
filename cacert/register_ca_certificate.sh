#!/bin/bash
set -x

cd "$(dirname ${BASH_SOURCE[0]})"

REG_CODE=$(aws iot get-registration-code | jq -r .registrationCode)

openssl genrsa -out verificationCert.key 2048

VERIFICATION_SUBJ="/C=FI/ST=Uusimaa/L=Helsinki/O=Nitor/OU=Nitor/CN=$REG_CODE"

openssl req -new -key verificationCert.key -out verificationCert.csr -subj $VERIFICATION_SUBJ

openssl x509 -req -in verificationCert.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out verificationCert.pem -days 500 -sha256

CA_CERT_ID=$(aws iot register-ca-certificate --ca-certificate file://rootCA.pem --verification-cert file://verificationCert.pem --allow-auto-registration | jq -r .certificateId)

aws iot update-ca-certificate --certificate-id $CA_CERT_ID --new-status ACTIVE

rm verificationCert*

cat > cacertid.yml << MARKER
caCertificateId: $CA_CERT_ID
MARKER
