'use strict';
const schedule = require('node-schedule');
const logger = require('../utils/logger');
const _ = require('lodash');

const {sequelize} = require('../models');
const apiFootballSdk = require('../lib/apiFootballSDK');
const eventRepository = require('../repositories/eventRepository');
const teamRepository = require('../repositories/teamRepository');
const standingRepository = require('../repositories/standingRepository');


async function buildStandingRows(eventId, data, { transaction } = {}) {
    // Collect every unique team fapiId from all groups
    const standings = _.get(data, 'standings');
    const allEntries = _.flatMap(standings, (standing) => standing.table);
    const fapiIds = _.uniq(_.map(allEntries, 'team.id'));
 
    // Resolve fapiId → local teamId in one query
    const dbTeams = await teamRepository.findAllByQuery({ fapiId: fapiIds }, { transaction });
    const fapiToDbId = _.keyBy(dbTeams, 'fapiId'); // { [fapiId]: Team }
 
    const rows = [];
    for (const group of standings) {
        for (const entry of group.table) {
            const fapiId = _.get(entry, 'team.id');
            const dbTeam = fapiToDbId[fapiId];
 
            if (!dbTeam) {
                logger.log('info', `[standings] team fapiId ${fapiId} not found in DB – skipping`);
                continue;
            }
 
            rows.push({
                eventId,
                teamId:       dbTeam.id,
                group:        group.group  || null,
                stage:        group.stage  || null,
                position:     entry.position,
                playedGames:  entry.playedGames,
                won:          entry.won,
                draw:         entry.draw,
                lost:         entry.lost,
                points:       entry.points,
                goalsFor:     entry.goalsFor,
                goalsAgainst: entry.goalsAgainst,
                goalDifference: entry.goalDifference
            });
        }
    }
    return rows;
}

module.exports = {
    async start() {
        schedule.scheduleJob('* 0 * * *', async () => {
            const transaction = await sequelize.transaction();
            try {
                const autoEvents = await eventRepository.findActivePoolEvents({transaction});
                const fApiEvents = _.reject(autoEvents, {fapiId: null});
                await Promise.all(_.map(fApiEvents, async ({id: eventId, fapiId}) => {
                    if (fapiId) {
                        try {
                            const standings = await apiFootballSdk.getStandings(fapiId);
                            if (!_.isEmpty(standings)) {
                                const rows = await buildStandingRows(eventId, standings, { transaction });
                                await standingRepository.syncStandings(eventId, rows, { transaction });
                                logger.log('info', `[standings] synced ${rows.length} rows for event ${eventId}`);
                            }
                        } catch (standingsErr) {
                            // Non-fatal: log and continue (e.g. knockout-only competitions have no standings)
                            logger.log('info', `[standings] could not fetch standings for fapiId ${fapiId}: ${standingsErr.message}`);
                        }
                    }
                }));
                await transaction.commit();
            } catch (e) {
                logger.error(e);
                await transaction.rollback();
            }
        });
    }
};
