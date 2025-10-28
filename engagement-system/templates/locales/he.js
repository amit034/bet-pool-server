'use strict';

/**
 * Hebrew Locale Text Content
 * All Hebrew text strings for insights and notifications
 */

module.exports = {
    // Round Biggest Jump
    roundBiggestJump: {
        title: '{displayName} עושה גלים בסיבוב האחרון! 🚀',
        jumpDescription: 'עשה קפיצה של {jumpScore} נקודות מסיבוב {fromRound} לסיבוב {toRound}! 📈',
        scoreChange: 'ניקוד: {fromScore} → {toScore} נקודות',
        noDetails: 'הקפיצה הגדולה ביותר בסיבוב האחרון: {jumpScore} נקודות! 📈',
        encouragement: {
            huge: 'זה ביצוע מדהים! 🏆',
            great: 'שיפור יוצא דופן! תמשיך ככה! 💪',
            good: 'התקדמות מצוינת! 🎯'
        },
        footer: '_תמשיכו עם הניחושים!_'
    },

    // Pool Biggest Jump (All-Time Best)
    poolBiggestJump: {
        title: '{displayName} שבר שיא! 🏆',
        bestEver: 'השיפור הטוב ביותר בכל הזמנים של הפול: {jumpScore} נקודות! 🎯',
        roundInfo: '(מסיבוב {fromRound} לסיבוב {toRound})',
        scoreChange: 'ניקוד: {fromScore} → {toScore} נקודות',
        noDetails: 'השיפור הטוב ביותר בכל הזמנים: {jumpScore} נקודות! 🎯',
        encouragement: {
            legendary: 'זה שיא מדהים שיישאר בהיסטוריה! 🔥',
            amazing: 'ביצוע יוצא דופן שקשה לשבור! 💪',
            great: 'שיא נהדר של הפול! 🌟'
        },
        footer: '_תמשיכו להתחרות!_'
    },

    // Winning Streak
    winningStreak: {
        title: '{displayName} על רצף ניצחונות של {streakLength}! 🔥',
        description: '{streakLength} סיבובים רצופים עם ניחושים מנצחים!',
        encouragement: {
            legendary: 'זה רצף אגדי! 🏆',
            amazing: 'ביצוע מדהים! 💪',
            great: 'המשך ככה! 🎯'
        },
        footer: '_המשיכו להוביל!_'
    },

    // Welcome Users
    welcome: {
        singleTitle: '🎉 ברוך הבא {displayName} לפול! 🎉',
        multipleTitle: '🎉 ברוכים הבאים לחברי הפול החדשים: {usernames}! 🎉',
        excitement: 'התכונן לניחושים מרגשים! 🚀',
        excitementPlural: 'התכוננו לניחושים מרגשים! 🚀',
        footer: '_בהצלחה ושהמנצח הטוב ביותר יזכה!_ 🏆'
    },

    // Upcoming Games
    upcomingGames: {
        title: '⚽ *משחקים חדשים זמינים לניחוש!* ⚽',
        totalGamesAll: '📊 סה"כ משחקים פתוחים: {count}',
        totalGamesToday: '📅 משחקי היום: {count} משחקים',
        betsReceived: '🎯 ניחושים שנקלטו: {count}',
        mainGamesHeader: '*המשחקים המרכזיים:*',
        additionalGames: '_ועוד {count} משחקים נוספים..._',
        footer: '💡 _אל תפספסו! הכניסו את הניחושים שלכם עכשיו_ 🚀',
        noGames: 'אין משחקים זמינים'
    },

    // Reminder
    reminder: {
        title: '⏰ *תזכורת: אל תשכחו להכניס ניחושים!* ⏰',
        totalGamesAll: '📊 משחקים פתוחים לניחוש: {count}',
        totalGamesToday: '📅 משחקי היום שדורשים ניחוש: {count}',
        betsSoFar: '✅ ניחושים שנקלטו עד כה: {count}',
        mainGamesHeader: '*המשחקים המרכזיים:*',
        footer: '🎯 _זה הזמן להכניס את הניחושים שלכם!_ 💪',
        factorNote: '_שימו לב: משחקים עם ⭐ שווים יותר נקודות!_'
    },

    // Common
    common: {
        vs: 'נגד',
        and: 'ו',
        noGames: 'אין משחקים זמינים'
    }
};




