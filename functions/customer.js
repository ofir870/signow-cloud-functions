const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();


exports.CreateCustomer = functions.https.onCall((data, context) => {
    
 
    if (!data.customerID) {
        return err + "Missing: customerID"
    }
    if (!data.cardID) {
        return err + "Missing: cardID"
    }
    if (!data.organizationID) {
        return err + "Missing: organizationID"
    }

    const customer = {
        "customer-id": data.customerID,
        "card-id": data.cardID,
        "age": data.age,
        "organizationID": data.organizationID
    }

    let batch = db.batch();

    let setCustomer = db.collection('customers-data').doc(data.customerID);

    batch.set(setCustomer, JSON.parse(JSON.stringify(customer)));

    let changeRole = db.collection('users').doc(data.customerID);

    batch.set(changeRole, { role: "customer" }, { "merge": true });

    return batch.commit().then(function () {
        return true;
    }).catch(err => {
        return err
    })
})

exports.CreateCustomerRating = functions.https.onCall((data, context) => {
    if (!data.customerID || !data.interID || !data.string || !data.rating) {
        return "Missing: data is missing"
    }

    const customerRating = {

        "customerID": data.customerID,
        "interID": data.interID,
        "string": data.string,
        "rating": data.rating
    }

    let batch = db.batch();

    let setRating = db.collection('rating').doc(context.auth.uid);

    batch.set(setRating, JSON.parse(JSON.stringify(customerRating)));
    return batch.commit().then(function () {
        return true;
    }).catch(err => {
        return err
    })

})
 
exports.CheckCustomerCredit = functions.https.onCall(async (data, context) => {
    let credit = await db.collection("organization").doc(data.organizationID).get()
db
    creditLeft = credit.data().hours-bank - credit.data().credit-used

 
    // get all user and get a count of all credits in this month
   

    if (creditLeft <= 0) {
        return "you dont have more credit"
    }
    return `you have book a meeting`
})
