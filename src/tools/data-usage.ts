import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CoralogixClient } from '../services/coralogix-client.js';

/**
 * Get data usage information with filtering and aggregation options
 */
export const getDataUsageTool: Tool = {
  name: 'get_data_usage',
  description: 'Get data usage information for billing and quota monitoring with filtering and aggregation options',
  inputSchema: {
    type: 'object',
    properties: {
      fromDate: {
        type: 'string',
        description: 'Start date in ISO 8601 format (e.g., 2024-01-01T00:00:00.000Z)'
      },
      toDate: {
        type: 'string',
        description: 'End date in ISO 8601 format (e.g., 2024-01-02T00:00:00.000Z)'
      },
      resolution: {
        type: 'string',
        description: 'Aggregation resolution (e.g., "1h", "1d"). Minimum supported value is 1h',
        default: '1h'
      },
      aggregate: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['AGGREGATE_BY_APPLICATION', 'AGGREGATE_BY_SUBSYSTEM', 'AGGREGATE_BY_PILLAR', 'AGGREGATE_BY_PRIORITY']
        },
        description: 'List of aggregate parameters for grouping data'
      }
    },
    required: ['fromDate', 'toDate']
  }
};

/**
 * Get daily usage evaluation tokens
 */
export const getDailyUsageTokensTool: Tool = {
  name: 'get_daily_usage_tokens',
  description: 'Get daily usage evaluation tokens for AI/ML operations billing tracking',
  inputSchema: {
    type: 'object',
    properties: {
      range: {
        type: 'string',
        enum: ['RANGE_CURRENT_MONTH', 'RANGE_LAST_30_DAYS', 'RANGE_LAST_90_DAYS', 'RANGE_LAST_WEEK'],
        description: 'Predefined time range for data retrieval'
      },
      fromDate: {
        type: 'string',
        description: 'Custom start date in ISO 8601 format (alternative to range)'
      },
      toDate: {
        type: 'string',
        description: 'Custom end date in ISO 8601 format (alternative to range)'
      }
    }
  }
};

/**
 * Get daily usage processed GBs
 */
export const getDailyUsageGBsTool: Tool = {
  name: 'get_daily_usage_gbs',
  description: 'Get daily usage in processed gigabytes for data volume billing tracking',
  inputSchema: {
    type: 'object',
    properties: {
      range: {
        type: 'string',
        enum: ['RANGE_CURRENT_MONTH', 'RANGE_LAST_30_DAYS', 'RANGE_LAST_90_DAYS', 'RANGE_LAST_WEEK'],
        description: 'Predefined time range for data retrieval'
      },
      fromDate: {
        type: 'string',
        description: 'Custom start date in ISO 8601 format (alternative to range)'
      },
      toDate: {
        type: 'string',
        description: 'Custom end date in ISO 8601 format (alternative to range)'
      }
    }
  }
};

/**
 * Get daily usage units
 */
export const getDailyUsageUnitsTool: Tool = {
  name: 'get_daily_usage_units',
  description: 'Get daily usage in billing units for comprehensive cost tracking',
  inputSchema: {
    type: 'object',
    properties: {
      range: {
        type: 'string',
        enum: ['RANGE_CURRENT_MONTH', 'RANGE_LAST_30_DAYS', 'RANGE_LAST_90_DAYS', 'RANGE_LAST_WEEK'],
        description: 'Predefined time range for data retrieval'
      },
      fromDate: {
        type: 'string',
        description: 'Custom start date in ISO 8601 format (alternative to range)'
      },
      toDate: {
        type: 'string',
        description: 'Custom end date in ISO 8601 format (alternative to range)'
      }
    }
  }
};

/**
 * Get data usage export status
 */
export const getDataUsageExportStatusTool: Tool = {
  name: 'get_data_usage_export_status',
  description: 'Get the current status of data usage metrics export to external systems',
  inputSchema: {
    type: 'object',
    properties: {}
  }
};

/**
 * Update data usage export status
 */
export const updateDataUsageExportStatusTool: Tool = {
  name: 'update_data_usage_export_status',
  description: 'Enable or disable data usage metrics export to external systems',
  inputSchema: {
    type: 'object',
    properties: {
      enabled: {
        type: 'boolean',
        description: 'Whether to enable or disable data usage export'
      }
    },
    required: ['enabled']
  }
};

/**
 * Handle data usage tool calls
 */
export async function handleDataUsageTools(
  name: string,
  args: any,
  client: CoralogixClient
): Promise<string> {
  try {
    switch (name) {
      case 'get_data_usage': {
        const filter = {
          dateRange: {
            fromDate: args.fromDate,
            toDate: args.toDate
          },
          resolution: args.resolution,
          aggregate: args.aggregate
        };

        const response = await client.getDataUsage(filter);
        
        let result = `Data Usage Report\n`;
        result += `=================\n\n`;
        result += `📊 Date Range: ${args.fromDate} to ${args.toDate}\n`;
        result += `⏱️  Resolution: ${args.resolution || '1h'}\n`;
        result += `📈 Aggregation: ${args.aggregate ? args.aggregate.join(', ') : 'none'}\n`;
        result += `📋 Total Entries: ${response.entries?.length || 0}\n\n`;

        if (response.entries && response.entries.length > 0) {
          result += `Recent Data Usage:\n`;
          result += `==================\n`;
          response.entries.slice(0, 10).forEach((entry: any, index: number) => {
            result += `${index + 1}. ${entry.timestamp}\n`;
            if (entry.applicationName) result += `   App: ${entry.applicationName}\n`;
            if (entry.subsystemName) result += `   Subsystem: ${entry.subsystemName}\n`;
            if (entry.pillar) result += `   Pillar: ${entry.pillar}\n`;
            if (entry.priority) result += `   Priority: ${entry.priority}\n`;
            if (entry.processedGigabytes) result += `   Processed: ${entry.processedGigabytes} GB\n`;
            if (entry.evaluationTokens) result += `   Tokens: ${entry.evaluationTokens}\n`;
            if (entry.units) result += `   Units: ${entry.units}\n`;
            result += `\n`;
          });

          if (response.entries.length > 10) {
            result += `... and ${response.entries.length - 10} more entries\n`;
          }
        } else {
          result += `No data usage entries found for the specified time range.\n`;
        }

        return result;
      }

      case 'get_daily_usage_tokens': {
        const dateRange = args.fromDate && args.toDate ? {
          fromDate: args.fromDate,
          toDate: args.toDate
        } : undefined;

        const response = await client.getDailyUsageTokens(args.range, dateRange);
        
        const totalTokens = response.tokens?.reduce((sum: number, item: any) => sum + (item.evaluationTokens || 0), 0) || 0;
        const avgTokensPerDay = response.tokens?.length ? Math.round(totalTokens / response.tokens.length) : 0;
        
        let result = `Daily Evaluation Tokens Usage\n`;
        result += `=============================\n\n`;
        result += `🎯 Total Tokens: ${totalTokens.toLocaleString()}\n`;
        result += `📅 Days: ${response.tokens?.length || 0}\n`;
        result += `📊 Average per Day: ${avgTokensPerDay.toLocaleString()}\n`;
        result += `📈 Range: ${args.range || 'custom'}\n\n`;

        if (response.tokens && response.tokens.length > 0) {
          result += `Daily Breakdown:\n`;
          result += `================\n`;
          response.tokens.forEach((item: any) => {
            result += `${item.date}: ${item.evaluationTokens?.toLocaleString() || 0} tokens\n`;
          });
        }

        return result;
      }

      case 'get_daily_usage_gbs': {
        const dateRange = args.fromDate && args.toDate ? {
          fromDate: args.fromDate,
          toDate: args.toDate
        } : undefined;

        const response = await client.getDailyUsageGBs(args.range, dateRange);
        
        const totalGBs = response.gbs?.reduce((sum: number, item: any) => sum + (item.processedGigabytes || 0), 0) || 0;
        const avgGBsPerDay = response.gbs?.length ? Number((totalGBs / response.gbs.length).toFixed(2)) : 0;
        
        let result = `Daily Processed GBs Usage\n`;
        result += `=========================\n\n`;
        result += `💾 Total GBs: ${totalGBs.toFixed(2)} GB\n`;
        result += `📅 Days: ${response.gbs?.length || 0}\n`;
        result += `📊 Average per Day: ${avgGBsPerDay} GB\n`;
        result += `📈 Range: ${args.range || 'custom'}\n\n`;

        if (response.gbs && response.gbs.length > 0) {
          result += `Daily Breakdown:\n`;
          result += `================\n`;
          response.gbs.forEach((item: any) => {
            result += `${item.date}: ${item.processedGigabytes?.toFixed(2) || 0} GB\n`;
          });
        }

        return result;
      }

      case 'get_daily_usage_units': {
        const dateRange = args.fromDate && args.toDate ? {
          fromDate: args.fromDate,
          toDate: args.toDate
        } : undefined;

        const response = await client.getDailyUsageUnits(args.range, dateRange);
        
        const totalUnits = response.units?.reduce((sum: number, item: any) => sum + (item.units || 0), 0) || 0;
        const avgUnitsPerDay = response.units?.length ? Math.round(totalUnits / response.units.length) : 0;
        
        let result = `Daily Billing Units Usage\n`;
        result += `=========================\n\n`;
        result += `💰 Total Units: ${totalUnits.toLocaleString()}\n`;
        result += `📅 Days: ${response.units?.length || 0}\n`;
        result += `📊 Average per Day: ${avgUnitsPerDay.toLocaleString()}\n`;
        result += `📈 Range: ${args.range || 'custom'}\n\n`;

        if (response.units && response.units.length > 0) {
          result += `Daily Breakdown:\n`;
          result += `================\n`;
          response.units.forEach((item: any) => {
            result += `${item.date}: ${item.units?.toLocaleString() || 0} units\n`;
          });
        }

        return result;
      }

      case 'get_data_usage_export_status': {
        const response = await client.getDataUsageExportStatus();
        
        let result = `Data Usage Export Status\n`;
        result += `========================\n\n`;
        result += `📤 Export Status: ${response.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}\n`;
        result += `📊 External Integration: ${response.enabled ? 'Active' : 'Inactive'}\n\n`;
        
        if (response.enabled) {
          result += `✅ Data usage metrics are being exported to external systems.\n`;
        } else {
          result += `❌ Data usage metrics export is disabled.\n`;
          result += `   Use 'update_data_usage_export_status' to enable export.\n`;
        }

        return result;
      }

      case 'update_data_usage_export_status': {
        const response = await client.updateDataUsageExportStatus(args.enabled);
        
        let result = `Data Usage Export Status Updated\n`;
        result += `=================================\n\n`;
        result += `📤 Previous Status: ${!args.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}\n`;
        result += `📤 New Status: ${args.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}\n\n`;
        
        if (args.enabled) {
          result += `✅ Data usage metrics export has been enabled.\n`;
          result += `   Metrics will now be exported to external systems.\n`;
        } else {
          result += `❌ Data usage metrics export has been disabled.\n`;
          result += `   Export to external systems has been stopped.\n`;
        }

        return result;
      }

      default:
        throw new Error(`Unknown data usage tool: ${name}`);
    }
  } catch (error: any) {
    throw new Error(`Failed to execute data usage operation: ${error.message}`);
  }
}

export const dataUsageTools = [
  getDataUsageTool,
  getDailyUsageTokensTool,
  getDailyUsageGBsTool,
  getDailyUsageUnitsTool,
  getDataUsageExportStatusTool,
  updateDataUsageExportStatusTool
]; 