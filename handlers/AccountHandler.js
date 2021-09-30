'use strict';
const {SecurityToken} = require('../models');
const accountRepository = require('../repositories/accountRepository');
const logger = require('../utils/logger');

function handleCreateAccountRequest(req, res) {
	const username = req.body.username || null;
	const password = req.body.password || null;
	const firstName = req.body.firstName || null;
	const lastName = req.body.lastName || null;
	const email = req.body.email || null;
	accountRepository.createAccount({username, password, firstName, lastName, email})
	.then(
		function (account) {
			logger.log('info', 'Account ' + username + ' has been created.' +
				'Request from address ' + req.connection.remoteAddress + '.');
			res.json(201, account);
		}).catch(
		function (err) {
			logger.log('error', 'An error has occurred while processing a request to create an ' +
				'account from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
			res.json(400, {
				error: err.message
			});
		}
	);
}

function handleGetAccountRequest(req, res) {
	const userId = req.params.userId || null;
	accountRepository.findById(userId)
	.then(
		function(account) {
      if (account && account.isActive === true) {
				logger.log('info', 'Account ' + userId + ' has been retrieved.' +
					'Request from address ' + req.connection.remoteAddress + '.');
				res.json(200, account);
			}
			else {
        console.log('account not found');
				logger.log('info', 'Could not retrieve account ' + userId + ', no ' +
					'such id exists. Request from address ' + req.connection.remoteAddress + '.');
				res.json(404, {
					error: "No account found matching id " + userId
				});
			}
		}).catch(
		function(err) {
			logger.log('error', 'An error has occurred while processing a request to retrieve ' +
				'account id ' + userId + ' from ' + req.connection.remoteAddress +
				'. Stack trace: ' + err.stack);
			res.json(500, {
				error: err.message
			});
		}
	);
}

function handleUpdateAccountRequest(req, res) {
	// Retrieve the username from the request
	const username = req.params.username || null;
	const updatedAccount = req.body || null;
	updatedAccount.username = username;
	accountRepository.updateAccount(updatedAccount)
	.then(
		function (account) {
			if (account) {
				logger.log('info', 'Account ' + username + ' has been updated.' +
					'Request from address ' + req.connection.remoteAddress + '.');
				res.json(200, account);
			}
			else {
				logger.log('info', 'Could not update account ' + username + ', no ' +
					'such username found. Request from address ' + req.connection.remoteAddress + '.');
				res.json(404, {
					error: "No account found matching " + username
				});
			}
		}).catch(
		function (err) {
			logger.log('error', 'An error has occurred while processing a request to update ' +
				'account ' + username + ' from ' + req.connection.remoteAddress +
				'. Stack trace: ' + err.stack);
			res.json(400, {
				error: err.message
			});
		}
	);
}

function handleDeleteAccountRequest(req, res) {
	const userId  = req.params.userId || null;
	accountRepository.disableAccount(userId)
	.then(
		function (account) {
			if (account) {
        SecurityToken.removeSecurityTokensForUserId(userId);
				logger.log('info', 'Account id ' + userId + ' has been disabled.' +
					'Request from address ' + req.connection.remoteAddress + '.');
				// No need to return anything. We just disabled the account
				res.json(204, null);
			}
			else {
				logger.log('info', 'Could not disable account id ' + userId + ', no ' +
					'such id exists. Request from address ' + req.connection.remoteAddress + '.');
				res.json(404, {
					error: "No account found matching id " + userId
				});
			}
		}).catch(
		function (err) {
			logger.log('error', 'An error has occurred while processing a request to disable ' +
				'account id ' + userId + ' from ' + req.connection.remoteAddress +
				'. Stack trace: ' + err.stack);
			res.json(500, {
				error: err.message
			});
		}
	);
}

module.exports = {
	createAccount: handleCreateAccountRequest,
	getAccount: handleGetAccountRequest,
	updateAccount: handleUpdateAccountRequest,
	deleteAccount: handleDeleteAccountRequest
};

