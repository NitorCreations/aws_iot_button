var child_process = require('child_process');
module.exports = () => {
   var accountId = child_process.execSync("aws sts get-caller-identity --output text --query 'Account'").toString().trim();

   var iotEndpoint = child_process.execSync("aws iot describe-endpoint | jq -r .endpointAddress").toString().trim();

   return {
     accountId: accountId,
     iot: {
       endpoint: iotEndpoint
     }
   };
}
