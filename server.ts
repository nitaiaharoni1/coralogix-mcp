#!/usr/bin/env node

/**
 * Coralogix MCP Server v2.0.0 - Comprehensive Observability Platform Integration
 * 
 * 🚀 55+ Professional MCP Tools covering all Coralogix APIs:
 * 
 * 📊 Query & Analytics (9 tools):
 * - DataPrime & Lucene queries with archive support
 * - Background queries for large datasets
 * - Query validation and intelligent suggestions
 * 
 * 🚨 Alert Management (10 tools):
 * - Complete alert definitions API (13 alert types)
 * - Advanced filtering, bulk operations, alert events
 * - Sophisticated threshold, anomaly, and flow alerts
 * 
 * 🛠️ Parsing Rules (8 tools):
 * - Complete parsing rules API (9 rule types)
 * - Rule groups with AND/OR logic
 * - Export/import between teams
 * 
 * 📈 Additional APIs:
 * - Dashboard management, Events2Metrics, Enrichments
 * - Rule Groups, Target management
 * - Enterprise features: pagination, bulk operations
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';
import { tools, handleTool } from './src/tools/index.js';

// Load environment variables
dotenv.config();

// Create server instance
const server = new Server(
  {
    name: 'coralogix-mcp',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register list tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: tools,
  };
});

// Register call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const result = await handleTool(request);
    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Main function
async function main() {
  // Validate environment variables
  const requiredEnvVars = ['CORALOGIX_API_KEY', 'CORALOGIX_DOMAIN'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ ERROR: Missing required environment variables:', missingVars.join(', '));
    console.error('Please set CORALOGIX_API_KEY and CORALOGIX_DOMAIN');
    console.error('\nExample:');
    console.error('export CORALOGIX_API_KEY="your-api-key"');
    console.error('export CORALOGIX_DOMAIN="eu2.coralogix.com"');
    process.exit(1);
  }

  // Log successful startup
  console.error(`🚀 Coralogix MCP Server v2.0.0 starting...`);
  console.error(`📊 Loaded ${tools.length} tools`);
  console.error(`🔑 API Key: ${process.env.CORALOGIX_API_KEY ? '✅ Present' : '❌ Missing'}`);
  console.error(`🌐 Domain: ${process.env.CORALOGIX_DOMAIN}`);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('✅ Coralogix MCP Server v2.0.0 running on stdio');
  console.error(`🛠️ Available tool categories:`);
  console.error(`   📊 Query & Analytics: DataPrime, Lucene, Background queries`);
  console.error(`   🚨 Alert Management: Definitions, Events, Bulk operations`);
  console.error(`   🛠️ Parsing Rules: Rule groups, Export/import`);
  console.error(`   📈 Additional: Dashboards, Enrichments, Events2Metrics`);
}

// Start the server
main().catch((error) => {
  console.error('💥 Fatal error in main():', error);
  process.exit(1);
});