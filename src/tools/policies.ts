import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CoralogixClient } from '../services/coralogix-client.js';

/**
 * List policies
 */
export const listPoliciesTools: Tool = {
  name: 'list_policies',
  description: 'List TCO policies for cost management and data routing control',
  inputSchema: {
    type: 'object',
    properties: {
      enabledOnly: {
        type: 'boolean',
        description: 'Whether to return only enabled policies',
        default: false
      },
      sourceType: {
        type: 'string',
        enum: ['SOURCE_TYPE_LOGS', 'SOURCE_TYPE_SPANS'],
        description: 'Type of data source for policies',
        default: 'SOURCE_TYPE_LOGS'
      }
    }
  }
};

/**
 * Create policy
 */
export const createPolicyTool: Tool = {
  name: 'create_policy',
  description: 'Create a new TCO policy for cost management and data routing',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name of the policy'
      },
      description: {
        type: 'string',
        description: 'Description of the policy'
      },
      priority: {
        type: 'string',
        enum: ['PRIORITY_TYPE_BLOCK', 'PRIORITY_TYPE_LOW', 'PRIORITY_TYPE_MEDIUM', 'PRIORITY_TYPE_HIGH'],
        description: 'Priority level of the policy'
      },
      applicationRule: {
        type: 'object',
        properties: {
          ruleTypeId: {
            type: 'string',
            description: 'Type of application rule'
          },
          name: {
            type: 'string',
            description: 'Application name or pattern'
          }
        },
        description: 'Application filtering rule'
      },
      subsystemRule: {
        type: 'object',
        properties: {
          ruleTypeId: {
            type: 'string',
            description: 'Type of subsystem rule'
          },
          name: {
            type: 'string',
            description: 'Subsystem name or pattern'
          }
        },
        description: 'Subsystem filtering rule'
      },
      logRules: {
        type: 'object',
        properties: {
          severities: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Log severities to apply policy to'
          }
        },
        description: 'Log-specific rules'
      }
    },
    required: ['name', 'priority']
  }
};

/**
 * Update policy
 */
export const updatePolicyTool: Tool = {
  name: 'update_policy',
  description: 'Update an existing TCO policy',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'ID of the policy to update'
      },
      name: {
        type: 'string',
        description: 'New name of the policy'
      },
      description: {
        type: 'string',
        description: 'New description of the policy'
      },
      priority: {
        type: 'string',
        enum: ['PRIORITY_TYPE_BLOCK', 'PRIORITY_TYPE_LOW', 'PRIORITY_TYPE_MEDIUM', 'PRIORITY_TYPE_HIGH'],
        description: 'New priority level of the policy'
      },
      enabled: {
        type: 'boolean',
        description: 'Whether the policy should be enabled'
      },
      applicationRule: {
        type: 'object',
        properties: {
          ruleTypeId: {
            type: 'string',
            description: 'Type of application rule'
          },
          name: {
            type: 'string',
            description: 'Application name or pattern'
          }
        },
        description: 'Application filtering rule'
      },
      subsystemRule: {
        type: 'object',
        properties: {
          ruleTypeId: {
            type: 'string',
            description: 'Type of subsystem rule'
          },
          name: {
            type: 'string',
            description: 'Subsystem name or pattern'
          }
        },
        description: 'Subsystem filtering rule'
      },
      logRules: {
        type: 'object',
        properties: {
          severities: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Log severities to apply policy to'
          }
        },
        description: 'Log-specific rules'
      }
    },
    required: ['id']
  }
};

/**
 * Get policy
 */
export const getPolicyTool: Tool = {
  name: 'get_policy',
  description: 'Get details of a specific TCO policy by ID',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'ID of the policy to retrieve'
      }
    },
    required: ['id']
  }
};

/**
 * Delete policy
 */
export const deletePolicyTool: Tool = {
  name: 'delete_policy',
  description: 'Delete a TCO policy',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'ID of the policy to delete'
      }
    },
    required: ['id']
  }
};

/**
 * Toggle policy
 */
export const togglePolicyTool: Tool = {
  name: 'toggle_policy',
  description: 'Enable or disable a TCO policy',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'ID of the policy to toggle'
      },
      enabled: {
        type: 'boolean',
        description: 'Whether to enable or disable the policy'
      }
    },
    required: ['id', 'enabled']
  }
};

/**
 * Reorder policies
 */
export const reorderPoliciesTool: Tool = {
  name: 'reorder_policies',
  description: 'Reorder TCO policies to change their execution priority',
  inputSchema: {
    type: 'object',
    properties: {
      orders: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Policy ID'
            },
            order: {
              type: 'number',
              description: 'New order position (lower numbers = higher priority)'
            }
          },
          required: ['id', 'order']
        },
        description: 'Array of policy IDs with their new order positions'
      },
      sourceType: {
        type: 'string',
        enum: ['SOURCE_TYPE_LOGS', 'SOURCE_TYPE_SPANS'],
        description: 'Type of data source for policies',
        default: 'SOURCE_TYPE_LOGS'
      }
    },
    required: ['orders']
  }
};

/**
 * Handle policies tool calls
 */
export async function handlePoliciesTools(
  name: string,
  args: any,
  client: CoralogixClient
): Promise<string> {
  try {
    switch (name) {
      case 'list_policies': {
        const response = await client.getPolicies(args.enabledOnly || false, args.sourceType || 'SOURCE_TYPE_LOGS');
        
        const total = response.policies?.length || 0;
        const enabled = response.policies?.filter((p: any) => p.enabled).length || 0;
        const disabled = response.policies?.filter((p: any) => !p.enabled).length || 0;
        const byPriority = {
          block: response.policies?.filter((p: any) => p.priority === 'PRIORITY_TYPE_BLOCK').length || 0,
          high: response.policies?.filter((p: any) => p.priority === 'PRIORITY_TYPE_HIGH').length || 0,
          medium: response.policies?.filter((p: any) => p.priority === 'PRIORITY_TYPE_MEDIUM').length || 0,
          low: response.policies?.filter((p: any) => p.priority === 'PRIORITY_TYPE_LOW').length || 0
        };
        
        let result = `TCO Policies List\n`;
        result += `=================\n\n`;
        result += `📋 Total Policies: ${total}\n`;
        result += `🟢 Enabled: ${enabled}\n`;
        result += `🔴 Disabled: ${disabled}\n`;
        result += `📊 Source Type: ${args.sourceType || 'SOURCE_TYPE_LOGS'}\n\n`;
        
        result += `Priority Breakdown:\n`;
        result += `===================\n`;
        result += `🚫 Block: ${byPriority.block}\n`;
        result += `🔴 High: ${byPriority.high}\n`;
        result += `🟡 Medium: ${byPriority.medium}\n`;
        result += `🟢 Low: ${byPriority.low}\n\n`;

        if (response.policies && response.policies.length > 0) {
          result += `Policy Details:\n`;
          result += `===============\n`;
          response.policies.forEach((policy: any, index: number) => {
            const statusIcon = policy.enabled ? '🟢' : '🔴';
            const priorityLabel = policy.priority?.replace('PRIORITY_TYPE_', '').toLowerCase() || 'unknown';
            
            result += `${index + 1}. ${statusIcon} ${policy.name}\n`;
            result += `   ID: ${policy.id}\n`;
            result += `   Priority: ${priorityLabel}\n`;
            result += `   Order: ${policy.order}\n`;
            if (policy.description) result += `   Description: ${policy.description}\n`;
            if (policy.applicationRule?.name) result += `   App Rule: ${policy.applicationRule.name}\n`;
            if (policy.subsystemRule?.name) result += `   Subsystem Rule: ${policy.subsystemRule.name}\n`;
            result += `\n`;
          });
        }

        return result;
      }

      case 'create_policy': {
        const policyData = {
          name: args.name,
          description: args.description,
          priority: args.priority,
          applicationRule: args.applicationRule,
          subsystemRule: args.subsystemRule,
          logRules: args.logRules,
          archiveRetention: args.archiveRetention
        };

        const response = await client.createPolicy(policyData);
        
        const priorityLabel = args.priority?.replace('PRIORITY_TYPE_', '').toLowerCase() || 'unknown';
        
        let result = `Policy Created Successfully\n`;
        result += `===========================\n\n`;
        result += `✅ Name: ${args.name}\n`;
        result += `🆔 ID: ${response.policy?.id}\n`;
        result += `🎯 Priority: ${priorityLabel}\n`;
        result += `🟢 Status: ${response.policy?.enabled ? 'enabled' : 'disabled'}\n`;
        result += `📊 Order: ${response.policy?.order}\n`;
        
        if (args.description) {
          result += `📝 Description: ${args.description}\n`;
        }
        
        if (args.applicationRule) {
          result += `📱 Application Rule: ${args.applicationRule.name}\n`;
        }
        
        if (args.subsystemRule) {
          result += `🔧 Subsystem Rule: ${args.subsystemRule.name}\n`;
        }
        
        if (args.logRules?.severities) {
          result += `📊 Log Severities: ${args.logRules.severities.join(', ')}\n`;
        }

        return result;
      }

      case 'update_policy': {
        const policyData = {
          id: args.id,
          name: args.name,
          description: args.description,
          priority: args.priority,
          enabled: args.enabled,
          applicationRule: args.applicationRule,
          subsystemRule: args.subsystemRule,
          logRules: args.logRules,
          archiveRetention: args.archiveRetention
        };

        const response = await client.updatePolicy(policyData);
        
        const updatedFields = Object.keys(args).filter(key => key !== 'id' && args[key] !== undefined);
        
        let result = `Policy Updated Successfully\n`;
        result += `===========================\n\n`;
        result += `✅ Policy ID: ${args.id}\n`;
        result += `📝 Name: ${response.policy?.name || args.name}\n`;
        result += `🔄 Updated Fields: ${updatedFields.join(', ')}\n\n`;
        
        updatedFields.forEach(field => {
          if (field === 'name') result += `📝 New Name: ${args.name}\n`;
          if (field === 'description') result += `📄 New Description: ${args.description}\n`;
          if (field === 'priority') result += `🎯 New Priority: ${args.priority?.replace('PRIORITY_TYPE_', '').toLowerCase()}\n`;
          if (field === 'enabled') result += `🔘 Status: ${args.enabled ? 'enabled' : 'disabled'}\n`;
        });

        return result;
      }

      case 'get_policy': {
        const response = await client.getPolicy(args.id);
        
        const priorityLabel = response.policy?.priority?.replace('PRIORITY_TYPE_', '').toLowerCase() || 'unknown';
        const statusIcon = response.policy?.enabled ? '🟢' : '🔴';
        
        let result = `Policy Details\n`;
        result += `==============\n\n`;
        result += `${statusIcon} Name: ${response.policy?.name}\n`;
        result += `🆔 ID: ${response.policy?.id}\n`;
        result += `🎯 Priority: ${priorityLabel}\n`;
        result += `📊 Order: ${response.policy?.order}\n`;
        result += `🔘 Enabled: ${response.policy?.enabled}\n`;
        result += `🏢 Company ID: ${response.policy?.companyId}\n`;
        
        if (response.policy?.description) {
          result += `📝 Description: ${response.policy.description}\n`;
        }
        
        if (response.policy?.applicationRule) {
          result += `\n📱 Application Rule:\n`;
          result += `   Type: ${response.policy.applicationRule.ruleTypeId}\n`;
          result += `   Name: ${response.policy.applicationRule.name}\n`;
        }
        
        if (response.policy?.subsystemRule) {
          result += `\n🔧 Subsystem Rule:\n`;
          result += `   Type: ${response.policy.subsystemRule.ruleTypeId}\n`;
          result += `   Name: ${response.policy.subsystemRule.name}\n`;
        }
        
        if (response.policy?.logRules?.severities) {
          result += `\n📊 Log Rules:\n`;
          result += `   Severities: ${response.policy.logRules.severities.join(', ')}\n`;
        }
        
        if (response.policy?.createdAt) {
          result += `\n📅 Created: ${response.policy.createdAt}\n`;
        }
        
        if (response.policy?.updatedAt) {
          result += `🔄 Updated: ${response.policy.updatedAt}\n`;
        }

        return result;
      }

      case 'delete_policy': {
        const response = await client.deletePolicy(args.id);
        
        let result = `Policy Deleted\n`;
        result += `==============\n\n`;
        result += `🗑️ Successfully deleted policy: ${args.id}\n`;
        result += `✅ Operation completed successfully\n`;

        return result;
      }

      case 'toggle_policy': {
        await client.togglePolicy(args.id, args.enabled);
        
        const action = args.enabled ? 'enabled' : 'disabled';
        const icon = args.enabled ? '🟢' : '🔴';
        
        let result = `Policy Status Updated\n`;
        result += `====================\n\n`;
        result += `${icon} Policy ID: ${args.id}\n`;
        result += `🔘 Action: ${action}\n`;
        result += `✅ Status: ${args.enabled ? 'enabled' : 'disabled'}\n`;

        return result;
      }

      case 'reorder_policies': {
        const response = await client.reorderPolicies(args.orders, args.sourceType || 'SOURCE_TYPE_LOGS');
        
        let result = `Policies Reordered\n`;
        result += `==================\n\n`;
        result += `🔄 Reordered: ${args.orders.length} policies\n`;
        result += `📊 Source Type: ${args.sourceType || 'SOURCE_TYPE_LOGS'}\n\n`;
        
        result += `New Order:\n`;
        result += `==========\n`;
        args.orders.forEach((order: any, index: number) => {
          result += `${index + 1}. Policy ID: ${order.id} (Order: ${order.order})\n`;
        });

        return result;
      }

      default:
        throw new Error(`Unknown policies tool: ${name}`);
    }
  } catch (error: any) {
    throw new Error(`Failed to execute policies operation: ${error.message}`);
  }
}

export const policiesTools = [
  listPoliciesTools,
  createPolicyTool,
  updatePolicyTool,
  getPolicyTool,
  deletePolicyTool,
  togglePolicyTool,
  reorderPoliciesTool
]; 