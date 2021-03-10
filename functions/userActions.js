const functions = require('firebase-functions');
const admin = require('firebase-admin');
const utils = require('./utils');
const { auth } = require('firebase-admin');
const { user } = require('firebase-functions/lib/providers/auth');
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
exports.LinkAllIntersWithPhoneNumber = functions.https.onCall(async (data, context) => {

  const customersRef = db.collection('inters-data')

  const snapshot = await customersRef.get();
  if (snapshot.empty) {
    console.log('No matching documents.');
    return;
  }

  snapshot.forEach(doc => {
    let phone = doc.data().phone
    let newPhone = doc.data().phone
    let userRecord;
    phone = phone.toString()

    if (!phone.includes("+972")) {
      // console.log("PDPDPD"+newPhone )
      newPhone = "+972" + parseInt(newPhone)
      // console.log("PDPDPD"+newPhone )
    }
    if (!newPhone) {
      return "Error: no phone to this user" + doc.id
    } else {


      admin.auth().getUser(doc.id)
        .then(async (userRecord) => {

          userRecord = await admin.auth().updateUser(userRecord.uid, { phoneNumber: newPhone })
            .then(function (userRecord) {
              // See the UserRecord reference doc for the contents of `userRecord`.
              console.log("Successfully updated user", userRecord.toJSON());
            })
            .catch(function (error) {
              console.log("Error updating user:", error);
            });
        })
        .catch((error) => {
          console.log('Error fetching user data:', error);
        });
      return userRecord

    }
  });

})


exports.DeleteUserById = functions.https.onCall(async (data, context) => {

  admin.auth().deleteUser(data.uid).then(() => {
    // See the UserRecord reference doc for the contents of userRecord.
    console.log('Successfully deleted user');
  })
    .catch((error) => {
      console.log('Error fetching user data:', error);
    });

})
exports.LinkUserWithPhoneNumber = functions.https.onCall(async (data, context) => {
  let ref = {}
  if (data.role == "customer")
    ref = await db.collection('customers-data').doc(data.uid)
  else {

    ref = await db.collection('inters-data').doc(data.uid)
  }

  const doc = await ref.get();
  console.log(doc)
  if (!doc.exists) {
    console.log('No matching documents.');
    return;
  }


  let phone = doc.data().phone
  let newPhone = doc.data().phone
  let userRecord;
  phone = phone.toString()

  if (!phone.includes("+972")) {
    // console.log("PDPDPD"+newPhone )
    newPhone = "+972" + parseInt(newPhone)
    // console.log("PDPDPD"+newPhone )
  }
  if (!newPhone) {
    return "Error: no phone to this user" + doc.id
  } else {


    admin.auth().getUser(doc.id)
      .then(async (userRecord) => {

        userRecord = await admin.auth().updateUser(userRecord.uid, { phoneNumber: newPhone })
          .then(function (userRecord) {
            // See the UserRecord reference doc for the contents of `userRecord`.
            console.log("Successfully updated user", userRecord.toJSON());
          })
          .catch(function (error) {
            console.log("Error updating user:", error);
          });
      })
      .catch((error) => {
        console.log('Error fetching user data:', error);
      });
    return userRecord

  }
});


exports.GetAuthenticatedUser = functions.https.onCall((data, context) => {
  if (!context.auth) {
    console.log("lalaal")
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

exports.CheckIfPhoneExsits = functions.https.onCall(async (data, context) => {
  const entityRef = db.collection('inters-data');
  const snapshot = await entityRef.where("phone", "==", data.phone).get()
  // return user name
  if (snapshot.empty) {
    const entityRef = db.collection('customers-data');
    const snapshotIn = await entityRef.where("phone", "==", data.phone).get()
    // return user name
    if (snapshotIn.empty) {
      console.log('No matching documents.');
      return false;
    }
  }
  return true


})
exports.CheckIfEventNow = functions.https.onCall(async (data, context) => {
  let snapshot = []
  let link = "empty"
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
  const tenMinute = 1000 * 10 * 60;

  let now = new Date().getTime()
  let nowPlusTenMinute = new Date().getTime() + tenMinute

  let userName = ''
  console.log(new Date().getTime() + tenMinute)
  snapshot.forEach(async doc => {
    if (role == "customer") {
      userName = doc.data().customerName.replace(" ", "-")
    } else {
      userName = doc.data().interName.replace(" ", "-")
    }

    if (doc.data().occupied) {

      if (doc.data().start > now && doc.data().start < nowPlusTenMinute) {
        link = doc.data().link + "&name=" + userName

      }
    }
  })
  if (link != "empty") {
    return link
  } else {
    return "no matched event"
  }
})

exports.HandleLogin = functions.https.onCall(async (data, context) => {
  if (data.isMail) {
    // preform a mail handle login
  }
  if (data.isPhone) {
    // preform a phone handle login
  }
})


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

