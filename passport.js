'use strict';
const passport = require('passport');
var Account = require('./models/Account');
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');
module.exports = function () {

    passport.use(new GoogleTokenStrategy({
            clientID: '1082876692474-4f1n956n709jtmufln04rjbnl09fqlni.apps.googleusercontent.com',
            passReqToCallback: true
        },
        function (req, accessToken, refreshToken, profile, done) {
            if (req.register) {
                Account.upsertGoogleUser(accessToken, refreshToken, profile, function (err, user) {
                    return done(err, user);
                });
            } else {
                Account.findOne({'googleProvider.id': profile.id})
                    .then((user) => {
                        return done(null, user, profile);
                    }).catch((err) => {
                    return done(err);
                });
            }
        }));

    passport.use(new FacebookTokenStrategy({
            clientID: "7cf326dc85717d95fdeaef22768ce1b2",
            clientSecret: "42adfd009346f4d33775c5c50b5d7d2a",
            passReqToCallback: true
        },
        function (req, accessToken, refreshToken, profile, done) {
            if (req.register) {
                Account.upsertFbUser(accessToken, refreshToken, profile, function (err, user) {
                    return done(err, user);
                });
            } else {
                Account.findOne({'facebookProvider.id': profile.id})
                .then((user) => {
                    return done(null, user, profile);
                }).catch((err) => {
                    return done(err);
                });

            }
        }));

};