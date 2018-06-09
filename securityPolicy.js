const passport = require('passport');
const _  = require('lodash');
const logger = require('./utils/logger');
var Q = require('q');

// A user can fetch a shopping list only if the list id is contained in the array "Account.shoppingLists"
// and the list is active (both condition should always be true or false together)
function userCanFetchShoppingList(account, shoppingList) {
    var userHasRight = false;
    if (account.shoppingLists.indexOf(shoppingList._id) > -1 && shoppingList.isActive) {
        userHasRight = true;
    }
    else {
        userHasRight = false;
    }
    return userHasRight;
}

// A user can fetch a shopping list only if the list id is contained in the array "Account.shoppingLists"
// and the list is active
function userCanUpdateOrDeleteShoppingList(account, shoppingList) {
    var userHasRight = false;
    if (account._id.equals(shoppingList.createdBy) && account.shoppingLists.indexOf(shoppingList._id) > -1 &&
        shoppingList.isActive) {
        userHasRight = true;
    }
    else {
        userHasRight = false;
    }
    return userHasRight;
}

function requestForMe(req){
    return (_.get(req, 'params.userId') === _.get(req, 'currentUser.id'))
}

function authorise(req, res, next) {
    const strategy = req.authStrategy || 'bearer';
    return passport.authenticate(strategy, {session: false}, function (err, user) {
        if (err) {
            logger.log('error', 'An error has occurred while processing a request ' +
                ' from ' +
                req.connection.remoteAddress + '. Stack trace: ' + err.stack);
            return res.status(500).send({
                error: err.message
            });
        }
        if (user) {
            req.currentUser = user;
            req.requestForMe = requestForMe(req);
            return next();
        }
        else {
            logger.log('info', 'User  is not authorised. Request from address ' + req.connection.remoteAddress + '.');
            return res.status(401).send({
                error: "User is not authorised"
            });
        }
    })(req, res);
}

exports.authorise = authorise;
exports.userCanFetchShoppingList = userCanFetchShoppingList;
exports.userCanUpdateOrDeleteShoppingList = userCanUpdateOrDeleteShoppingList;
exports.reqestForMe = requestForMe;
