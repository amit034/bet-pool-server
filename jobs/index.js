'use strict';
const footballApi = require('./extractFootballApi');
const botsBet = require('./botsBet');
module.exports = {
    start() {
        footballApi.start();
        //botsBet.start()
    }
};