const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { constants } = require('buffer');

const db = admin.firestore();


exports.CreateCustomer = functions.https.onCall((data, context) => {
    
    console.log(data)
    if (!data.customerID) {
        return  "Missing: customerID"
    }
    if (!data.cardID) {
        return "Missing: cardID"
    }
    if (!data.orginizationID) {
        return "Missing: orginizationID"
    }

    const customer = {
        "customer-id": data.customerID,
        "card-id": data.cardID,
        "age": data.age,
        "orginization-Id": data.orginizationID
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


exports.GetAllCustomers = functions.https.onCall(async(data, context)  =>  {
  
    const customersRef = db.collection('users')

  const snapshot = await customersRef.where("role","==", "customer").get();
  if (snapshot.empty) {
    console.log('No matching documents.');
    return;
  }  
  
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
    
  }); })


exports.EmailValidation = functions.https.onCall(async(data, context)  =>  {

    const customersRef = db.collection('users')
  
  const snapshot = await customersRef.where("email","==", data.email).get();
  console.log(snapshot.docs)
  if (snapshot.empty) {
    console.log('No matching documents => creating new user ');
  }  
  if (!snapshot.empty) {

    if(snapshot.docs.disabled){
        // update
    
        return "this is a known email with a non-active account "
    } 
    else{
  
        return "this email is taken with an active account"
    }
  }
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
    let credit = await db.collection("orginization").doc(data.orginizationID).get()
db
    creditLeft = credit.data().hours-bank - credit.data().credit-used

 
    // get all user and get a count of all credits in this month
   

    if (creditLeft <= 0) {
        return "you dont have more credit"
    }
    return `you have book a meeting`
})
