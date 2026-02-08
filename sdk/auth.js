'use strict';
const axios = require('axios');

module.exports = function (serviceUrl) {
    return {
        login(creds) {
            return axios({
                url: `${serviceUrl}/api/auth/login`,
                method: 'POST',
                json: true,
                data: creds
            }).then((r => r.data));
        },
        register(creds) {
            return axios({
                url: `${serviceUrl}/api/auth/register`,
                method: 'POST',
                json: true,
                data: creds
            }).then((r => r.data));
        },
        facebookLogin(token) {
            return axios({
                url: `${serviceUrl}/api/auth/facebook`,
                method: 'POST',
                json: true,
                data: {access_token: token, appName: 'betPool'}
            }).then((r => r.data));
        },
        googleLogin(token) {
            return axios({
                url: `${serviceUrl}/api/auth/google`,
                method: 'POST',
                json: true,
                data: {access_token: token, appName: 'betPool'}
            }).then((r => r.data));
        },
        registerWithFacebookToken(token) {
            return axios({
                url: `${serviceUrl}/api/register/facebook`,
                method: 'POST',
                json: true,
                data: {access_token: token, appName: 'betPool'}
            }).then((r => r.data));
        },
        registerWithGoogleToken(token) {
            return axios({
                url: `${serviceUrl}/api/register/google`,
                method: 'POST',
                json: true,
                data: {access_token: token, appName: 'betPool'}
            }).then((r => r.data));
        },
        logout(token) {
            return axios({
                url: `${serviceUrl}/api/auth/logout`,
                method: 'POST',
                headers: {authorization: token},
                json: true,
            }).then((r => r.data));
        }
    }
};