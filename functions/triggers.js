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

exports.OnCreateEvent = functions.firestore.document('on-demand-events/{id}')
    .onCreate((snap, context) => {
        
        console.log("on-demand-events")
        console.log(context)
        console.log(snap)
        async function getInters() {
            const snapshot = await admin.firestore().collection('inters-data').get()
            return snapshot.docs.map(doc => doc.data());
        }    
        return getInters().then(list => {
            if (list.length === 0)
                return "No-Availability"
            list.sort()    
            list = list.map(inter => inter.token)
            list = list.filter(function (el) {
                return el !== null;
            });    
            return _send(list, context)
        }) 


    })
    function _send(list, context) {
    var i = 0;
    var message = {
        notification: {
            title: "בקשת תרגום",
            body: context.auth.uid
        },
        webpush: {
            fcm_options: {
                link: requestID
            }
        }
    };
}
// exports.OnCreateEvent = functions.firestore.document('events/{Id}')
//     .onCreate((snap, context) => {

//       const newValue = snap.data();

//       // access a particular field as you would any JS property
//       const inter = newValue.interID;
//       const cus = newValue.customerID;
//             console.log(inter)
//             console.log(cus)
//     });



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


        exports.onUpdateEvent = functions.database.ref('/events/{eventID}')
.onUpdate((change) => {
    const observer = db.collection('cities').where('state', '==', 'CA')
  .onSnapshot(querySnapshot => {
    querySnapshot.docChanges().forEach(change => {
      if (change.type === 'added') {
        console.log('New city: ', change.doc.data());
      }
      if (change.type === 'modified') {
        console.log('Modified city: ', change.doc.data());
      }
      if (change.type === 'removed') {
        console.log('Removed city: ', change.doc.data());
      }
    });
  });
    const after = change.after  // DataSnapshot after the change
    return after
})