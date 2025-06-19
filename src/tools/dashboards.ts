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
    name: 'get_dashboard_catalog',
    description: 'List all dashboards in your Coralogix account with metadata. Use this to: discover available dashboards, find dashboards by name or folder, get dashboard IDs for detailed access, and understand your dashboard organization. Returns dashboard names, IDs, folder structure, creation dates, and access permissions.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_dashboard',
    description: 'Get detailed configuration and layout of a specific dashboard by ID. Use this to: examine dashboard widgets and visualizations, understand data sources and queries, review dashboard layout and settings, and analyze dashboard structure. Returns complete dashboard definition including all widgets, queries, and configuration.',
    inputSchema: {
      type: 'object',
      properties: {
        dashboardId: {
          type: 'string',
          description: 'The unique identifier of the dashboard to retrieve. Get this from get_dashboard_catalog.'
        }
      },
      required: ['dashboardId']
    }
  },
  {
    name: 'create_dashboard',
    description: 'Create a new dashboard with custom widgets and visualizations. Use this to: build monitoring dashboards, create executive reports, set up operational views, and design custom analytics displays. Supports various widget types including charts, tables, logs, metrics, and traces.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'A descriptive name for the dashboard (e.g., "Application Performance Overview", "Error Analysis Dashboard")'
        },
        description: {
          type: 'string',
          description: 'Detailed description of the dashboard purpose and contents'
        },
        layout: {
          type: 'object',
          description: 'Dashboard layout configuration including sections, widget positions, and responsive settings'
        },
        variables: {
          type: 'array',
          description: 'Dashboard variables for dynamic filtering (e.g., time range, application name, environment)'
        },
        filters: {
          type: 'object',
          description: 'Global dashboard filters that apply to all widgets'
        },
        widgets: {
          type: 'array',
          description: 'Array of widget configurations including charts, tables, logs panels, and metric displays'
        },
        folder: {
          type: 'object',
          description: 'Folder organization settings to categorize the dashboard'
        }
      },
      required: ['name']
    }
  },
  {
    name: 'update_dashboard',
    description: 'Update an existing dashboard configuration, widgets, or layout. Use this to: modify dashboard content, add or remove widgets, update queries and filters, change layout and styling, and maintain dashboard accuracy. Requires complete dashboard configuration.',
    inputSchema: {
      type: 'object',
      properties: {
        dashboardId: {
          type: 'string',
          description: 'The unique identifier of the dashboard to update'
        },
        dashboard: {
          type: 'object',
          description: 'Complete dashboard configuration with all properties. Use get_dashboard first to get current config, then modify as needed.'
        }
      },
      required: ['dashboardId', 'dashboard']
    }
  },
  {
    name: 'delete_dashboard',
    description: 'Permanently delete a dashboard from your account. Use this to: remove obsolete dashboards, clean up unused visualizations, and manage dashboard lifecycle. This action cannot be undone and will remove all dashboard configuration and history.',
    inputSchema: {
      type: 'object',
      properties: {
        dashboardId: {
          type: 'string',
          description: 'The unique identifier of the dashboard to delete. Get this from get_dashboard_catalog.'
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
    case 'get_dashboard_catalog':
      return await handleGetDashboardCatalog(client);
    
    case 'get_dashboard':
      return await handleGetDashboard(client, args);
    
    case 'create_dashboard':
      return await handleCreateDashboard(client, args);
    
    case 'update_dashboard':
      return await handleUpdateDashboard(client, args);
    
    case 'delete_dashboard':
      return await handleDeleteDashboard(client, args);
    
    default:
      throw new Error(`Unknown dashboard tool: ${name}`);
  }
}

async function handleGetDashboardCatalog(client: any): Promise<string> {
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

async function handleCreateDashboard(client: any, args: any): Promise<string> {
  try {
    const { name, description, layout, variables, filters, widgets, folder } = args;

    const dashboard: Dashboard = {
      name,
      description: description || '',
      relativeTimeFrame: '24h',
      layout: layout || {
        sections: []  // Empty layout - user can add widgets later
      },
      variables: variables || [],
      filters: filters || [],
      annotations: []
    };

    if (folder) {
      dashboard.folderId = { id: folder.id };
    }

    const request: CreateDashboardRequest = {
      requestId: generateRequestId(),
      dashboard,
      isLocked: false
    };

    const response = await client.createDashboard(request);
    
    let result = `✅ Dashboard created successfully!\n\n`;
    result += `Dashboard ID: ${response.dashboardId}\n`;
    result += `Name: ${name}\n`;
    result += `Time Frame: ${dashboard.relativeTimeFrame}\n`;
    result += `Locked: No\n`;
    
    if (description) {
      result += `Description: ${description}\n`;
    }
    
    if (folder) {
      result += `Folder ID: ${folder.id}\n`;
    }

    result += `\n📝 Note: You can now add widgets and configure the dashboard through the Coralogix UI.`;

    return result;
  } catch (error) {
    throw new Error(`Failed to create dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleUpdateDashboard(client: any, args: any): Promise<string> {
  try {
    const { dashboardId, dashboard } = args;
    
    // First get the current dashboard to merge with updates
    const currentDashboard = await client.getDashboard(dashboardId);
    const current = currentDashboard.dashboard;
    
    const updatedDashboard: Dashboard = {
      ...current,
      ...dashboard,
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
    
    if (updatedDashboard.description) {
      result += `Description: ${updatedDashboard.description}\n`;
    }
    
    if (updatedDashboard.relativeTimeFrame) {
      result += `Time Frame: ${updatedDashboard.relativeTimeFrame}\n`;
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