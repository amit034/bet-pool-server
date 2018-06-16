'use strict';
const axios = require('axios');

module.exports = function (serviceUrl) {
    return {
        createAccount(account, token) {
            return axios({
                url: `${serviceUrl}/api/profiles`,
                method: 'POST',
                headers: {authorization: token},
                data: account
            });
        },
        getAccount(team, token) {
            return axios({
                url: `${serviceUrl}/api/profiles/:userId`,
                method: 'GET',
                headers: {authorization: token}
            });
        }
    }
};
