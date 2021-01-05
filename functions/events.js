const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();

exports.CreateEvent = functions.https.onCall((data, context) => {
// validate data
    const event = data;
    
    let batch = db.batch();
    
    let setEvent = db.collection('events').doc();
    
    batch.set(setEvent, JSON.parse(JSON.stringify(event)));
    
    return batch.commit().then(function () {
        return true;
    }).catch(err => {
        return err
    })  
})

exports.UpdateEvent =  functions.https.onCall(async(data, context)  =>  {
   
const eventsRef = db.collection('events').doc(data.uid);

const res = await eventsRef.update(data.eventsRef)

console.log('Update: ', res);
})

exports.GetAllEvents = functions.https.onCall(async(data, context)  =>  {

  const eventsRef = db.collection('events');

const snapshot = await eventsRef.get();

snapshot.forEach(doc => {

  console.log(doc.id, '=>', doc.data());

});
 
  
})