'use strict';

const _ = require('lodash');
const moment = require('moment');
const poolRepository = require('../../repositories/poolRepository');
const { getPopulatePoolChallenges } = require('../../utils/poolUtils');
const logger = require('../../utils/logger');

/**
 * Game List Helper - Shared helper for game listing in notifications
 * Provides common functionality for getting and formatting game lists
 */
class GameListHelper {
    
    /**
     * Get upcoming games for a pool with optional time filter
     * @param {number} poolId - Pool ID
     * @param {string} timeFilter - 'all' for all upcoming games, 'day' for today's games only
     * @returns {Promise<Array>} Array of upcoming games/challenges
     */
    static async getUpcomingGames(poolId, timeFilter = 'all') {
        try {
            const pool = await poolRepository.findById(poolId);
            
            if (!pool) {
                logger.error(`GameListHelper: Pool ${poolId} not found`);
                return [];
            }

            // Get all active (upcoming) challenges
            const challenges = await getPopulatePoolChallenges(pool, true);
            
            if (!challenges || challenges.length === 0) {
                logger.debug(`GameListHelper: No challenges found for pool ${poolId}`);
                return [];
            }

            // Filter to only upcoming games (isOpen = true, playAt in the future)
            let upcomingGames = challenges.filter(challenge => {
                const isOpen = challenge.isOpen;
                const isFuture = moment(challenge.playAt).isAfter(moment());
                return isOpen && isFuture;
            });

            // Apply time filter if 'day' is specified
            if (timeFilter === 'day') {
                const today = moment().format('YYYY-MM-DD');
                upcomingGames = upcomingGames.filter(challenge => {
                    const gameDate = moment(challenge.playAt).format('YYYY-MM-DD');
                    return gameDate === today;
                });
            }

            // Sort by playAt date
            upcomingGames = _.sortBy(upcomingGames, 'playAt');

            logger.debug(`GameListHelper: Found ${upcomingGames.length} upcoming games for pool ${poolId} (filter: ${timeFilter})`);
            
            return upcomingGames;

        } catch (error) {
            logger.error(`GameListHelper: Error getting upcoming games for pool ${poolId}:`, error);
            return [];
        }
    }

    /**
     * Get main games - games with the HIGHEST factor value
     * 
     * Logic:
     * - If all games have the same factor → NO main games (return empty)
     * - Otherwise → Return ALL games with the maximum factor value
     * 
     * Examples:
     * - Factors [1,1,1,2,1,2] → Main games: 2 games with factor=2
     * - Factors [1,1,1,1,1,1] → Main games: none (all same)
     * - Factors [1,1,2,2,3] → Main games: 1 game with factor=3
     * 
     * @param {Array} games - Array of games/challenges
     * @returns {Array} Array of main games (highest factor) sorted by playAt
     */
    static getMainGames(games) {
        try {
            if (!games || games.length === 0) {
                return [];
            }

            // Get all factor values
            const factors = games.map(g => g.factorId || 1);
            const maxFactor = Math.max(...factors);
            const minFactor = Math.min(...factors);
            
            // If all games have the same factor, there are no "main" games
            if (maxFactor === minFactor) {
                logger.debug(`GameListHelper: All ${games.length} games have same factor (${maxFactor}x) - no main games`);
                return [];
            }
            
            // Get all games with the highest factor
            const mainGames = games.filter(g => (g.factorId || 1) === maxFactor);
            
            // Sort by playAt (earliest first)
            const sortedMainGames = _.sortBy(mainGames, 'playAt');
            
            logger.debug(`GameListHelper: Found ${sortedMainGames.length} main games with factor ${maxFactor}x (out of ${games.length} total games)`);
            
            return sortedMainGames;

        } catch (error) {
            logger.error('GameListHelper: Error getting main games:', error);
            return [];
        }
    }

    /**
     * Format game details for display
     * @param {Object} challenge - Challenge/game object
     * @returns {string} Formatted game string (e.g., "Team A vs Team B")
     */
    static formatGameDetails(challenge) {
        try {
            const game = challenge.game;
            
            if (!game) {
                return 'Unknown Match';
            }

            const homeTeam = game.homeTeam?.name || 'Home Team';
            const awayTeam = game.awayTeam?.name || 'Away Team';
            const playAt = moment(challenge.playAt).format('DD/MM HH:mm');
            const factorMarker = challenge.factorId > 1 ? ` ⭐${challenge.factorId}x` : '';
            
            return `${homeTeam} vs ${awayTeam}${factorMarker} (${playAt})`;

        } catch (error) {
            logger.error('GameListHelper: Error formatting game details:', error);
            return 'Unknown Match';
        }
    }

    /**
     * Format a list of games for display
     * @param {Array} games - Array of games/challenges
     * @param {boolean} showAll - Whether to show all games or just main ones
     * @returns {string} Formatted game list
     */
    static formatGameList(games, showAll = false) {
        try {
            if (!games || games.length === 0) {
                return 'אין משחקים זמינים';
            }

            const gamesToShow = showAll ? games : this.getMainGames(games);
            
            let gameList = '';
            gamesToShow.forEach((game, index) => {
                gameList += `${index + 1}. ${this.formatGameDetails(game)}\n`;
            });

            if (!showAll && games.length > gamesToShow.length) {
                gameList += `\n_ועוד ${games.length - gamesToShow.length} משחקים נוספים..._`;
            }

            return gameList.trim();

        } catch (error) {
            logger.error('GameListHelper: Error formatting game list:', error);
            return 'שגיאה בטעינת רשימת המשחקים';
        }
    }

    /**
     * Get game statistics for a pool
     * @param {number} poolId - Pool ID
     * @param {string} timeFilter - 'all' or 'day'
     * @returns {Promise<Object>} Object with game statistics
     */
    static async getGameStats(poolId, timeFilter = 'all') {
        try {
            const games = await this.getUpcomingGames(poolId, timeFilter);
            const mainGames = this.getMainGames(games);

            return {
                totalGames: games.length,
                mainGames: mainGames.length,
                games: games,
                mainGamesList: mainGames
            };

        } catch (error) {
            logger.error(`GameListHelper: Error getting game stats for pool ${poolId}:`, error);
            return {
                totalGames: 0,
                mainGames: 0,
                games: [],
                mainGamesList: []
            };
        }
    }
}

module.exports = GameListHelper;

