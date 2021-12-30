const _ = require('lodash');
const {Pool, Challenge, PoolParticipant, Event, Account} = require('../models');

function findByQuery(query, {transaction} = {}) {
    return Pool.findOne({where: query, transaction});
}
function findAllByQuery(query, {transaction} = {}) {
    return Pool.findAll({where: query, transaction});
}
module.exports = {
    async findById(poolId) {
        const pool = await  Pool.findByPk(poolId);
        const participates = await PoolParticipant.findAll({where: {poolId}, include: [{model: Account, as: 'user'}]});
        const challenges = await Challenge.findAll({include: [{model: Pool, as: 'pools', attributes: [], where: {poolId}}]});
        const events = await Event.findAll({include: [{model: Pool, as: 'pools', attributes: [], where: {poolId}}]})
        return _.assign({}, pool, {participates, events, challenges});
    },
    findByQuery,
    findAllByQuery,
    findByOwnerId(userId, {transaction}) {
        return Pool.findAll({where: {ownerId: userId}, include: [{model: PoolParticipant, as: 'participates', required: false}], transaction});
    },
    findByParticipation(poolId, userId, {transaction}) {
        return PoolParticipant.findOne({where: {poolId, userId}, transaction});
    },
    async findPoolsByUserId(userId, {transaction} = {}) {
        const userParticipants = await PoolParticipant.findAll({where: {userId}, transaction});
        const poolIds = _.map(userParticipants, 'poolId');
        return Pool.findAll({where: {id: poolIds}, include: [{model: PoolParticipant, as: 'participates', required: false}] , transaction});
    },
    createPool(details, {transaction}) {
        return Pool.create(details, {transaction, returning: true});
    },
    async addChallenges(poolId, challenges, {transaction}) {
        const pool = await Pool.findByPk(poolId, {include: [{model: Challenge, as: 'challenges', required: false}], transaction});
        return pool.addChallenges(challenges, {transaction});
    },
    async addEvents(poolId, events, {transaction}) {
        const pool = await Pool.findByPk(poolId, {include: [{model: Event, as: 'events', required: false}], transaction});
        return pool.addEvents(events, {transaction});
    },
    async addInvitees(poolId, accounts, {transaction}) {
        const pool = await Pool.findByPk(poolId, {include: [{model: PoolParticipant, as: 'participates', required: false}]}, {transaction});
        return pool.addParticipates(_.map(accounts, 'userId'), {transaction});
    },
    async setParticipates(poolId, participates, joined, {transaction} = {}) {
        const pool = await Pool.findByPk(poolId, {include: [{model: PoolParticipant, as: 'participates', required: false}], transaction});
        await  pool.addAccount(participates, {through: {joined}, transaction});
        return pool.reload();
    }
};
