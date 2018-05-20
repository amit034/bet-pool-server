
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
  const authorizationHeader  =  req.headers['authorization'] || '';
  var apiAccessToken = req.params.apiAccessToken || req.body.apiAccessToken || req.query.apiAccessToken || authorizationHeader.replace('Bearer ', '') ||  null;

  console.log("token" + apiAccessToken);
  if (apiAccessToken ) {
    SecurityToken.authorise(apiAccessToken)
      .then(function(authorised) {
        if (authorised) {
          next();
        }
        else {
          logger.log('info', 'User  is not authorised. Request from address ' + req.connection.remoteAddress + '.');
          res.status(401).send({
            error: "User is not authorised"
          });
        }
      }).catch(function(err) {
        logger.log('error', 'An error has occurred while processing a request ' +
          ' from ' +
          req.connection.remoteAddress + '. Stack trace: ' + err.stack);
        res.status(500).send({
          error: err.message
        });
      });
  }
  else {
    logger.log('info', 'Bad request from ' +
      req.connection.remoteAddress + '. Api access token is mandatory.');
    res.status(401).send({
      error: 'Api access token is mandatory.'
    });
  }
}

exports.authorise = authorise;
exports.userCanFetchShoppingList = userCanFetchShoppingList;
exports.userCanUpdateOrDeleteShoppingList = userCanUpdateOrDeleteShoppingList;
