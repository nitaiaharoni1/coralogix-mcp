#!/usr/bin/env node

/**
 * Coralogix MCP Server
 * Main entry point for the MCP server with Coralogix API integration
 * 
 * Working APIs in EU2 region:
 * - Query APIs (DataPrime, Lucene, Background queries)
 * - Alert Definitions (create, read, update, delete alerts)
 * - Dashboard Catalog (list, create, manage dashboards)
 * - Target Management (S3 storage configuration)
 * - Events2Metrics (convert logs/spans to metrics for cost optimization)
 * - Rule Groups (manage parsing rules for log processing)
 * - Enrichments (GeoIP, suspicious IP, AWS, custom enrichments)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { getToolDefinitions, handleToolCall } from './src/tools/index.js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

// Server configuration
const SERVER_CONFIG = {
  name: 'coralogix-mcp',
  version: '1.0.0',
};

// Initialize MCP server
const server = new Server({
  name: SERVER_CONFIG.name,
  version: SERVER_CONFIG.version,
}, {
  capabilities: {
    tools: {},
  },
});

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: getToolDefinitions() };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const result = await handleToolCall(request);
  
  // Ensure we return the correct MCP SDK format
  return {
    content: result.content,
    isError: result.isError || false
  };
});

// Main server function
async function main(): Promise<void> {
  try {
    // Validate required environment variables
    const requiredEnvVars = ['CORALOGIX_API_KEY', 'CORALOGIX_DOMAIN'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('ERROR: Missing required environment variables:', missingVars.join(', '));
      console.error('       Please set up your Coralogix API credentials:');
      console.error('       CORALOGIX_API_KEY: Your Coralogix API key');
      console.error('       CORALOGIX_DOMAIN: Your Coralogix domain (e.g., eu2.coralogix.com, coralogix.com)');
      console.error('       Get API key from: https://coralogix.com/docs/api-keys/');
      process.exit(1);
    }

    console.error('INFO: Environment variables validated');
    console.error(`INFO: Using Coralogix domain: ${process.env.CORALOGIX_DOMAIN}`);

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('INFO: Coralogix MCP Server started successfully');
    console.error('INFO: Available tools: DataPrime queries, Lucene queries, Alert management, Dashboard catalog, Target configuration');
  } catch (error) {
    console.error('ERROR: Server startup failed:', (error as Error).message);
    process.exit(1);
  }
}

// Check if this is the main module (ES module equivalent of require.main === module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isMainModule = process.argv[1] === __filename;

// Handle CLI commands or start server
if (isMainModule) {
  const args = process.argv.slice(2);
  
  // Handle help command
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Coralogix MCP Server v${SERVER_CONFIG.version}

A Model Context Protocol server for Coralogix APIs.

SETUP:
  1. Get Coralogix API key from your Coralogix account
  2. Set environment variables:
     CORALOGIX_API_KEY=your_api_key
     CORALOGIX_DOMAIN=your_domain (e.g., eu2.coralogix.com, coralogix.com)
  3. Install dependencies: npm install
  4. Build the server: npm run build
  5. Configure in Claude Desktop or your MCP client

AVAILABLE TOOLS:

  📊 DATA QUERY APIs (for viewing ACTUAL log/trace/metric data):
  - query_dataprime        - Search ACTUAL LOG DATA with DataPrime syntax (use for "show me logs", "error logs", etc.)
  - query_lucene          - Search ACTUAL LOG DATA with Lucene syntax (use for simple log searches)
  - submit_background_query - Submit long-running queries for large datasets
  - get_background_query_status - Check status of background queries
  - get_background_query_data - Retrieve results from background queries
  - cancel_background_query - Cancel running background queries

  🚨 Alert Management (CONFIGURATION ONLY - not actual logs):
  - list_alert_definitions - List all alert RULES/CONFIGURATION (not actual triggered alerts)
  - get_alert_definition  - Get specific alert RULE configuration
  - create_alert_definition - Create new alert RULE
  - update_alert_definition - Update existing alert RULE
  - delete_alert_definition - Delete alert RULE
  - set_alert_active      - Enable/disable alert RULE

  📈 Dashboard Management (CONFIGURATION ONLY):
  - get_dashboard_catalog - List all dashboard configurations
  - get_dashboard        - Get specific dashboard configuration
  - create_dashboard     - Create new dashboard
  - update_dashboard     - Update existing dashboard
  - delete_dashboard     - Delete dashboard

  🎯 Target Configuration (ARCHIVING SETUP):
  - get_target           - Get current S3 target configuration
  - set_target           - Configure S3 target for archiving
  - validate_target      - Validate S3 target configuration

  📊 Events2Metrics (E2M) Configuration:
  - list_events2metrics  - List all events2metrics configurations
  - get_events2metrics   - Get specific E2M configuration
  - get_events2metrics_limits - Get E2M limits and usage
  - get_events2metrics_cardinality - Get labels cardinality for planning

  📝 Rule Groups (PARSING CONFIGURATION):
  - list_rule_groups     - List all parsing rule groups
  - get_rule_group       - Get specific rule group
  - get_rule_group_limits - Get rule group limits and usage

  🔍 Enrichments (DATA ENHANCEMENT CONFIGURATION):
  - list_enrichments     - List all configured enrichments
  - get_enrichment_limits - Get enrichment limits and usage
  - get_enrichment_settings - Get enrichment settings
  - get_custom_enrichments - List custom enrichments (CSV-based)
  - create_custom_enrichment - Create new custom enrichment
  - update_custom_enrichment - Update custom enrichment
  - delete_custom_enrichment - Delete custom enrichment

USAGE:
  coralogix-mcp           - Start the MCP server
  coralogix-mcp --help    - Show this help message

NOTES:
  - This server includes only APIs confirmed to work in EU2 region
  - Data usage, incidents, SLOs, policies, and team permissions are not available in EU2
  - For other regions, additional APIs may be available

For more information, visit: https://coralogix.com/docs/
`);
    process.exit(0);
  }
  
  // Start the server
  main().catch((error) => {
    console.error('FATAL:', error);
    process.exit(1);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.error('INFO: Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('INFO: Received SIGTERM, shutting down gracefully...');
  process.exit(0);
}); 