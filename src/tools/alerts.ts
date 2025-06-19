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
    name: 'list_alerts',
    description: 'List all alert definitions in your Coralogix account. Shows active alerts, their priorities, types, and current status.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'create_alert',
    description: 'Create a new alert definition for monitoring logs, metrics, or traces. Supports various alert types including immediate, threshold, and anomaly alerts.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the alert (e.g., "High Error Rate Alert", "CPU Usage Alert")'
        },
        description: {
          type: 'string',
          description: 'Detailed description of what this alert monitors'
        },
        priority: {
          type: 'string',
          enum: ['ALERT_DEF_PRIORITY_P1', 'ALERT_DEF_PRIORITY_P2', 'ALERT_DEF_PRIORITY_P3', 'ALERT_DEF_PRIORITY_P4', 'ALERT_DEF_PRIORITY_P5_OR_UNSPECIFIED'],
          description: 'Alert priority level (P1 = Critical, P2 = High, P3 = Medium, P4 = Low, P5 = Info)',
          default: 'ALERT_DEF_PRIORITY_P3'
        },
        type: {
          type: 'string',
          enum: ['ALERT_DEF_TYPE_LOGS_IMMEDIATE_OR_UNSPECIFIED', 'ALERT_DEF_TYPE_LOGS_THRESHOLD', 'ALERT_DEF_TYPE_LOGS_ANOMALY', 'ALERT_DEF_TYPE_METRIC_THRESHOLD', 'ALERT_DEF_TYPE_FLOW'],
          description: 'Type of alert to create',
          default: 'ALERT_DEF_TYPE_LOGS_IMMEDIATE_OR_UNSPECIFIED'
        },
        enabled: {
          type: 'boolean',
          description: 'Whether the alert should be enabled immediately',
          default: true
        },
        groupByKeys: {
          type: 'array',
          items: { type: 'string' },
          description: 'Fields to group alerts by (e.g., ["application", "severity"])'
        },
        entityLabels: {
          type: 'object',
          description: 'Key-value pairs for labeling and categorizing the alert'
        }
      },
      required: ['name', 'priority', 'type']
    }
  },
  {
    name: 'get_alert',
    description: 'Get detailed information about a specific alert definition by its ID.',
    inputSchema: {
      type: 'object',
      properties: {
        alertId: {
          type: 'string',
          description: 'The unique identifier of the alert definition'
        }
      },
      required: ['alertId']
    }
  },
  {
    name: 'update_alert',
    description: 'Update an existing alert definition. You can modify the name, description, priority, enabled status, and other properties.',
    inputSchema: {
      type: 'object',
      properties: {
        alertId: {
          type: 'string',
          description: 'The unique identifier of the alert definition to update'
        },
        name: {
          type: 'string',
          description: 'Updated name of the alert'
        },
        description: {
          type: 'string',
          description: 'Updated description of the alert'
        },
        priority: {
          type: 'string',
          enum: ['ALERT_DEF_PRIORITY_P1', 'ALERT_DEF_PRIORITY_P2', 'ALERT_DEF_PRIORITY_P3', 'ALERT_DEF_PRIORITY_P4', 'ALERT_DEF_PRIORITY_P5_OR_UNSPECIFIED'],
          description: 'Updated alert priority level'
        },
        enabled: {
          type: 'boolean',
          description: 'Whether the alert should be enabled or disabled'
        },
        entityLabels: {
          type: 'object',
          description: 'Updated key-value pairs for labeling and categorizing the alert'
        }
      },
      required: ['alertId']
    }
  },
  {
    name: 'delete_alert',
    description: 'Delete an alert definition permanently. This action cannot be undone.',
    inputSchema: {
      type: 'object',
      properties: {
        alertId: {
          type: 'string',
          description: 'The unique identifier of the alert definition to delete'
        }
      },
      required: ['alertId']
    }
  },
  {
    name: 'enable_alert',
    description: 'Enable or disable an alert definition without deleting it.',
    inputSchema: {
      type: 'object',
      properties: {
        alertId: {
          type: 'string',
          description: 'The unique identifier of the alert definition'
        },
        enabled: {
          type: 'boolean',
          description: 'Set to true to enable the alert, false to disable it'
        }
      },
      required: ['alertId', 'enabled']
    }
  }
];

// Tool handlers
export async function handleAlertTool(name: string, args: any): Promise<string> {
  const client = getCoralogixClient();

  switch (name) {
    case 'list_alerts':
      return await handleListAlerts(client);
    
    case 'create_alert':
      return await handleCreateAlert(client, args);
    
    case 'get_alert':
      return await handleGetAlert(client, args);
    
    case 'update_alert':
      return await handleUpdateAlert(client, args);
    
    case 'delete_alert':
      return await handleDeleteAlert(client, args);
    
    case 'enable_alert':
      return await handleEnableAlert(client, args);
    
    default:
      throw new Error(`Unknown alert tool: ${name}`);
  }
}

async function handleListAlerts(client: any): Promise<string> {
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

async function handleCreateAlert(client: any, args: any): Promise<string> {
  try {
    const { name, description, priority, type, enabled = true, groupByKeys, entityLabels } = args;

    const request: CreateAlertDefRequest = {
      alertDefProperties: {
        name,
        description,
        priority: priority as AlertDefPriority,
        type: type as AlertDefType,
        enabled,
        ...(groupByKeys && { groupByKeys }),
        ...(entityLabels && { entityLabels })
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

async function handleGetAlert(client: any, args: any): Promise<string> {
  try {
    const { alertId } = args;
    const response = await client.getAlertDef(alertId);
    
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

async function handleUpdateAlert(client: any, args: any): Promise<string> {
  try {
    const { alertId, ...updates } = args;
    
    // First get the current alert to merge with updates
    const currentAlert = await client.getAlertDef(alertId);
    const currentProps = currentAlert.alertDef.alertDefProperties;
    
    const updatedProps = {
      ...currentProps,
      ...updates
    };
    
    const request = {
      id: alertId,
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

async function handleDeleteAlert(client: any, args: any): Promise<string> {
  try {
    const { alertId } = args;
    
    // Get alert name before deleting for confirmation
    const alert = await client.getAlertDef(alertId);
    const alertName = alert.alertDef.alertDefProperties.name;
    
    await client.deleteAlertDef(alertId);
    
    return `✅ Alert definition "${alertName}" (ID: ${alertId}) has been deleted successfully.`;
  } catch (error) {
    throw new Error(`Failed to delete alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleEnableAlert(client: any, args: any): Promise<string> {
  try {
    const { alertId, enabled } = args;
    
    await client.setAlertDefActive(alertId, enabled);
    
    const action = enabled ? 'enabled' : 'disabled';
    return `✅ Alert definition (ID: ${alertId}) has been ${action} successfully.`;
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
    'ALERT_DEF_TYPE_FLOW': 'Flow Alert'
  };
  return typeLabels[type] || type;
} 