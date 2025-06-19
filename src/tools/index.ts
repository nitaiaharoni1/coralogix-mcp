/**
 * MCP Tools registry and handlers for Coralogix
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { queryTools, handleQueryTool } from './query.js';
import { alertTools, handleAlertTool } from './alerts.js';
import { dashboardTools, handleDashboardTool } from './dashboards.js';
import { targetsTools, handleTargetsTools } from './targets.js';

// Note: The following tools are not available in EU2 region (return 404):
// - Data Usage/Billing tools (/v2/datausage endpoints)
// - Incidents tools (/v1/incidents endpoints)
// - SLOs tools (/v1/slo/slos endpoints)
// - Policies tools (/v2/policies endpoints)
// - Team Permissions tools (/v1/teams/groups endpoints)

// Combine all working tool definitions
export function getToolDefinitions(): Tool[] {
  return [
    ...queryTools,        // ✅ DataPrime & Lucene queries, background queries
    ...alertTools,        // ✅ Alert definitions management
    ...dashboardTools,    // ✅ Dashboard catalog and management
    ...targetsTools       // ✅ S3 target configuration
  ];
}

// Main tool call handler
export async function handleToolCall(request: CallToolRequest): Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}> {
  const { name, arguments: args } = request.params;

  try {
    let result: string;

    // Route to appropriate handler based on tool name
    if (name.startsWith('query_') || name.includes('background_query')) {
      result = await handleQueryTool(name, args || {});
    } else if (name.includes('alert')) {
      result = await handleAlertTool(name, args || {});
    } else if (name.includes('dashboard')) {
      result = await handleDashboardTool(name, args || {});
    } else if (targetsTools.some(tool => tool.name === name)) {
      const { getCoralogixClient } = await import('../services/coralogix-client.js');
      result = await handleTargetsTools(name, args || {}, getCoralogixClient());
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: 'text', text: result }],
      isError: false,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [{ type: 'text', text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
} 