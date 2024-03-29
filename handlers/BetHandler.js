const _ = require('lodash');
const moment = require('moment');
const repository = require('../repositories/betRepository');
const poolRepository = require('../repositories/poolRepository');
const challengeRepository = require('../repositories/challengeRepository');
const logger = require('../utils/logger');

function handleGetOthersBets(req, res) {
    const poolId = req.params.poolId ||null;
    const challengeId = req.params.challengeId || null;
    return Promise.all([
        challengeRepository.findById(challengeId),
        repository.findUserBetsByQuery({poolId, challengeId})
    ]).then(function ([challenge, usersBets]) {
            if (challenge) {
                const bets = _.map(usersBets, bet => bet.toJSON());
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
function handleCreateOrUpdateRequest(req, res) {
	const poolId = req.params.poolId || -1;
    const userId = req.currentUser.userId || -1;
    const challengeId = req.params.challengeId || -1;
    const score1 = _.get(req, 'body.score1', null);
    const score2 = _.get(req, 'body.score2', null);

    return Promise.all([
        challengeRepository.findById(challengeId),
        poolRepository.findByParticipation(poolId, userId, {})])
    .then(function([challenge, participate]) {
        if (challenge && !_.isEmpty(participate)){
            if (challenge.playAt < moment()){
                return res.status(403).send({
                    error: "too late to change bet for this challenge"
                });
            }
            const isPublic = _.get(participate, 'isPublic');
            return repository.createOrUpdate({poolId, userId, challengeId, score1, score2, isPublic})
                .then(
                function (bet) {
                    logger.log('info', 'bet for' + poolId + ' has been submitted.' +
                        'Request from address ' + req.connection.remoteAddress + '.');
                    return res.status(201).send(_.assign({}, bet.toJSON(), {challenge: challenge.toJSON()}));
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
            const massage = "No challenge or participate found for pool id " + poolId;
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


module.exports = {
    createOrUpdate: handleCreateOrUpdateRequest,
    getOthersBets: handleGetOthersBets,
    updateUserBets: handleUpdateUserBets
};

