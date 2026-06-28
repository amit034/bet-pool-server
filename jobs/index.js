'use strict';
//const footballApi = require('./extractFootballApi');
const botsBet = require('./botsBet');
const autoBet = require('./auto-bet');
const migrateDb = require('./migrateDb');
const liveGames = require('./live-Games');
const autoGames = require('./auto-games');
const updateStanding = require('./updateStanding');
module.exports = {
    start(io) {
  //         autoGames.start();
          //liveGames.start(io);
          //footballApi.start();
          botsBet.start();
          autoBet.start();
   //     migrateDb.start();
          updateStanding.start();
    }
};
