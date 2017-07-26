# AWS IoT Button

Push a button every 108 minutes to keep the world going <sup>[1]</sup>.

Ways to push the button:
- AWS IoT Buttons (X.509 certificate auth)
- Raspberry Pi + Sense HAT (X.509 certificate auth, will also update device shadow info and display stuff on Sense HAT LED matrix)
- PWA App (Cognito auth, support for device shadow operations as well)

## Deployment

Steps to deploy the service on an empty AWS account:

Prerequisites:
- Nitor deploy tools (ndt) installed (do yourself a favor and use a python virtualenv)
- AWS account credentials set up for aws CLI and ndt (`ndt setup-cli`)

Deployment steps:
- vault --init
- button-service/deploy_certs.sh
- button-service/init-iot_logging.sh
- sls deploy

## Authorizing device certificates

The service is set up for auto registration of device certificates signed with the CA certificate that is registered at initial deployment. A device needs to simply connect once to trigger registration. The first connection will not be authorized. Connect again in a couple of seconds to get authorized. See the [registerDevice](button-service/registerDevice) function.

## Debug Notes

Imitate an AWS IoT Button with mosquitto:
```
mosquitto_pub --cert ../cacert/deviceCertAndCACert.pem --key ../cacert/deviceCert.key --cafile ~/Downloads/awsiotrootca.pem -h axep28u80gg2l.iot.eu-west-1.amazonaws.com -p 8883 -t iotbutton/G030JF0553648RUH -i button/mosquittotesting --tls-version tlsv1.2 -m "testing123" -d
```

[1]: https://www.youtube.com/watch?v=T13QyYeMVP0
