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
        from: 'Your Account Name <ofirofir870@gmail.com>', // Something like: Jane Doe <janedoe@gmail.com>
        to: dest,
        subject: 'I\'M A PICKLE!!!', // email subject
        html: `<p style="font-size: 16px;">Pickle Riiiiiiiiiiiiiiiick!!</p>
        <br />
        <img src="https://images.prod.meredith.com/product/fc8754735c8a9b4aebb786278e7265a5/1538025388228/l/rick-and-morty-pickle-rick-sticker" />
        ` // email content in HTML
    }
    
    // returning result
    
      transporter.sendMail(mailOptions).then(data=>{
        console.log(data)
      })
    
    return "go"  
})
