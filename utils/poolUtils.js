const _ = require('lodash');
const moment = require('moment');
const repository = require('../repositories/poolRepository');
const betRepository = require('../repositories/betRepository');
const challengeRepository = require('../repositories/challengeRepository');
const gameRepository = require('../repositories/gameRepository');
const {Bet, Challenge, Sequelize} = require('../models');
const {Op} = Sequelize;


function getPopulatePoolChallenges(pool, active, challangeId) {
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

    /**
     * Get the current round number and check if it's complete
     * @param {number} poolId - Pool ID
     * @returns {Promise<{currentRound: number, isRoundComplete: boolean, lastGameTime: Date}>}
     */
    getCurrentRoundStatus: async (poolId) => {
        try {
            const pool = await repository.findById(poolId);
            
            if (!pool) {
                console.error(`Pool ${poolId} not found`);
                return { currentRound: 0, isRoundComplete: false, lastGameTime: null, error: 'Pool not found' };
            }
            
            const challenges = await getPopulatePoolChallenges(pool, false);
            
            if (challenges.length === 0) {
                return { currentRound: 0, isRoundComplete: false, lastGameTime: null };
            }

            // Get all games with their rounds from challenges
            const games = _.compact(_.map(challenges, c => c.game));
            
            if (games.length === 0) {
                return { currentRound: 0, isRoundComplete: false, lastGameTime: null };
            }

            // Find the most recent game that has been played (closest to today, in the past)
            const now = moment();
            const playedGames = _.filter(games, g => moment(g.playAt).isBefore(now));
            
            if (playedGames.length === 0) {
                return { currentRound: 0, isRoundComplete: false, lastGameTime: null };
            }

            // Get the most recent played game
            const mostRecentGame = _.maxBy(playedGames, g => moment(g.playAt).valueOf());
            const currentRound = mostRecentGame.round;
            
            // Check if all games in the current round are finished (status is not SCHEDULED or IN_PLAY)
            const currentRoundGames = _.filter(games, g => g.round === currentRound);
            const allFinished = _.every(currentRoundGames, {status: 'FINISHED'});
            
            return {
                currentRound,
                isRoundComplete: allFinished,
                lastGameTime: mostRecentGame.playAt,
                currentRoundGames: currentRoundGames.length,
                finishedGames: _.filter(currentRoundGames, g => g.status === 'FINISHED').length
            };
            
        } catch (error) {
            console.error(`Error in getCurrentRoundStatus for pool ${poolId}:`, error.message);
            console.error('Stack:', error.stack);
            return { 
                currentRound: 0, 
                isRoundComplete: false, 
                lastGameTime: null, 
                error: error.message 
            };
        }
    },
    getPopulatePoolChallenges: getPopulatePoolChallenges,
    getLeaderboard: async (poolId, challengeId) => {
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
                            bet.status = challenge.status;
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
            return participates;
        });
    },

    getBiggestJump: async (poolId, granularity = 'round') => {
        try {
            const participates = _.filter(await module.exports.getLeaderboard(poolId), u => !u.isBot);
            
            if (!participates || participates.length === 0) {
                return null;
            }

            const rounds = _.reduce(participates, (acc, participant) => {
                const rounds = participant.rounds || [];
                _.forEach(rounds, (round, index) => {
                    acc[index] = acc[index] || {};
                    acc[index][participant.userId] = _.assign(round, {roundId: index, userId: participant.userId});
                }, {});
                return acc;
            }, {});
            
            const roundsBiggestJumps = _.reduce(rounds, (acc, round, index) => {
                const max = _.maxBy(_.values(round), (r) => {
                    const medals = r.medals || {1: 0, 2: 0, 3: 0};
                    return (r.score * 1000000) + (medals[1] * 10000) + (medals[2] * 100) + medals[3];
                });
                acc[index] = max;
                return acc;
            }, {});
            
            let biggestJump = null;
            if (granularity === 'round') {
                biggestJump = _.last(_.values(roundsBiggestJumps));
            }
            if (granularity === 'pool') {
                biggestJump = _.maxBy(_.values(roundsBiggestJumps), (r) => {
                    const medals = r.medals || {1: 0, 2: 0, 3: 0};
                    return (r.score * 1000000) + (medals[1] * 10000) + (medals[2] * 100) + medals[3];
                });
            }

            if (!biggestJump || !biggestJump.userId) {
                console.error(`No biggest jump found for pool ${poolId} (granularity: ${granularity})`);
                return null;
            }

            const participant = _.find(participates, {userId: biggestJump.userId});
            if (!participant) {
                console.error(`Participant ${biggestJump.userId} not found in participates list`);
                return null;
            }
            
            const fromScore = _.sumBy(_.slice(participant.rounds, 0, biggestJump.roundId), 'score');
            return {
                userId: biggestJump.userId,
                username: participant?.username,
                firstName: participant?.firstName,
                lastName: participant?.lastName,
                roundId: biggestJump.roundId,
                jump: biggestJump.score,
                fromScore: fromScore,
                toScore: fromScore + biggestJump.score,
                medals: biggestJump.medals || {1: 0, 2: 0, 3: 0}
            };
        } catch (error) {
            console.error(`Error in getBiggestJump for pool ${poolId} (granularity: ${granularity}):`, error.message);
            console.error('Stack:', error.stack);
            return null;
        }
    }
}