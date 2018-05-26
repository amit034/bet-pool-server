'use strict';
const requestPromise = require('request-promise-native');

module.exports = function () {
    return {
        getCompetitions(year) {
            return requestPromise({
                uri: `http://api.football-data.org/v1/competitions?season=${year}`,
                method: 'GET',
                json: true,
            });
        },
        getTeams(competitionId) {
            return requestPromise({
                uri: `http://api.football-data.org/v1/competitions/${competitionId}/teams`,
                method: 'GET',
                json: true,
            }).then((res) => res.teams);
        },
        getFixtures(competitionId) {
            return requestPromise({
                uri: `http://api.football-data.org/v1/competitions/${competitionId}/fixtures`,
                method: 'GET',
                json: true,
            }).then((res) => res.fixtures);
        }
    }
};
