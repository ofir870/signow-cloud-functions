const functions = require('firebase-functions');
const admin = require('firebase-admin');
const db = admin.firestore();

// all functions are triggers  
// create, delete , create role
// ON CREATE
// triggerd when user registerd and make a new user in fire-store-DB 

exports.OnUserSignUp = functions.auth.user().onCreate((user) => {

    // check if email is taken 
    // yes => check if the disabled is
    // no  => send err massage 
    // yes => update the doc with the user data.
    // no: go on update the doc with the user data.


    const data = {
        "phone": '',
        "address": '',
        'identityNumber': '',
        'password': '',
        "fullName": '',
        "birth-date": '',
        "disabled": false,
        "role": '',
        "code":'',
        "id": user.uid,
        "email": user.email,
        "timestamp":{"craetion":new Date().getTime, "lastLogin":null,"activity":null}
    }
    
    return db.collection('users').doc(user.uid).set(JSON.parse(JSON.stringify(data)));
});

// // onCreate customer will change is user role to customer
// exports.ChangeRoleCustomer = functions.firestore.document('customer-data/{userId}').onCreate((snap, context) => {
//     return (
//         db
//             .collection('users')
//             .doc(snap.data().customerID)
//             .update({ role: "customer" })
//     )
// })
// // onCreate inter will change is user role to inter
// exports.ChangeRoleInter = functions.firestore.document('inters-data/{userId}').onCreate((snap, context) => {

//     return (
//         db
//             .collection('users')
//             .doc(snap.data().interID)
//             .update({ role: "inter" })
//     )
// })

exports.OnDelete = functions.auth.user().onDelete(async(user) => {
    const data = {
        "email": user.email,
        "disabled": true,
        "id": user.uid
    }    

   let snapshot = await db.collection('users').doc(user.id)
    role = snapshot.data().role;
    let batch = db.batch();

    if(role === "customer"){
        let deleteCustomer = db.collection('customers-data').doc(user.uid)
    
        batch.delete(deleteCustomer);
    }
    if(role === "inter"){
        let deleteInter = db.collection('inters-data').doc(user.uid)
    
        batch.delete(deleteInter);
    }

    // if(role === "orginization"){
    //     let deleteInter = db.collection('inters-data').doc(user.uid)
    
    //     batch.delete(deleteInter);
    // }
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
