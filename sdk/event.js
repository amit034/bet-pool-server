'use strict';
const axios = require('axios');

module.exports = function (serviceUrl) {
    return {
        getEvents(eventId, token) {
            return axios({
                url: `${serviceUrl}/api/events`,
                method: 'GET',
                headers: {authorization: `Bearer ${token}`}
            });
        },
        getEvent(eventId, token) {
            return axios({
                url: `${serviceUrl}/api/events/${eventId}`,
                method: 'GET',
                headers: {authorization: `Bearer ${token}`}
            });
        }
    }
};
