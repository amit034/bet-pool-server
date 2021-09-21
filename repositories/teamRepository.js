const _ = require('lodash');
const {Team} = require('../models');

module.exports = {
    findById(id) {
        return Team.findOne({_id: id}).exec();
    },
    findByCode(code, {transaction}) {
        return Team.findOne({where: {code}, transaction});
    },
    createTeam(req, opt) {
        req.shortName = _.get(req, 'shortName', req.name);
        return Team.create(req, opt);
    }
};
