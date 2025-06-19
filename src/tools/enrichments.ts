/**
 * Enrichments Tools for Coralogix MCP Server
 * 
 * Manage data enrichments (GeoIP, suspicious IP, AWS, custom) for log enhancement.
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { getCoralogixClient } from '../services/coralogix-client.js';

export const enrichmentsTools: Tool[] = [
  {
    name: 'list_enrichments',
    description: 'List all configured data enrichments that enhance logs with additional context. Use this to: see all active enrichment rules, understand data enhancement pipeline, identify enrichment coverage, and manage enrichment configurations. Returns enrichment types (GeoIP, suspicious IP, AWS, custom), status, and field mappings.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_enrichment_limits',
    description: 'Get enrichment usage limits and current consumption for your account. Use this to: monitor enrichment quota usage, plan new enrichment rules, understand capacity constraints, and optimize enrichment resource allocation. Returns limits for different enrichment types and current usage.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_enrichment_settings',
    description: 'Get company enrichment settings and configuration',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_custom_enrichments',
    description: 'List all custom enrichment configurations that add user-defined data to logs. Use this to: see custom lookup tables and mappings, understand custom data enhancement logic, manage custom enrichment rules, and debug custom enrichment behavior. Returns custom enrichment definitions and field mappings.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'create_custom_enrichment',
    description: 'Create a new custom enrichment to add specific data fields to logs based on lookup conditions. Use this to: add business context to logs, enrich logs with external data, create custom field mappings, and enhance log analysis capabilities. Supports CSV uploads and key-value mappings.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'A descriptive name for the custom enrichment (e.g., "User ID to Department Mapping", "IP to Office Location")'
        },
        description: {
          type: 'string',
          description: 'Detailed description of what this enrichment adds to logs and how it works'
        },
        file: {
          type: 'object',
          description: 'CSV file configuration containing the lookup data with headers and mappings'
        },
        lookupKey: {
          type: 'string',
          description: 'The log field to use as lookup key (e.g., "user_id", "ip_address", "service_name")'
        },
        outputFields: {
          type: 'array',
          description: 'Array of output field names that will be added to logs when enrichment matches'
        }
      },
      required: ['name', 'file', 'lookupKey']
    }
  },
  {
    name: 'update_custom_enrichment',
    description: 'Update an existing custom enrichment configuration or data. Use this to: modify lookup data and mappings, change enrichment logic, update CSV data sources, and maintain enrichment accuracy. Supports updating both configuration and lookup data.',
    inputSchema: {
      type: 'object',
      properties: {
        enrichmentId: {
          type: 'string',
          description: 'The unique identifier of the custom enrichment to update'
        },
        enrichment: {
          type: 'object',
          description: 'Complete custom enrichment configuration with all properties. Use get_custom_enrichments first to get current config, then modify as needed.'
        }
      },
      required: ['enrichmentId', 'enrichment']
    }
  },
  {
    name: 'delete_custom_enrichment',
    description: 'Permanently delete a custom enrichment configuration. Use this to: remove obsolete enrichments, clean up unused lookup tables, and manage enrichment lifecycle. This action cannot be undone and will stop all enrichment for logs matching this configuration.',
    inputSchema: {
      type: 'object',
      properties: {
        enrichmentId: {
          type: 'string',
          description: 'The unique identifier of the custom enrichment to delete. Get this from get_custom_enrichments.'
        }
      },
      required: ['enrichmentId']
    }
  }
];

export async function handleEnrichmentsTool(request: CallToolRequest): Promise<any> {
  const client = getCoralogixClient();
  
  switch (request.params.name) {
    case 'list_enrichments':
      return await client.listEnrichments();
      
    case 'get_enrichment_limits':
      return await client.getEnrichmentLimits();
      
    case 'get_enrichment_settings':
      return await client.getEnrichmentSettings();
      
    case 'get_custom_enrichments':
      return await client.listCustomEnrichments();
      
    case 'create_custom_enrichment':
      const { name, description, file, lookupKey, outputFields } = request.params.arguments as { name: string, description: string, file: object, lookupKey: string, outputFields: string[] };
      return await client.createCustomEnrichment(name, description, file, lookupKey, outputFields);
      
    case 'update_custom_enrichment':
      const { enrichmentId, enrichment } = request.params.arguments as { enrichmentId: string, enrichment: object };
      return await client.updateCustomEnrichment(enrichmentId, enrichment);
      
    case 'delete_custom_enrichment':
      const { enrichmentId: deleteId } = request.params.arguments as { enrichmentId: string };
      return await client.deleteCustomEnrichment(deleteId);
      
    default:
      throw new Error(`Unknown Enrichments tool: ${request.params.name}`);
  }
} 