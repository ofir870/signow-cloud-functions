const functions = require('firebase-functions');
const admin = require('firebase-admin');
const utils = require('./utils')
const db = admin.firestore();

exports.CreateEvent = functions.https.onCall(async (data, context) => {
  // validate data
  // go to customer doc with customer id from the data parameter and 
  // check if orginization as credit to active the event 
  const event = data;
  // var start =  8 * 60 + 0;
  // var end   = 17 * 60 + 0;
  // get customer doc
  // if(event.start>)
  const userData = await utils.GetEntity("users", data.customerID);
  const customerData = await utils.GetEntity("customers-data", data.customerID);
  data.customerName = customerData.fullName
  // get orginization credit for validation

  let credit = await utils.GetOrginizationCreditByCode(userData.code);
  event.code = userData.code
  // long meeting check and decrease credit
  if (data.length == 60) {
    if (credit >= 1) {
      await utils.DecreaseOrginizationCreditByHour(userData.code, credit);
    } else {

      return false
    }
  }
  // short meeting check and decrease credit
  if (data.length == 30) {

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

  const snapshot = await eventsRef.where("date", "<", new Date()).get()

  let arr = []
  if (snapshot.empty) {
    console.log('No matching documents.');
    return;
  }
  snapshot.forEach(doc => {

    let tempObj = doc.data()
    tempObj.id = doc.id
    arr.push(tempObj)

  })
  return arr

})

exports.DeleteEvent = functions.https.onCall(async (data, context) => {

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

})
exports.UpdateEventTime = functions.https.onCall(async (data, context) => {

  const eventsRef = db.collection('events').doc(data.eventID);

  const res = await eventsRef.update({ date: data.date })

  console.log('Update: ', res);
})


exports.GetAllOccupiedEvents = functions.https.onCall(async (data, context) => {

  const eventsRef = await db.collection('events')

  const snapshot = await eventsRef.where("occupied", "==", true).get();
  let arr = []
  if (snapshot.empty) {
    console.log('No matching documents.');
    return;
  }
  snapshot.forEach(doc => {
    if(doc.data().start>date){
    let tempObj = doc.data()
    tempObj.id = doc.id
    arr.push(tempObj)
    }
  })
  return arr
})

exports.GetAllNotOccupiedEvents = functions.https.onCall(async (data, context) => {

  const eventsRef = await db.collection('events')
  let date = new Date()
  date.getTime()

  const snapshot = await eventsRef.where("occupied", "==", false).get();
  let arr = []
  if (snapshot.empty) {
    console.log('No matching documents.');
    return; 
  }
  
  snapshot.forEach(doc => {
    if(doc.data().start>date){

      let tempObj = doc.data()
      tempObj.id = doc.id
      arr.push(tempObj)
    }
      
  })
  return arr
})

exports.GetAllEventsOccupiedByCustomerId = functions.https.onCall(async (data, context) => {

  const eventsRef = await db.collection('events')

  const snapshot = await eventsRef.where("customerId", "==", data.customerID).where("occupied", "==", true).get();
  let arr = []
  if (snapshot.empty) {
    console.log('No matching documents.');
    return;
  }
  snapshot.forEach(doc => {

    let tempObj = doc.data()
    tempObj.id = doc.id
    arr.push(tempObj)

  })
  return arr
})
exports.GetAllEventsNotOccupiedByCustomerId = functions.https.onCall(async (data, context) => {

  const eventsRef = await db.collection('events')

  const snapshot = await eventsRef.where("customerId", "==", data.customerID).where("occupied", "==", false).get();
  let arr = []
  if (snapshot.empty) {
    console.log('No matching documents.');
    return;
  }
  snapshot.forEach(doc => {

    let tempObj = doc.data()
    tempObj.id = doc.id
    arr.push(tempObj)

  })
  return arr
})

exports.GetAllOccupiedEventsByInterId = functions.https.onCall(async (data, context) => {

  const eventsRef = await db.collection('events')

  const snapshot = await eventsRef.where("interId", "==", data.interID).where("occupied", "==", true).get();
  let arr = []
  if (snapshot.empty) {
    console.log('No matching documents.');
    return;
  }
  snapshot.forEach(doc => {

    let tempObj = doc.data()
    tempObj.id = doc.id
    arr.push(tempObj)

  })
  return arr
})


exports.GetEventById = functions.https.onCall((data, context) => {

  return utils.GetEntity("events", data.eventID)
})


exports.GetAllEvents = functions.https.onCall(async (data, context) => {

  const eventsRef = db.collection('events');
  let arr = []
  const snapshot = await eventsRef.get();

  snapshot.forEach(doc => {

    let tempObj = doc.data()
    tempObj.id = doc.id
    arr.push(tempObj)

  });
  return arr;

})