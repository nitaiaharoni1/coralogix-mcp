#!/usr/bin/env node

/**
 * Coralogix MCP Server
 * Main entry point for the MCP server with Coralogix API integration
 * 
 * Working APIs in EU2 region:
 * - Query APIs (DataPrime, Lucene, Background queries)
 * - Alert Definitions
 * - Dashboard Catalog
 * - Target Management
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

  📊 Data Query APIs:
  - query_dataprime        - Run DataPrime queries on logs, metrics, and traces
  - query_lucene          - Run Lucene queries on indexed logs
  - submit_background_query - Submit long-running background queries
  - get_background_query_status - Check status of background queries
  - get_background_query_data - Retrieve results from background queries
  - cancel_background_query - Cancel running background queries

  🚨 Alert Management:
  - list_alert_definitions - List all alert definitions
  - get_alert_definition  - Get specific alert definition
  - create_alert_definition - Create new alert definition
  - update_alert_definition - Update existing alert definition
  - delete_alert_definition - Delete alert definition
  - set_alert_active      - Enable/disable alert definition

  📈 Dashboard Management:
  - get_dashboard_catalog - List all dashboards
  - get_dashboard        - Get specific dashboard
  - create_dashboard     - Create new dashboard
  - update_dashboard     - Update existing dashboard
  - delete_dashboard     - Delete dashboard

  🎯 Target Configuration:
  - get_target           - Get current S3 target configuration
  - set_target           - Configure S3 target for archiving
  - validate_target      - Validate S3 target configuration

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