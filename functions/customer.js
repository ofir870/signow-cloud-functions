const functions = require('firebase-functions');
const admin = require('firebase-admin');
const utils = require('./utils')

const db = admin.firestore();


exports.CreateCustomer = functions.https.onCall((data, context) => {
    let req = {}
    let answer = {}
    let phone = "+972" + parseInt(data.phone)
    console.log(data)
    if (data['email'] !== undefined) {

        req = admin.auth().createUser(
            {
                email: data.email,
                phoneNumber: phone,
                password: data.password,
                displayName: data.fullName,
                disabled: false,
            })

            .then((userRecord) => {
                // See the UserRecord reference doc for the contents of userRecord.
                console.log('Successfully created new user:', userRecord.uid);
                if (!userRecord.uid || !data.code || !data.phone || !data.identityNumber) {
                    return "Missing: data of customer on demand"
                }

                const customer = {

                    "customerID": userRecord.uid,
                    "cardID": data.cardID,
                    "phone": data.phone,
                    "address": data.address,
                    'identityNumber': data.identityNumber,
                    'password': data.password,
                    "fullName": data.fullName,
                    "birthDate": data.birthDate,
                    "disabled": false,
                    "role": 'customer',
                    "code": data.code,
                    'communicationMethod': data.communicationMethod

                }

                // change phone to +972 and take of the 0 in the start 

                // validate code
                setTimeout(() => {

                    let batch = db.batch();

                    let setCustomer = db.collection('customers-data').doc(userRecord.uid);

                    batch.set(setCustomer, JSON.parse(JSON.stringify(customer)));

                    let changeRole = db.collection('users').doc(userRecord.uid);
                    let changeCode = db.collection('users').doc(userRecord.uid);

                    batch.set(changeCode, { "code": data.code }, { "merge": true });
                    batch.set(changeRole, { "role": "customer" }, { "merge": true });

                    return batch.commit().then(function () {
                        return true;
                    }).catch(err => {
                        return err
                    })
                }, 2);
                return 'user created  : ' + userRecord.uid
            }).catch(err => {
                return err
            })
        answer = req.then(answer => {
            return answer
        })
        return answer

    } else {

        req = admin.auth().createUser(
            {
                phoneNumber: phone,
                password: data.password,
                displayName: data.fullName,
                disabled: false,
            })
            .then((userRecord) => {
                // See the UserRecord reference doc for the contents of userRecord.
                console.log('Successfully created new user:', userRecord.uid);

                if (!userRecord.uid || !data.code || !data.phone || !data.identityNumber) {
                    return "Missing: data of customer on demand"

                }

                const customer = {
                    "customerID": userRecord.uid,
                    "cardID": data.cardID,
                    "phone": data.phone,
                    "address": data.address,
                    'identityNumber': data.identityNumber,
                    'password': data.password,
                    "fullName": data.fullName,
                    "birthDate": data.birthDate,
                    "disabled": false,
                    "role": 'customer',
                    "code": data.code,
                    'communicationMethod': data.communicationMethod

                }

                // change phone to +972 and take of the 0 in the start 

                // validate code
                setTimeout(() => {

                    let batch = db.batch();

                    let setCustomer = db.collection('customers-data').doc(userRecord.uid);

                    batch.set(setCustomer, JSON.parse(JSON.stringify(customer)));

                    let changeRole = db.collection('users').doc(userRecord.uid);
                    let changeCode = db.collection('users').doc(userRecord.uid);

                    batch.set(changeCode, { "code": data.code }, { "merge": true });
                    batch.set(changeRole, { "role": "customer" }, { "merge": true });

                    return batch.commit().then(function () {
                        return true;
                    }).catch(err => {
                        return err
                    })
                }, 2)
                return 'user created  : ' + userRecord.uid
            }).catch(err => {
                return err
            })
        answer = req.then(answer => {
            return answer
        })
        return answer

    }
})
exports.CreateCustomerOnDemand = functions.https.onCall((data, context) => {

    // create user with phone number
    // 
    let phone = "+972" + parseInt(data.phone)
    // 
    admin.auth().createUser({
        phoneNumber: phone,
        password: data.password,
        displayName: data.fullName,
        disabled: false,

    })
        .then((userRecord) => {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log('Successfully created new user:', userRecord.uid);

            if (!userRecord.uid || !data.code || !data.phone || !data.identityNumber) {
                return "Missing: data of customer on demand"
            }
            const customer = {

                "customerID": userRecord.uid,
                "phone": phone,
                'password': data.password,
                "fullName": data.fullName,
                "idnetityNumber": data.identityNumber,
                "birthDate": data.birthDate,
                "disabled": false,
                "role": 'customerOnDemand',
                "code": data.code
            }

            // validate code

            let batch = db.batch();

            let setCustomer = db.collection('customers-data').doc(userRecord.uid);

            batch.set(setCustomer, JSON.parse(JSON.stringify(customer)));


            let changeRole = db.collection('users').doc(userRecord.uid);
            let changeCode = db.collection('users').doc(userRecord.uid);


            batch.set(changeCode, { "code": data.code }, { "merge": true });
            batch.set(changeRole, { "role": "customerOnDemand" }, { "merge": true });

            return batch.commit().then(function () {
                return true;
            }).catch(err => {
                return err
            })
        })
        .catch((error) => {
            console.log('Error creating new user:', error);
        });
})

exports.GetCustomerNameById = functions.https.onCall(async (data, context) => {
    let user = await utils.GetEntity('customers-data', data.customerID).then(doc => {
        return doc
    })
    // return user name
    return user.fullName
})
// get all customer of one orginization
exports.GetAllCustomers = functions.https.onCall(async (data, context) => {
    let arr = []
    const customersRef = db.collection('customers-data')

    const snapshot = await customersRef.get();
    if (snapshot.empty) {
        console.log('No matching documents.');
        return;
    }

    snapshot.forEach(doc => {
        arr.push(doc.data())
    });

    return arr

})


// exports.EmailValidation = functions.https.onCall(async (data, context) => {

//     const customersRef = db.collection('users')

//     const snapshot = await customersRef.where("email", "==", data.email).get();
//     console.log(snapshot.docs)
//     if (snapshot.empty) {
//         console.log('No matching documents => creating new user ');
//     }
//     if (!snapshot.empty) {

//         if (snapshot.docs.disabled) {
//             // update

//             return "this is a known email with a non-active account "
//         }
//         else {

//             return "this email is taken with an active account"
//         }
//     }
// })

exports.UpdateCustomerOneVal = functions.https.onCall((data, context) => {

    let update = utils.UpdateEntity(data.customerID, "customers-data", data.key, data.val).then(answer => {
        return answer
    })

})

exports.CreateCustomerRating = functions.https.onCall((data, context) => {
    if (!data.customerID || !data.interID || !data.string || !data.rating) {
        return "Missing: data is missing"
    }

    const customerRating = {

        "customerID": data.customerID,
        "interID": data.interID,
        "string": data.string,
        "rating": data.rating
    }

    let batch = db.batch();

    let setRating = db.collection('rating').doc(context.auth.uid);

    batch.set(setRating, JSON.parse(JSON.stringify(customerRating)));
    return batch.commit().then(function () {
        return true;
    }).catch(err => {
        return err
    })

})

// exports.CheckCustomerCredit = functions.https.onCall(async (data, context) => {
//     let credit = await db.collection("orginization").doc(data.orginizationID).get()
//     db
//     creditLeft = credit.data().hours - bank - credit.data().credit - used

//     // get all user and get a count of all credits in this month


//     if (creditLeft <= 0) {
//         return "you dont have more credit"
//     }
//     return `you have ${creditLeft} credit left`
// })
