const _ = require('lodash');
const {Challenge, Game} = require('../models');

function findOneByQuery(query, {transaction} = {}){
    return Challenge.findOne({where: query, transaction});
}
function findAllByQuery(query, {transaction} = {}){
    return Challenge.scope('game').findAll({where: query, transaction});
}
async function updateChallengeByQuery(query, data, {transaction} = {}) {
    const searchQuery = _.assign({status: {$ne: 'FINISHED'}, result: {$ne: null}}, query);
    const challenge = await findOneByQuery(searchQuery, {transaction});
    return challenge.update({
        score1: challenge.score1,
        score2: challenge.score2,
        status: challenge.status});
}
module.exports = {
    findOneByQuery,
    findAllByQuery,
    findById(challengeId, {transaction} = {}) {
        return Challenge.scope('game').findByPk(challengeId, {transaction});
    },
    createChallenge(data, {transaction}= {}) {
        return Challenge.create(data, {transaction});
    },
    updateChallengeById(id, challenge, {transaction} = {}) {
        return updateChallengeByQuery({id}, challenge, {transaction})
    },
    updateChallengeByQuery
};



