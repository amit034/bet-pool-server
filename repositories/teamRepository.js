const _ = require('lodash');
const {Team} = require('../models');

module.exports = {
    findById(id) {
        return Team.findOne({_id: id}).exec();
    },
    findOneByQuery(query, {transaction}) {
        return Team.findOne({where: query, transaction});
    },
    findAllByQuery(query, {transaction}) {
        return Team.findAll({where: query, transaction});
    },
    async findOrCreate(data, {transaction}) {
        const query  = {};
        if (data.id) {
            query.id = data.id;
        } else {
            query.fapiId = data.fapiId;
        }
        const team = await Team.findOne({where: query, transaction});
        return !_.isNil(team) ? team : Team.create(_.assign({}, data, query), {transaction});
    },
    createAll(records ,{transaction}) {
        return Team.bulkCreate(records, {transaction, ignoreDuplicates: true});
    }
};
