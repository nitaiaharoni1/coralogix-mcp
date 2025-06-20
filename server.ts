#!/usr/bin/env node

/**
 * Coralogix MCP Server
 * Main entry point for the MCP server with Coralogix API integration
 * 
 * ALL APIs working in EU2 region (tested and confirmed):
 * - Query APIs (DataPrime, Lucene, Background queries) ✅
 * - Alert Definitions (create, read, update, delete alerts) ✅
 * - Dashboard Catalog (list, create, manage dashboards) ✅
 * - Target Management (S3 storage configuration) ✅
 * - Rule Groups (parsing rules for log processing) ✅
 * - Events2Metrics (convert logs/spans to metrics) ✅
 * - Enrichments (GeoIP, suspicious IP, AWS, custom enrichments) ✅
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ListPromptsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import { tools, handleTool } from './src/tools/index.js';
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
    resources: {},
    prompts: {},
  },
});

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: tools };
});

// Handle list resources request (required by MCP protocol)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return { resources: [] };
});

// Handle list prompts request (required by MCP protocol)
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return { prompts: [] };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const result = await handleTool(request);
    
    // Return the result directly - handleTool already returns the correct format
    // If result is a string, wrap it; if it's already an object, return as-is
    if (typeof result === 'string') {
      return {
        content: [{ type: 'text', text: result }],
        isError: false
      };
    } else {
      // Result is already a properly formatted response object
      return {
        content: [{ type: 'text', text: JSON.stringify(result) }],
        isError: false
      };
    }
  } catch (error: any) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true
    };
  }
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
    console.log(`\nCoralogix MCP Server v${SERVER_CONFIG.version}\n\nA Model Context Protocol server for Coralogix APIs.\n\nSETUP:\n  1. Get Coralogix API key from your Coralogix account\n  2. Set environment variables:\n     CORALOGIX_API_KEY=your_api_key\n     CORALOGIX_DOMAIN=your_domain (e.g., eu2.coralogix.com, coralogix.com)\n  3. Install dependencies: npm install\n  4. Build the server: npm run build\n  5. Configure in Claude Desktop or your MCP client\n\nAVAILABLE TOOLS (All Working in EU2):\n\n  📊 DATA QUERY APIs (for viewing ACTUAL log/trace/metric data):\n  - query_dataprime        - Search ACTUAL LOG DATA with DataPrime syntax (use for \"show me logs\", \"error logs\", etc.)\n  - query_lucene          - Search ACTUAL LOG DATA with Lucene syntax (use for simple log searches)\n  - submit_background_query - Submit long-running queries (for large datasets)\n  - get_background_query_status - Check background query status\n  - get_background_query_data - Get results from completed background query\n  - cancel_background_query - Cancel running background query\n\n  🚨 ALERT MANAGEMENT:\n  - list_alert_definitions - List all alert definitions\n  - get_alert_definition  - Get specific alert by ID\n  - create_alert_definition - Create new alert\n  - update_alert_definition - Update existing alert\n  - delete_alert_definition - Delete alert\n  - set_alert_active      - Enable/disable alert\n\n  📋 DASHBOARD MANAGEMENT:\n  - get_dashboard_catalog - List all dashboards\n  - get_dashboard        - Get specific dashboard\n  - create_dashboard     - Create new dashboard\n  - update_dashboard     - Update existing dashboard\n  - delete_dashboard     - Delete dashboard\n\n  🎯 TARGET MANAGEMENT (S3 storage):\n  - get_target          - Get current S3 target configuration\n  - set_target          - Configure S3 target for log archiving\n  - validate_target     - Validate S3 target configuration\n\n  📝 RULE GROUPS (Log parsing and processing):\n  - list_rule_groups    - List all parsing rule groups\n  - get_rule_group      - Get specific rule group details\n  - get_rule_group_limits - Get rule group usage limits\n\n  📈 EVENTS2METRICS (Convert logs/spans to metrics):\n  - list_events2metrics - List all E2M configurations\n  - get_events2metrics  - Get specific E2M configuration\n  - get_e2m_limits      - Get E2M usage limits\n  - get_e2m_cardinality - Get cardinality estimates\n\n  🔍 ENRICHMENTS (Data enhancement):\n  - list_enrichments    - List all enrichment rules\n  - get_enrichment_limits - Get enrichment usage limits\n  - get_enrichment_settings - Get enrichment configuration\n  - list_custom_enrichments - List custom enrichment files\n  - get_custom_enrichment - Get specific custom enrichment\n\nEXAMPLE QUERIES:\n  \"Show me error logs from the last hour\"\n  \"List all active alerts\"\n  \"Get dashboard catalog\"\n  \"Show rule groups for log parsing\"\n  \"List events2metrics configurations\"\n  \"Show enrichment settings\"\n\n`);
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