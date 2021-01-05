
const functions = require('firebase-functions');
const admin = require('firebase-admin');
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
// exports.SendInterToServer = inter.SendInterToServer
// exports.interAnswer = inter.interAnswer

const events = require('./events')
exports.CreateEvent = events.CreateEvent
exports.UpdateEvent = events.UpdateEvent 
exports.GetAllEvents = events.GetAllEvents

const orginization = require('./orginization')
exports.CreateOrginization = orginization.CreateOrginization
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

const utils = require('./utils')
// exports.ExcelToJSON = utils.ExcelToJSON
exports.GetUsersFromJson = utils.GetUsersFromJson
