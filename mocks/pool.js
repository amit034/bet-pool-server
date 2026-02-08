'use strict';
const _ = require('lodash');
const teams = [{
        "id": 1,
        "code": "FLU",
        "name": "Fluminense FC",
        "shortName": "Fluminense",
        "flag": "https://crests.football-data.org/1765.svg",
        "fapiId": 1765
}, {
    "id": 2,
    "code": "EST",
    "name": "Estudiantes de La Plata",
    "shortName": "Estudiantes LP",
    "flag": "https://crests.football-data.org/2051.svg",
    "fapiId": 2051
}, {
    "id": 3,
    "code": "AFC",
    "name": "América FC",
    "shortName": "América (MG)",
    "flag": "https://crests.football-data.org/1838_large.png",
    "fapiId": 1838
}, {
    "id": 4,
    "code": "EVE",
    "name": "CD Everton",
    "shortName": "Everton",
    "flag": "https://crests.football-data.org/4456.svg",
    "fapiId": 4456
}]

const games =  [{
        "id": 1,
        "eventId": 1,
        "round": 1,
        "playAt": "2022-02-09T00:30:00Z",
        "homeTeamId": 1,
        "homeTeamScore": 1,
        "awayTeamId": 2,
        "awayTeamScore": 1,
        "status": "FINISHED",
        "factorId": 2,
        "fapiId": null
},
{
    "id": 2,
    "eventId": 1,
    "round": 1,
    "playAt": "2022-02-09T00:30:00Z",
    "homeTeamId": 3,
    "homeTeamScore": 2,
    "awayTeamId": 4,
    "awayTeamScore": 0,
    "status": "FINISHED",
    "factorId": 1,
    "fapiId": null
},
{
    "id": 3,
    "eventId": 1,
    "round": 2,
    "playAt": "2022-02-16T00:30:00Z",
    "homeTeamId": 1,
    "homeTeamScore": 1,
    "awayTeamId": 3,
    "awayTeamScore": 0,
    "status": "FINISHED",
    "factorId": 2,
    "fapiId": null
},
{
    "id": 4,
    "eventId": 1,
    "round": 2,
    "playAt": "2022-02-16T00:30:00Z",
    "homeTeamId": 2,
    "homeTeamScore": 1,
    "awayTeamId": 4,
    "awayTeamScore": 3,
    "status": "FINISHED",
    "factorId": 2,
    "fapiId": null
},
{
    "id": 5,
    "eventId": 1,
    "round": 3,
    "playAt": "2022-02-22T00:30:00Z",
    "homeTeamId": 3,
    "homeTeamScore": 1,
    "awayTeamId": 1,
    "awayTeamScore": 1,
    "status": "FINISHED",
    "factorId": 2,
    "fapiId": null
}, {
    "id": 6,
    "eventId": 1,
    "round": 3,
    "playAt": "2022-02-22T00:30:00Z",
    "homeTeamId": 4,
    "homeTeamScore": 1,
    "awayTeamId": 2,
    "awayTeamScore": 3,
    "status": "FINISHED",
    "factorId": 2,
    "fapiId": null
}]


const challenges = [
    {
        "id": 1,
        "type": "FULL_TIME",
        "refName": "Game",
        "refId": 1,
    },{
        "id": 2,
        "type": "FULL_TIME",
        "refName": "Game",
        "refId": 2,
    }, {
        "id": 3,
        "type": "FULL_TIME",
        "refName": "Game",
        "refId": 3,
    }, {
        "id": 4,
        "type": "FULL_TIME",
        "refName": "Game",
        "refId": 4,
    }, {
        "id": 5,
        "type": "FULL_TIME",
        "refName": "Game",
        "refId": 5,
    }, {
        "id": 6,
        "type": "FULL_TIME",
        "refName": "Game",
        "refId": 6,
    }
];

const user1Bets = [{
    "userId": 1,
    "challengeId": 1,
    "score1": 2,
    "score2": 2,
}, {
    "userId": 1,
    "challengeId": 2,
    "score1": 2,
    "score2": 0
}, {
    "userId": 1,
    "challengeId": 3,
    "score1": 0,
    "score2": 2
}, {
    "userId": 1,
    "challengeId": 4,
    "score1": 1,
    "score2": 0
}, {
    "userId": 1,
    "challengeId": 5,
    "score1": 2,
    "score2": 0
}, {
    "userId": 1,
    "challengeId": 6,
    "score1": 0,
    "score2": 1
}];
const user2Bets = [{
    "userId": 2,
    "challengeId": 1,
    "score1": 1,
    "score2": 2,
}, {
    "userId": 2,
    "challengeId": 2,
    "score1": 2,
    "score2": 1
}, {
    "userId": 2,
    "challengeId": 3,
    "score1": 1,
    "score2": 1
}, {
    "userId": 2,
    "challengeId": 4,
    "score1": 2,
    "score2": 0
}, {
    "userId": 2,
    "challengeId": 5,
    "score1": 1,
    "score2": 2
}, {
    "userId": 2,
    "challengeId": 6,
    "score1": 1,
    "score2": 1
}];
const user3Bets = [{
    "userId": 3,
    "challengeId": 1,
    "score1": 1,
    "score2": 2,
}, {
    "userId": 3,
    "challengeId": 2,
    "score1": 1,
    "score2": 0
}, {
    "userId": 3,
    "challengeId": 3,
    "score1": 1,
    "score2": 1
}, {
    "userId": 3,
    "challengeId": 4,
    "score1": 1,
    "score2": 2
}, {
    "userId": 3,
    "challengeId": 5,
    "score1": 1,
    "score2": 0
}, {
    "userId": 1,
    "challengeId": 6,
    "score1": 0,
    "score2": 1
}];
const user4Bets = [{
    "userId": 4,
    "challengeId": 1,
    "score1": 1,
    "score2": 2,
}, {
    "userId": 4,
    "challengeId": 2,
    "score1": 0,
    "score2": 1
}, {
    "userId": 4,
    "challengeId": 3,
    "score1": 0,
    "score2": 1
}, {
    "userId": 4,
    "challengeId": 4,
    "score1": 1,
    "score2": 0
}, {
    "userId": 4,
    "challengeId": 5,
    "score1": 1,
    "score2": 0
}, {
    "userId": 4,
    "challengeId": 6,
    "score1": 1,
    "score2": 3
}];
const bets = [...user1Bets, ...user2Bets, ...user3Bets, ...user4Bets];
const userBets = _.forEach(user1Bets, bet => {
   const challenge = _.find(challenges, {id: bet.challengeId});
   const game = _.find(games, {id: challenge.refId});
   const homeTeam = _.find(teams, {id: game.homeTeamId});
   const awayTeam = _.find(teams, {id: game.awayTeamId});
   _.assign(game, {homeTeam, awayTeam});
   _.assign(challenge, {game, score1: game.homeTeamScore, score2: game.awayTeamScore});
   return _.assign(bet, {challenge});
});
module.exports = {
    userBets,
    participates: bets
};