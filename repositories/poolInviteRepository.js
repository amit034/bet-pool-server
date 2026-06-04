'use strict';
const crypto = require('crypto');
const moment = require('moment');
const _ = require('lodash');
const {PoolInvite} = require('../models');

function normalizeEmail(email) {
    return _.toLower(_.trim(String(email || '')));
}

module.exports = {
    normalizeEmail,

    async createForEmail({poolId, email, createdBy, ttlDays = 14}, {transaction} = {}) {
        const token = crypto.randomBytes(24).toString('hex');
        const expiresAt = ttlDays ? moment().add(ttlDays, 'days').toDate() : null;
        return PoolInvite.create({
            poolId,
            email: normalizeEmail(email),
            token,
            expiresAt,
            createdBy
        }, {transaction, returning: true});
    },

    findByToken(token, {transaction} = {}) {
        return PoolInvite.findOne({where: {token}, transaction});
    },

    async findValidByToken(token, {transaction} = {}) {
        const row = await PoolInvite.findOne({where: {token}, transaction});
        if (!row || row.consumedAt) {
            return null;
        }
        if (row.expiresAt && moment(row.expiresAt).isBefore(moment())) {
            return null;
        }
        return row;
    },

    markConsumed(invite, {transaction} = {}) {
        return invite.update({consumedAt: new Date()}, {transaction});
    },

    listPendingForPool(poolId, {transaction} = {}) {
        return PoolInvite.findAll({
            where: {poolId, consumedAt: null},
            order: [['id', 'DESC']],
            transaction
        }).then((rows) => _.filter(rows, (row) => {
            if (!row.expiresAt) {
                return true;
            }
            return moment(row.expiresAt).isSameOrAfter(moment());
        }));
    },

    findPendingById(inviteId, poolId, {transaction} = {}) {
        return PoolInvite.findOne({
            where: {
                id: inviteId,
                poolId,
                consumedAt: null
            },
            transaction
        });
    },

    async refreshInviteToken(inviteId, {ttlDays = 14, transaction} = {}) {
        const token = crypto.randomBytes(24).toString('hex');
        const expiresAt = ttlDays ? moment().add(ttlDays, 'days').toDate() : null;
        const row = await PoolInvite.findByPk(inviteId, {transaction});
        if (!row || row.consumedAt) {
            return null;
        }
        await row.update({token, expiresAt}, {transaction});
        return row.reload({transaction});
    }
};
