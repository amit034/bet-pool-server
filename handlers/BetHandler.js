const _ = require('lodash');
const moment = require('moment');
const repository = require('../repositories/betRepository');
const accountRepository = require('../repositories/accountRepository');
const poolRepository = require('../repositories/poolRepository');
const challengeRepository = require('../repositories/challengeRepository');
const logger = require('../utils/logger');

function handleGetOthersBets(req, res) {
    const poolId = req.params.poolId ||null;
    const challengeId = req.params.challengeId || null;
    return Promise.all([
        poolRepository.findById(poolId),
        challengeRepository.findById(challengeId),
        repository.findUserBetsByQuery({poolId, challengeId})
    ]).then(function ([pool, challenge, usersBets]) {
            if (challenge) {
                const challengeFactor = _.get(challenge, 'factorId', 1);
                const poolFactors = _.get(pool, 'factors', {0: 0, 1: 10, 2: 20, 3: 30});
                const bets = _.map(usersBets, betModel => {
                    const bet = betModel.toJSON();
                    bet.medal = betModel.score(_.parseInt(_.get(challenge, 'score1')), _.parseInt(_.get(challenge, 'score2')));
                    bet.score = _.get(poolFactors, bet.medal, 0) * challengeFactor;
                    return bet;
                });
                return res.status(200).send({challenge, usersBets: challenge.playAt > moment() ? _.filter(bets, 'isPublic') :  bets});
            } else {
                const massage = `No challenge for challenge id ${challenge}`;
                logger.log('error', 'An error has occurred while processing a request to get others bets ' +
                    + massage + req.connection.remoteAddress);
                return res.status(400).send({
                    error: massage
                });
           }
       });
}
function handleUpdateUserBets(req, res){
    const poolId = req.params.poolId ||null;
    const userId =req.params.userId || null;
    const userBets = _.isArray(req.body) ? req.body: [];
    return poolRepository.findById(poolId).then(function(pool) {
        if (_.isNil(pool) || !_.contains(pool.participates, userId)){
            const massage = "No Pool or participate found for pool id " + poolId;
            logger.log('error', 'An error has occurred while processing a request to create a ' +
                'Pool ' + massage + req.connection.remoteAddress );
            return res.status(400).send({
                error: massage
            });
        }
        return _.map(userBets, (bet) => {
            if (!_.contains(pool.callenges, bet.game._id)){
                const massage = "No Game found for pool id " + poolId + " And Game id:" + bet.challenge._id;
                logger.log('error', 'An error has occurred while processing a request to update a ' +
                    'Bet ' + massage + req.connection.remoteAddress );
                return res.status(400).send({
                    error: massage
                });
            }
            return repository.createOrUpdate(poolId,userId, bet.challenge._id,bet.score1,bet.score2)
        });
    });
}
/**
 * Core function: Create or update a bet
 * Can be used by HTTP handlers AND bot commands
 * 
 * @param {number} poolId - Pool ID
 * @param {number} userId - User ID
 * @param {number} challengeId - Challenge ID  
 * @param {number} score1 - Home score
 * @param {number} score2 - Away score
 * @returns {Promise<Object>} Created/updated bet with challenge
 */
async function createOrUpdateBet(poolId, userId, challengeId, score1, score2) {
    const [challenge, participate] = await Promise.all([
        challengeRepository.findById(challengeId),
        poolRepository.findByParticipation(poolId, userId, {})
    ]);
    
    if (!challenge || _.isEmpty(participate)) {
        throw new Error("No challenge or participate found for pool id " + poolId);
    }
    
    if (challenge.playAt < moment()) {
        throw new Error("too late to change bet for this challenge");
    }
    
    const isPublic = _.get(participate, 'isPublic');
    const bet = await repository.createOrUpdate({
        poolId, 
        userId, 
        challengeId, 
        score1, 
        score2, 
        isPublic, 
        updatedAt: moment()
    });
    
    logger.log('info', 'bet for' + poolId + ' has been submitted by user ' + userId);
    
    return {
        bet: bet.toJSON(),
        challenge: challenge.toJSON()
    };
}

/**
 * HTTP handler: Create or update bet
 */
function handleCreateOrUpdateRequest(req, res) {
	const poolId = req.params.poolId || -1;
    const userId = req.currentUser.userId || -1;
    const challengeId = req.params.challengeId || -1;
    const score1 = _.get(req, 'body.score1', null);
    const score2 = _.get(req, 'body.score2', null);

    return createOrUpdateBet(poolId, userId, challengeId, score1, score2)
        .then(result => {
            return res.status(201).send(result);
        })
        .catch(err => {
            logger.log('error', 'An error has occurred while processing a request to create a ' +
                'Bet from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
            const status = err.message.includes('too late') ? 403 : 400;
            return res.status(status).send({
                error: err.message
            });
        });
}


module.exports = {
    // HTTP handlers (for routes)
    createOrUpdate: handleCreateOrUpdateRequest,
    getOthersBets: handleGetOthersBets,
    updateUserBets: handleUpdateUserBets,
    
    // Core functions (for bot commands to reuse)
    createOrUpdateBet
};

