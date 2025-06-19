/**
 * Coralogix Dashboard Management Tools
 * Tools for managing dashboards, creating visualizations, and monitoring dashboard status
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCoralogixClient } from '../services/coralogix-client.js';
import { CreateDashboardRequest, Dashboard } from '../types/coralogix.js';

// Tool definitions
export const dashboardTools: Tool[] = [
  {
    name: 'list_dashboards',
    description: 'List all dashboards in your Coralogix account. Shows dashboard catalog with names, descriptions, and folder organization.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'create_dashboard',
    description: 'Create a new dashboard for monitoring and visualization. You can create basic dashboards and add widgets later through the UI.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the dashboard (e.g., "Application Performance", "Error Monitoring")'
        },
        description: {
          type: 'string',
          description: 'Description of what this dashboard monitors and displays'
        },
        folderId: {
          type: 'string',
          description: 'Optional folder ID to organize the dashboard'
        },
        relativeTimeFrame: {
          type: 'string',
          description: 'Default time frame for the dashboard (e.g., "1h", "24h", "7d")',
          default: '24h'
        },
        isLocked: {
          type: 'boolean',
          description: 'Whether the dashboard should be locked to prevent accidental changes',
          default: false
        }
      },
      required: ['name']
    }
  },
  {
    name: 'get_dashboard',
    description: 'Get detailed information about a specific dashboard by its ID, including layout, widgets, and configuration.',
    inputSchema: {
      type: 'object',
      properties: {
        dashboardId: {
          type: 'string',
          description: 'The unique identifier of the dashboard'
        }
      },
      required: ['dashboardId']
    }
  },
  {
    name: 'update_dashboard',
    description: 'Update an existing dashboard. You can modify the name, description, time frame, and other properties.',
    inputSchema: {
      type: 'object',
      properties: {
        dashboardId: {
          type: 'string',
          description: 'The unique identifier of the dashboard to update'
        },
        name: {
          type: 'string',
          description: 'Updated name of the dashboard'
        },
        description: {
          type: 'string',
          description: 'Updated description of the dashboard'
        },
        relativeTimeFrame: {
          type: 'string',
          description: 'Updated default time frame for the dashboard'
        },
        isLocked: {
          type: 'boolean',
          description: 'Whether the dashboard should be locked'
        }
      },
      required: ['dashboardId']
    }
  },
  {
    name: 'delete_dashboard',
    description: 'Delete a dashboard permanently. This action cannot be undone and will remove all widgets and configuration.',
    inputSchema: {
      type: 'object',
      properties: {
        dashboardId: {
          type: 'string',
          description: 'The unique identifier of the dashboard to delete'
        }
      },
      required: ['dashboardId']
    }
  }
];

// Tool handlers
export async function handleDashboardTool(name: string, args: any): Promise<string> {
  const client = getCoralogixClient();

  switch (name) {
    case 'list_dashboards':
      return await handleListDashboards(client);
    
    case 'create_dashboard':
      return await handleCreateDashboard(client, args);
    
    case 'get_dashboard':
      return await handleGetDashboard(client, args);
    
    case 'update_dashboard':
      return await handleUpdateDashboard(client, args);
    
    case 'delete_dashboard':
      return await handleDeleteDashboard(client, args);
    
    default:
      throw new Error(`Unknown dashboard tool: ${name}`);
  }
}

async function handleListDashboards(client: any): Promise<string> {
  try {
    const response = await client.getDashboardCatalog();
    
    if (!response.items || response.items.length === 0) {
      return 'No dashboards found in your Coralogix account.';
    }

    let result = `Dashboard Catalog (${response.items.length} found)\n`;
    result += '='.repeat(50) + '\n\n';

    // Group dashboards by folder
    const grouped = response.items.reduce((acc: any, dashboard: any) => {
      const folderId = dashboard.folderId || 'root';
      if (!acc[folderId]) {
        acc[folderId] = [];
      }
      acc[folderId].push(dashboard);
      return acc;
    }, {});

    Object.entries(grouped).forEach(([folderId, dashboards]: [string, any]) => {
      if (folderId === 'root') {
        result += `📁 Root Folder:\n`;
      } else {
        result += `📁 Folder ID: ${folderId}:\n`;
      }
      
      (dashboards as any[]).forEach((dashboard, index) => {
        const pinned = dashboard.isPinned ? '📌 ' : '';
        result += `  ${index + 1}. ${pinned}${dashboard.name}\n`;
        result += `     ID: ${dashboard.id}\n`;
        
        if (dashboard.description) {
          result += `     Description: ${dashboard.description}\n`;
        }
        
        result += `\n`;
      });
    });

    return result;
  } catch (error) {
    throw new Error(`Failed to list dashboards: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleCreateDashboard(client: any, args: any): Promise<string> {
  try {
    const { name, description, folderId, relativeTimeFrame = '24h', isLocked = false } = args;

    const dashboard: Dashboard = {
      name,
      description,
      relativeTimeFrame,
      layout: {
        sections: []  // Empty layout - user can add widgets later
      },
      variables: [],
      filters: [],
      annotations: []
    };

    if (folderId) {
      dashboard.folderId = { id: folderId };
    }

    const request: CreateDashboardRequest = {
      requestId: generateRequestId(),
      dashboard,
      isLocked
    };

    const response = await client.createDashboard(request);
    
    let result = `✅ Dashboard created successfully!\n\n`;
    result += `Dashboard ID: ${response.dashboardId}\n`;
    result += `Name: ${name}\n`;
    result += `Time Frame: ${relativeTimeFrame}\n`;
    result += `Locked: ${isLocked ? 'Yes' : 'No'}\n`;
    
    if (description) {
      result += `Description: ${description}\n`;
    }
    
    if (folderId) {
      result += `Folder ID: ${folderId}\n`;
    }

    result += `\n📝 Note: You can now add widgets and configure the dashboard through the Coralogix UI.`;

    return result;
  } catch (error) {
    throw new Error(`Failed to create dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleGetDashboard(client: any, args: any): Promise<string> {
  try {
    const { dashboardId } = args;
    const response = await client.getDashboard(dashboardId);
    
    const dashboard = response.dashboard;
    
    let result = `Dashboard Details\n`;
    result += '='.repeat(25) + '\n\n';
    
    result += `Name: ${dashboard.name}\n`;
    result += `ID: ${dashboard.id}\n`;
    
    if (dashboard.description) {
      result += `Description: ${dashboard.description}\n`;
    }
    
    if (dashboard.relativeTimeFrame) {
      result += `Time Frame: ${dashboard.relativeTimeFrame}\n`;
    }
    
    if (dashboard.folderId) {
      result += `Folder ID: ${dashboard.folderId}\n`;
    }
    
    result += `Locked: ${response.isLocked ? 'Yes' : 'No'}\n`;
    
    if (response.createdAt) {
      result += `Created: ${new Date(response.createdAt).toLocaleString()}\n`;
    }
    
    if (response.updatedAt) {
      result += `Last Updated: ${new Date(response.updatedAt).toLocaleString()}\n`;
    }
    
    if (response.authorName) {
      result += `Created By: ${response.authorName}\n`;
    }
    
    if (response.updaterName) {
      result += `Last Updated By: ${response.updaterName}\n`;
    }
    
    // Display widget count if layout exists
    if (dashboard.layout && dashboard.layout.sections) {
      let widgetCount = 0;
      if (Array.isArray(dashboard.layout.sections)) {
        dashboard.layout.sections.forEach((section: any) => {
          if (section.rows && Array.isArray(section.rows)) {
            section.rows.forEach((row: any) => {
              if (row.widgets && Array.isArray(row.widgets)) {
                widgetCount += row.widgets.length;
              }
            });
          }
        });
      }
      result += `Widgets: ${widgetCount}\n`;
    }
    
    // Display variables count
    if (dashboard.variables && Array.isArray(dashboard.variables)) {
      result += `Variables: ${dashboard.variables.length}\n`;
    }
    
    // Display filters count
    if (dashboard.filters && Array.isArray(dashboard.filters)) {
      result += `Filters: ${dashboard.filters.length}\n`;
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to get dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleUpdateDashboard(client: any, args: any): Promise<string> {
  try {
    const { dashboardId, ...updates } = args;
    
    // First get the current dashboard to merge with updates
    const currentDashboard = await client.getDashboard(dashboardId);
    const current = currentDashboard.dashboard;
    
    const updatedDashboard: Dashboard = {
      ...current,
      ...updates,
      id: dashboardId
    };
    
    const request: CreateDashboardRequest = {
      requestId: generateRequestId(),
      dashboard: updatedDashboard,
      isLocked: currentDashboard.isLocked
    };
    
    await client.updateDashboard(request);
    
    let result = `✅ Dashboard updated successfully!\n\n`;
    result += `Dashboard ID: ${dashboardId}\n`;
    result += `Name: ${updatedDashboard.name}\n`;
    
    if (updates.description) {
      result += `Description: ${updates.description}\n`;
    }
    
    if (updates.relativeTimeFrame) {
      result += `Time Frame: ${updates.relativeTimeFrame}\n`;
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to update dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleDeleteDashboard(client: any, args: any): Promise<string> {
  try {
    const { dashboardId } = args;
    
    // Get dashboard name before deleting for confirmation
    const dashboard = await client.getDashboard(dashboardId);
    const dashboardName = dashboard.dashboard.name;
    
    const requestId = generateRequestId();
    await client.deleteDashboard(dashboardId, requestId);
    
    return `✅ Dashboard "${dashboardName}" (ID: ${dashboardId}) has been deleted successfully.`;
  } catch (error) {
    throw new Error(`Failed to delete dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to generate request IDs
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
} 