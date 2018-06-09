'use strict';
const requestPromise = require('request-promise-native');

module.exports = function (serviceUrl) {
    return {
        getEvents(eventId, token) {
            return requestPromise({
                uri: `${serviceUrl}/api/events`,
                method: 'GET',
                json: true,
                headers: {authorization: `Bearer ${token}`},
            });
        },
        getEvent(eventId, token) {
            return requestPromise({
                uri: `${serviceUrl}/api/events/${eventId}`,
                method: 'GET',
                json: true,
                headers: {authorization: `Bearer ${token}`},
            });
        },
        getTeams(eventId, token) {
            return requestPromise({
                uri: `${serviceUrl}/api/events/${eventId}`,
                method: 'GET',
                json: true,
                headers: {authorization: `Bearer ${token}`},
            });
        }
    }
};
