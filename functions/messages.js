const functions = require('firebase-functions');
const admin = require('firebase-admin');
const db = admin.firestore();
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: 'smtp.gmail.com',
  auth: {
    user: 'ofirofir870@gmail.com',
    pass: '1FgfdS34_fdC45'
  }
});
exports.SendEmail = functions.https.onCall((data, context) => {

  // getting dest email by query string
  const dest = `ofir@signow.org`;

  const mailOptions = {
    from: 'ofir <ofirofir870@gmail.com>', // Something like: Jane Doe <janedoe@gmail.com>
    to: dest,
    subject: 'I\'M A PICKLE!!!', // email subject
    html: `<p style="font-size: 16px;">Pickle Riiiiiiiiiiiiiiiick!!</p>
        <br />
        <img src="https://images.prod.meredith.com/product/fc8754735c8a9b4aebb786278e7265a5/1538025388228/l/rick-and-morty-pickle-rick-sticker" />
        ` // email content in HTML
  }

  // returning result

  transporter.sendMail(mailOptions).then(data => {
    console.log(data)
  })
  return "go"
})

// get the event by
// call this function when the value isOccurpied in event change 
// if true: send message to both client and inter about the meeting
// if false: send a message about meeting cancellation  
exports.SendSMSOnClosedEvent = functions.https.onCall((data, context) => {

  const recipients = [
    {
      phone: data.customerPhone,
      name: data.customerName,
      secendName: data.interName,
    },
    {
      phone: data.interPhone,
      name: data.interName,
      secendName: data.customerName,
    }
  ]
  const accountSid = 'AC2a9db3c7279992b89d19f4f3e7a19933';
  const authToken = '454ed73a5b64ce377e1c5cde6fd821cd';
  const client = require('twilio')(accountSid, authToken);

  if (!data.interPhone && !data.customerPhone) {

    return console.log("the phone is missing");

  }
  //     //  validate
  //     // is number
  //     //  min length
  //     // max length

  let answer = ''
  recipients.forEach(element => {
    const obj = {
      body: `שלום ${element.name} נקבעה לך פגישה עם המתורגמן\נית ${element.secendName} מיקום הפגישה הוא :  ${data.eventTime}
       בתאריך ${data.eventLink} לאורך של :${data.eventLength} דקות`,
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
