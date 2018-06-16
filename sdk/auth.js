'use strict';
const axios = require('axios');

const APP_NAME = 'betPool';

module.exports = function (serviceUrl) {
    return {
        login(creds) {
            return axios({
                url: `${serviceUrl}/ api/auth/login`,
                method: 'POST',
                data: creds
            });
        },
        register(creds) {
            return axios({
                url: `${serviceUrl}/ api/auth/register`,
                method: 'POST',
                data: creds
            });
        },
        facebookLogin(token) {
            return axios({
                url: `${serviceUrl}/ api/auth/facebook`,
                method: 'POST',
                data: {access_token: token, appName: APP_NAME}
            });
        },
        googleLogin(token) {
            return axios({
                url: `${serviceUrl}/ api/auth/google`,
                method: 'POST',
                data: {access_token: token, appName: APP_NAME}
            });
        },
        registerWithFacebookToken(token) {
            return axios({
                url: `${serviceUrl}/ api/register/facebook`,
                method: 'POST',
                data: {access_token: token, appName: APP_NAME}
            });
        },
        registerWithGoogleToken(token) {
            return axios({
                url: `${serviceUrl}/ api/register/google`,
                method: 'POST',
                data: {access_token: token, appName: APP_NAME}
            });
        },
        logout(token) {
            return axios({
                url: `${serviceUrl}/ api/auth/logout`,
                method: 'POST',
                headers: {authorization: token}
            });
        }
    }
};
