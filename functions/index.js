
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const customer = require('./customer')
exports.CreateCustomer = customer.CreateCustomer
exports.CreateCustomerRating = customer.CreateCustomerRating
// exports.CheckCustomerCredit = customer.CheckCustomerCredit

const inter = require('./inter')
exports.CreateInter = inter.CreateInter
// exports.SendInterToServer = inter.SendInterToServer
// exports.interAnswer = inter.interAnswer

const organization = require('./organization')

exports.CreateOrganization = organization.CreateOrganization

const triggers = require('./triggers')

exports.ChangeRoleCustomer = triggers.ChangeRoleCustomer
exports.ChangeRoleInter = triggers.ChangeRoleInter
exports.OnDelete = triggers.OnDelete
exports.OnUserSignUp = triggers.OnUserSignUp

const userActions = require('./userActions')
// exports.IsRegistered = userActions.IsRegistered
exports.UpdateLastLogin = userActions.UpdateLastLogin
// exports.UserLastActivity = userActions.UserLastActivity



