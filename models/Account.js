'use strict';
const crypto = require('crypto');
const _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
    const {STRING, BOOLEAN, DATE, INTEGER, VIRTUAL, NOW} = DataTypes;
    const Account = sequelize.define('Account', {
        userId: {type: INTEGER(11), allowNull: false, primaryKey: true, autoIncrement: true, field: 'id'},
        username: {type: STRING, allowNull: false, unique: true, field: 'user_name'},
        picture: {
            type: STRING,
            allowNull: true,
            defaultValue: 'http://s3.amazonaws.com/37assets/svn/765-default-avatar.png'
        },
        hashedPassword: {type: STRING, allowNull: false, field: 'hashed_password'},
        password: {
            type: VIRTUAL,
            set(password) {
                this.setDataValue('plainPassword', password);
                this.setDataValue('salt', crypto.randomBytes(32).toString('hex'));
                //more secure - this.salt = crypto.randomBytes(128).toString('hex');
                this.setDataValue('hashedPassword', this.encryptPassword(password));
            },
            get() {
                return this.plainPassword;
            }
        },
        plainPassword: {type: STRING, allowNull: false, field: '_plain_password'},
        salt: {type: STRING, allowNull: false},
        email: {type: STRING, allowNull: false, unique: true},
        firstName: {type: STRING, allowNull: false, field: 'first_name'},
        lastName: {type: STRING, allowNull: false, field: 'last_name'},
        creationDate: {type: DATE, defaultValue: NOW, field: 'created_at'},
        lastLogin: {type: DATE, defaultValue: NOW, field: 'last_login'},
        isActive: {type: BOOLEAN, defaultValue: true, field: 'is_active'},
        // If confirmation email system is implemented,
        // this can be set to false
        canLogin: {type: BOOLEAN, defaultValue: true, field: 'can_login'},
        // Treated as a set
        //pools: {type: [mongoose.Schema.ObjectId], 'default': []},
        facebookProviderId: {type: INTEGER(11), allowNull: true, defaultValue: '0', field: 'facebook_provider_id'},
        googleProviderId: {type: INTEGER(11), allowNull: true, defaultValue: '0', field: 'google_provider_id'},
        isBot: {type: BOOLEAN, defaultValue: true, field: 'is_bot'}
    }, {
        tableName: 'accounts',
        timestamps: true,
        createdAt: 'creationDate',
        updatedAt: false,
        engine: 'InnoDB',
        charset: 'utf8'
    });
    Account.associate = function (models) {
        models.Account.belongsTo(models.TokenProvider, {
            foreignKey: 'facebookProviderId',
            targetKey: 'providerId',
            scope: {
                provider: 'Facebook'
            },
            as: 'facebookProvider'
        });
        models.Account.belongsTo(models.TokenProvider, {
            foreignKey: 'googleProviderId',
            targetKey: 'providerId',
            scope: {
                provider: 'Google'
            },
            as: 'googleProvider'
        });
    };
    Account.upsertFbUser = (accessToken, refreshToken, profile, cb) => {
        const mapUser = (profile) => {
            return {
                username: profile.emails[0].value,
                password: 'none',
                lastName: profile._json.first_name,
                firstName: profile._json.last_name,
                email: profile.emails[0].value,
                picture: profile.photos[0].value,
                facebookProviderId: profile.id
            };
        }
        return Account.upsertUserFromProvider(profile, accessToken, 'facebookProviderId', mapUser, cb);
    };
    Account.upsertGoogleUser = (accessToken, refreshToken, profile, cb) => {
        const mapUser = (profile) => {
            return {
                username: profile.displayName,
                password: 'none',
                lastName: profile._json.family_name,
                firstName: profile._json.given_name,
                email: profile.emails[0].value,
                picture: profile._json.picture,
                googleProviderId: profile.id
            };
        };
        return Account.upsertUserFromProvider(profile, accessToken, 'googleProviderId', mapUser, cb);
    };
    Account.upsertUserFromProvider = async (profile, accessToken, providerField, providerMapper, cb) => {
        const email = profile.emails[0].value;
        let searchByEmail;
        if (email) {
            searchByEmail = Account.findOne({where: {email}})
        } else {
            searchByEmail = Promise.resolve();
        }
        try {
            const [userBySearch, userByProfile] = await Promise.all([searchByEmail, Account.findOne({where: {[providerField]: profile.id}})])
            if (userBySearch && _.get(userBySearch, 'userId') != _.get(userByProfile, 'userId')) {
                return cb(new Error('user already exist with that email'), false, profile);
            }
            if (!userByProfile) {
                const newUser = await Account.create(providerMapper(profile));
                return cb(null, newUser);
            } else {
                return cb(null, userByProfile);
            }
        } catch (err) {
            return cb(err, null, profile);
        }
    };
    Account.prototype.hasChanged = function (firstName, lastName, email) {
        return (this.firstName !== firstName || this.lastName !== lastName || this.email !== email);
    };
    Account.prototype.encryptPassword = function (password) {
        return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    };
    Account.prototype.checkPassword = function (password) {
        const encrypt =  this.encryptPassword(password);
        console.log(encrypt);
        return encrypt === this.hashedPassword;
    };
    Account.prototype.isLocal = function() {
        return this.facebookProviderId < 1 && this.googleProviderId < 1
    };
    Account.prototype.getFullName = function () {
        return `${this.firstName} ${this.lastName}`;
    };
    Account.prototype.toJSON =  function() {
        const values = this.constructor['__proto__'].prototype.toJSON.call(this);
        return _.omit(values, ['hashedPassword', 'salt', 'hashedPassword', 'facebookProviderId', 'googleProviderId']);
    };
    return Account;
}