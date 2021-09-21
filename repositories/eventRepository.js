const _ = require('lodash');
const {Event,Team} = require('../models');

module.exports = {
    findAll(query, {transaction}) {
        return Event.findAll({where: query, transaction});
    },
    findById(id) {
        return Event.findByPk(id, {include: [{model: Team, as: 'homeTeam'}, {model: Team, as: 'awayTeam'}]});
    },
    findActiveEventsByIds(ids, {transaction}) {
        return Event.findAll({where: {id: ids, isActive: true}, transaction});
    },
    findByName(name, {transaction}) {
        return Event.findOne({where: {name}, transaction});
    },
    createEvent(data, {transaction}) {
        return Event.create(data, {transaction});
    }
}