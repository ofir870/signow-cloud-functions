const functions = require('firebase-functions');
const admin = require('firebase-admin');
const utils = require('./utils')
const db = admin.firestore();

exports.CreateEvent = functions.https.onCall(async (data, context) => {
  // validate data
  // go to customer doc with customer id from the data parameter and 
  // check if orginization as credit to active the event 
  const event = data;

  // get customer doc
  
  const customerData = await utils.GetEntity("users", data.customerId);

  // get orginization credit for validation

  let credit = await utils.GetOrginizationCreditByCode(customerData.code);

// long meeting check and decrease credit
  if (data.length == 60) {
    if (credit >= 1) {
      await utils.DecreaseOrginizationCreditByHour(customerData.code, credit);
    } else{

      return false
    }
  }
// short meeting check and decrease credit
if (data.length == 30) {

  if (credit >= 0.5) {
    await utils.DecreaseOrginizationCreditByHalfHour(customerData.code, credit);

  }else{

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
exports.UpdateEvent = functions.https.onCall(async (data, context) => {

  const eventsRef = db.collection('events').doc(data.uid);

  const res = await eventsRef.update(data.eventsRef)

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

    let tempObj = doc.data()
    tempObj.id = doc.id
    arr.push(tempObj)

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