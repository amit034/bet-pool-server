'use strict';
const requestPromise = require('request-promise-native');

module.exports = function (serviceUrl) {
    return {
        createAccount(account, token) {
            return requestPromise({
                uri: `${serviceUrl}/api/profiles`,
                method: 'POST',
                json: true,
                headers: {authorization: token},
                body: account
            });
        },
        getAccount(team, token) {
            return requestPromise({
                uri: `${serviceUrl}/api/profiles/:userId`,
                method: 'GET',
                json: true,
                headers: {authorization: token},
            });
        }
    }
};
