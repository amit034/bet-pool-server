'use strict';
const axios = require('axios');

module.exports = function (serviceUrl) {
    return {
        createEvent(event, token) {
            return axios({
                url: `${serviceUrl}/api/admin/events`,
                method: 'POST',
                headers: {authorization: token},
                data: event
            });
        },
        createTeam(team, token) {
            return axios({
                url: `${serviceUrl}/api/admin/teams`,
                method: 'POST',
                headers: {authorization: token},
                data: team
            });
        }
    }
};
