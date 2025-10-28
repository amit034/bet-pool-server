'use strict';

const PoolHandler = require('../../handlers/PoolHandler');
const BetHandler = require('../../handlers/BetHandler');
const betRepository = require('../../repositories/betRepository');
const moment = require('moment');
const logger = require('../../utils/logger');

/**
 * Betting Command - Handles /score command for interactive betting via Telegram
 * 
 * Flow:
 * 1. User sends /score
 * 2. Bot shows list of upcoming games with inline keyboard
 * 3. User selects a game
 * 4. Bot shows score selection matrix + custom input option
 * 5. User selects/enters score
 * 6. Bot validates and saves bet
 * 7. Bot confirms with success message
 */
class BettingCommand {
    constructor(poolId) {
        this.poolId = poolId;
        this.MAX_TOTAL_GOALS = 10;
        
        // Common score matrix (most popular scores)
        this.commonScores = [
            ['0-0', '1-0', '0-1'],
            ['1-1', '2-0', '0-2'],
            ['2-1', '1-2', '2-2'],
            ['3-0', '0-3', '3-1'],
            ['1-3', '3-2', '2-3'],
            ['⌨️ הזן תוצאה'] // Custom score entry
        ];
    }

    /**
     * Handle /score command - show list of upcoming games
     * @param {Object} message - Telegram message object
     * @param {Object} platform - TelegramPlatform instance
     */
    async handleScoreCommand(message, platform) {
        try {
            const userId = message.from.id;
            const chatId = message.chat.id;
            
            logger.info(`BettingCommand: User ${userId} requested /score`);
            
            // Get upcoming games for the pool
            const games = await this.getUpcomingGames();
            
            if (games.length === 0) {
                return await platform.sendMessage({
                    chatId,
                    text: '❌ אין משחקים פתוחים כרגע להימורים'
                });
            }
            
            // Get user's existing bets
            const userBets = await this.getUserBets(userId);
            
            // Build inline keyboard with game list
            const keyboard = await this.buildGameListKeyboard(games, userBets);
            
            const text = `⚽️ *בחר משחק להימור*\n\n` +
                        `יש ${games.length} משחקים זמינים:\n` +
                        `(משחקים עם הימור קיים מסומנים ב-✅)`;
            
            return await platform.sendMessage({
                chatId,
                text,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: keyboard
                }
            });
            
        } catch (error) {
            logger.error('BettingCommand: Error handling /score command:', error);
            throw error;
        }
    }

    /**
     * Handle game selection callback - show score selection matrix
     * @param {Object} callbackQuery - Telegram callback query
     * @param {Object} platform - TelegramPlatform instance
     */
    async handleGameSelection(callbackQuery, platform) {
        try {
            const userId = callbackQuery.from.id;
            const chatId = callbackQuery.message.chat.id;
            const messageId = callbackQuery.message.message_id;
            const challengeId = parseInt(callbackQuery.data.split('_')[2]);
            
            logger.info(`BettingCommand: User ${userId} selected game ${challengeId}`);
            
            // Get game details
            const game = await this.getGameDetails(challengeId);
            
            if (!game) {
                return await platform.answerCallbackQuery(callbackQuery.id, {
                    text: '❌ משחק לא נמצא',
                    show_alert: true
                });
            }
            
            // Build score selection keyboard
            const keyboard = this.buildScoreSelectionKeyboard(challengeId);
            
            const homeTeam = game.game.homeTeam.name;
            const awayTeam = game.game.awayTeam.name;
            const playAt = moment(game.playAt).format('DD/MM HH:mm');
            
            const text = `⚽️ *בחר תוצאה*\n\n` +
                        `🏠 ${homeTeam}\n` +
                        `🛫 ${awayTeam}\n` +
                        `📅 ${playAt}\n\n` +
                        `בחר תוצאה מהמטריצה או לחץ "הזן תוצאה" להקלדה ידנית:`;
            
            // Update the message with score selection
            return await platform.editMessageText({
                chatId,
                messageId,
                text,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: keyboard
                }
            });
            
        } catch (error) {
            logger.error('BettingCommand: Error handling game selection:', error);
            await platform.answerCallbackQuery(callbackQuery.id, {
                text: '❌ שגיאה, נסה שוב',
                show_alert: true
            });
        }
    }

    /**
     * Handle score selection callback - save bet
     * @param {Object} callbackQuery - Telegram callback query
     * @param {Object} platform - TelegramPlatform instance
     */
    async handleScoreSelection(callbackQuery, platform) {
        try {
            const userId = callbackQuery.from.id;
            const chatId = callbackQuery.message.chat.id;
            const messageId = callbackQuery.message.message_id;
            
            const [action, type, challengeId, score] = callbackQuery.data.split('_');
            
            logger.info(`BettingCommand: User ${userId} selected score ${score} for game ${challengeId}`);
            
            // Parse score
            const [homeScore, awayScore] = score.split('-').map(s => parseInt(s));
            
            // Validate score
            if (!this.validateScore(homeScore, awayScore)) {
                return await platform.answerCallbackQuery(callbackQuery.id, {
                    text: `❌ תוצאה לא תקינה! סכום השערים לא יכול לעבור ${this.MAX_TOTAL_GOALS}`,
                    show_alert: true
                });
            }
            
            // Get game details
            const game = await this.getGameDetails(parseInt(challengeId));
            
            // Save bet
            const bet = await this.saveBet(userId, parseInt(challengeId), homeScore, awayScore);
            
            // Send confirmation
            const homeTeam = game.game.homeTeam.name;
            const awayTeam = game.game.awayTeam.name;
            const playAt = moment(game.playAt).format('DD/MM HH:mm');
            
            const confirmText = `✅ *ההימור התקבל בהצלחה!*\n\n` +
                               `🏠 ${homeTeam}\n` +
                               `🛫 ${awayTeam}\n` +
                               `📅 ${playAt}\n\n` +
                               `📊 התוצאה שלך: *${homeScore}-${awayScore}*\n\n` +
                               `🍀 בהצלחה!`;
            
            // Delete the inline keyboard message
            await platform.deleteMessage(chatId, messageId);
            
            // Send confirmation as new message
            await platform.sendMessage({
                chatId,
                text: confirmText,
                parse_mode: 'Markdown'
            });
            
            // Answer callback query
            return await platform.answerCallbackQuery(callbackQuery.id, {
                text: '✅ ההימור נשמר!',
                show_alert: false
            });
            
        } catch (error) {
            logger.error('BettingCommand: Error handling score selection:', error);
            await platform.answerCallbackQuery(callbackQuery.id, {
                text: '❌ שגיאה בשמירת ההימור',
                show_alert: true
            });
        }
    }

    /**
     * Handle custom score entry request
     * @param {Object} callbackQuery - Telegram callback query
     * @param {Object} platform - TelegramPlatform instance
     */
    async handleCustomScoreRequest(callbackQuery, platform) {
        try {
            const chatId = callbackQuery.message.chat.id;
            const messageId = callbackQuery.message.message_id;
            const challengeId = callbackQuery.data.split('_')[3];
            
            // Store waiting state for this user
            platform.setUserWaitingForScore(callbackQuery.from.id, challengeId);
            
            const text = `⌨️ *הזן תוצאה*\n\n` +
                        `הקלד את התוצאה בפורמט: X-Y\n` +
                        `לדוגמה: 2-1 או 0-0\n\n` +
                        `⚠️ מקסימום ${this.MAX_TOTAL_GOALS} שערים בסך הכל`;
            
            await platform.editMessageText({
                chatId,
                messageId,
                text,
                parse_mode: 'Markdown'
            });
            
            return await platform.answerCallbackQuery(callbackQuery.id, {
                text: 'הקלד את התוצאה',
                show_alert: false
            });
            
        } catch (error) {
            logger.error('BettingCommand: Error handling custom score request:', error);
        }
    }

    /**
     * Get upcoming games for the pool
     * Reuses PoolHandler.getUpcomingGames()
     * @returns {Promise<Array>} Array of upcoming games
     */
    async getUpcomingGames() {
        try {
            return await PoolHandler.getUpcomingGames(this.poolId);
        } catch (error) {
            logger.error('BettingCommand: Error getting upcoming games:', error);
            return [];
        }
    }

    /**
     * Get user's existing bets
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Map of challengeId -> bet
     */
    async getUserBets(userId) {
        try {
            const bets = await betRepository.findUserBetsByQuery({ userId, poolId: this.poolId });
            
            // Convert array to map: challengeId -> bet
            const betMap = {};
            for (const bet of bets) {
                betMap[bet.challengeId] = {
                    homeScore: bet.score1,
                    awayScore: bet.score2,
                    id: bet.id
                };
            }
            
            return betMap;
        } catch (error) {
            logger.error('BettingCommand: Error getting user bets:', error);
            return {};
        }
    }

    /**
     * Get game details by challenge ID
     * @param {number} challengeId - Challenge ID
     * @returns {Promise<Object>} Game details
     */
    async getGameDetails(challengeId) {
        try {
            const games = await this.getUpcomingGames();
            return games.find(g => g.id === challengeId);
        } catch (error) {
            logger.error('BettingCommand: Error getting game details:', error);
            return null;
        }
    }

    /**
     * Build inline keyboard for game list
     * @param {Array} games - Array of games
     * @param {Object} userBets - User's existing bets
     * @returns {Array} Inline keyboard array
     */
    async buildGameListKeyboard(games, userBets) {
        const keyboard = [];
        
        for (const game of games) {
            const homeTeam = game.game.homeTeam.name;
            const awayTeam = game.game.awayTeam.name;
            const playAt = moment(game.playAt).format('DD/MM HH:mm');
            const hasBet = userBets[game.id];
            const betIndicator = hasBet ? '✅' : '  ';
            const betScore = hasBet ? ` (${hasBet.homeScore}-${hasBet.awayScore})` : '';
            
            keyboard.push([{
                text: `${betIndicator} ${homeTeam} vs ${awayTeam}${betScore} - ${playAt}`,
                callback_data: `bet_game_${game.id}`
            }]);
        }
        
        return keyboard;
    }

    /**
     * Build inline keyboard for score selection matrix
     * @param {number} challengeId - Challenge ID
     * @returns {Array} Inline keyboard array
     */
    buildScoreSelectionKeyboard(challengeId) {
        const keyboard = [];
        
        for (const row of this.commonScores) {
            const keyboardRow = row.map(score => {
                if (score === '⌨️ הזן תוצאה') {
                    return {
                        text: score,
                        callback_data: `bet_custom_${challengeId}`
                    };
                }
                return {
                    text: score,
                    callback_data: `bet_score_${challengeId}_${score}`
                };
            });
            keyboard.push(keyboardRow);
        }
        
        // Add back button
        keyboard.push([{
            text: '🔙 חזור לרשימת המשחקים',
            callback_data: 'bet_back'
        }]);
        
        return keyboard;
    }

    /**
     * Validate score (max total goals)
     * @param {number} homeScore - Home team score
     * @param {number} awayScore - Away team score
     * @returns {boolean} True if valid
     */
    validateScore(homeScore, awayScore) {
        if (isNaN(homeScore) || isNaN(awayScore)) {
            return false;
        }
        
        if (homeScore < 0 || awayScore < 0) {
            return false;
        }
        
        if (homeScore + awayScore > this.MAX_TOTAL_GOALS) {
            return false;
        }
        
        return true;
    }

    /**
     * Save bet to database
     * Reuses BetHandler.createOrUpdateBet()
     * @param {number} userId - User ID
     * @param {number} challengeId - Challenge ID
     * @param {number} homeScore - Home team score
     * @param {number} awayScore - Away team score
     * @returns {Promise<Object>} Saved bet
     */
    async saveBet(userId, challengeId, homeScore, awayScore) {
        try {
            const result = await BetHandler.createOrUpdateBet(
                this.poolId,
                userId,
                challengeId,
                homeScore,
                awayScore
            );
            
            logger.info(`BettingCommand: Saved bet for user ${userId}, game ${challengeId}: ${homeScore}-${awayScore}`);
            
            return result.bet;
        } catch (error) {
            logger.error('BettingCommand: Error saving bet:', error);
            throw error;
        }
    }
}

module.exports = BettingCommand;

