const _ = require('lodash');
const {Event, Team, Pool} = require('../models');
function findById(id) {
    return Event.findByPk(id, {include: [{model: Team, as: 'homeTeam'}, {model: Team, as: 'awayTeam'}]});
}
module.exports = {
    findAll(query, {transaction} = {}) {
        return Event.findAll({where: query, transaction});
    },
    findById,
    findActiveEventsByIds(ids, {transaction} = {}) {
        return Event.findAll({where: {id: ids, isActive: true}, transaction});
    },
    findActivePoolEvents({transaction} ={}) {
        return Event.findAll({where: {isActive: true}, include: [{model: Pool, as: 'pools'}], transaction});
    },
    findByName(name, {transaction}) {
        return Event.findOne({where: {name}, transaction});
    },
    createEvent(data, {transaction}) {
        return Event.create(data, {transaction});
    },
    async updateEvent({id, isActive}, {transaction}) {
        const event = await Event.findByPk(id, {transaction});
        return event.update({isActive}, {transaction});
    }
}