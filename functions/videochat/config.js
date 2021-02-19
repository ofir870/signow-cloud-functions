const functions = require('firebase-functions');
module.exports = {
  // twilio: {
  //   accountSid: process.env.TWILIO_ACCOUNT_SID,
  //   apiKey: process.env.TWILIO_API_KEY,
  //   apiSecret: process.env.TWILIO_API_SECRET
  // }
  twilio: {
    accountSid: functions.config().twilio.accountsid,
    apiKey: functions.config().twilio.apikey,
    apiSecret: functions.config().twilio.apisecret
  }
};
