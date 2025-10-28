'use strict';

const BasePlatform = require('./BasePlatform');
const TelegramBot = require('node-telegram-bot-api');
const BettingCommand = require('../commands/BettingCommand');
const logger = require('../../utils/logger');

/**
 * TelegramPlatform - Telegram implementation
 * Handles all Telegram-specific communication and interactive commands
 */
class TelegramPlatform extends BasePlatform {
    constructor(config = {}) {
        super(config);
        this.platformName = 'telegram';
        this.bot = null;
        this.bettingCommand = null;
        
        this.botToken = config.botToken || process.env.TELEGRAM_BOT_TOKEN;
        this.groupId = config.groupId || process.env.TELEGRAM_GROUP_ID;
        this.poolId = config.poolId || 23; // Default pool ID
        
        // Track users waiting for custom score input
        this.usersWaitingForScore = new Map(); // userId -> challengeId
    }

    /**
     * Initialize Telegram bot with interactive features
     */
    async initialize() {
        try {
            // Prevent double initialization
            if (this.isInitialized && this.bot) {
                logger.info('TelegramPlatform: Already initialized, skipping...');
                return true;
            }
            
            if (!this.botToken || !this.groupId) {
                throw new Error('Missing bot token or group ID. Use MockPlatform for testing.');
            }

            // Clean up any existing bot instance first
            if (this.bot) {
                logger.info('TelegramPlatform: Stopping existing bot instance before re-initializing...');
                await this.stopBot();
            }

            // Initialize bot with polling enabled to receive commands
            // Use error handler to prevent crashes on polling errors
            this.bot = new TelegramBot(this.botToken, { 
                polling: {
                    interval: 300,
                    autoStart: true,
                    params: {
                        timeout: 10
                    }
                }
            });

            // Handle polling errors gracefully
            this.bot.on('polling_error', (error) => {
                if (error.code === 'ETELEGRAM' && error.message.includes('409')) {
                    logger.error('TelegramPlatform: 409 Conflict - Another bot instance is running!');
                    logger.error('TelegramPlatform: Stopping this bot to prevent conflicts...');
                    this.stopBot().catch(err => logger.error('Error stopping bot:', err));
                } else {
                    logger.error('TelegramPlatform: Polling error:', error.message);
                }
            });

            // Initialize betting command handler
            this.bettingCommand = new BettingCommand(this.poolId);

            // Set up command handlers
            this.setupCommandHandlers();
            
            // Set up callback query handlers
            this.setupCallbackHandlers();
            
            // Set up message handlers
            this.setupMessageHandlers();
            
            // Set bot commands (so they appear in Telegram UI)
            await this.setBotCommands();

            this.isInitialized = true;
            logger.info('TelegramPlatform: Initialized successfully with interactive features');
            
            return true;
        } catch (error) {
            logger.error('TelegramPlatform: Error initializing:', error);
            throw error;
        }
    }

    /**
     * Stop the bot and clean up polling
     */
    async stopBot() {
        try {
            if (this.bot) {
                logger.info('TelegramPlatform: Stopping bot...');
                await this.bot.stopPolling();
                this.bot.removeAllListeners();
                this.bot = null;
                this.isInitialized = false;
                logger.info('TelegramPlatform: Bot stopped successfully');
            }
        } catch (error) {
            logger.error('TelegramPlatform: Error stopping bot:', error);
        }
    }

    /**
     * Set bot commands (makes them appear in Telegram UI menu)
     */
    async setBotCommands() {
        try {
            const commands = [
                { command: 'start', description: 'Welcome message' },
                { command: 'score', description: 'Place your bets on upcoming games' }
            ];
            
            await this.bot.setMyCommands(commands);
            logger.info('TelegramPlatform: Bot commands set successfully');
        } catch (error) {
            logger.warn('TelegramPlatform: Could not set bot commands:', error.message);
        }
    }

    /**
     * Setup command handlers
     */
    setupCommandHandlers() {
        // /score command - start interactive betting
        this.bot.onText(/\/score/, async (msg) => {
            try {
                await this.bettingCommand.handleScoreCommand(msg, this);
            } catch (error) {
                logger.error('TelegramPlatform: Error handling /score command:', error);
                await this.sendMessage({
                    chatId: msg.chat.id,
                    text: '❌ שגיאה בטעינת המשחקים, נסה שוב מאוחר יותר'
                });
            }
        });

        // /start command
        this.bot.onText(/\/start/, async (msg) => {
            const welcomeText = `👋 שלום! ברוך הבא לבוט ההימורים *I Dare U*\n\n` +
                              `📝 פקודות זמינות:\n` +
                              `/score - הימור על משחקים\n\n` +
                              `בהצלחה! 🍀`;
            
            await this.bot.sendMessage(msg.chat.id, welcomeText, {
                parse_mode: 'Markdown'
            });
        });

        logger.debug('TelegramPlatform: Command handlers registered');
    }

    /**
     * Setup callback query handlers (inline keyboard buttons)
     */
    setupCallbackHandlers() {
        this.bot.on('callback_query', async (callbackQuery) => {
            try {
                const action = callbackQuery.data.split('_')[0];
                
                if (action === 'bet') {
                    const type = callbackQuery.data.split('_')[1];
                    
                    if (type === 'game') {
                        // Game selection
                        await this.bettingCommand.handleGameSelection(callbackQuery, this);
                    } else if (type === 'score') {
                        // Score selection
                        await this.bettingCommand.handleScoreSelection(callbackQuery, this);
                    } else if (type === 'custom') {
                        // Custom score entry request
                        await this.bettingCommand.handleCustomScoreRequest(callbackQuery, this);
                    } else if (type === 'back') {
                        // Back to game list
                        const msg = { from: callbackQuery.from, chat: callbackQuery.message.chat };
                        await this.bettingCommand.handleScoreCommand(msg, this);
                    }
                }
                
            } catch (error) {
                logger.error('TelegramPlatform: Error handling callback query:', error);
            }
        });

        logger.debug('TelegramPlatform: Callback handlers registered');
    }

    /**
     * Setup message handlers (for custom score input)
     */
    setupMessageHandlers() {
        this.bot.on('message', async (msg) => {
            try {
                // Ignore command messages (they're handled separately)
                if (msg.text && msg.text.startsWith('/')) {
                    return;
                }
                
                // Check if user is waiting to enter custom score
                const userId = msg.from.id;
                const challengeId = this.usersWaitingForScore.get(userId);
                
                if (challengeId && msg.text) {
                    await this.handleCustomScoreInput(msg, challengeId);
                }
                
            } catch (error) {
                logger.error('TelegramPlatform: Error handling message:', error);
            }
        });

        logger.debug('TelegramPlatform: Message handlers registered');
    }

    /**
     * Handle custom score input from user
     */
    async handleCustomScoreInput(msg, challengeId) {
        try {
            const userId = msg.from.id;
            const text = msg.text.trim();
            
            // Parse score (format: X-Y)
            const scoreMatch = text.match(/^(\d+)-(\d+)$/);
            
            if (!scoreMatch) {
                return await this.bot.sendMessage(msg.chat.id, 
                    '❌ פורמט לא תקין. הקלד בפורמט X-Y (לדוגמה: 2-1)');
            }
            
            const homeScore = parseInt(scoreMatch[1]);
            const awayScore = parseInt(scoreMatch[2]);
            
            // Validate score
            if (!this.bettingCommand.validateScore(homeScore, awayScore)) {
                return await this.bot.sendMessage(msg.chat.id,
                    `❌ תוצאה לא תקינה! סכום השערים לא יכול לעבור ${this.bettingCommand.MAX_TOTAL_GOALS}`);
            }
            
            // Get game details
            const game = await this.bettingCommand.getGameDetails(challengeId);
            
            if (!game) {
                return await this.bot.sendMessage(msg.chat.id, '❌ משחק לא נמצא');
            }
            
            // Save bet
            await this.bettingCommand.saveBet(userId, challengeId, homeScore, awayScore);
            
            // Clear waiting state
            this.usersWaitingForScore.delete(userId);
            
            // Send confirmation
            const moment = require('moment');
            const homeTeam = game.game.homeTeam.name;
            const awayTeam = game.game.awayTeam.name;
            const playAt = moment(game.playAt).format('DD/MM HH:mm');
            
            const confirmText = `✅ *ההימור התקבל בהצלחה!*\n\n` +
                               `🏠 ${homeTeam}\n` +
                               `🛫 ${awayTeam}\n` +
                               `📅 ${playAt}\n\n` +
                               `📊 התוצאה שלך: *${homeScore}-${awayScore}*\n\n` +
                               `🍀 בהצלחה!`;
            
            await this.bot.sendMessage(msg.chat.id, confirmText, {
                parse_mode: 'Markdown'
            });
            
        } catch (error) {
            logger.error('TelegramPlatform: Error handling custom score input:', error);
            await this.bot.sendMessage(msg.chat.id, '❌ שגיאה בשמירת ההימור');
        }
    }

    /**
     * Set user waiting for custom score input
     */
    setUserWaitingForScore(userId, challengeId) {
        this.usersWaitingForScore.set(userId, challengeId);
    }

    /**
     * Answer callback query (acknowledge button press)
     */
    async answerCallbackQuery(callbackQueryId, options = {}) {
        try {
            await this.bot.answerCallbackQuery(callbackQueryId, options);
        } catch (error) {
            logger.error('TelegramPlatform: Error answering callback query:', error);
        }
    }

    /**
     * Edit message text (update inline keyboard message)
     */
    async editMessageText(options) {
        try {
            const { chatId, messageId, text, parse_mode, reply_markup } = options;
            
            await this.bot.editMessageText(text, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: parse_mode || 'Markdown',
                reply_markup: reply_markup
            });
        } catch (error) {
            logger.error('TelegramPlatform: Error editing message:', error);
            throw error;
        }
    }

    /**
     * Delete message
     */
    async deleteMessage(chatId, messageId) {
        try {
            await this.bot.deleteMessage(chatId, messageId);
        } catch (error) {
            logger.error('TelegramPlatform: Error deleting message:', error);
        }
    }

    /**
     * Send text message to Telegram group or chat
     */
    async sendMessage(message) {
        try {
            // Support both old format and new direct options format
            let chatId, text, options;
            
            if (message.chatId) {
                // Direct options format (used by commands)
                chatId = message.chatId;
                text = message.text;
                options = {
                    parse_mode: message.parse_mode || 'Markdown',
                    reply_markup: message.reply_markup
                };
            } else {
                // Old format (used by engagement system)
                if (!this.validateMessage(message)) {
                    throw new Error('Invalid message format');
                }
                
                chatId = this.groupId;
                text = this.extractContent(message);
                options = { parse_mode: 'Markdown' };
                
                this.logSending('message', { content: text });
            }

            const result = await this.bot.sendMessage(chatId, text, options);

            if (!message.chatId) {
                this.logSuccess('message', result);
            }
            
            return { success: true, platform: 'telegram', result };

        } catch (error) {
            this.logError('sendMessage', error);
            throw error;
        }
    }

    /**
     * Send poll to Telegram group
     */
    async sendPoll(poll) {
        try {
            if (!this.validatePoll(poll)) {
                throw new Error('Invalid poll format');
            }

            this.logSending('poll', poll);

            const result = await this.bot.sendPoll(
                this.groupId,
                poll.question,
                poll.options,
                {
                    is_anonymous: false,
                    allows_multiple_answers: false
                }
            );

            this.logSuccess('poll', result);
            return { success: true, platform: 'telegram', result };

        } catch (error) {
            this.logError('sendPoll', error);
            throw error;
        }
    }

    /**
     * Send image with caption
     */
    async sendImage(image) {
        try {
            if (!image || !image.url) {
                throw new Error('Image URL is required');
            }

            this.logSending('image', image);

            const result = await this.bot.sendPhoto(
                this.groupId,
                image.url,
                {
                    caption: image.caption || '',
                    parse_mode: 'Markdown'
                }
            );

            this.logSuccess('image', result);
            return { success: true, platform: 'telegram', result };

        } catch (error) {
            this.logError('sendImage', error);
            throw error;
        }
    }

    /**
     * Get bot information
     */
    async getBotInfo() {
        try {
            const botInfo = await this.bot.getMe();
            return botInfo;
        } catch (error) {
            logger.error('TelegramPlatform: Error getting bot info:', error);
            return null;
        }
    }
}


module.exports = TelegramPlatform;

