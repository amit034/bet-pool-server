'use strict';
const requestPromise = require('request-promise-native');

module.exports = function (serviceUrl) {
    return {
        createEvent(event, token) {
            return requestPromise({
                uri: `${serviceUrl}/api/admin/events`,
                method: 'POST',
                json: true,
                headers: {authorization: token},
                body: event
            });
        },
        createTeam(team, token) {
            return requestPromise({
                uri: `${serviceUrl}/api/admin/teams`,
                method: 'POST',
                json: true,
                headers: {authorization: token},
                body: team
            });
        }
    }
};
