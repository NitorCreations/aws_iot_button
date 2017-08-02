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

There's no button hardware yet. For now, imitate a button with mosquitto:

```
mosquitto_pub --cert cacert/deviceCertAndCACert.pem --key cacert/deviceCert.key --cafile cacert/awsRootCA.pem -h <your AWS account's IoT endpoint in your region> -p 8883 -t iotbutton/<button serial number> -i button/mosquittotesting --tls-version tlsv1.2 -m '{"serialNumber": "<button serial number>", "batteryVoltage": "100mV", "clickType": "SINGLE"}' -d
```

See [debug notes](#debug-notes) for a copy/paste ready example for a specific account.

### Raspberry Pi + Sense HAT

TBD

## Deployment

Steps to deploy the service on an empty AWS account:

Prerequisites:
- AWS account credentials set up for AWS CLI with admin access role

Deployment steps: [`deploy.sh`](deploy.sh)

The deployment script will output a CloudFront URL for the web app.

## Authorizing device certificates

The service is set up for auto registration of device certificates signed with the CA certificate that is registered at initial deployment. A device needs to simply connect once to trigger registration. The first connection will not be authorized. Connect again in a couple of seconds to get authorized. See the [registerDevice](button-service/registerDevice) function.

## Debug Notes

Imitate an AWS IoT Button with mosquitto:

```
mosquitto_pub --cert cacert/deviceCertAndCACert.pem --key cacert/deviceCert.key --cafile cacert/awsRootCA.pem -h axep28u80gg2l.iot.eu-west-1.amazonaws.com -p 8883 -t iotbutton/G030JF0553648RUH -i button/mosquittotesting --tls-version tlsv1.2 -m '{"serialNumber": "G030JF0553648RUH", "batteryVoltage": "100mV", "clickType": "SINGLE"}' -d
```

[1]: https://www.youtube.com/watch?v=T13QyYeMVP0
