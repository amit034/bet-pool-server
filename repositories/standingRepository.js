'use strict';
const _ = require('lodash');
const { Standing, Team } = require('../models');

module.exports = {
    findByEventId(eventId, { transaction } = {}) {
        return Standing.findAll({
            where: { eventId },
            include: [{ model: Team, as: 'team' }],
            order: [['group_name', 'ASC'], ['position', 'ASC']],
            transaction
        });
    },

    /**
     * Upsert a single standing row.
     * Matches on (eventId, teamId) — one row per team per event.
     */
    async upsertStanding(data, { transaction } = {}) {
        const { eventId, teamId } = data;
        const existing = await Standing.findOne({ where: { eventId, teamId }, transaction });
        if (existing) {
            return existing.update(data, { transaction });
        }
        return Standing.create(data, { transaction });
    },

    /**
     * Bulk-upsert all standings for an event.
     * rows: array of standing data objects (must include eventId, teamId).
     */
    async syncStandings(eventId, rows, { transaction } = {}) {
        return Promise.all(
            _.map(rows, row => module.exports.upsertStanding({ ...row, eventId }, { transaction }))
        );
    }
};