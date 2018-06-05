'use strict';
const requestPromise = require('request-promise-native');

module.exports = function (serviceUrl) {
    return {
        login(creds) {
            return requestPromise({
                uri: `${serviceUrl}/ api/auth/login`,
                method: 'POST',
                json: true,
                body: creds
            });
        },
        register(creds) {
            return requestPromise({
                uri: `${serviceUrl}/ api/auth/register`,
                method: 'POST',
                json: true,
                body: creds
            });
        },
        facebookLogin(token) {
            return requestPromise({
                uri: `${serviceUrl}/ api/auth/facebook`,
                method: 'POST',
                json: true,
                body: {access_token: token, appName: 'betPool'}
            });
        },
        googleLogin(token) {
            return requestPromise({
                uri: `${serviceUrl}/ api/auth/google`,
                method: 'POST',
                json: true,
                body: {access_token: token, appName: 'betPool'}
            });
        },
        registerWithFacebookToken(token) {
            return requestPromise({
                uri: `${serviceUrl}/ api/register/facebook`,
                method: 'POST',
                json: true,
                body: {access_token: token, appName: 'betPool'}
            });
        },
        registerWithGoogleToken(token) {
            return requestPromise({
                uri: `${serviceUrl}/ api/register/google`,
                method: 'POST',
                json: true,
                body: {access_token: token, appName: 'betPool'}
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
