'use strict';
const axios = require('axios');
const _ = require('lodash');

module.exports = function (serviceUrl) {
    return {
        createPool(userId, pool, token) {
            return axios({
                url: `${serviceUrl}/api/${userId}/pools`,
                method: 'POST',
                headers: {authorization: `Bearer ${token}`},
                data: pool
            });
        },
        addGamesToPool(userId, poolId, gamesIds, token) {
            return axios({
                url: `${serviceUrl}/api/${userId}/pools/${poolId}/games`,
                method: 'POST',
                headers: {authorization: `Bearer ${token}`},
                data: {gamesIds}
            });
        },
        getUserPools(userId, token) {
            return axios({
                url: `${serviceUrl}/api/${userId}/pools/`,
                method: 'GET',
                headers: {authorization: `Bearer ${token}`}
            });
        },
        getUserPoolBets(userId, poolId, token) {
            return axios({
                uri: `${serviceUrl}/api/${userId}/pools/${poolId}/bets`,
                method: 'GET',
                headers: {authorization: `Bearer ${token}`}
            });
        },
        updateUserPoolBet(userId, poolId, bet, token) {
            const gameId = _.get(bet, 'game._id');
            return axios({
                uri: `${serviceUrl}/api/${userId}/pools/${poolId}/games/${gameId}`,
                method: 'POST',
                headers: {authorization: `Bearer ${token}`},
                data: bet
            });
        },
        getUserPoolGames(userId, poolId, token) {
            return axios({
                uri: `${serviceUrl}/api/${userId}/pools/${poolId}/games`,
                method: 'GET',
                headers: {authorization: `Bearer ${token}`},
            });
        },
        addEventsToPool(userId, poolId, eventsIds, token) {
            return axios({
                uri: `${serviceUrl}/api/${userId}/pools/${poolId}/events`,
                method: 'POST',
                headers: {authorization: `Bearer ${token}`},
                data: {eventsIds}
            });
        },
        addParticipatesToPool(userId, poolId, usersIds, token) {
            return axios({
                uri: `${serviceUrl}/api/${userId}/pools/${poolId}/participates`,
                method: 'POST',
                headers: {authorization: `Bearer ${token}`},
                data: {usersIds}
            });
        },
        getUserPoolParticipates(userId, poolId, token) {
            return axios({
                uri: `${serviceUrl}/api/${userId}/pools/${poolId}/participates`,
                method: 'GET',
                headers: {authorization: `Bearer ${token}`}
            });
        }
    }
};
