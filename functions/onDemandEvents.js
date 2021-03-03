const functions = require('firebase-functions');
const admin = require('firebase-admin');
const utils = require('./utils')

const onDemandEvent = require('./models/onDemandEvent')
var FieldValue = require("firebase-admin").FieldValue;
const db = admin.firestore();
var moment = require('moment'); // require
moment().format();

exports.CreateOnDemandEvent = functions.https.onCall(async (data, context) => {
  // validate data
  let event = {}
  event = {
    'answer': false,
    'customerID': context.auth.uid,
    'interID': "",
    'title': data.title,
    'link': '',
    'end': 0,
    'interName': "",
    'start': 0,
    'state': 'pending',
    "requestTime": new Date().getTime()
  };

  // go to customer doc with customer id from the data parameter and 
  const userData = await utils.GetEntity("users", event.customerID);
  const customerData = await utils.GetEntity("customers-data", event.customerID);
  event.customerName = customerData.fullName
  event.code = userData.code
  let id = await db.collection('on-demand-events').add(event).then((doc) => {
    return doc.id

  }).catch(err => {
    console.log(err)
  });
  return id
})
exports.TryCatchMeeting = (async (data, context) => {

  // get meeting-id, check the meeting STATE in the DB
  //   if meeting STATE is pending, change the STATE to ready and return {result: success}.
  // else return {result: failed}
  const eventsRef = await db.collection('on-demand-events')

  const snapshot = await eventsRef.where("customerID", "==", context.auth.uid).where('state', '==', 'pending').get();
  if (snapshot.empty) {
    console.log('No matching documents.');
    return { "result": "field" };
  }
  snapshot.forEach(async doc => {
    const res = await db.collection('on-demand-events').doc(doc.id).update({ 'state': "online" });
  });
  return { "result": "success" }


})

exports.InterBookEventOnDemand = functions.https.onCall(async (data, context) => {
  // TODO update the fuction need to return succsess or feiled after check if event state is online


  let docUpdated = {}
  const eventRef = db.collection('on-demand-events').doc(data.eventID);
  const doc = await eventRef.get();
  if (!doc.exists) {
    console.log('No such document!');
  } else {

    const interData = await utils.GetEntity("inters-data", data.interID);

    docUpdated = {
      interName: interData.fullName,
      answer: true,
      interID: data.interID,
      start: new Date().getTime(),
      state: "online"
    }
    try {
      await db.runTransaction(async (t) => {
        const doc = await t.get(eventRef);

        const state = await doc.data().state;
        if (state == 'pending') {
          t.update(eventRef, docUpdated);
          return true
        } else {

          throw 'Event already taken'
        }
      });
    } catch (e) {
      console.log(e);
      return false
    }

  }

})

// change state to 'ended' and update end with new getTime will get event id
exports.FinishODM = functions.https.onCall(async (data, context) => {
  const eventsRef = await db.collection("on-demand-events").doc(data.eventID)
  const doc = await eventsRef.get();
  if(!doc.exists){
    console.log('No such document! wrong eventID');

  }else{
    const res = await db.collection('on-demand-events').doc(doc.id).update({
       'state': "done" ,
       'end': new Date().getTime() 
  });
  console.log('update doc!')
  }
})
exports.IsInterOnDemand = functions.https.onCall(async (data, context) => {


  const eventsRef = await db.collection("inters-data").doc(data.interID)
  const doc = await eventsRef.get();

  // get Name
  if (!doc.exists) {
    console.log('No such document! IsInterOnDemand wrong interID');
  } else {
    if (doc.data().onDemand) {
      return true
    } else {
      return false
    }
  }
})
exports.GetAllEventsOnDemand = functions.https.onCall(async (data, context) => {

  const eventsRef = db.collection('events').orderBy("start", "desc");
  let arr = []
  let cardToDb = ""
  const snapshot = await eventsRef.get();

  snapshot.forEach(doc => {

    cardToDb.id = doc.id
    cardToDb = Object.create(onDemandEvent.onDemandEvent)
    // make an objcet card and add it to the arr
    cardToDb.customerName = doc.data().customerName
    cardToDb.interName = doc.data().interName
    cardToDb.customerID = doc.data().customerID
    cardToDb.interID = doc.data().interID
    cardToDb.title = doc.data().title
    cardToDb.state = doc.data().state
    cardToDb.isAnswered = doc.data().isAnswered
    cardToDb.start = doc.data().start
    cardToDb.requestTime = doc.data().requestTime
    cardToDb.link = doc.data().link

    arr.push(cardToDb)
  });
  return arr;

})



exports.DeleteODEventByCustomerId = functions.https.onCall(async (data, context) => {

  const eventsRef = await db.collection('on-demand-events');

  const snapshot = await eventsRef.where("customerID", "==", context.auth.uid).where('state', '==', 'pending').get();

  if (snapshot.empty) {
    console.log('No matching documents.');
    return;
  }
  snapshot.forEach(async doc => {

    const res = await db.collection('on-demand-events').doc(doc.id).delete();
  });
  return "Events deleted"
})

// exports.UpdateODM = functions.https.onCall(async (data, context) => {  
//   let update = utils.UpdateAllCollection("ODM", "test", "test").then(answer => {
//     return answer
//   })

// })