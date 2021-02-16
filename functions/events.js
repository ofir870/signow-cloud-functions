const functions = require('firebase-functions');
const admin = require('firebase-admin');
const utils = require('./utils')
const NotOccupiedCard = require('./models/notOccupiedEventCard')
const Card = require('./models/eventCard')
const db = admin.firestore();
// var FieldValue = require("firebase-admin").FieldValue;
exports.CreateEvent = functions.https.onCall(async (data, context) => {

  // validate data
  // go to customer doc with customer id from the data parameter and 
  // check if orginization as credit to active the event 

  const event = data;

  // var start =  8 * 60 + 0;
  // var end   = 17 * 60 + 0;
  // get customer doc
  // if(event.start>)
  const userData = await utils.GetEntity("users", event.customerID);
  const customerData = await utils.GetEntity("customers-data", event.customerID);
  event.customerName = customerData.fullName
  event.requestTime = new Date().getTime()

  // get orginization credit for validation

  let credit = await utils.GetOrginizationCreditByCode(userData.code);
  event.code = userData.code
  // long meeting check and decrease credit
  if (event.length == 60) {
    if (credit >= 1) {
      await utils.DecreaseOrginizationCreditByHour(userData.code, credit);
    } else {

      return false
    }
  }
  // short meeting check and decrease credit
  if (event.length == 30) {

    if (credit >= 0.5) {
      await utils.DecreaseOrginizationCreditByHalfHour(userData.code, credit);

    }
    else {

      return false
    }
  }
  let batch = db.batch();

  let setEvent = db.collection('events').doc(data.id);

  batch.set(setEvent, JSON.parse(JSON.stringify(event)));

  return batch.commit().then(function () {
    return true;
  }).catch(err => {
    return err
  })
})




// exports.ValidateEventTime = functions.httpss.onCall(async (data, context) => {
//   const event = utils.GetEntity("events",data.eventID);
//   // 
//  if(event.start<new Date.getTime()) {

//  }
// })
exports.DeletePastEvents = functions.https.onCall(async (data, context) => {

  const eventsRef = db.collection('events');

  let now = new Date().getTime() + 1000 * 60 * 60

  const snapshot = await eventsRef.where("start", "<", now).get()


  if (snapshot.empty) {
    console.log('No matching documents.');
    return;
  }
  snapshot.forEach(async doc => {

    // create event in oldEvents
    let setEvent = await db.collection('events-old').doc(doc.id).set(doc.data())
    // delete event from events
    let deleteEvent = await db.collection('events').doc(doc.id).delete()

    console.log("events moved to old-event")
  })


})

exports.DeleteEventById = functions.https.onCall(async (data, context) => {

  const eventsRef = db.collection('events').doc(data.eventID);

  const doc = await eventsRef.get()

  if (!doc.exists) {

    console.log('No such document!');

  } else {

    let credit = await utils.GetOrginizationCreditByCode(doc.data().code);
    // long meeting check and decrease credit
    if (doc.data().length == 60) {
      await utils.RaiseOrginizationCreditByHour(doc.data().code, credit);
    }
    // short meeting check and decrease credit
    if (doc.data().length == 30) {
      await utils.RaiseOrginizationCreditByHalfHour(doc.data().code, credit);
    }

    // delete 
    const res = await db.collection('events').doc(data.eventID).delete();
    console.log("just deleted an event")
  }

  if (doc.data().occupied == true) {
    // event id
    // 
    return doc.data().gEventId
  } else {
    return false
  }

})
exports.UpdateEvent = functions.https.onCall(async (data, context) => {

  const eventsRef = db.collection('events-test').doc(data.eventID);
  const docUpdated = {}

  data.updatedValues.forEach(obj => {

    let tempKey = obj.key
    let tempVal = obj.value

    if (tempKey == "length" || tempKey == "customerName" || tempKey == "interName"
      || tempKey == "link" || tempKey == "occupied" || tempKey == "code"
      || tempKey == "start" || tempKey == "date") {

      docUpdated[tempKey] = tempVal
    }
  })
  const res = await eventsRef.update(docUpdated)
})


exports.GetAllOccupiedEvents = functions.https.onCall(async (data, context) => {

  const eventsRef = await db.collection('events')
  let date = new Date()
  let cardToDb = ''
  date.getTime()
  const snapshot = await eventsRef.where("occupied", "==", true).get();
  let arr = []
  if (snapshot.empty) {
    console.log('No matching documents.');
    return;
  }

  snapshot.forEach(doc => {
    if (doc.data().start > date) {

      cardToDb = Object.create(Card.EventCard)
      // make an objcet card and add it to the arr
      cardToDb.customerName = doc.data().customerName
      cardToDb.interName = doc.data().interName
      cardToDb.code = doc.data().code
      cardToDb.occupied = doc.data().occupied
      cardToDb.start = doc.data().start
      cardToDb.length = doc.data().length
      cardToDb.date = doc.data().date
      cardToDb.id = doc.data().id
      cardToDb.link = doc.data().link

      arr.push(cardToDb)
    }
  })
  return arr
})

exports.GetAllNotOccupiedEvents = functions.https.onCall(async (data, context) => {

  const eventsRef = await db.collection('events')
  let date = new Date()
  let cardToDb = ''
  date.getTime()

  const snapshot = await eventsRef.where("occupied", "==", false).get();
  let arr = []
  if (snapshot.empty) {
    console.log('No matching documents.');
    return;
  }



  snapshot.forEach(doc => {
    if (doc.data().start > date) {

      cardToDb = Object.create(NotOccupiedCard.NotOccupiedEventCard)
      // make an objcet card and add it to the arr
      cardToDb.customerName = doc.data().customerName
      cardToDb.code = doc.data().code
      cardToDb.occupied = doc.data().occupied
      cardToDb.start = doc.data().start
      cardToDb.length = doc.data().length
      cardToDb.date = doc.data().date
      cardToDb.id = doc.data().id

      arr.push(cardToDb)
    }

  })
  return arr
})

exports.GetHistoriesEventsByUserId = functions.https.onCall(async (data, context) => {

  const eventsRef = await db.collection('events-old')
  let date = new Date()
  date.getTime()

  const snapshot = await eventsRef.get();
  let arr = []
  if (snapshot.empty) {
    console.log('No matching documents.');
    return;
  }

  snapshot.forEach(doc => {
    if (doc.data().customerID == context.auth.uid || doc.data().interID == context.auth.uid) {

      let cardToDb = ''
      cardToDb = Object.create(Card.EventCard)
      // make an objcet card and add it to the arr
      cardToDb.customerName = doc.data().customerName
      cardToDb.interName = doc.data().interName
      cardToDb.code = doc.data().code
      cardToDb.occupied = doc.data().occupied
      cardToDb.start = doc.data().start
      cardToDb.length = doc.data().length
      cardToDb.date = doc.data().date
      cardToDb.id = doc.data().id
      cardToDb.link = doc.data().link

      arr.push(cardToDb)
    }

  })
  return arr
})

exports.GetAllEventsOccupiedByCustomerId = functions.https.onCall(async (data, context) => {

  const eventsRef = await db.collection('events')

  const snapshot = await eventsRef.where("customerID", "==", data.customerID).where("occupied", "==", true).get();
  let arr = []
  let cardToDb = ''
  if (snapshot.empty) {
    console.log('No matching documents.');
    return;
  }
  snapshot.forEach(doc => {

    cardToDb = Object.create(Card.EventCard)
    // make an objcet card and add it to the arr
    cardToDb.customerName = doc.data().customerName
    cardToDb.interName = doc.data().interName
    cardToDb.code = doc.data().code
    cardToDb.occupied = doc.data().occupied
    cardToDb.start = doc.data().start
    cardToDb.length = doc.data().length
    cardToDb.date = doc.data().date
    cardToDb.id = doc.data().id
    cardToDb.link = doc.data().link

    arr.push(cardToDb)

  })
  return arr
})
exports.GetAllEventsNotOccupiedByCustomerId = functions.https.onCall(async (data, context) => {

  const eventsRef = await db.collection('events')

  const snapshot = await eventsRef.where("customerID", "==", data.customerID).where("occupied", "==", false).get();
  let arr = []
  let cardToDb = ''
  if (snapshot.empty) {
    console.log('No matching documents.');
    return;
  }
  snapshot.forEach(doc => {

    cardToDb = Object.create(NotOccupiedCard.NotOccupiedEventCard)
    // make an objcet card and add it to the arr
    cardToDb.customerName = doc.data().customerName
    cardToDb.code = doc.data().code
    cardToDb.occupied = doc.data().occupied
    cardToDb.start = doc.data().start
    cardToDb.length = doc.data().length
    cardToDb.date = doc.data().date
    cardToDb.id = doc.data().id

    arr.push(cardToDb)
  })

  return arr
})

exports.GetAllOccupiedEventsByInterId = functions.https.onCall(async (data, context) => {

  const eventsRef = await db.collection('events')

  const snapshot = await eventsRef.where("interID", "==", data.interID).where("occupied", "==", true).get();
  var arr = []
  let cardEvent = Card.EventCard
  if (snapshot.empty) {
    console.log('No matching documents.');
    return;
  }
  snapshot.forEach(doc => {

    let cardToDb = ''
    cardToDb = Object.create(cardEvent)
    // make an objcet card and add it to the arr
    cardToDb.customerName = doc.data().customerName
    cardToDb.interName = doc.data().interName
    cardToDb.code = doc.data().code
    cardToDb.occupied = doc.data().occupied
    cardToDb.start = doc.data().start
    cardToDb.length = doc.data().length
    cardToDb.date = doc.data().date
    cardToDb.id = doc.data().id
    cardToDb.link = doc.data().link

    arr.push(cardToDb)

  })
  return arr
})


exports.GetEventById = functions.https.onCall((data, context) => {
  let cardToDb = Card.EventCard
  const event = utils.GetEntity("events", data.eventID)

  event.then(doc => {
    cardToDb.customerName = doc.customerName
    cardToDb.interName = doc.interName
    cardToDb.code = doc.code
    cardToDb.occupied = doc.occupied
    cardToDb.start = doc.start
    cardToDb.length = doc.length
    cardToDb.date = doc.date
    cardToDb.id = doc.id
    cardToDb.link = doc.link

  })

  return cardToDb
})

exports.GetAllEvents = functions.https.onCall(async (data, context) => {

  const eventsRef = db.collection('events').orderBy("start", "desc");
  let arr = []
  let cardToDb = ""
  const snapshot = await eventsRef.get();

  snapshot.forEach(doc => {

    cardToDb = Object.create(Card.EventCard)
    // make an objcet card and add it to the arr
    cardToDb.customerName = doc.data().customerName
    cardToDb.interName = doc.data().interName
    cardToDb.code = doc.data().code
    cardToDb.occupied = doc.data().occupied
    cardToDb.start = doc.data().start
    cardToDb.length = doc.data().length
    cardToDb.date = doc.data().date
    cardToDb.id = doc.data().id
    cardToDb.link = doc.data().link

    arr.push(cardToDb)
  });
  return arr;

})