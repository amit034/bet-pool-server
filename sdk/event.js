'use strict';
const axios = require('axios');

module.exports = function (serviceUrl) {
    return {
        getEvents(eventId, token) {
            return axios({
                url: `${serviceUrl}/api/events`,
                method: 'GET',
                json: true,
                headers: {authorization: `Bearer ${token}`},
            }).then((r => r.data));
        },
        getEvent(eventId, token) {
            return axios({
                url: `${serviceUrl}/api/events/${eventId}`,
                method: 'GET',
                json: true,
                headers: {authorization: `Bearer ${token}`},
            }).then((r => r.data));
        },
        getTeams(eventId, token) {
            return axios({
                url: `${serviceUrl}/api/events/${eventId}`,
                method: 'GET',
                json: true,
                headers: {authorization: `Bearer ${token}`},
            }).then((r => r.data));
        }
    }
};
