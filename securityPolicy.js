/**
 * Created with JetBrains WebStorm.
 * User: valerio
 * Date: 22/06/13
 * Time: 15.14
 * To change this template use File | Settings | File Templates.
 */

var SecurityToken = require('./infrastructure/securityToken');
var logger = require('./utils/logger');
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

function authorise(req, res, next) {
  var apiAccessToken = req.params.apiAccessToken || req.body.apiAccessToken || req.query.apiAccessToken || req.headers['authorization'] || null;
  console.log("aa" + req.headers['authorization'])
  if (apiAccessToken ) {
    SecurityToken.authorise(apiAccessToken)
      .then(function(authorised) {
        if (authorised) {
          next();
        }
        else {
          logger.log('info', 'User  is not authorised. Request from address ' + req.connection.remoteAddress + '.');
          res.json(401, {
            error: "User is not authorised"
          });
        }
      }).catch(function(err) {
        logger.log('error', 'An error has occurred while processing a request ' +
          ' from ' +
          req.connection.remoteAddress + '. Stack trace: ' + err.stack);
        res.json(500, {
          error: err.message
        });
      });
  }
  else {
    logger.log('info', 'Bad request from ' +
      req.connection.remoteAddress + '. Api access token is mandatory.');
    res.json(401, {
      error: 'Api access token is mandatory.'
    });
  }
}

exports.authorise = authorise;
exports.userCanFetchShoppingList = userCanFetchShoppingList;
exports.userCanUpdateOrDeleteShoppingList = userCanUpdateOrDeleteShoppingList;
