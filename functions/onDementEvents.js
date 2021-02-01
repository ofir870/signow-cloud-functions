const functions = require('firebase-functions');
const admin = require('firebase-admin');
const utils = require('./utils')
const onDemendEvent = require('./models/onDementEvent')
var FieldValue = require("firebase-admin").FieldValue;
const db = admin.firestore();
// var FieldValue = require("firebase-admin").FieldValue;
exports.CreateOnDemendEvent = functions.https.onCall(async (data, context) => {
    if(data.customerName)
        // validate data
        // go to customer doc with customer id from the data parameter and 
        cardToDb = Object.create(onDemendEvent.onDemendEvent)
        // make an objcet card and add it to the arr
        cardToDb.customerName = data.customerName
        cardToDb.interName = ''
        cardToDb.state = data.state
        cardToDb.start = data.start
        cardToDb.length = data.length
        cardToDb.date = data.date
        cardToDb.link = data.link
        cardToDb.isAnswerd = data.isAnswerd
        cardToDb.interID = ""
        cardToDb.customerID = data.customerID
        cardToDb.status = data.status

        cardToDb.requestTime = new Date().getTime
        
        arr.push(cardToDb)

        const userData = await utils.GetEntity("users",  cardToDb.customerID);
        const customerData = await utils.GetEntity("customers-data",  cardToDb.customerID);
  

    return db.collection('on-demend-events').doc().set(JSON.parse(JSON.stringify(cardToDb)));
       
      })
      
    // go to customer doc with customer id from the data parameter and 
  
    // // get orginization credit for validation

    // const res = db.collection('ODM').doc(data.id).set(event)
