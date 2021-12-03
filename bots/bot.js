'use strict';
const _ = require('lodash');
const config = require('../Config-debug');
const logger = require('../utils/logger');
const accountRepository = require('../repositories/accountRepository');

function Bot() {
}

Bot.prototype.init = function() {
    const botDetails = _.get(config, `bots.${this.name}`);
    if (!botDetails || !botDetails.email) {
        logger.log('warning', `cant start ${this.name} missing bot info (email)`);
        return Promise.resolve(null);
    }
    return accountRepository.findAccountByQuery({email: botDetails.email})
    .then((user) => {
        if (user) {
            return user;
        }
        return accountRepository.createAccount(botDetails);
    }).then((account) => {
        this.userId =  account._id;
        return Promise.resolve(this);
    }).catch((err) => {
        logger.log('warning', `unable to start ${this.name}`);
        return Promise.resolve(null);
    });
};
Bot.prototype.bet = function() {
    throw new Error('bot bet must be overridden by subclass');
};

module.exports = Bot;
