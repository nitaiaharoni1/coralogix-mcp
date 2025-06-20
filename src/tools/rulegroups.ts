/**
 * Rule Groups Tools for Coralogix MCP Server
 * 
 * Manage parsing rule groups for log processing and transformation.
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { getCoralogixClient } from '../services/coralogix-client.js';

export const ruleGroupsTools: Tool[] = [
  {
    name: 'list_rule_groups',
    description: 'List all parsing rule groups that process and transform incoming logs. Use this to: see all active parsing rules, understand log processing pipeline, identify parsing bottlenecks, and manage rule configurations. Returns rule group names, types, order, and enabled status.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_rule_group',
    description: 'Get detailed configuration of a specific parsing rule group by ID. Use this to: examine parsing logic and regular expressions, understand field extractions and transformations, review rule performance impact, and debug parsing issues. Returns complete rule group definition including all parsing rules and conditions.',
    inputSchema: {
      type: 'object',
      properties: {
        groupId: {
          type: 'string',
          description: 'The unique identifier of the rule group to retrieve. Get this from list_rule_groups.'
        }
      },
      required: ['groupId']
    }
  },
  {
    name: 'create_rule_group',
    description: 'Create a new parsing rule group to process and extract fields from logs. Use this to: set up log parsing for new applications, extract custom fields from log messages, standardize log formats, and improve log searchability. Supports regex, JSON, and other parsing methods. Note: For basic rule groups, you can start with empty ruleMatchers and ruleSubgroups arrays.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'A descriptive name for the rule group (e.g., "Apache Access Log Parser", "Application Error Extractor")'
        },
        description: {
          type: 'string',
          description: 'Detailed description of what this rule group parses and extracts. Optional but recommended.'
        },
        enabled: {
          type: 'boolean',
          description: 'Whether the rule group should be active immediately after creation. Default is true.'
        },
        hidden: {
          type: 'boolean',
          description: 'Whether to hide this rule group in the UI. Default is false.'
        },
        creator: {
          type: 'string',
          description: 'Creator identifier for the rule group. Optional, defaults to "MCP Server".'
        },
        order: {
          type: 'number',
          description: 'Processing order for this rule group. Lower numbers process first. Default is 1.'
        },
        ruleMatchers: {
          type: 'array',
          description: 'Array of rule matching configurations that define when and how to apply parsing rules. Can be empty array [] for basic rule groups.',
          items: {
            type: 'object',
            description: 'Rule matcher configuration'
          }
        },
        ruleSubgroups: {
          type: 'array',
          description: 'Array of rule subgroups containing the actual parsing rules with regex patterns and field extractions. Can be empty array [] for basic rule groups.',
          items: {
            type: 'object',
            description: 'Rule subgroup configuration'
          }
        },
        teamId: {
          type: 'object',
          description: 'Team ID object with id field. Optional - if not provided, will use default team.',
          properties: {
            id: {
              type: 'number',
              description: 'Team ID number'
            }
          }
        }
      },
      required: ['name']
    }
  },
  {
    name: 'update_rule_group',
    description: 'Update an existing parsing rule group configuration. Use this to: modify parsing logic and patterns, add or remove parsing rules, change rule order and conditions, and optimize parsing performance. Perfect for adding sensitive data sanitization rules like hiding passwords, tokens, credit cards, emails, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        groupId: {
          type: 'string',
          description: 'The unique identifier of the rule group to update (get from list_rule_groups)'
        },
        ruleGroup: {
          type: 'object',
          description: 'Complete rule group configuration. IMPORTANT: Use get_rule_group first to get current config, then modify as needed. For sensitive data sanitization, add rules with replaceParameters to mask sensitive data.',
          properties: {
            name: { type: 'string', description: 'Rule group name' },
            description: { type: 'string', description: 'Rule group description' },
            enabled: { type: 'boolean', description: 'Whether rule group is active' },
            hidden: { type: 'boolean', description: 'Whether to hide in UI' },
            creator: { type: 'string', description: 'Creator identifier' },
            order: { type: 'number', description: 'Processing order' },
            ruleMatchers: {
              type: 'array',
              description: 'Conditions for when to apply rules (e.g., subsystemName filter)',
              items: { type: 'object' }
            },
            ruleSubgroups: {
              type: 'array',
              description: 'Groups of parsing/replacement rules. For sensitive data: use replaceParameters with regex patterns',
              items: {
                type: 'object',
                properties: {
                  rules: {
                    type: 'array',
                    description: 'Individual parsing/replacement rules',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', description: 'Rule name (e.g., "Hide Passwords")' },
                        description: { type: 'string', description: 'Rule description' },
                        sourceField: { type: 'string', description: 'Source field to process (usually "text")' },
                        parameters: {
                          type: 'object',
                          description: 'Rule parameters - use replaceParameters for sensitive data masking',
                          properties: {
                            replaceParameters: {
                              type: 'object',
                              description: 'Replace sensitive data with masked values',
                              properties: {
                                destinationField: { type: 'string', description: 'Destination field (usually "text")' },
                                rule: { type: 'string', description: 'Regex pattern to match sensitive data' },
                                replaceNewVal: { type: 'string', description: 'Replacement value (e.g., "[REDACTED]", "***")' }
                              }
                            }
                          }
                        },
                        enabled: { type: 'boolean', description: 'Whether rule is active' },
                        order: { type: 'number', description: 'Rule processing order' }
                      }
                    }
                  },
                  enabled: { type: 'boolean', description: 'Whether subgroup is active' },
                  order: { type: 'number', description: 'Subgroup processing order' }
                }
              }
            }
          }
        }
      },
      required: ['groupId', 'ruleGroup']
    }
  },
  {
    name: 'delete_rule_group',
    description: 'Permanently delete a parsing rule group. Use this to: remove obsolete parsing rules, clean up unused rule groups, and manage parsing pipeline. This action cannot be undone and will stop all parsing for logs matching this rule group.',
    inputSchema: {
      type: 'object',
      properties: {
        groupId: {
          type: 'string',
          description: 'The unique identifier of the rule group to delete. Get this from list_rule_groups.'
        }
      },
      required: ['groupId']
    }
  },
  {
    name: 'set_rule_group_active',
    description: 'Enable or disable a parsing rule group without deleting it. Use this to: temporarily disable problematic rules, enable rules after testing, manage rule activation schedules, and control parsing behavior. Disabled rule groups will not process any logs.',
    inputSchema: {
      type: 'object',
      properties: {
        groupId: {
          type: 'string',
          description: 'The unique identifier of the rule group to enable/disable'
        },
        active: {
          type: 'boolean',
          description: 'Set to true to enable the rule group (it will start processing logs), false to disable it (stops processing)'
        }
      },
      required: ['groupId', 'active']
    }
  },
  {
    name: 'get_rule_group_limits',
    description: 'Get company usage limits for rule groups',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  }
];

export async function handleRuleGroupsTool(request: CallToolRequest): Promise<any> {
  const client = getCoralogixClient();
  
  switch (request.params.name) {
    case 'list_rule_groups':
      return await client.listRuleGroups();
      
    case 'get_rule_group':
      const { groupId } = request.params.arguments as { groupId: string };
      return await client.getRuleGroup(groupId);
      
    case 'create_rule_group':
      const createArgs = request.params.arguments as any;
      
      // Validate required fields
      if (!createArgs.name) {
        throw new Error('Rule group name is required');
      }
      
      try {
        // Get team ID from company limits if not provided
        let teamId = createArgs.teamId;
        if (!teamId) {
          const limits = await client.getRuleGroupLimits();
          if (limits.companyId) {
            teamId = { id: parseInt(limits.companyId) };
          }
        }
        
        const ruleGroupData = {
          name: createArgs.name,
          description: createArgs.description || '',
          enabled: createArgs.enabled !== undefined ? createArgs.enabled : true,
          hidden: createArgs.hidden || false,
          creator: createArgs.creator || 'MCP Server',
          order: createArgs.order || 1,
          ruleMatchers: createArgs.ruleMatchers || [],
          ruleSubgroups: createArgs.ruleSubgroups || [],
          ...(teamId && { teamId })
        };
        
        return await client.createRuleGroup(ruleGroupData);
      } catch (error: any) {
        // Provide helpful error message
        const errorMsg = error.message || 'Unknown error';
        throw new Error(`Failed to create rule group: ${errorMsg}. Note: Rule group creation may have API limitations. You can list existing rule groups and update them instead.`);
      }
      
    case 'update_rule_group':
      const updateArgs = request.params.arguments as { groupId: string; ruleGroup: any };
      return await client.updateRuleGroup(updateArgs.groupId, updateArgs.ruleGroup);
      
    case 'delete_rule_group':
      const deleteArgs = request.params.arguments as { groupId: string };
      return await client.deleteRuleGroup(deleteArgs.groupId);
      
    case 'set_rule_group_active':
      const activeArgs = request.params.arguments as { groupId: string; active: boolean };
      return await client.setRuleGroupActive(activeArgs.groupId, activeArgs.active);
      
    case 'get_rule_group_limits':
      return await client.getRuleGroupLimits();
      
    default:
      throw new Error(`Unknown Rule Groups tool: ${request.params.name}`);
  }
} 