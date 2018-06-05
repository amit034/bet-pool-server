'use strict';
const requestPromise = require('request-promise-native');

module.exports = function () {
    return {
        getCompetitions(year) {
            return requestPromise({
                uri: `http://api.football-data.org/v1/competitions?season=${year}`,
                headers: {
                    "X-Auth-Token":"8e2fc73d26a0471181bb015861b49cad"
                },
                method: 'GET',
                json: true,
            });
        },
        getTeams(competitionId) {
            return requestPromise({
                uri: `http://api.football-data.org/v1/competitions/${competitionId}/teams`,
                headers: {
                    "X-Auth-Token":"8e2fc73d26a0471181bb015861b49cad"
                },
                method: 'GET',
                json: true,
            }).then((res) => res.teams);
        },
        getFixtures(competitionId) {
            return requestPromise({
                uri: `http://api.football-data.org/v1/competitions/${competitionId}/fixtures`,
                headers: {
                    "X-Auth-Token":"8e2fc73d26a0471181bb015861b49cad"
                },
                method: 'GET',
                json: true,
            }).then((res) => res.fixtures);
        }
    }
};
