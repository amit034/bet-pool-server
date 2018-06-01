'use strict';
const passport = require('passport');
var Account = require('./models/Account');
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');
module.exports = function () {

    passport.use(new GoogleTokenStrategy({
            clientID: '1082876692474-4f1n956n709jtmufln04rjbnl09fqlni.apps.googleusercontent.com',
        },
        function (accessToken, refreshToken, profile, done) {
            Account.upsertGoogleUser(accessToken, refreshToken, profile, function (err, user) {
                return done(err, user);
            });
    }));

    passport.use(new FacebookTokenStrategy({
        clientID: "7cf326dc85717d95fdeaef22768ce1b2",
        clientSecret: "42adfd009346f4d33775c5c50b5d7d2a"
    },
    function (accessToken, refreshToken, profile, done) {
        Account.upsertFbUser(accessToken, refreshToken, profile, function(err, user) {
            return done(err, user);
        });
    }));

};