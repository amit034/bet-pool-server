
var Game = require('../models/Game');
var logger = require('../utils/logger');
var moment = require('moment');
var Q = require('q');

function GameRepository() {
	this.findById = findGameById;
    this.findActiveGameByIds = findActiveGameByIds;
    this.findActiveGameByEventIds = findActiveGameByEventIds;
    this.findActive = findActive;
	this.createGame = createGame;
	this.updateGame = updateGame;
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

function findActiveGameByEventIds(eventIds) {
    var deferred = Q.defer();

    var query = {
        event: {$in: eventIds},
        "playAt": {$gte: new Date()}
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
function findActiveGameByIds(gameIds) {
    var deferred = Q.defer();
    var query = {
        _id: {$in: gameIds},

        "playAt": {$gte: new Date()}
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
function createGame(eventId,team1_id,team2_id,playAt) {
	var deferred = Q.defer();
	var game = new Game({
		event: eventId,
		team1 : team1_id,
        team2 : team2_id,
        playAt : new Date(playAt)
	});
    game.save(function(err, doc) {
		if (err) {
            console.log("reject create game " + err);
			deferred.reject(new Error(err));
		}
		else {
			deferred.resolve(doc);
		}
	});
	return deferred.promise;
}


function updateGame(game) {
    var deferred = Q.defer();
    var query = {
        _id: game._id
    };
    var options = {
        'new': false
    };
    Game.findOneAndUpdate(query,
        {
            score1: game.score1,
            score2: game.score2
        },
        options,
        function(err, game) {
            if (err) {
                deferred.reject(new Error(err));
            }
            else {
                deferred.resolve(game);
            }
        }
    );
    return deferred.promise;
}






module.exports = GameRepository;
