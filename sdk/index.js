'use strict';
const Auth = require('./auth');
const Admin = require('./admin');
const Event = require('./event');
const User = require('./user');
const Profile = require('./profile');
module.exports = function (serviceUrl) {
    return {
        Auth: Auth(serviceUrl),
        Admin: Admin(serviceUrl),
        Event: Event(serviceUrl),
        Profile: Profile(serviceUrl),
        User: User(serviceUrl)
    };
};
