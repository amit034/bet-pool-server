const _ = require('lodash');
const moment = require('moment');
const Repository = require('../repositories/betRepository');
const PoolRepository = require('../repositories/poolRepository');
const GameRepository = require('../repositories/gameRepository');
const logger = require('../utils/logger');
const repository = new Repository();
const poolRepository = new PoolRepository();
const gameRepository = new GameRepository();

var BetHandler = function() {
	this.createOrUpdate = handleCreateOrUpdateRequest;
	this.updateUserBets = handleUpdateUserBets;
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
            if (!_.contains(pool.games, bet.game._id)){
                const massage = "No Game found for pool id " + poolId + " And Game id:" + bet.game._id;
                logger.log('error', 'An error has occurred while processing a request to update a ' +
                    'Bet ' + massage + req.connection.remoteAddress );
                return res.status(400).send({
                    error: massage
                });
            }
            return repository.createOrUpdate(poolId,userId, bet.game._id,bet.score1,bet.score2)
        });
    });
}
function handleCreateOrUpdateRequest(req, res) {
	var poolId = req.params.poolId || null;
	var userId =req.params.userId || null;
	var gameId = req.params.gameId || null;
    var score1 = req.body.score1 || null;
    var score2 = req.body.score2 || null;



    return Promise.all([
        gameRepository.findById(gameId),
        poolRepository.findParticipateByUserId(poolId, userId)])
    .then(function([game, participate]) {
        if (game && participate){
            if (game.playAt < moment()){
                res.send(400).status({
                    error: "too late to change bet for this game"
                });
            }
            return repository.createOrUpdate(poolId, participate.user._id, game._id, score1, score2)
                .then(
                function (bet) {
                    logger.log('info', 'bet for' + poolId + ' has been submitted.' +
                        'Request from address ' + req.connection.remoteAddress + '.');
                    res.json(201, bet);
                }).catch(
                function (err) {
                    logger.log('error', 'An error has occurred while processing a request to create a ' +
                        'Bet from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
                    res.json(400, {
                        error: err.message
                    });
                }
            );
        }else{
            var massage = "No game or participate found for pool id " + poolId;
            logger.log('error', 'An error has occurred while processing a request to create a ' +
                'Pool ' + massage + req.connection.remoteAddress );
            res.json(400, {
                error: massage
            });
        }

    }).catch(function(err){
        logger.log('error', 'An error has occurred while processing a request to create a ' +
            'Pool from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
        res.json(400, {
            error: err.message
        });
    });
}


module.exports = BetHandler;

