const _ = require('lodash');
const moment = require('moment');
const {Pool, Challenge, PoolParticipant, Event, Account, Sequelize} = require('../models');
const {Op} = Sequelize;
const poolInviteRepository = require('./poolInviteRepository');
const accountRepository = require('./accountRepository');

function findByQuery(query, {transaction} = {}) {
    return Pool.findOne({where: query, transaction});
}
async function findAllByQuery(query, {transaction, participates, events} = {}) {
    const include = [];
    if (participates) {
        include.push({model: PoolParticipant, as: 'participates', required: false});
    }
    if (events) {
        include.push({model: Event, as: 'events', required: false});
    }
    return Pool.findAll({where: query, include, transaction});
}
module.exports = {
    async findById(poolId) {
        const pool = await  Pool.findByPk(poolId, {include: [{model: Event, as: 'events'}]});
        const participates = await PoolParticipant.findAll({where: {poolId}, include: [{model: Account, as: 'user'}]});
        const challenges = await Challenge.findAll({include: [{model: Pool, as: 'pools', attributes: [], where: {poolId}}]});
        //const {events} = await Pool.findById(poolId, {include: [{model: Event, as: 'events'}]})
        return _.assign({}, pool.toJSON(), {participates, challenges});
    },
    findByQuery,
    findAllByQuery,
    findByOwnerId(userId, {transaction} = {}) {
        return Pool.findAll({where: {ownerId: userId}, include: [{model: PoolParticipant, as: 'participates', required: false}], transaction});
    },
    findByParticipation(poolId, userId, {transaction} = {}) {
        return PoolParticipant.findOne({where: {poolId, userId}, transaction});
    },
    async findPoolsByUserId(userId, {transaction} = {}) {
        const userParticipants = await PoolParticipant.findAll({where: {userId}, transaction});
        const poolIds = _.map(userParticipants, 'poolId');
        return Pool.findAll(
            {
                where: {id: poolIds},
                include: [
                    {model: PoolParticipant, as: 'participates', required: false},
                    {model: Event, as: 'events', required: false}
                ] , transaction});
    },
    createPool(details, {transaction} = {}) {
        return Pool.create(details, {transaction, returning: true});
    },
    async addChallenges(poolId, challenges, {transaction} = {}) {
        const pool = await Pool.findByPk(poolId, {include: [{model: Challenge, as: 'challenges', required: false}], transaction});
        return pool.addChallenges(challenges, {transaction});
    },
    async addEvents(poolId, events, {transaction} = {}) {
        const pool = await Pool.findByPk(poolId, {include: [{model: Event, as: 'events', required: false}], transaction});
        return pool.addEvents(events, {transaction});
    },
    async addInvitees(poolId, accounts, {transaction} = {}) {
        const pool = await Pool.findByPk(poolId, {include: [{model: PoolParticipant, as: 'participates', required: false}]}, {transaction});
        return pool.addParticipates(_.map(accounts, 'userId'), {transaction});
    },
    async setParticipates(poolId, participates, joined, {transaction} = {}) {
        const pool = await Pool.findByPk(poolId, {include: [{model: PoolParticipant, as: 'participates', required: false}], transaction});
        await  pool.addAccount(participates, {through: {joined}, transaction});
        return pool.reload();
    },

    async getBotUserIds() {
        const bots = await accountRepository.findAccountsByQuery({isBot: 1});
        return _.map(bots, 'userId');
    },

    /**
     * joined = participants with joined=true (non-bot)
     * total = all participant rows (non-bot) + pending email invites deduped by email
     */
    async getPlayerCounts(poolId, {transaction} = {}) {
        const participates = await PoolParticipant.findAll({
            where: {poolId},
            include: [{model: Account, as: 'user', required: false}],
            transaction
        });
        const botsIds = await this.getBotUserIds();
        const humanParticipates = _.reject(participates, (p) => _.includes(botsIds, p.userId));
        const joined = _.size(_.filter(humanParticipates, (p) => p.joined === true));
        const participantEmails = new Set(
            _.compact(_.map(humanParticipates, (p) => poolInviteRepository.normalizeEmail(_.get(p, 'user.email'))))
        );
        let pendingInvites = [];
        try {
            pendingInvites = await poolInviteRepository.listPendingForPool(poolId, {transaction});
        } catch (e) {
            pendingInvites = [];
        }
        const extraEmails = _.filter(pendingInvites, (inv) => {
            const em = poolInviteRepository.normalizeEmail(inv.email);
            return em && !participantEmails.has(em);
        });
        const total = _.size(humanParticipates) + _.size(extraEmails);
        return {joined, total};
    },

    computePotAndFirstPrize(participates, buyIn, botsIds) {
        const payingParticipates = _.reject(participates, (p) => {
            const uid = _.get(p, 'userId', _.get(p, 'user.userId'));
            return _.includes(botsIds, uid) || p.isBot === true;
        });
        const buyInNum = _.parseInt(buyIn, 10) || 0;
        const pot = buyInNum * _.size(payingParticipates);
        const firstPrize = buyInNum * _.ceil(_.size(payingParticipates) * 0.4);
        return {pot, firstPrize};
    },

    /**
     * Users in poolId (joined) who also share another pool with userId where both joined=true.
     */
    async findFriendsInPool(poolId, userId, limit = 3, {transaction} = {}) {
        const botsIds = await this.getBotUserIds();
        const myPoolRows = await PoolParticipant.findAll({
            where: {userId, joined: true},
            attributes: ['poolId'],
            transaction
        });
        const myPoolIds = _.reject(_.map(myPoolRows, 'poolId'), (id) => _.toInteger(id) === _.toInteger(poolId));
        if (_.isEmpty(myPoolIds)) {
            return {items: [], othersCount: 0};
        }
        const targetJoined = await PoolParticipant.findAll({
            where: {poolId, joined: true, userId: {[Op.ne]: userId}},
            include: [{model: Account, as: 'user', required: false}],
            transaction
        });
        const candidateIds = _.reject(_.map(targetJoined, 'userId'), (id) => _.includes(botsIds, id));
        if (_.isEmpty(candidateIds)) {
            return {items: [], othersCount: 0};
        }
        const sharedRows = await PoolParticipant.findAll({
            where: {
                userId: {[Op.in]: candidateIds},
                poolId: {[Op.in]: myPoolIds},
                joined: true
            },
            attributes: ['userId'],
            transaction
        });
        const friendIds = _.uniq(_.map(sharedRows, 'userId'));
        const byUserId = _.keyBy(targetJoined, 'userId');
        const sorted = _.sortBy(friendIds, (id) => _.get(byUserId[id], 'user.username', ''));
        const items = _.take(_.map(sorted, (uid) => {
            const row = byUserId[uid];
            const u = row.user || {};
            return {
                userId: uid,
                username: u.username,
                firstName: u.firstName,
                lastName: u.lastName,
                picture: u.picture
            };
        }), limit);
        return {items, othersCount: Math.max(0, _.size(sorted) - limit)};
    },

    async userHasPoolAccess(pool, userId, {code, inviteToken} = {}) {
        if (!pool) {
            return false;
        }
        if (pool.public) {
            return true;
        }
        const poolCode = pool.code || '';
        if (code && String(code).trim() === String(poolCode).trim()) {
            return true;
        }
        const participation = await this.findByParticipation(pool.poolId || pool.id, userId);
        if (participation) {
            return true;
        }
        if (inviteToken) {
            const invite = await poolInviteRepository.findValidByToken(inviteToken);
            if (invite && _.toInteger(invite.poolId) === _.toInteger(pool.poolId || pool.id)) {
                const account = await accountRepository.findById(userId);
                if (account) {
                    const emailNorm = poolInviteRepository.normalizeEmail(account.email);
                    if (emailNorm === invite.email) {
                        return true;
                    }
                }
            }
        }
        const account = await accountRepository.findById(userId);
        if (account && account.email) {
            const emailNorm = poolInviteRepository.normalizeEmail(account.email);
            const pending = await poolInviteRepository.listPendingForPool(pool.poolId || pool.id);
            if (_.some(pending, (inv) => poolInviteRepository.normalizeEmail(inv.email) === emailNorm)) {
                return true;
            }
        }
        return false;
    },

    async consumeEmailInviteForUser(poolId, userId, {transaction} = {}) {
        const account = await accountRepository.findById(userId);
        if (!account || !account.email) {
            return;
        }
        const emailNorm = poolInviteRepository.normalizeEmail(account.email);
        const pending = await poolInviteRepository.listPendingForPool(poolId, {transaction});
        const match = _.find(pending, (inv) => poolInviteRepository.normalizeEmail(inv.email) === emailNorm);
        if (match) {
            await poolInviteRepository.markConsumed(match, {transaction});
        }
    }
};
