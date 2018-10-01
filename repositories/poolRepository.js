const _ = require('lodash');
const Pool = require('../models/Pool');
const Game = require('../models/Game');
const Account = require('../models/Account');
var logger = require('../utils/logger');
var Q = require('q');
const mongoose = require('mongoose');

function PoolRepository() {
    this.findById = findById;
    this.createPool = createPool;
    this.addGames = addGames;
    this.addEvents = addEvents;
    this.addParticipates = addParticipates;
    this.findGameById = findGameById;
    this.findByQuery = findByQuery;
    this.findParticipateByUserId = findParticipateByUserId;
    this.findByUserId = findByUserId;
}

function findById(id) {
    var query = {
        _id: id
    };
    return Pool.findOne(query)
    .populate({path: 'events', model: 'Event'})
    .exec()
    .then((pool) => {
        return Game.populate(pool.events, {path: 'games'})
    .then(() => {
        return Account.populate(pool.participates, {path: 'user'});
    })
    .then(() => pool);
    });
}

function findByQuery(query) {
    return Pool.find(query).exec();
}
function findByUserId(userId) {
    return Pool.find({'participates.user': userId}).exec();
}

function findParticipateByUserId(poolId, userId) {

    return Pool.findOne({_id: poolId, 'participates.user': userId, 'participates.joined': true})
    .then((pool) => {
        if (pool && pool.participates) {
            return _.find(pool.participates, (participate) => {
                return _.toString(participate.user) === userId;
            })
        }
        return null;
    });
}

function findGameById(poolId, gameId) {
    var deferred = Q.defer();

    Pool.findOne({_id: poolId, 'games': gameId}).populate({path: 'games', model: 'Game'}).exec(function (err, pool) {

        if (err) {
            deferred.reject(err);
        }
        else {
            if (pool && pool.games) {
                deferred.resolve(pool.games[0]);
            } else {
                deferred.resolve(null);
            }

        }
    });
    return deferred.promise;
}

function createPool(owner, name) {
    var deferred = Q.defer();
    var pool = new Pool({
        owner: owner,
        name: name
    });
    pool.save(function (err, doc) {
        if (err) {
            deferred.reject(new Error(err));
        }
        else {
            deferred.resolve(doc);
        }
    });
    return deferred.promise;
}


function addGames(poolId, games) {
    var deferred = Q.defer();

    var query = {
        _id: poolId
    };

    Pool.update(query, {$addToSet: {games: {$each: games}}}, function (err, doc) {
        if (err) {
            deferred.reject(new Error(err));
        }
        else {
            deferred.resolve(doc);
        }
    });
    return deferred.promise;
}

function addEvents(poolId, events) {
    var deferred = Q.defer();
    var query = {
        _id: poolId
    };

    Pool.update(query, {$addToSet: {events: {$each: events}}}, function (err, doc) {
        if (err) {
            deferred.reject(new Error(err));
        }
        else {
            deferred.resolve(doc);
        }
    });
    return deferred.promise;
}

function addInvitees(poolId, accounts) {
    var deferred = Q.defer();
    var query = {
        _id: poolId
    };

    Pool.update(query, {$addToSet: {invitees: {$each: accounts}}}, function (err, doc) {
        if (err) {
            deferred.reject(new Error(err));
        }
        else {
            deferred.resolve(doc);
        }
    });
    return deferred.promise;
}

function addParticipates(poolId, participates) {
    var query = {
        _id: poolId
    };

    return Pool.update(query, {$addToSet: {'participates': {$each: participates}}}).exec()
    .then(()=>{
        return Pool.findOne(query).exec();
    });
}

module.exports = PoolRepository;
