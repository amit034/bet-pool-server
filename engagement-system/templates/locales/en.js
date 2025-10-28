'use strict';

/**
 * English Locale Text Content
 * All English text strings for insights and notifications
 */

module.exports = {
    // Round Biggest Jump
    roundBiggestJump: {
        title: '{displayName} is making waves in the last round! 🚀',
        jumpDescription: 'Made a {jumpScore}-point jump from Round {fromRound} to Round {toRound}! 📈',
        scoreChange: 'Score: {fromScore} → {toScore} points',
        noDetails: 'Biggest jump in the last round: {jumpScore} points! 📈',
        encouragement: {
            huge: 'That\'s an incredible performance! 🏆',
            great: 'Outstanding improvement! Keep it up! 💪',
            good: 'Great progress! 🎯'
        },
        footer: '_Keep those predictions coming!_'
    },

    // Pool Biggest Jump (All-Time Best)
    poolBiggestJump: {
        title: '{displayName} broke a record! 🏆',
        bestEver: 'Pool\'s all-time best improvement: {jumpScore} points! 🎯',
        roundInfo: '(from Round {fromRound} to Round {toRound})',
        scoreChange: 'Score: {fromScore} → {toScore} points',
        noDetails: 'All-time best improvement: {jumpScore} points! 🎯',
        encouragement: {
            legendary: 'This legendary record will go down in history! 🔥',
            amazing: 'Outstanding achievement that\'s hard to beat! 💪',
            great: 'Great pool record! 🌟'
        },
        footer: '_Keep competing!_'
    },

    // Winning Streak
    winningStreak: {
        title: '{displayName} on a {streakLength} win streak! 🔥',
        description: '{streakLength} consecutive rounds with winning predictions!',
        encouragement: {
            legendary: 'This is a legendary streak! 🏆',
            amazing: 'Amazing performance! 💪',
            great: 'Keep it up! 🎯'
        },
        footer: '_Keep leading!_'
    },

    // Welcome Users
    welcome: {
        singleTitle: '🎉 Welcome {displayName} to the pool! 🎉',
        multipleTitle: '🎉 Welcome to our new pool members: {usernames}! 🎉',
        excitement: 'Get ready for exciting predictions! 🚀',
        excitementPlural: 'Get ready for exciting predictions! 🚀',
        footer: '_Good luck and may the best predictor win!_ 🏆'
    },

    // Upcoming Games
    upcomingGames: {
        title: '⚽ *New Games Available for Predictions!* ⚽',
        totalGamesAll: '📊 Total open games: {count}',
        totalGamesToday: '📅 Today\'s games: {count} matches',
        betsReceived: '🎯 Predictions received: {count}',
        mainGamesHeader: '*Main Games:*',
        additionalGames: '_And {count} more games..._',
        footer: '💡 _Don\'t miss out! Submit your predictions now_ 🚀',
        noGames: 'No games available'
    },

    // Reminder
    reminder: {
        title: '⏰ *Reminder: Don\'t Forget to Predict!* ⏰',
        totalGamesAll: '📊 Open games for prediction: {count}',
        totalGamesToday: '📅 Today\'s games awaiting prediction: {count}',
        betsSoFar: '✅ Predictions received so far: {count}',
        mainGamesHeader: '*Main Games:*',
        footer: '🎯 _Time to submit your predictions!_ 💪',
        factorNote: '_Note: Games with ⭐ are worth more points!_'
    },

    // Common
    common: {
        vs: 'vs',
        and: 'and',
        noGames: 'No games available'
    }
};




