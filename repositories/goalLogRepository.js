const {GoalLog, Game, Sequelize} = require('../models');
const {Op} = Sequelize;

module.exports = {
    createEntry({gameId, score1, score2}, {transaction} = {}) {
        return GoalLog.create({gameId, score1, score2}, {transaction});
    },

    findByPoolEventIds(eventIds, {transaction} = {}) {
        if (!eventIds || eventIds.length === 0) {
            return Promise.resolve([]);
        }
        return GoalLog.findAll({
            include: [{
                model: Game,
                as: 'game',
                attributes: ['id', 'round', 'eventId'],
                required: true,
                where: {eventId: {[Op.in]: eventIds}}
            }],
            order: [['createdAt', 'ASC']],
            transaction
        });
    }
};
