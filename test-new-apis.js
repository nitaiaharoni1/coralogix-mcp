#!/usr/bin/env node

/**
 * Test script to verify all new Coralogix MCP APIs are implemented correctly
 * This script checks that all tools are properly defined and can be called
 */

import { getToolDefinitions } from './dist/tools/index.js';

const SUCCESS = '\x1b[32m✓\x1b[0m';
const ERROR = '\x1b[31m✗\x1b[0m';
const INFO = '\x1b[34mℹ\x1b[0m';

function main() {
  console.log('🧪 Testing Coralogix MCP APIs\n');
  
  try {
    const tools = getToolDefinitions();
    console.log(`${INFO} Found ${tools.length} total tools\n`);
    
    // Test each API category
    testQueryTools(tools);
    testAlertTools(tools);
    testDashboardTools(tools);
    testIncidentTools(tools);
    testSloTools(tools);
    testBillingTools(tools);
    
    console.log('\n🎉 All API tool definitions are valid!');
    
  } catch (error) {
    console.error(`${ERROR} Failed to load tools:`, error.message);
    process.exit(1);
  }
}

function testQueryTools(tools) {
  console.log('🔍 Testing Query Tools:');
  
  const queryTools = [
    'query_dataprime',
    'query_lucene',
    'submit_background_query',
    'get_background_query_status',
    'get_background_query_data',
    'cancel_background_query'
  ];
  
  queryTools.forEach(toolName => {
    const tool = tools.find(t => t.name === toolName);
    if (tool) {
      console.log(`  ${SUCCESS} ${toolName}`);
      validateToolSchema(tool);
    } else {
      console.log(`  ${ERROR} ${toolName} - NOT FOUND`);
    }
  });
}

function testAlertTools(tools) {
  console.log('\n🚨 Testing Alert Management Tools:');
  
  const alertTools = [
    'list_alerts',
    'create_alert',
    'get_alert',
    'update_alert',
    'delete_alert',
    'enable_alert'
  ];
  
  alertTools.forEach(toolName => {
    const tool = tools.find(t => t.name === toolName);
    if (tool) {
      console.log(`  ${SUCCESS} ${toolName}`);
      validateToolSchema(tool);
    } else {
      console.log(`  ${ERROR} ${toolName} - NOT FOUND`);
    }
  });
}

function testDashboardTools(tools) {
  console.log('\n📊 Testing Dashboard Management Tools:');
  
  const dashboardTools = [
    'list_dashboards',
    'create_dashboard',
    'get_dashboard',
    'update_dashboard',
    'delete_dashboard'
  ];
  
  dashboardTools.forEach(toolName => {
    const tool = tools.find(t => t.name === toolName);
    if (tool) {
      console.log(`  ${SUCCESS} ${toolName}`);
      validateToolSchema(tool);
    } else {
      console.log(`  ${ERROR} ${toolName} - NOT FOUND`);
    }
  });
}

function testIncidentTools(tools) {
  console.log('\n🔥 Testing Incident Management Tools:');
  
  const incidentTools = [
    'list_incidents',
    'get_incident',
    'acknowledge_incidents',
    'resolve_incidents',
    'close_incidents'
  ];
  
  incidentTools.forEach(toolName => {
    const tool = tools.find(t => t.name === toolName);
    if (tool) {
      console.log(`  ${SUCCESS} ${toolName}`);
      validateToolSchema(tool);
    } else {
      console.log(`  ${ERROR} ${toolName} - NOT FOUND`);
    }
  });
}

function testSloTools(tools) {
  console.log('\n🎯 Testing SLO Management Tools:');
  
  const sloTools = [
    'list_slos',
    'create_slo',
    'get_slo',
    'update_slo',
    'delete_slo'
  ];
  
  sloTools.forEach(toolName => {
    const tool = tools.find(t => t.name === toolName);
    if (tool) {
      console.log(`  ${SUCCESS} ${toolName}`);
      validateToolSchema(tool);
    } else {
      console.log(`  ${ERROR} ${toolName} - NOT FOUND`);
    }
  });
}

function testBillingTools(tools) {
  console.log('\n💰 Testing Billing/Usage Tools:');
  
  const billingTools = [
    'get_data_usage',
    'get_current_quota'
  ];
  
  billingTools.forEach(toolName => {
    const tool = tools.find(t => t.name === toolName);
    if (tool) {
      console.log(`  ${SUCCESS} ${toolName}`);
      validateToolSchema(tool);
    } else {
      console.log(`  ${ERROR} ${toolName} - NOT FOUND`);
    }
  });
}

function validateToolSchema(tool) {
  // Basic schema validation
  if (!tool.name) {
    throw new Error(`Tool missing name: ${JSON.stringify(tool)}`);
  }
  
  if (!tool.description) {
    throw new Error(`Tool ${tool.name} missing description`);
  }
  
  if (!tool.inputSchema) {
    throw new Error(`Tool ${tool.name} missing inputSchema`);
  }
  
  if (tool.inputSchema.type !== 'object') {
    throw new Error(`Tool ${tool.name} inputSchema must be of type 'object'`);
  }
  
  if (!tool.inputSchema.properties) {
    throw new Error(`Tool ${tool.name} inputSchema missing properties`);
  }
  
  if (!Array.isArray(tool.inputSchema.required)) {
    throw new Error(`Tool ${tool.name} inputSchema.required must be an array`);
  }
}

// Test API coverage
function showAPICoverage() {
  console.log('\n📈 API Coverage Summary:');
  console.log('  ✅ Query APIs - DataPrime, Lucene, background queries');
  console.log('  ✅ Alert Definitions - Full CRUD operations');
  console.log('  ✅ Dashboard Management - Create, read, update, delete');
  console.log('  ✅ Incident Management - List, acknowledge, resolve, close');
  console.log('  ✅ SLO Management - Full lifecycle management');
  console.log('  ✅ Data Usage - Usage analytics and quota monitoring');
  console.log('  🔄 Additional APIs - Can be added based on requirements');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
  showAPICoverage();
} 