/**
 * MCP Tools registry and handlers for Coralogix
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { queryTools, handleQueryTool } from './query.js';
import { alertTools, handleAlertTool } from './alerts.js';
import { dashboardTools, handleDashboardTool } from './dashboards.js';
import { targetsTools, handleTargetsTools } from './targets.js';
import { ruleGroupsTools, handleRuleGroupsTool } from './rulegroups.js';
import { events2metricsTools, handleEvents2MetricsTool } from './events2metrics.js';
import { enrichmentsTools, handleEnrichmentsTool } from './enrichments.js';

// Export all available tools
export const tools: Tool[] = [
  ...queryTools,
  ...alertTools,
  ...dashboardTools,
  ...targetsTools,
  ...ruleGroupsTools,
  ...events2metricsTools,
  ...enrichmentsTools,
];

/**
 * Handle tool execution
 */
export async function handleTool(request: CallToolRequest): Promise<any> {
  const { name, arguments: args } = request.params;
  
  // Route to appropriate handler based on tool name prefix
  if (name.startsWith('query_') || 
      name.startsWith('submit_background_') ||
      name.startsWith('get_background_') ||
      name.startsWith('cancel_background_')) {
    return handleQueryTool(name, args || {});
  }
  
  if (name.includes('alert')) {
    return handleAlertTool(name, args || {});
  }
  
  if (name.includes('dashboard')) {
    return handleDashboardTool(name, args || {});
  }
  
  if (name.includes('target')) {
    const { getCoralogixClient } = await import('../services/coralogix-client.js');
    return handleTargetsTools(name, args || {}, getCoralogixClient());
  }
  
  if (name.includes('rule_group')) {
    return handleRuleGroupsTool(request);
  }
  
  if (name.includes('events2metrics') || name.includes('e2m')) {
    return handleEvents2MetricsTool(request);
  }
  
  if (name.includes('enrichment')) {
    return handleEnrichmentsTool(request);
  }
  
  throw new Error(`Unknown tool: ${name}`);
} 