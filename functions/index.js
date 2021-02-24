
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { backup, backups, initializeApp, restore } = require('firestore-export-import')
admin.initializeApp();


const customer = require('./customer')
exports.CreateCustomer = customer.CreateCustomer
exports.CreateCustomerRating = customer.CreateCustomerRating
exports.GetAllCustomers = customer.GetAllCustomers
exports.EmailValidation = customer.EmailValidation
exports.GetCustomerNameById = customer.GetCustomerNameById
exports.CreateCustomerOnDemand = customer.CreateCustomerOnDemand
exports.CreateCustomerTest = customer.CreateCustomerTest
exports.UpdateCustomerOneVal = customer.UpdateCustomerOneVal
// exports.CheckCustomerCredit = customer.CheckCustomerCredit


// var data = require('./path/to/testData.json');
// myFunction(data);

const inter = require('./inter')
exports.CreateInter = inter.CreateInter
exports.GetAllInters = inter.GetAllInters
exports.GetInterNameById = inter.GetInterNameById
exports.InterBookEvent = inter.InterBookEvent
exports.CreateInterTest = inter.CreateInterTest
// exports.SendInterToServer = inter.SendInterToServer
// exports.interAnswer = inter.interAnswer

const eventsOD = require('./onDemantEvents')
exports.CreateOnDemandEvent = eventsOD.CreateOnDemandEvent
exports.UpdateODM = eventsOD.UpdateODM



const notification = require('./notificationService')
exports.notification = notification.SaveToken

const events = require('./events')
exports.CreateEvent = events.CreateEvent
exports.CreateEventTest = events.CreateEventTest
exports.UpdateEvent = events.UpdateEvent
exports.DeleteEventById = events.DeleteEventById
exports.GetAllOccupiedEvents = events.GetAllOccupiedEvents
exports.GetAllEvents = events.GetAllEvents
exports.GetAllEventsNotOccupiedByCustomerId = events.GetAllEventsNotOccupiedByCustomerId
exports.GetAllEventsOccupiedByCustomerId = events.GetAllEventsOccupiedByCustomerId
exports.GetAllNotOccupiedEvents = events.GetAllNotOccupiedEvents
exports.GetAllOccupiedEventsByInterId = events.GetAllOccupiedEventsByInterId
exports.DeletePastEvents = events.DeletePastEvents
exports.UpdateEventTime = events.UpdateEventTime
exports.GetEventById = events.GetEventById
exports.GetHistoryEventsByUserId = events.GetHistoryEventsByUserId
exports.GetHistoryEvents = events.GetHistoryEvents
exports.GetAllEventsWithHistories = events.GetAllEventsWithHistory
exports.CheckIfEventNowAdmin = events.CheckIfEventNowAdmin



const orginization = require('./orginization')
exports.CreateOrginization = orginization.CreateOrginization
exports.GetAllOrginizationCustomers = orginization.GetAllOrginizationCustomers
exports.GetAllOrginizations = orginization.GetAllOrginizations
exports.UpdateOrginization = orginization.UpdateOrginization
exports.GetOrginizations = orginization.GetOrginizations
exports.GetOrginizationNameByCode = orginization.GetOrginizationNameByCode
exports.GetOrginizationCreditByCode = orginization.GetOrginizationCreditByCode
exports.CheckOrginizationAbility = orginization.CheckOrginizationAbility

const triggers = require('./triggers')
exports.ChangeRoleCustomer = triggers.ChangeRoleCustomer
exports.ChangeRoleInter = triggers.ChangeRoleInter
exports.OnDelete = triggers.OnDelete
exports.OnUserSignUp = triggers.OnUserSignUp
exports.onUpdateEvent = triggers.onUpdateEvent
exports.OnCreateEvent = triggers.OnCreateEvent

const userActions = require('./userActions')
exports.UpdateLastLogin = userActions.UpdateLastLogin
exports.CheckUserRole = userActions.CheckUserRole
exports.UpdatePassword = userActions.UpdatePassword
exports.GetMailById = userActions.GetMailById
exports.ResetPasswordLink = userActions.ResetPasswordLink
exports.GetPasswordByEmail = userActions.GetPasswordByEmail
exports.GetPasswordByPhone = userActions.GetPasswordByPhone
exports.GetAuthenticatedUser = userActions.GetAuthenticatedUser
exports.GetPhoneById = userActions.GetPhoneById
exports.CheckIfEventNow = userActions.CheckIfEventNow
exports.LinkUserWithPhoneNumber = userActions.LinkUserWithPhoneNumber
exports.LinkAllIntersWithPhoneNumber = userActions.LinkAllIntersWithPhoneNumber
exports.DeleteUserById = userActions.DeleteUserById

const messages = require('./messages')
exports.SendEmail = messages.SendEmail
exports.SendSMSOnClosedEvent = messages.SendSMSOnClosedEvent
exports.SendGridEmail = messages.SendGridEmail
exports.ScheduledEmailMessage = messages.ScheduledEmailMessage
exports.SendEmailVerifications = messages.SendEmailVerifications
exports.ReplySMS = messages.ReplySMS

const utils = require('./utils')
exports.CodeValidation = utils.CodeValidation
exports.GetEntityValue = utils.GetEntityValue
exports.IsTimeValid = utils.IsTimeValid

const onDemand = require('./onDemantEvents')
exports.CreateOnDemandEvent = onDemand.CreateOnDemandEvent
exports.InterBookEventOnDemand = onDemand.InterBookEventOnDemand
exports.IsInterOnDemand = onDemand.IsInterOnDemand
exports.GetAllEventsOnDemand = onDemand.GetAllEventsOnDemand

/* VideoChat Serving app */
//import dependencies
const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();
const path = require('path');
const app = express();

/**import routing files
 * those are the files that contain the function for the innar API
 * for each routing
 */
var videoRouter = require('./videochat/video.js');
var apiRouter = require('./videochat/api.js');

// express usages for reading jason and creating logs with pino
app.use(pino);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Routing the API to sub files which will handle them
app.use('/video', videoRouter);
app.use('/api', apiRouter);

//setting the build files as static files
app.use(express.static(path.join(__dirname, 'videochat/client/build')))

//serving the build index.html opun GET request for <server-url>/videochat
app.get('/videochat', (req, res) => {
  console.log("handle GET api at /videochat");
  console.log("sending file at " + path.join(__dirname, 'videochat/build', 'index.html'));
  res.sendFile(path.join(__dirname, 'videochat/client/build', 'index.html'))
})

//testing api
app.get('/ping', function (req, res) {
  console.log("ping api at /ping");
  return res.send('pong');
});

app.get('/', function (req, res) {
  console.log("helloworld api at /");
  return res.send('helloworld');
});



// define the serving port to be the VM env port or 8080 on local machine
// app.listen(process.env.PORT || 8080, () =>
//   console.log('Express server is running on localhost:8080')
// );

exports.app = functions.https.onRequest(app);

// const registerServiceWorker = () => {
//   if ('serviceWorker' in navigator) {
//     navigator.serviceWorker
//       .register('./firebase-messaging-sw.js')
//       .then(function (registration) {
//         console.log('Registration successful, scope is:', registration.scope);
//       })
//       .catch(function (err) {
//         console.log('Service worker registration failed, error:', err);
//       });
//   }
// };

// registerServiceWorker();