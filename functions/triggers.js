const functions = require('firebase-functions');
const admin = require('firebase-admin');
const db = admin.firestore();

// all functions are triggers  
// create, delete , create role
// ON CREATE
// triggerd when user registerd and make a new user in fire-store-DB 

exports.OnUserSignUp = functions.auth.user().onCreate((user) => {

    const data = {
        "full-name": user.displayName,
        "user-name": " " ,
        "birth-date": " ",
        "disabled": user.disabled,
        "role": "",
        "phone": 0,
        "creation": user.metadata.creationTime,
        "creditCard": 0,
        "fullName": null,
        "id": user.uid,
        "email": "",
        "identityNumber": 0,
        "address": {},
        "gender": null,
        "language": "hebrew",
        "orginizatoin":" orginization id",
        "timestamp":{"craetion":new Date().getTime, "lastLogin":null,"activity":null}
    }
    console.log(user)
    return db.collection('users').doc(user.uid).set(JSON.parse(JSON.stringify(data)));
});

// onCreate customer will change is user role to customer
exports.ChangeRoleCustomer = functions.firestore.document('customer-data/{userId}').onCreate((snap, context) => {
    return (
        db
            .collection('users')
            .doc(snap.data().customerID)
            .update({ role: "customer" })
    )
})
// onCreate inter will change is user role to inter
exports.ChangeRoleInter = functions.firestore.document('inters-data/{userId}').onCreate((snap, context) => {

    return (
        db
            .collection('users')
            .doc(snap.data().interID)
            .update({ role: "inter" })
    )
})

exports.OnDelete = functions.auth.user().onDelete((user) => {
    const data = {
        "email": user.email,
        "disabled": true,
        "id": user.uid
    }    
    let batch = db.batch();

    if(user.role==="customer"){
        let deleteCustomer = db.collection('customers-data').doc(user.uid)
        

        batch.delete(deleteCustomer);
    }
    if(user.role==="inter"){
        let deleteInter = db.collection('inters-data').doc(user.uid)
    
        batch.delete(deleteInter);
    }

    let setUser = db.collection('users').doc(user.uid);

    batch.set(setUser, JSON.parse(JSON.stringify(data)));

   

    return batch.commit().then(function () {
        return true;
    }).catch(err => {
        return err
    })



});

//     if(user.role === "customer"){

//     }
//     return db
//         .collection('users')
//         .doc(user.uid)  
//         .set(JSON.parse(JSON.stringify(data)));

// change to onCall when customer-users(uid) row deleted 
// exports.DeleteCustomer = functions.firestore.document('users/{userId}').onDelete((customer)=>{
    // return db
    //         .collection('customers-users')
    //         .doc(customer.uid)
    //         .delete();
// })


