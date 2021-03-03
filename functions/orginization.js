const functions = require('firebase-functions');
const admin = require('firebase-admin');
const utils = require('./utils');

const db = admin.firestore();

exports.CreateOrginization = functions.https.onCall((data, context) => {

    if (!data.fullName) {
        return "Missing: fullName"
    }
    if (!data.code) {
        return "Missing: code"
    }
    if (!data.credit) {
        return "Missing: credit"
    }
    if (!data.email) {
        return "Missing: email"
    }
    if (!data.phone) {
        return "Missing: phone"
    }
    if (!data.contactMan) {
        return "Missing: contactMan"
    }
    if (!data.workingHours) {
        return "Missing: workingHours"
    }
    if (!data.address) {
        return "Missing: address"
    }
    if (!data.pricing) {
        return "Missing: pricing"
    }
    const orginization = {
        "fullName": data.fullName,
        "email": data.email,
        "code": data.code,
        "phone": data.phone,
        "contactMan": data.contactMan,
        "workingHours": data.workingHours,
        "address": data.address,
        "pricing": data.pricing,
        "startDate": new Date().getTime,
        "credit": data.credit,
        "creditUsed": 0
    }

    let batch = db.batch();

    let setOrginization = db.collection('orginization').doc();

    batch.set(setOrginization, JSON.parse(JSON.stringify(orginization)));

    return batch.commit().then(function () {
        return true;
    }).catch(err => {
        return err
    })
})



exports.CheckOrginizationAbility = functions.https.onCall(async (data, context) => {
    let code;
    const getCode = await utils.CheckUserCodeInner(context.auth.uid).then(c => {
        code = c
    })

    let orgRef = db.collection('orginization')
    let snapshot = await orgRef.where("code", "==", code).get()
    if (snapshot.empty) {
        console.log('No matching documents.');
        return;
    }
    let answer;
    snapshot.forEach(doc => {
        answer = doc.data().ability
    })

    return answer
})
exports.GetAllOrginizationCustomers = functions.https.onCall(async (data, context) => {
    let arr = [];
    const customersRef = db.collection('customers-data')

    const snapshot = await customersRef.where("code", "==", data.code).get();

    if (snapshot.empty) {
        console.log('No matching user documents.');
        return;
    }
    snapshot.forEach(doc => {

        arr.push(doc.data())
    });
    return arr
})
exports.UpdateOrginization = functions.https.onCall(async (data, context) => {

    const orginizationRef = db.collection('orginization').doc(data.orginizationID);

    const res = await orginizationRef.update(data.orginization)

    console.log('Update: ', res);
})

exports.GetAllOrginizations = functions.https.onCall(async (data, context) => {
    let arr = []
    const orginizationRef = await db.collection('orginization');
    const snapshot = await orginizationRef.get()
    snapshot.forEach(doc => {
        // console.log(doc.id, '=>', doc.data());
        arr.push(doc.data())

    })
    return arr
    // return snapshot;

})

exports.GetOrginizationNameByCode = functions.https.onCall(async (data, context) => {

    const orgRef = db.collection("orginization");
    const snapshot = await orgRef.where("code", "==", data.code).get();
    let name;

    if (snapshot.empty) {
        console.log("the code in not valid");
        return false
    } else {

        snapshot.forEach(doc => {
            name = doc.data().fullName
        });

        return name
    }

})


exports.GetOrginizationCreditByCode = functions.https.onCall(async (data, context) => {
    // מקבל קוד
    // משיג את הקרדיט מהקוד
    return utils.GetOrginizationCreditByCode(data.code)
})
//