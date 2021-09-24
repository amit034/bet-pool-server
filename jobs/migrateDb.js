'use strict';
const _ = require('lodash');
const logger = require('../utils/logger');
const sqlModules = require('../mysql_models');
const {User, EventUser, UserBets,Game: GameSql ,Team: TeamSql} = sqlModules;
const accountRepository = require('../repositories/accountRepository');
const poolRepository = require('../repositories/poolRepository');
const eventRepository = require('../repositories/eventRepository');
const challengeRepository = require('../repositories/challengeRepository');
const gameRepository = require('../repositories/gameRepository');

const betRepository = require('../repositories/betRepository');
const teamRepository = require('../repositories/teamRepository');
const {sequelize} = require('../models');

async function createAccountsFromEvent(eventId, {transaction}) {
    const users = await User.findAll({include: [{model: EventUser, where : {eventId}, transaction}]});
    return Promise.all(_.map(users , (user) => {
        return accountRepository.findAccountByQuery({email: user.email}, {transaction})
        .then((account) => {
            if (account) return Promise.resolve(account);
            return accountRepository.createAccount({
                username: user.username,
                password: user.password,
                email: user.email,
                firstName: 'test',
                lastName: 'test'}, {transaction})
        });
    }));
}

async function createOrTeam({name, teamCode} = {}, {transaction}){
    let team = await teamRepository.findOneByQuery(teamCode, {transaction})
    if (!team) {
        team = await teamRepository.createTeam({name, code: teamCode}, {transaction, ignoreDuplicates: true});
    }
    return team;
}
async function createOrGetGame(details, {transaction}){
    const {eventId, team1, team2, roundId: round, playAt, score1: homeTeamScore, score2: awayTeamScore} = details;
    const homeTeam = await createOrTeam(team1, {transaction});
    const awayTeam = await createOrTeam(team2, {transaction});
    const query = {eventId, homeTeamId: homeTeam.id, awayTeamId: awayTeam.id};
    let game = await gameRepository.findGameByQuery(query, {transaction});
    if (!game) {
        game = await gameRepository.createGame(_.assign({}, query, {round, playAt, homeTeamScore, awayTeamScore}),  {transaction});
    }
    return game;
}

async function createOrGetChallenges(eventId,  {transaction}){
    const games = await GameSql.findAll({where: {eventId}, include: [{model: TeamSql, as: 'team1'}, {model: TeamSql, as: 'team2'}], group: ['`team1`.`team_code`'], transaction});
    const teams  = _.uniqBy(_.concat(_.map(games, 'team1'),_.map(games, 'team2')), 'teamCode');
    await Promise.all(_.map(teams, (team) => createOrTeam(team, {transaction})));
    return Promise.all(_.map(games, (game) => createOrGetChallenge(game, {transaction})));
}

async function createOrGetChallenge(details, {transaction}){
    const game = await createOrGetGame(details, {transaction});
    const {id: refId, playAt, factorId} = game;
    const query = {refId: game.id, refName: 'Game'};
    let challenge = await challengeRepository.findOneByQuery({refId, refName: 'Game'}, {transaction});
    if (!challenge) {
        challenge = await challengeRepository.createChallenge(_.assign({}, query, {playAt, factorId}), {transaction});
    }
    challenge.oldGameId = details.id;
    return challenge;
}
module.exports = {

    async start() {
        const transaction = await sequelize.transaction();
        try {
            const eventName = 'Champion League 2021-2022';
            let event = await eventRepository.findByName(eventName, {transaction})
            if (!event) {
                event = await eventRepository.createEvent({name: eventName}, {transaction});
            }
            const users = await createAccountsFromEvent(17, {transaction});
            const amit = _.find(users, {email: 'amit.rotbard@gmail.com'});
            let pool = await poolRepository.findByQuery({ownerId: amit.userId, name: eventName}, {transaction});
            if (!pool) {
                pool = await poolRepository.createPool({ownerId: amit.userId, name: eventName}, {transaction});
            }
            await poolRepository.addEvents(pool.id, [event], {transaction});
            await poolRepository.addParticipates(pool.id, _.map(users, ({userId}) => {
                return {userId, joined: true};
            }), {transaction});
            const challenges = await createOrGetChallenges(17, {transaction});
            await poolRepository.addChallenges(pool.id, challenges, {transaction});
            const bets = await UserBets.findAll({
                where: {eventId: 17},
                include: [
                    {
                        model: GameSql,
                        required: true,
                        include: [{model: TeamSql, as: 'team1'}, {model: TeamSql, as: 'team2'}],
                        plain: true
                    }

                ], group : ['`Game`.`gameId`', '`UserBets`.`userId`']
            });
            await Promise.all(_.map(challenges, (challenge) => {
                const challengeObj = challenge.toJSON();
                const challengeBets = _.filter(bets, {gameId: challenge.oldGameId});
                return Promise.all(_.map(challengeBets, (challengeBet) => {
                    const user = _.find(users, {email: challengeBet.userId});
                    if (user && user.userId) {
                        return betRepository.createOrUpdate({
                            userId: user.userId,
                            poolId: pool.id,
                            challengeId: challengeObj.id,
                            score1: challengeBet.score1, score2: challengeBet.score2
                        }, {transaction});
                    }
                    return null
                }));
            }));
            return transaction.commit();
        } catch (e) {
            await transaction.rollback();
            logger.log('ERROR', e);
        }
    }
};