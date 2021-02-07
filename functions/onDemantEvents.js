const functions = require('firebase-functions');
const admin = require('firebase-admin');
const utils = require('./utils')
const onDemandEvent = require('./models/onDemandEvent')
var FieldValue = require("firebase-admin").FieldValue;
const db = admin.firestore();
// var FieldValue = require("firebase-admin").FieldValue;
exports.CreateOnDemandEvent = functions.https.onCall(async (data, context) => {
  if (data.customerName)
    // validate data
    // go to customer doc with customer id from the data parameter and 
    cardToDb = Object.create(onDemandEvent.onDemandEvent)
  // make an objcet card and add it to the arr
  // cardToDb.customerID = data.customerID
  cardToDb.customerName = data.customerName
  cardToDb.title = data.title
  cardToDb.link = data.link
  cardToDb.interName = "מותרגמנית"
  cardToDb.start = 0
  cardToDb.isAnswered = false
  cardToDb.interID = ""
  cardToDb.status = 'pending'
  cardToDb.id = data.id

  cardToDb.requestTime = new Date().getTime()


  return db.collection('on-demand-events').doc().set(JSON.parse(JSON.stringify(cardToDb)));

})


exports.InterBookEventOnDemand = functions.https.onCall(async (data, context) => {

  const eventsRef = await db.collection('on-demand-events').doc(data.eventID)
  const doc = await eventsRef.get();

  // get Name
  const interData = await utils.GetEntity("inters-data", context.auth.uid);

  const docUpdated = {
      interName :interData.fullName,
      isAnswered : true,
      interID : context.auth.uid,
      start: new Date().getTime()

  }
 
          // TODO send notification
          // get the link
          // save it in docUpdated.link
          
          const res = await eventsRef.update(docUpdated)
  
})
exports.IsInterOnDemand = functions.https.onCall(async (data, context) => {

  const eventsRef = await db.collection("inters-data").doc(data.interID)
  const doc = await eventsRef.get();

  // get Name
  if(!doc.exists){
    console.log('No such document!   IsInterOnDemand wrong interID');
  }else {
     if(doc.data().onDemand){
       return true
     }else{
       return false
     }
  }
})



exports.GetAllEventsOnDemand = functions.https.onCall(async (data, context) => {

  const eventsRef = db.collection('events').orderBy("start", "asc");
  let arr = []
  let cardToDb = ""
  const snapshot = await eventsRef.get();

  snapshot.forEach(doc => {

    cardToDb = Object.create(onDemandEvent.onDemandEvent)
    // make an objcet card and add it to the arr
    cardToDb.customerName = doc.data().customerName
    cardToDb.interName = doc.data().interName
    cardToDb.interID = doc.data().interID
    cardToDb.title = doc.data().title
    cardToDb.status = doc.data().status
    cardToDb.isAnswered = doc.data().isAnswered
    cardToDb.start = doc.data().start
    cardToDb.requestTime = doc.data().requestTime
    cardToDb.id = doc.data().id
    cardToDb.link = doc.data().link

    arr.push(cardToDb)
  });
  return arr;

})