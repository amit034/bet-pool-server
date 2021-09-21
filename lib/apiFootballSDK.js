'use strict';
const requestPromise = require('request-promise-native');
const logger = require('../utils/logger');
const TOKEN = "8e2fc73d26a0471181bb015861b49cad";
module.exports = {
    getCompetitions(qs) {
        const uri = 'http://api.football-data.org/v2/competitions';
        logger.log('info', uri);
        return requestPromise({
            uri,
            headers: {
                "X-Auth-Token": TOKEN
            },
            method: 'GET',
            qs,
            json: true,
        }).then((res) => res.competitions);
    },
    getMatch(matchId, qs) {
        const uri = `http://api.football-data.org/v2/matches/${matchId}`;
        logger.log('info', uri);
        return requestPromise({
            uri,
            headers: {
                "X-Auth-Token": TOKEN
            },
            method: 'GET',
            qs,
            json: true,
        }).then((res) => res.match);
    },
    getTeams(competitionId) {
        const uri = `http://api.football-data.org/v2/competitions/${competitionId}/teams`;
        logger.log('info', uri);
        return requestPromise({
            uri,
            headers: {
                "X-Auth-Token": TOKEN
            },
            method: 'GET',
            json: true,
        }).then((res) => res.teams);
    },
    getTeam(teamId) {
        const uri = `http://api.football-data.org/v2/teams/${teamId}`;
        logger.log('info', uri);
        return requestPromise({
            uri,
            headers: {
                "X-Auth-Token": TOKEN
            },
            method: 'GET',
            json: true,
        }).then((res) => res);
    },
    getFixtures(competitionId) {
        const uri = `http://api.football-data.org/v2/competitions/${competitionId}/matches`;
        logger.log('info', uri);
        return requestPromise({
            uri,
            headers: {
                "X-Auth-Token": TOKEN
            },
            method: 'GET',
            json: true,
        }).then((res) => res);
    },
        getMatch(matchId) {
            const uri = `http://api.football-data.org/v2/matches/${matchId}`;
            logger.log('info', uri);
            return requestPromise({
                uri,
                headers: {
                    "X-Auth-Token": "8e2fc73d26a0471181bb015861b49cad"
                },
                method: 'GET',
                json: true,
            }).then((res) => res);
        },
    getStanding(competitionId) {
        const uri = `http://api.football-data.org/v2/competitions/${competitionId}/leagueTable`;
        logger.log('info', uri);
        return requestPromise({
            uri,
            headers: {
                "X-Auth-Token": TOKEN
            },
            method: 'GET',
            json: true,
        });
    }
};
