'use strict';
const passport = require('passport');
const LocalStrategy           = require('passport-local');
const BearerStrategy          = require('passport-http-bearer').Strategy;
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');

const Account = require('./models/Account');
const SecurityToken = require('./infrastructure/securityToken');

module.exports = function () {

    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
        session: false
      },function(req, email, password, done) {
            return Account.findOne({email}).then((user) => {
                const info = { scope: '*' };
                if (user && req.register) { return done(null, false, {message: "user already exist with that email" }); }
                if (!user && !req.register) {return done(null, false, {message: "email or password are wrong" });}
                if (!user && req.register){
                    const {lastName, firstName} = req.body;
                    return new Account({username: email, email, password, firstName, lastName}).save()
                    .then((user) => {

                         done(null, user, info);
                    }).catch(done)
                }
                if (!user.checkPassword(password) || !user.isLocal()) {
                    return done(null, false);
                }
                done(null, user, info);
            }).catch((done));
    }));
    passport.use(new BearerStrategy(function(accessToken, done) {
            return SecurityToken.findSecurityToken(accessToken)
            .then(function(securityToken) {
                  if (!securityToken) { return done(null, false); }
                  if (securityToken !== null && securityToken.isExpired()) {
                      return SecurityToken.removeSecurityToken(accessToken)
                      .then(() =>{
                          return done(null, false, { message: 'Token expired' });
                      }).catch(done)
                  }
                  else {
                      return Account.findById(securityToken.userId).then((user) => {
                          if (!user) { return done(null, false, { message: 'Unknown user' }); }
                          const info = { scope: '*' };
                          done(null, user, info);
                      });
                  }
                })
            .catch((err) => {
                return done(null, false, { message: err.message });
            });

            AccessTokenModel.findOne({ token: accessToken }, function(err, token) {
                if (err) { return done(err); }
                if (!token) { return done(null, false); }

                if( Math.round((Date.now()-token.created)/1000) > config.get('security:tokenLife') ) {
                    AccessTokenModel.remove({ token: accessToken }, function (err) {
                        if (err) return done(err);
                    });
                    return done(null, false, { message: 'Token expired' });
                }

                UserModel.findById(token.userId, function(err, user) {
                    if (err) { return done(err); }
                    if (!user) { return done(null, false, { message: 'Unknown user' }); }

                    var info = { scope: '*' }
                    done(null, user, info);
                });
            });
        }
    ));
    passport.use(new GoogleTokenStrategy({
            clientID: '1082876692474-4f1n956n709jtmufln04rjbnl09fqlni.apps.googleusercontent.com',
            passReqToCallback: true
        },
        function (req, accessToken, refreshToken, profile, done) {
            if (req.register) {
                Account.upsertGoogleUser(accessToken, refreshToken, profile, function (err, user) {
                    if (err) return done(null, false, { message: err.message });
                    return done(null, user, profile);
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
                    if (err) return done(null, false, { message: err.message });
                    return done(null, user, profile);
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