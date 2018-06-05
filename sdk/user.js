'use strict';
const requestPromise = require('request-promise-native');
import _ from 'lodash';

module.exports = function (serviceUrl) {
    return {
        createPool(userId, pool, token) {
            return requestPromise({
                uri: `${serviceUrl}/api/${userId}/pools`,
                method: 'POST',
                json: true,
                headers: {authorization: `Bearer ${token}`},
                body: pool
            });
        },
        addGamesToPool(userId, poolId, gamesIds, token) {
            return requestPromise({
                uri: `${serviceUrl}/api/${userId}/pools/${poolId}/games`,
                method: 'POST',
                json: true,
                headers: {authorization: `Bearer ${token}`},
                body: {gamesIds}
            });
        },
        getUserPools(userId, token) {
            return requestPromise({
                uri: `${serviceUrl}/api/${userId}/pools/`,
                method: 'GET',
                json: true,
                headers: {authorization: `Bearer ${token}`}
            });
        },
        getUserPoolBets(userId, poolId, token) {
            return requestPromise({
                uri: `${serviceUrl}/api/${userId}/pools/${poolId}/bets`,
                method: 'GET',
                json: true,
                headers: {authorization: `Bearer ${token}`}
            });
        },
        updateUserPoolBet(userId, poolId, bet, token) {
            const gameId = _.get(bet, 'game._id');
            return requestPromise({
                uri: `${serviceUrl}/api/${userId}/pools/${poolId}/games/${gameId}`,
                method: 'POST',
                json: true,
                headers: {authorization: `Bearer ${token}`},
                body: bet
            });
        },
        getUserPoolGames(userId, poolId, token) {
            return requestPromise({
                uri: `${serviceUrl}/api/${userId}/pools/${poolId}/games`,
                method: 'GET',
                json: true,
                headers: {authorization: `Bearer ${token}`},
            });
        },
        addEventsToPool(userId, poolId, eventsIds, token) {
            return requestPromise({
                uri: `${serviceUrl}/api/${userId}/pools/${poolId}/events`,
                method: 'POST',
                json: true,
                headers: {authorization: `Bearer ${token}`},
                body: {eventsIds}
            });
        },
        addParticipatesToPool(userId, poolId, usersIds, token) {
            return requestPromise({
                uri: `${serviceUrl}/api/${userId}/pools/${poolId}/participates`,
                method: 'POST',
                json: true,
                headers: {authorization: `Bearer ${token}`},
                body: {usersIds}
            });
        },
        getUserPoolParticipates(userId, poolId, token) {
            return requestPromise({
                uri: `${serviceUrl}/api/${userId}/pools/${poolId}/participates`,
                method: 'GET',
                json: true,
                headers: {authorization: `Bearer ${token}`}
            });
        }
    }
};
