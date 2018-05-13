'use strict';
const Auth = require('./auth');
const Admin = require('./admin');
const User = require('./user');
const Profile = require('./profile');
module.exports = function (serviceUrl) {
    return {
        Auth: Auth(serviceUrl),
        Admin: Admin(serviceUrl),
        Profile: Profile(serviceUrl),
        User: User(serviceUrl)
    }
};
