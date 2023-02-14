'use strict';
const _ = require('lodash');
const util = require('util');
const Bot = require('./bot');

function SmartBot() {
    this.name = 'smartBot';
    this.id = 1;
}

SmartBot.prototype.bet = function (challange) {

};

util.inherits(SmartBot, Bot);

module.exports = SmartBot;