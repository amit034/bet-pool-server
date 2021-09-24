const _ = require('lodash');
const {Pool, Challenge, PoolParticipant, Event, Account} = require('../models');

function findByQuery(query, {transaction} = {}) {
    return Pool.findOne({where: query, transaction});
}
function findAllByQuery(query, {transaction} = {}) {
    return Pool.findAll({where: query, transaction});
}
module.exports = {
    findById(id) {
        return Pool.findByPk(id, {include: [{
            model: PoolParticipant, as: 'participates',
            include: [{model: Account, as: 'user'}]}, {model: Challenge, as: 'challenges'},  {model: Event, as: 'events'}]});
    },
    findByQuery,
    findAllByQuery,
    findByUserId(userId, {transaction}) {
        return Pool.findAll({where: {ownerId: userId}, include: [{model: PoolParticipants, as: 'participates'}], transaction});
    },
    async findParticipateByUserId(userId, {transaction} = {}) {
        const userParticipants = await PoolParticipant.findAll({where: {userId}, transaction});
        const poolIds = _.map(userParticipants, 'poolId');
        return Pool.findAll({where: {id: poolIds}, include: [{model: PoolParticipant, as: 'participates'}] , transaction});
    },
    createPool(details, {transaction}) {
        return Pool.create(details, {transaction, returning: true});
    },
    async addChallenges(poolId, challenges, {transaction}) {
        const pool = await Pool.findByPk(poolId, {include: [Challenge], transaction});
        return pool.addChallenges(challenges, {transaction});
    },
    async addEvents(poolId, events, {transaction}) {
        const pool = await Pool.findByPk(poolId, {include: [Event], transaction});
        return pool.addEvents(events, {transaction});
    },
    async addInvitees(poolId, accounts, {transaction}) {
        const pool = await Pool.findByPk(poolId, {include: [PoolParticipant]}, {transaction});
        return pool.addParticipants(_.map(accounts, 'userId'), {transaction});
    },
    async addParticipates(poolId, participants, {transaction}) {
        const pool = await Pool.findByPk(poolId, {include: [PoolParticipant], transaction});
        return pool.addPoolParticipants(participants, {transaction});
    }
};
