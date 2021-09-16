'use strict';
const footballApi = require('./extractFootballApi');
const botsBet = require('./botsBet');
const migrateDb = require('./migrateDb');
const liveGames = require('./liveGames');
module.exports = {
    start() {
        liveGames.start();
        //footballApi.start();
        //botsBet.start(),
       // migrateDb.start();
    }
};