/***
 * Author: Valerio Gheri
 * Date: 15/03/2013
 * This class contains all the methods to handle Account related requests
 */

var Bet = require('../models/Bet');
var Repository = require('../repositories/betRepository');
var PoolRepository = require('../repositories/poolRepository');
var SecurityToken = require('../infrastructure/securityToken');
var logger = require('../utils/logger');
var winston = require('winston');
var Q = require('q');

var BetHandler = function() {
	this.createOrUpdate = handleCreateOrUpdateRequest;
};

// On success should return status code 201 to notify the client the account
// creation has been successful
// On error should return status code 400 and the error message
function handleCreateOrUpdateRequest(req, res) {
	var poolId = req.params.poolId || null;
	var userId =req.params.userId || null;
	var gameId = req.params.gameId || null;
    var score1 = req.body.score1 || null;
    var score2 = req.body.score2 || null;

	var repository = new Repository();
    var poolRepository = new PoolRepository();

    Q.all([poolRepository.findGameById(poolId,gameId), poolRepository.findParticipateByUserId(poolId,userId)]).then(function(promisses) {
        var game = promisses[0];
        var participate =  promisses[1];
        if (game && participate){
            repository.createOrUpdate(poolId,participate._id, game._id,score1,score2)
                .then(
                function (bet) {
                    logger.log('info', 'bet for' + poolId + ' has been submitted.' +
                        'Request from address ' + req.connection.remoteAddress + '.');
                    res.json(201, bet);
                }).catch(
                function (err) {
                    logger.log('error', 'An error has occurred while processing a request to create a ' +
                        'Bet from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
                    res.json(400, {
                        error: err.message
                    });
                }
            );
        }else{
            var massage = "No game or participate found for pool id " + poolId;
            logger.log('error', 'An error has occurred while processing a request to create a ' +
                'Pool ' + massage + req.connection.remoteAddress );
            res.json(400, {
                error: massage
            });
        }

    }).catch(function(err){
        logger.log('error', 'An error has occurred while processing a request to create a ' +
            'Pool from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
        res.json(400, {
            error: err.message
        });
    }).done();
}


module.exports = BetHandler;

