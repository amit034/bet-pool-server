'use strict';
const passport = require('passport');
const {Account} = require("./models");
const LocalStrategy = require('passport-local');
const BearerStrategy = require('passport-http-bearer').Strategy;
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');
const {SecurityToken} = require('./models');
const accountRepository = require('./repositories/accountRepository');

module.exports = function () {

    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
        session: false
    }, function (req, email, password, done) {
        return Account.findOne({where: {email}}).then((user) => {
            const info = {scope: '*'};
            if (user && req.register) {
                return done(null, false, {message: "user already exist with that email"});
            }
            if (!user && !req.register) {
                return done(null, false, {message: "email or password are wrong"});
            }
            if (!user && req.register) {
                const {lastName, firstName} = req.body;
                return accountRepository.createAccount({
                    username: email,
                    password: password,
                    email: email,
                    firstName,
                    lastName})
                    .then((user) => {

                        done(null, user, info);
                    }).catch(done)
            }
            if (!user.checkPassword(password) || !user.isLocal()) {
                return done(null, false);
            }
            done(null, user.toJSON(), info);
        }).catch((done));
    }));
    passport.use(new BearerStrategy(async function (accessToken, done) {
            try {
                const securityToken = await SecurityToken.findSecurityToken(accessToken)
                if (!securityToken) {
                    return done(null, false);
                }
                if (securityToken !== null && securityToken.isExpired()) {
                    await SecurityToken.removeSecurityToken(accessToken)
                    return done(null, false, {message: 'Token expired'});
                } else {
                    const user = await Account.findByPk(securityToken.userId);
                    if (!user) {
                        return done(null, false, {message: 'Unknown user'});
                    }
                    const info = {scope: '*'};
                    done(null, user.toJSON(), info);
                }
            } catch (err) {
                return done(null, false, {message: err.message});
            }
        }
    ));
    passport.use(new GoogleTokenStrategy({
            clientID: '1082876692474-4f1n956n709jtmufln04rjbnl09fqlni.apps.googleusercontent.com',
            passReqToCallback: true
        },
        function (req, accessToken, refreshToken, profile, done) {
            if (req.register) {
                Account.upsertGoogleUser(accessToken, refreshToken, profile, function (err, user) {
                    if (err) return done(null, false, {message: err.message});
                    return done(null, user.toJSON(), profile);
                });
            } else {
                Account.findOne({where: {googleProviderId: profile.id}})
                    .then((user) => {
                        if (!user) {
                            return done(null, false, {message: 'Unknown user'});
                        }
                        return done(null, user.toJSON(), profile);
                    }).catch((err) => {
                        return done(err);
                    });
            }
        }));

    passport.use(new FacebookTokenStrategy({
            clientID: "7cf326dc85717d95fdeaef22768ce1b2",
            clientSecret: "42adfd009346f4d33775c5c50b5d7d2a",
            passReqToCallback: true,
            profileFields: ['id', 'displayName', 'picture', 'first_name', 'last_name', 'email']
        },
        function (req, accessToken, refreshToken, profile, done) {
            if (req.register) {
                Account.upsertFbUser(accessToken, refreshToken, profile, function (err, user) {
                    if (err) return done(null, false, {message: err.message});
                    return done(null, user.toJSON(), profile);
                });
            } else {
                Account.findOne({where: {facebookProviderId: profile.id}})
                    .then((user) => {
                        if (!user) {
                            return done(null, false, {message: 'Unknown user'});
                        }
                        return done(null, user.toJSON(), profile);
                        return done(null, null, profile);

                    }).catch((err) => {
                    return done(err);
                });
            }
        }));

};