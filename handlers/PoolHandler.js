const _ = require('lodash');
const moment = require('moment');
const Q = require('q');
const {Bet, Challenge, Sequelize} = require('../models');
const {Op} = Sequelize;
const repository = require('../repositories/poolRepository');
const accountRepository = require('../repositories/accountRepository');
const poolInviteRepository = require('../repositories/poolInviteRepository');
const gameRepository = require('../repositories/gameRepository');
const challengeRepository = require('../repositories/challengeRepository');
const betRepository = require('../repositories/betRepository');
const eventRepository = require('../repositories/eventRepository');
const goalLogRepository = require('../repositories/goalLogRepository');
const poolInviteHandler = require('./PoolInviteHandler');
const logger = require('../utils/logger');
const betScoring = require('../utils/betScoring');
const crypto = require('crypto');

function poolScoringMode(pool) {
    return _.get(pool, 'factorsStrategy', betScoring.SCORING_MODE.CLASSIC);
}

function scoreBetForChallenge(bet, challenge, pool) {
    const poolFactors = _.get(pool, 'factors', betScoring.DEFAULT_POOL_FACTORS);
    const computed = betScoring.computeBetScore({
        bet,
        challenge,
        poolFactors,
        actualScore1: _.get(challenge, 'score1'),
        actualScore2: _.get(challenge, 'score2'),
        scoringMode: poolScoringMode(pool)
    });
    betScoring.applyBetScoreFields(bet, computed);
    return bet;
}

function poolIdFrom(pool) {
    return pool.poolId || pool.id;
}

function formatOwnerAccount(account) {
    if (!account) {
        return null;
    }
    const a = account.toJSON ? account.toJSON() : account;
    return {
        userId: a.userId,
        username: a.username,
        firstName: a.firstName,
        lastName: a.lastName,
        picture: a.picture
    };
}

function isPoolRegistrationOpen(pool) {
    if (!pool.lastCheckIn) {
        return true;
    }
    return moment(pool.lastCheckIn).isAfter(moment());
}

function teamPairKey(homeTeamId, awayTeamId) {
    const a = _.toInteger(homeTeamId);
    const b = _.toInteger(awayTeamId);
    return a < b ? `${a}-${b}` : `${b}-${a}`;
}

/**
 * For each game, find the most recent earlier fixture in the same event between the same two teams
 * (unordered pair). Used for two-legged ties / head-to-head within a competition.
 */
function buildPreviousLegMap(gameRows) {
    const prevByGameId = {};
    const byEvent = _.groupBy(gameRows, 'eventId');
    _.forEach(byEvent, (eventGames) => {
        const sorted = _.sortBy(eventGames, (g) => new Date(g.playAt).getTime());
        for (let i = 0; i < sorted.length; i++) {
            const g = sorted[i];
            const key = teamPairKey(g.homeTeamId, g.awayTeamId);
            let prev = null;
            for (let j = i - 1; j >= 0; j--) {
                const h = sorted[j];
                if (teamPairKey(h.homeTeamId, h.awayTeamId) === key) {
                    prev = h;
                    break;
                }
            }
            if (prev) {
                const pj = prev.toJSON();
                prevByGameId[g.id] = {
                    homeTeam: pj.homeTeam,
                    awayTeam: pj.awayTeam,
                    score1: pj.homeTeamScore,
                    score2: pj.awayTeamScore,
                    playAt: pj.playAt
                };
            }
        }
    });
    return prevByGameId;
}

// On success should return status code 201 to notify the client the account
// creation has been successful
// On error should return status code 400 and the error message
function handleCreatePoolRequest(req, res) {
    const name = req.body.name || null;
    const userId = req.params.userId || null;
    const factorsStrategy = _.parseInt(req.body.factorsStrategy, 10);
    const scoringMode = factorsStrategy === betScoring.SCORING_MODE.ODDS
        ? betScoring.SCORING_MODE.ODDS
        : betScoring.SCORING_MODE.CLASSIC;
    if (userId) {
        accountRepository.findById(userId)
            .then(
                function (account) {
                    if (account && account.isActive === true) {
                        const buyIn = _.parseInt(req.body.buyIn, 10);
                        const poolDetails = {
                            ownerId: account.userId,
                            name,
                            public: req.body.isPublic !== false && req.body.public !== false,
                            buyIn: _.isNaN(buyIn) ? 0 : Math.max(0, buyIn),
                            code: crypto.randomBytes(4).toString('hex'),
                            factorsStrategy: scoringMode
                        };
                        repository.createPool(poolDetails)
                            .then(function (pool) {
                                return addParticipatesToPool(pool, [userId], true, req);
                            })
                            .then(function (pool) {
                                const full = pool.toJSON ? pool.toJSON() : pool;
                                logger.log('info', 'Pool for' + userId + ' has been created.' +
                                    'Request from address ' + req.connection.remoteAddress + '.');
                                res.status(201).send(full);

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
            const challengeRounds = _.groupBy(pool.challenges, c => c.game.round);
            const participates = _.map(pool.participates, (participateModel) => {
                const participate = _.pick(participateModel, ['joined']);
                _.assign(participate, _.pick(participateModel.user, ['userId', 'username', 'picture', 'firstName', 'lastName', 'joined', 'facebookUserId', 'isBot']));
                const userBets = _.filter(usersBets, {userId: participate.userId});
                const challengeBets = _.keyBy(userBets, 'challengeId');
                const poolScore = _.reduce(challengeRounds, (poolScore, challenges) => {
                    const round = _.reduce(challenges, (roundScore, challenge) => {
                        roundScore.round = challenge.game.round;
                        const bet = challengeBets[challenge.id];
                        if(bet) {
                            const challengeFactor = _.get(challenge, 'factorId', 1);
                            scoreBetForChallenge(bet, challenge, pool);
                            bet.closed = !challenge.isOpen;
                            bet.status = challenge.status;
                            bet.factor = challengeFactor;
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
                const eventIds = _.map(pool.events, 'id');
                return gameRepository.findGamesByEventIdsWithTeams(eventIds)
                    .then((allEventGames) => {
                        const previousLegByGameId = buildPreviousLegMap(allEventGames);
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
                            scoreBetForChallenge(bet, challenge, pool);
                            bet.challenge = challenge.toJSON();
                            const gameId = _.get(bet.challenge, 'game.id');
                            if (gameId && previousLegByGameId[gameId]) {
                                bet.challenge.game.previousLeg = previousLegByGameId[gameId];
                            }
                            bet.challengeId = challenge.id;
                            bet.closed = !challenge.isOpen;
                            return bet;
                        });
                        return bets;
                    })
                    .then((bets) => {
                        if (!req.requestForMe) {
                            bets = _.reject(bets, (b) => {
                                return b.close && !b.isBot;
                            });
                        }
                        return res.send(_.orderBy(bets, ['challenge.playAt'], ['asc']));
                    });
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

async function handleJoinToPool(req, res) {
    const poolId = _.parseInt(req.params.poolId, 10);
    const userId = req.currentUser.userId;
    const code = _.get(req, 'body.code', req.query.code) || '';
    try {
        const pool = await repository.findById(poolId);
        if (!pool) {
            return res.status(404).send({error: 'Pool not found'});
        }
        const participation = await repository.findByParticipation(poolId, userId);
        if (participation && participation.joined === true) {
            const full = await repository.findById(poolId);
            return res.status(200).send(full);
        }
        if (!isPoolRegistrationOpen(pool)) {
            return res.status(400).send({error: 'Registration is closed for this pool'});
        }
        const hasAccess = await repository.userHasPoolAccess(pool, userId, {code});
        if (!pool.public && !hasAccess) {
            return res.status(403).send({error: 'Invalid pool code or invite required'});
        }
        await addParticipatesToPool(pool, [userId], true, req);
        await repository.consumeEmailInviteForUser(poolId, userId);
        const full = await repository.findById(poolId);
        return res.status(201).send(full);
    } catch (err) {
        if (err && err.code === 403) {
            return;
        }
        logger.log('error', 'handleJoinToPool pool ' + poolId + ' from ' + req.connection.remoteAddress +
            '. Stack trace: ' + err.stack);
        return res.status(500).send({error: err.message});
    }
}

async function handleGetPoolPreview(req, res) {
    const poolId = _.parseInt(req.params.poolId, 10);
    const userId = req.currentUser.userId;
    const joinCode = req.query.joinCode || '';
    const inviteToken = req.query.inviteToken || '';
    try {
        const pool = await repository.findById(poolId);
        if (!pool) {
            return res.status(404).send({error: 'Pool not found'});
        }
        const pid = poolIdFrom(pool);
        const participation = await repository.findByParticipation(pid, userId);
        const isParticipant = !!(participation && participation.joined === true);
        const isInvited = !!(participation && participation.joined === false);
        const hasAccess = await repository.userHasPoolAccess(pool, userId, {code: joinCode, inviteToken});
        const isOpen = isPoolRegistrationOpen(pool);
        let canJoin = isOpen && !isParticipant;
        let joinBlockedReason = null;
        if (!isOpen) {
            canJoin = false;
            joinBlockedReason = 'Registration closed';
        } else if (!pool.public && !hasAccess && !isInvited && !isParticipant) {
            canJoin = false;
            joinBlockedReason = 'Pool code or invite required';
        } else if (isParticipant) {
            canJoin = false;
            joinBlockedReason = 'Already joined';
        }
        const botsIds = await repository.getBotUserIds();
        const players = await repository.getPlayerCounts(pid);
        const {pot, firstPrize} = repository.computePotAndFirstPrize(pool.participates, pool.buyIn, botsIds);
        const ownerAccount = await accountRepository.findById(pool.ownerId);
        const friendsParticipating = await repository.findFriendsInPool(pid, userId, 3);
        const emailInvited = !isInvited && !isParticipant && hasAccess && !pool.public;
        return res.send({
            poolId: pid,
            name: pool.name,
            image: pool.image,
            public: !!pool.public,
            factorsStrategy: _.get(pool, 'factorsStrategy', betScoring.SCORING_MODE.CLASSIC),
            isOpen,
            canJoin,
            joinBlockedReason,
            lastCheckIn: pool.lastCheckIn,
            buyIn: pool.buyIn,
            pot,
            firstPrize,
            players,
            isParticipant,
            isInvited: isInvited || emailInvited,
            owner: formatOwnerAccount(ownerAccount),
            friendsParticipating
        });
    } catch (err) {
        logger.log('error', 'handleGetPoolPreview pool ' + poolId + ' from ' + req.connection.remoteAddress +
            '. Stack trace: ' + err.stack);
        return res.status(500).send({error: err.message});
    }
}

async function handleCreatePoolInvites(req, res) {
    const poolId = _.parseInt(req.params.poolId, 10);
    const userId = _.parseInt(req.params.userId, 10);
    const invitees = _.get(req, 'body.invitees', []);
    const inviteeEmails = _.get(req, 'body.inviteeEmails', []);
    try {
        const pool = await repository.findById(poolId);
        if (!pool) {
            return res.status(404).send({error: 'Pool not found'});
        }
        if (_.toInteger(pool.ownerId) !== userId) {
            return res.status(403).send({error: 'you are not the owner of the pool'});
        }
        const participantEmails = new Set(
            _.compact(_.map(pool.participates, (p) => {
                const u = p.user || {};
                return poolInviteRepository.normalizeEmail(u.email);
            }))
        );
        const addedUserIds = [];
        if (!_.isEmpty(invitees)) {
            const ids = _.uniq(_.map(invitees, (id) => _.parseInt(id, 10)).filter((id) => !_.isNaN(id)));
            const toInvite = [];
            for (const id of ids) {
                const existing = await repository.findByParticipation(poolId, id);
                if (!existing || existing.joined !== true) {
                    toInvite.push(id);
                }
            }
            if (!_.isEmpty(toInvite)) {
                await addParticipatesToPool(pool, toInvite, false, req);
                addedUserIds.push(...toInvite);
            }
        }
        const emailInvites = [];
        let emailInvitesError = null;
        for (const rawEmail of inviteeEmails) {
            const email = poolInviteRepository.normalizeEmail(rawEmail);
            if (!email || participantEmails.has(email)) {
                continue;
            }
            try {
                const row = await poolInviteRepository.createForEmail({
                    poolId,
                    email,
                    createdBy: userId
                });
                const base = poolInviteHandler.buildInviteBaseUrl(req);
                emailInvites.push({
                    email: row.email,
                    token: row.token,
                    expiresAt: row.expiresAt,
                    inviteUrl: `${base}/pools/${poolId}?inviteToken=${encodeURIComponent(row.token)}`
                });
                participantEmails.add(email);
            } catch (ex) {
                emailInvitesError = ex.message;
            }
        }
        const joinLink = `${poolInviteHandler.buildInviteBaseUrl(req)}/pools/${poolId}?joinCode=${encodeURIComponent(pool.code || '')}`;
        return res.status(201).send({
            joinLink,
            addedUserIds,
            emailInvites,
            emailInvitesError
        });
    } catch (err) {
        logger.log('error', 'handleCreatePoolInvites pool ' + poolId + ' from ' + req.connection.remoteAddress +
            '. Stack trace: ' + err.stack);
        return res.status(500).send({error: err.message});
    }
}

async function handleListPendingPoolInvites(req, res) {
    const poolId = _.parseInt(req.params.poolId, 10);
    const userId = _.parseInt(req.params.userId, 10);
    try {
        const pool = await repository.findById(poolId);
        if (!pool) {
            return res.status(404).send({error: 'Pool not found'});
        }
        if (_.toInteger(pool.ownerId) !== userId) {
            return res.status(403).send({error: 'you are not the owner of the pool'});
        }
        const rows = await poolInviteRepository.listPendingForPool(poolId);
        return res.send(_.map(rows, (row) => {
            const j = row.toJSON ? row.toJSON() : row;
            return {
                id: j.id,
                email: j.email,
                expiresAt: j.expiresAt,
                createdAt: j.createdAt
            };
        }));
    } catch (err) {
        logger.log('error', 'handleListPendingPoolInvites pool ' + poolId + ' from ' + req.connection.remoteAddress +
            '. Stack trace: ' + err.stack);
        return res.status(500).send({error: err.message});
    }
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

async function handleGetPoolGoals(req, res) {
    const poolId = _.parseInt(req.params.poolId, 10);
    try {
        const pool = await repository.findById(poolId);
        if (!pool) {
            return res.status(404).send({error: 'Pool not found'});
        }
        const eventIds = _.map(pool.events, 'id');
        if (_.isEmpty(eventIds)) {
            return res.send([]);
        }
        const logs = await goalLogRepository.findByPoolEventIds(eventIds);
        const challenges = _.filter(pool.challenges, {refName: 'Game'});
        const byGameId = _.keyBy(challenges, (c) => _.toInteger(c.refId));
        const rows = _.map(logs, (log) => {
            const row = log.toJSON();
            const game = row.game || {};
            const ch = byGameId[row.gameId];
            return {
                roundId: game.round,
                gameId: row.gameId,
                challengeId: ch ? ch.id : null,
                score1: row.score1,
                score2: row.score2,
                createdAt: row.createdAt
            };
        });
        return res.send(rows);
    } catch (err) {
        logger.log('error', 'handleGetPoolGoals pool ' + poolId + ' from ' + req.connection.remoteAddress +
            '. Stack trace: ' + err.stack);
        return res.status(500).send({error: err.message});
    }
}

async function handleGetPool(req, res) {
    const poolId = req.params.poolId;
    const userId = _.toInteger(req.params.userId);
    try {
        const pool = await repository.findById(poolId);
        if (!pool) {
            return res.status(404).send({error: 'Pool not found'});
        }
        if (_.toInteger(pool.ownerId) !== userId) {
            return res.status(403).send({error: 'you are not the owner of the pool'});
        }
        return res.send(pool.toJSON ? pool.toJSON() : pool);
    } catch (err) {
        logger.log('error', 'handleGetPool pool ' + poolId + ' from ' + req.connection.remoteAddress +
            '. Stack trace: ' + err.stack);
        return res.status(500).send({error: err.message});
    }
}

async function handleUpdatePool(req, res) {
    const poolId = req.params.poolId;
    const userId = _.toInteger(req.params.userId);
    try {
        const pool = await repository.findById(poolId);
        if (!pool) {
            return res.status(404).send({error: 'Pool not found'});
        }
        if (_.toInteger(pool.ownerId) !== userId) {
            return res.status(403).send({error: 'you are not the owner of the pool'});
        }
        const patch = {};
        if (req.body.name != null) {
            patch.name = String(req.body.name).trim();
        }
        if (req.body.public != null || req.body.isPublic != null) {
            patch.public = req.body.public !== false && req.body.isPublic !== false;
        }
        if (req.body.image != null) {
            patch.image = req.body.image;
        }
        if (req.body.factorsStrategy != null) {
            const fs = _.parseInt(req.body.factorsStrategy, 10);
            patch.factorsStrategy = fs === betScoring.SCORING_MODE.ODDS
                ? betScoring.SCORING_MODE.ODDS
                : betScoring.SCORING_MODE.CLASSIC;
        }
        if (_.isEmpty(patch)) {
            return res.send(pool.toJSON ? pool.toJSON() : pool);
        }
        const updated = await repository.updatePool(poolId, patch);
        return res.send(updated.toJSON ? updated.toJSON() : updated);
    } catch (err) {
        logger.log('error', 'handleUpdatePool pool ' + poolId + ' from ' + req.connection.remoteAddress +
            '. Stack trace: ' + err.stack);
        return res.status(500).send({error: err.message});
    }
}

module.exports = {
        createPool: handleCreatePoolRequest,
        getPool: handleGetPool,
        updatePool: handleUpdatePool,
        addGames: handleAddGames,
        getGames: handleGetGames,
        addEvents: handleAddEvents,
        addParticipates: handleAddParticipates,
        joinToPool: handleJoinToPool,
        getPoolPreview: handleGetPoolPreview,
        createPoolInvites: handleCreatePoolInvites,
        listPendingPoolInvites: handleListPendingPoolInvites,
        getPools: handleGetUserPools,
        getUserBets: handleGetUserBets,
        getParticipates: handleGetParticipates,
        getPoolGoals: handleGetPoolGoals
};

