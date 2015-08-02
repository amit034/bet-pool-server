/***
 * Author: Valerio Gheri
 * Date: 15/03/2013
 * This class contains all the methods to handle Account related requests
 */

var Game = require('../models/Game');
var GameRepository = require('../repositories/gameRepository');
var EventRepository = require('../repositories/eventRepository');
var TeamRepository = require('../repositories/teamRepository');
var SecurityToken = require('../infrastructure/securityToken');
var logger = require('../utils/logger');
var winston = require('winston');
var Q = require('q');

var GameHandler = function() {
	this.createGame = handleCreateGameRequest;
	this.getGame = handleGetGameRequest;
    this.updateGame= handleUpdateGameRequest;
    this.getActiveGames = handleGetActiveGamesRequest;

};

// On success should return status code 201 to notify the client the account
// creation has been successful
// On error should return status code 400 and the error message
function handleCreateGameRequest(req, res) {
	var team1_code = req.body.team1_code || null;
    var team2_code = req.body.team2_code || null;
    var eventId = req.params.eventId || null;
    var playAt = req.body.playAt || null;
	var gameRepository = new GameRepository();
    var teamRepository = new TeamRepository();

    var eventRepository = new EventRepository();

    eventRepository.findById(eventId).then(function(event) {
        if (event) {
            Q.all([teamRepository.findByCode(team1_code, event._id), teamRepository.findByCode(team2_code, event._id)])
                .then(function (promises) {
                    var team1 = promises[0];
                    var team2 = promises[1];
                    if (team1 && team2) {
                        gameRepository.createGame(event._id, team1._id, team2._id, playAt).then(function (game) {
                            logger.log('info', 'Game ' + team1.name + " " + team2.name + ' has been created.' +
                                'Request from address ' + req.connection.remoteAddress + '.');
                            event.games.push(game);
                            event.save();
                            res.json(201, game);
                        }).catch(function (err) {
                                logger.log('error', 'An error has occurred while processing a request to create a ' +
                                    'game from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
                                res.json(400, {
                                    error: err.message
                                });
                            }
                        ).done();
                    } else {
                        var message = 'Cant find both team codes for event ' + eventId + " " + team1_code + ' and ' + team2_code;
                        logger.log('error', message + ' from ' + req.connection.remoteAddress);
                        res.json(400, {
                            error: message
                        });
                    }

                }).catch(function (err) {
                    logger.log('error', 'An error has occurred while processing a request to create ' +
                        'game ' + team1_code + 'and' + team2_code + ' from ' + req.connection.remoteAddress +
                        '. Stack trace: ' + err.stack);
                    res.json(400, {
                        error: err.message
                    });
                }
            ).done();
        } else {
            var massage = "No event found for id " + eventId;
            logger.log('error', 'An error has occurred while processing a request to create a ' +
                'Game ' + massage + req.connection.remoteAddress);
            res.json(400, {
                error: massage
            });
        }
    }).catch(function(err){
        logger.log('error', 'An error has occurred while processing a request to create a ' +
            'Game from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
        res.json(400, {
            error: err.message
        });
    }).done();
}

function handleGetGameRequest(req, res) {
	var gameId = req.params.gameId || null;

    var gameRepository = new GameRepository();
    gameRepository.findById(gameId)
	.then(function(game) {

              if (game) {
                        logger.log('info', 'Game ' + gameId + ' has been retrieved.' +
                            'Request from address ' + req.connection.remoteAddress + '.');
                        res.json(200, account);
                    }
              else {
                console.log('game not found');
                        logger.log('info', 'Could not retrieve game ' + gameId + ', no ' +
                            'such id exists. Request from address ' + req.connection.remoteAddress + '.');
                        res.json(404, {
                            error: "No event found matching name " + gameId
                        });
                    }
	}).catch(function(err) {
			logger.log('error', 'An error has occurred while processing a request to retrieve ' +
				'game name ' + gameId + ' from ' + req.connection.remoteAddress +
				'. Stack trace: ' + err.stack);
			res.json(500, {
				error: err.message
			});
	}).done();
}


function handleGetActiveGamesRequest(req, res) {

    var eventId = req.params.eventId || null;
    var gameRepository = new GameRepository();


    gameRepository.findActive().then(function (games) {
            if (games){
                logger.log('info', 'Games has been retrieved.' +
                    'Request from address ' + req.connection.remoteAddress + '.');
                res.json(200, games);
            } else {
                var massage = "No Active games found ";
                logger.log('error', 'An error has occurred while processing a request to get Active games'  + massage + req.connection.remoteAddress);
                res.json(400, {
                    error: massage
                });
            }
    }).catch(function (err) {
        logger.log('error', 'An error has occurred while processing a request to get Active games '
            + ' from ' + req.connection.remoteAddress +
            '. Stack trace: ' + err.stack);
        res.json(400, {
            error: err.message
        });
    }).done();
}
function handleUpdateGameRequest(req, res) {
	// Retrieve the username from the request
    var gameId = req.params.gameId || null;
    var updatedGame = req.body || null;
    updatedGame._id = gameId;


    var gameRepository = new GameRepository();
    gameRepository.updateGame(updatedGame)
	.then(
		function (game) {
			if (event) {
				logger.log('info', 'Game ' + name + ' has been updated.' +
					'Request from address ' + req.connection.remoteAddress + '.');
				res.json(200, game);
			}
			else {
				logger.log('info', 'Could not update game ' + name + ', no ' +
					'such name found. Request from address ' + req.connection.remoteAddress + '.');
				res.json(404, {
					error: "No game found matching " + name
				});
			}
		}).catch(
		function (err) {
			logger.log('error', 'An error has occurred while processing a request to update ' +
				'game ' + gameId + ' from ' + req.connection.remoteAddress +
				'. Stack trace: ' + err.stack);
			res.json(400, {
				error: err.message
			});
		}
    ).done();
}



module.exports = GameHandler;

