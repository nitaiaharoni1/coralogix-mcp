/**
 * Coralogix Incident Management Tools
 * Tools for managing incidents, tracking incident status, and performing incident response actions
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCoralogixClient } from '../services/coralogix-client.js';
import { 
  ListIncidentsRequest, 
  IncidentQueryFilter, 
  IncidentState, 
  IncidentStatus, 
  IncidentSeverity,
  AcknowledgeIncidentsRequest 
} from '../types/coralogix.js';

// Tool definitions
export const incidentTools: Tool[] = [
  {
    name: 'list_incidents',
    description: 'List incidents with optional filtering by status, severity, assignee, time range, and other criteria.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['INCIDENT_STATUS_TRIGGERED', 'INCIDENT_STATUS_ACKNOWLEDGED', 'INCIDENT_STATUS_RESOLVED']
          },
          description: 'Filter by incident status'
        },
        state: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['INCIDENT_STATE_OPEN', 'INCIDENT_STATE_CLOSED']
          },
          description: 'Filter by incident state (open/closed)'
        },
        severity: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['INCIDENT_SEVERITY_INFO', 'INCIDENT_SEVERITY_WARNING', 'INCIDENT_SEVERITY_CRITICAL']
          },
          description: 'Filter by incident severity'
        },
        applicationName: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by application names'
        },
        subsystemName: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by subsystem names'
        },
        startTime: {
          type: 'string',
          description: 'Start time for incident search (ISO 8601 format)'
        },
        endTime: {
          type: 'string',
          description: 'End time for incident search (ISO 8601 format)'
        },
        isMuted: {
          type: 'boolean',
          description: 'Filter by muted status'
        },
        pageSize: {
          type: 'number',
          description: 'Number of incidents to return (default: 50, max: 100)',
          minimum: 1,
          maximum: 100,
          default: 50
        }
      },
      required: []
    }
  },
  {
    name: 'get_incident',
    description: 'Get detailed information about a specific incident by its ID.',
    inputSchema: {
      type: 'object',
      properties: {
        incidentId: {
          type: 'string',
          description: 'The unique identifier of the incident'
        }
      },
      required: ['incidentId']
    }
  },
  {
    name: 'acknowledge_incidents',
    description: 'Acknowledge one or more incidents to indicate they are being worked on.',
    inputSchema: {
      type: 'object',
      properties: {
        incidentIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of incident IDs to acknowledge'
        }
      },
      required: ['incidentIds']
    }
  },
  {
    name: 'resolve_incidents',
    description: 'Mark one or more incidents as resolved.',
    inputSchema: {
      type: 'object',
      properties: {
        incidentIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of incident IDs to resolve'
        }
      },
      required: ['incidentIds']
    }
  },
  {
    name: 'close_incidents',
    description: 'Close one or more incidents. This is typically done after incidents have been resolved.',
    inputSchema: {
      type: 'object',
      properties: {
        incidentIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of incident IDs to close'
        }
      },
      required: ['incidentIds']
    }
  }
];

// Tool handlers
export async function handleIncidentTool(name: string, args: any): Promise<string> {
  const client = getCoralogixClient();

  switch (name) {
    case 'list_incidents':
      return await handleListIncidents(client, args);
    
    case 'get_incident':
      return await handleGetIncident(client, args);
    
    case 'acknowledge_incidents':
      return await handleAcknowledgeIncidents(client, args);
    
    case 'resolve_incidents':
      return await handleResolveIncidents(client, args);
    
    case 'close_incidents':
      return await handleCloseIncidents(client, args);
    
    default:
      throw new Error(`Unknown incident tool: ${name}`);
  }
}

async function handleListIncidents(client: any, args: any): Promise<string> {
  try {
    const { 
      status, 
      state, 
      severity, 
      applicationName, 
      subsystemName, 
      startTime, 
      endTime, 
      isMuted, 
      pageSize = 50 
    } = args;

    const filter: IncidentQueryFilter = {};
    
    if (status && status.length > 0) {
      filter.status = status as IncidentStatus[];
    }
    
    if (state && state.length > 0) {
      filter.state = state as IncidentState[];
    }
    
    if (severity && severity.length > 0) {
      filter.severity = severity as IncidentSeverity[];
    }
    
    if (applicationName && applicationName.length > 0) {
      filter.applicationName = applicationName;
    }
    
    if (subsystemName && subsystemName.length > 0) {
      filter.subsystemName = subsystemName;
    }
    
    if (startTime) {
      filter.startTime = startTime;
    }
    
    if (endTime) {
      filter.endTime = endTime;
    }
    
    if (typeof isMuted === 'boolean') {
      filter.isMuted = isMuted;
    }

    const request: ListIncidentsRequest = {
      filter,
      pagination: {
        pageSize
      }
    };

    const response = await client.listIncidents(request);
    
    if (!response.incidents || response.incidents.length === 0) {
      return 'No incidents found matching the specified criteria.';
    }

    let result = `Incidents (${response.incidents.length} found`;
    if (response.pagination?.totalSize) {
      result += ` of ${response.pagination.totalSize} total`;
    }
    result += ')\n';
    result += '='.repeat(50) + '\n\n';

    response.incidents.forEach((incident: any, index: number) => {
      const severityIcon = getSeverityIcon(incident.severity);
      const statusLabel = getStatusLabel(incident.status);
      const stateLabel = getStateLabel(incident.state);
      
      result += `${index + 1}. ${severityIcon} ${incident.name}\n`;
      result += `   ID: ${incident.id}\n`;
      result += `   Status: ${statusLabel}\n`;
      result += `   State: ${stateLabel}\n`;
      result += `   Severity: ${getSeverityLabel(incident.severity)}\n`;
      
      if (incident.description) {
        result += `   Description: ${incident.description}\n`;
      }
      
      if (incident.assignments && incident.assignments.length > 0) {
        result += `   Assigned to: ${incident.assignments.length} user(s)\n`;
      }
      
      if (incident.contextualLabels && Object.keys(incident.contextualLabels).length > 0) {
        result += `   Labels: ${Object.entries(incident.contextualLabels).map(([k, v]) => `${k}=${v}`).join(', ')}\n`;
      }
      
      if (incident.createdAt) {
        result += `   Created: ${new Date(incident.createdAt).toLocaleString()}\n`;
      }
      
      if (incident.duration) {
        result += `   Duration: ${incident.duration}\n`;
      }
      
      if (incident.isMuted) {
        result += `   🔇 Muted\n`;
      }
      
      result += `\n`;
    });

    if (response.pagination?.nextPageToken) {
      result += `\n📄 More incidents available. Use pagination to see additional results.`;
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to list incidents: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleGetIncident(client: any, args: any): Promise<string> {
  try {
    const { incidentId } = args;
    const response = await client.getIncident(incidentId);
    
    const incident = response.incident;
    
    let result = `Incident Details\n`;
    result += '='.repeat(25) + '\n\n';
    
    const severityIcon = getSeverityIcon(incident.severity);
    result += `${severityIcon} ${incident.name}\n\n`;
    
    result += `ID: ${incident.id}\n`;
    result += `Status: ${getStatusLabel(incident.status)}\n`;
    result += `State: ${getStateLabel(incident.state)}\n`;
    result += `Severity: ${getSeverityLabel(incident.severity)}\n`;
    
    if (incident.description) {
      result += `Description: ${incident.description}\n`;
    }
    
    if (incident.assignments && incident.assignments.length > 0) {
      result += `\nAssignments:\n`;
      incident.assignments.forEach((assignment: any, index: number) => {
        result += `  ${index + 1}. ${assignment.userId || assignment.email || 'Unknown user'}\n`;
      });
    }
    
    if (incident.contextualLabels && Object.keys(incident.contextualLabels).length > 0) {
      result += `\nContextual Labels:\n`;
      Object.entries(incident.contextualLabels).forEach(([key, value]) => {
        result += `  ${key}: ${value}\n`;
      });
    }
    
    if (incident.displayLabels && Object.keys(incident.displayLabels).length > 0) {
      result += `\nDisplay Labels:\n`;
      Object.entries(incident.displayLabels).forEach(([key, value]) => {
        result += `  ${key}: ${value}\n`;
      });
    }
    
    if (incident.metaLabels && incident.metaLabels.length > 0) {
      result += `\nMeta Labels: ${incident.metaLabels.join(', ')}\n`;
    }
    
    if (incident.createdAt) {
      result += `\nCreated: ${new Date(incident.createdAt).toLocaleString()}\n`;
    }
    
    if (incident.closedAt) {
      result += `Closed: ${new Date(incident.closedAt).toLocaleString()}\n`;
    }
    
    if (incident.lastStateUpdateTime) {
      result += `Last Update: ${new Date(incident.lastStateUpdateTime).toLocaleString()}\n`;
    }
    
    if (incident.duration) {
      result += `Duration: ${incident.duration}\n`;
    }
    
    if (incident.isMuted) {
      result += `\n🔇 This incident is muted\n`;
    }
    
    if (incident.events && incident.events.length > 0) {
      result += `\nEvents: ${incident.events.length} event(s) associated\n`;
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to get incident: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleAcknowledgeIncidents(client: any, args: any): Promise<string> {
  try {
    const { incidentIds } = args;
    
    const request: AcknowledgeIncidentsRequest = {
      incidentIds
    };
    
    const response = await client.acknowledgeIncidents(request);
    
    let result = `✅ Successfully acknowledged ${incidentIds.length} incident(s)\n\n`;
    
    response.incidents.forEach((incident: any, index: number) => {
      result += `${index + 1}. ${incident.name} (${incident.id})\n`;
      result += `   Status: ${getStatusLabel(incident.status)}\n`;
    });

    return result;
  } catch (error) {
    throw new Error(`Failed to acknowledge incidents: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleResolveIncidents(client: any, args: any): Promise<string> {
  try {
    const { incidentIds } = args;
    
    const request = { incidentIds };
    const response = await client.resolveIncidents(request);
    
    let result = `✅ Successfully resolved ${incidentIds.length} incident(s)\n\n`;
    
    response.incidents.forEach((incident: any, index: number) => {
      result += `${index + 1}. ${incident.name} (${incident.id})\n`;
      result += `   Status: ${getStatusLabel(incident.status)}\n`;
    });

    return result;
  } catch (error) {
    throw new Error(`Failed to resolve incidents: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleCloseIncidents(client: any, args: any): Promise<string> {
  try {
    const { incidentIds } = args;
    
    const request = { incidentIds };
    const response = await client.closeIncidents(request);
    
    let result = `✅ Successfully closed ${incidentIds.length} incident(s)\n\n`;
    
    response.incidents.forEach((incident: any, index: number) => {
      result += `${index + 1}. ${incident.name} (${incident.id})\n`;
      result += `   State: ${getStateLabel(incident.state)}\n`;
    });

    return result;
  } catch (error) {
    throw new Error(`Failed to close incidents: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper functions
function getSeverityIcon(severity: string): string {
  const severityIcons: Record<string, string> = {
    'INCIDENT_SEVERITY_CRITICAL': '🔴',
    'INCIDENT_SEVERITY_WARNING': '🟡',
    'INCIDENT_SEVERITY_INFO': '🔵',
    'INCIDENT_SEVERITY_UNSPECIFIED': '⚪'
  };
  return severityIcons[severity] || '⚪';
}

function getSeverityLabel(severity: string): string {
  const severityLabels: Record<string, string> = {
    'INCIDENT_SEVERITY_CRITICAL': 'Critical',
    'INCIDENT_SEVERITY_WARNING': 'Warning',
    'INCIDENT_SEVERITY_INFO': 'Info',
    'INCIDENT_SEVERITY_UNSPECIFIED': 'Unspecified'
  };
  return severityLabels[severity] || severity;
}

function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    'INCIDENT_STATUS_TRIGGERED': '🔥 Triggered',
    'INCIDENT_STATUS_ACKNOWLEDGED': '👁️ Acknowledged',
    'INCIDENT_STATUS_RESOLVED': '✅ Resolved',
    'INCIDENT_STATUS_UNSPECIFIED': 'Unspecified'
  };
  return statusLabels[status] || status;
}

function getStateLabel(state: string): string {
  const stateLabels: Record<string, string> = {
    'INCIDENT_STATE_OPEN': '🔓 Open',
    'INCIDENT_STATE_CLOSED': '🔒 Closed',
    'INCIDENT_STATE_UNSPECIFIED': 'Unspecified'
  };
  return stateLabels[state] || state;
} 