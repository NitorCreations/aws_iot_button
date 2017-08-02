'use strict';

/**
This node.js Lambda function code creates and attaches an IoT policy to the
just-in-time registered certificate. It also activates the certificate. The Lambda
function is attached as a rule engine action to the registration topic
Saws/events/certificates/registered/<caCertificateID>
**/

var AWS = require('aws-sdk');

module.exports.registerDevice = (event, context, callback) => {

    var region = process.env.region;
    var accountId = event.awsAccountId.toString().trim();
    var iot = new AWS.Iot({'region': region, apiVersion: '2015-05-28'});
    var certificateId = event.certificateId.toString().trim();
    var topicNamePrefix = `iotbutton`;
    var certificateARN = `arn:aws:iot:${region}:${accountId}:cert/${certificateId}`;
    var policyName = `Policy_${certificateId}`;
    var thingName = `button`;

    //Policy that allows connect, publish, subscribe and receive
    var policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "iot:Connect"
                ],
                "Resource": `arn:aws:iot:${region}:${accountId}:client/button/*`
            },
            {
                "Effect": "Allow",
                "Action": [
                    "iot:Publish",
                    "iot:Receive"
                ],
                "Resource": `arn:aws:iot:${region}:${accountId}:topic/${topicNamePrefix}/*`
            },
            {
                "Effect": "Allow",
                "Action": [
                    "iot:Subscribe"
                ],
                "Resource": `arn:aws:iot:${region}:${accountId}:topicfilter/${topicNamePrefix}/*`
            },
            {
                "Effect": "Allow",
                "Action": [
                    "iot:Subscribe"
                ],
                "Resource": `arn:aws:iot:${region}:${accountId}:topicfilter/$aws/things/button/*`
            },
            {
                "Effect": "Allow",
                "Action": [
                    "iot:Publish",
                    "iot:Receive"
                ],
                "Resource": `arn:aws:iot:${region}:${accountId}:topic/$aws/things/button/*`
            }
        ]
    };

    /*
    Step 1) Create a policy
    */
    iot.createPolicy({
        policyDocument: JSON.stringify(policy),
        policyName: policyName
    }, (err, data) => {
        //Ignore if the policy already exists
        if (err && (!err.code || err.code !== 'ResourceAlreadyExistsException')) {
            console.log(err);
            callback(err, data);
            return;
        }
        console.log(data);

        /*
        Step 2) Attach the policy to the certificate
        */
        iot.attachPrincipalPolicy({
            policyName: policyName,
            principal: certificateARN
        }, (err, data) => {
            //Ignore if the policy is already attached
            if (err && (!err.code || err.code !== 'ResourceAlreadyExistsException')) {
                console.log(err);
                callback(err, data);
                return;
            }
            console.log(data);
            /*
            Step 3) Activate the certificate. Optionally, you can have your custom Certificate Revocation List (CRL) check
            logic here and ACTIVATE the certificate only if it is not in the CRL. Revoke the certificate if it is in the CRL
            */
            iot.updateCertificate({
                certificateId: certificateId,
                newStatus: 'ACTIVE'
            }, (err, data) => {
                if (err) {
                    console.log(err, err.stack);
                    callback(err, data);
                }
                else {
                  /*
                  Step 4) Attach principal to button thing
                  */
                  var params = {
                    principal: certificateARN,
                    thingName:  thingName
                  };
                  iot.attachThingPrincipal(params, function(err, data) {
                    if (err) {
                      console.log(err, err.stack); // an error occurred
                    }
                    else {
                      console.log(data);
                      callback(null, "Success, created, attached policy, activated the certificate and attached thing to certificate" + certificateId);
                    }
                  });
                }
            });
        });
    });

};

// {
//     "certificateId": "certificateID",
//     "caCertificateId": "caCertificateId",
//     "timestamp": timestamp,
//     "certificateStatus": "PENDING_ACTIVATION",
//     "awsAccountId": "awsAccountId",
//     "certificateRegistrationTimestamp": "certificateRegistrationTimestamp"
// }
