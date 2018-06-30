'use strict';
const axios = require('axios');
const _  = require('lodash');

module.exports = function (serviceUrl) {
    return {
        createPool(userId, pool, token) {
            return axios({
                url: `${serviceUrl}/api/${userId}/pools`,
                method: 'POST',
                json: true,
                headers: {authorization: `Bearer ${token}`},
                data: pool
            }).then((r => r.data));
        },
        addGamesToPool(userId, poolId, gamesIds, token) {
            return axios({
                url: `${serviceUrl}/api/${userId}/pools/${poolId}/games`,
                method: 'POST',
                json: true,
                headers: {authorization: `Bearer ${token}`},
                data: {gamesIds}
            }).then((r => r.data));
        },
        getUserPools(userId, token) {
            return axios({
                url: `${serviceUrl}/api/${userId}/pools/`,
                method: 'GET',
                json: true,
                headers: {authorization: `Bearer ${token}`}
            }).then((r => r.data));
        },
        getUserPoolBets(userId, poolId, token) {
            return axios({
                url: `${serviceUrl}/api/${userId}/pools/${poolId}/challenges`,
                method: 'GET',
                json: true,
                headers: {authorization: `Bearer ${token}`}
            }).then((r => r.data));
        },
        updateUserPoolBet(userId, poolId, bet, token) {
            const challengeId = _.get(bet, 'challenge._id');
            return axios({
                url: `${serviceUrl}/api/${userId}/pools/${poolId}/challenges/${challengeId}`,
                method: 'POST',
                json: true,
                headers: {authorization: `Bearer ${token}`},
                data: bet
            }).then((r => r.data));
        },
        getUserPoolGames(userId, poolId, token) {
            return axios({
                url: `${serviceUrl}/api/${userId}/pools/${poolId}/games`,
                method: 'GET',
                json: true,
                headers: {authorization: `Bearer ${token}`},
            }).then((r => r.data));
        },
        addEventsToPool(userId, poolId, eventsIds, token) {
            return axios({
                url: `${serviceUrl}/api/${userId}/pools/${poolId}/events`,
                method: 'POST',
                json: true,
                headers: {authorization: `Bearer ${token}`},
                data: {eventsIds}
            }).then((r => r.data));
        },
        addParticipatesToPool(userId, poolId, usersIds, token) {
            return axios({
                uri: `${serviceUrl}/api/${userId}/pools/${poolId}/participates`,
                method: 'POST',
                json: true,
                headers: {authorization: `Bearer ${token}`},
                body: {usersIds}
            }).then((r => r.data));
        },
        getUserPoolParticipates(userId, poolId, token) {
            return axios({
                uri: `${serviceUrl}/api/${userId}/pools/${poolId}/participates`,
                method: 'GET',
                json: true,
                headers: {authorization: `Bearer ${token}`}
            }).then((r => r.data));
        }
    }
};
