#!/usr/bin/env node

/**
 * Test script for Coralogix billing and quota functionality
 */

import { MCPServerTestHelper } from './tests/helpers/mcp-server.js';

// Set environment variables with the provided credentials
process.env.CORALOGIX_API_KEY = 'cxup_R10n62zZqlRVy8gcEZUlnY8qIC8Vvx';
process.env.CORALOGIX_DOMAIN = 'eu2.coralogix.com';

async function testBillingFunctionality() {
  console.log('🚀 Testing Coralogix Billing and Quota Functionality');
  console.log('=' * 60);

  const server = new MCPServerTestHelper();
  
  try {
    console.log('📡 Starting MCP server...');
    await server.start();

    console.log('\n📊 Testing Data Usage Tool...');
    console.log('-'.repeat(40));
    
    // Test data usage for last 7 days
    const usageResult = await server.callTool('get_data_usage', {
      days: 7,
      resolution: '1d'
    });

    if (usageResult.isError) {
      console.error('❌ Data Usage Error:', usageResult.content[0].text);
    } else {
      console.log('✅ Data Usage Result:');
      console.log(usageResult.content[0].text);
    }

    console.log('\n💰 Testing Current Quota Tool...');
    console.log('-'.repeat(40));
    
    // Test current quota
    const quotaResult = await server.callTool('get_current_quota', {});

    if (quotaResult.isError) {
      console.error('❌ Quota Error:', quotaResult.content[0].text);
    } else {
      console.log('✅ Quota Result:');
      console.log(quotaResult.content[0].text);
    }

    console.log('\n📈 Testing Data Usage with Custom Date Range...');
    console.log('-'.repeat(40));
    
    // Test with custom date range (last 3 days)
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    
    const customRangeResult = await server.callTool('get_data_usage', {
      fromDate: startDate,
      toDate: endDate,
      resolution: '6h'
    });

    if (customRangeResult.isError) {
      console.error('❌ Custom Range Error:', customRangeResult.content[0].text);
    } else {
      console.log('✅ Custom Range Result:');
      console.log(customRangeResult.content[0].text);
    }

  } catch (error) {
    console.error('💥 Test Error:', error.message);
  } finally {
    console.log('\n🛑 Stopping server...');
    await server.stop();
    console.log('✅ Test completed!');
  }
}

testBillingFunctionality().catch(console.error); 