'use strict';
const requestPromise = require('request-promise-native');

module.exports = function (serviceUrl) {
    return {
        login() {
            return requestPromise({
               uri: `${serviceUrl}/ api/auth/login`,
               method: 'POST',
               json: true,

           });
        },
        logout(token) {
            return requestPromise({
               uri: `${serviceUrl}/ api/auth/logout`,
               method: 'POST',
               headers: {authorization: token},
               json: true,

           });
        }
    }
};
