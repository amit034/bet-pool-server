/**
 * Chatbot Integration Example
 * 
 * Shows how to integrate the AI tools with a chatbot or conversational AI
 */

const { getAllTools } = require('../index');
const ToolConfig = require('../ToolConfig');

/**
 * Simple question router that determines which tool to use based on the question
 */
class QuestionRouter {
    constructor() {
        this.patterns = [
            // User Metrics patterns
            {
                patterns: [
                    /who.*highest.*score/i,
                    /who.*top.*performer/i,
                    /who.*best.*player/i,
                    /what.*ranking/i,
                    /how.*performing/i,
                    /who.*number.*one/i,
                    /leaderboard/i
                ],
                tool: 'userMetrics',
                defaultParams: { limit: 5 }
            },
            
            // Recovery Analysis patterns
            {
                patterns: [
                    /biggest.*recovery/i,
                    /comeback.*story/i,
                    /position.*jump/i,
                    /who.*jumped/i,
                    /dramatic.*change/i,
                    /fell.*ranking/i,
                    /biggest.*fall/i,
                    /recovery.*analysis/i
                ],
                tool: 'recoveryAnalysis',
                defaultParams: { minPositionJump: 3, limit: 5 }
            },
            
            // Statistics patterns
            {
                patterns: [
                    /statistics/i,
                    /how.*competitive/i,
                    /score.*distribution/i,
                    /average.*score/i,
                    /pool.*stats/i,
                    /medal.*distribution/i,
                    /general.*info/i
                ],
                tool: 'statistics',
                defaultParams: { analysisType: 'overview' }
            },
            
            // Rankings patterns
            {
                patterns: [
                    /current.*ranking/i,
                    /ranking.*trend/i,
                    /most.*consistent/i,
                    /ranking.*stability/i,
                    /historical.*ranking/i,
                    /position.*trend/i
                ],
                tool: 'rankings',
                defaultParams: { rankingType: 'current', limit: 10 }
            }
        ];
    }

    /**
     * Route a question to the appropriate tool
     */
    routeQuestion(question) {
        for (const route of this.patterns) {
            for (const pattern of route.patterns) {
                if (pattern.test(question)) {
                    return {
                        tool: route.tool,
                        params: route.defaultParams,
                        confidence: 0.8
                    };
                }
            }
        }
        
        // Default to user metrics if no pattern matches
        return {
            tool: 'userMetrics',
            params: { limit: 5 },
            confidence: 0.3
        };
    }

    /**
     * Extract parameters from question text
     */
    extractParams(question, poolId) {
        const params = { poolId };
        
        // Extract round numbers
        const roundMatch = question.match(/round\s+(\d+)/i);
        if (roundMatch) {
            params.roundNumber = parseInt(roundMatch[1]);
        }
        
        // Extract user mentions (assuming @username format)
        const userMatch = question.match(/@(\w+)/i);
        if (userMatch) {
            params.username = userMatch[1];
        }
        
        // Extract limits
        const limitMatch = question.match(/top\s+(\d+)|first\s+(\d+)|(\d+)\s+best/i);
        if (limitMatch) {
            params.limit = parseInt(limitMatch[1] || limitMatch[2] || limitMatch[3]);
        }
        
        // Extract position jumps
        const jumpMatch = question.match(/(\d+)\s+position/i);
        if (jumpMatch) {
            params.minPositionJump = parseInt(jumpMatch[1]);
        }
        
        return params;
    }
}

/**
 * Main chatbot handler
 */
class BettingPoolChatbot {
    constructor() {
        this.router = new QuestionRouter();
        this.tools = getAllTools();
    }

    /**
     * Process a user question and return a formatted response
     */
    async processQuestion(question, poolId, userId = null) {
        try {
            console.log(`🤖 Processing question: "${question}"`);
            
            // Route the question to appropriate tool
            const route = this.router.routeQuestion(question);
            console.log(`📍 Routed to: ${route.tool} (confidence: ${route.confidence})`);
            
            // Extract additional parameters from the question
            const extractedParams = this.router.extractParams(question, poolId);
            
            // Combine default params with extracted params
            const params = {
                ...route.params,
                ...extractedParams,
                question: question // Include original question for context
            };
            
            // Add user-specific params if provided
            if (userId) {
                params.userId = userId;
            }
            
            // Execute the tool
            const result = await ToolConfig.executeTool(route.tool, params);
            const data = JSON.parse(result);
            
            // Format response for chatbot
            const response = this.formatChatbotResponse(data, question, route.tool);
            
            return {
                success: true,
                response,
                tool: route.tool,
                confidence: route.confidence,
                rawData: data
            };
            
        } catch (error) {
            console.error('Chatbot error:', error.message);
            return {
                success: false,
                response: "I'm sorry, I couldn't process that question. Could you try rephrasing it?",
                error: error.message
            };
        }
    }

    /**
     * Format the tool response for chatbot consumption
     */
    formatChatbotResponse(data, question, toolName) {
        const context = data.context || '';
        const results = data.data;
        
        switch (toolName) {
            case 'userMetrics':
                return this.formatUserMetricsResponse(results, question);
            case 'recoveryAnalysis':
                return this.formatRecoveryResponse(results, question);
            case 'statistics':
                return this.formatStatisticsResponse(results, question);
            case 'rankings':
                return this.formatRankingsResponse(results, question);
            default:
                return "I found some information, but I'm not sure how to present it. Could you be more specific?";
        }
    }

    formatUserMetricsResponse(results, question) {
        let response = '';
        
        if (results.overallLeaderboard) {
            response += "🏆 **Top Performers:**\n";
            results.overallLeaderboard.slice(0, 3).forEach(user => {
                const trendEmoji = user.trend === 'improving' ? '📈' : 
                                 user.trend === 'declining' ? '📉' : '➡️';
                response += `${user.position}. **${user.username}** - ${user.totalScore} points ${trendEmoji}\n`;
            });
        }
        
        if (results.roundLeaderboard) {
            response += `\n🎯 **Round ${results.roundLeaderboard[0]?.round || 'X'} Leaders:**\n`;
            results.roundLeaderboard.slice(0, 3).forEach(user => {
                response += `${user.position}. **${user.username}** - ${user.roundScore} points\n`;
            });
        }
        
        if (results.userAnalysis) {
            const user = results.userAnalysis;
            response += `\n👤 **${user.username}'s Performance:**\n`;
            response += `• Current position: #${user.currentPosition}\n`;
            response += `• Total score: ${user.totalScore} points\n`;
            response += `• Average per round: ${user.averageRoundScore.toFixed(1)} points\n`;
            
            if (user.bestRound) {
                response += `• Best round: ${user.bestRound.score} points\n`;
            }
        }
        
        return response || "I couldn't find specific performance data for your question.";
    }

    formatRecoveryResponse(results, question) {
        let response = '';
        
        if (results.recoveryAnalysis?.biggestRecoveries?.length > 0) {
            response += "📈 **Biggest Recoveries:**\n";
            results.recoveryAnalysis.biggestRecoveries.slice(0, 3).forEach(recovery => {
                response += `• **${recovery.username}** jumped from #${recovery.previousPosition} to #${recovery.currentPosition} `;
                response += `(+${recovery.positionJump} positions) in round ${recovery.toRound}\n`;
            });
        }
        
        if (results.recoveryAnalysis?.biggestFalls?.length > 0) {
            response += "\n📉 **Biggest Falls:**\n";
            results.recoveryAnalysis.biggestFalls.slice(0, 3).forEach(fall => {
                response += `• **${fall.username}** dropped from #${fall.previousPosition} to #${fall.currentPosition} `;
                response += `(-${fall.positionJump} positions) in round ${fall.toRound}\n`;
            });
        }
        
        if (results.recoveryAnalysis?.comebackStories?.length > 0) {
            response += "\n🎭 **Comeback Stories:**\n";
            results.recoveryAnalysis.comebackStories.slice(0, 2).forEach(comeback => {
                response += `• **${comeback.username}** recovered from #${comeback.lowestPosition} to #${comeback.finalPosition} `;
                response += `(${comeback.totalRecovery} positions over ${comeback.roundsToRecover} rounds)\n`;
            });
        }
        
        return response || "I couldn't find any significant position changes to report.";
    }

    formatStatisticsResponse(results, question) {
        let response = '';
        
        if (results.overview) {
            const stats = results.overview;
            response += "📊 **Pool Statistics:**\n";
            response += `• Total participants: ${stats.participants.total}\n`;
            response += `• Average score: ${stats.scores.average.toFixed(1)} points\n`;
            response += `• Highest score: ${stats.scores.highest} points\n`;
            response += `• Total rounds: ${stats.rounds.total}\n`;
            response += `• Score spread: ${stats.competition.scoreSpread} points\n`;
        }
        
        if (results.medals) {
            const medals = results.medals;
            response += "\n🏅 **Medal Leaders:**\n";
            if (medals.medalLeaders.goldLeader) {
                response += `• Gold: **${medals.medalLeaders.goldLeader.username}** (${medals.medalLeaders.goldLeader.medals['3'] || 0})\n`;
            }
            if (medals.medalLeaders.silverLeader) {
                response += `• Silver: **${medals.medalLeaders.silverLeader.username}** (${medals.medalLeaders.silverLeader.medals['2'] || 0})\n`;
            }
        }
        
        return response || "I found some statistics but couldn't format them properly.";
    }

    formatRankingsResponse(results, question) {
        let response = '';
        
        if (results.currentRankings?.leaderboard) {
            response += "🏆 **Current Rankings:**\n";
            results.currentRankings.leaderboard.slice(0, 5).forEach(user => {
                const trendEmoji = user.trend === 'improving' ? '📈' : 
                                 user.trend === 'declining' ? '📉' : '➡️';
                response += `${user.position}. **${user.username}** - ${user.totalScore} pts ${trendEmoji}\n`;
            });
        }
        
        if (results.stabilityAnalysis?.mostStable) {
            response += "\n🎯 **Most Consistent:**\n";
            results.stabilityAnalysis.mostStable.slice(0, 3).forEach(user => {
                response += `• **${user.username}** - Avg position: ${user.averagePosition.toFixed(1)}\n`;
            });
        }
        
        if (results.rankingTrends?.risingStars) {
            response += "\n⭐ **Rising Stars:**\n";
            results.rankingTrends.risingStars.slice(0, 3).forEach(user => {
                response += `• **${user.username}** - ${user.trend} trend\n`;
            });
        }
        
        return response || "I couldn't find ranking information for your question.";
    }

    /**
     * Get help message
     */
    getHelpMessage() {
        return `🤖 **I can help you analyze betting pool performance!**

**Ask me questions like:**
• "Who has the highest score?"
• "Who made the biggest recovery?"
• "How is @username performing?"
• "What are the statistics for this pool?"
• "Who jumped the most positions?"
• "Show me the current rankings"
• "Who performed best in round 3?"

**Available commands:**
• \`/top\` - Show top performers
• \`/stats\` - Show pool statistics  
• \`/recoveries\` - Show biggest recoveries
• \`/rankings\` - Show current rankings
• \`/help\` - Show this message`;
    }

    /**
     * Handle slash commands
     */
    async handleCommand(command, poolId) {
        const commands = {
            '/top': () => this.processQuestion('Who are the top 5 performers?', poolId),
            '/stats': () => this.processQuestion('What are the pool statistics?', poolId),
            '/recoveries': () => this.processQuestion('Who made the biggest recoveries?', poolId),
            '/rankings': () => this.processQuestion('Show me the current rankings', poolId),
            '/help': () => ({ success: true, response: this.getHelpMessage() })
        };

        const handler = commands[command.toLowerCase()];
        if (handler) {
            return await handler();
        } else {
            return {
                success: false,
                response: "Unknown command. Type `/help` for available commands."
            };
        }
    }
}

// Export for use in chatbot applications
module.exports = { BettingPoolChatbot, QuestionRouter };

// Example usage
if (require.main === module) {
    async function testChatbot() {
        const chatbot = new BettingPoolChatbot();
        const poolId = '1';
        
        const questions = [
            "Who has the highest score?",
            "Who made the biggest comeback?",
            "How is user 123 performing?",
            "What are the pool statistics?",
            "Who jumped the most positions in round 3?",
            "Show me the top 3 performers"
        ];
        
        console.log('🤖 Testing Betting Pool Chatbot\n');
        
        for (const question of questions) {
            console.log(`\n❓ Question: "${question}"`);
            const result = await chatbot.processQuestion(question, poolId);
            
            if (result.success) {
                console.log(`✅ Response:\n${result.response}`);
            } else {
                console.log(`❌ Error: ${result.error}`);
            }
            
            console.log('─'.repeat(50));
        }
        
        // Test commands
        console.log('\n🎮 Testing Commands\n');
        const commands = ['/top', '/stats', '/help'];
        
        for (const command of commands) {
            console.log(`\n💻 Command: ${command}`);
            const result = await chatbot.handleCommand(command, poolId);
            console.log(`Response:\n${result.response}`);
            console.log('─'.repeat(50));
        }
    }
    
    testChatbot().catch(console.error);
}
