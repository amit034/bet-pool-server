const mongoose = require('mongoose');
const moment = require('moment');
const crypto = require('crypto');
const _ = require('lodash');
var accountSchema = mongoose.Schema({
        username: {type: String, required: true, index: {unique: true}},
        picture: {type: String, required: false, default: 'http://s3.amazonaws.com/37assets/svn/765-default-avatar.png'},
        //password: {type: String, required: true},
        hashedPassword: {type: String, required: true},
        salt: {type: String, required: true},
        email: {type: String, required: true, index: {unique: true}},
        firstName: {type: String, required: true},
        lastName: {type: String, required: true},
        creationDate: {type: Date, 'default': Date.now},
        lastLogin: {type: Date, 'default': moment()},
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
accountSchema.methods.encryptPassword = function(password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');

};

accountSchema.methods.checkPassword = function(password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

accountSchema.methods.isLocal = function() {
    return !this.facebookProvider && !this.googleProvider;
};


accountSchema.virtual('password').set(function(password) {
        this._plainPassword = password;
        this.salt = crypto.randomBytes(32).toString('hex');
        //more secure - this.salt = crypto.randomBytes(128).toString('hex');
        this.hashedPassword = this.encryptPassword(password);
}).get(function() { return this._plainPassword; });
//accountSchema.virtual('username').get(function() { return this.email; });

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
        const email = profile.emails[0].value;
        let searchByEmail;
        if (email) {
            searchByEmail = Account.findOne({email})
        } else {
            searchByEmail = null;
        }
        return Promise.all([searchByEmail, Account.findOne({'facebookProvider.id': profile.id})]).then(([userBySearch, userByProfile]) => {
            if (userBySearch && userBySearch.id != userByProfile.id) {
                return cb(new Error('user already exist with that email'), null, profile);
            }
            if (!userByProfile) {
                const newUser = new Account({
                    username: profile.displayName,
                    password: 'none',
                    lastName: profile._json.first_name,
                    firstName: profile._json.last_name,
                    email: profile.emails[0].value,
                    picture: profile._json.picture,
                    facebookProvider: {
                        id: profile.id,
                        token: accessToken
                    }
                });

                newUser.save(function (error, savedUser) {
                    if (error) {
                        console.log(error);
                    }
                    return cb(error, savedUser);
                });
            } else {
                return cb(null, userByProfile);
            }
        }).catch((err) => {
            return cb(err, null, profile);
        });
};

accountSchema.statics.upsertGoogleUser = function (accessToken, refreshToken, profile, cb) {
    var that = this;
    const email = profile.emails[0].value;
    let searchByEmail;
    if (email) {
        searchByEmail = Account.findOne({email})
    } else {
        searchByEmail = null;
    }
    return Promise.all([searchByEmail, Account.findOne({'googleProvider.id': profile.id})]).then(([userBySearch, userByProfile]) => {
        if (userBySearch && _.get(userBySearch,'id') != _.get(userByProfile, 'id')) {
            return cb(new Error('user already exist with that email'), false, profile);
        }
        if (!userByProfile) {
            const newUser = new Account({
                username: profile.displayName,
                password: 'none',
                lastName: profile._json.family_name,
                firstName: profile._json.given_name,
                email: profile.emails[0].value,
                picture: profile._json.picture,
                googleProvider: {
                    id: profile.id,
                    token: accessToken
                }
            });

            newUser.save(function (error, savedUser) {
                if (error) {
                    console.log(error);
                }
                return cb(error, savedUser);
            });
        } else {
            return cb(null, userByProfile);
        }
    }).catch((err) => {
        return cb(err, null, profile);
    });
};
var Account = mongoose.model('Account', accountSchema);

module.exports = Account;
