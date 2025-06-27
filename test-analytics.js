#!/usr/bin/env node

// Simple test for enhanced analytics functions
import fs from 'fs';

console.log('🧪 Testing Enhanced Brevo MCP Server with Analytics...\n');

try {
  const content = fs.readFileSync('./index.js', 'utf8');
  
  // Check for analytics functions
  const analyticsFunctions = [
    'get_campaign_analytics',
    'get_campaigns_performance', 
    'get_contact_analytics',
    'get_analytics_summary',
    'get_campaign_recipients'
  ];
  
  let foundFunctions = 0;
  analyticsFunctions.forEach(func => {
    if (content.includes(`name: "${func}"`)) {
      console.log(`✅ ${func} - Found in tool registration`);
      foundFunctions++;
    } else {
      console.log(`❌ ${func} - Missing from tool registration`);
    }
  });
  
  console.log(`\n📊 Analytics Functions: ${foundFunctions}/5 registered`);
  
  // Check for method implementations
  console.log('\n🔧 Method Implementations:');
  analyticsFunctions.forEach(func => {
    const methodName = func.split('_').map((word, i) => 
      i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');
    
    if (content.includes(`async ${methodName}(`)) {
      console.log(`✅ ${methodName} - Implementation found`);
    } else {
      console.log(`❌ ${methodName} - Implementation missing`);
    }
  });
  
  // Check version
  if (content.includes('version: "2.0.0"')) {
    console.log('\n✅ Version updated to 2.0.0');
  } else {
    console.log('\n❌ Version not updated');
  }
  
  // Check helper functions
  const helpers = ['calculateRates', 'calculatePercentageChange', 'getDateRange', 'generateInsights'];
  console.log('\n🛠️ Helper Functions:');
  helpers.forEach(helper => {
    if (content.includes(`${helper}(`)) {
      console.log(`✅ ${helper} - Found`);
    } else {
      console.log(`❌ ${helper} - Missing`);
    }
  });
  
  if (foundFunctions === 5) {
    console.log('\n🎉 Enhanced Brevo MCP server is ready!');
    console.log('📝 Next steps:');
    console.log('  1. Restart Claude Desktop to load new functions');
    console.log('  2. Test with: "Show me analytics for campaign #108"');
    console.log('  3. Try: "Summarise my email performance this month"');
  } else {
    console.log('\n⚠️ Some analytics functions are missing. Check the implementation.');
  }
  
} catch (error) {
  console.log('❌ Error reading server file:', error.message);
}
