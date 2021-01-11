const functions = require('firebase-functions');
const admin = require('firebase-admin');
const utils = require('./utils')
const db = admin.firestore();

// every time user will sign in we will update is sessions array with a new date

exports.UpdateLastLogin = functions.https.onCall((data, context) => {

    const newLastLogin = {

        "lastLogin": admin.firestore.FieldValue.arrayUnion(new Date().getTime())
    }
    return db.collection('users').doc(context.auth.uid).update(newLastLogin);

})
exports.GetUserNameById = functions.https.onCall((data, context) => {
      let user = utils.GetEntity('users',data.id).then(doc=>{
        console.log(doc)
        return doc
      })
      // return user name
      return user.fullName  
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

