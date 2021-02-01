const functions = require('firebase-functions');
const admin = require('firebase-admin');
const utils = require('./utils')
const db = admin.firestore();
const messages = require("./messages")
exports.CreateInter = functions.https.onCall((data, context) => {

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
    try {
    const eventsRef = await db.collection('events').doc(data.eventID)
    const doc = await eventsRef.get();

    // get Name
    const interData = await utils.GetEntity("inters-data", context.auth.uid);

    const docUpdated = {
        interName :interData.fullName,
        occupied : true,
        interID : context.auth.uid,
        link : data.link,
        eventBookedTime: new Date().getTime()

    }
    if (!doc.exists) {
        console.log('No such document!');
    } else {
        
        if (doc.data().occupied) {
            return false
        }
        else {
            // TODO need to  check  user comunication method if its email or phone only then send a message to this method
            // get the link
            // save it in docUpdated.link
            
            const res = await eventsRef.update(docUpdated)
            const getInter = await utils.GetEntity('inters-data',context.auth.uid)
            const getUserInter = await utils.GetEntity('users',context.auth.uid)
            const getCus = await utils.GetEntity('customers-data',doc.data().customerID)
            const getUserCus= await utils.GetEntity('users',doc.data().customerID)
            
            // get inter mail by id
            // getCustomer mail by id
            const gridData = { 
                interMail:getUserInter.email,
                customerMail:getUserCus.email,
                interName:getInter.fullName,
                customerName:getCus.fullName,
                meetingTime:doc.data().date,
                meetingLength:doc.data().length,
                meetingLink:data.link,
                
            }
            
            const SMSData = {
                interName:getInter.fullName,
                customerName:getCus.fullName,
                customerPhone:getCus.phone,
                interPhone:getInter.phone,
                eventTime:doc.data().date,
                eventLength:doc.data().length,
                eventLink:data.link
            }
            
            if(interData.phone){

                messages.SendSMSOnClosedEvent(SMSData)
            }
            if(interData.email){

                messages.SendSMSOnClosedEvent(SMSData)
            }

            messages.SendGridEmail(gridData)
            
            // TODO phone-message to both  customer and inter with meeting details
            return true
        }
    }
} catch (error) {
        console.log(error)
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