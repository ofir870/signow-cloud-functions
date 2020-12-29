const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();

// every time user will sign in we will update is sessions array with a new date

exports.UpdateLastLogin = functions.https.onCall((data, context) => {

    const newLastLogin = {

        "lastLogin": admin.firestore.FieldValue.arrayUnion(new Date().getTime())

    }

    return db.collection('users').doc(context.auth.uid).update(newLastLogin);


})