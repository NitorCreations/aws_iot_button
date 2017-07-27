'use strict';

/**
Updates a Thing shadow on behalf of an AWS IoT Button which
can't be programmed to access Things on AWS IoT.
**/

var AWS = require('aws-sdk');

module.exports.pushHandler = (event, context, callback) => {

  var thingName = "button";

  console.log(`Proxying IoT button event:\n${JSON.stringify(event, null, 2)}`);

  //
  // Replace the values of '<YourUniqueClientIdentifier>' and '<YourCustomEndpoint>'
  // with a unique client identifier and custom host endpoint provided in AWS IoT cloud
  // NOTE: client identifiers must be unique within your AWS account; if a client attempts
  // to connect with a client identifier which is already in use, the existing
  // connection will be terminated.
  //
  var iotdata = new AWS.IotData({
    endpoint: process.env.iotEndpoint,
    apiVersion: '2015-05-28'
  });
  var payload = {
    "state": {
      "desired": {
         "pushedAt": Math.floor(Date.now() / 1000),
         "pusher": event.serialNumber
       }
     }
  };
  var updateParams = {
    payload: JSON.stringify(payload),
    thingName: thingName
  };
  iotdata.updateThingShadow(updateParams, function(err, data) {
    if (err) {
      console.log(err, err.stack);
      callback(err, "Fail");
    }
    else {
      console.log(data);
      callback(null, "Success");
    }
  });

};
// example iotbutton message to topic iotbutton/<serialnumber>
// {
//     "serialNumber": "G030JF059405K485",
//     "batteryVoltage": "1615mV",
//     "clickType": "SINGLE"
// }
