const Q = require('q');
const _ = require('lodash');
const passport = require('passport');
const moment = require('moment');
const AccountRepository = require('../repositories/accountRepository');
const ApiAccessToken = require('../infrastructure/apiAccessToken');
const SecurityToken = require('../infrastructure/securityToken');
const LoginViewModel = require('../viewModels/loginViewModel');
const logger = require('../utils/logger');
const accountRepository = new AccountRepository();
const AuthenticationHandler = function () {
    this.handleLoginRequest = handleLoginRequest;
    this.handleUserPasswordRegister = handleUserPasswordRegister;
    this.handleGoggleRegister = handleGoggleRegister;
    //this.handleRegisterRequest = handleRegisterRequest;
    this.postLogin = postLogin;
    this.logout = handleLogoutRequest;
};

function handleUserPasswordRegister(req, res, next){
        const password = req.body.password;
        const username = req.body.username;
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const email = req.body.email;
        if (password && username) {
            return accountRepository.findAccountByQuery({email})
            .then((account) => {
                if (account) {
                    return Promise.reject("email already exist");
                } else{
                    return accountRepository.createAccount({username, password, firstName, lastName, email})
                        .then((account) => {
                            req.user = account;
                            next();
                        })
                }
            })
            .catch(function (err) {
                   logger.log('error', 'Bad login request from ' +
                       req.connection.remoteAddress + err);
                   res.status(401).send({error: err.message});
            });
        }
        else {
            // 400 BAD REQUEST
            logger.log('error', 'Bad login request from ' +
                req.connection.remoteAddress + '. Reason:  username and password are required.');
            return res.status(401).send({error: 'Reason:  user name required'});
        }
}

function handleGoggleRegister(req, res, next){
        const profileRequest = req.authInfo;
        if (profileRequest) {
            const email = profile.emails[0].value;
            return accountRepository.findAccountByQuery({email})
            .then((account) => {
                if (account || !_.isEmpty(req.user)) {
                    return Promise.reject("email already exist");
                } else{
                    return accountRepository.createAccount({
                                                        username: profileRequest.displayName,
                                                        lastName: profileRequest._json.family_name,
                                                        firstName: profileRequest._json.given_name,
                                                        password: 'none',
                                                        email: profileRequest.emails[0].value,
                                                        picture: profileRequest._json.picture,
                                                        googleProvider: {
                                                            id: profileRequest.id,
                                                            token: req.accessToken
                                                        }
                                                    })
                    .then((account) => {
                        req.user = account;
                        next();
                    })
                }
            })
            .catch(function (err) {
                   logger.log('error', 'Bad login request from ' +
                       req.connection.remoteAddress + err);
                   res.status(401).send({error: err.message});
            });
        }
        else {
            // 400 BAD REQUEST
            logger.log('error', 'Bad login request from ' +
                req.connection.remoteAddress + '. Reason:  username and password are required.');
            return res.status(401).send({error: 'Reason: profile required'});
        }
}
// function handleRegisterRequest(req, res, next) {
//     if (req.user) next();
//     const password = req.body.password;
//     const username = req.body.username;
//     const firstName = req.body.firstName;
//     const lastName = req.body.lastName;
//     if (password && username) {
//         return accountRepository.findAccountByUsernamePassword(username, password)
//         .then((account) => {
//             if (account) {
//                 return Promise.reject("username already exist");
//             } else{
//                 return accountRepository.createAccount({username, password, firstName, lastName, email: username})
//                     .then((account) => {
//                         req.user = account;
//                         next();
//                     })
//             }
//         })
//         .catch(function (err) {
//                logger.log('error', 'Bad login request from ' +
//                    req.connection.remoteAddress + err);
//                res.status(401).send({error: err.message});
//         });
//     }
//     else {
//         // 400 BAD REQUEST
//         logger.log('error', 'Bad login request from ' +
//             req.connection.remoteAddress + '. Reason:  username and password are required.');
//         return res.status(401).send({error: 'Reason:  user name required'});
//     }
// }

function handleLoginRequest(req, res, next) {
    return passport.authenticate('local', {session: false}, function (err, user) {
        if (err) {
            logger.log('error', 'An error has occurred while processing a request ' +
                ' from ' +
                req.connection.remoteAddress + '. Stack trace: ' + err.stack);
            return res.status(500).send({
                error: err.message
            });
        }
        if (user) {
            req.currentUser = user;
            return next();
        }
        else {
            logger.log('info', 'User  is not authorised. Request from address ' + req.connection.remoteAddress + '.');
            return res.status(401).send({
                error: "User is not authorised"
            });
        }
    })(req, res);
}
// function handleLoginRequest(req, res, next) {
//     var deferred = Q.defer();
//     var password = req.body.password;
//     var username = req.body.username;
//     if (password && username) {
//         accountRepository.findAccountByQuery({username, password, googleProvider: {$exists: false}, facebookProvider: {$exists: false}})
//         .then((account) => {
//             if (account) {
//                 req.user = account;
//                 next();
//             }
//         })
//         .catch(function (err) {
//                logger.log('error', 'Bad login request from ' +
//                    req.connection.remoteAddress + err);
//                res.status(401).send({error: err.message});
//         });
//     }
//     else {
//         // 400 BAD REQUEST
//         logger.log('error', 'Bad login request from ' +
//             req.connection.remoteAddress + '. Reason:  username and password are required.');
//         return res.status(401).send({error: 'Reason:  user name required'});
//     }
// }
// function handlePostLogin(loginViewModel, req, res){
//         if (loginViewModel) {
//             logger.log('info', 'User ' + loginViewModel.username + ' successfully logged in using application' +
//                 ' from: ' + req.connection.remoteAddress + '.');
//             res.send(loginViewModel);
//         } else {
//             logger.log('error', 'Bad login request from ' +
//                 req.connection.remoteAddress);
//             res.status(401).send({error: 'Bad login request'});
//         }
// }
// URL: /api/auth/logout
// POST parameter:
// apiAccessToken: the token to access the API
// userId: Id of the user who is trying to log out
// Perform the logout operation, deleting the related security token so that it will be invalidated
// returns: 200 if logout successful
function handleLogoutRequest(req, res) {
    var apiAccessToken = req.body.apiAccessToken;
    var username = req.body.username;
    if (apiAccessToken) {
        SecurityToken.findSecurityToken(apiAccessToken)
            .then(function (securityToken) {
                SecurityToken.removeSecurityToken(apiAccessToken)
                    .then(function (apiAccessToken) {
                        // Log out successful
                        logger.log('info', 'User ' + username + ' successfully logged out. ' +
                            ' Address: ' + req.connection.remoteAddress + '.');
                        res.json(200, "Ok");
                    }, function (err) {
                        logger.log('error', 'An error has occurred while attempting to log out user ' + userId +
                            ' from address ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
                        res.json(500, {
                            error: err.message
                        });
                    });
            }, function (err) {
                logger.log('error', 'An error has occurred while attempting to log out user ' + userId +
                    ' from address ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
                res.json(500, {
                    error: err.message
                });
            });
    }
    else {
        // 400 BAD REQUEST
        logger.log('error', 'Bad log out request from ' +
            req.connection.remoteAddress + '. Reason: api access token required.');
        res.json(401);
    }
}

function postLogin(req, res) {
    var deferred = Q.defer();
    const account = req.currentUser;
    const appName = req.body.appName;
    SecurityToken.findSecurityTokenFromUserId(account._id)
    .then(function (securityToken) {
        if (securityToken) {
            const loginViewModel = new LoginViewModel(account._id, account.username, account.firstName, account.lastName,
                account.picture, securityToken.apiAccessToken);
            accountRepository.updateLastLoginDate(account, Date.now());
            securityToken.expirationDate = moment().add('h', 24).toString();
            return securityToken.save().then(() => loginViewModel);
        } else {
            const providerToken = _.get(account, 'facebookProvider') || _.get(account, 'googleProvider');
            let securityToken;
            let apiAccessToken;
            if (providerToken){
                apiAccessToken = new ApiAccessToken(account._id, appName);
                securityToken = SecurityToken.createFromApiAndProviderToken(apiAccessToken, providerToken.token)
            } else{
                apiAccessToken = new ApiAccessToken(account._id, account.password);
                securityToken = SecurityToken.createFromApiToken(apiAccessToken);
            }
            return SecurityToken.saveSecurityToken(securityToken)
            .then(function (savedSecurityToken) {
                var loginViewModel = new LoginViewModel(account._id, account.username, account.firstName, account.lastName,
                    account.picture, apiAccessToken.accessToken);
                accountRepository.updateLastLoginDate(account, Date.now());
                return loginViewModel;
            });
        }
    }).then((loginViewModel) => {
        if (loginViewModel) {
            logger.log('info', 'User ' + loginViewModel.username + ' successfully logged in using application' +
                ' from: ' + req.connection.remoteAddress + '.');
            res.send(loginViewModel);
        } else {
            logger.log('error', 'Bad login request from ' +
                req.connection.remoteAddress);
            res.status(401).send({error: 'Bad login request'});
        }
        deferred.resolve(loginViewModel);
    }).catch(deferred.reject);

    return deferred.promise;
}

module.exports = AuthenticationHandler;
