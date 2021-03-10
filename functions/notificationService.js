const functions = require('firebase-functions');
const admin = require('firebase-admin');
const utils = require('./utils')
const db = admin.firestore();

exports.SaveToken = functions.https.onCall((data, context) => {
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
                return db.collection('customers-users').doc(context.auth.uid).set({
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
            }
        }).catch(err => {
            console.log('Error getting document', err);
        });


})