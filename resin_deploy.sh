#!/bin/bash

set -x
set -e

cd "$(dirname ${BASH_SOURCE[0]})"

resin app create AWSIoTButton --type raspberrypi3 ||:

resin env add IOT_HOST $(aws iot describe-endpoint | jq -r .endpointAddress) -a AWSIoTButton
resin env add AWS_ROOT_CA $(cat cacert/awsRootCA.pem | base64) -a AWSIoTButton
resin env add DEVICE_AND_CA_CERT $(cat cacert/deviceCertAndCACert.pem | base64) -a AWSIoTButton
resin env add PRIVATE_KEY $(cat cacert/deviceCert.key | base64) -a AWSIoTButton
resin env add COUNTDOWN_LENGTH 60000 -a AWSIoTButton
resin env add IOT_CLIENT_ID_PREFIX button/raspibutton- -a AWSIoTButton
resin env add THING_NAME button -a AWSIoTButton

resin device move 9d9aa8b0b945bb031dacb45a9d5ab22df4a81cabe94b329caab5507281f3eb -a AWSIoTButton

cd raspi

RESIN_USERNAME=$(resin whoami | grep USERNAME | sed 's/USERNAME: //g')
RESIN_REPO=$(resin app AWSIoTButton | grep 'GIT REPOSITORY' | sed 's/GIT REPOSITORY: //g')

git remote remove resin ||:

git remote add resin $RESIN_USERNAME@git.resin.io:$RESIN_REPO.git

git push -u resin master
