const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();
exports.CreateOrganization = functions.https.onCall((data, context) => {
    
    if (!data.fullName) {
        return "Missing: fullName"
    }
    if (!data.organizationID) {
        return "Missing: organizationID"
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
    if (!data.cantactMan) {
        return "Missing: cantactMan"
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
 
    const organization = {
        "organizationID": data.organizationID,
        "full-name": data.fullName,
        "email": data.email,
        "code":data.code,
        "phone": data.phone,
        "contact-man":data.cantactMan,
        "working-hours": data.workingHours,
        "address": data.address,
        "pricing":data.pricing,
        "start-date":new Date().getTime,
        "credit-bank": data.credit,
        "credit-used": 0 
    }

    let batch = db.batch();

    let setOrganization = db.collection('organization').doc(data.organizationID);

    batch.set(setOrganization, JSON.parse(JSON.stringify(organization)));

    return batch.commit().then(function () {
        return true;
    }).catch(err => {
        return err
    })

})