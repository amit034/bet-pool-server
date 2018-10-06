'use strict';
const schedule = require('node-schedule');
const logger = require('../utils/logger');
const bots = require('../bots');
const _ = require('lodash');
const moment = require('moment');
const sqlModules = require('../mysql_models');
const {User, EventUser, UserBets,Game: GameSql ,Team: TeamSql} = sqlModules;
const AccountRepository = require('../repositories/accountRepository');
const PoolRepository = require('../repositories/poolRepository');
const ChallengeRepository = require('../repositories/challengeRepository');
const BetRepository = require('../repositories/betRepository');
const Challenge = require('../models/Challenge');
const Bet = require('../models/Bet');
const Game = require('../models/Game');
const Team = require('../models/Team');
const accountRepository = new AccountRepository();
const poolRepository = new PoolRepository();
const betRepository = new BetRepository();
module.exports = {

    start() {
        return User.findAll({include: [{model:EventUser, where : {eventId: 8}}]}).then((users) => {
            return Promise.all(_.map(users , (user) => {
                return accountRepository.findAccountByQuery({email: user.email})
                .then((account) => {
                    if (account) return Promise.resolve(account);
                    return accountRepository.createAccount({username: user.username, password: user.password, email: user.email, firstName: 'test', lastName: 'test'})
                })
            })).then((users) => {
                return poolRepository.addParticipates('5b9d8724fb6fc00e4d7677fa', _.map(users, (user) => {return {user, joined: true}})).then(() => users);
            }).then((users) => {
                return Challenge.find().populate({
                path: 'game',
                match: { event: '5b9d83747fe2872cdcdf5afb'},
               // populate: {path: 'team1 team2', model: Team}
             // }).then((challenges) => {
                    // return Promise.all(_.map(challenges, (challenge) => {
                    //         return Bet.find({challenge}).exec().then((usersBet) => {
                    //                 const item = challenge.toJSON();
                    //                 item.bets = usersBet;
                    //         });
                    // }));
                }).then((challenges) => {
                        return UserBets.findAll({
                            where: {eventId: 8},
                            include: [
                                {   model: GameSql,
                                    required: true,
                                    include: [{model: TeamSql, as: 'team1'}, {model: TeamSql, as: 'team2'}],
                                    plain: true
                                }

                            ]
                        }).then((bets) =>{
                            return Promise.all(_.map(challenges, (challenge) => {
                                    const challengeObj = challenge.toJSON();
                                    const team1 = _.get(challengeObj , 'game.team1.name');
                                    const team2 = _.get(challengeObj , 'game.team2.name');
                                    const challengeBets = _.filter(bets, {Game: {team1: {name: team1}, team2: {name: team2}}});
                                    return Promise.all(_.map(challengeBets, (challengeBet) => {
                                            const user = _.find(users, {email: challengeBet.userId});
                                            if (user && user.id){
                                                return betRepository.createOrUpdate({participate: user.id, challenge, pool: '5b9d8724fb6fc00e4d7677fa', score1: challengeBet.score1, score2: challengeBet.score2 })
                                            }
                                            return null
                                    }));
                            }));
                        });
                });
            }).then(() => {
            });
        })
    }
};