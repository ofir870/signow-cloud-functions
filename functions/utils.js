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

exports.GetAllEntity = (async (ref) => {

  const entityRef = db.collection(ref);

  const snapshot = await entityRef.get();
  const allEntities = []
  snapshot.forEach(doc => {
    allEntities.push({id:doc.id,doc:doc.data()})
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
          
          // get the event by
          //call this function when the value isOccurpied in event change 
          // if true: send message to both client and inter about the meeting
          // if false: send a message about meeting cancellation  
          // exports.SendWhatsApp = functions.https.onCall((data, context) => {

          //     const accountSid = 'AC2a9db3c7279992b89d19f4f3e7a19933'; 
          //   const authToken = '454ed73a5b64ce377e1c5cde6fd821cd '; 
          //   const client = require('twilio')(accountSid, authToken); 
          //    if(data.phone.empty){
          //      return console.log("the phone is missing");
          //     }
          //     //  validate
          //     // is number
          //     //  min length
          //     // max length
               
          //      client.messages 
          //      .create({ 
          //        body: 'Your appointment is coming up on July 21 at 3PM', 
          //        from: 'whatsapp:+14155238886',       
          //        to: `whatsapp:${data.phone}` 
          //       }) 
          //       .then(message => console.log(message.sid)) 
          //       .done();
          //       })
          // exports.ImportToJSON = functions.https.onCall((data, context) => {

            // backup('users').then((dataSend) =>
            // console.log(JSON.stringify(dataSend))
            // )

            // })
            // })
            // exports.ExcelToJSON = functions.https.onCall((data, context) => {
            //     const xlsxFile = require('read-excel-file/node');

            //     xlsxFile('../Test.xlsx').then((rows) => {


            //     })
            