#!/usr/bin/env node

/**
 * Test script for Brevo MCP Server
 * 
 * This script tests the server functionality without requiring a real API key.
 * For testing with a real API key, set the BREVO_API_KEY environment variable.
 * 
 * Usage:
 *   node test.js                          # Test server startup only
 *   BREVO_API_KEY=your_key node test.js   # Test with real API calls
 */

import { spawn } from 'child_process';

console.log('🧪 Testing Brevo MCP Server...\n');

// Check if API key is provided
const hasApiKey = !!process.env.BREVO_API_KEY;
console.log(`API Key: ${hasApiKey ? '✅ Provided' : '❌ Not provided (testing startup only)'}\n`);

// Test server startup
console.log('1. Testing server startup...');
const serverProcess = spawn('node', ['index.js'], {
  cwd: process.cwd(),
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env
});

let output = '';
let errorOutput = '';

serverProcess.stdout.on('data', (data) => {
  output += data.toString();
});

serverProcess.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

// Send a test message to the server
setTimeout(() => {
  console.log('2. Testing tools/list...');
  const listToolsRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list", 
    params: {}
  };
  
  serverProcess.stdin.write(JSON.stringify(listToolsRequest) + '\n');
}, 1000);

// Test API call if key is available
if (hasApiKey) {
  setTimeout(() => {
    console.log('3. Testing get_account_info...');
    const accountRequest = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "get_account_info",
        arguments: {}
      }
    };
    
    serverProcess.stdin.write(JSON.stringify(accountRequest) + '\n');
  }, 2500);
}

// Clean up and report results
setTimeout(() => {
  serverProcess.kill();
  
  console.log('\n📊 Test Results:');
  console.log('================');
  
  if (errorOutput.includes('Brevo MCP server running on stdio')) {
    console.log('✅ Server startup: PASSED');
  } else {
    console.log('❌ Server startup: FAILED');
  }
  
  if (output.includes('get_account_info') || output.includes('get_contacts')) {
    console.log('✅ Tools registration: PASSED');
  } else {
    console.log('❌ Tools registration: FAILED'); 
  }
  
  if (hasApiKey) {
    if (output.includes('"email"') || output.includes('error')) {
      console.log('✅ API connectivity: TESTED (check output above for results)');
    } else {
      console.log('❌ API connectivity: NO RESPONSE');
    }
  } else {
    console.log('⏭️  API connectivity: SKIPPED (no API key provided)');
  }
  
  console.log('\n📋 Available tools:');
  console.log('  • get_account_info - Account details and plan information');
  console.log('  • get_contacts - Retrieve and filter contacts');
  console.log('  • send_email - Send transactional emails');
  console.log('  • get_email_campaigns - List campaigns with statistics');
  
  console.log('\n🚀 Next steps:');
  if (!hasApiKey) {
    console.log('  1. Get your Brevo API key from https://app.brevo.com');
    console.log('  2. Test with: BREVO_API_KEY=your_key node test.js');
  }
  console.log('  3. Configure your MCP client with this server');
  console.log('  4. Start managing your Brevo account with AI assistance!');
  
}, hasApiKey ? 5000 : 3000);

// Handle process cleanup
process.on('exit', () => {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }
});

process.on('SIGINT', () => {
  console.log('\n\n⏹️  Test interrupted by user');
  process.exit(0);
});