const functions = require('firebase-functions');
const admin = require('firebase-admin');
// import xlsxFile from 'read-excel-file'

const db = admin.firestore();
const { backup, backups, initializeApp, restore } = require('firestore-export-import')

exports.UpdateEntity = (async (data, ref) => {

  const entityRef = db.collection(ref).doc(data.uid);

  const res = await entityRef.update(data.orginization)

  console.log('Update: ', res);

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



