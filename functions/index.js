
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { backup, backups, initializeApp ,restore } = require('firestore-export-import')
admin.initializeApp();





const customer = require('./customer')
exports.CreateCustomer = customer.CreateCustomer
exports.CreateCustomerRating = customer.CreateCustomerRating
exports.GetAllCustomers = customer.GetAllCustomers
exports.EmailValidation = customer.EmailValidation
// exports.CheckCustomerCredit = customer.CheckCustomerCredit

const inter = require('./inter')
exports.CreateInter = inter.CreateInter
exports.GetAllInters = inter.GetAllInters
exports.BookEvent = inter.BookEvent
// exports.SendInterToServer = inter.SendInterToServer
// exports.interAnswer = inter.interAnswer

const events = require('./events')
exports.CreateEvent = events.CreateEvent
exports.UpdateEvent = events.UpdateEvent 
exports.GetAllOccupiedEvents = events.GetAllOccupiedEvents
exports.GetAllEvents = events.GetAllEvents
exports.GetAllEventsNotOccupiedByCustomerId = events.GetAllEventsNotOccupiedByCustomerId
exports.GetAllEventsOccupiedByCustomerId = events.GetAllEventsOccupiedByCustomerId
exports.GetAllOccupiedEventsByInterId = events.GetAllOccupiedEventsByInterId
exports.DeletePastEvents = events.DeletePastEvents

const orginization = require('./orginization')
exports.CreateOrginization = orginization.CreateOrginization
exports.GetAllOrginizationCustomers = orginization.GetAllOrginizationCustomers
exports.GetAllOrginizations = orginization.GetAllOrginizations
exports.UpdateOrginization = orginization.UpdateOrginization
exports.GetOrginizations = orginization.GetOrginizations

const triggers = require('./triggers')
exports.ChangeRoleCustomer = triggers.ChangeRoleCustomer
exports.ChangeRoleInter = triggers.ChangeRoleInter
exports.OnDelete = triggers.OnDelete
exports.OnUserSignUp = triggers.OnUserSignUp

const userActions = require('./userActions')
exports.UpdateLastLogin = userActions.UpdateLastLogin
exports.CheckUserRole = userActions.CheckUserRole
exports.GetUserNameById = userActions.GetUserNameById

const utils = require('./utils')
// exports.ExcelToJSON = utils.ExcelToJSON
exports.GetUsersFromJson = utils.GetUsersFromJson
exports.ImportToJSON = utils.ImportToJSON
exports.SendWhatsApp = utils.SendWhatsApp
exports.CodeValidation = utils.CodeValidation
