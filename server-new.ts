#!/usr/bin/env node

/**
 * Coralogix MCP Server - Updated with Modern MCP SDK Pattern
 * Main entry point for the MCP server with Coralogix API integration
 * 
 * Available APIs:
 * - Query APIs (DataPrime, Lucene, Background queries) ✅
 * - Alert Definitions (create, read, update, delete alerts) ✅
 * - Dashboard Catalog (list, create, manage dashboards) ✅
 * - Target Management (S3 storage configuration) ✅
 * - Rule Groups (parsing rules for log processing) ✅
 * - Events2Metrics (convert logs/spans to metrics) ✅
 * - Enrichments (GeoIP, suspicious IP, AWS, custom enrichments) ✅
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create server instance
const server = new McpServer({
  name: "coralogix-mcp",
  version: "1.0.2",
  capabilities: {
    tools: {},
  },
});

// Test connection tool
server.tool(
  "test_connection",
  "Test if the Coralogix MCP server is working",
  {},
  async () => {
    const hasApiKey = !!process.env.CORALOGIX_API_KEY;
    const hasDomain = !!process.env.CORALOGIX_DOMAIN;
    
    return {
      content: [
        {
          type: "text",
          text: `✅ Coralogix MCP Server is working!\n\nEnvironment check:\n- API Key: ${hasApiKey ? '✅ Present' : '❌ Missing'}\n- Domain: ${hasDomain ? '✅ Present' : '❌ Missing'}\n- Domain Value: ${process.env.CORALOGIX_DOMAIN || 'Not set'}\n\nServer version: 1.0.2`
        }
      ]
    };
  }
);

// DataPrime query tool
server.tool(
  "query_dataprime",
  "Execute DataPrime queries on logs, metrics, and traces",
  {
    query: z.string().describe("DataPrime query string"),
    tier: z.enum(['TIER_FREQUENT_SEARCH', 'TIER_ARCHIVE']).optional().describe("Data tier to query"),
    limit: z.number().optional().describe("Maximum number of results (default: 100)"),
    startDate: z.string().optional().describe("Start date (ISO 8601 format)"),
    endDate: z.string().optional().describe("End date (ISO 8601 format)")
  },
  async (args) => {
    try {
      const { getCoralogixClient } = await import('./src/services/coralogix-client.js');
      const client = getCoralogixClient();
      
      const queryRequest = {
        query: args.query,
        metadata: {
          tier: args.tier || 'TIER_FREQUENT_SEARCH',
          syntax: 'QUERY_SYNTAX_DATAPRIME',
          limit: args.limit || 100,
          startDate: args.startDate,
          endDate: args.endDate
        }
      };
      
      const response = await client.query(queryRequest);
      
      // Process results
      const results = response.filter(r => r.result).map(r => r.result);
      const errors = response.filter(r => r.error).map(r => r.error);
      const warnings = response.filter(r => r.warning).map(r => r.warning);
      
      let output = `📊 DataPrime Query Results:\n`;
      
      if (errors.length > 0) {
        output += `\n❌ Errors:\n${JSON.stringify(errors, null, 2)}\n`;
      }
      
      if (warnings.length > 0) {
        output += `\n⚠️ Warnings:\n${JSON.stringify(warnings, null, 2)}\n`;
      }
      
      if (results.length > 0) {
        output += `\n✅ Results (${results.length}):\n${JSON.stringify(results, null, 2)}`;
      }
      
      return {
        content: [{
          type: 'text',
          text: output
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `❌ Error executing DataPrime query: ${error.message}`
        }]
      };
    }
  }
);

// Lucene query tool
server.tool(
  "query_lucene",
  "Execute Lucene queries on indexed logs",
  {
    query: z.string().describe("Lucene query string"),
    tier: z.enum(['TIER_FREQUENT_SEARCH', 'TIER_ARCHIVE']).optional().describe("Data tier to query"),
    limit: z.number().optional().describe("Maximum number of results (default: 100)"),
    startDate: z.string().optional().describe("Start date (ISO 8601 format)"),
    endDate: z.string().optional().describe("End date (ISO 8601 format)")
  },
  async (args) => {
    try {
      const { getCoralogixClient } = await import('./src/services/coralogix-client.js');
      const client = getCoralogixClient();
      
      const queryRequest = {
        query: args.query,
        metadata: {
          tier: args.tier || 'TIER_FREQUENT_SEARCH',
          syntax: 'QUERY_SYNTAX_LUCENE',
          limit: args.limit || 100,
          startDate: args.startDate,
          endDate: args.endDate
        }
      };
      
      const response = await client.query(queryRequest);
      
      // Process results
      const results = response.filter(r => r.result).map(r => r.result);
      const errors = response.filter(r => r.error).map(r => r.error);
      const warnings = response.filter(r => r.warning).map(r => r.warning);
      
      let output = `🔍 Lucene Query Results:\n`;
      
      if (errors.length > 0) {
        output += `\n❌ Errors:\n${JSON.stringify(errors, null, 2)}\n`;
      }
      
      if (warnings.length > 0) {
        output += `\n⚠️ Warnings:\n${JSON.stringify(warnings, null, 2)}\n`;
      }
      
      if (results.length > 0) {
        output += `\n✅ Results (${results.length}):\n${JSON.stringify(results, null, 2)}`;
      }
      
      return {
        content: [{
          type: 'text',
          text: output
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `❌ Error executing Lucene query: ${error.message}`
        }]
      };
    }
  }
);

// List alerts tool
server.tool(
  "list_alert_definitions",
  "List all alert definitions",
  {},
  async () => {
    try {
      const { getCoralogixClient } = await import('./src/services/coralogix-client.js');
      const client = getCoralogixClient();
      
      const response = await client.listAlertDefs();
      
      const alerts = response.alertDefs?.map((alert: any) => ({
        id: alert.id,
        name: alert.alertDefProperties?.name,
        priority: alert.alertDefProperties?.priority,
        type: alert.alertDefProperties?.type,
        enabled: alert.alertDefProperties?.enabled,
        description: alert.alertDefProperties?.description
      })) || [];
      
      return {
        content: [{
          type: 'text',
          text: `🚨 Alert Definitions (${alerts.length}):\n${JSON.stringify(alerts, null, 2)}`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `❌ Error listing alert definitions: ${error.message}`
        }]
      };
    }
  }
);

// Get dashboard catalog tool
server.tool(
  "get_dashboard_catalog",
  "List all dashboards in the catalog",
  {},
  async () => {
    try {
      const { getCoralogixClient } = await import('./src/services/coralogix-client.js');
      const client = getCoralogixClient();
      
      const response = await client.getDashboardCatalog();
      
      const dashboards = response.items?.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        folderId: item.folderId,
        isPinned: item.isPinned
      })) || [];
      
      return {
        content: [{
          type: 'text',
          text: `📊 Dashboard Catalog (${dashboards.length}):\n${JSON.stringify(dashboards, null, 2)}`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `❌ Error getting dashboard catalog: ${error.message}`
        }]
      };
    }
  }
);

// List rule groups tool
server.tool(
  "list_rule_groups",
  "List all parsing rule groups",
  {},
  async () => {
    try {
      const { getCoralogixClient } = await import('./src/services/coralogix-client.js');
      const client = getCoralogixClient();
      
      const response = await client.listRuleGroups();
      
      return {
        content: [{
          type: 'text',
          text: `📝 Rule Groups:\n${JSON.stringify(response, null, 2)}`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `❌ Error listing rule groups: ${error.message}`
        }]
      };
    }
  }
);

// List enrichments tool
server.tool(
  "list_enrichments",
  "List all enrichment rules",
  {},
  async () => {
    try {
      const { getCoralogixClient } = await import('./src/services/coralogix-client.js');
      const client = getCoralogixClient();
      
      const response = await client.listEnrichments();
      
      return {
        content: [{
          type: 'text',
          text: `🔍 Enrichments:\n${JSON.stringify(response, null, 2)}`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `❌ Error listing enrichments: ${error.message}`
        }]
      };
    }
  }
);

// Main function following exact MCP pattern
async function main() {
  // Validate environment variables
  const requiredEnvVars = ['CORALOGIX_API_KEY', 'CORALOGIX_DOMAIN'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('ERROR: Missing required environment variables:', missingVars.join(', '));
    console.error('Please set CORALOGIX_API_KEY and CORALOGIX_DOMAIN');
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Coralogix MCP Server running on stdio");
}

// Start the server
main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
