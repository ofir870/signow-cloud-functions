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
    
    const orginization = {
        // "orginizationID": context.uid,
        "full-name": data.fullName,
        "email": data.email,
        "code":data.code,
        "phone": data.phone,
        "contact-man":data.contactMan,
        "working-hours": data.workingHours,
        "address": data.address,
        "pricing":data.pricing,
        "start-date":new Date().getTime,
        "credit-bank": data.credit,
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

exports.UpdateOrginization =  functions.https.onCall(async(data, context)  =>  {
   
const orginizationRef = db.collection('orginization').doc(data.uid);

const res = await orginizationRef.update(data.orginization)

console.log('Update: ', res);
})

exports.GetAllOrginizations = functions.https.onCall(async(data, context)  =>  {
    let arr = []
    const orginizationRef = await  db.collection('orginization');
    const snapshot =  await orginizationRef.get() 
    snapshot.forEach(doc=>{
        // console.log(doc.id, '=>', doc.data());
        let tempObj = doc.data()
        tempObj.id = doc.id
    arr.push(tempObj)

})
return arr
// return snapshot;

})


