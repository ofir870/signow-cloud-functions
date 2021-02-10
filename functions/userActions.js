const functions = require('firebase-functions');
const admin = require('firebase-admin');
const utils = require('./utils');
const { auth } = require('firebase-admin');
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




exports.GetAuthenticatedUser = functions.https.onCall((data, context) => {
  if (!context.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
      'while authenticated.');
  } else {
    let doc = {
      "userName": context.auth.userName,
      "userID": context.auth.uid,
      "email": context.auth.email
    }
    return doc
  }

})

exports.GetNameById = functions.https.onCall(async (data, context) => {
  // get inter data names
  // get customers data names
  const userRef = db.collection('users').doc(data.userID);
  const doc = await userRef.get();
  if (!doc.exists) {

    console.log('No such document!');
  } else {
    return doc.data().email

  }


})
exports.GetPhoneById = (async (uid) => {
  let role = ''
  let getRole = await utils.CheckUserRoleInner(uid).then(doc => {
    role = doc


  })
  if (role == "customer") {

    let customer = await utils.GetEntity('customers-data', uid).then(doc => {
      return doc
    })
    // return user name
    return customer.phone
  }

  if (role == "inter") {

    let inter = await utils.GetEntity('inters-data', uid).then(doc => {
      return doc
    })
    // return user name
    return inter.phone
  }
})

exports.CheckIfEventNow = functions.https.onCall(async (data, context) => {
  let snapshot = []
  let link = ""
  let role = ''
  let getRole = await utils.CheckUserRoleInner(data.uid).then(doc => {
    role = doc
  })

  if (role == "customer") {

    const entityRef = db.collection('events');
    snapshot = await entityRef.where("customerID", "==", data.uid).get()

  }
  if (role == "inter") {
    const entityRef = db.collection('events');
    snapshot = await entityRef.where("interID", "==", data.uid).get()

  }

  const TenMin = 1000 * 10 * 60;
  let now = new Date().getTime()
  let nowPlusHour = new Date().getTime() + TenMin
  let count = 0
  
  snapshot.forEach(async doc => {

    // get phone by customer id

    if (doc.data().occupied) {
      if (doc.data().start - new Date().getTime() < TenMin) {
        link = doc.data().link
      }
    }
  })
  if (link.length > 4) {
    return link
  } else {
    return "no matched event"
  }
})

exports.UserLogin = functions.https.onCall(async (data, context) => {
  if (data.isMail) {
    // preform a mail login
  }
  if (data.isPhone) {
    // preform a phone login
  }
})
// every time user will sign in we will update is sessions array with a new date

exports.UpdateLastLogin = functions.https.onCall((data, context) => {

  const newLastLogin = {

    "lastLogin": admin.firestore.FieldValue.arrayUnion(new Date().getTime())
  }
  return db.collection('users').doc(context.auth.uid).update(newLastLogin);

})


exports.ResetPasswordLink = functions.https.onCall(async (data, context) => {
  const resetLink = await admin.auth().generatePasswordResetLink('ofirofir870@gmail.com')
  return resetLink
})

exports.GetPasswordByPhone = functions.https.onCall((data, context) => {

  return utils.getPasswordByPhone(data.phone)
})
exports.GetPasswordByEmail = functions.https.onCall((data, context) => {

  return utils.getPasswordByEmail(data.email)
})

exports.UpdatePassword = functions.https.onCall((data, context) => {

  return utils.UpdatePassword(data.newPassword, data.uid)
})

exports.CheckUserRole = functions.https.onCall((data, context) => {

  const userRef = db.collection('users').doc(data.uid);
  let getDoc = userRef.get().then(doc => {

    if (!doc.exists) {
      console.log('No such document!');
      return 'false'
    } else {
      return doc.data().role
    }
  })
    .catch(err => {
      console.log('Error getting documentL uid is wrong', err);

    })
  return getDoc
})

