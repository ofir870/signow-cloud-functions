const functions = require('firebase-functions');
const admin = require('firebase-admin');
const db = admin.firestore();
const nodemailer = require("nodemailer");
const config = require("./config")
const utils = require('./utils');
const userActions = require('./userActions');



const accountSid = config.twilio.accountSid;
const authToken = config.twilio.authToken;

const client = require('twilio')(accountSid, authToken);

// exports.ScheduledEmailMessage = functions.https.onCall(async (data, context) => {
exports.ScheduledEmailMessage = functions.pubsub.schedule('0 * * * *').onRun(async (context) => {
  // ------>> check if there is event to send a reminder to customer on phone
  // get all event that are in the next 60 minutes 

  const entityRef = db.collection('events');

  const HOUR = 1000 * 60 * 60;
  let now = new Date().getTime()
  let nowPlusHour = new Date().getTime() + HOUR
  let count = 0
  // console.log(new Date().getTime()+ 1000 * 60 * 60)
  const snapshot = await entityRef.where("start", ">", now).where("start", "<", nowPlusHour).get();
  snapshot.forEach(async doc => {

    let phone = ""
    // get phone by customer id
    let get = await userActions.GetPhoneById(doc.data().customerID).then(d => {
      phone = d
    })
    if (doc.data().occupied) {

      // send a SMS message by customer id
      count++
      client.messages
        .create({
          body: `
        :הודעת תזכורת לפגישה signow
        
        שלום  ${doc.data().customerName} נקבעה לך פגישה עם המתורגמנית  ${doc.data().interName}
        בתאריך  :  ${doc.data().date}
        לאורך של : ${doc.data().length} דקות.
        
        הלינק לפגישה הוא :   ${doc.data().link}
        
        `,
          from: '+972523418514',
          to: phone,

        })
        .then(message => console.log(message.accountSid));
    }
  })

})
exports.SendEmailVerifications = functions.https.onCall((data, context) => {

  client.verify.services('VAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
    .verifications
    .create({ to: 'ofirofir870@gmail.com', channel: 'email' })
    .then(verification => console.log(verification.sid));
})

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
