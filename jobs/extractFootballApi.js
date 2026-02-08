'use strict';
const schedule = require('node-schedule');
const logger = require('../utils/logger');
const _ = require('lodash');
const moment = require('moment');
const Challenge = require('../models/Challenge');
const apiFootballSdk = require('../lib/apiFootballSDK');
const eventRepository = require('../repositories/eventRepository');
const teamRepository = require('../repositories/teamRepository');
const gameRepository = require('../repositories/gameRepository');
const challengeRepository = require('../repositories/challengeRepository');

function extractId(refUrl) {
    return refUrl.match(/([^\/]*)\/*$/)[1];
}

function extractTeam(team) {
    if (_.isNil(_.get(team, 'id'))) return Promise.resolve(null);
    const teamId = _.get(team, 'id');
    return teamRepository.findBy3ptData({
        '3ptName': 'apiFootball',
        id: teamId
    }).then((teamModel) => {
        if (_.isNil(teamModel)) {
            return apiFootballSdk().getTeam(teamId)
                .then((teamDetails) => {
                    return teamRepository.createTeam({
                        name: teamDetails.shortName || teamDetails.name || teamId,
                        code: teamDetails.code,
                        flag: teamDetails.crestUrl,
                        players: _.map(_.get(teamDetails, 'squad'), 'name'),
                        '3pt': _.assign({
                            '3ptName': 'apiFootball',
                            id: teamId
                        }, _.pick(teamDetails, ['shortName', 'name', 'tla']))
                    });
                });
        } else {
            return teamModel;
        }
    });
}

function extractPlayers(teamId) {
    return apiFootballSdk().getPlayers(teamId)
        .then((players) => {
            return _.map(players, 'name');
        });
};

function extractGame(event, game) {
    if (_.isEmpty(_.get(game, 'homeTeam')) || _.isEmpty(_.get(game, 'awayTeam'))) return Promise.resolve(null);
    return gameRepository.findBy3ptData({
        '3ptName': 'apiFootball',
        'id': _.get(game, 'id')
    }).then((gameModel) => {
        if (gameModel) return gameModel;
        return Promise.all([
            teamRepository.findBy3ptData({'3ptName': 'apiFootball', id: _.get(game, 'homeTeam.id')}),
            teamRepository.findBy3ptData({'3ptName': 'apiFootball', id: _.get(game, 'awayTeam.id')})
        ]).then(([team1Model, team2Model]) => {
            return gameRepository.createGame({
                event: event._id,
                playAt: game.utcDate,
                team1: _.pick(team1Model, ['name', 'shortName', 'code', 'flag']),
                team2: _.pick(team2Model, ['name', 'shortName', 'code', 'flag']),
                status: game.status,
                result: {
                    score1: _.get(game, 'score.fullTime.homeTeam', null),
                    score2: _.get(game, 'score.fullTime.awayTeam', null),
                },
                round: game.matchday,
                '3pt': _.assign({
                    '3ptName': 'apiFootball',
                    status: game.status,
                    id: _.get(game, 'id')
                })
            });
        });
    }).then((gameModel) => {
        return challengeRepository.findOneByQuery({refId: gameModel.id, refName: 'Game'})
            .then((challenge) => {
                if (challenge) return challenge;
                return challengeRepository.createChallenge({
                    type: Challenge.TYPES.FULL_TIME,
                    event: event._id,
                    refName: 'Game',
                    refId: gameModel.id,
                    status: game.status,
                    playAt: game.utcDate,
                    name: `${game.homeTeam.name} - ${game.awayTeam.name} ${Challenge.TYPES.FULL_TIME}`,
                    result: {
                        score1: _.get(game, 'score.fullTime.homeTeam', null),
                        score2: _.get(game, 'score.fullTime.awayTeam', null),
                    }
                })
            })
            .then(() => {
                const status = _.get(game, 'status', 'TIMED');
                const score1 = _.get(game, 'score.fullTime.homeTeam', null);
                const score2 = _.get(game, 'score.fullTime.awayTeam', null);
                const result = {
                    score1: score1,
                    score2: score2
                };
                return gameRepository.updateScore({id: gameModel.id, result, status})
                    .then(() => {
                        return challengeRepository.updateChallengeByQuery({refId: gameModel.id, refName: 'Game'}, {
                            status: game.status,
                            result
                        })
                    });
            });
    });
}

module.exports = {

    start() {
        schedule.scheduleJob('*/1 * * * *', () => {
            return apiFootballSdk().getCompetitions(moment().year())
                .then((competitions) => {
                    competitions = _.filter(competitions, {id: 2001}); // pm leaage
                    return Promise.all(_.forEach(competitions, (competition) => {
                        return eventRepository.findBy3ptData({'3ptName': 'apiFootball', id: competition.id})
                            .then((event) => {
                                if (_.isNil(event)) {
                                    return eventRepository.createEvent({
                                        name: competition.name,
                                        lastUpdated: competition.lastUpdated,
                                        '3pt': _.assign({'3ptName': 'apiFootball'}, _.pick(competition, ['id', 'name', 'lastUpdated']))
                                    });
                                }
                                return event;
                            })
                            .then((event) => {
                                if (!event) return Promise.resolve(null);
                                return apiFootballSdk().getTeams(competition.id)
                                    .then((teams) => {
                                        return Promise.all(_.map(teams, extractTeam));
                                    })
                                    .then((teams) => {
                                        if (_.isEmpty(event.teams)) {
                                            event.teams = _.map(teams, '_id');
                                            return event.save();
                                        } else {
                                            return Promise.resolve(event);
                                        }
                                    });
                            })
                            .then((event) => {
                                if (!event) return Promise.resolve(null);
                                return apiFootballSdk().getFixtures(competition.id)
                                    .then(({competition, matches}) => {

                                        if (_.isNil(event.lastUpdated) || (event.lastUpdated < moment(competition.lastUpdated))) {
                                            event.lastUpdated = competition.lastUpdated;
                                        } else {
                                            return Promise.resolve();
                                        }
                                        return Promise.all(_.map(matches, _.curry(extractGame)(event))).then((data) => {
                                            return event.save().then(() => event)
                                        });
                                    });
                            });
                    }));
                }).catch((err) => {
                    logger.log('error', 'An error has occurred while processing a apiFootball job ' + err.stack);
                });
        });
    }
};

