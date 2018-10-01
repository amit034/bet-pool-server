const _ = require('lodash');
const mongoose = require('mongoose');
const Game = require('../models/Game');
const logger = require('../utils/logger');
const moment = require('moment');
const Q = require('q');

function GameRepository() {
	this.findById = findGameById;
    this.findActiveGameByIds = findActiveGameByIds;
    this.findGamesByEventIds = findGamesByEventIds;
    this.findActive = findActive;
	this.createGame = createGame;
	this.updateGame = updateGame;
	this.findBy3ptData = findBy3ptData;
	this.findGameByQuery = findGameByQuery;
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
    if (active) {
        query.playAt = {$gte: new Date()};
    }else if(active == false) {
        query.playAt = {$lt: new Date()};
    }
    return Game.find(query).exec();
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
    data.name = _.get(data, 'shortName' , data.name);
	const game = new Game(data);
    return game.save();
}

function findGameByQuery(guery) {
    return Game.find(guery).exec();
}
function updateGame(game) {
    var query = {
        status: {$ne: 'FINISHED'},
        _id: mongoose.Types.ObjectId(game.id),
    };
    var options = {
        'new': false
    };
    return Game.findOneAndUpdate(query,
        {
            result: game.result,
            status: game.status
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
