#!/bin/bash

set -x
set -e

cd "$(dirname ${BASH_SOURCE[0]})"

if resin app create AWSIoTButton --type raspberrypi3; then fi

resin env add IOT_HOST $(aws iot describe-endpoint | jq -r .endpointAddress) -a AWSIoTButton
resin env add AWS_ROOT_CA $(cat cacert/awsRootCA.pem | base64) -a AWSIoTButton
resin env add DEVICE_AND_CA_CERT $(cat cacert/deviceCertAndCACert.pem | base64) -a AWSIoTButton
resin env add PRIVATE_KEY $(cat cacert/deviceCert.key | base64) -a AWSIoTButton
resin env add COUNTDOWN_LENGTH 60000 -a AWSIoTButton
resin env add IOT_CLIENT_ID_PREFIX button/raspibutton- -a AWSIoTButton
resin env add THING_NAME button -a AWSIoTButton

resin device move 9d748bdcdbc0f560ece3985c189cebcf -a AWSIoTButton

cd raspi

RESIN_USERNAME=$(resin whoami | grep USERNAME | sed 's/USERNAME: //g')
RESIN_REPO=$(resin app AWSIoTButton | grep 'GIT REPOSITORY' | sed 's/GIT REPOSITORY: //g')

if [ "$(git remote -v | grep -q resin; echo $?)" -eq "0" ]; then
  git remote remove resin
fi

git remote add resin $RESIN_USERNAME@git.resin.io:$RESIN_REPO.git

git push -u resin master
