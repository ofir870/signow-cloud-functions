const functions = require('firebase-functions');
const admin = require('firebase-admin');
const db = admin.firestore();
const nodemailer = require("nodemailer");
const config = require("./config")



// exports.ScheduledEmail = functions.pubsub.schedule('every 30 minutes').onRun((context) => {
//   // check if there is event to send a reminder to customer on phone
//   // get all event that are in the next 30 minutes 
//   // if there is events send to all customers reminder
//   console.log('This will be run every 5 minutes!');
//   console.log(context)
// });
exports.SendGridEmail = (data) => {

  const sgMail = require('@sendgrid/mail')

  sgMail.setApiKey(config.sgMail.sgID)
  let linkCustomerName = data.customerName.split(/(\s+)/);
  let linkInterName = data.interName.split(/(\s+)/);
  const msg = [
    {
      to: data.customerMail, // Change to your recipient
      from: 'ofir@signow.org', // Change to your verified sender
      subject: 'שלום, נקבעה לך שיחה חדשה במערכת signow',
      text: `שלום ${data.customerName} נקבעה לך פגישה עם המתורגמנית  ${data.interName}
        בתאריך  :  ${data.meetingTime}
        לאורך של : ${data.meetingLength} דקות
        
        קישור לאפליקצייה :   'https://signplus-295808.web.app/#/'

        הלינק לפגישה ישלח בהודעת אס אם אס 
                ` },
    {
      to: data.interMail, // Change to your recipient
      from: 'ofir@signow.org', // Change to your verified sender
      subject: 'שלום, נקבעה לך שיחה חדשה במערכת signow',
      text: `שלום ${data.interName} נקבעה לך פגישה עם המתורגמנית  ${data.customerName}
        בתאריך  :  ${data.meetingTime}
        לאורך של : ${data.meetingLength} דקות
        
       קישור לאפליקצייה :   'https://signplus-295808.web.app/#/'
        
        הלינק לפגישה ישלח בהודעת אס אם אס 
        `
    }
  ]
  sgMail.send(msg)
    .then(() => {
      console.log('Email sent')
    }).catch(err => {
      config.log(err)
    })
}

// get the event by
// call this function when the value isOccurpied in event change 
// if true: send message to both client and inter about the meeting
// if false: send a message about meeting cancellation  
exports.SendSMSOnClosedEvent = (data => {
  let linkCustomerName = data.customerName.split(/(\s+)/);
  let linkInterName = data.interName.split(/(\s+)/);
  const recipients = [
    {
      phone: data.customerPhone,
      name: data.customerName,
      secendName: data.interName,
      link: `${data.eventLink}&name=${linkCustomerName[0]}&exitUrl=https://forms.gle/zq2Rk9ihL1Gdeoxg9`
    },
    {
      phone: data.interPhone,
      name: data.interName,
      secendName: data.customerName,
      link: `${data.eventLink}&name=${linkInterName[0]}&exitUrl=https://forms.gle/ZUNRJWgkvCckxaoR6`
    }
  ]
  const accountSid = config.twilio.accountSid;
  const authToken = config.twilio.authToken;

  const client = require('twilio')(accountSid, authToken);

  if (!data.interPhone && !data.customerPhone) {

    return console.log("the phone is missing");

  }

  let answer = ''
  recipients.forEach(element => {
    const obj = {

      body: `
      
      :נקבעה לך שיחה חדשה במערכת signow

      שלום  ${element.name} נקבעה לך פגישה עם המתורגמנית  ${element.secendName}
       בתאריך  :  ${data.eventTime}
       לאורך של : ${data.eventLength} דקות
       
       הלינק הפגישה הוא :   ${element.link}
       
       `,
      from: '+972523418514',
      to: `${element.phone}`
    }

    client.messages
      .create(obj)

      .then(message => {

        answer = message.status
        console.log(message.accountSid)
      })
      .done();
  });
  return ("sent message function end" + answer)
})
