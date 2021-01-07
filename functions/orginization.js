const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();

exports.CreateOrginization = functions.https.onCall((data, context) => {

    if (!data.fullName) {
        return "Missing: fullName"
    }
    // if (!data.orginizationID) {
    //     return "Missing: orginizationID"
    // }
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
        "full-name": data.fullName,
        "email": data.email,
        "code": data.code,
        "phone": data.phone,
        "contact-man": data.contactMan,
        "working-hours": data.workingHours,
        "address": data.address,
        "pricing": data.pricing,
        "start-date": new Date().getTime,
        "credit": data.credit,
        "credit-used": 0
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

// get all customer of one orginization by code in customers-data
// send code in data => get all customer-data by code => get all users by customerID   
exports.GetAllOrginizationCustomers = functions.https.onCall(async (data, context) => {
    let arr = [];
    const customersRef = db.collection('users')

    const snapshot = await customersRef.where("orginization", "==", data.orginizationId).get();

    if (snapshot.empty) {
        console.log('No matching user documents.');
        return;
    }
    snapshot.forEach(doc => {
        let tempObj = doc.data()
        arr.push(tempObj)
    });
    return arr
})
exports.UpdateOrginization = functions.https.onCall(async (data, context) => {

    const orginizationRef = db.collection('orginization').doc(data.uid);

    const res = await orginizationRef.update(data.orginization)

    console.log('Update: ', res);
})

exports.GetAllOrginizations = functions.https.onCall(async (data, context) => {
    let arr = []
    const orginizationRef = await db.collection('orginization');
    const snapshot = await orginizationRef.get()
    snapshot.forEach(doc => {
        // console.log(doc.id, '=>', doc.data());
        let tempObj = doc.data()
        tempObj.id = doc.id
        arr.push(tempObj)

    })
    return arr
    // return snapshot;

})


