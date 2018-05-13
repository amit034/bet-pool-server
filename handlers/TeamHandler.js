/***
 * Author: Valerio Gheri
 * Date: 15/03/2013
 * This class contains all the methods to handle Account related requests
 */

var Team = require('../models/Team');
var Repository = require('../repositories/teamRepository');
var EventRepository = require('../repositories/eventRepository');
var SecurityToken = require('../infrastructure/securityToken');
var logger = require('../utils/logger');
var winston = require('winston');

var TeamHandler = function() {
	this.createTeam = handleCreateTeamRequest;
};

function handleCreateTeamRequest(req, res) {
	const repository = new Repository();
    repository.createTeam(req.body)
    .then(function (team) {
        logger.log('info', 'Team ' + name + ' has been created.' +
            'Request from address ' + req.connection.remoteAddress + '.');
        res.status(201).send(team);
    }).catch(function (err) {
        logger.log('error', 'An error has occurred while processing a request to create an ' +
            'Team from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
        res.status(400).send({
            error: err.message
        });
    });
}

module.exports = TeamHandler;

