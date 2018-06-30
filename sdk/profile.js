'use strict';
const axios = require('axios');

module.exports = function (serviceUrl) {
    return {
        createAccount(account, token) {
            return axios({
                url: `${serviceUrl}/api/profiles`,
                method: 'POST',
                json: true,
                headers: {authorization: token},
                body: account
            }).then((r => r.data));
        },
        getAccount(team, token) {
            return axios({
                url: `${serviceUrl}/api/profiles/:userId`,
                method: 'GET',
                json: true,
                headers: {authorization: token},
            }).then((r => r.data));
        }
    }
};
