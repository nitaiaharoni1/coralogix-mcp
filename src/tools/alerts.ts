/**
 * Coralogix Alert Management Tools
 * Tools for managing alert definitions, creating alerts, and monitoring alert status
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCoralogixClient } from '../services/coralogix-client.js';
import { AlertDefPriority, AlertDefType, CreateAlertDefRequest } from '../types/coralogix.js';

// Tool definitions
export const alertTools: Tool[] = [
  {
    name: 'list_alert_definitions',
    description: '⚠️ MANAGES ALERT CONFIGURATION - NOT ACTUAL LOGS. List all alert definitions/rules in your Coralogix account. This shows alert CONFIGURATION and RULES, not actual triggered alerts or log data. Use this to: get an overview of all monitoring alert rules, find specific alert definitions by name, check alert rule configurations, and understand your current alerting setup. Returns alert rule IDs, names, types, enabled status, and priority levels. If user asks for "logs" or "error logs", use query_dataprime or query_lucene instead.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_alert_definition',
    description: '⚠️ MANAGES ALERT CONFIGURATION - NOT ACTUAL LOGS. Get detailed configuration of a specific alert definition/rule by ID. This shows alert RULE configuration, not actual triggered alerts or log data. Use this to: examine alert conditions and thresholds, review notification settings, understand alert logic, and debug alert behavior. Returns complete alert rule configuration including filters, conditions, and notification groups. If user asks for "logs" or "error logs", use query_dataprime or query_lucene instead.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The unique identifier of the alert definition to retrieve. Get this from list_alert_definitions.'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'create_alert_definition',
    description: '⚠️ CREATES ALERT CONFIGURATION - NOT FOR VIEWING LOGS. Create a new alert definition/rule to monitor logs, metrics, or traces. This creates monitoring RULES, not for viewing actual log data. Use this to: set up error monitoring rules, performance alert rules, SLA monitoring rules, anomaly detection rules, and custom business logic alert rules. Supports various alert types including immediate, threshold, ratio, and anomaly alerts. If user asks for "logs" or "error logs", use query_dataprime or query_lucene instead.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'A descriptive name for the alert rule (e.g., "High Error Rate - Payment Service", "Database Connection Timeout")'
        },
        description: {
          type: 'string',
          description: 'Detailed description of what this alert rule monitors and when it should trigger'
        },
        priority: {
          type: 'string',
          enum: ['ALERT_DEF_PRIORITY_P1', 'ALERT_DEF_PRIORITY_P2', 'ALERT_DEF_PRIORITY_P3', 'ALERT_DEF_PRIORITY_P4', 'ALERT_DEF_PRIORITY_P5_OR_UNSPECIFIED'],
          description: 'Alert priority level. P1 is highest (critical), P5 is lowest (informational)'
        },
        enabled: {
          type: 'boolean',
          description: 'Whether the alert rule should be active immediately after creation. Default is true.'
        },
        type: {
          type: 'string',
          enum: ['ALERT_DEF_TYPE_LOGS_IMMEDIATE_OR_UNSPECIFIED', 'ALERT_DEF_TYPE_LOGS_THRESHOLD', 'ALERT_DEF_TYPE_LOGS_ANOMALY', 'ALERT_DEF_TYPE_METRIC_THRESHOLD', 'ALERT_DEF_TYPE_TRACING_IMMEDIATE'],
          description: 'Type of alert rule: LOGS_IMMEDIATE for instant log alerts, LOGS_THRESHOLD for count-based alerts, LOGS_ANOMALY for anomaly detection, METRIC_THRESHOLD for metric alerts, TRACING_IMMEDIATE for trace alerts'
        },
        logsFilter: {
          type: 'object',
          description: 'Log filter configuration for log-based alert rules. Include query, severity filters, application filters, etc.'
        },
        metricFilter: {
          type: 'object',
          description: 'Metric filter configuration for metric-based alert rules. Include metric name, labels, and aggregation settings.'
        },
        notificationGroup: {
          type: 'object',
          description: 'Notification configuration including webhooks, email groups, and routing rules for when alert triggers.'
        }
      },
      required: ['name', 'priority', 'type']
    }
  },
  {
    name: 'update_alert_definition',
    description: '⚠️ UPDATES ALERT CONFIGURATION - NOT FOR VIEWING LOGS. Update an existing alert definition/rule configuration. This modifies alert RULES, not for viewing actual log data. Use this to: modify alert conditions, change thresholds, update notification settings, adjust filters, and fine-tune alert behavior. Requires the complete alert configuration. If user asks for "logs" or "error logs", use query_dataprime or query_lucene instead.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The unique identifier of the alert definition to update'
        },
        alertDefProperties: {
          type: 'object',
          description: 'Complete alert definition configuration with all properties. Use get_alert_definition first to get current config, then modify as needed.'
        }
      },
      required: ['id', 'alertDefProperties']
    }
  },
  {
    name: 'delete_alert_definition',
    description: '⚠️ DELETES ALERT CONFIGURATION - NOT FOR VIEWING LOGS. Permanently delete an alert definition/rule. This removes monitoring RULES, not for viewing actual log data. Use this to: remove obsolete alert rules, clean up unused monitoring rules, and manage alert lifecycle. This action cannot be undone. If user asks for "logs" or "error logs", use query_dataprime or query_lucene instead.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The unique identifier of the alert definition to delete. Get this from list_alert_definitions.'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'set_alert_active',
    description: '⚠️ MANAGES ALERT CONFIGURATION - NOT FOR VIEWING LOGS. Enable or disable an alert definition/rule without deleting it. This controls monitoring RULES, not for viewing actual log data. Use this to: temporarily disable noisy alert rules, enable alert rules after maintenance, manage alert schedules, and control alert activation. Disabled alert rules do not trigger notifications. If user asks for "logs" or "error logs", use query_dataprime or query_lucene instead.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The unique identifier of the alert definition to enable/disable'
        },
        active: {
          type: 'boolean',
          description: 'Set to true to enable the alert rule (it will start monitoring), false to disable it (stops monitoring)'
        }
      },
      required: ['id', 'active']
    }
  }
];

// Tool handlers
export async function handleAlertTool(name: string, args: any): Promise<string> {
  const client = getCoralogixClient();

  switch (name) {
    case 'list_alert_definitions':
      return await handleListAlertDefinitions(client);
    
    case 'get_alert_definition':
      return await handleGetAlertDefinition(client, args);
    
    case 'create_alert_definition':
      return await handleCreateAlertDefinition(client, args);
    
    case 'update_alert_definition':
      return await handleUpdateAlertDefinition(client, args);
    
    case 'delete_alert_definition':
      return await handleDeleteAlertDefinition(client, args);
    
    case 'set_alert_active':
      return await handleSetAlertActive(client, args);
    
    default:
      throw new Error(`Unknown alert tool: ${name}`);
  }
}

async function handleListAlertDefinitions(client: any): Promise<string> {
  try {
    const response = await client.listAlertDefs();
    
    if (!response.alertDefs || response.alertDefs.length === 0) {
      return 'No alert definitions found in your Coralogix account.';
    }

    let result = `Alert Definitions (${response.alertDefs.length} found)\n`;
    result += '='.repeat(50) + '\n\n';

    response.alertDefs.forEach((alert: any, index: number) => {
      const props = alert.alertDefProperties;
      const priorityLabel = getPriorityLabel(props.priority);
      const typeLabel = getTypeLabel(props.type);
      const status = props.enabled ? '🟢 Enabled' : '🔴 Disabled';
      
      result += `${index + 1}. ${props.name}\n`;
      result += `   ID: ${alert.id}\n`;
      result += `   Status: ${status}\n`;
      result += `   Priority: ${priorityLabel}\n`;
      result += `   Type: ${typeLabel}\n`;
      
      if (props.description) {
        result += `   Description: ${props.description}\n`;
      }
      
      if (props.groupByKeys && props.groupByKeys.length > 0) {
        result += `   Group By: ${props.groupByKeys.join(', ')}\n`;
      }
      
      if (alert.createdTime) {
        result += `   Created: ${new Date(alert.createdTime).toLocaleString()}\n`;
      }
      
      if (alert.updatedTime) {
        result += `   Updated: ${new Date(alert.updatedTime).toLocaleString()}\n`;
      }
      
      result += `\n`;
    });

    return result;
  } catch (error) {
    throw new Error(`Failed to list alerts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleGetAlertDefinition(client: any, args: any): Promise<string> {
  try {
    const { id } = args;
    const response = await client.getAlertDef(id);
    
    const alert = response.alertDef;
    const props = alert.alertDefProperties;
    
    let result = `Alert Definition Details\n`;
    result += '='.repeat(30) + '\n\n';
    
    result += `Name: ${props.name}\n`;
    result += `ID: ${alert.id}\n`;
    result += `Status: ${props.enabled ? '🟢 Enabled' : '🔴 Disabled'}\n`;
    result += `Priority: ${getPriorityLabel(props.priority)}\n`;
    result += `Type: ${getTypeLabel(props.type)}\n`;
    
    if (props.description) {
      result += `Description: ${props.description}\n`;
    }
    
    if (props.groupByKeys && props.groupByKeys.length > 0) {
      result += `Group By Keys: ${props.groupByKeys.join(', ')}\n`;
    }
    
    if (props.entityLabels && Object.keys(props.entityLabels).length > 0) {
      result += `Labels:\n`;
      Object.entries(props.entityLabels).forEach(([key, value]) => {
        result += `  ${key}: ${value}\n`;
      });
    }
    
    if (alert.createdTime) {
      result += `Created: ${new Date(alert.createdTime).toLocaleString()}\n`;
    }
    
    if (alert.updatedTime) {
      result += `Last Updated: ${new Date(alert.updatedTime).toLocaleString()}\n`;
    }
    
    if (alert.alertVersionId) {
      result += `Version ID: ${alert.alertVersionId}\n`;
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to get alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleCreateAlertDefinition(client: any, args: any): Promise<string> {
  try {
    const { name, description, priority, type, enabled = true, logsFilter, metricFilter, notificationGroup } = args;

    const request: CreateAlertDefRequest = {
      alertDefProperties: {
        name,
        description,
        priority: priority as AlertDefPriority,
        type: type as AlertDefType,
        enabled,
        ...(logsFilter && { logsFilter }),
        ...(metricFilter && { metricFilter }),
        ...(notificationGroup && { notificationGroup })
      }
    };

    const response = await client.createAlertDef(request);
    
    let result = `✅ Alert definition created successfully!\n\n`;
    result += `Alert ID: ${response.alertDef.id}\n`;
    result += `Name: ${response.alertDef.alertDefProperties.name}\n`;
    result += `Priority: ${getPriorityLabel(response.alertDef.alertDefProperties.priority)}\n`;
    result += `Type: ${getTypeLabel(response.alertDef.alertDefProperties.type)}\n`;
    result += `Status: ${response.alertDef.alertDefProperties.enabled ? 'Enabled' : 'Disabled'}\n`;
    
    if (response.alertDef.createdTime) {
      result += `Created: ${new Date(response.alertDef.createdTime).toLocaleString()}\n`;
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to create alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleUpdateAlertDefinition(client: any, args: any): Promise<string> {
  try {
    const { id, alertDefProperties } = args;
    
    // First get the current alert to merge with updates
    const currentAlert = await client.getAlertDef(id);
    const currentProps = currentAlert.alertDef.alertDefProperties;
    
    const updatedProps = {
      ...currentProps,
      ...alertDefProperties
    };
    
    const request = {
      id,
      alertDefProperties: updatedProps
    };
    
    const response = await client.updateAlertDef(request);
    
    let result = `✅ Alert definition updated successfully!\n\n`;
    result += `Alert ID: ${response.alertDef.id}\n`;
    result += `Name: ${response.alertDef.alertDefProperties.name}\n`;
    result += `Priority: ${getPriorityLabel(response.alertDef.alertDefProperties.priority)}\n`;
    result += `Status: ${response.alertDef.alertDefProperties.enabled ? 'Enabled' : 'Disabled'}\n`;
    
    if (response.alertDef.updatedTime) {
      result += `Updated: ${new Date(response.alertDef.updatedTime).toLocaleString()}\n`;
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to update alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleDeleteAlertDefinition(client: any, args: any): Promise<string> {
  try {
    const { id } = args;
    
    // Get alert name before deleting for confirmation
    const alert = await client.getAlertDef(id);
    const alertName = alert.alertDef.alertDefProperties.name;
    
    await client.deleteAlertDef(id);
    
    return `✅ Alert definition "${alertName}" (ID: ${id}) has been deleted successfully.`;
  } catch (error) {
    throw new Error(`Failed to delete alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleSetAlertActive(client: any, args: any): Promise<string> {
  try {
    const { id, active } = args;
    
    await client.setAlertDefActive(id, active);
    
    const action = active ? 'enabled' : 'disabled';
    return `✅ Alert definition (ID: ${id}) has been ${action} successfully.`;
  } catch (error) {
    throw new Error(`Failed to enable/disable alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper functions
function getPriorityLabel(priority: string): string {
  const priorityLabels: Record<string, string> = {
    'ALERT_DEF_PRIORITY_P1': 'P1 (Critical)',
    'ALERT_DEF_PRIORITY_P2': 'P2 (High)',
    'ALERT_DEF_PRIORITY_P3': 'P3 (Medium)',
    'ALERT_DEF_PRIORITY_P4': 'P4 (Low)',
    'ALERT_DEF_PRIORITY_P5_OR_UNSPECIFIED': 'P5 (Info)'
  };
  return priorityLabels[priority] || priority;
}

function getTypeLabel(type: string): string {
  const typeLabels: Record<string, string> = {
    'ALERT_DEF_TYPE_LOGS_IMMEDIATE_OR_UNSPECIFIED': 'Logs Immediate',
    'ALERT_DEF_TYPE_LOGS_THRESHOLD': 'Logs Threshold',
    'ALERT_DEF_TYPE_LOGS_ANOMALY': 'Logs Anomaly',
    'ALERT_DEF_TYPE_METRIC_THRESHOLD': 'Metric Threshold',
    'ALERT_DEF_TYPE_TRACING_IMMEDIATE': 'Trace Alert'
  };
  return typeLabels[type] || type;
} 