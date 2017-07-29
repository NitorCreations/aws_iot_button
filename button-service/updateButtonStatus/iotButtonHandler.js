'use strict';

/**
Updates a Thing shadow on behalf of an AWS IoT Button which
can't be programmed to access Things on AWS IoT.
**/

var AWS = require('aws-sdk');

module.exports.pushHandler = (event, context, callback) => {

  var thingName = "button";

  console.log(`Proxying IoT button event:\n${JSON.stringify(event, null, 2)}`);

  var iotdata = new AWS.IotData({
    endpoint: process.env.iotEndpoint,
    apiVersion: '2015-05-28'
  });
  var payload = {
    state: {
      desired: {
         pushedAt: Math.floor(Date.now() / 1000),
         pusher: event.serialNumber,
         intervalSeconds: 60
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
