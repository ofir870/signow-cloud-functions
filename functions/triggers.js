const functions = require('firebase-functions');
const admin = require('firebase-admin');
const db = admin.firestore();
const utils = require("./utils")
// all functions are triggers  
// create, delete , create role
// ON CREATE
// triggerd when user registerd and make a new user in fire-store-DB 

exports.OnUserSignUp = functions.auth.user().onCreate(async (user) => {
    let data = {}
    // get userById
    const userDoc = await utils.GetEntity("users", user.uid).then(doc => {

        return doc
    })
    // check if doc extist 
    console.log(userDoc == false)
    if (userDoc == false) {
        
        console.log("data with code and role ")
        data = {
            "phone": '',
            "address": '',
            'identityNumber': '',
            'password': '',
            "fullName": '',
            "birth-date": '',
            "disabled": false,
            "code": "",
            "role": "",
            "id": user.uid,
            "email": user.email,
            "timestamp": { "craetion": new Date().getTime, "lastLogin": null, "activity": null }

        }

    }
    else {
        // yes change data obj to be without role and code
        console.log("data without code and role ")
        data = {
            "phone": '',
            "address": '',
            'identityNumber': '',
            'password': '',
            "fullName": '',
            "birth-date": '',
            "disabled": false,
            "code": userDoc.code,
            "role": userDoc.role,
            "id": user.uid,
            "email": user.email,
            "timestamp": { "craetion": new Date().getTime, "lastLogin": null, "activity": null }

        }
    }



    return db.collection('users').doc(user.uid).set(JSON.parse(JSON.stringify(data)));
});
exports.OnDelete = functions.auth.user().onDelete(async (user) => {

    let snapshot = await db.collection('users').doc(user.uid)

    const doc = await snapshot.get();
    if (!doc.exists) {
        console.log('No such document!');
    } else {
        role = doc.data().role;

        let batch = db.batch();

        console.log("role:" + role)
        if (role == "customer") {
            let deleteCustomer = db.collection('customers-data').doc(user.uid)

            batch.delete(deleteCustomer);
            console.log("customer-data deleted")
        }
        if (role == "inter") {
            let deleteInter = db.collection('inters-data').doc(user.uid)

            batch.delete(deleteInter);
            console.log("inter-data deleted")
        }

        let setUser = db.collection('users').doc(user.uid);

        batch.delete(setUser);
        console.log("user Deleted")

        return batch.commit().then(function () {
            return true;
        }).catch(err => {
            return err
        })
    }
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
