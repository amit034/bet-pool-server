/**
 * Base class for all analytics tools
 * Provides common functionality for data access and processing
 */

const { Tool } = require('@langchain/core/tools');
const _ = require('lodash');
const repository = require('../repositories/poolRepository');
const betRepository = require('../repositories/betRepository');
const gameRepository = require('../repositories/gameRepository');
const challengeRepository = require('../repositories/challengeRepository');
const poolUtils = require('../utils/poolUtils');


class BaseAnalyticsTool extends Tool {
    constructor(name, description) {
        super();
        this.name = name;
        this.description = description;
    }

    /**
     * Get pool participants with their complete scoring data
     * @param {string} poolId - Pool ID
     * @param {string} challengeId - Optional challenge ID filter
     * @returns {Promise<Array>} Array of participants with scores and rounds data
     */
    async getPoolParticipantsData(poolId, challengeId = null) {
        try {
            const betsPromise = challengeId ? 
                betRepository.findByChallengeId(challengeId, {}) : 
                betRepository.findUsersBetsByPoolId(poolId);
            
            const [pool, usersBets] = await Promise.all([
                repository.findById(poolId), 
                betsPromise
            ]);

            if (!pool) {
                throw new Error(`Pool with ID ${poolId} not found`);
            }

            const challenges = await poolUtils.getPopulatePoolChallenges(pool, true);
            pool.challenges = _.map(challenges, item => item.toJSON());
            
            const poolFactors = _.get(pool, 'factors', {0: 0, 1: 10, 2: 20, 3: 30});
            const challengeRounds = _.groupBy(pool.challenges, c => c.game.round);
            
            const participantsData = _.map(pool.participates, (participateModel) => {
                const participate = _.pick(participateModel, ['joined']);
                _.assign(participate, _.pick(participateModel.user, [
                    'userId', 'username', 'picture', 'firstName', 'lastName', 
                    'joined', 'facebookUserId', 'isBot'
                ]));
                
                const userBets = _.filter(usersBets.map(bet => bet.toJSON()), {userId: participate.userId});
                const challengeBets = _.keyBy(userBets, 'challengeId');
                
                const poolScore = _.reduce(challengeRounds, (poolScore, challenges, roundNumber) => {
                    const round = _.reduce(challenges, (roundScore, challenge) => {
                        const bet = challengeBets[challenge.id];
                        if(bet) {
                            const betModel = new (require('../models').Bet)(bet);
                            const medal = betModel.score(
                                _.parseInt(_.get(challenge, 'score1')), 
                                _.parseInt(_.get(challenge, 'score2'))
                            );
                            const challengeFactor = _.get(challenge, 'factorId', 1);
                            bet.score = _.get(poolFactors, medal, 0) * challengeFactor;
                            bet.closed = !challenge.isOpen;
                            bet.status = challenge.status;
                            bet.factor = challengeFactor;
                            bet.medal = medal;
                            
                            if(bet.medal){
                                roundScore.score += bet.score;
                                _.set(roundScore.medals, bet.medal, 
                                    _.get(roundScore.medals, bet.medal, 0) + (1 * bet.factor));
                            }
                            if (bet.closed || bet.isBot){
                                roundScore.bets.push(bet);
                            }
                        }
                        return roundScore;
                    }, {score: 0, medals:{1: 0, 2: 0, 3: 0}, bets: [], round: roundNumber});
                    
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

            return participantsData;
        } catch (error) {
            throw new Error(`Failed to get participants data: ${error.message}`);
        }
    }

    /**
     * Get populated pool challenges (copied from PoolHandler.js)
     */
    async getPopulatePoolChallenges(pool, active, challengeId) {
        const events = _.keyBy(pool.events, 'id');
        const games = await gameRepository.findGamesByEventIds(_.keys(events), active);
        
        const filter = _.filter(games, (game) => {
            const event = _.get(events, game.eventId);
            const filterValue = _.get(event, 'PoolEvent.filter', 0);
            return _.parseInt(game.round) >= _.parseInt(filterValue);
        });
        
        const { Challenge, Sequelize } = require('../models');
        const { Op } = Sequelize;
        
        const challengesQuery = {
            refId: {[Op.in]: _.map(filter, 'id')},
            refName: 'Game',
            type: Challenge.TYPES.FULL_TIME
        };
        
        const poolChallengesQuery = {
            id: {[Op.in]: _.map(pool.challenges, 'id')},
        };

        if (challengeId){
            challengesQuery.id = challengeId;
            poolChallengesQuery.id = {[Op.in]: _.map(_.filter(pool.challenges,{id: challengeId}, 'id'))};
        }
        
        const fullTimeQ = challengeRepository.findAllByQuery(challengesQuery);
        const poolChallengesQ = poolChallengesQuery ? 
            challengeRepository.findAllByQuery(poolChallengesQuery) : 
            Promise.resolve([]);
        
        const [fullTime, poolChallenges] = await Promise.all([fullTimeQ, poolChallengesQ]);
        return _.uniqBy(_.reject(_.concat(fullTime, poolChallenges), _.isNil), 'id');
    }

    /**
     * Calculate position rankings for each round
     * @param {Array} participantsData - Participants data with rounds
     * @returns {Array} Participants with position data for each round
     */
    calculateRoundPositions(participantsData) {
        const maxRounds = Math.max(...participantsData.map(p => p.rounds.length));
        
        for (let roundIndex = 0; roundIndex < maxRounds; roundIndex++) {
            // Get participants who have data for this round
            const roundParticipants = participantsData
                .filter(p => p.rounds[roundIndex])
                .map(p => ({
                    userId: p.userId,
                    username: p.username,
                    cumulativeScore: _.sumBy(p.rounds.slice(0, roundIndex + 1), 'score'),
                    roundScore: p.rounds[roundIndex].score
                }))
                .sort((a, b) => b.cumulativeScore - a.cumulativeScore);

            // Assign positions
            roundParticipants.forEach((participant, index) => {
                const fullParticipant = participantsData.find(p => p.userId === participant.userId);
                if (!fullParticipant.rounds[roundIndex].positions) {
                    fullParticipant.rounds[roundIndex].positions = {};
                }
                fullParticipant.rounds[roundIndex].positions.current = index + 1;
                fullParticipant.rounds[roundIndex].positions.cumulativeScore = participant.cumulativeScore;
            });
        }

        return participantsData;
    }

    /**
     * Format response for AI consumption
     * @param {Object} data - Data to format
     * @param {string} context - Context description
     * @returns {string} Formatted response
     */
    formatResponse(data, context = '') {
        return JSON.stringify({
            context,
            timestamp: new Date().toISOString(),
            data
        }, null, 2);
    }
}

module.exports = { BaseAnalyticsTool };
