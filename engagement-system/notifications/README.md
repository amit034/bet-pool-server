# Notifications System

This folder contains notification modules for the engagement system. Notifications are proactive messages sent to pool participants to keep them engaged and informed.

## Available Notifications

### 1. WelcomeUsersNotification
**File:** `welcomeUsers.js`

Welcomes new users when they join a pool.

**Configuration:**
```javascript
{
  poolId: 23,
  lookbackHours: 1,
  cooldown: 3600000 // 1 hour
}
```

**Triggers:**
- When new users join the pool (joined=true, welcomeSent=false)

**Features:**
- Automatically marks users as welcomed after sending
- Supports single or multiple user welcomes
- Hebrew language support

---

### 2. UpcomingGamesNotification
**File:** `UpcomingGamesNotification.js`

Notifies users about new games available to bet on.

**Configuration:**
```javascript
{
  poolId: 23,
  timeFilter: 'all', // or 'day'
  minGamesToTrigger: 1,
  cooldown: 43200000 // 12 hours
}
```

**Time Filters:**
- `'all'` - All upcoming games
- `'day'` - Only games scheduled for today

**Features:**
- Shows total number of games
- Displays main games (highest factor values)
- Shows bet count
- Lists game details (home team vs away team, date/time, factor)

---

### 3. ReminderNotification
**File:** `ReminderNotification.js`

Reminds users to place their bets on upcoming games.

**Configuration:**
```javascript
{
  poolId: 23,
  timeFilter: 'all', // or 'day'
  minGamesToTrigger: 1,
  cooldown: 86400000 // 24 hours
}
```

**Time Filters:**
- `'all'` - Remind about all upcoming games
- `'day'` - Remind only about today's games

**Features:**
- Reuses game listing logic from UpcomingGamesNotification
- Shows bet progress
- Highlights games with higher factors
- Sends during active hours (9 AM - 10 PM)

---

## Game List Helper

**File:** `gameListHelper.js`

Shared helper module that provides common functionality for game-related notifications.

**Functions:**

### `getUpcomingGames(poolId, timeFilter)`
Gets upcoming games for a pool with optional time filter.

**Parameters:**
- `poolId` - Pool ID
- `timeFilter` - 'all' or 'day'

**Returns:** Array of upcoming games/challenges

---

### `getMainGames(games, limit)`
Filters games to get the main ones (higher factor values).

**Parameters:**
- `games` - Array of games
- `limit` - Maximum number of games to return (default: 5)

**Returns:** Array of main games sorted by factor

---

### `countBetsForChallenges(poolId, challenges)`
Counts bets placed for a list of challenges.

**Parameters:**
- `poolId` - Pool ID
- `challenges` - Array of challenges

**Returns:** Number of bets placed

---

### `formatGameDetails(challenge)`
Formats game details for display.

**Parameters:**
- `challenge` - Challenge/game object

**Returns:** Formatted string (e.g., "Team A vs Team B ⭐2x (15/10 20:00)")

---

### `formatGameList(games, showAll)`
Formats a list of games for display.

**Parameters:**
- `games` - Array of games
- `showAll` - Whether to show all games or just main ones

**Returns:** Formatted game list string

---

### `getGameStats(poolId, timeFilter)`
Gets comprehensive game statistics for a pool.

**Parameters:**
- `poolId` - Pool ID
- `timeFilter` - 'all' or 'day'

**Returns:** Object with game statistics:
```javascript
{
  totalGames: 10,
  mainGames: 5,
  betCount: 45,
  games: [...],
  mainGamesList: [...]
}
```

---

## Usage

### In Insight Loader

Notifications can be loaded automatically by the insight loader if they extend `BaseInsight` and follow the same pattern as insights.

### Manual Usage

```javascript
const { WelcomeUsersNotification, UpcomingGamesNotification, ReminderNotification } = require('./engagement-system/notifications');

// Create notification instance
const welcomeNotif = new WelcomeUsersNotification({
  poolId: 23
});

// Check if should trigger
const shouldTrigger = await welcomeNotif.shouldTrigger();

if (shouldTrigger) {
  // Build and send message
  const message = await welcomeNotif.buildMessage();
  console.log(message.content);
}
```

---

## Adding New Notifications

To add a new notification:

1. Create a new file in this folder (e.g., `MyNotification.js`)
2. Extend `BaseInsight` class
3. Implement required methods:
   - `shouldTrigger()` - Determine when to send notification
   - `buildMessage()` - Build the notification message
4. Add to `index.js` exports
5. Update this README

Example:
```javascript
const BaseInsight = require('../core/BaseInsight');

class MyNotification extends BaseInsight {
  constructor(config = {}) {
    super({
      id: 'my_notification',
      name: 'My Notification',
      priority: 'medium',
      ...config
    });
  }

  async shouldTrigger() {
    // Implement trigger logic
    return false;
  }

  async buildMessage() {
    // Implement message building logic
    return {
      type: 'notification',
      content: 'Message content',
      metadata: {}
    };
  }
}

module.exports = MyNotification;
```

---

## Repository Functions Used

The notifications use the following repository functions:

- `poolRepository.findById(poolId)` - Get pool data
- `betRepository.findUsersBetsByPoolId(poolId)` - Get all bets for a pool
- `getPopulatePoolChallenges(pool, active)` - Get challenges for a pool (from poolUtils)
- `PoolParticipant.findAll()` - Get pool participants

---

## Notes

- All notifications extend `BaseInsight` for consistency with the engagement system
- Notifications support cooldown periods to avoid spamming
- Time filters help target messages more precisely
- Game factors are used to identify "main" games that should be highlighted
- Hebrew is the primary language for messages




