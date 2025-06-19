/**
 * Coralogix SLO (Service Level Objective) Management Tools
 * Tools for managing SLOs, tracking service performance, and monitoring reliability targets
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCoralogixClient } from '../services/coralogix-client.js';
import { CreateSloRequest, SloTimeFrame } from '../types/coralogix.js';

// Tool definitions
export const sloTools: Tool[] = [
  {
    name: 'list_slos',
    description: 'List all Service Level Objectives (SLOs) in your Coralogix account. Shows SLO targets, time frames, and current performance.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'create_slo',
    description: 'Create a new Service Level Objective to track service reliability and performance targets.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the SLO (e.g., "API Response Time SLO", "Service Availability SLO")'
        },
        description: {
          type: 'string',
          description: 'Description of what this SLO measures and its business importance'
        },
        targetThresholdPercentage: {
          type: 'number',
          description: 'Target percentage for the SLO (e.g., 99.9 for 99.9% availability)',
          minimum: 0,
          maximum: 100
        },
        sloTimeFrame: {
          type: 'string',
          enum: ['SLO_TIME_FRAME_7_DAYS', 'SLO_TIME_FRAME_14_DAYS', 'SLO_TIME_FRAME_21_DAYS', 'SLO_TIME_FRAME_28_DAYS'],
          description: 'Time frame for SLO evaluation',
          default: 'SLO_TIME_FRAME_28_DAYS'
        },
        creator: {
          type: 'string',
          description: 'Email or name of the SLO creator/owner'
        },
        labels: {
          type: 'object',
          description: 'Key-value pairs for labeling and categorizing the SLO'
        }
      },
      required: ['name', 'targetThresholdPercentage']
    }
  },
  {
    name: 'get_slo',
    description: 'Get detailed information about a specific SLO by its ID, including current performance and targets.',
    inputSchema: {
      type: 'object',
      properties: {
        sloId: {
          type: 'string',
          description: 'The unique identifier of the SLO'
        }
      },
      required: ['sloId']
    }
  },
  {
    name: 'update_slo',
    description: 'Update an existing SLO. You can modify the target threshold, time frame, description, and other properties.',
    inputSchema: {
      type: 'object',
      properties: {
        sloId: {
          type: 'string',
          description: 'The unique identifier of the SLO to update'
        },
        name: {
          type: 'string',
          description: 'Updated name of the SLO'
        },
        description: {
          type: 'string',
          description: 'Updated description of the SLO'
        },
        targetThresholdPercentage: {
          type: 'number',
          description: 'Updated target percentage for the SLO',
          minimum: 0,
          maximum: 100
        },
        sloTimeFrame: {
          type: 'string',
          enum: ['SLO_TIME_FRAME_7_DAYS', 'SLO_TIME_FRAME_14_DAYS', 'SLO_TIME_FRAME_21_DAYS', 'SLO_TIME_FRAME_28_DAYS'],
          description: 'Updated time frame for SLO evaluation'
        },
        labels: {
          type: 'object',
          description: 'Updated key-value pairs for labeling and categorizing the SLO'
        }
      },
      required: ['sloId']
    }
  },
  {
    name: 'delete_slo',
    description: 'Delete an SLO permanently. This action cannot be undone and will remove all historical data.',
    inputSchema: {
      type: 'object',
      properties: {
        sloId: {
          type: 'string',
          description: 'The unique identifier of the SLO to delete'
        }
      },
      required: ['sloId']
    }
  }
];

// Tool handlers
export async function handleSloTool(name: string, args: any): Promise<string> {
  const client = getCoralogixClient();

  switch (name) {
    case 'list_slos':
      return await handleListSlos(client);
    
    case 'create_slo':
      return await handleCreateSlo(client, args);
    
    case 'get_slo':
      return await handleGetSlo(client, args);
    
    case 'update_slo':
      return await handleUpdateSlo(client, args);
    
    case 'delete_slo':
      return await handleDeleteSlo(client, args);
    
    default:
      throw new Error(`Unknown SLO tool: ${name}`);
  }
}

async function handleListSlos(client: any): Promise<string> {
  try {
    const response = await client.listSlos();
    
    if (!response.slos || response.slos.length === 0) {
      return 'No SLOs found in your Coralogix account.';
    }

    let result = `Service Level Objectives (${response.slos.length} found)\n`;
    result += '='.repeat(50) + '\n\n';

    response.slos.forEach((slo: any, index: number) => {
      const timeFrameLabel = getTimeFrameLabel(slo.sloTimeFrame);
      
      result += `${index + 1}. ${slo.name}\n`;
      result += `   ID: ${slo.id}\n`;
      result += `   Target: ${slo.targetThresholdPercentage}%\n`;
      result += `   Time Frame: ${timeFrameLabel}\n`;
      
      if (slo.description) {
        result += `   Description: ${slo.description}\n`;
      }
      
      if (slo.creator) {
        result += `   Creator: ${slo.creator}\n`;
      }
      
      if (slo.labels && Object.keys(slo.labels).length > 0) {
        result += `   Labels: ${Object.entries(slo.labels).map(([k, v]) => `${k}=${v}`).join(', ')}\n`;
      }
      
      if (slo.createTime) {
        result += `   Created: ${new Date(slo.createTime).toLocaleString()}\n`;
      }
      
      if (slo.updateTime) {
        result += `   Updated: ${new Date(slo.updateTime).toLocaleString()}\n`;
      }
      
      result += `\n`;
    });

    return result;
  } catch (error) {
    throw new Error(`Failed to list SLOs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleCreateSlo(client: any, args: any): Promise<string> {
  try {
    const { 
      name, 
      description, 
      targetThresholdPercentage, 
      sloTimeFrame = 'SLO_TIME_FRAME_28_DAYS', 
      creator, 
      labels 
    } = args;

    const request: CreateSloRequest = {
      name,
      targetThresholdPercentage,
      sloTimeFrame: sloTimeFrame as SloTimeFrame,
      ...(description && { description }),
      ...(creator && { creator }),
      ...(labels && { labels })
    };

    const response = await client.createSlo(request);
    
    let result = `✅ SLO created successfully!\n\n`;
    result += `SLO ID: ${response.slo.id}\n`;
    result += `Name: ${response.slo.name}\n`;
    result += `Target: ${response.slo.targetThresholdPercentage}%\n`;
    result += `Time Frame: ${getTimeFrameLabel(response.slo.sloTimeFrame)}\n`;
    
    if (response.slo.description) {
      result += `Description: ${response.slo.description}\n`;
    }
    
    if (response.slo.creator) {
      result += `Creator: ${response.slo.creator}\n`;
    }
    
    if (response.slo.createTime) {
      result += `Created: ${new Date(response.slo.createTime).toLocaleString()}\n`;
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to create SLO: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleGetSlo(client: any, args: any): Promise<string> {
  try {
    const { sloId } = args;
    const response = await client.getSlo(sloId);
    
    const slo = response.slo;
    
    let result = `SLO Details\n`;
    result += '='.repeat(20) + '\n\n';
    
    result += `Name: ${slo.name}\n`;
    result += `ID: ${slo.id}\n`;
    result += `Target: ${slo.targetThresholdPercentage}%\n`;
    result += `Time Frame: ${getTimeFrameLabel(slo.sloTimeFrame)}\n`;
    
    if (slo.description) {
      result += `Description: ${slo.description}\n`;
    }
    
    if (slo.creator) {
      result += `Creator: ${slo.creator}\n`;
    }
    
    if (slo.labels && Object.keys(slo.labels).length > 0) {
      result += `\nLabels:\n`;
      Object.entries(slo.labels).forEach(([key, value]) => {
        result += `  ${key}: ${value}\n`;
      });
    }
    
    if (slo.createTime) {
      result += `\nCreated: ${new Date(slo.createTime).toLocaleString()}\n`;
    }
    
    if (slo.updateTime) {
      result += `Last Updated: ${new Date(slo.updateTime).toLocaleString()}\n`;
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to get SLO: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleUpdateSlo(client: any, args: any): Promise<string> {
  try {
    const { sloId, ...updates } = args;
    
    // First get the current SLO to merge with updates
    const currentSlo = await client.getSlo(sloId);
    const current = currentSlo.slo;
    
    const updatedSlo = {
      ...current,
      ...updates,
      id: sloId
    };
    
    const response = await client.updateSlo(updatedSlo);
    
    let result = `✅ SLO updated successfully!\n\n`;
    result += `SLO ID: ${response.slo.id}\n`;
    result += `Name: ${response.slo.name}\n`;
    result += `Target: ${response.slo.targetThresholdPercentage}%\n`;
    result += `Time Frame: ${getTimeFrameLabel(response.slo.sloTimeFrame)}\n`;
    
    if (response.slo.updateTime) {
      result += `Updated: ${new Date(response.slo.updateTime).toLocaleString()}\n`;
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to update SLO: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleDeleteSlo(client: any, args: any): Promise<string> {
  try {
    const { sloId } = args;
    
    // Get SLO name before deleting for confirmation
    const slo = await client.getSlo(sloId);
    const sloName = slo.slo.name;
    
    await client.deleteSlo(sloId);
    
    return `✅ SLO "${sloName}" (ID: ${sloId}) has been deleted successfully.`;
  } catch (error) {
    throw new Error(`Failed to delete SLO: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function
function getTimeFrameLabel(timeFrame?: string): string {
  const timeFrameLabels: Record<string, string> = {
    'SLO_TIME_FRAME_7_DAYS': '7 days',
    'SLO_TIME_FRAME_14_DAYS': '14 days',
    'SLO_TIME_FRAME_21_DAYS': '21 days',
    'SLO_TIME_FRAME_28_DAYS': '28 days',
    'SLO_TIME_FRAME_UNSPECIFIED': 'Unspecified'
  };
  return timeFrameLabels[timeFrame || ''] || timeFrame || 'Unknown';
} 