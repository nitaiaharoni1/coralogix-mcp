/**
 * Events2Metrics (E2M) Tools for Coralogix MCP Server
 * 
 * Manage events2metrics configurations to convert logs/spans to metrics
 * for cost optimization and monitoring.
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { getCoralogixClient } from '../services/coralogix-client.js';

export const events2metricsTools: Tool[] = [
  {
    name: 'list_events2metrics',
    description: 'List all Events2Metrics (E2M) configurations that convert logs and spans to metrics for cost optimization. Use this to: see all active E2M rules, understand metric generation patterns, identify cost-saving opportunities, and manage E2M configurations. Returns E2M names, types (logs/spans), target metrics, and status.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_events2metrics',
    description: 'Get detailed configuration of a specific Events2Metrics rule by ID. Use this to: examine E2M rule logic and filters, understand metric labels and aggregations, review performance and cost impact, and debug E2M behavior. Returns complete rule definition including queries, transformations, and output metrics.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The unique identifier of the Events2Metrics configuration to retrieve. Get this from list_events2metrics.'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'get_events2metrics_limits',
    description: 'Get Events2Metrics usage limits and current consumption for your account. Use this to: monitor E2M quota usage, plan new E2M rules, understand capacity constraints, and optimize E2M resource allocation. Returns limits, current usage, and available capacity.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_events2metrics_cardinality',
    description: 'Analyze cardinality (unique label combinations) for planned Events2Metrics rules before creation. Use this to: estimate metric volume and cost, identify high-cardinality labels, optimize E2M rule design, and prevent cardinality explosions. Helps with E2M planning and cost control.',
    inputSchema: {
      type: 'object',
      properties: {
        spansQuery: {
          type: 'object',
          description: 'Spans query configuration to analyze cardinality for span-based E2M rules. Include filters and label extractions.'
        },
        logsQuery: {
          type: 'object',
          description: 'Logs query configuration to analyze cardinality for log-based E2M rules. Include filters and label extractions.'
        },
        startDate: {
          type: 'string',
          description: 'Start time for cardinality analysis in ISO format (e.g., "2025-06-19T21:00:00.000Z")'
        },
        endDate: {
          type: 'string',
          description: 'End time for cardinality analysis in ISO format (e.g., "2025-06-19T22:00:00.000Z")'
        }
      },
      required: []
    }
  }
];

export async function handleEvents2MetricsTool(request: CallToolRequest): Promise<any> {
  const client = getCoralogixClient();
  
  switch (request.params.name) {
    case 'list_events2metrics':
      return await client.listEvents2Metrics();
      
    case 'get_events2metrics':
      const { id } = request.params.arguments as { id: string };
      return await client.getEvents2Metrics(id);
      
    case 'get_events2metrics_limits':
      return await client.getEvents2MetricsLimits();
      
    case 'get_events2metrics_cardinality':
      const { spansQuery, logsQuery } = request.params.arguments as any;
      return await client.getEvents2MetricsCardinality(spansQuery, logsQuery);
      
    default:
      throw new Error(`Unknown Events2Metrics tool: ${request.params.name}`);
  }
} 