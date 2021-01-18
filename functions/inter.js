const functions = require('firebase-functions');
const admin = require('firebase-admin');
const utils = require('./utils')
const db = admin.firestore();

exports.CreateInter = functions.https.onCall((data, context) => {

    // if (!(typeof data.certificatedetails === 'string') || data.certificatedetails.length === 0) {
    //     // Throwing an HttpsError so that the client gets the error details.
    //     throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
    //         'one arguments "certificatedetails".');
    // }

    const inter = {
        "interpreterID": data.interID,
        "desc": data.desc,
        "avarageRating": null,
        "hoursOfWork": [],
        "cardID": data.cardID,
        "phone": data.phone,
        "address": data.address,
        'identityNumber': data.identityNumber,
        'password': data.password,
        "fullName": data.fullName,
        "birthDate": data.birthDate,
        "disabled": false,
        "role": "inter"

    }

    let batch = db.batch();
    let setInter = db.collection('inters-data').doc(data.interID);

    batch.set(setInter, JSON.parse(JSON.stringify(inter)));

    // change role of user to Interpreter
    let changeRole = db.collection('users').doc(data.interID);

    batch.set(changeRole, { "role": "inter" }, { "merge": true });

    // Commit the batch
    return batch.commit().then(function () {

        return true;
    }).catch(err => {
        return err
    })

})


exports.InterBookEvent = functions.https.onCall(async (data, context) => {

    const eventsRef = await db.collection('events').doc(data.eventID)
    const doc = await eventsRef.get();
    let docUpdated = {}
    if (!doc.exists) {
        console.log('No such document!');
    } else {
      
        if (doc.data().occupied) {
            return false
        }
        else {
            docUpdated = doc.data()
            docUpdated.occupied = true
            docUpdated.interId = data.interID

            const res = await eventsRef.update(docUpdated)
            // TODO need to send email/phone-message to both  customer and inter with meeting details
            return true
        }
    }
})
exports.GetAllInters = functions.https.onCall(async (data, context) => {

    const intersRef = db.collection('users')

    const snapshot = await intersRef.where("role", "==", "inter").get();
    if (snapshot.empty) {
        console.log('No matching documents.');
        return;
    }

    snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
    });
})


exports.SendInterToServer = functions.https.onCall((data, context) => {
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
            'while authenticated.');
    }

    let user = db.collection('users').doc(context.auth.uid)
    let getDoc = user.get()
        .then(doc => {
            if (doc.data().role === "inter") {

                return db.collection('inters-users').doc(context.auth.uid).set({
                    "token": data.token
                }, { merge: true })

                    .then(function (response) {
                        console.log('Successfully subscribed to topic:', response);
                        return (true)
                    })
                    .catch(function (error) {
                        console.log('Error subscribing to topic:', error);
                        return (false)
                    })
            } else {

                return false
            }
        }).catch(err => {
            console.log('Error getting document', err);
        });

})

exports.interAnswer = functions.https.onCall((data, context) => {
    if (data.requestID) {

        // go to video metadata by data.videoId and check if the call is already answered
        return db.collection("video-metadata").doc(data.requestID).get().then(res => {

            // if false change isAnswered to true
            // start-time: new Date().getTime()0
            if (res.data().isAnswered === false) {

                db.collection('video-metadata').doc(data.requestID).set({ "isAnswered": true, "startTime": new Date().getTime(), "endTime": new Date().getTime() }, { "merge": true })
                return true
            }
            else {
                return db.collection("video-metadata").doc(data.requestID).get().then(res => {
                    return res.data().startTime
                }).catch(err => {
                    return err
                })
            }
        }
        ).catch(err => {
            return err
        })
    } else {
        return "you have called interAnswer : REQUESTID IS MISSING"
    }
})

exports.GetInterNameById = functions.https.onCall(async (data, context) => {
    let user = await utils.GetEntity('inters-data', data.interID).then(doc => {
        return doc
    })
    // .catch(err=>console.log(err))
    return user.fullName
})