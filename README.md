- certs in vault or vault --init
- button-service/deploy_certs.sh
- button-service/init-iot_logging.sh
- sls deploy


mosquitto_pub --cert ../cacert/deviceCertAndCACert.pem --key ../cacert/deviceCert.key --cafile ~/Downloads/awsiotrootca.pem -h axep28u80gg2l.iot.eu-west-1.amazonaws.com -p 8883 -t iotbutton/G030JF0553648RUH -i button/mosquittotesting --tls-version tlsv1.2 -m "testing123" -d
