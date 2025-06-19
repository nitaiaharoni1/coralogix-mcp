/**
 * Coralogix Billing and Quota Tools
 * Tools for fetching billing usage and quota information
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCoralogixClient } from '../services/coralogix-client.js';
import { DataUsageRequest } from '../types/coralogix.js';

// Tool definitions
export const billingTools: Tool[] = [
  {
    name: 'get_data_usage',
    description: 'Get detailed data usage information for billing analysis. Returns data consumption broken down by application, subsystem, tier, and time period.',
    inputSchema: {
      type: 'object',
      properties: {
        resolution: {
          type: 'string',
          description: 'Time resolution for grouping data (e.g., "1h", "6h", "1d")',
          default: '6h'
        },
        fromDate: {
          type: 'string',
          description: 'Start date for usage data in ISO 8601 format (e.g., "2023-12-01T00:00:00.00Z")'
        },
        toDate: {
          type: 'string',
          description: 'End date for usage data in ISO 8601 format (e.g., "2023-12-02T00:00:00.00Z")'
        },
        days: {
          type: 'number',
          description: 'Number of days to look back from current date (alternative to fromDate/toDate)',
          minimum: 1,
          maximum: 90,
          default: 7
        }
      },
      required: []
    }
  },
  {
    name: 'get_current_quota',
    description: 'Get current quota information including used quota, remaining quota, and unit consumption.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  }
];

// Tool handlers
export async function handleBillingTool(name: string, args: any): Promise<string | null> {
  const client = getCoralogixClient();

  switch (name) {
    case 'get_data_usage':
      return await handleGetDataUsage(client, args);
    case 'get_current_quota':
      return await handleGetCurrentQuota(client, args);
    default:
      return null; // Tool not handled by this module
  }
}

async function handleGetDataUsage(client: any, args: any): Promise<string> {
  const { resolution = '6h', fromDate, toDate, days = 7 } = args;

  let startDate: string;
  let endDate: string;

  if (fromDate && toDate) {
    startDate = fromDate;
    endDate = toDate;
  } else {
    // Use days parameter to calculate date range
    const now = new Date();
    const past = new Date(now);
    past.setDate(past.getDate() - days);
    
    startDate = past.toISOString();
    endDate = now.toISOString();
  }

  const request: DataUsageRequest = {
    resolution,
    dateRange: {
      fromDate: startDate,
      toDate: endDate
    }
  };

  try {
    const response = await client.getDataUsage(request);
    return formatDataUsageResponse(response, startDate, endDate);
  } catch (error) {
    throw new Error(`Failed to get data usage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleGetCurrentQuota(client: any, args: any): Promise<string> {
  try {
    const quotaInfo = await client.getQuotaInfo();
    return formatQuotaResponse(quotaInfo);
  } catch (error) {
    throw new Error(`Failed to get quota information: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function formatDataUsageResponse(response: any, startDate: string, endDate: string): string {
  const { data } = response;
  
  if (!data || data.length === 0) {
    return `## Data Usage Report\n\n**Period:** ${startDate} to ${endDate}\n\n**No usage data found for the specified period.**`;
  }

  let totalUnits = 0;
  let totalSizeGb = 0;
  const breakdown: Record<string, { units: number; sizeGb: number; count: number }> = {};

  // Process each usage entry
  for (const entry of data) {
    totalUnits += entry.units || 0;
    totalSizeGb += entry.sizeGb || 0;

    // Create breakdown by application/subsystem
    let key = 'Unknown';
    for (const dimension of entry.dimensions || []) {
      if (dimension.genericDimension?.key === 'application_name') {
        key = dimension.genericDimension.value;
        break;
      }
    }

    if (!breakdown[key]) {
      breakdown[key] = { units: 0, sizeGb: 0, count: 0 };
    }
    breakdown[key].units += entry.units || 0;
    breakdown[key].sizeGb += entry.sizeGb || 0;
    breakdown[key].count += 1;
  }

  // Calculate costs (1 unit = $1.50)
  const totalCost = totalUnits * 1.5;

  let result = `## Data Usage Report\n\n`;
  result += `**Period:** ${startDate} to ${endDate}\n\n`;
  result += `### Summary\n`;
  result += `- **Total Data Processed:** ${totalSizeGb.toFixed(4)} GB\n`;
  result += `- **Total Units Consumed:** ${totalUnits.toFixed(4)} units\n`;
  result += `- **Estimated Cost:** $${totalCost.toFixed(2)}\n`;
  result += `- **Total Entries:** ${data.length}\n\n`;

  // Add breakdown by application
  if (Object.keys(breakdown).length > 0) {
    result += `### Breakdown by Application\n\n`;
    for (const [app, stats] of Object.entries(breakdown)) {
      const appCost = stats.units * 1.5;
      result += `**${app}:**\n`;
      result += `  - Data: ${stats.sizeGb.toFixed(4)} GB\n`;
      result += `  - Units: ${stats.units.toFixed(4)}\n`;
      result += `  - Cost: $${appCost.toFixed(2)}\n`;
      result += `  - Entries: ${stats.count}\n\n`;
    }
  }

  // Add pricing information
  result += `### Pricing Information\n`;
  result += `- **High Priority (Frequent Search):** 1 GB = 0.75 units\n`;
  result += `- **Medium Priority (Monitoring):** 1 GB = 0.32 units\n`;
  result += `- **Low Priority (Compliance):** 1 GB = 0.12 units\n`;
  result += `- **Metrics:** 30 GB = 1 unit\n`;
  result += `- **1 unit = $1.50**\n`;

  return result;
}

function formatQuotaResponse(quotaInfo: any): string {
  let result = `## Current Quota Information\n\n`;
  
  if (quotaInfo.usedQuotaGb !== undefined) {
    result += `### Data Usage\n`;
    result += `- **Used Quota:** ${quotaInfo.usedQuotaGb.toFixed(4)} GB\n`;
    if (quotaInfo.remainingQuotaGb !== undefined) {
      result += `- **Remaining Quota:** ${quotaInfo.remainingQuotaGb.toFixed(4)} GB\n`;
    }
    if (quotaInfo.dailyQuotaGb !== undefined) {
      result += `- **Daily Quota:** ${quotaInfo.dailyQuotaGb.toFixed(4)} GB\n`;
    }
  }

  if (quotaInfo.units) {
    result += `\n### Unit Consumption\n`;
    if (quotaInfo.units.usedUnits !== undefined) {
      result += `- **Used Units:** ${quotaInfo.units.usedUnits.toFixed(4)} units\n`;
      result += `- **Estimated Cost:** $${(quotaInfo.units.usedUnits * 1.5).toFixed(2)}\n`;
    }
    if (quotaInfo.units.remainingUnits !== undefined) {
      result += `- **Remaining Units:** ${quotaInfo.units.remainingUnits.toFixed(4)} units\n`;
    }
    if (quotaInfo.units.dailyQuotaUnits !== undefined) {
      result += `- **Daily Quota Units:** ${quotaInfo.units.dailyQuotaUnits.toFixed(4)} units\n`;
    }
  }

  if (!quotaInfo.usedQuotaGb && !quotaInfo.units) {
    result += `**No quota information available at this time.**\n`;
    result += `This may be due to API limitations or insufficient permissions.\n`;
  }

  result += `\n### Notes\n`;
  result += `- Quota information is based on recent usage data\n`;
  result += `- Data may be delayed by up to 15 minutes\n`;
  result += `- 1 unit = $1.50 in billing costs\n`;

  return result;
} 