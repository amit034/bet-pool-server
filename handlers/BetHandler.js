const _ = require('lodash');
const moment = require('moment');
const Repository = require('../repositories/betRepository');
const PoolRepository = require('../repositories/poolRepository');
const GameRepository = require('../repositories/gameRepository');
const ChallengeRepository = require('../repositories/challengeRepository');
const logger = require('../utils/logger');
const repository = new Repository();
const poolRepository = new PoolRepository();
const gameRepository = new GameRepository();
const challengeRepository = new ChallengeRepository();
var BetHandler = function() {
	this.createOrUpdate = handleCreateOrUpdateRequest;
	this.getOthersBets = handleGetOthersBets;
	this.updateUserBets = handleUpdateUserBets;

};

function handleGetOthersBets(req, res) {
    const poolId = req.params.poolId ||null;
    const userId =req.params.userId || null;
    const challengeId = req.params.challengeId || null;
    return Promise.all([
        challengeRepository.findById(challengeId),
        repository.findUserBetsByQuery({pool: poolId, challenge: challengeId})
    ]).then(function ([challenge, usersBets]) {
            if (challenge) {
                const bets = _.map(usersBets, bet => bet.toJSON());
                return res.status(200).send({challenge, usersBets: challenge.playAt > moment() ? _.filter(bets, 'public') :  bets});
            } else {
                const massage = `No challenge for challenge id ${challenge}`;
                logger.log('error', 'An error has occurred while processing a request to get others bets ' +
                    +massage + req.connection.remoteAddress);
                return res.status(400).send({
                    error: massage
                });
           }
       });
};
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
function handleCreateOrUpdateRequest(req, res) {
	const poolId = req.params.poolId || null;
    const userId =req.currentUser.id;
    const challengeId = req.params.challengeId || null;
    const score1 = _.get(req, 'body.score1', null);
    const score2 = _.get(req, 'body.score2', null);

    return Promise.all([
        challengeRepository.findById(challengeId),
        poolRepository.findParticipateByUserId(poolId, userId)])
    .then(function([challenge, participate]) {
        if (challenge && participate){
            if (challenge.playAt < moment()){
                return res.status(403).send({
                    error: "too late to change bet for this challenge"
                });
            }
            return repository.createOrUpdate({pool: poolId, participate: participate.user._id, challenge: challenge._id, score1, score2})
                .then(
                function (bet) {
                    logger.log('info', 'bet for' + poolId + ' has been submitted.' +
                        'Request from address ' + req.connection.remoteAddress + '.');
                    return res.status(201).send(bet);
                }).catch(
                function (err) {
                    logger.log('error', 'An error has occurred while processing a request to create a ' +
                        'Bet from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
                    return res.status(400).send({
                        error: err.message
                    });
                }
            );
        }else{
            var massage = "No challenge or participate found for pool id " + poolId;
            logger.log('error', 'An error has occurred while processing a request to create a ' +
                'Pool ' + massage + req.connection.remoteAddress );
            return res.status(400).send({
                error: massage
            });
        }

    }).catch(function(err){
        logger.log('error', 'An error has occurred while processing a request to create a ' +
            'Pool from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
        res.status(400).send({
            error: err.message
        });
    });
}


module.exports = BetHandler;

