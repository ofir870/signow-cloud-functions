const functions = require('firebase-functions');
const admin = require('firebase-admin');
const utils = require('./utils')
const onDemandEvent = require('./models/onDemandEvent')
var FieldValue = require("firebase-admin").FieldValue;
const db = admin.firestore();
var moment = require('moment'); // require
moment().format();

// var FieldValue = require("firebase-admin").FieldValue;
exports.CreateOnDemandEvent = functions.https.onCall(async (data, context) => {
 
    // validate data
    // go to customer doc with customer id from the data parameter and 
    let event = {}

    event = {
      'answer': data.answer,
      'id': data.id,
      'customerID': data.customerID,
      'interID': data.interID,
      'state': data.state,
      'title': data.title,
      'desc': data.description,
      // 'loc': location,
      'link': data.link,
      'customerName': data.customerName,
      'interName': data.interName,
      // 'should_notify': shouldNotifyAttendees,
      'start': data.start,
      'end': data.end,
      'length': data.length,
      'date': data.date,
      'occupied': data.occupied,
      
    };
  // make an objcet card and add it to the arr
  // cardToDb.customerID = data.customerID
  const userData = await utils.GetEntity("users", event.customerID);
  const customerData = await utils.GetEntity("customers-data", event.customerID);
  event.customerName = customerData.fullName
  event.code = userData.code

  return db.collection('on-demand-events').doc().set(JSON.parse(JSON.stringify(event)));

})


exports.InterBookEventOnDemand = functions.https.onCall(async (data, context) => {
  let docUpdated = {}
  const eventRef = db.collection('on-demand-events')
  const snapshot = await eventRef.where("link", "==", data.link).get().then(async (query) => {

    const doc = query.docs[0]

    const interData = await utils.GetEntity("inters-data", context.auth.uid);

    docUpdated = {
      interName: interData.fullName,
      isAnswered: true,
      interID: context.auth.uid,
      start: new Date().getTime(),
      state: "online"
    }

    const res = doc.ref.update(docUpdated)

  })

  // get Name
  // TODO send notification
  // get the link
  // save it in docUpdated.link


  return docUpdated.interName
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


exports.UpdateODM = functions.https.onCall(async (data, context) => {

  let update = utils.UpdateAllCollection("ODM", "test", "test").then(answer => {
    return answer
  })

})