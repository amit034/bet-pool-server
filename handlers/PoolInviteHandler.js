'use strict';
const _ = require('lodash');
const poolRepository = require('../repositories/poolRepository');
const poolInviteRepository = require('../repositories/poolInviteRepository');
const accountRepository = require('../repositories/accountRepository');
const logger = require('../utils/logger');

function buildInviteBaseUrl(req) {
    if (process.env.PUBLIC_APP_URL) {
        return String(process.env.PUBLIC_APP_URL).replace(/\/$/, '');
    }
    const host = req.get('host') || 'localhost';
    const proto = req.protocol || 'http';
    return `${proto}://${host}`;
}

async function handleGetInviteByToken(req, res) {
    const token = req.params.token;
    try {
        const invite = await poolInviteRepository.findValidByToken(token);
        if (!invite) {
            return res.status(404).send({error: 'Invite not found or expired'});
        }
        const pool = await poolRepository.findById(invite.poolId);
        if (!pool) {
            return res.status(404).send({error: 'Pool not found'});
        }
        return res.send({
            email: invite.email,
            poolId: pool.poolId || pool.id,
            poolName: pool.name,
            poolCode: pool.code,
            public: pool.public
        });
    } catch (err) {
        logger.log('error', 'handleGetInviteByToken: ' + err.stack);
        return res.status(500).send({error: err.message});
    }
}

async function handleAcceptInvite(req, res) {
    const token = req.params.token;
    const userId = _.get(req, 'currentUser.userId');
    try {
        const invite = await poolInviteRepository.findValidByToken(token);
        if (!invite) {
            return res.status(404).send({error: 'Invite not found or expired'});
        }
        const account = await accountRepository.findById(userId);
        if (!account) {
            return res.status(400).send({error: 'Account not found'});
        }
        const emailNorm = poolInviteRepository.normalizeEmail(account.email);
        if (emailNorm !== invite.email) {
            return res.status(403).send({error: 'This invite was sent to a different email address'});
        }
        const poolId = invite.poolId;
        await poolRepository.setParticipates(poolId, [userId], true, {});
        await poolInviteRepository.markConsumed(invite, {});
        const full = await poolRepository.findById(poolId);
        return res.status(201).send({pool: full, message: 'Joined pool'});
    } catch (err) {
        logger.log('error', 'handleAcceptInvite: ' + err.stack);
        return res.status(500).send({error: err.message});
    }
}

module.exports = {
    getByToken: handleGetInviteByToken,
    accept: handleAcceptInvite,
    buildInviteBaseUrl
};
