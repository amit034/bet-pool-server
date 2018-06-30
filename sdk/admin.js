'use strict';
const axios = require('axios');

module.exports = function (serviceUrl) {
    return {
        createEvent(event, token) {
            return axios({
                url: `${serviceUrl}/api/admin/events`,
                method: 'POST',
                json: true,
                headers: {authorization: token},
                data: event
            }).then((r => r.data));
        },
        createTeam(team, token) {
            return axios({
                url: `${serviceUrl}/api/admin/teams`,
                method: 'POST',
                json: true,
                headers: {authorization: token},
                data: team
            }).then((r => r.data));
        }
    }
};
