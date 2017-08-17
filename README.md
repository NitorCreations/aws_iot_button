# AWS IoT Button

Push a button every 108 minutes to keep the world going <sup>[1]</sup>.

## Ways to push the button
- AWS IoT Buttons (X.509 certificate auth, shadow update proxied via a lambda function)
- Raspberry Pi + Sense HAT (X.509 certificate auth, will also update device shadow info and display stuff on Sense HAT LED matrix)
- Web App (Cognito Identity auth, support for device shadow operations as well)

### Web App

The React app (in the [app](app) folder) connects to AWS IoT with an unauthenticated Cognito Identity. Its role allows IoT actions.
The app listens to thing shadow status updates from other clients and posts its own if the button is pushed in the app.

Open the app in e.g. two different browsers to see it in action here: https://d242zm3q3a70kq.cloudfront.net/

### AWS IoT Button

The button can be configured to publish on an MQTT endpoint specific to an AWS account using a specific X.509 certificate.

To connect the button's publish topic to the distributed button device state, a Lambda function is configured to be triggered from messages pushed to the button's topic. The lambda function updates the AWS IoT device shadow with information on when the button was pushed (see [updateButtonStatus](button-service/updateButtonStatus)).

See [debug notes](#debug-notes) for how to mimic a button with mosquitto.

### Raspberry Pi + Sense HAT

A git submodule located in the [raspi](raspi) folder or separately [here](https://github.com/NitorCreations/aws_iot_button_raspi) contains a python app which renders a countdown animation on the Sense HAT LED matrix. The Sense HAT stick can be used to push the button.

The device communicates with AWS IoT using [aws-iot-device-sdk-python](https://github.com/aws/aws-iot-device-sdk-python). Authentication is done using X.509 certificates (the one that gets generated with `cacert/gen_device_cert.sh`).

The code is deployed on the device as a docker container using [resin.io](https://resin.io).

## Deployment

Steps to deploy the service on an empty AWS account.

### Prerequisites
- AWS CLI installed
- Nitor Vault installed (`pip install nitor-vault`, also installs AWS CLI as dependency)
- AWS account credentials set up for AWS CLI with admin access role
- Vault created with Nitor Vault for the AWS account (`vault -i`)
- Resin.io CLI installed (`npm install --global --production resin-cli`)

###  Deployment steps for backend service and web app
- Run [`deploy.sh`](deploy.sh)

The deployment script will output a CloudFront URL for the web app.

A device cert is generated in the `cacert` folder. That or others like it (signed with the CA certificate generated and registered during deployment) needs to be configured in hardware that is used to connect to the thing shadow on AWS IoT.


### Raspberry Pi

The Raspberry Pi is set up using resin.io, which needs a bit of work:

- Register a device on resin.io (place it in a temp resin.io application)
- Download the resinOS image for the registered device
- Configure the resinOS image with the correct wifi SSID and passphrase
- Turn on the device and verify it connects to resin.io
- Update [`resin_deploy.sh`](resin_deploy.sh) with the UUID for your device
- Log in with resin cli (`resin login`)
- Run [`resin_deploy.sh`](resin_deploy.sh)

### AWS IoT Button

-  Configure an AWS IoT Button with:
  -  The device certificate generated with `cacert/gen_device_cert.sh` (or make more of them if you want to use separate certs with this and Raspberry Pi, see below).
  - The account specific AWS IoT endpoint address
  - Your wifi SSID and passphrase
- Then push the button!

## Authorizing device certificates

The service is set up for auto registration of device certificates signed with the CA certificate that is registered at initial deployment. A device needs to simply connect once to trigger registration. The first connection will not be authorized. Connect again in a couple of seconds to get authorized. See the [registerDevice](button-service/registerDevice) function.

## Debug Notes

To mimic pushing an AWS IoT Button with mosquitto, run something like this:

```
mosquitto_pub --cert cacert/deviceCertAndCACert.pem --key cacert/deviceCert.key --cafile cacert/awsRootCA.pem -h <your AWS account's IoT endpoint in your region> -p 8883 -t iotbutton/<button serial number> -i button/mosquittotesting --tls-version tlsv1.2 -m '{"serialNumber": "<button serial number>", "batteryVoltage": "100mV", "clickType": "SINGLE"}' -d
```

Concrete example:
```
mosquitto_pub --cert cacert/deviceCertAndCACert.pem --key cacert/deviceCert.key --cafile cacert/awsRootCA.pem -h axep28u80gg2l.iot.eu-west-1.amazonaws.com -p 8883 -t iotbutton/G030JF0553648RUH -i button/mosquittotesting --tls-version tlsv1.2 -m '{"serialNumber": "G030JF0553648RUH", "batteryVoltage": "100mV", "clickType": "SINGLE"}' -d
```

[1]: https://www.youtube.com/watch?v=T13QyYeMVP0
