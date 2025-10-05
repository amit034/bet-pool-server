/**
 * Basic Usage Examples for AI Tools
 * 
 * This file demonstrates how to use the various AI tools for betting pool analysis
 */

const { getAllTools, getTool } = require('../index');
const ToolConfig = require('../ToolConfig');

/**
 * Example 1: Get highest scoring users overall
 */
async function getTopPerformers(poolId) {
    console.log('🏆 Getting top performers...');
    
    const userMetricsTool = getTool('userMetrics');
    const input = {
        poolId: poolId,
        limit: 5,
        question: "Who are the top 5 performers overall?"
    };

    try {
        const result = await userMetricsTool._call(input);
        const data = JSON.parse(result);
        
        console.log('Top Performers:');
        data.data.overallLeaderboard?.forEach(user => {
            console.log(`${user.position}. ${user.username} - ${user.totalScore} points`);
        });
        
        return data;
    } catch (error) {
        console.error('Error getting top performers:', error.message);
        return null;
    }
}

/**
 * Example 2: Find biggest recoveries
 */
async function findBiggestRecoveries(poolId) {
    console.log('📈 Finding biggest recoveries...');
    
    const recoveryTool = getTool('recoveryAnalysis');
    const input = {
        poolId: poolId,
        minPositionJump: 3,
        recoveryType: 'positive',
        limit: 3
    };

    try {
        const result = await recoveryTool._call(input);
        const data = JSON.parse(result);
        
        console.log('Biggest Recoveries:');
        data.data.recoveryAnalysis.biggestRecoveries?.forEach(recovery => {
            console.log(`${recovery.username}: jumped from position ${recovery.previousPosition} to ${recovery.currentPosition} (${recovery.positionJump} positions) in round ${recovery.toRound}`);
        });
        
        return data;
    } catch (error) {
        console.error('Error finding recoveries:', error.message);
        return null;
    }
}

/**
 * Example 3: Get round-specific performance
 */
async function getRoundPerformance(poolId, roundNumber) {
    console.log(`🎯 Getting performance for round ${roundNumber}...`);
    
    const userMetricsTool = getTool('userMetrics');
    const input = {
        poolId: poolId,
        roundNumber: roundNumber,
        limit: 3,
        question: `Who performed best in round ${roundNumber}?`
    };

    try {
        const result = await userMetricsTool._call(input);
        const data = JSON.parse(result);
        
        console.log(`Round ${roundNumber} Top Performers:`);
        data.data.roundLeaderboard?.forEach(user => {
            console.log(`${user.position}. ${user.username} - ${user.roundScore} points (Position: ${user.position})`);
        });
        
        return data;
    } catch (error) {
        console.error('Error getting round performance:', error.message);
        return null;
    }
}

/**
 * Example 4: Get comprehensive statistics
 */
async function getPoolStatistics(poolId) {
    console.log('📊 Getting pool statistics...');
    
    const statisticsTool = getTool('statistics');
    const input = {
        poolId: poolId,
        analysisType: 'overview',
        excludeBots: true
    };

    try {
        const result = await statisticsTool._call(input);
        const data = JSON.parse(result);
        
        console.log('Pool Statistics:');
        const stats = data.data.overview;
        console.log(`- Total participants: ${stats.participants.total}`);
        console.log(`- Average score: ${stats.scores.average.toFixed(2)}`);
        console.log(`- Highest score: ${stats.scores.highest}`);
        console.log(`- Total rounds: ${stats.rounds.total}`);
        
        return data;
    } catch (error) {
        console.error('Error getting statistics:', error.message);
        return null;
    }
}

/**
 * Example 5: Analyze user-specific performance
 */
async function analyzeUserPerformance(poolId, userId) {
    console.log(`👤 Analyzing performance for user ${userId}...`);
    
    const userMetricsTool = getTool('userMetrics');
    const input = {
        poolId: poolId,
        userId: userId,
        question: `How is user ${userId} performing?`
    };

    try {
        const result = await userMetricsTool._call(input);
        const data = JSON.parse(result);
        
        if (data.data.userAnalysis) {
            const user = data.data.userAnalysis;
            console.log(`User Analysis for ${user.username}:`);
            console.log(`- Current position: ${user.currentPosition}`);
            console.log(`- Total score: ${user.totalScore}`);
            console.log(`- Average per round: ${user.averageRoundScore.toFixed(2)}`);
            console.log(`- Best round score: ${user.bestRound.score}`);
        } else {
            console.log('User not found or no data available');
        }
        
        return data;
    } catch (error) {
        console.error('Error analyzing user performance:', error.message);
        return null;
    }
}

/**
 * Example 6: Find comeback stories
 */
async function findComebackStories(poolId) {
    console.log('🎭 Finding comeback stories...');
    
    const recoveryTool = getTool('recoveryAnalysis');
    const input = {
        poolId: poolId,
        minPositionJump: 5,
        limit: 3
    };

    try {
        const result = await recoveryTool._call(input);
        const data = JSON.parse(result);
        
        console.log('Comeback Stories:');
        data.data.recoveryAnalysis.comebackStories?.forEach(comeback => {
            console.log(`${comeback.username}: recovered from position ${comeback.lowestPosition} (round ${comeback.lowestPositionRound}) to position ${comeback.finalPosition} (round ${comeback.finalRound}) - a ${comeback.totalRecovery} position improvement!`);
        });
        
        return data;
    } catch (error) {
        console.error('Error finding comeback stories:', error.message);
        return null;
    }
}

/**
 * Example 7: Get current rankings with trends
 */
async function getCurrentRankingsWithTrends(poolId) {
    console.log('📈 Getting current rankings with trends...');
    
    const rankingsTool = getTool('rankings');
    const input = {
        poolId: poolId,
        rankingType: 'current',
        limit: 10,
        excludeBots: true
    };

    try {
        const result = await rankingsTool._call(input);
        const data = JSON.parse(result);
        
        console.log('Current Rankings with Trends:');
        data.data.currentRankings.leaderboard?.forEach(user => {
            const trendEmoji = user.trend === 'improving' ? '📈' : 
                             user.trend === 'declining' ? '📉' : '➡️';
            console.log(`${user.position}. ${user.username} - ${user.totalScore} pts ${trendEmoji} (${user.totalMedals} medals)`);
        });
        
        return data;
    } catch (error) {
        console.error('Error getting rankings:', error.message);
        return null;
    }
}

/**
 * Example usage with error handling and configuration
 */
async function comprehensiveAnalysis(poolId) {
    console.log('🔍 Running comprehensive analysis...\n');
    
    try {
        // Use ToolConfig for validation and caching
        const results = await Promise.allSettled([
            ToolConfig.executeTool('userMetrics', { poolId, limit: 5 }),
            ToolConfig.executeTool('recoveryAnalysis', { poolId, minPositionJump: 3, limit: 3 }),
            ToolConfig.executeTool('statistics', { poolId, analysisType: 'overview' }),
            ToolConfig.executeTool('rankings', { poolId, rankingType: 'current', limit: 5 })
        ]);

        results.forEach((result, index) => {
            const toolNames = ['User Metrics', 'Recovery Analysis', 'Statistics', 'Rankings'];
            if (result.status === 'fulfilled') {
                console.log(`✅ ${toolNames[index]}: Success`);
            } else {
                console.log(`❌ ${toolNames[index]}: ${result.reason.message}`);
            }
        });

        return results;
    } catch (error) {
        console.error('Comprehensive analysis failed:', error.message);
        return null;
    }
}

// Export examples for use in other files
module.exports = {
    getTopPerformers,
    findBiggestRecoveries,
    getRoundPerformance,
    getPoolStatistics,
    analyzeUserPerformance,
    findComebackStories,
    getCurrentRankingsWithTrends,
    comprehensiveAnalysis
};

// If running this file directly, run examples
if (require.main === module) {
    // Example pool ID - replace with actual pool ID from your database
    const EXAMPLE_POOL_ID = '1'; 
    
    async function runExamples() {
        console.log('🚀 Running AI Tools Examples\n');
        
        await getTopPerformers(EXAMPLE_POOL_ID);
        console.log('\n' + '='.repeat(50) + '\n');
        
        await findBiggestRecoveries(EXAMPLE_POOL_ID);
        console.log('\n' + '='.repeat(50) + '\n');
        
        await getRoundPerformance(EXAMPLE_POOL_ID, 2);
        console.log('\n' + '='.repeat(50) + '\n');
        
        await getPoolStatistics(EXAMPLE_POOL_ID);
        console.log('\n' + '='.repeat(50) + '\n');
        
        await findComebackStories(EXAMPLE_POOL_ID);
        console.log('\n' + '='.repeat(50) + '\n');
        
        await getCurrentRankingsWithTrends(EXAMPLE_POOL_ID);
        console.log('\n' + '='.repeat(50) + '\n');
        
        console.log('✨ Examples completed!');
    }
    
    runExamples().catch(console.error);
}
