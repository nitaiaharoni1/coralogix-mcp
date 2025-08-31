/**
 * Coralogix Alert Management Tools
 * Tools for managing alert definitions, creating alerts, and monitoring alert status
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCoralogixClient } from '../services/coralogix-client.js';
import { 
  AlertDefPriority, 
  AlertDefType, 
  CreateAlertDefRequest,
  LogFilterOperationType,
  LogSeverity,
  TracingFilterOperationType,
  LogsTimeWindowValue,
  MetricTimeWindowValue,
  LogsThresholdConditionType,
  MetricThresholdConditionType,
  DayOfWeek,
  NotifyOn
} from '../types/coralogix.js';

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
          enum: [
            'ALERT_DEF_TYPE_LOGS_IMMEDIATE_OR_UNSPECIFIED',
            'ALERT_DEF_TYPE_LOGS_THRESHOLD', 
            'ALERT_DEF_TYPE_LOGS_ANOMALY',
            'ALERT_DEF_TYPE_LOGS_RATIO_THRESHOLD',
            'ALERT_DEF_TYPE_LOGS_NEW_VALUE',
            'ALERT_DEF_TYPE_LOGS_UNIQUE_COUNT',
            'ALERT_DEF_TYPE_LOGS_TIME_RELATIVE_THRESHOLD',
            'ALERT_DEF_TYPE_METRIC_THRESHOLD',
            'ALERT_DEF_TYPE_METRIC_ANOMALY',
            'ALERT_DEF_TYPE_TRACING_IMMEDIATE',
            'ALERT_DEF_TYPE_TRACING_THRESHOLD',
            'ALERT_DEF_TYPE_FLOW',
            'ALERT_DEF_TYPE_SLO_THRESHOLD'
          ],
          description: 'Type of alert rule - supports all Coralogix alert types including logs, metrics, tracing, flow, and SLO alerts'
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
  },
  {
    name: 'create_logs_threshold_alert',
    description: '🚨 CREATE ADVANCED LOGS THRESHOLD ALERT - Create a sophisticated log count threshold alert with detailed filtering, time windows, and notification settings. This creates a monitoring rule that triggers when log counts exceed/fall below thresholds within specific time windows. Perfect for error rate monitoring, volume alerts, and service health checks.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Alert name (e.g., "High Error Rate - Payment Service")'
        },
        description: {
          type: 'string',
          description: 'Detailed description of what this alert monitors'
        },
        priority: {
          type: 'string',
          enum: ['ALERT_DEF_PRIORITY_P1', 'ALERT_DEF_PRIORITY_P2', 'ALERT_DEF_PRIORITY_P3', 'ALERT_DEF_PRIORITY_P4', 'ALERT_DEF_PRIORITY_P5_OR_UNSPECIFIED'],
          description: 'Alert priority (P1=Critical, P5=Info)'
        },
        luceneQuery: {
          type: 'string',
          description: 'Lucene query to filter logs (e.g., "level:ERROR AND service:payment")'
        },
        applicationName: {
          type: 'string',
          description: 'Application name to filter by'
        },
        subsystemName: {
          type: 'string',
          description: 'Subsystem name to filter by'
        },
        severities: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['LOG_SEVERITY_VERBOSE_UNSPECIFIED', 'LOG_SEVERITY_DEBUG', 'LOG_SEVERITY_INFO', 'LOG_SEVERITY_WARNING', 'LOG_SEVERITY_ERROR', 'LOG_SEVERITY_CRITICAL']
          },
          description: 'Log severity levels to include'
        },
        threshold: {
          type: 'number',
          description: 'Threshold count for triggering the alert'
        },
        conditionType: {
          type: 'string',
          enum: ['LOGS_THRESHOLD_CONDITION_TYPE_MORE_THAN_OR_UNSPECIFIED', 'LOGS_THRESHOLD_CONDITION_TYPE_LESS_THAN', 'LOGS_THRESHOLD_CONDITION_TYPE_EQUALS', 'LOGS_THRESHOLD_CONDITION_TYPE_NOT_EQUALS'],
          description: 'Condition type for threshold comparison'
        },
        timeWindow: {
          type: 'string',
          enum: ['LOGS_TIME_WINDOW_VALUE_MINUTES_5_OR_UNSPECIFIED', 'LOGS_TIME_WINDOW_VALUE_MINUTES_10', 'LOGS_TIME_WINDOW_VALUE_MINUTES_15', 'LOGS_TIME_WINDOW_VALUE_MINUTES_30', 'LOGS_TIME_WINDOW_VALUE_HOURS_1', 'LOGS_TIME_WINDOW_VALUE_HOURS_2', 'LOGS_TIME_WINDOW_VALUE_HOURS_6', 'LOGS_TIME_WINDOW_VALUE_HOURS_12', 'LOGS_TIME_WINDOW_VALUE_HOURS_24'],
          description: 'Time window for threshold evaluation'
        },
        groupByKeys: {
          type: 'array',
          items: { type: 'string' },
          description: 'Keys to group alerts by (e.g., ["service", "region"])'
        },
        enabled: {
          type: 'boolean',
          description: 'Whether to enable the alert immediately (default: true)'
        },
        notificationEmails: {
          type: 'array',
          items: { type: 'string' },
          description: 'Email addresses for notifications'
        }
      },
      required: ['name', 'priority', 'threshold', 'conditionType', 'timeWindow']
    }
  },
  {
    name: 'create_metric_threshold_alert',
    description: '📊 CREATE ADVANCED METRIC THRESHOLD ALERT - Create a sophisticated metric threshold alert with PromQL queries, time windows, and advanced conditions. Perfect for monitoring system metrics, performance indicators, and resource utilization.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Alert name (e.g., "High CPU Usage - Production Cluster")'
        },
        description: {
          type: 'string',
          description: 'Detailed description of what this alert monitors'
        },
        priority: {
          type: 'string',
          enum: ['ALERT_DEF_PRIORITY_P1', 'ALERT_DEF_PRIORITY_P2', 'ALERT_DEF_PRIORITY_P3', 'ALERT_DEF_PRIORITY_P4', 'ALERT_DEF_PRIORITY_P5_OR_UNSPECIFIED'],
          description: 'Alert priority (P1=Critical, P5=Info)'
        },
        promqlQuery: {
          type: 'string',
          description: 'PromQL query for metric filtering (e.g., "avg_over_time(cpu_usage[5m]) > 80")'
        },
        threshold: {
          type: 'number',
          description: 'Threshold value for triggering the alert'
        },
        conditionType: {
          type: 'string',
          enum: ['METRIC_THRESHOLD_CONDITION_TYPE_MORE_THAN_OR_UNSPECIFIED', 'METRIC_THRESHOLD_CONDITION_TYPE_LESS_THAN', 'METRIC_THRESHOLD_CONDITION_TYPE_EQUALS', 'METRIC_THRESHOLD_CONDITION_TYPE_NOT_EQUALS'],
          description: 'Condition type for threshold comparison'
        },
        timeWindow: {
          type: 'string',
          enum: ['METRIC_TIME_WINDOW_VALUE_MINUTES_1_OR_UNSPECIFIED', 'METRIC_TIME_WINDOW_VALUE_MINUTES_5', 'METRIC_TIME_WINDOW_VALUE_MINUTES_10', 'METRIC_TIME_WINDOW_VALUE_MINUTES_15', 'METRIC_TIME_WINDOW_VALUE_MINUTES_30', 'METRIC_TIME_WINDOW_VALUE_HOURS_1', 'METRIC_TIME_WINDOW_VALUE_HOURS_2', 'METRIC_TIME_WINDOW_VALUE_HOURS_6', 'METRIC_TIME_WINDOW_VALUE_HOURS_12', 'METRIC_TIME_WINDOW_VALUE_HOURS_24'],
          description: 'Time window for threshold evaluation'
        },
        forOverPct: {
          type: 'number',
          description: 'Percentage of time the condition must be true (0-100)'
        },
        groupByKeys: {
          type: 'array',
          items: { type: 'string' },
          description: 'Keys to group alerts by (e.g., ["instance", "region"])'
        },
        enabled: {
          type: 'boolean',
          description: 'Whether to enable the alert immediately (default: true)'
        },
        notificationEmails: {
          type: 'array',
          items: { type: 'string' },
          description: 'Email addresses for notifications'
        }
      },
      required: ['name', 'priority', 'promqlQuery', 'threshold', 'conditionType', 'timeWindow']
    }
  },
  {
    name: 'create_tracing_alert',
    description: '🔍 CREATE ADVANCED TRACING ALERT - Create sophisticated tracing alerts for monitoring distributed systems, latency issues, and service performance. Supports both immediate and threshold-based tracing alerts.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Alert name (e.g., "High Latency - Checkout Service")'
        },
        description: {
          type: 'string',
          description: 'Detailed description of what this alert monitors'
        },
        priority: {
          type: 'string',
          enum: ['ALERT_DEF_PRIORITY_P1', 'ALERT_DEF_PRIORITY_P2', 'ALERT_DEF_PRIORITY_P3', 'ALERT_DEF_PRIORITY_P4', 'ALERT_DEF_PRIORITY_P5_OR_UNSPECIFIED'],
          description: 'Alert priority (P1=Critical, P5=Info)'
        },
        alertType: {
          type: 'string',
          enum: ['ALERT_DEF_TYPE_TRACING_IMMEDIATE', 'ALERT_DEF_TYPE_TRACING_THRESHOLD'],
          description: 'Type of tracing alert - immediate triggers on any matching span, threshold triggers on span count'
        },
        applicationName: {
          type: 'string',
          description: 'Application name to filter traces by'
        },
        serviceName: {
          type: 'string',
          description: 'Service name to filter traces by'
        },
        operationName: {
          type: 'string',
          description: 'Operation name to filter traces by'
        },
        latencyThresholdMs: {
          type: 'number',
          description: 'Latency threshold in milliseconds for span filtering'
        },
        spanAmountThreshold: {
          type: 'number',
          description: 'Number of spans threshold (for threshold alerts)'
        },
        timeWindow: {
          type: 'string',
          enum: ['TRACING_TIME_WINDOW_VALUE_MINUTES_5_OR_UNSPECIFIED', 'TRACING_TIME_WINDOW_VALUE_MINUTES_10', 'TRACING_TIME_WINDOW_VALUE_MINUTES_15', 'TRACING_TIME_WINDOW_VALUE_MINUTES_30', 'TRACING_TIME_WINDOW_VALUE_HOURS_1'],
          description: 'Time window for threshold evaluation (for threshold alerts)'
        },
        groupByKeys: {
          type: 'array',
          items: { type: 'string' },
          description: 'Keys to group alerts by (e.g., ["service", "operation"])'
        },
        enabled: {
          type: 'boolean',
          description: 'Whether to enable the alert immediately (default: true)'
        },
        notificationEmails: {
          type: 'array',
          items: { type: 'string' },
          description: 'Email addresses for notifications'
        }
      },
      required: ['name', 'priority', 'alertType']
    }
  },
  {
    name: 'get_alert_events',
    description: '📋 GET ALERT EVENTS - Retrieve triggered alert events and statistics. This shows actual alert EVENTS (when alerts fired), not alert configurations. Use this to: view recent alert activity, analyze alert patterns, check alert event details, and understand alert frequency. Returns triggered/resolved alert events with timestamps and context.',
    inputSchema: {
      type: 'object',
      properties: {
        eventId: {
          type: 'string',
          description: 'Specific alert event ID to retrieve (optional - if not provided, gets statistics)'
        },
        startTime: {
          type: 'string',
          description: 'Start time for events query (ISO 8601 format, e.g., "2024-01-01T00:00:00Z")'
        },
        endTime: {
          type: 'string',
          description: 'End time for events query (ISO 8601 format, e.g., "2024-01-01T23:59:59Z")'
        },
        alertDefIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by specific alert definition IDs'
        },
        priorities: {
          type: 'array',
          items: { 
            type: 'string',
            enum: ['ALERT_DEF_PRIORITY_P1', 'ALERT_DEF_PRIORITY_P2', 'ALERT_DEF_PRIORITY_P3', 'ALERT_DEF_PRIORITY_P4', 'ALERT_DEF_PRIORITY_P5_OR_UNSPECIFIED']
          },
          description: 'Filter by alert priorities'
        },
        status: {
          type: 'array',
          items: { 
            type: 'string',
            enum: ['TRIGGERED', 'RESOLVED']
          },
          description: 'Filter by alert event status'
        }
      },
      required: []
    }
  },
  {
    name: 'download_alerts_backup',
    description: '💾 DOWNLOAD ALERTS BACKUP - Download a complete backup of all alert definitions in your account. This creates a comprehensive export of all alert configurations for backup, migration, or audit purposes. Returns all alert definitions with full configuration details.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_alert_by_version',
    description: '🔄 GET ALERT BY VERSION ID - Retrieve a specific version of an alert definition. Useful for tracking alert changes, rollbacks, and version history. Each alert update creates a new version with a unique version ID.',
    inputSchema: {
      type: 'object',
      properties: {
        versionId: {
          type: 'string',
          description: 'The alert version ID to retrieve'
        }
      },
      required: ['versionId']
    }
  },
  {
    name: 'search_alerts',
    description: '🔍 ADVANCED ALERT SEARCH - Search and filter alerts with comprehensive criteria including name patterns, types, priorities, enabled status, modification dates, and more. Perfect for finding specific alerts, analyzing alert patterns, and managing large alert inventories.',
    inputSchema: {
      type: 'object',
      properties: {
        namePattern: {
          type: 'string',
          description: 'Search pattern for alert names (supports partial matching)'
        },
        nameMatchType: {
          type: 'string',
          enum: ['FILTER_MATCHER_EQUALS', 'FILTER_MATCHER_NOT_EQUALS', 'FILTER_MATCHER_CONTAINS'],
          description: 'How to match the name pattern (equals, not equals, contains)'
        },
        alertTypes: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              'ALERT_DEF_TYPE_LOGS_IMMEDIATE_OR_UNSPECIFIED',
              'ALERT_DEF_TYPE_LOGS_THRESHOLD',
              'ALERT_DEF_TYPE_LOGS_ANOMALY',
              'ALERT_DEF_TYPE_LOGS_RATIO_THRESHOLD',
              'ALERT_DEF_TYPE_LOGS_NEW_VALUE',
              'ALERT_DEF_TYPE_LOGS_UNIQUE_COUNT',
              'ALERT_DEF_TYPE_LOGS_TIME_RELATIVE_THRESHOLD',
              'ALERT_DEF_TYPE_METRIC_THRESHOLD',
              'ALERT_DEF_TYPE_METRIC_ANOMALY',
              'ALERT_DEF_TYPE_TRACING_IMMEDIATE',
              'ALERT_DEF_TYPE_TRACING_THRESHOLD',
              'ALERT_DEF_TYPE_FLOW',
              'ALERT_DEF_TYPE_SLO_THRESHOLD'
            ]
          },
          description: 'Filter by specific alert types'
        },
        priorities: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['ALERT_DEF_PRIORITY_P1', 'ALERT_DEF_PRIORITY_P2', 'ALERT_DEF_PRIORITY_P3', 'ALERT_DEF_PRIORITY_P4', 'ALERT_DEF_PRIORITY_P5_OR_UNSPECIFIED']
          },
          description: 'Filter by alert priorities'
        },
        enabled: {
          type: 'boolean',
          description: 'Filter by enabled status (true=enabled, false=disabled)'
        },
        modifiedAfter: {
          type: 'string',
          description: 'Show alerts modified after this date (ISO 8601 format)'
        },
        modifiedBefore: {
          type: 'string',
          description: 'Show alerts modified before this date (ISO 8601 format)'
        },
        lastTriggeredAfter: {
          type: 'string',
          description: 'Show alerts last triggered after this date (ISO 8601 format)'
        },
        lastTriggeredBefore: {
          type: 'string',
          description: 'Show alerts last triggered before this date (ISO 8601 format)'
        },
        entityLabels: {
          type: 'string',
          description: 'Filter by entity label key-value pairs (e.g., "environment=production")'
        },
        sloIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter SLO alerts by specific SLO IDs'
        },
        pageSize: {
          type: 'number',
          description: 'Number of results per page (max 1000, default 200)'
        },
        pageToken: {
          type: 'string',
          description: 'Page token for pagination (from previous response)'
        }
      },
      required: []
    }
  },
  {
    name: 'bulk_manage_alerts',
    description: '⚙️ BULK ALERT MANAGEMENT - Perform bulk operations on multiple alerts including enable/disable, delete, and status updates. Efficient for managing large numbers of alerts at once.',
    inputSchema: {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          enum: ['enable', 'disable', 'delete', 'list_by_ids'],
          description: 'Bulk operation to perform on the alerts'
        },
        alertIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of alert definition IDs to operate on'
        },
        searchCriteria: {
          type: 'object',
          description: 'Alternative to alertIds - search criteria to find alerts to operate on',
          properties: {
            namePattern: { type: 'string' },
            alertTypes: { type: 'array', items: { type: 'string' } },
            priorities: { type: 'array', items: { type: 'string' } },
            enabled: { type: 'boolean' }
          }
        },
        confirmOperation: {
          type: 'boolean',
          description: 'Set to true to confirm destructive operations (required for delete)'
        }
      },
      required: ['operation']
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
    
    case 'create_logs_threshold_alert':
      return await handleCreateLogsThresholdAlert(client, args);
    
    case 'create_metric_threshold_alert':
      return await handleCreateMetricThresholdAlert(client, args);
    
    case 'create_tracing_alert':
      return await handleCreateTracingAlert(client, args);
    
    case 'get_alert_events':
      return await handleGetAlertEvents(client, args);
    
    case 'download_alerts_backup':
      return await handleDownloadAlertsBackup(client);
    
    case 'get_alert_by_version':
      return await handleGetAlertByVersion(client, args);
    
    case 'search_alerts':
      return await handleSearchAlerts(client, args);
    
    case 'bulk_manage_alerts':
      return await handleBulkManageAlerts(client, args);
    
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
    'ALERT_DEF_TYPE_LOGS_RATIO_THRESHOLD': 'Logs Ratio Threshold',
    'ALERT_DEF_TYPE_LOGS_NEW_VALUE': 'Logs New Value',
    'ALERT_DEF_TYPE_LOGS_UNIQUE_COUNT': 'Logs Unique Count',
    'ALERT_DEF_TYPE_LOGS_TIME_RELATIVE_THRESHOLD': 'Logs Time Relative',
    'ALERT_DEF_TYPE_METRIC_THRESHOLD': 'Metric Threshold',
    'ALERT_DEF_TYPE_METRIC_ANOMALY': 'Metric Anomaly',
    'ALERT_DEF_TYPE_TRACING_IMMEDIATE': 'Trace Immediate',
    'ALERT_DEF_TYPE_TRACING_THRESHOLD': 'Trace Threshold',
    'ALERT_DEF_TYPE_FLOW': 'Flow Alert',
    'ALERT_DEF_TYPE_SLO_THRESHOLD': 'SLO Threshold'
  };
  return typeLabels[type] || type;
}

// New advanced alert creation handlers

async function handleCreateLogsThresholdAlert(client: any, args: any): Promise<string> {
  try {
    const {
      name,
      description,
      priority,
      luceneQuery,
      applicationName,
      subsystemName,
      severities,
      threshold,
      conditionType,
      timeWindow,
      groupByKeys,
      enabled = true,
      notificationEmails
    } = args;

    // Build log filter
    const logsFilter: any = {
      simpleFilter: {}
    };

    if (luceneQuery) {
      logsFilter.simpleFilter.luceneQuery = luceneQuery;
    }

    if (applicationName || subsystemName || severities) {
      logsFilter.simpleFilter.labelFilters = {};
      
      if (applicationName) {
        logsFilter.simpleFilter.labelFilters.applicationName = [{
          value: applicationName,
          operation: 'LOG_FILTER_OPERATION_TYPE_IS_OR_UNSPECIFIED'
        }];
      }
      
      if (subsystemName) {
        logsFilter.simpleFilter.labelFilters.subsystemName = [{
          value: subsystemName,
          operation: 'LOG_FILTER_OPERATION_TYPE_IS_OR_UNSPECIFIED'
        }];
      }
      
      if (severities && severities.length > 0) {
        logsFilter.simpleFilter.labelFilters.severities = severities;
      }
    }

    // Build notification group
    const notificationGroup: any = {};
    if (groupByKeys && groupByKeys.length > 0) {
      notificationGroup.groupByKeys = groupByKeys;
    }
    if (notificationEmails && notificationEmails.length > 0) {
      notificationGroup.webhooks = [{
        minutes: 15,
        notifyOn: 'NOTIFY_ON_TRIGGERED_ONLY_UNSPECIFIED',
        integration: {
          integrationId: 1, // Default integration
          recipients: {
            emails: notificationEmails
          }
        }
      }];
    }

    const alertDefProperties: any = {
      name,
      description,
      priority,
      type: 'ALERT_DEF_TYPE_LOGS_THRESHOLD',
      enabled,
      logsThreshold: {
        logsFilter,
        rules: [{
          condition: {
            threshold,
            timeWindow: {
              logsTimeWindowSpecificValue: timeWindow
            },
            conditionType
          }
        }],
        evaluationDelayMs: 60000
      },
      ...(groupByKeys && { groupByKeys }),
      ...(Object.keys(notificationGroup).length > 0 && { notificationGroup })
    };

    const request: CreateAlertDefRequest = {
      alertDefProperties
    };

    const response = await client.createAlertDef(request);
    
    let result = `✅ Advanced logs threshold alert created successfully!\n\n`;
    result += `Alert ID: ${response.alertDef.id}\n`;
    result += `Name: ${response.alertDef.alertDefProperties.name}\n`;
    result += `Type: Logs Threshold Alert\n`;
    result += `Priority: ${getPriorityLabel(response.alertDef.alertDefProperties.priority)}\n`;
    result += `Threshold: ${threshold} logs ${conditionType.replace('LOGS_THRESHOLD_CONDITION_TYPE_', '').toLowerCase().replace('_or_unspecified', '')} within ${timeWindow.replace('LOGS_TIME_WINDOW_VALUE_', '').toLowerCase().replace('_or_unspecified', '')}\n`;
    result += `Status: ${response.alertDef.alertDefProperties.enabled ? 'Enabled' : 'Disabled'}\n`;
    
    if (luceneQuery) {
      result += `Query: ${luceneQuery}\n`;
    }
    
    if (groupByKeys && groupByKeys.length > 0) {
      result += `Grouped by: ${groupByKeys.join(', ')}\n`;
    }
    
    if (response.alertDef.createdTime) {
      result += `Created: ${new Date(response.alertDef.createdTime).toLocaleString()}\n`;
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to create logs threshold alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleCreateMetricThresholdAlert(client: any, args: any): Promise<string> {
  try {
    const {
      name,
      description,
      priority,
      promqlQuery,
      threshold,
      conditionType,
      timeWindow,
      forOverPct,
      groupByKeys,
      enabled = true,
      notificationEmails
    } = args;

    // Build notification group
    const notificationGroup: any = {};
    if (groupByKeys && groupByKeys.length > 0) {
      notificationGroup.groupByKeys = groupByKeys;
    }
    if (notificationEmails && notificationEmails.length > 0) {
      notificationGroup.webhooks = [{
        minutes: 15,
        notifyOn: 'NOTIFY_ON_TRIGGERED_ONLY_UNSPECIFIED',
        integration: {
          integrationId: 1, // Default integration
          recipients: {
            emails: notificationEmails
          }
        }
      }];
    }

    const alertDefProperties: any = {
      name,
      description,
      priority,
      type: 'ALERT_DEF_TYPE_METRIC_THRESHOLD',
      enabled,
      metricThreshold: {
        metricFilter: {
          promql: promqlQuery
        },
        rules: [{
          condition: {
            threshold,
            ...(forOverPct && { forOverPct }),
            ofTheLast: {
              metricTimeWindowSpecificValue: timeWindow
            },
            conditionType
          }
        }],
        evaluationDelayMs: 60000
      },
      ...(groupByKeys && { groupByKeys }),
      ...(Object.keys(notificationGroup).length > 0 && { notificationGroup })
    };

    const request: CreateAlertDefRequest = {
      alertDefProperties
    };

    const response = await client.createAlertDef(request);
    
    let result = `✅ Advanced metric threshold alert created successfully!\n\n`;
    result += `Alert ID: ${response.alertDef.id}\n`;
    result += `Name: ${response.alertDef.alertDefProperties.name}\n`;
    result += `Type: Metric Threshold Alert\n`;
    result += `Priority: ${getPriorityLabel(response.alertDef.alertDefProperties.priority)}\n`;
    result += `PromQL Query: ${promqlQuery}\n`;
    result += `Threshold: ${threshold} ${conditionType.replace('METRIC_THRESHOLD_CONDITION_TYPE_', '').toLowerCase().replace('_or_unspecified', '')}\n`;
    result += `Time Window: ${timeWindow.replace('METRIC_TIME_WINDOW_VALUE_', '').toLowerCase().replace('_or_unspecified', '')}\n`;
    
    if (forOverPct) {
      result += `For Over: ${forOverPct}% of the time\n`;
    }
    
    result += `Status: ${response.alertDef.alertDefProperties.enabled ? 'Enabled' : 'Disabled'}\n`;
    
    if (groupByKeys && groupByKeys.length > 0) {
      result += `Grouped by: ${groupByKeys.join(', ')}\n`;
    }
    
    if (response.alertDef.createdTime) {
      result += `Created: ${new Date(response.alertDef.createdTime).toLocaleString()}\n`;
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to create metric threshold alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleCreateTracingAlert(client: any, args: any): Promise<string> {
  try {
    const {
      name,
      description,
      priority,
      alertType,
      applicationName,
      serviceName,
      operationName,
      latencyThresholdMs,
      spanAmountThreshold,
      timeWindow,
      groupByKeys,
      enabled = true,
      notificationEmails
    } = args;

    // Build tracing filter
    const tracingFilter: any = {
      simpleFilter: {
        tracingLabelFilters: {}
      }
    };

    if (applicationName) {
      tracingFilter.simpleFilter.tracingLabelFilters.applicationName = [{
        values: [applicationName],
        operation: 'TRACING_FILTER_OPERATION_TYPE_IS_OR_UNSPECIFIED'
      }];
    }

    if (serviceName) {
      tracingFilter.simpleFilter.tracingLabelFilters.serviceName = [{
        values: [serviceName],
        operation: 'TRACING_FILTER_OPERATION_TYPE_IS_OR_UNSPECIFIED'
      }];
    }

    if (operationName) {
      tracingFilter.simpleFilter.tracingLabelFilters.operationName = [{
        values: [operationName],
        operation: 'TRACING_FILTER_OPERATION_TYPE_IS_OR_UNSPECIFIED'
      }];
    }

    if (latencyThresholdMs) {
      tracingFilter.simpleFilter.latencyThresholdMs = latencyThresholdMs;
    }

    // Build notification group
    const notificationGroup: any = {};
    if (groupByKeys && groupByKeys.length > 0) {
      notificationGroup.groupByKeys = groupByKeys;
    }
    if (notificationEmails && notificationEmails.length > 0) {
      notificationGroup.webhooks = [{
        minutes: 15,
        notifyOn: 'NOTIFY_ON_TRIGGERED_ONLY_UNSPECIFIED',
        integration: {
          integrationId: 1, // Default integration
          recipients: {
            emails: notificationEmails
          }
        }
      }];
    }

    const alertDefProperties: any = {
      name,
      description,
      priority,
      type: alertType,
      enabled,
      ...(groupByKeys && { groupByKeys }),
      ...(Object.keys(notificationGroup).length > 0 && { notificationGroup })
    };

    // Add type-specific configuration
    if (alertType === 'ALERT_DEF_TYPE_TRACING_IMMEDIATE') {
      alertDefProperties.tracingImmediate = {
        tracingFilter
      };
    } else if (alertType === 'ALERT_DEF_TYPE_TRACING_THRESHOLD') {
      alertDefProperties.tracingThreshold = {
        tracingFilter,
        rules: [{
          condition: {
            spanAmount: spanAmountThreshold || 1,
            timeWindow: {
              tracingTimeWindowValue: timeWindow || 'TRACING_TIME_WINDOW_VALUE_MINUTES_5_OR_UNSPECIFIED'
            },
            conditionType: 'TRACING_THRESHOLD_CONDITION_TYPE_MORE_THAN_OR_UNSPECIFIED'
          }
        }]
      };
    }

    const request: CreateAlertDefRequest = {
      alertDefProperties
    };

    const response = await client.createAlertDef(request);
    
    let result = `✅ Advanced tracing alert created successfully!\n\n`;
    result += `Alert ID: ${response.alertDef.id}\n`;
    result += `Name: ${response.alertDef.alertDefProperties.name}\n`;
    result += `Type: ${getTypeLabel(alertType)}\n`;
    result += `Priority: ${getPriorityLabel(response.alertDef.alertDefProperties.priority)}\n`;
    
    if (applicationName) result += `Application: ${applicationName}\n`;
    if (serviceName) result += `Service: ${serviceName}\n`;
    if (operationName) result += `Operation: ${operationName}\n`;
    if (latencyThresholdMs) result += `Latency Threshold: ${latencyThresholdMs}ms\n`;
    if (spanAmountThreshold) result += `Span Threshold: ${spanAmountThreshold}\n`;
    if (timeWindow) result += `Time Window: ${timeWindow.replace('TRACING_TIME_WINDOW_VALUE_', '').toLowerCase().replace('_or_unspecified', '')}\n`;
    
    result += `Status: ${response.alertDef.alertDefProperties.enabled ? 'Enabled' : 'Disabled'}\n`;
    
    if (groupByKeys && groupByKeys.length > 0) {
      result += `Grouped by: ${groupByKeys.join(', ')}\n`;
    }
    
    if (response.alertDef.createdTime) {
      result += `Created: ${new Date(response.alertDef.createdTime).toLocaleString()}\n`;
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to create tracing alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleGetAlertEvents(client: any, args: any): Promise<string> {
  try {
    const { eventId, startTime, endTime, alertDefIds, priorities, status } = args;

    if (eventId) {
      // Get specific alert event
      const response = await client.getAlertEvent(eventId);
      const event = response.alertEvent;
      
      let result = `Alert Event Details\n`;
      result += '='.repeat(25) + '\n\n';
      result += `Event ID: ${event.id}\n`;
      result += `Alert Definition: ${event.alertDefName} (${event.alertDefId})\n`;
      result += `Priority: ${getPriorityLabel(event.alertDefPriority)}\n`;
      result += `Type: ${getTypeLabel(event.alertDefType)}\n`;
      result += `Status: ${event.status === 'TRIGGERED' ? '🔴 TRIGGERED' : '🟢 RESOLVED'}\n`;
      result += `Timestamp: ${new Date(event.timestamp).toLocaleString()}\n`;
      
      if (event.groupByValues && Object.keys(event.groupByValues).length > 0) {
        result += `Group By Values:\n`;
        Object.entries(event.groupByValues).forEach(([key, value]) => {
          result += `  ${key}: ${value}\n`;
        });
      }
      
      if (event.entityLabels && Object.keys(event.entityLabels).length > 0) {
        result += `Entity Labels:\n`;
        Object.entries(event.entityLabels).forEach(([key, value]) => {
          result += `  ${key}: ${value}\n`;
        });
      }
      
      return result;
    } else {
      // Get alert events statistics
      const params: any = {};
      if (startTime) params.startTime = startTime;
      if (endTime) params.endTime = endTime;
      if (alertDefIds) params.alertDefIds = alertDefIds;
      if (priorities) params.priorities = priorities;
      if (status) params.status = status;
      
      const response = await client.getAlertEventsStatistics(params);
      
      let result = `Alert Events Statistics\n`;
      result += '='.repeat(30) + '\n\n';
      result += `Total Events: ${response.totalCount}\n`;
      result += `🔴 Triggered: ${response.triggeredCount}\n`;
      result += `🟢 Resolved: ${response.resolvedCount}\n`;
      result += `Time Range: ${new Date(response.timeRange.startTime).toLocaleString()} - ${new Date(response.timeRange.endTime).toLocaleString()}\n`;
      
      return result;
    }
  } catch (error) {
    throw new Error(`Failed to get alert events: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleDownloadAlertsBackup(client: any): Promise<string> {
  try {
    const response = await client.downloadAlerts();
    
    let result = `✅ Alert definitions backup downloaded successfully!\n\n`;
    
    if (response.alertDefs && response.alertDefs.length > 0) {
      result += `Total Alert Definitions: ${response.alertDefs.length}\n\n`;
      result += `Summary by Type:\n`;
      
      const typeCount: Record<string, number> = {};
      response.alertDefs.forEach((alert: any) => {
        const type = getTypeLabel(alert.alertDefProperties.type);
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
      
      Object.entries(typeCount).forEach(([type, count]) => {
        result += `  ${type}: ${count}\n`;
      });
      
      result += `\nBackup includes full configuration for all alert definitions including:\n`;
      result += `- Alert filters and conditions\n`;
      result += `- Notification settings\n`;
      result += `- Time windows and thresholds\n`;
      result += `- Group by configurations\n`;
      result += `- Entity labels and metadata\n`;
    } else {
      result += `No alert definitions found to backup.\n`;
    }
    
    return result;
  } catch (error) {
    throw new Error(`Failed to download alerts backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleGetAlertByVersion(client: any, args: any): Promise<string> {
  try {
    const { versionId } = args;
    const response = await client.getAlertDefByVersionId(versionId);
    
    const alert = response.alertDef;
    const props = alert.alertDefProperties;
    
    let result = `Alert Definition (Version ${versionId})\n`;
    result += '='.repeat(40) + '\n\n';
    
    result += `Name: ${props.name}\n`;
    result += `Alert ID: ${alert.id}\n`;
    result += `Version ID: ${versionId}\n`;
    result += `Status: ${props.enabled ? '🟢 Enabled' : '🔴 Disabled'}\n`;
    result += `Priority: ${getPriorityLabel(props.priority)}\n`;
    result += `Type: ${getTypeLabel(props.type)}\n`;
    
    if (props.description) {
      result += `Description: ${props.description}\n`;
    }
    
    if (props.groupByKeys && props.groupByKeys.length > 0) {
      result += `Group By Keys: ${props.groupByKeys.join(', ')}\n`;
    }
    
    if (alert.createdTime) {
      result += `Created: ${new Date(alert.createdTime).toLocaleString()}\n`;
    }
    
    if (alert.updatedTime) {
      result += `Last Updated: ${new Date(alert.updatedTime).toLocaleString()}\n`;
    }
    
    if (alert.lastTriggeredTime) {
      result += `Last Triggered: ${new Date(alert.lastTriggeredTime).toLocaleString()}\n`;
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to get alert by version: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleSearchAlerts(client: any, args: any): Promise<string> {
  try {
    const {
      namePattern,
      nameMatchType = 'FILTER_MATCHER_CONTAINS',
      alertTypes,
      priorities,
      enabled,
      modifiedAfter,
      modifiedBefore,
      lastTriggeredAfter,
      lastTriggeredBefore,
      entityLabels,
      sloIds,
      pageSize = 200,
      pageToken
    } = args;

    // Build the filter request
    const request: any = {};
    
    if (Object.keys(args).length > 0) {
      request.queryFilter = {};
      
      // Name filter
      if (namePattern) {
        request.queryFilter.nameFilter = {
          name: [namePattern],
          matcher: nameMatchType
        };
      }
      
      // Type filter
      if (alertTypes && alertTypes.length > 0) {
        request.queryFilter.typeFilter = {
          type: alertTypes,
          matcher: 'FILTER_MATCHER_EQUALS'
        };
      }
      
      // Priority filter
      if (priorities && priorities.length > 0) {
        request.queryFilter.priorityFilter = {
          priority: priorities,
          matcher: 'FILTER_MATCHER_EQUALS'
        };
      }
      
      // Enabled filter
      if (enabled !== undefined) {
        request.queryFilter.enabledFilter = {
          enabled: enabled
        };
      }
      
      // Modified time range filter
      if (modifiedAfter || modifiedBefore) {
        request.queryFilter.modifiedTimeRangeFilter = {
          modifiedAtRange: {
            startTime: modifiedAfter || '2020-01-01T00:00:00Z',
            endTime: modifiedBefore || new Date().toISOString()
          }
        };
      }
      
      // Last triggered time range filter
      if (lastTriggeredAfter || lastTriggeredBefore) {
        request.queryFilter.lastTriggeredTimeRangeFilter = {
          lastTriggeredAtRange: {
            startTime: lastTriggeredAfter || '2020-01-01T00:00:00Z',
            endTime: lastTriggeredBefore || new Date().toISOString()
          }
        };
      }
      
      // Entity labels filter
      if (entityLabels) {
        request.queryFilter.entityLabelsFilter = {
          entityLabels: entityLabels,
          valuesOperator: 'FILTER_VALUES_OPERATOR_AND'
        };
      }
      
      // SLO filter
      if (sloIds && sloIds.length > 0) {
        request.queryFilter.typeSpecificFilter = {
          sloFilter: {
            sloId: sloIds,
            matcher: 'FILTER_MATCHER_EQUALS'
          }
        };
      }
    }
    
    // Pagination
    if (pageSize || pageToken) {
      request.pagination = {};
      if (pageSize) request.pagination.pageSize = pageSize;
      if (pageToken) request.pagination.pageToken = pageToken;
    }

    const response = await client.listAlertDefsWithFilter(request);
    
    let result = `🔍 Alert Search Results\n`;
    result += '='.repeat(30) + '\n\n';
    
    if (!response.alertDefs || response.alertDefs.length === 0) {
      result += 'No alerts found matching the search criteria.\n';
      return result;
    }
    
    result += `Found ${response.alertDefs.length} alerts`;
    if (response.pagination?.totalSize) {
      result += ` (${response.pagination.totalSize} total)`;
    }
    result += '\n\n';
    
    // Group by type for summary
    const typeCount: Record<string, number> = {};
    const priorityCount: Record<string, number> = {};
    const statusCount = { enabled: 0, disabled: 0 };
    
    response.alertDefs.forEach((alert: any) => {
      const type = getTypeLabel(alert.alertDefProperties.type);
      const priority = getPriorityLabel(alert.alertDefProperties.priority);
      
      typeCount[type] = (typeCount[type] || 0) + 1;
      priorityCount[priority] = (priorityCount[priority] || 0) + 1;
      
      if (alert.alertDefProperties.enabled) {
        statusCount.enabled++;
      } else {
        statusCount.disabled++;
      }
    });
    
    result += `Summary:\n`;
    result += `  🟢 Enabled: ${statusCount.enabled}\n`;
    result += `  🔴 Disabled: ${statusCount.disabled}\n\n`;
    
    result += `By Type:\n`;
    Object.entries(typeCount).forEach(([type, count]) => {
      result += `  ${type}: ${count}\n`;
    });
    result += '\n';
    
    result += `By Priority:\n`;
    Object.entries(priorityCount).forEach(([priority, count]) => {
      result += `  ${priority}: ${count}\n`;
    });
    result += '\n';
    
    // List individual alerts
    result += `Alert Details:\n`;
    result += '-'.repeat(20) + '\n';
    
    response.alertDefs.forEach((alert: any, index: number) => {
      const props = alert.alertDefProperties;
      result += `${index + 1}. ${props.name}\n`;
      result += `   ID: ${alert.id}\n`;
      result += `   Status: ${props.enabled ? '🟢 Enabled' : '🔴 Disabled'}\n`;
      result += `   Priority: ${getPriorityLabel(props.priority)}\n`;
      result += `   Type: ${getTypeLabel(props.type)}\n`;
      
      if (alert.createdTime) {
        result += `   Created: ${new Date(alert.createdTime).toLocaleString()}\n`;
      }
      
      if (alert.updatedTime) {
        result += `   Modified: ${new Date(alert.updatedTime).toLocaleString()}\n`;
      }
      
      if (alert.lastTriggeredTime) {
        result += `   Last Triggered: ${new Date(alert.lastTriggeredTime).toLocaleString()}\n`;
      }
      
      result += '\n';
    });
    
    // Pagination info
    if (response.pagination?.nextPageToken) {
      result += `\n📄 More results available. Use pageToken: "${response.pagination.nextPageToken}" to get next page.\n`;
    }
    
    return result;
  } catch (error) {
    throw new Error(`Failed to search alerts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleBulkManageAlerts(client: any, args: any): Promise<string> {
  try {
    const { operation, alertIds, searchCriteria, confirmOperation } = args;
    
    let targetAlerts: string[] = [];
    
    if (alertIds && alertIds.length > 0) {
      targetAlerts = alertIds;
    } else if (searchCriteria) {
      // Find alerts based on search criteria
      const searchRequest: any = {
        queryFilter: {}
      };
      
      if (searchCriteria.namePattern) {
        searchRequest.queryFilter.nameFilter = {
          name: [searchCriteria.namePattern],
          matcher: 'FILTER_MATCHER_CONTAINS'
        };
      }
      
      if (searchCriteria.alertTypes) {
        searchRequest.queryFilter.typeFilter = {
          type: searchCriteria.alertTypes,
          matcher: 'FILTER_MATCHER_EQUALS'
        };
      }
      
      if (searchCriteria.priorities) {
        searchRequest.queryFilter.priorityFilter = {
          priority: searchCriteria.priorities,
          matcher: 'FILTER_MATCHER_EQUALS'
        };
      }
      
      if (searchCriteria.enabled !== undefined) {
        searchRequest.queryFilter.enabledFilter = {
          enabled: searchCriteria.enabled
        };
      }
      
      const searchResponse = await client.listAlertDefsWithFilter(searchRequest);
      targetAlerts = searchResponse.alertDefs.map((alert: any) => alert.id);
    } else {
      throw new Error('Either alertIds or searchCriteria must be provided');
    }
    
    if (targetAlerts.length === 0) {
      return 'No alerts found to operate on.';
    }
    
    let result = `⚙️ Bulk Alert Management - ${operation.toUpperCase()}\n`;
    result += '='.repeat(40) + '\n\n';
    result += `Target alerts: ${targetAlerts.length}\n\n`;
    
    if (operation === 'delete' && !confirmOperation) {
      result += '⚠️ DELETE OPERATION REQUIRES CONFIRMATION\n';
      result += 'This operation will permanently delete the following alerts:\n\n';
      
      for (const alertId of targetAlerts) {
        try {
          const alertResponse = await client.getAlertDef(alertId);
          result += `- ${alertResponse.alertDef.alertDefProperties.name} (${alertId})\n`;
        } catch (error) {
          result += `- Alert ID: ${alertId} (unable to fetch name)\n`;
        }
      }
      
      result += '\nTo proceed, set confirmOperation: true\n';
      return result;
    }
    
    const results: { success: string[], failed: { id: string, error: string }[] } = {
      success: [],
      failed: []
    };
    
    for (const alertId of targetAlerts) {
      try {
        switch (operation) {
          case 'enable':
            await client.setAlertDefActive(alertId, true);
            results.success.push(alertId);
            break;
            
          case 'disable':
            await client.setAlertDefActive(alertId, false);
            results.success.push(alertId);
            break;
            
          case 'delete':
            await client.deleteAlertDef(alertId);
            results.success.push(alertId);
            break;
            
          case 'list_by_ids':
            const alertResponse = await client.getAlertDef(alertId);
            const alert = alertResponse.alertDef;
            result += `${alert.alertDefProperties.name} (${alertId})\n`;
            result += `  Status: ${alert.alertDefProperties.enabled ? '🟢 Enabled' : '🔴 Disabled'}\n`;
            result += `  Priority: ${getPriorityLabel(alert.alertDefProperties.priority)}\n`;
            result += `  Type: ${getTypeLabel(alert.alertDefProperties.type)}\n\n`;
            results.success.push(alertId);
            break;
            
          default:
            throw new Error(`Unknown operation: ${operation}`);
        }
      } catch (error) {
        results.failed.push({
          id: alertId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    if (operation !== 'list_by_ids') {
      result += `Results:\n`;
      result += `✅ Successful: ${results.success.length}\n`;
      result += `❌ Failed: ${results.failed.length}\n\n`;
      
      if (results.failed.length > 0) {
        result += `Failed Operations:\n`;
        results.failed.forEach(({ id, error }) => {
          result += `- ${id}: ${error}\n`;
        });
      }
    }
    
    return result;
  } catch (error) {
    throw new Error(`Failed to perform bulk operation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 