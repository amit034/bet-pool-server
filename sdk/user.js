'use strict';
const requestPromise = require('request-promise-native');

module.exports = function (serviceUrl) {
    return {
        createPool(userId, pool, token) {
            return requestPromise({
                uri: `${serviceUrl}/api/${userId}/pools`,
                method: 'POST',
                json: true,
                headers: {authorization: token},
                body: pool
            });
        },
        addGamesToPool(userId,poolId, gamesIds, token){
            return requestPromise({
                uri: `${serviceUrl}/api/${userId}/pools/${poolId}/games`,
                method: 'POST',
                json: true,
                headers: {authorization: token},
                body: {gamesIds}
            });
        },
        addEventsToPool(userId,poolId, eventsIds, token){
            return requestPromise({
                uri: `${serviceUrl}/api/${userId}/pools/${poolId}/events`,
                method: 'POST',
                json: true,
                headers: {authorization: token},
                body: {eventsIds}
            });
        },
        addParticipatesToPool(userId,poolId, usersIds, token){
            return requestPromise({
                uri: `${serviceUrl}/api/${userId}/pools/${poolId}/participates`,
                method: 'POST',
                json: true,
                headers: {authorization: token},
                body: {usersIds}
            });
        },
        bet(userId,poolId, bet, token){
            return requestPromise({
                uri: `${serviceUrl}/api/${userId}/pools/${poolId}/participates`,
                method: 'POST',
                json: true,
                headers: {authorization: token},
                body: {usersIds}
            });
        }
    }
};
