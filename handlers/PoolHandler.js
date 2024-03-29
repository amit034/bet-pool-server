const _ = require('lodash');
const Q = require('q');
const {Bet, Challenge, Sequelize} = require('../models');
const {Op} = Sequelize;
const repository = require('../repositories/poolRepository');
const accountRepository = require('../repositories/accountRepository');
const gameRepository = require('../repositories/gameRepository');
const challengeRepository = require('../repositories/challengeRepository');
const betRepository = require('../repositories/betRepository');
const eventRepository = require('../repositories/eventRepository');
const logger = require('../utils/logger');

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
                                return addParticipatesToPool(pool, [userId], true, req);
                            })
                            .then(function (pool) {

                                logger.log('info', 'Pool for' + userId + ' has been created.' +
                                    'Request from address ' + req.connection.remoteAddress + '.');
                                res.status(201).send(pool);

                            }).catch(function (err) {
                            logger.log('error', 'An error has occurred while processing a request to create an ' +
                                'Pool from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
                            res.status(400).send({
                                error: err.message
                            });
                        }).done();
                    } else {
                        console.log('account not found');
                        logger.log('info', 'Could not retrieve account ' + userId + ', no ' +
                            'such id exists. Request from address ' + req.connection.remoteAddress + '.');
                        res.status(400).send({
                            error: "No account found matching id " + userId
                        });
                    }
                }).catch(
            function (err) {
                logger.log('error', 'An error has occurred while processing a request to retrieve ' +
                    'account id ' + userId + ' from ' + req.connection.remoteAddress +
                    '. Stack trace: ' + err.stack);
                res.status(500).send({
                    error: err.message
                });
            }).done();
    } else {
        logger.log('info', 'Bad request from ' +
            req.connection.remoteAddress + '. Message: UserId is required.');
        res.status(400).send({
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
            if (userId !== pool.owner.id) {
                res.status(403).send({error: "you are not the owner of the pool"});
                return Q.reject({error: "you are not the owner of the pool", code: 403});
            }
            return addGamesToPool(pool, gameIds, req);
        }).then(function (docs) {
        res.status(201).send({"addedGames": docs});
    }).catch(function (err) {
        logger.error('An error has occurred while processing a request to add games ' +
            'for pool id ' + poolId + ' from ' + req.connection.remoteAddress +
            '. Stack trace: ' + err.stack);
        res.status(500).send({
            error: err.message
        });
    }).done();
}

function handleGetParticipates(req, res) {
    const poolId = req.params.poolId || null;
    const challengeId = req.query.challengeId || null;
    const betsPromise = challengeId ? betRepository.findByChallengeId(challengeId, {}) : betRepository.findUsersBetsByPoolId(poolId);
    return Promise.all([repository.findById(poolId), betsPromise])
        .then(([pool, usersBets]) => {
            return getPopulatePoolChallenges(pool, false)
                .then((challenges) => {
                    pool.challenges = _.map(challenges, item => item.toJSON());
                    return [pool, _.map(usersBets, bet => bet.toJSON())];
                });
        }).then(([pool, usersBets]) => {
            const poolFactors = _.get(pool, 'factors', {0: 0, 1: 10, 2: 20, 3: 30});
            const challengeRounds = _.groupBy(pool.challenges, c => c.game.round);
            const participates = _.map(pool.participates, (participateModel) => {
                const participate = _.pick(participateModel, ['joined']);
                _.assign(participate, _.pick(participateModel.user, ['userId', 'username', 'picture', 'firstName', 'lastName', 'joined', 'facebookUserId', 'isBot']));
                const userBets = _.filter(usersBets, {userId: participate.userId});
                const challengeBets = _.keyBy(userBets, 'challengeId');
                const poolScore = _.reduce(challengeRounds, (poolScore, challenges) => {
                    const round = _.reduce(challenges, (roundScore, challenge) => {
                        const bet = challengeBets[challenge.id];
                        if(bet) {
                            const betModel = new Bet(bet);
                            const medal = betModel.score(_.parseInt(_.get(challenge, 'score1')), _.parseInt(_.get(challenge, 'score2')));
                            const challengeFactor = _.get(challenge, 'factorId', 1);
                            bet.score = _.get(poolFactors, medal, 0) * challengeFactor;
                            bet.closed = !challenge.isOpen;
                            bet.factor = challengeFactor;
                            bet.medal = medal;
                            if(bet.medal){
                                roundScore.score += bet.score;
                                _.set(roundScore.medals, bet.medal, _.get(roundScore.medals, bet.medal, 0) + (1 * bet.factor));
                            }
                            if (bet.closed || bet.isBot){
                                roundScore.bets.push(bet);
                            }
                        }
                        return roundScore;

                    }, {score: 0, medals:{1: 0, 2: 0, 3: 0}, bets: []});
                    poolScore.score += round.score;
                    _.forEach(round.medals, (count, medal) => {
                        poolScore.medals[medal] += count;
                    });
                    poolScore.rounds.push(round);
                    return poolScore;
                }, {score: 0, medals:{1: 0, 2: 0, 3: 0}, rounds: []});
                _.assign(participate, poolScore);
                return participate;
            });
            return res.send(participates);

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
        betRepository.findUserBetsByQuery({userId, poolId})
    ]).then(([account, pool, userBets]) => {
        if (_.isNull(account) || _.isNull(pool)) {
            return res.status(400).send({
                error: 'missing account'
            });
        }
        return getPopulatePoolChallenges(pool)
            .then((challenges) => {
                let bets = _.map(challenges, (challenge) => {
                    let betModel = _.find(userBets, {challengeId: challenge.id});
                    if (!betModel) {
                        betModel = new Bet({
                            userId: account.userId,
                            poolId: pool.id,
                            challenge,
                            score1: null,
                            score2: null,
                            score: 0
                        });
                    }
                    const bet = betModel.toJSON();
                    const medal = betModel.score(_.parseInt(_.get(challenge, 'score1')), _.parseInt(_.get(challenge, 'score2')));
                    const challengeFactor = _.get(challenge, 'factorId', 1);
                    const poolFactors = _.get(pool, 'factors', {0: 0, 1: 10, 2: 20, 3: 30});
                    bet.score = _.get(poolFactors, medal, 0) * challengeFactor;
                    bet.medal = medal;
                    bet.challenge = challenge;
                    bet.challengeId = challenge.id;
                    bet.closed = !challenge.isOpen;
                    return bet;
                });
                if (!req.requestForMe) {
                    bets = _.reject(bets, (b) => {
                        return b.close && !b.isBot;
                    });
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
            if (!pool.owner.equals(userId)) {
                return Q.reject({error: "you are not the owner of the pool", code: 403});
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
            return gameRepository.findGamesByEventIds(eventIds);
        })
        .then(function (gamesIds) {
            return addGamesToPool(poolObj, gamesIds, req);
        })
        .then(function (docs) {
            return res.status(201).send({"addedEvents": docs});
        })
        .catch(function (err) {
            logger.log('error', 'An error has occurred while processing a request to handleAddEvents ' +
                'for pool id ' + poolId + ' from ' + req.connection.remoteAddress +
                '. Stack trace: ' + err.stack);
            return res.status(500).send({error: err.message});
        })
        .done();
}

function handleJoinToPool(req, res) {
    const poolId = req.params.poolId || null;
    const userId = req.currentUser.userId;
    repository.findById(poolId).then(function (pool) {
        return addParticipatesToPool(pool, [userId], true, req);
    }).then(function (docs) {
        return res.status(201).send(docs);
    }).catch(function (err) {
        if (err && err.code !== 403) {
            logger.log('error', 'An error has occurred while processing a request to add participates ' +
                'for pool id ' + poolId + ' from ' + req.connection.remoteAddress +
                '. Stack trace: ' + err.stack);
            return res.status(500).send({error: err.message});
        }
    });
}

function handleAddParticipates(req, res) {
    const inviteesIds = req.body.invitees || [];
    const poolId = req.params.poolId || null;
    const userId = req.params.userId;
    repository.findById(poolId).then(function (pool) {
        if (userId === _.toString(pool.owner._id)) {
            return addParticipatesToPool(pool, inviteesIds, false, req);
        } else {
            res.status(403).send({error: "you are not the owner of the pool"});
            return Q.reject({error: "you are not the owner of the pool", code: 403})

        }

    }).then(function (docs) {
        return res.status(201).send({"addedParticipates": docs});
    }).catch(function (err) {
        if (err && err.code !== 403) {
            logger.log('error', 'An error has occurred while processing a request to add participates ' +
                'for pool id ' + poolId + ' from ' + req.connection.remoteAddress +
                '. Stack trace: ' + err.stack);
            return res.status(500).send({error: err.message});
        }
    });
}

async function handleGetUserPools(req, res) {
    const {userId} = req.params;
    const {isActive = 'true', code = ''} = req.query;
    try{
        const userPools = await repository.findPoolsByUserId(userId);
        const poolWhere  = _.isEmpty(code) ? {public: true} : {public: false, code};
        const otherPools = await repository.findAllByQuery(poolWhere, {participates: true, events: true});
        const bots = await accountRepository.findAccountsByQuery({isBot: 1});
        const botsIds = _.map(bots, 'userId');
        const pools = _.uniqBy(_.filter(_.concat(userPools, otherPools), ({events}) => _.some(events, {isActive: isActive.toLowerCase() === 'true'})), 'poolId');
        const poolList = _.map(pools, pool => {
            const item = pool.toJSON();
            const buyIn = _.parseInt(_.get(item, 'buyIn', '0'));
            item.participates = _.map(item.participates, (p) => _.assign({}, p, {isBot: _.includes(botsIds, p.userId)}));
            const payingParticipates = _.reject(item.participates, {isBot: true});
            item.pot = buyIn * _.size(payingParticipates);
            item.prices = [buyIn * _.ceil(_.size(payingParticipates) * 0.4)];
            item.isActive = _.some(item.events, ({PoolEvent}) => _.get(PoolEvent, 'isActive'));
            return item;
        });
        return res.send(poolList);
    }catch (err) {
        logger.log('error', 'An error has occurred while processing a request to getUserPools ' +
            'Pool from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
        return res.status(500).send({
            error: err.message
        });
    }
}

// function handleUpdatePoolRequest(req, res) {
//     const gameIds = req.body.games || [];
//     const eventsIds = req.body.events || [];
//     const inviteesIds = req.body.invitees || [];
//     const poolId = req.params.poolId || null;
//
//     return repository.findById(poolId).then(function (pool) {
//         return Promise.all([addGamesToPool(pool, gameIds, req), addEventsToPool(pool, eventsIds, req), addParticipatesToPool(pool, inviteesIds, false, req)]).then(function (promises) {
//             return res.status(201).send({"addedGames": promises[0], "addedEvents": promises[1]});
//         }).catch(function (err) {
//             res.status(500).send({
//                 error: err.message
//             });
//         });
//     });
// }

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
                    );
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


async function addParticipatesToPool(pool, usersIds, join, req, {transaction} = {}) {
    const users = await accountRepository.findActiveAccountsByIds(usersIds)
    try {
        pool = await repository.setParticipates(pool.poolId, _.map(users, 'userId'), join, {transaction});
        logger.log('info', 'add users to Pool' + pool.poolId + ' has been created.' +
            'Request from address ' + req.connection.remoteAddress + '.');
        return Promise.resolve(pool);
    } catch (err) {
        logger.error('An error has occurred while processing a request to add users to ' +
            'Pool from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
        return Promise.reject(err);
    }
}


function getPopulatePoolChallenges(pool, active , challangeId) {
    const events = _.keyBy(pool.events, 'id');
    return gameRepository.findGamesByEventIds(_.keys(events), active)
    .then((games) => {
        const filter = _.filter(games, (game) => {
            const event = _.get(events, game.eventId);
            const filter = _.get(event, 'PoolEvent.filter', 0);
            return _.parseInt(game.round) >= _.parseInt(filter);
        })
        const challengesQuery = {
                        refId: {[Op.in]: _.map(filter, 'id')},
                        refName: 'Game',
                        type: Challenge.TYPES.FULL_TIME
        };
        const poolChallengesQuery = {
            id: {[Op.in]: _.map(pool.challenges, 'id')},
        };

        if (challangeId){
            challengesQuery.id = challangeId;
            poolChallengesQuery.id = {[Op.in]: _.map(_.filter(pool.challenges,{id: challangeId}, 'id'))};
        }
        const fullTimeQ = challengeRepository.findAllByQuery(challengesQuery);
        const pollChallengesQ = poolChallengesQuery ? challengeRepository.findAllByQuery(poolChallengesQuery) : Promise.resolve([]);
        return Promise.all([fullTimeQ, pollChallengesQ]).then(([fullTime, pollChallenges]) => {
            return  _.uniqBy(_.reject(_.concat(fullTime, pollChallenges), _.isNil), 'id');
        });
    });
}

module.exports = {
        createPool: handleCreatePoolRequest,
        addGames: handleAddGames,
        getGames: handleGetGames,
        addEvents: handleAddEvents,
        addParticipates: handleAddParticipates,
        joinToPool: handleJoinToPool,
        getPools: handleGetUserPools,
        getUserBets: handleGetUserBets,
        getParticipates: handleGetParticipates
};

