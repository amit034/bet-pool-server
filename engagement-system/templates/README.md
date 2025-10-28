# Templates System

This folder contains the template system for the engagement system. Templates separate message structure from localized content, making it easy to support multiple languages.

## Structure

```
templates/
├── locales/              # Locale-specific text content
│   ├── he.js            # Hebrew text
│   ├── en.js            # English text
│   └── index.js         # Locale loader
├── BiggestJumpTemplate.js      # Round & pool biggest jump messages
├── WinningStreakTemplate.js    # Winning streak messages
├── WelcomeTemplate.js          # Welcome new users messages
├── UpcomingGamesTemplate.js    # Upcoming games notifications
├── ReminderTemplate.js         # Bet reminder notifications
├── TemplateHelper.js           # Template utilities
├── index.js                    # Main export
└── README.md                   # This file
```

## Core Concepts

### 1. Separation of Concerns
- **Templates** define the structure and logic of messages
- **Locales** contain the actual text in different languages
- **Helper** provides utilities for string interpolation and formatting

### 2. Locale Files
Located in `locales/`, these files contain all text strings:
- `he.js` - Hebrew text
- `en.js` - English text

Text uses placeholder syntax: `{placeholder}` for dynamic values.

Example:
```javascript
// In locale file
title: '{displayName} עושה גלים בסיבוב האחרון! 🚀'

// When used
TemplateHelper.interpolate(title, { displayName: 'John' })
// Result: 'John עושה גלים בסיבוב האחרון! 🚀'
```

### 3. Template Classes
Each template class has a `build()` method that:
1. Receives data object
2. Selects appropriate locale strings
3. Interpolates dynamic values
4. Combines sections into final message

## Usage

### Basic Usage

```javascript
const { BiggestJumpTemplate } = require('./templates');

const message = BiggestJumpTemplate.buildRound({
    username: 'john_doe',
    firstName: 'John',
    lastName: 'Doe',
    jump: 85,
    fromScore: 120,
    toScore: 205,
    roundId: 5
}, 'he'); // Hebrew locale

console.log(message);
```

### With Insights/Notifications

```javascript
const { WelcomeTemplate } = require('./templates');

class WelcomeUsersNotification extends BaseInsight {
    async buildMessage() {
        const newUsers = await this.getRecentNewUsers();
        
        return {
            type: 'welcome',
            content: WelcomeTemplate.build(newUsers, this.locale || 'he'),
            metadata: {
                source: 'Welcome Users Notification',
                newUserCount: newUsers.length
            }
        };
    }
}
```

## Templates Reference

### BiggestJumpTemplate

Handles both round and pool biggest jump messages.

**Methods:**
- `build(data, granularity, locale)` - Build message with specified granularity
- `buildRound(data, locale)` - Build round biggest jump message
- `buildPool(data, locale)` - Build pool biggest jump message

**Data Object:**
```javascript
{
    username: 'john_doe',
    firstName: 'John',
    lastName: 'Doe',
    jump: 85,              // Jump score
    fromScore: 120,        // Score before
    toScore: 205,          // Score after
    roundId: 5,            // Round number
    medals: { 1: 3, 2: 5, 3: 2 }  // Optional
}
```

**Granularities:**
- `'round'` - Round biggest jump (last round only)
- `'pool'` - Pool biggest jump (all-time best)

---

### WinningStreakTemplate

Handles winning streak messages.

**Methods:**
- `build(data, locale)` - Build winning streak message

**Data Object:**
```javascript
{
    username: 'john_doe',
    firstName: 'John',
    lastName: 'Doe',
    streakLength: 5        // Number of consecutive wins
}
```

---

### WelcomeTemplate

Handles welcome messages for new users.

**Methods:**
- `build(users, locale)` - Build welcome message

**Data Object:**
```javascript
[
    {
        username: 'john_doe',
        firstName: 'John',
        lastName: 'Doe',
        userId: 123
    },
    // ... more users
]
```

Automatically handles single vs multiple user welcomes.

---

### UpcomingGamesTemplate

Handles upcoming games notification messages.

**Methods:**
- `build(stats, timeFilter, gameList, locale)` - Build upcoming games message

**Parameters:**
```javascript
{
    stats: {
        totalGames: 10,
        betCount: 45,
        mainGamesList: [...]
    },
    timeFilter: 'all', // or 'day'
    gameList: 'formatted game list string',
    locale: 'he'
}
```

---

### ReminderTemplate

Handles bet reminder notification messages.

**Methods:**
- `build(stats, timeFilter, gameList, locale)` - Build reminder message

**Parameters:**
```javascript
{
    stats: {
        totalGames: 5,
        betCount: 23,
        mainGamesList: [...]
    },
    timeFilter: 'day', // or 'all'
    gameList: 'formatted game list string',
    locale: 'he'
}
```

---

## TemplateHelper

Utility class for working with templates.

### Methods

#### `interpolate(template, data)`
Replace `{placeholder}` with values from data object.

```javascript
TemplateHelper.interpolate('Hello {name}!', { name: 'John' })
// Returns: 'Hello John!'
```

#### `getText(locale, path)`
Get text from locale using dot notation path.

```javascript
TemplateHelper.getText('he', 'welcome.singleTitle')
// Returns: '🎉 ברוך הבא {displayName} לפול! 🎉'
```

#### `getInterpolatedText(locale, path, data)`
Get and interpolate text in one call.

```javascript
TemplateHelper.getInterpolatedText('he', 'welcome.singleTitle', { displayName: 'John' })
// Returns: '🎉 ברוך הבא John לפול! 🎉'
```

#### `selectEncouragement(value, thresholds)`
Select encouragement level based on value.

```javascript
TemplateHelper.selectEncouragement(85, { huge: 100, great: 50, good: 0 })
// Returns: 'great'
```

#### `formatNameList(names, locale)`
Format list of names with proper conjunction.

```javascript
TemplateHelper.formatNameList(['John', 'Jane', 'Bob'], 'en')
// Returns: 'John, Jane and Bob'
```

#### `buildMessage(sections)`
Combine message sections into final message.

```javascript
TemplateHelper.buildMessage(['Title', 'Body', 'Footer'])
// Returns: 'Title\n\nBody\n\nFooter'
```

---

## Adding New Templates

### 1. Add Locale Text

Edit `locales/he.js` and `locales/en.js`:

```javascript
// locales/he.js
module.exports = {
    // ... existing content
    myNewFeature: {
        title: 'כותרת {name}',
        body: 'תוכן ההודעה',
        footer: '_סיום_'
    }
};
```

### 2. Create Template Class

Create new file (e.g., `MyFeatureTemplate.js`):

```javascript
'use strict';

const TemplateHelper = require('./TemplateHelper');

class MyFeatureTemplate {
    static build(data, locale = 'he') {
        const sections = [];

        // Build message sections
        const title = TemplateHelper.getInterpolatedText(
            locale,
            'myNewFeature.title',
            { name: data.name }
        );
        sections.push(title);

        // Add more sections...

        return TemplateHelper.buildMessage(sections);
    }
}

module.exports = MyFeatureTemplate;
```

### 3. Export Template

Add to `index.js`:

```javascript
const MyFeatureTemplate = require('./MyFeatureTemplate');

module.exports = {
    // ... existing exports
    MyFeatureTemplate
};
```

### 4. Use in Insight/Notification

```javascript
const { MyFeatureTemplate } = require('../templates');

class MyInsight extends BaseInsight {
    async buildMessage() {
        return {
            type: 'insight',
            content: MyFeatureTemplate.build(data, this.locale)
        };
    }
}
```

---

## Adding New Locales

To add support for a new language (e.g., Arabic):

### 1. Create Locale File

Create `locales/ar.js`:

```javascript
'use strict';

module.exports = {
    roundBiggestJump: {
        title: '{displayName} يصنع الموجات! 🚀',
        // ... all other text
    },
    // ... all sections
};
```

### 2. Register Locale

Edit `locales/index.js`:

```javascript
const ar = require('./ar');

const locales = {
    he,
    en,
    ar  // Add new locale
};
```

### 3. Use New Locale

```javascript
const message = BiggestJumpTemplate.buildRound(data, 'ar');
```

---

## Best Practices

1. **Keep logic in templates** - Structure and conditional logic stays in template classes
2. **Keep text in locales** - All user-facing text goes in locale files
3. **Use placeholders** - Dynamic values use `{placeholder}` syntax
4. **Consistent naming** - Use clear, descriptive names for text keys
5. **Test both locales** - Ensure templates work with all supported languages
6. **Document data requirements** - Clearly specify what data each template needs

---

## Migration from Old System

Old system (single file):
```javascript
// templates.js
const templates = {
    he: {
        roundBiggestJump: {
            title: (displayName) => `${displayName} עושה גלים!`
        }
    }
};
```

New system (separated):
```javascript
// locales/he.js
module.exports = {
    roundBiggestJump: {
        title: '{displayName} עושה גלים!'
    }
};

// BiggestJumpTemplate.js
const title = TemplateHelper.getInterpolatedText('he', 'roundBiggestJump.title', { displayName });
```

Benefits:
- ✅ Easier to maintain separate concerns
- ✅ Simple to add new languages
- ✅ Better IDE support and autocomplete
- ✅ Consistent interpolation syntax
- ✅ Reusable helper utilities

---

## Testing Templates

```javascript
// Test template output
const { BiggestJumpTemplate } = require('./templates');

const testData = {
    username: 'test_user',
    firstName: 'Test',
    lastName: 'User',
    jump: 75,
    fromScore: 100,
    toScore: 175,
    roundId: 3
};

// Test Hebrew
console.log(BiggestJumpTemplate.buildRound(testData, 'he'));

// Test English
console.log(BiggestJumpTemplate.buildRound(testData, 'en'));
```

---

## Notes

- Default locale is Hebrew ('he')
- All templates support both Hebrew and English
- Emoji usage is consistent across locales
- Number formatting respects locale conventions
- Templates are stateless - safe to use anywhere




