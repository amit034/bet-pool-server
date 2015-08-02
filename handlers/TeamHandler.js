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

// On success should return status code 201 to notify the client the account
// creation has been successful
// On error should return status code 400 and the error message
function handleCreateTeamRequest(req, res) {
	var eventId = req.params.eventId || null;
	var name = req.body.name || null;
	var code = req.body.code || null;

	var repository = new Repository();
    var eventRepository = new EventRepository();

    eventRepository.findById(eventId).then(function(event) {
        if (event){
            repository.createTeam(event._id, name, code)
                .then(
                function (team) {
                    logger.log('info', 'Team ' + name + ' has been created.' +
                        'Request from address ' + req.connection.remoteAddress + '.');
                    event.teams.push(team);
                    event.save();
                    res.json(201, team);
                }).catch(
                function (err) {
                    logger.log('error', 'An error has occurred while processing a request to create an ' +
                        'Team from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
                    res.json(400, {
                        error: err.message
                    });
                }
            );
        }else{
            var massage = "No event found for id " + eventId;
            logger.log('error', 'An error has occurred while processing a request to create an ' +
                'Team ' + massage + req.connection.remoteAddress );
            res.json(400, {
                error: massage
            });
        }

    }).catch(function(err){
        logger.log('error', 'An error has occurred while processing a request to create an ' +
            'Team from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
        res.json(400, {
            error: err.message
        });
    }).done();
}


module.exports = TeamHandler;

