const functions = require('firebase-functions');
const admin = require('firebase-admin');
const utils = require('./utils')
const db = admin.firestore();


exports.GetAllNames = functions.https.onCall(async (data, context) => {
  // get inter data names
  // get customers data names
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
// every time user will sign in we will update is sessions array with a new date

exports.UpdateLastLogin = functions.https.onCall((data, context) => {

    const newLastLogin = {

        "lastLogin": admin.firestore.FieldValue.arrayUnion(new Date().getTime())
    }
    return db.collection('users').doc(context.auth.uid).update(newLastLogin);

})

exports.UpdatePassword = functions.https.onCall((data,context)=>{

  console.log("end")
  return utils.UpdatePassword(data.newPassword,data.uid)
})

exports.CheckUserRole = functions.https.onCall((data, context) => {
  
    const userRef = db.collection('users').doc(data.uid);
    let getDoc = userRef.get().then(doc =>{
      
        if (!doc.exists) {
            console.log('No such document!');
            return 'false'
          } else {
            console.log(doc.data().role)
            return doc.data().role
          }
        })
        .catch(err => {
          console.log('Error getting documentL uid is wrong', err);
    
    })
    return getDoc
})

