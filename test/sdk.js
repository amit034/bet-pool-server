'use strict';
const SDK = require('../sdk');
const _  = require('lodash');

module.exports = {
    runTests() {
        const service = SDK('http://localhost:3000');
        const {Auth, User}  = service;
        return Auth.login({email:'crowdbot@365win.bet', password: 'Aa123456'})
        .then((user) => {
            const {userId, apiAccessToken} = user;
            return User.getUserPools(userId, apiAccessToken)
            .then((pools) => {
                const pool = _.head(pools);
                return User.getUserPoolBets(userId, pool._id, apiAccessToken);
            }).then(console);
        });
    }
};





