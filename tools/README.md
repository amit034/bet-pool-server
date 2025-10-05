# AI Tools for Betting Pool Analytics

This directory contains LangChain-compatible AI tools for analyzing betting pool data, providing insights about user performance, rankings, recoveries, and statistics.

## 🎯 Overview

The AI tools system allows you to ask natural language questions about your betting pool data and get comprehensive analytical responses. Perfect for chatbot integration or direct analysis.

### Available Tools

1. **UserMetricsTool** - Analyzes individual and overall user performance
2. **RecoveryAnalysisTool** - Finds dramatic position changes and comeback stories  
3. **StatisticsTool** - Provides comprehensive statistical analysis
4. **RankingsTool** - Handles ranking analysis and leaderboards

## 🚀 Quick Start

```javascript
const { getAllTools, getTool } = require('./tools');
const ToolConfig = require('./tools/ToolConfig');

// Get top 5 performers
const userTool = getTool('userMetrics');
const result = await userTool._call({
    poolId: '123',
    limit: 5,
    question: "Who are the top performers?"
});

// Or use with validation and caching
const result = await ToolConfig.executeTool('userMetrics', {
    poolId: '123',
    limit: 5
});
```

## 🛠 Tool Details

### UserMetricsTool

**Purpose**: Analyzes user performance metrics including scores, rankings, and individual performance.

**Example Questions**:
- "Who has the highest score overall?"
- "Who has the highest score in round 3?"  
- "How is user 456 performing?"
- "What are the current rankings?"

**Input Parameters**:
```javascript
{
    poolId: "123",           // Required: Pool ID to analyze
    userId: "456",           // Optional: Specific user to focus on
    roundNumber: 3,          // Optional: Specific round to analyze  
    limit: 10,               // Optional: Number of results (default: 10)
    question: "Who is #1?"   // Optional: Question for context
}
```

**Output Example**:
```javascript
{
    "context": "Overall pool performance analysis",
    "data": {
        "overallLeaderboard": [
            {
                "position": 1,
                "userId": "123",
                "username": "john_doe",
                "totalScore": 85,
                "medals": {"1": 2, "2": 3, "3": 1},
                "trend": "improving"
            }
        ],
        "poolStatistics": {
            "totalParticipants": 15,
            "totalRounds": 5,
            "averageScore": 42.3
        }
    }
}
```

### RecoveryAnalysisTool

**Purpose**: Analyzes dramatic position changes and recovery patterns between rounds.

**Example Questions**:
- "Who made the biggest recovery?"
- "Who jumped from 19th place to 4th in a single round?"
- "What are the comeback stories?"
- "Who had the biggest fall in rankings?"

**Input Parameters**:
```javascript
{
    poolId: "123",              // Required: Pool ID to analyze
    minPositionJump: 3,         // Optional: Minimum position jump (default: 3)
    fromRound: 2,               // Optional: Starting round for analysis
    toRound: 5,                 // Optional: Ending round for analysis
    userId: "456",              // Optional: Specific user to analyze
    recoveryType: "positive",   // Optional: 'positive', 'negative', 'both'
    limit: 10                   // Optional: Number of results (default: 10)
}
```

**Output Example**:
```javascript
{
    "data": {
        "recoveryAnalysis": {
            "biggestRecoveries": [
                {
                    "username": "comeback_king",
                    "previousPosition": 19,
                    "currentPosition": 4,
                    "positionJump": 15,
                    "fromRound": 3,
                    "toRound": 4,
                    "scoreChange": 25
                }
            ],
            "comebackStories": [
                {
                    "username": "phoenix_player",
                    "lowestPosition": 20,
                    "finalPosition": 3,
                    "totalRecovery": 17,
                    "roundsToRecover": 3
                }
            ]
        }
    }
}
```

### StatisticsTool

**Purpose**: Provides comprehensive statistical analysis of betting pools.

**Example Questions**:
- "What are the general pool statistics?"
- "How are scores distributed?"
- "Which rounds were most competitive?"
- "What are the medal distributions?"

**Input Parameters**:
```javascript
{
    poolId: "123",                    // Required: Pool ID to analyze
    analysisType: "overview",         // Optional: 'overview', 'distribution', 'trends', 'rounds', 'medals'
    includeRounds: [1, 2, 3],        // Optional: Specific rounds to analyze
    excludeBots: false               // Optional: Exclude bots from analysis
}
```

### RankingsTool

**Purpose**: Provides detailed ranking analysis and leaderboard functionality.

**Example Questions**:
- "What are the current rankings?"
- "How have rankings changed over time?"
- "Who are the most consistent performers?"
- "What are the ranking trends?"

**Input Parameters**:
```javascript
{
    poolId: "123",                    // Required: Pool ID to analyze
    rankingType: "current",           // Optional: 'current', 'historical', 'stability', 'trends'
    limit: 10,                       // Optional: Number of positions to show
    excludeBots: false,              // Optional: Exclude bots
    roundRange: {from: 1, to: 5}     // Optional: Round range for historical analysis
}
```

## 🔧 Configuration

The `ToolConfig` class provides centralized configuration, validation, and caching:

```javascript
const ToolConfig = require('./tools/ToolConfig');

// Get tool descriptions
const descriptions = ToolConfig.getToolDescriptions();

// Execute with validation and caching
const result = await ToolConfig.executeTool('userMetrics', {
    poolId: '123',
    limit: 5
});

// Update configuration
ToolConfig.updateToolConfig('userMetrics', {
    maxLimit: 25,
    defaultRounds: 5
});
```

## 📚 Integration Examples

### Basic Usage
```javascript
const examples = require('./tools/examples/basicUsage');

// Get top performers
await examples.getTopPerformers('123');

// Find biggest recoveries  
await examples.findBiggestRecoveries('123');

// Run comprehensive analysis
await examples.comprehensiveAnalysis('123');
```

### Chatbot Integration
```javascript
const { getAllTools } = require('./tools');

// For LangChain agent
const tools = getAllTools();
const agent = createAgent(llm, tools);

// Ask natural language questions
const response = await agent.invoke({
    input: "Who has the highest score in pool 123?"
});
```

### Express.js Route Integration
```javascript
app.post('/api/pools/:poolId/insights', async (req, res) => {
    const { poolId } = req.params;
    const { question, tool, params } = req.body;
    
    try {
        let result;
        if (tool) {
            // Direct tool usage
            result = await ToolConfig.executeTool(tool, {
                poolId,
                ...params
            });
        } else {
            // AI-powered question answering
            result = await aiAgent.invoke({
                input: `${question} for pool ${poolId}`
            });
        }
        
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});
```

## 🎨 Best Practices

### 1. Tool Selection
- **UserMetricsTool**: For individual performance and rankings
- **RecoveryAnalysisTool**: For position changes and comebacks
- **StatisticsTool**: For general insights and distributions  
- **RankingsTool**: For leaderboards and ranking stability

### 2. Performance Optimization
- Use caching for repeated queries
- Set appropriate limits to avoid large responses
- Filter out bots when analyzing human performance
- Use specific round ranges for historical analysis

### 3. Error Handling
```javascript
try {
    const result = await ToolConfig.executeTool('userMetrics', params);
    const data = JSON.parse(result);
    // Process data
} catch (error) {
    if (error.message.includes('Validation errors')) {
        // Handle validation errors
    } else if (error.message.includes('not found')) {
        // Handle not found errors
    } else {
        // Handle other errors
    }
}
```

### 4. Question Types Each Tool Handles Best

**UserMetricsTool**:
- "Who has the highest score?"
- "How is [username] performing?"
- "What are the top 5 players?"
- "Who scored best in round X?"

**RecoveryAnalysisTool**:
- "Who made the biggest comeback?"
- "Who jumped the most positions?"
- "What are the recovery stories?"
- "Who fell the most in rankings?"

**StatisticsTool**:
- "What are the pool statistics?"
- "How competitive is this pool?"
- "What's the score distribution?"
- "Which round was hardest?"

**RankingsTool**:
- "Show me the leaderboard"
- "How have rankings changed?"
- "Who's most consistent?"
- "What are the ranking trends?"

## 🔍 Troubleshooting

### Common Issues

1. **"poolId is required" error**
   - Always provide poolId in your input parameters

2. **"Tool not found" error**  
   - Check tool name spelling: 'userMetrics', 'recoveryAnalysis', 'statistics', 'rankings'

3. **"Validation errors" error**
   - Check parameter limits and types
   - Use ToolConfig.validateInput() to check before execution

4. **Empty results**
   - Verify pool exists and has data
   - Check if participants have completed rounds
   - Ensure round numbers are valid

5. **Performance issues**
   - Enable caching in ToolConfig
   - Reduce limit parameters
   - Use specific round ranges instead of full history

## 📝 Contributing

To add new tools:

1. Extend `BaseAnalyticsTool`
2. Implement required methods
3. Add to tool registry in `index.js`
4. Update configuration in `ToolConfig.js`
5. Add examples and documentation

## 🎯 Use Cases

- **Chatbots**: Answer user questions about pool performance
- **Analytics Dashboards**: Generate insights and reports
- **API Endpoints**: Provide structured data for frontend apps
- **Automated Reports**: Generate periodic performance summaries
- **Admin Tools**: Help pool administrators understand their pools
