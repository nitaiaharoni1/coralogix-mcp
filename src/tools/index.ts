/**
 * MCP Tools registry and handlers for Coralogix
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { queryTools, handleQueryTool } from './query.js';
import { billingTools, handleBillingTool } from './billing.js';
import { alertTools, handleAlertTool } from './alerts.js';
import { dashboardTools, handleDashboardTool } from './dashboards.js';
import { incidentTools, handleIncidentTool } from './incidents.js';
import { sloTools, handleSloTool } from './slos.js';
import { dataUsageTools, handleDataUsageTools } from './data-usage.js';
import { policiesTools, handlePoliciesTools } from './policies.js';

import { targetsTools, handleTargetsTools } from './targets.js';
import { teamPermissionsTools, handleTeamPermissionsTools } from './team-permissions.js';

// Combine all tool definitions
export function getToolDefinitions(): Tool[] {
  return [
    ...queryTools,
    ...billingTools,
    ...alertTools,
    ...dashboardTools,
    ...incidentTools,
    ...sloTools,
    ...dataUsageTools,
    ...policiesTools,

    ...targetsTools,
    ...teamPermissionsTools
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
    } else if (name.startsWith('get_data_usage') || name.startsWith('get_current_quota')) {
      const billingResult = await handleBillingTool(name, args || {});
      if (billingResult === null) {
        throw new Error(`Unknown billing tool: ${name}`);
      }
      result = billingResult;
    } else if (name.includes('alert')) {
      result = await handleAlertTool(name, args || {});
    } else if (name.includes('dashboard')) {
      result = await handleDashboardTool(name, args || {});
    } else if (name.includes('incident')) {
      result = await handleIncidentTool(name, args || {});
    } else if (name.includes('slo')) {
      result = await handleSloTool(name, args || {});
    } else if (dataUsageTools.some(tool => tool.name === name)) {
      const { getCoralogixClient } = await import('../services/coralogix-client.js');
      result = await handleDataUsageTools(name, args || {}, getCoralogixClient());
    } else if (policiesTools.some(tool => tool.name === name)) {
      const { getCoralogixClient } = await import('../services/coralogix-client.js');
      result = await handlePoliciesTools(name, args || {}, getCoralogixClient());

    } else if (targetsTools.some(tool => tool.name === name)) {
      const { getCoralogixClient } = await import('../services/coralogix-client.js');
      result = await handleTargetsTools(name, args || {}, getCoralogixClient());
    } else if (teamPermissionsTools.some(tool => tool.name === name)) {
      const { getCoralogixClient } = await import('../services/coralogix-client.js');
      result = await handleTeamPermissionsTools(name, args || {}, getCoralogixClient());
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