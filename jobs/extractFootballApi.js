'use strict';
const schedule = require('node-schedule');
const logger = require('../utils/logger');
const _ = require('lodash');
const moment = require('moment');
const Challenge = require('../models/Challenge');
const apiFootballSdk = require('../lib/apiFootballSDK');
const EventRepository = require('../repositories/eventRepository');
const TeamRepository = require('../repositories/teamRepository');
const GameRepository = require('../repositories/gameRepository');
const ChallengeRepository = require('../repositories/challengeRepository');
const eventRepository = new EventRepository();
const teamRepository = new TeamRepository();
const gameRepository = new GameRepository();
const challengeRepository = new ChallengeRepository();

function extractId(refUrl){
    return refUrl.match(/([^\/]*)\/*$/)[1];
}
function extractTeam(team) {
    if (_.isEmpty(_.get(team, 'name'))) return Promise.resolve(null);
    const teamId = extractId(_.get(team, '_links.self.href'));
    return extractPlayers(teamId)
    .then((players) => {
        return teamRepository.findBy3ptData({
            '3ptName': 'apiFootball',
            id: _.get(team, '_links.self.href')
        }).then((teamModel) => {
            if (_.isNil(teamModel)) {
                return teamRepository.createTeam({
                    name: team.name,
                    code: team.code,
                    flag: team.crestUrl,
                    players,
                    '3pt': _.assign({
                        '3ptName': 'apiFootball',
                        id: _.get(team, '_links.self.href')
                    }, _.pick(team, ['name', 'code']))
                });
            }else {
                return teamModel;
            }
        });
    });

}

function extractPlayers(teamId){
    return apiFootballSdk().getPlayers(teamId)
    .then((players) => {
        return _.map(players, 'name');
    });
};

function extractGame(event, game) {
    if (_.isEmpty(_.get(game, 'homeTeamName')) || _.isEmpty(_.get(game, 'awayTeamName'))) return Promise.resolve(null);
    return gameRepository.findBy3ptData({
        '3ptName': 'apiFootball',
        'id': _.get(game, '_links.self.href')
    }).then((gameModel) => {
        if (gameModel) return gameModel;
        return Promise.all([
            teamRepository.findBy3ptData({'3ptName': 'apiFootball', id: _.get(game, '_links.homeTeam.href')}),
            teamRepository.findBy3ptData({'3ptName': 'apiFootball', id: _.get(game, '_links.awayTeam.href')})
        ]).then(([team1Model, team2Model]) => {
            return gameRepository.createGame({
                event: event._id,
                playAt: game.date,
                team1: team1Model._id,
                team2: team2Model._id,
                status: game.status,
                result: {
                    score1: _.get(game, 'result.goalsHomeTeam', null),
                    score2: _.get(game, 'result.goalsAwayTeam', null),
                },
                round: game.matchday,
                '3pt': _.assign({
                    '3ptName': 'apiFootball',
                    status: game.status,
                    id: _.get(game, '_links.self.href')
                })
            });
        });
    }).then((gameModel) =>{
        return challengeRepository.findByQuery({refId: gameModel.id, refName: 'Game'})
        .then(([challenge]) => {
            if (challenge) return challenge;
            return challengeRepository.createChallenge({
                type: Challenge.TYPES.FULL_TIME,
                event: event._id,
                refName: 'Game',
                refId: gameModel.id,
                status: game.status,
                playAt: game.date,
                name: `${game.homeTeamName} - ${game.awayTeamName} ${Challenge.TYPES.FULL_TIME}`,
                result: {
                    score1: _.get(game, 'result.goalsHomeTeam', null),
                    score2: _.get(game, 'result.goalsAwayTeam', null),
                }
            })
        })
        .then(() => {
            const status = _.get(game, 'status', 'TIMED');
            const score1 = _.get(game, 'result.goalsHomeTeam', null);
            const score2 = _.get(game, 'result.goalsAwayTeam', null);
            return gameRepository.updateGame({id: gameModel.id, score1, score2, status})
                .then(() => {
                    return challengeRepository.updateChallengeByQuery({refId: gameModel.id, refName: 'Game'}, {
                        status: game.status,
                        result: {
                            score1: score1,
                            score2: score2
                        }
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
                    competitions = _.filter(competitions, {id: 467}); // WORLD CUP only
                    return Promise.all(_.forEach(competitions, (competition) => {
                        return eventRepository.findBy3ptData({'3ptName': 'apiFootball', id: competition.id})
                            .then((event) => {
                                if (_.isNil(event)) {
                                    return eventRepository.createEvent({
                                        name: competition.caption,
                                        lastUpdated: competition.lastUpdated,
                                        '3pt': _.assign({'3ptName': 'apiFootball'}, _.pick(competition, ['id', 'caption', 'league', 'year', 'lastUpdated']))
                                    });
                                }
                                if (_.isNil(event.lastUpdated) || (event.lastUpdated < moment(competition.lastUpdated))){
                                    event.lastUpdated = competition.lastUpdated;
                                    return event.save().then(() => event);
                                }else {
                                    return null;
                                }
                            })
                            .then((event) => {
                                if (!event) return Promise.resolve(null);
                                return apiFootballSdk().getTeams(competition.id)
                                    .then((teams) => {
                                        return Promise.all(_.map(teams, extractTeam));
                                    })
                                    .then((teams) => {
                                        if (_.isEmpty(event.teams)){
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
                                    .then((games) => {
                                        return Promise.all(_.map(games, _.curry(extractGame)(event))).then((data) => Promise.resolve(event));
                                    });
                            });
                    }));
                }).catch((err) => {
                    logger.log('error', 'An error has occurred while processing a apiFootball job ' + err.stack);
                });
        });
    }
};

