const _ = require('lodash');
var Game = require('../models/Game');
var logger = require('../utils/logger');
var moment = require('moment');
var Q = require('q');

function GameRepository() {
	this.findById = findGameById;
    this.findActiveGameByIds = findActiveGameByIds;
    this.findGamesByEventIds = findGamesByEventIds;
    this.findActive = findActive;
	this.createGame = createGame;
	this.updateGame = updateGame;
	this.findBy3ptData = findBy3ptData;
}

function findGameById(gameId) {
	var deferred = Q.defer();
	var query = {
		_id: gameId
	};
	Game.findOne(query, function(err, game) {
		if (err) {
			deferred.reject(new Error(err));
		}
		else {
			deferred.resolve(game);
		}
	});
	return deferred.promise;
}

function findGamesByEventIds(eventIds, active) {
    var deferred = Q.defer();

    var query = {
        event: {$in: eventIds},
    };
    if (active) query.playAt = {$gte: new Date()};
    return Game.find(query).populate('team1').populate('team2');
}
function findActiveGameByIds(gameIds) {
    var deferred = Q.defer();
    var query = {
        _id: {$in: gameIds},
        playAt: {$gte: moment()}
    };
    Game.find(query, function(err, games) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(games);
        }
    });
    return deferred.promise;
}
function findActive() {
    return Game.find({
        "playAt": {$gte: moment()}
    }).populate('team1 team2' , "name code -_id").exec()
    .then(function (games){
        return games;
    });
}
function createGame(data) {
	var game = new Game(data);
    return game.save();
}


function updateGame(game) {

    var query = {
        _id: game._id,
        status: {$ne: 'FINISHED'}
    };
    var options = {
        'new': false
    };
    return Game.findOneAndUpdate(query,
        {
            score1: game.score1,
            score2: game.score2
        },
        options
    ).exec();
}

function findBy3ptData(identifier) {
    var deferred = Q.defer();
    var query = _.reduce(identifier, (result, value, key) => {
        result[`3pt.${key}`] = value;
        return result;
    }, {});
    return Game.findOne(query).exec();
}






module.exports = GameRepository;
