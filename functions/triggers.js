const functions = require('firebase-functions');
const admin = require('firebase-admin');
const db = admin.firestore();
const utils = require("./utils");
const messages = require('./messages')
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

exports.OnDeleteODMEvent = functions.firestore.document('on-demand-events/{id}')
    .onDelete(async (snap, context) => {
        const data = {
            "customerID": snap.data().customerID,
            "requestTime": snap.data().requestTime,
            'title': snap.data().title
        };
        const res = await db.collection('cancelled-odm').doc().set(data).then(doc => {
            console.log(doc)
        });
    })

exports.OnUpdateODMEvent = functions.firestore.document('on-demand-events/{id}')
    .onUpdate(async (snap, context) => {

            if(snap.data().state == "done"){
                let setEvent = await db.collection('events-old').doc(snap.id).set(snap.data())
                // delete event from events
                let deleteEvent = await db.collection('events').doc(snap.id).delete()
            }
    })

exports.OnCreateEvent = functions.firestore.document('on-demand-events/{id}')
    .onCreate(async (snap, context) => {

        utils.UpdateEntity(snap.id, 'on-demand-events', 'link', `https://signowvideo.web.app/?roomName=${snap.id}`).then(doc => {
            console.log(doc)
        })
        // update id inside the collection
        const eventRef = await db.collection('on-demand-events').doc(snap.id)
        const res = eventRef.update({ "eventID": snap.id });

        // get inter that sign in to the sms service
        const intersRef = db.collection('inters-odm')
        const snapshot = await intersRef.get();
        if (snapshot.empty) {
            console.log('No matching documents.');
            return;
        }
        // check if the event is still pending if yes send messages
        if (snap.data().state == "pending") {
            // send SMS to all inters in this forEach
            snapshot.forEach(doc => {
                // TODO sort inters by working hours in inters-odm collection
                const inter = db.collection('inters-data').doc(doc.id).get()

                // will print all inters in inters-odm list
                inter.then(doc => {

                    let recipient = {
                        name: doc.data().fullName,
                        phone: doc.data().phone,
                        link: `https://signplus-295808.web.app/#competition/?roomName=${snap.id}&interName=${doc.data().fullName}&interID=${doc.id}`,
                        customerName: snap.data().customerName
                    }

                    messages.SendSMSOnRequestODMEvent(recipient)
                })
            });
        }

    })
        // TODO check if the event state is still pending
        // TODO if yes send SMS to all inters that in the onDemand service 
        // TODO transactions test
        //     try {
        //         const res = await db.runTransaction(async t => {
        //           const inter = doc.id;
        //           if (newPopulation <= 1000000) {
        //             await t.update(cityRef, { population: newPopulation });
        //             return `Population increased to ${newPopulation}`;
        //           } else {
        //             throw 'Sorry! Population is too big.';
        //           }
        //         });
        //         console.log('Transaction success', res);
        //       } catch (e) {
        //         console.log('Transaction failure:', e);
        //       }



            // console.log(arr)
        // return arr
        // console.log(answer)
        // return getInters().then(list => {
        //     if (list.length === 0)
        //         return "No-Availability"
        //     list.sort()
        //     list = list.map(inter => inter.token)
        //     list = list.filter(function (el) {
        //         return el !== null;
        //     });
        //     return _send(list, context)
        // })
//     function _send(list, context) {

//     var i = 0;
//     var message = {
//         notification: {
//             title: "בקשת תרגום",
//             body: context.auth.uid
//         },
//         webpush: {
//             fcm_options: {
//                 link: requestID
//             }
//         }
//     };
// }
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


//         exports.onUpdateEvent = functions.database.ref('/events/{eventID}')
// .onUpdate((change) => {
//     const observer = db.collection('cities').where('state', '==', 'CA')
//   .onSnapshot(querySnapshot => {
//     querySnapshot.docChanges().forEach(change => {
//       if (change.type === 'added') {
//         console.log('New city: ', change.doc.data());
//       }
//       if (change.type === 'modified') {
//         console.log('Modified city: ', change.doc.data());
//       }
//       if (change.type === 'removed') {
//         console.log('Removed city: ', change.doc.data());
//       }
//     });
//   });
//     const after = change.after  // DataSnapshot after the change
//     return after
// })