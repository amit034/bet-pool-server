/***
 * Author: Valerio Gheri
 * Date: 15/03/2013
 * This class contains all the methods to handle Account related requests
 */


var Repository = require('../repositories/eventRepository');
var SecurityToken = require('../infrastructure/securityToken');
var logger = require('../utils/logger');
var winston = require('winston');

var EventHandler = function() {
	this.createEvent = handleCreateEventRequest;
};

// On success should return status code 201 to notify the client the account
// creation has been successful
// On error should return status code 400 and the error message
function handleCreateEventRequest(req, res) {
	var name = req.body.name || null;
	var repository = new Repository();
    repository.createEvent(name)
	.then(
		function (event) {
			logger.log('info', 'Event ' + name + ' has been created.' +
				'Request from address ' + req.connection.remoteAddress + '.');
			res.json(201, event);
		}).catch(
		function (err) {
			logger.log('error', 'An error has occurred while processing a request to create an ' +
				'Event from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
			res.json(400, {
				error: err.message
			});
		}
	);
}


module.exports = EventHandler;

