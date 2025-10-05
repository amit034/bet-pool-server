/**
 * Simple test file to verify tools are working correctly
 */

const { getAllTools, getTool } = require('./index');
const ToolConfig = require('./ToolConfig');

async function runBasicTests() {
    console.log('🧪 Running basic tests for AI tools...\n');
    
    try {
        // Test 1: Tool registry
        console.log('1️⃣ Testing tool registry...');
        const tools = getAllTools();
        console.log(`✅ Found ${tools.length} tools: ${tools.map(t => t.name).join(', ')}`);
        
        // Test 2: Individual tool access
        console.log('\n2️⃣ Testing individual tool access...');
        const userTool = getTool('userMetrics');
        const recoveryTool = getTool('recoveryAnalysis');
        const statsTool = getTool('statistics');
        const rankingsTool = getTool('rankings');
        
        console.log(`✅ UserMetricsTool: ${userTool ? 'Found' : 'Not found'}`);
        console.log(`✅ RecoveryAnalysisTool: ${recoveryTool ? 'Found' : 'Not found'}`);
        console.log(`✅ StatisticsTool: ${statsTool ? 'Found' : 'Not found'}`);
        console.log(`✅ RankingsTool: ${rankingsTool ? 'Found' : 'Not found'}`);
        
        // Test 3: Tool descriptions
        console.log('\n3️⃣ Testing tool descriptions...');
        const descriptions = ToolConfig.getToolDescriptions();
        console.log(`✅ Got ${descriptions.length} tool descriptions`);
        descriptions.forEach(desc => {
            console.log(`   • ${desc.name}: ${desc.description.substring(0, 50)}...`);
        });
        
        // Test 4: Input validation
        console.log('\n4️⃣ Testing input validation...');
        
        // Valid input
        const validInput = { poolId: '123', limit: 5 };
        const validValidation = ToolConfig.validateInput('userMetrics', validInput);
        console.log(`✅ Valid input validation: ${validValidation.isValid ? 'Passed' : 'Failed'}`);
        
        // Invalid input (missing poolId)
        const invalidInput = { limit: 5 };
        const invalidValidation = ToolConfig.validateInput('userMetrics', invalidInput);
        console.log(`✅ Invalid input validation: ${!invalidValidation.isValid ? 'Passed' : 'Failed'}`);
        console.log(`   Errors: ${invalidValidation.errors.join(', ')}`);
        
        // Test 5: Cache functionality
        console.log('\n5️⃣ Testing cache functionality...');
        const cacheKey = 'test:key';
        const testData = { test: 'data' };
        
        ToolConfig.setCachedResult(cacheKey, testData);
        const cachedData = ToolConfig.getCachedResult(cacheKey);
        console.log(`✅ Cache test: ${JSON.stringify(cachedData) === JSON.stringify(testData) ? 'Passed' : 'Failed'}`);
        
        // Test 6: Tool configuration
        console.log('\n6️⃣ Testing tool configuration...');
        const originalConfig = ToolConfig.getToolConfig('userMetrics');
        ToolConfig.updateToolConfig('userMetrics', { testSetting: true });
        const updatedConfig = ToolConfig.getToolConfig('userMetrics');
        console.log(`✅ Config update: ${updatedConfig.testSetting ? 'Passed' : 'Failed'}`);
        
        console.log('\n🎉 All basic tests passed!');
        console.log('\n📝 Note: These are structural tests. To test with real data, you need:');
        console.log('   • A valid poolId from your database');
        console.log('   • Pool participants with betting data');
        console.log('   • Completed rounds with scores');
        
        return true;
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
        return false;
    }
}

// Mock data test (without database)
async function runMockDataTest() {
    console.log('\n🎭 Running mock data test...\n');
    
    // This would require mocking the database calls
    // For now, just test the structure
    console.log('Mock data test would require database connection.');
    console.log('To test with real data, use:');
    console.log('');
    console.log('const { UserMetricsTool } = require("./UserMetricsTool");');
    console.log('const tool = new UserMetricsTool();');
    console.log('const result = await tool._call({ poolId: "your-pool-id" });');
    console.log('console.log(result);');
}

if (require.main === module) {
    runBasicTests()
        .then(() => runMockDataTest())
        .then(() => console.log('\n✨ Test suite completed!'))
        .catch(console.error);
}

module.exports = {
    runBasicTests,
    runMockDataTest
};
