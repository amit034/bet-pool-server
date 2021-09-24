'use strict';
const footballApi = require('./extractFootballApi');
const botsBet = require('./botsBet');
const migrateDb = require('./migrateDb');
const liveGames = require('./live-Games');
const autoGames = require('./auto-games');
module.exports = {
    start() {
        autoGames.start();
        //footballApi.start();
        //botsBet.start(),
        //migrateDb.start();
    }
};