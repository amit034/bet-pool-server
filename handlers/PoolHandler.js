/***
 * Author: Valerio Gheri
 * Date: 15/03/2013
 * This class contains all the methods to handle Account related requests
 */

var Pool = require('../models/Pool');
var Repository = require('../repositories/poolRepository');
var Account = require('../models/Account');
var AccountRepository = require('../repositories/accountRepository');
var GameRepository = require('../repositories/gameRepository');
var EventRepository = require('../repositories/eventRepository');
var SecurityToken = require('../infrastructure/securityToken');
var logger = require('../utils/logger');
var winston = require('winston');
var Q = require('q');

var PoolHandler = function() {
	this.createPool = handleCreatePoolRequest;
    this.addGames = handleAddGames;
    this.addEvents = handleAddEvents;
    this.addParticipates = handleAddParticipates;
};

// On success should return status code 201 to notify the client the account
// creation has been successful
// On error should return status code 400 and the error message
function handleCreatePoolRequest(req, res) {
    var name = req.body.name || null;
    var userId = req.params.userId || null;

	var repository = new Repository();
    var accountRepository = new AccountRepository();

    if (userId) {
        accountRepository.findById(userId)
            .then(
            function (account) {
                if (account && account.isActive === true) {
                    repository.createPool(account, name)
                    .then(function(pool){
                            return addParticipatesToPool(pool,[userId],req);
                    })
                    .then(function(pool){

                        logger.log('info', 'Pool for' + userId + ' has been created.' +
                                    'Request from address ' + req.connection.remoteAddress + '.');
                                res.json(201, pool);

                    }).catch(function(err){
                        logger.log('error', 'An error has occurred while processing a request to create an ' +
                            'Pool from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
                        res.json(400, {
                            error: err.message
                        });
                     }).done();
                } else {
                    console.log('account not found');
                    logger.log('info', 'Could not retrieve account ' + userId + ', no ' +
                        'such id exists. Request from address ' + req.connection.remoteAddress + '.');
                    res.json(404, {
                        error: "No account found matching id " + userId
                    });
                }
            }).catch(
            function (err) {
                logger.log('error', 'An error has occurred while processing a request to retrieve ' +
                    'account id ' + userId + ' from ' + req.connection.remoteAddress +
                    '. Stack trace: ' + err.stack);
                res.json(500, {
                    error: err.message
                });
            }).done()
    }else {
            logger.log('info', 'Bad request from ' +
                req.connection.remoteAddress + '. Message: UserId is required.');
            res.json(400, {
                error: 'UserId  is required.'
            });
    }
}

function handleAddGames(req, res) {
    var gameIds = req.body.games || [];
    var poolId = req.params.poolId || null;
    var userId = req.params.userId;
    var repository = new Repository();
    repository.findById(poolId)

    .then(function(pool) {
            if (userId != pool.owner.id){
                res.json(403, {error: "you are not the owner of the pool"});
                return Q.reject({error: "you are not the owner of the pool" , code :403})
            }
            return addGamesToPool(pool, gameIds, req);
    }).then(function(docs){
            res.json(201, {"addedGames" :docs});
    }).catch(function(err){

       logger.log('error', 'An error has occurred while processing a request to add games ' +
                    'for pool id ' + poolId + ' from ' + req.connection.remoteAddress +
                    '. Stack trace: ' + err.stack);
        res.json(500, {
                error: err.message
            });
    }) .done()
}

function handleAddEvents(req, res) {
    var eventIds = req.body.events || [];
    var poolId = req.params.poolId || null;
    var userId = req.params.userId;
    var repository = new Repository();
    var gameRepository = new GameRepository();
    var poolObj = null;
    repository.findById(poolId)
    .then(function(pool) {

        var deferred = Q.defer();
        if (userId != pool.owner.id){
                res.json(403, {error: "you are not the owner of the pool"});
                return Q.reject({error: "you are not the owner of the pool" , code :403})
         }
        logger.log('info', 'found Pool' + pool._id  + req.connection.remoteAddress + '.');
        poolObj = pool;
        deferred.resolve(pool);
        return deferred.promise;
    })
    .then(function(pool){
        return addEventsToPool(pool,eventIds,req);
     })
    .then(function(){
           return  gameRepository.findActiveGameByEventIds(eventIds);
     })
    .then(function(gamesIds) {
           return  addGamesToPool(poolObj,gamesIds,req);
     })
     .then(function(docs){
                res.json(201, {"addedEvents" :docs});
     })
     .catch(function(err){
        res.json(500, { error: err.message});
     })
    .done()
}

function handleAddParticipates(req, res) {
    var inviteesIds = req.body.invitees || [];
    var poolId = req.params.poolId || null;
    var userId = req.params.userId;
    var repository = new Repository();
    repository.findById(poolId).then(function(pool) {
        if (userId === pool.owner.id){
            return addParticipatesToPool(pool, inviteesIds, req);
        }else{
            res.json(403, {error: "you are not the owner of the pool"});
            return Q.reject({error: "you are not the owner of the pool" , code :403})

        }

    }).then(function(docs){
            res.json(201, {"addedParticipates" :docs});

            return null;
    }).catch(function(err){
        if (err && err.code  != 403) {
            logger.log('error', 'An error has occurred while processing a request to add participates ' +
                'for pool id ' + poolId + ' from ' + req.connection.remoteAddress +
                '. Stack trace: ' + err.stack);
            res.json(500, {error: err.message});
        }
    }).done();
}
function handleUpdatePoolRequest(req, res) {
    var gameIds = req.body.games || [];
    var eventsIds = req.body.events || [];
    var inviteesIds = req.body.invitees || [];
    var poolId = req.params.poolId || null;

    var repository = new Repository();
    repository.findById(poolId).then(function(pool){
        Q.all([addGamesToPool(pool,gameIds,req), addEventsToPool(pool,eventsIds,req) , addParticipatesToPool(pool,inviteesIds,req)]).then(function(promises){
            res.json(201, {"addedGames":promises[0] , "addedEvents": promises[1]});
        }).catch(function(err){
            res.json(500, {
                error: err.message
            });
        })
    })
   .done();



}

function addGamesToPool(pool,gamesIds,req){
    var deferred = Q.defer();
    var gameRepository = new GameRepository();
    var repository = new Repository();
    gameRepository.findActiveGameByIds(gamesIds)
        .then(function (games) {

            if (games && games.length > 0) {
                logger.log('info', 'Pool' + pool._id + ' has' + games.length + " to be added " +
                'Request from address ' + req.connection.remoteAddress + '.');
                repository.addGames(pool._id, games)
                    .then(
                    function (doc) {
                        logger.log('info', 'games added to Pool' + pool._id  +
                            'Request from address ' + req.connection.remoteAddress + '.');
                        deferred.resolve(doc);
                    }).catch(
                    function (err) {
                        logger.log('error', 'An error has occurred while processing a request to create an ' +
                            'Pool from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
                        deferred.reject(err);
                    }
                );
            } else {

                logger.log('info', 'no games found to be added ' + gamesIds + ', no ' +
                    'such id exists. Request from address ' + req.connection.remoteAddress + '.');
                deferred.resolve([]);
            }
        }).catch(
        function (err) {
            logger.log('error', 'An error has occurred while processing a request to retrieve ' +
                'game id ' + gamesIds + ' from ' + req.connection.remoteAddress +
                '. Stack trace: ' + err.stack);
            deferred.reject(err);
        })

    return deferred.promise;
}
function addEventsToPool(pool,eventsIds,req) {
    var deferred = Q.defer();
    var repository = new Repository();
    var eventRepository = new EventRepository();

    eventRepository.findActiveEventsByIds(eventsIds)
        .then(function (events) {
            if (events && events.length > 0 ) {
                repository.addEvents(pool._id, events)
                    .then(
                    function (doc) {
                        logger.log('info', 'add game to Pool' + pool._id + ' has been created.' +
                            'Request from address ' + req.connection.remoteAddress + '.');
                        deferred.resolve(doc);
                    }).catch(
                    function (err) {
                        logger.log('error', 'An error has occurred while processing a request to create an ' +
                            'Pool from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
                        deferred.reject(err);
                    }
                )
            } else {
                console.log('game not found or not open');
                logger.log('info', 'event not found or not active ' + eventsIds + ', no ' +
                    'such id exists. Request from address ' + req.connection.remoteAddress + '.');
                deferred.resolve([]);
            }
        }).catch(
        function (err) {
            logger.log('error', 'An error has occurred while processing a request to retrieve ' +
                'game id ' + eventsIds + ' from ' + req.connection.remoteAddress +
                '. Stack trace: ' + err.stack);
            deferred.reject(err);
        })

    return deferred.promise;
}


function addParticipatesToPool(pool,usersIds,req){
    var deferred = Q.defer();
    var accountRepository = new AccountRepository();
    var repository = new Repository();
    accountRepository.findActiveAccountsByIds(usersIds)
        .then(function (users) {

            if (users && users.length > 0) {
                var participatesToAdd = [];
                users.forEach(function(user){
                    participatesToAdd.push({'user': user._id , 'joined' : user.equals(pool.owner)});
                });

                repository.addParticipates(pool._id, participatesToAdd)
                    .then(
                    function (doc) {
                        logger.log('info', 'add users to Pool' + pool._id + ' has been created.' +
                            'Request from address ' + req.connection.remoteAddress + '.');
                        deferred.resolve(doc);
                    }).catch(
                    function (err) {
                        logger.log('error', 'An error has occurred while processing a request to add users to ' +
                            'Pool from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
                        deferred.reject(err);
                    }
                )
            } else {
                console.log('users not found or not open');
                logger.log('info', 'users not found or not active ' + usersIds + ', no ' +
                    'such id exists. Request from address ' + req.connection.remoteAddress + '.');
                deferred.resolve([]);
            }
        }).catch(
        function (err) {
            logger.log('error', 'An error has occurred while processing a request to add ' +
                'users ids ' + usersIds + ' from ' + req.connection.remoteAddress +
                '. Stack trace: ' + err.stack);
            deferred.reject(err);
        })
    return deferred.promise;
}

module.exports = PoolHandler;

