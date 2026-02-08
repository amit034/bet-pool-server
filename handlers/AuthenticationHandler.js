const Q = require('q');
const _ = require('lodash');
const passport = require('passport');
const accountRepository = require('../repositories/accountRepository');
const ApiAccessToken = require('../infrastructure/apiAccessToken');
const {SecurityToken} = require('../models');
const LoginViewModel = require('../viewModels/loginViewModel');
const logger = require('../utils/logger');


async function handleUserPasswordRegister(req, res, next) {
    const {password, username, firstName, lastName, email} = req.body.password;
    try {
        if (password && username) {
            const existingAccount = await accountRepository.findAccountByQuery({email})
            if (existingAccount) {
                return res.status(403).send({error: "email already exist"});
            } else {
                const account = await accountRepository.createAccount({username, password, firstName, lastName, email});
                req.user = account;
                return next();
            }
        } else {
            logger.log('error', 'Bad login request from ' +
                req.connection.remoteAddress + '. Reason:  username and password are required.');
            return res.status(401).send({error: 'Reason:  user name required'});
        }
    } catch (err) {
        logger.log('error', 'Bad login request from ' +
            req.connection.remoteAddress + ' ' + err);
        return res.status(401).send({error: err.message});
    }
}

async function handleGoggleRegister(req, res, next) {
    const profileRequest = req.authInfo;
    try {
        if (profileRequest) {
            const email = profileRequest.emails[0].value;
            const existingAccount = await accountRepository.findAccountByQuery({email});
            if (existingAccount || !_.isEmpty(req.user)) {
                return res.status(403).send({error: "email already exist"});
            } else {
                const account = await accountRepository.createAccount({
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
                req.user = account;
                return next();
            }
        } else {
            // 400 BAD REQUEST
            logger.log('error', 'Bad login request from ' +
                req.connection.remoteAddress + '. Reason:  username and password are required.');
            return res.status(401).send({error: 'Reason: profile required'});
        }
    } catch (e) {
        logger.log('error', 'Bad login request from ' +
            req.connection.remoteAddress + err);
        return res.status(401).send({error: err.message});
    }

}

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
        } else {
            logger.log('info', 'User  is not authorised. Request from address ' + req.connection.remoteAddress + '.');
            return res.status(401).send({
                error: "User is not authorised"
            });
        }
    })(req, res);
}

// URL: /api/auth/logout
// POST parameter:
// apiAccessToken: the token to access the API
// userId: Id of the user who is trying to log out
// Perform the logout operation, deleting the related security token so that it will be invalidated
// returns: 200 if logout successful
async function handleLogoutRequest(req, res) {
    const {currentUser} = req;
    try {
        if (currentUser) {
            await SecurityToken.removeSecurityTokensForUserId(currentUser.userId);
            logger.log('info', 'User ' + currentUser.username + ' successfully logged out. ' +
                ' Address: ' + req.connection.remoteAddress + '.');
            return res.status(200).send("Ok");
        } else {
            logger.log('error', 'Bad log out request from ' +
                req.connection.remoteAddress + '. Reason: api access token required.');
            return res.status(401).send({error: 'access token required'});
        }
    } catch (err) {
        logger.log('error', 'An error has occurred while attempting to log out user ' + userId +
            ' from address ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
        return res.status(500).send({
            error: err.message
        });
    }
}

async function postLogin(req, res) {
    const {userId, username, firstName, lastName, picture, googleProviderId, facebookProviderId} = req.currentUser;
    try {
        let securityToken = await SecurityToken.findSecurityTokenFromUserId(userId);
        if (!securityToken) {
            const providerToken = facebookProviderId || googleProviderId;
            const apiAccessToken = new ApiAccessToken(userId);
            if (providerToken) {
                securityToken = await SecurityToken.createFromApiAndProviderToken(apiAccessToken, providerToken);
            } else {
                securityToken = await SecurityToken.createFromApiToken(apiAccessToken);
            }
        }
        const loginViewModel = new LoginViewModel(userId, username, firstName, lastName, picture, securityToken.apiAccessToken);
        await accountRepository.updateLastLoginDate(userId, Date.now());
        logger.log('info', 'User ' + loginViewModel.username + ' successfully logged in using application' +
            ' from: ' + req.connection.remoteAddress + '.');
        return res.send(loginViewModel);
    } catch (e) {
        logger.log('error', 'Bad login request from ' +
            req.connection.remoteAddress + ' ' + e);
        return res.status(401).send({error: 'Bad login request'});
    }
}

module.exports = {
    handleLoginRequest,
    handleUserPasswordRegister,
    handleGoggleRegister,
    //this.handleRegisterRequest = handleRegisterRequest;
    postLogin,
    logout: handleLogoutRequest
};
