const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();

exports.CreateInter = functions.https.onCall((data, context) => {

    // if (!(typeof data.certificatedetails === 'string') || data.certificatedetails.length === 0) {
    //     // Throwing an HttpsError so that the client gets the error details.
    //     throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
    //         'one arguments "certificatedetails".');
    // }

    const inter = {
        "interpreter-id": data.uid,
        "certificate-details": '',
        "special": [],
        "avarage-rating": null,
        "hours-of-work": [],
        "score":null,
        "isActive": 20
    }
    let batch = db.batch();
    let setInter = db.collection('inters-data').doc(data.uid);

    batch.set(setInter, JSON.parse(JSON.stringify(inter)));

    // change role of user to Interpreter
    let changeRole = db.collection('users').doc(data.uid);

    batch.set(changeRole, { role: "inter" }, { "merge": true });


    // Commit the batch
    return batch.commit().then(function () {

        return true;
    }).catch(err => {
        return err
    })
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
