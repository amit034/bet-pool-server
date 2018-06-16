'use strict';
const Auth = require('./auth');
const Admin = require('./admin');
const Event = require('./event');
const User = require('./user');
const Profile = require('./profile');

const SERVICE_URL = 'http://localhost:3000';

module.exports = function () {
    return {
        Auth: Auth(SERVICE_URL),
        Admin: Admin(SERVICE_URL),
        Event: Event(SERVICE_URL),
        Profile: Profile(SERVICE_URL),
        User: User(SERVICE_URL)
    };
};
