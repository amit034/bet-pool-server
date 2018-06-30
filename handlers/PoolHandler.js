const _ = require('lodash');
const moment = require('moment');
const Q = require('q');
const Pool = require('../models/Pool');
const Bet = require('../models/Bet');
const Repository = require('../repositories/poolRepository');
const AccountRepository = require('../repositories/accountRepository');
const Challenge = require('../models/Challenge');
const GameRepository = require('../repositories/gameRepository');
const ChallengeRepository = require('../repositories/challengeRepository');
const BetRepository = require('../repositories/betRepository');
const EventRepository = require('../repositories/eventRepository');
const logger = require('../utils/logger');
const repository = new Repository();
const eventRepository = new EventRepository();
const accountRepository = new AccountRepository();
const gameRepository = new GameRepository();
const betRepository = new BetRepository();
const challengeRepository = new ChallengeRepository();
const PoolHandler = function () {
    this.createPool = handleCreatePoolRequest;
    this.addGames = handleAddGames;
    this.getGames = handleGetGames;
    this.addEvents = handleAddEvents;
    this.addParticipates = handleAddParticipates;
    this.getPools = handleGetUserPools;
    this.getUserBets = handleGetUserBets;
    this.getParticipates = handleGetParticipates;
};

// On success should return status code 201 to notify the client the account
// creation has been successful
// On error should return status code 400 and the error message
function handleCreatePoolRequest(req, res) {
    const name = req.body.name || null;
    const userId = req.params.userId || null;
    if (userId) {
        accountRepository.findById(userId)
            .then(
                function (account) {
                    if (account && account.isActive === true) {
                        repository.createPool(account, name)
                            .then(function (pool) {
                                return addParticipatesToPool(pool, [userId], req);
                            })
                            .then(function (pool) {

                                logger.log('info', 'Pool for' + userId + ' has been created.' +
                                    'Request from address ' + req.connection.remoteAddress + '.');
                                res.json(201, pool);

                            }).catch(function (err) {
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
    } else {
        logger.log('info', 'Bad request from ' +
            req.connection.remoteAddress + '. Message: UserId is required.');
        res.json(400, {
            error: 'UserId  is required.'
        });
    }
}

function handleAddGames(req, res) {
    const gameIds = req.body.games || [];
    const poolId = req.params.poolId || null;
    const userId = req.params.userId;

    repository.findById(poolId)
        .then(function (pool) {
            if (userId != pool.owner.id) {
                res.json(403, {error: "you are not the owner of the pool"});
                return Q.reject({error: "you are not the owner of the pool", code: 403})
            }
            return addGamesToPool(pool, gameIds, req);
        }).then(function (docs) {
        res.json(201, {"addedGames": docs});
    }).catch(function (err) {

        logger.log('error', 'An error has occurred while processing a request to add games ' +
            'for pool id ' + poolId + ' from ' + req.connection.remoteAddress +
            '. Stack trace: ' + err.stack);
        res.json(500, {
            error: err.message
        });
    }).done()
}

function handleGetParticipates(req, res) {
    const poolId = req.params.poolId || null;
    return repository.findById(poolId)
    .then((poolModel) => {
        return getPopulatePoolChallenges(poolModel)
            .then((challenges) => {
                const pool = poolModel.toJSON();
                pool.challenges = challenges;
                return pool;
            });
    }).then((pool) => {
        const participatesPromises = _.map(pool.participates, (participateModel) => {
            return betRepository.findUserBetsByPoolId(participateModel.user.id, poolId)
                .then((userBets) => {
                    const participate = _.pick(participateModel, ['joined']);
                    const bets = _ .map(userBets, (betModel) => {
                        const bet = betModel.toJSON();
                        const challenge = _.find(pool.challenges, {id: _.get(bet, 'challenge.id', -1)});
                        if (_.isNil(challenge)) return null;
                        const challengeFactor = _.get(challenge, 'factor', 1);
                        const poolFactors = _.get(pool, 'factors', {0: 0, 1: 10, 2: 20, 3: 30});
                        const score = betModel.score(_.parseInt(_.get(challenge ,'result.score1')), _.parseInt(_.get(challenge ,'result.score2')));
                        bet.score = _.get(poolFactors, score, 0) * challengeFactor;
                        bet.closed = challenge.closed;
                        return bet;
                    });
                    const closeBets = _.filter(bets, 'closed');
                    const totalScore = _.reduce(closeBets, (total, bet) => {
                        total += bet.score;
                        return total;
                    }, 0);
                    participate.score = totalScore;
                    participate.bets = closeBets;
                    _.assign(participate, _.pick(participateModel.user, ['id', 'username', 'joined', 'facebookUserId']));
                    return participate;
                });
        });
        return Promise.all(participatesPromises).then((participates) => {
            return res.send(participates);
        });
    }).catch((err) => {
        logger.log('error', 'An error has occurred while processing a request to handleGetParticipates ' +
            'for pool id ' + poolId + ' from ' + req.connection.remoteAddress +
            '. Stack trace: ' + err.stack);
        return res.status(500).send({
            error: err.message
        });
    });
}

function handleGetUserBets(req, res) {
    const poolId = req.params.poolId || null;
    const userId = req.params.userId || null;
    return Promise.all([
        accountRepository.findById(userId),
        repository.findById(poolId),
        betRepository.findUserBetsByPoolId(userId, poolId)
    ]).then(([account, pool, userBets]) => {
        if (_.isNull(account) || _.isNull(pool)) {
            return res.status(400).send({
                error: err.message
            });
        }
        return getPopulatePoolChallenges(pool)
        .then((challenges) => {
            let bets = _.map(challenges, (challenge) => {
                let betModel = _.find(userBets, (bet) => {
                    return bet.challenge.id === challenge.id;
                });
                if (!betModel) {
                    betModel = new Bet({
                        participate: account._id,
                        pool: pool._id,
                        challenge,
                        score1: null,
                        score2: null,
                        score: 0
                    });
                }
                const bet = betModel.toJSON();
                const score = betModel.score(_.parseInt(_.get(challenge ,'result.score1')), _.parseInt(_.get(challenge ,'result.score2')));
                const challengeFactor = _.get(challenge, 'factor', 1);
                const poolFactors = _.get(pool, 'factors', {0: 0, 1: 10, 2: 20, 3: 30});
                bet.scoore = _.get(poolFactors, score, 0) * challengeFactor;
                bet.challenge = challenge;
                bet.closed = challenge.closed;
                return bet;
            });
            if (!req.requestForMe) {
                bets = bets.reject(bets, (bet)({closed: false}));
            }
            return res.send(_.orderBy(bets, ['challenge.playAt'], ['asc']));
        });
    }).catch(function (err) {
        logger.log('error', 'An error has occurred while processing a request to handleGetUserBets ' +
            'for pool id ' + poolId + ' from ' + req.connection.remoteAddress +
            '. Stack trace: ' + err.stack);
        return res.status(500).send({
            error: err.message
        });
    });
}

function handleGetGames(req, res) {
    const poolId = req.params.poolId || null;

    return repository.findById(poolId)
        .then(function (pool) {
            return _.reduce(pool.events, function (total, event) {
                return gameRepository.findGamesByEventIds([event._id]).then((games) => {
                    return _.concat(total, games);
                });
            }, []).then((games) => {
                return res.send(games);
            });
        }).catch(function (err) {
            return res.status(500).send({
                error: err.message
            });
        });
}

function handleAddEvents(req, res) {
    const eventIds = req.body.events || [];
    const poolId = req.params.poolId || null;
    const userId = req.params.userId;
    let poolObj = null;
    repository.findById(poolId)
        .then(function (pool) {

            const deferred = Q.defer();
            if (userId != pool.owner.id) {
                res.json(403, {error: "you are not the owner of the pool"});
                return Q.reject({error: "you are not the owner of the pool", code: 403})
            }
            logger.log('info', 'found Pool' + pool._id + req.connection.remoteAddress + '.');
            poolObj = pool;
            deferred.resolve(pool);
            return deferred.promise;
        })
        .then(function (pool) {
            return addEventsToPool(pool, eventIds, req);
        })
        .then(function () {
            return gameRepository.findActiveGameByEventIds(eventIds);
        })
        .then(function (gamesIds) {
            return addGamesToPool(poolObj, gamesIds, req);
        })
        .then(function (docs) {
            res.status(201).send({"addedEvents": docs});
        })
        .catch(function (err) {
            logger.log('error', 'An error has occurred while processing a request to handleAddEvents ' +
                'for pool id ' + poolId + ' from ' + req.connection.remoteAddress +
                '. Stack trace: ' + err.stack);
            res.status(500).send({error: err.message});
        })
        .done()
}

function handleAddParticipates(req, res) {
    const inviteesIds = req.body.invitees || [];
    const poolId = req.params.poolId || null;
    const userId = req.params.userId;
    repository.findById(poolId).then(function (pool) {
        if (userId === _.toString(pool.owner._id)) {
            return addParticipatesToPool(pool, inviteesIds, req);
        } else {
            res.status(403).send({error: "you are not the owner of the pool"});
            return Q.reject({error: "you are not the owner of the pool", code: 403})

        }

    }).then(function (docs) {
        return res.status(201).send({"addedParticipates": docs});
    }).catch(function (err) {
        if (err && err.code != 403) {
            logger.log('error', 'An error has occurred while processing a request to add participates ' +
                'for pool id ' + poolId + ' from ' + req.connection.remoteAddress +
                '. Stack trace: ' + err.stack);
            return res.status(500).send({error: err.message});
        }
    });
}

function handleGetUserPools(req, res) {
    const userId = req.params.userId;
    return repository.findByUserId(userId)
        .then(function (pools) {
            return res.send(pools);
        })
        .catch(function (err) {
            return res.status(500).send({
                error: err.message
            });
        })
}

function handleUpdatePoolRequest(req, res) {
    const gameIds = req.body.games || [];
    const eventsIds = req.body.events || [];
    const inviteesIds = req.body.invitees || [];
    const poolId = req.params.poolId || null;

    return repository.findById(poolId).then(function (pool) {
        return Promise.all([addGamesToPool(pool, gameIds, req), addEventsToPool(pool, eventsIds, req), addParticipatesToPool(pool, inviteesIds, req)]).then(function (promises) {
            return res.status(201).send({"addedGames": promises[0], "addedEvents": promises[1]});
        }).catch(function (err) {
            res.status(500).send({
                error: err.message
            });
        })
    })
}

function addGamesToPool(pool, gamesIds, req) {
    return gameRepository.findActiveGameByIds(gamesIds)
        .then(function (games) {
            if (games && games.length > 0) {
                logger.log('info', 'Pool' + pool._id + ' has' + games.length + " to be added " +
                    'Request from address ' + req.connection.remoteAddress + '.');
                return repository.addGames(pool._id, games)
                    .then(
                        function (doc) {
                            logger.log('info', 'games added to Pool' + pool._id +
                                'Request from address ' + req.connection.remoteAddress + '.');
                            return Promise.resolve(doc);
                        }).catch(
                        function (err) {
                            logger.log('error', 'An error has occurred while processing a request to create an ' +
                                'Pool from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
                            return Promise.reject(err);
                        }
                    );
            } else {

                logger.log('info', 'no games found to be added ' + gamesIds + ', no ' +
                    'such id exists. Request from address ' + req.connection.remoteAddress + '.');
                return Promise.resolve([]);
            }
        }).catch(
            function (err) {
                logger.log('error', 'An error has occurred while processing a request to retrieve ' +
                    'game id ' + gamesIds + ' from ' + req.connection.remoteAddress +
                    '. Stack trace: ' + err.stack);
                return Promise.reject(err);
            });
}

function addEventsToPool(pool, eventsIds, req) {

    return eventRepository.findActiveEventsByIds(eventsIds)
        .then(function (events) {
            if (events && events.length > 0) {
                return repository.addEvents(pool._id, events)
                    .then(
                        function (doc) {
                            logger.log('info', 'add game to Pool' + pool._id + ' has been created.' +
                                'Request from address ' + req.connection.remoteAddress + '.');
                            return Promise.resolve(doc);
                        }).catch(
                        function (err) {
                            logger.log('error', 'An error has occurred while processing a request to create an ' +
                                'Pool from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
                            return Promise.reject(err);
                        }
                    )
            } else {
                logger.log('info', 'event not found or not active ' + eventsIds + ', no ' +
                    'such id exists. Request from address ' + req.connection.remoteAddress + '.');
                return Promise.resolve([]);
            }
        }).catch(
            function (err) {
                logger.log('error', 'An error has occurred while processing a request to retrieve ' +
                    'game id ' + eventsIds + ' from ' + req.connection.remoteAddress +
                    '. Stack trace: ' + err.stack);
                return Promise.reject(err);
            });
}


function addParticipatesToPool(pool, usersIds, req) {
    return accountRepository.findActiveAccountsByIds(usersIds)
        .then(function (users) {
            if (users && users.length > 0) {
                const participatesToAdd = [];
                users.forEach(function (user) {
                    participatesToAdd.push({'user': user._id, 'joined': user.equals(pool.owner)});
                });

                return repository.addParticipates(pool._id, participatesToAdd)
                    .then(
                        function (doc) {
                            logger.log('info', 'add users to Pool' + pool._id + ' has been created.' +
                                'Request from address ' + req.connection.remoteAddress + '.');
                            return Promise.resolve(doc);
                        }).catch(
                        function (err) {
                            logger.log('error', 'An error has occurred while processing a request to add users to ' +
                                'Pool from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
                            return Promise.reject(err);
                        }
                    )
            } else {
                console.log('users not found');
                logger.log('info', 'users not found or not active ' + usersIds + ', no ' +
                    'such id exists. Request from address ' + req.connection.remoteAddress + '.');
                return Promise.resolve([]);
            }
        }).catch(
            function (err) {
                logger.log('error', 'An error has occurred while processing a request to add ' +
                    'users ids ' + usersIds + ' from ' + req.connection.remoteAddress +
                    '. Stack trace: ' + err.stack);
                Promise.reject(err);
            });
}

function getPopulatePoolChallenges(pool) {
    return _.reduce(pool.events, function (total, event) {
        return gameRepository.findGamesByEventIds([event._id]).then((games) => {
            return _.concat(total, games);
        });
    },
    []).then((games) => {
        const fullTime = _.map(games, (game) => {
            return challengeRepository.findByQuery({
                refId: game.id,
                refName: 'Game',
                type: Challenge.TYPES.FULL_TIME
            }).then(([challenge]) => {
                if (_.isNil(challenge)) return challenge;
                const item = challenge.toJSON();
                item.game = game.toJSON();
                return item;
            });
        });
        const pollChallenges = _.map(pool.challenges, (challenge) => {
            return challengeRepository.findById(challenge.id);
        });
        return Promise.all(_.union(fullTime, pollChallenges)).then((challenges) => _.reject(challenges, _.isNil));
    });
}
module.exports = PoolHandler;

