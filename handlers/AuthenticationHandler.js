const Q = require('q');
const _ = require('lodash');
const moment = require('moment');
const AccountRepository = require('../repositories/accountRepository');
const ApiAccessToken = require('../infrastructure/apiAccessToken');
const SecurityToken = require('../infrastructure/securityToken');
const LoginViewModel = require('../viewModels/loginViewModel');
const logger = require('../utils/logger');
const accountRepository = new AccountRepository();
const AuthenticationHandler = function () {
    this.handleLoginRequest = handleLoginRequest;
    this.performLogin = performLogin;
    //this.verifyFacebookToken = handleFacebookLoginRequest;
    //this.verifyGoogleToken = handleGoogleLoginRequest;
    this.logout = handleLogoutRequest;
};

// URL: /api/auth/facebook/mobile
// POST parameters:
// fbToken: facebook user access token
// appName: application name
// returns: a loginViewModel object if login successful
// function handleFacebookLoginRequest(req, res) {
//     var facebookAccessToken = req.body.accessToken;
//     var applicationName = req.body.appName;
//     if (facebookAccessToken && facebookAccessToken.length > 0 && applicationName && applicationName.length > 0) {
//         // Get back user object from Facebook
//         return verifyFacebookUserAccessToken(facebookAccessToken).then(function (user) {
//                 // Invoke wrapper function performLogin and return on deferred resolved
//                 performFacebookLogin(applicationName, user, facebookAccessToken)
//                     .then(function (loginViewModel) {
//                         // Return the login view model to the client
//                         logger.log('info', 'User ' + loginViewModel.userId + ' successfully logged in using application' +
//                             ' ' + applicationName + ' from: ' + req.connection.remoteAddress + '.');
//                         res.json(200, loginViewModel);
//                     });
//             }, function (error) {
//                 logger.log('error', 'Login unsuccessful: ' + error.message +
//                     ' . Request from address ' + req.connection.remoteAddress + ' .');
//                 res.status(401).send({
//                     error: error.message
//                 });
//             }
//         ).fail(function (error) {
//             logger.log('error', 'An error has occurred while attempting to login mobile user using Facebook OAuth' +
//                 ' from address ' + req.connection.remoteAddress + '. Stack trace: ' + error.stack);
//             res.status(500).send({
//                 error: error.message
//             });
//         });
//     }
//     else {
//         // 400 BAD REQUEST
//         logger.log('error', 'Bad login request from ' +
//             req.connection.remoteAddress + '. Reason: facebook access token and application name are required.');
//         res.json(401);
//     }
// }

// function handleGoogleLoginRequest(req, res){
//     var googleAccessToken = req.body.access_token;
//         var applicationName = req.body.appName;
//         if (googleAccessToken && googleAccessToken.length > 0 && applicationName && applicationName.length > 0) {
//             // Get back user object from Facebook
//             return verifyGoogleUserAccessToken(googleAccessToken).then(function (user) {
//                     // Invoke wrapper function performLogin and return on deferred resolved
//                     performFacebookLogin(applicationName, user, googleAccessToken)
//                         .then(function (loginViewModel) {
//                             // Return the login view model to the client
//                             logger.log('info', 'User ' + loginViewModel.userId + ' successfully logged in using application' +
//                                 ' ' + applicationName + ' from: ' + req.connection.remoteAddress + '.');
//                             res.json(200, loginViewModel);
//                         });
//                 }, function (error) {
//                     logger.log('error', 'Login unsuccessful: ' + error.message +
//                         ' . Request from address ' + req.connection.remoteAddress + ' .');
//                     res.status(401).send({
//                         error: error.message
//                     });
//                 }
//             ).catch(function (error) {
//                 logger.log('error', 'An error has occurred while attempting to login mobile user using Google OAuth' +
//                     ' from address ' + req.connection.remoteAddress + '. Stack trace: ' + error.stack);
//                 res.status(500).send({
//                     error: error.message
//                 });
//             });
//         }
//         else {
//             // 400 BAD REQUEST
//             logger.log('error', 'Bad login request from ' +
//                 req.connection.remoteAddress + '. Reason: facebook access token and application name are required.');
//             res.json(401);
//         }
// }

function handleLoginRequest(req, res, next) {
    var deferred = Q.defer();
    var password = req.body.password;
    var username = req.body.username;
    if (password && username) {
        accountRepository.findAccountByUsernamePassword(username, password)
        .then((account) => {
            if (account) {
                req.user = account;
                next();
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
function handlePostLogin(loginViewModel, req, res){
        if (loginViewModel) {
            logger.log('info', 'User ' + loginViewModel.username + ' successfully logged in using application' +
                ' from: ' + req.connection.remoteAddress + '.');
            res.send(loginViewModel);
        } else {
            logger.log('error', 'Bad login request from ' +
                req.connection.remoteAddress);
            res.status(401).send({error: 'Bad login request'});
        }
}
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

// Call facebook API to verify the token is valid
// https://graph.facebook.com/me?access_token=$token
// This function can be integration tested using https://developers.facebook.com/tools/explorer/?method=GET&path=me
// to obtain a user access token for my account
// Get facebook user id as well and save it into the db. Add a field into the Account model.
// Also try and get the expiration time of the token as well
// GET graph.facebook.com/debug_token?input_token={token-to-inspect}&access_token={app-token-or-admin-token}
// function verifyFacebookUserAccessToken(token) {
//     var deferred = Q.defer();
//     var path = 'https://graph.facebook.com/me?fields=first_name,last_name,email&access_token=' + token;
//     request(path, function (error, response, body) {
//         /* blob example
//         {
//             "id": "xxxxxx",
//             "name": "Valerio Gheri",
//             "first_name": "Valerio",
//             "last_name": "Gheri",
//             "link": "https://www.facebook.com/valerio.gheri",
//             "username": "valerio.gheri",
//             "gender": "male",
//             "email": "valerio.gheri@gmail.com",
//             "timezone": 2,
//             "locale": "en_US",
//             "verified": true,
//             "updated_time": "2013-08-14T09:16:58+0000"
//         }
//         */
//         var data = JSON.parse(body);
//         if (!error && response && response.statusCode && response.statusCode == 200) {
//             var user = {
//                 facebookUserId: data.id,
//                 username: `${data.first_name}_${data.last_name}`,
//                 firstName: data.first_name,
//                 lastName: data.last_name,
//                 email: data.email
//             };
//             deferred.resolve(user);
//         }
//         else {
//             console.log(data.error);
//             //console.log(response);
//             deferred.reject({code: response.statusCode, message: data.error.message});
//         }
//     });
//     return deferred.promise;
// }


function performLogin(req, res) {
    var deferred = Q.defer();
    const account = req.user;
    const appName = req.body.appName;
    SecurityToken.findSecurityTokenFromUserId(account._id)
    .then(function (securityToken) {
        if (securityToken) {
            const loginViewModel = new LoginViewModel(account._id, account.username, account.firstName, account.lastName,
                securityToken.apiAccessToken);
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
                    apiAccessToken.accessToken);
                accountRepository.updateLastLoginDate(account, Date.now());
                return loginViewModel;
            });
        }
    }).then((loginViewModel) => {
        handlePostLogin(loginViewModel, req, res);
        deferred.resolve(loginViewModel);
    }).catch(deferred.reject);

    return deferred.promise;
}

// Retrieve or create a user, generate api access token and store api and fb tokens.
// Return api access token + account obj
// function performFacebookLogin(appName, userProfile, fbAccessToken) {
//     if (appName && userProfile && fbAccessToken) {
//         return accountRepository.findOrCreateAccount(userProfile.username, userProfile.facebookUserId, userProfile.email,
//             userProfile.firstName, userProfile.lastName)
//             .then(function (account) {
//                 if (account.facebookUserId != userProfile.facebookUserId) {
//                     return Promise.reject(new Error("Invalid token"));
//                 }
//                 // Update the account name, lastname and email, if they are changed since last login
//                 if (account.hasChanged(userProfile.firstName, userProfile.lastName, userProfile.email)) {
//                     return accountRepository.updateAccount({
//                         firstName: userProfile.firstName,
//                         lastName: userProfile.lastName,
//                         email: userProfile.email,
//                         username: userProfile.username,
//                     });
//                 }
//                 return Promise.resolve(account);
//             }).then((account) => {
//                 var apiAccessToken = new ApiAccessToken(account._id, appName);
//                 var securityToken = SecurityToken.createFromApiAndFacebookToken(apiAccessToken, fbAccessToken);
//                 return SecurityToken.saveSecurityToken(securityToken)
//                     .then(function (savedSecurityToken) {
//                         var loginViewModel = new LoginViewModel(account._id, account.username, account.firstName, account.lastName,
//                             apiAccessToken.accessToken);
//                         return accountRepository.updateLastLoginDate(account, Date.now()).then(() => Promise.resolve(loginViewModel));
//                     });
//             });
//     }
// }

    module.exports = AuthenticationHandler;
