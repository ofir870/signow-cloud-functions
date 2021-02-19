const functions = require('firebase-functions');
const admin = require('firebase-admin');
// import xlsxFile from 'read-excel-file'

const db = admin.firestore();
const { backup, backups, initializeApp, restore } = require('firestore-export-import')

exports.UpdateEntity = (async (uid, ref, key, val) => {
  let obj = {}
  obj[key] = val
  const entityRef = db.collection(ref).doc(uid);

  const res = await entityRef.update({[key]:val})

  console.log('Update: ', res);

})

exports.UpdateAllCollection = (async (ref, key, val) => {
  // get collecation by ref 
  // preforn foreach on the snapshot
  // update each doc with key and val

  db.collection(ref).get().then(function (querySnapshot) {
    querySnapshot.forEach(function (doc) {
      doc.ref.update({
        [key]:val
      });
    });
  });

})


exports.UpdatePassword = (async (newPassword, uid) => {

  console.log('start')

  const userRef = db.collection('users').doc(uid);

  let update = userRef.get().then(async doc => {

    if (!doc.exists) {
      console.log('No such document!');
      return 'false'
    } else {
      console.log(doc.data().role)
      if (doc.data().role == "inter") {
        const interRef = db.collection('inters-data').doc(uid);
        const snapshot = await interRef.update({ "password": newPassword });
        console.log("update password inter" + newPassword)
      }

      if (doc.data().role == "customer") {
        const cusRef = db.collection('customers-data').doc(uid);
        const snapshot = await cusRef.update({ "password": newPassword });
        console.log("update password customer" + newPassword)
      }

      return newPassword
    }
  })
    .catch(err => {
      console.log('Error getting documentL uid is wrong', err);

    })

  return update
})

exports.GetAllEntity = (async (ref) => {

  const entityRef = db.collection(ref);

  const snapshot = await entityRef.get();
  const allEntities = []
  snapshot.forEach(doc => {
    allEntities.push({ id: doc.id, doc: doc.data() })
  });
  return allEntities
})
exports.GetEntity = (async (ref, id) => {

  const cityRef = db.collection(ref).doc(id);
  const doc = await cityRef.get();
  if (!doc.exists) {
    console.log('No such document!' + "GetEntity");
    return false
  } else {
    return doc.data()
  }
})

exports.IsTimeValid = functions.https.onCall(async (data, context) => {
  //  validate time if now is between 09:00 to 12:00 
  //  if true "isTimeValid" true 
  //  else "isTimeValid" false
  let now = new Date()
  var beginningTime = moment('9am', 'h');
  var endTime = moment('12am', 'h');
  let isTimeValid = true

  if (!beginningTime.isBefore(now) || !endTime.isAfter(now)) {
    isTimeValid = false

  }

  return isTimeValid
})
exports.CheckUserCodeInner = (uid) => {

  const userRef = db.collection('users').doc(uid);
  let getCode = userRef.get().then(doc => {

    if (!doc.exists) {
      console.log('No such document!');
      return 'false'
    } else {
      return doc.data().code
    }
  })
    .catch(err => {
      console.log('Error getting documentL uid is wrong', err);

    })

  return getCode
}

exports.CheckUserRoleInner = (uid) => {

  const userRef = db.collection('users').doc(uid);
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
}
exports.GetEntityValue = functions.https.onCall(async (data, context) => {

  const cityRef = db.collection(data.ref).doc(data.id);
  const doc = await cityRef.get();
  if (!doc.exists) {
    console.log('No such document!' + "GetEntity");
    return false
  } else {

    return doc.data().then(doc => {
      return doc[data.value]
    })
  }
})

exports.GetOrginizationCreditByCode = (async (code) => {

  const orgRef = db.collection("orginization");
  const snapshot = await orgRef.where("code", "==", code).get();
  let credit;

  if (snapshot.empty) {
    console.log("the code in not valid");
    return false
  } else {

    snapshot.forEach(doc => {
      credit = doc.data().credit
    });

    return credit
  }
})


exports.DecreaseOrginizationCreditByHalfHour = (async (code, credit) => {
  console.log(code + "code")
  console.log(credit + "credit")
  let calc = credit - 0.5
  const orgRef = await db.collection("orginization").where("code", "==", code).get()

  for (const doc of orgRef.docs) {
    await doc.ref.update({ credit: calc });
  }

})

exports.DecreaseOrginizationCreditByHour = (async (code, credit) => {

  let calc = credit - 1
  const orgRef = await db.collection("orginization").where("code", "==", code).get()

  for (const doc of orgRef.docs) {
    await doc.ref.update({ credit: calc });
  }
})
exports.RaiseOrginizationCreditByHalfHour = (async (code, credit) => {

  let calc = credit - 0.5
  const orgRef = await db.collection("orginization").where("code", "==", code).get()

  for (const doc of orgRef.docs) {
    await doc.ref.update({ credit: calc });
  }

})

exports.RaiseOrginizationCreditByHour = (async (code, credit) => {

  let calc = credit + 1
  const orgRef = await db.collection("orginization").where("code", "==", code).get()

  for (const doc of orgRef.docs) {
    await doc.ref.update({ credit: calc });
  }
})

exports.GetDocParam = (async (ref, id, param) => {

  const cityRef = db.collection(ref).doc(id);
  const doc = await cityRef.get();
  if (!doc.exists) {
    console.log('No such document!');
  } else {
    console.log('Document data:', doc.data());
    return doc.data()
  }
})



exports.UpdateOrginizationCredit = (async (code, credit) => {

  const orgRef = db.collection("orginization");
  const snapshot = await orgRef.where("code", "==", code).update({ "credit": credit });
})

exports.CodeValidation = functions.https.onCall(async (data, context) => {

  const orgsRef = db.collection('orginization')

  const snapshot = await orgsRef.where("code", "==", data.code).get();

  if (snapshot.empty) {
    return false
  }
  return true

})



exports.getPasswordByPhone = (async (phone) => {

  const customerRef = db.collection("customers-data")
  let password = ""
  const customerSnapshot = await customerRef.where("phone", "==", phone).get()
  console.log(phone)
  console.log(!customerSnapshot.empty + ": 1")
  if (!customerSnapshot.empty) {

    customerSnapshot.forEach(doc => {
      console.log(doc.data().password)
      password = doc.data().password
    });
  }

  const interRef = db.collection("inters-data")
  const interSnapshot = await interRef.where("phone", "==", phone).get()
  console.log(!customerSnapshot.empty + ": 2")
  if (!interSnapshot.empty) {
    interSnapshot.forEach(doc => {
      console.log(doc.data().password)
      password = doc.data().password
    });
  }
  return password
})

exports.getPasswordByEmail = (async (email) => {

  const userRef = db.collection("users")
  let password = ""
  const customerSnapshot = await userRef.where("email", "==", email).get()

  if (!customerSnapshot.empty) {
    customerSnapshot.forEach(async doc => {
      let customerData = await this.GetEntity("customers-data", doc.id)
      password = customerData.password
    });
  }
  return password
})
// exports.ValidatePhoneNumber = ((data) => {
//   var phoneno = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
//   console.log(phoneno)
//   console.log(data)
//   if(data.match(phoneno)) {
//     return true;
//   }  
//   else {  
//     return false;
//   }
// })


// exports.ValidatePhone = (phone) => {

//   let areaCode = '+972 ';
//   areaCode += phone.substring(1, 4) + ' ';
//   print(areaCode);
//   areaCode += phone.substring(4, 7) + ' ';
//   print(areaCode);
//   areaCode += phone.substring(7);
//   print(areaCode);

//   return areaCode;
// }
// exports.GetDocParam = (async(ref,id,param)  =>  {

  //   const cityRef = db.collection(ref).doc(id);
  //   const doc = await cityRef.get();
  //   if (!doc.exists) {
    //     console.log('No such document!');
    //   } else {
      //     console.log('Document data:', doc.data());
      //    return doc.data()
      //   }
      // })

      // exports.GetUsersFromJson = functions.https.onRequest((req, res) => {
        //     var request = require('../usersTest.json'); 
        //     restore(request, {
          //         dates: ['date1', 'date1.date2', 'date1.date2.date3'],
          //         geos: ['location', 'locations'],
          //         refs: ['refKey', 'arrayRef'],
          //       })

          //    });


          //   exports.ExcelToJSON = functions.https.onCall((data, context) => {
          //       const xlsxFile = require('read-excel-file/node');

          //       xlsxFile('../Test.xlsx').then((rows) => {


          //       })



          // function checkTime(start) {
          //   // get start time of event and check if date now - 10 minute
          //   //  is smaller then start 
          //     const minute = 1000 * 10 * 60;
          //     const hour = 1000 * 60 * 60;
          //     let now = new Date().getTime()
          //     let nowMinusMinute = new Date().getTime() - temMinute
          //     let nowPlusHour = new Date().getTime() + Hour

          //     if (start > nowMinusMinute&&start<nowPlusHour) {
          //       return true

          //     } else {
          //       return false
          //     }
          //   }