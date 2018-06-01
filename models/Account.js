const mongoose = require('mongoose');
const _ = require('lodash');
var accountSchema = mongoose.Schema({
        username: {type: String, required: true, index: {unique: true}},
        picture: {type: String, required: false, default: 'http://s3.amazonaws.com/37assets/svn/765-default-avatar.png'},
        password: {type: String, required: true},
        email: {type: String, required: true, index: {unique: true}},
        firstName: {type: String, required: true},
        lastName: {type: String, required: true},
        creationDate: {type: Date, 'default': Date.now},
        lastLogin: {type: Date, 'default': null},
        isActive: {type: Boolean, 'default': true},
        // If confirmation email system is implemented,
        // this can be set to false
        canLogin: {type: Boolean, 'default': true},
        // Treated as a set
        //pools: {type: [mongoose.Schema.ObjectId], 'default': []},
        facebookProvider: {
            type: {
                id: String,
                token: String
            }
        },
        googleProvider: {
            type: {
                id: String,
                token: String
            }
        }
    })
;

accountSchema.methods.hasChanged = function (firstName, lastName, email) {
    return (this.firstName !== firstName || this.lastName !== lastName || this.email !== email);
};

accountSchema.methods.getFullName = function () {
    return (this.firstName + ' ' + this.lastName);
};
accountSchema.set('toJSON', {getters: true, virtuals: true});
accountSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.password;
    delete obj.facebookProvider;
    delete obj.googleProvider;
    return obj;
};

accountSchema.statics.upsertFbUser = function (accessToken, refreshToken, profile, cb) {
    var that = this;
    return this.findOne({
        'email': profile.emails[0].value
    }, function (err, user) {
        // no user was found, lets create a new one
        if (!user) {
            var newAccount = new that({
                username: profile.displayName,
                password: 'none',
                lastName: profile._json.last_name,
                firstName: profile._json.first_name,
                email: profile.emails[0].value,
                picture: profile._json.picture,
                facebookProvider: {
                    id: profile.id,
                    token: accessToken
                }
            });

            newAccount.save(function (error, savedUser) {
                if (error) {
                    console.log(error);
                }
                return cb(error, savedUser);
            });
        } else if (_.get(user, 'facebookProvider.id') != profile.id) {
            const err = "email already exist with different auth provider";
            return cb(err, user);
        } else {
            return cb(err, user);
        }
    });
};

accountSchema.statics.upsertGoogleUser = function (accessToken, refreshToken, profile, cb) {
    var that = this;
    return this.findOne({
        'email': profile.emails[0].value
    }, function (err, user) {
        // no user was found, lets create a new one
        if (!user) {
            var newAccount = new that({
                username: profile.displayName,
                lastName: profile._json.family_name,
                firstName: profile._json.given_name,
                password: 'none',
                email: profile.emails[0].value,
                picture: profile._json.picture,
                googleProvider: {
                    id: profile.id,
                    token: accessToken
                }
            });

            newAccount.save(function (error, savedUser) {
                if (error) {
                    console.log(error);
                }
                return cb(error, savedUser);
            });
        } else if (_.get(user, 'googleProvider.id') != profile.id) {
            const err = "email already exist with different auth provider";
            return cb(err, user);
        } else {
            return cb(err, user);
        }
    });
};
var Account = mongoose.model('Account', accountSchema);

module.exports = Account;
