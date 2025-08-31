/**
 * Coralogix Parsing Rules Management Tools
 * Tools for managing parsing rule groups and individual parsing rules
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCoralogixClient } from '../services/coralogix-client.js';
import { 
  ParsingRuleType,
  RuleMatcherField,
  SeverityValue,
  JsonExtractDestinationField,
  TimestampFormatStandard,
  CreateRuleGroupRequest,
  RuleMatcher,
  ParsingRule,
  RulesGroup
} from '../types/coralogix.js';

// Tool definitions
export const parsingRulesTools: Tool[] = [
  {
    name: 'list_parsing_rule_groups',
    description: '📋 LIST PARSING RULE GROUPS - Get all parsing rule groups in your account. Shows rule groups that process logs according to their order and conditions. Use this to: view all parsing rule configurations, understand log processing pipeline, find specific rule groups, and manage parsing rule organization.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_parsing_rule_group',
    description: '🔍 GET PARSING RULE GROUP - Get detailed information about a specific parsing rule group including all its rules and conditions. Shows the complete configuration for log processing rules.',
    inputSchema: {
      type: 'object',
      properties: {
        groupId: {
          type: 'string',
          description: 'The unique identifier of the rule group to retrieve'
        }
      },
      required: ['groupId']
    }
  },
  {
    name: 'create_parsing_rule_group',
    description: '🛠️ CREATE PARSING RULE GROUP - Create a comprehensive parsing rule group with multiple rules and conditions. Perfect for setting up log parsing pipelines, data extraction rules, and log transformation workflows.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the rule group (e.g., "Apache Log Parser", "Error Log Processing")'
        },
        description: {
          type: 'string',
          description: 'Detailed description of what this rule group does'
        },
        enabled: {
          type: 'boolean',
          description: 'Whether the rule group should be active (default: true)'
        },
        creator: {
          type: 'string',
          description: 'Name or email of the rule group creator'
        },
        order: {
          type: 'number',
          description: 'Processing order (lower numbers processed first). If not specified, added at end.'
        },
        applicationName: {
          type: 'string',
          description: 'Apply rules only to logs from this application'
        },
        subsystemName: {
          type: 'string',
          description: 'Apply rules only to logs from this subsystem'
        },
        severityLevels: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['debug', 'verbose', 'info', 'warning', 'error', 'critical']
          },
          description: 'Apply rules only to logs with these severity levels'
        },
        rules: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              enabled: { type: 'boolean' },
              type: {
                type: 'string',
                enum: ['block', 'extract', 'parse', 'jsonextract', 'replace', 'timestampextract', 'removefields', 'stringify', 'parsejson']
              },
              rule: { type: 'string' },
              sourceField: { type: 'string' },
              destinationField: { type: 'string' },
              replaceNewVal: { type: 'string' },
              timeFormat: { type: 'string' },
              formatStandard: {
                type: 'string',
                enum: ['javasdf', 'golang', 'strftime', 'secondsts', 'millits', 'microts', 'nanots']
              },
              order: { type: 'number' },
              subGroupOrder: { type: 'number' }
            },
            required: ['name', 'type']
          },
          description: 'Array of parsing rules to include in this group'
        }
      },
      required: ['name', 'rules']
    }
  },
  {
    name: 'create_simple_parsing_rule',
    description: '⚡ CREATE SIMPLE PARSING RULE - Quick creation of common parsing rules with guided configuration. Perfect for standard log parsing scenarios like timestamp extraction, field parsing, and text replacement.',
    inputSchema: {
      type: 'object',
      properties: {
        groupName: {
          type: 'string',
          description: 'Name for the new rule group that will contain this rule'
        },
        ruleName: {
          type: 'string',
          description: 'Name of the parsing rule'
        },
        ruleType: {
          type: 'string',
          enum: ['parse', 'extract', 'replace', 'timestampextract', 'jsonextract', 'block', 'removefields'],
          description: 'Type of parsing rule to create'
        },
        regexPattern: {
          type: 'string',
          description: 'Regex pattern for parse/extract/replace rules (not needed for timestampextract/removefields)'
        },
        sourceField: {
          type: 'string',
          description: 'Source field to parse from (default: "text")'
        },
        destinationField: {
          type: 'string',
          description: 'Destination field to parse to (default: "text")'
        },
        replaceValue: {
          type: 'string',
          description: 'New value for replace rules'
        },
        timeFormat: {
          type: 'string',
          description: 'Time format pattern for timestamp extraction (e.g., "yyyy-MM-dd HH:mm:ss")'
        },
        formatStandard: {
          type: 'string',
          enum: ['javasdf', 'golang', 'strftime', 'secondsts', 'millits', 'microts', 'nanots'],
          description: 'Time format standard for timestamp extraction'
        },
        fieldsToRemove: {
          type: 'string',
          description: 'Comma-separated list of JSON fields to remove (for removefields type)'
        },
        jsonExtractField: {
          type: 'string',
          enum: ['category', 'className', 'methodName', 'severity', 'threadId'],
          description: 'Field to extract JSON data to (for jsonextract type)'
        }
      },
      required: ['groupName', 'ruleName', 'ruleType']
    }
  },
  {
    name: 'update_parsing_rule_group',
    description: '✏️ UPDATE PARSING RULE GROUP - Modify an existing parsing rule group. Can update rules, conditions, order, and enable/disable status.',
    inputSchema: {
      type: 'object',
      properties: {
        groupId: {
          type: 'string',
          description: 'ID of the rule group to update'
        },
        name: {
          type: 'string',
          description: 'New name for the rule group'
        },
        description: {
          type: 'string',
          description: 'New description for the rule group'
        },
        enabled: {
          type: 'boolean',
          description: 'Enable or disable the entire rule group'
        },
        order: {
          type: 'number',
          description: 'New processing order for the rule group'
        }
      },
      required: ['groupId']
    }
  },
  {
    name: 'delete_parsing_rule_group',
    description: '🗑️ DELETE PARSING RULE GROUP - Permanently delete a parsing rule group and all its rules. This will stop all log processing for this group.',
    inputSchema: {
      type: 'object',
      properties: {
        groupId: {
          type: 'string',
          description: 'ID of the rule group to delete'
        },
        confirmDeletion: {
          type: 'boolean',
          description: 'Set to true to confirm deletion of the rule group'
        }
      },
      required: ['groupId', 'confirmDeletion']
    }
  },
  {
    name: 'delete_parsing_rule',
    description: '🗑️ DELETE PARSING RULE - Delete a specific parsing rule from a rule group while keeping the group intact.',
    inputSchema: {
      type: 'object',
      properties: {
        ruleId: {
          type: 'string',
          description: 'ID of the parsing rule to delete'
        },
        groupId: {
          type: 'string',
          description: 'ID of the rule group containing the rule'
        }
      },
      required: ['ruleId', 'groupId']
    }
  },
  {
    name: 'export_import_parsing_rules',
    description: '📦 EXPORT/IMPORT PARSING RULES - Export all parsing rules for backup or import them to another team/account. Perfect for rule migration and backup scenarios.',
    inputSchema: {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          enum: ['export', 'import'],
          description: 'Whether to export current rules or import new rules'
        },
        rulesData: {
          type: 'object',
          description: 'Rules data for import operation (JSON object from export)'
        }
      },
      required: ['operation']
    }
  },
  {
    name: 'validate_parsing_rule',
    description: '✅ VALIDATE PARSING RULE - Test and validate a parsing rule configuration before creating it. Helps ensure regex patterns are correct and rule logic is sound.',
    inputSchema: {
      type: 'object',
      properties: {
        ruleType: {
          type: 'string',
          enum: ['block', 'extract', 'parse', 'jsonextract', 'replace', 'timestampextract', 'removefields', 'stringify', 'parsejson']
        },
        regexPattern: {
          type: 'string',
          description: 'Regex pattern to validate'
        },
        testLogSample: {
          type: 'string',
          description: 'Sample log line to test the rule against'
        },
        sourceField: {
          type: 'string',
          description: 'Source field for the rule'
        },
        destinationField: {
          type: 'string',
          description: 'Destination field for the rule'
        }
      },
      required: ['ruleType']
    }
  }
];

// Tool handlers
export async function handleParsingRulesTool(name: string, args: any): Promise<string> {
  const client = getCoralogixClient();

  switch (name) {
    case 'list_parsing_rule_groups':
      return await handleListParsingRuleGroups(client);
    
    case 'get_parsing_rule_group':
      return await handleGetParsingRuleGroup(client, args);
    
    case 'create_parsing_rule_group':
      return await handleCreateParsingRuleGroup(client, args);
    
    case 'create_simple_parsing_rule':
      return await handleCreateSimpleParsingRule(client, args);
    
    case 'update_parsing_rule_group':
      return await handleUpdateParsingRuleGroup(client, args);
    
    case 'delete_parsing_rule_group':
      return await handleDeleteParsingRuleGroup(client, args);
    
    case 'delete_parsing_rule':
      return await handleDeleteParsingRule(client, args);
    
    case 'export_import_parsing_rules':
      return await handleExportImportParsingRules(client, args);
    
    case 'validate_parsing_rule':
      return await handleValidateParsingRule(client, args);
    
    default:
      throw new Error(`Unknown parsing rules tool: ${name}`);
  }
}

async function handleListParsingRuleGroups(client: any): Promise<string> {
  try {
    const response = await client.getAllParsingRules();
    
    if (!response.companyRulesData || response.companyRulesData.length === 0) {
      return 'No parsing rule groups found in your account.';
    }

    let result = `📋 Parsing Rule Groups (${response.companyRulesData.length} found)\n`;
    result += '='.repeat(50) + '\n\n';

    response.companyRulesData.forEach((group: any, index: number) => {
      const status = group.enabled ? '🟢 Enabled' : '🔴 Disabled';
      const rulesCount = group.rulesGroups?.reduce((total: number, subGroup: any) => total + (subGroup.rules?.length || 0), 0) || 0;
      
      result += `${index + 1}. ${group.name}\n`;
      result += `   ID: ${group.id}\n`;
      result += `   Status: ${status}\n`;
      result += `   Order: ${group.order}\n`;
      result += `   Rules: ${rulesCount}\n`;
      
      if (group.description) {
        result += `   Description: ${group.description}\n`;
      }
      
      if (group.creator) {
        result += `   Creator: ${group.creator}\n`;
      }
      
      if (group.createdAt) {
        result += `   Created: ${new Date(group.createdAt).toLocaleString()}\n`;
      }
      
      if (group.updatedAt) {
        result += `   Updated: ${new Date(group.updatedAt).toLocaleString()}\n`;
      }
      
      // Show rule matchers if any
      if (group.ruleMatchers && group.ruleMatchers.length > 0) {
        result += `   Conditions:\n`;
        group.ruleMatchers.forEach((matcher: any) => {
          result += `     ${matcher.field}: ${matcher.constraint}\n`;
        });
      }
      
      result += '\n';
    });

    return result;
  } catch (error) {
    throw new Error(`Failed to list parsing rule groups: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleGetParsingRuleGroup(client: any, args: any): Promise<string> {
  try {
    const { groupId } = args;
    const response = await client.getParsingRuleGroup(groupId);
    
    let result = `🔍 Parsing Rule Group Details\n`;
    result += '='.repeat(35) + '\n\n';
    
    result += `Name: ${response.name}\n`;
    result += `ID: ${response.id}\n`;
    result += `Status: ${response.enabled ? '🟢 Enabled' : '🔴 Disabled'}\n`;
    result += `Order: ${response.order}\n`;
    
    if (response.description) {
      result += `Description: ${response.description}\n`;
    }
    
    if (response.creator) {
      result += `Creator: ${response.creator}\n`;
    }
    
    if (response.createdAt) {
      result += `Created: ${new Date(response.createdAt).toLocaleString()}\n`;
    }
    
    if (response.updatedAt) {
      result += `Updated: ${new Date(response.updatedAt).toLocaleString()}\n`;
    }
    
    // Show rule matchers
    if (response.ruleMatchers && response.ruleMatchers.length > 0) {
      result += `\nConditions:\n`;
      response.ruleMatchers.forEach((matcher: any) => {
        result += `  ${matcher.field}: ${matcher.constraint}\n`;
      });
    }
    
    // Show rules groups and rules
    if (response.rulesGroups && response.rulesGroups.length > 0) {
      result += `\nRules:\n`;
      result += '-'.repeat(20) + '\n';
      
      response.rulesGroups.forEach((subGroup: any, subIndex: number) => {
        result += `\nSub-group ${subGroup.order} (${subGroup.rules?.length || 0} rules):\n`;
        
        if (subGroup.rules) {
          subGroup.rules.forEach((rule: any, ruleIndex: number) => {
            result += `  ${ruleIndex + 1}. ${rule.name}\n`;
            result += `     ID: ${rule.id}\n`;
            result += `     Type: ${rule.type}\n`;
            result += `     Status: ${rule.enabled ? '🟢 Enabled' : '🔴 Disabled'}\n`;
            result += `     Order: ${rule.order}\n`;
            
            if (rule.description) {
              result += `     Description: ${rule.description}\n`;
            }
            
            if (rule.rule) {
              result += `     Pattern: ${rule.rule}\n`;
            }
            
            if (rule.sourceField) {
              result += `     Source: ${rule.sourceField}\n`;
            }
            
            if (rule.destinationField) {
              result += `     Destination: ${rule.destinationField}\n`;
            }
            
            if (rule.replaceNewVal) {
              result += `     Replace Value: ${rule.replaceNewVal}\n`;
            }
            
            result += '\n';
          });
        }
      });
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to get parsing rule group: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleCreateParsingRuleGroup(client: any, args: any): Promise<string> {
  try {
    const {
      name,
      description,
      enabled = true,
      creator,
      order,
      applicationName,
      subsystemName,
      severityLevels,
      rules
    } = args;

    // Build rule matchers
    const ruleMatchers: RuleMatcher[] = [];
    
    if (applicationName) {
      ruleMatchers.push({ field: 'applicationName', constraint: applicationName });
    }
    
    if (subsystemName) {
      ruleMatchers.push({ field: 'subsystemName', constraint: subsystemName });
    }
    
    if (severityLevels && severityLevels.length > 0) {
      severityLevels.forEach((severity: string) => {
        ruleMatchers.push({ field: 'severity', constraint: severity });
      });
    }

    // Group rules by sub-group order
    const rulesGroupMap: Map<number, ParsingRule[]> = new Map();
    
    rules.forEach((rule: any) => {
      const subGroupOrder = rule.subGroupOrder || 1;
      if (!rulesGroupMap.has(subGroupOrder)) {
        rulesGroupMap.set(subGroupOrder, []);
      }
      
      const parsingRule: ParsingRule = {
        name: rule.name,
        description: rule.description,
        enabled: rule.enabled !== false,
        type: rule.type,
        order: rule.order || 1,
        ...(rule.rule && { rule: rule.rule }),
        ...(rule.sourceField && { sourceField: rule.sourceField }),
        ...(rule.destinationField && { destinationField: rule.destinationField }),
        ...(rule.replaceNewVal && { replaceNewVal: rule.replaceNewVal }),
        ...(rule.timeFormat && { timeFormat: rule.timeFormat }),
        ...(rule.formatStandard && { formatStandard: rule.formatStandard })
      };
      
      rulesGroupMap.get(subGroupOrder)!.push(parsingRule);
    });

    // Build rules groups
    const rulesGroups: RulesGroup[] = [];
    for (const [order, groupRules] of rulesGroupMap.entries()) {
      rulesGroups.push({
        order,
        rules: groupRules
      });
    }

    const request: CreateRuleGroupRequest = {
      name,
      description,
      enabled,
      creator,
      order,
      ruleMatchers: ruleMatchers.length > 0 ? ruleMatchers : [],
      rulesGroups
    };

    const response = await client.createParsingRuleGroup(request);
    
    let result = `✅ Parsing rule group created successfully!\n\n`;
    result += `Group ID: ${response.id}\n`;
    result += `Name: ${response.name}\n`;
    result += `Status: ${response.enabled ? 'Enabled' : 'Disabled'}\n`;
    result += `Order: ${response.order}\n`;
    
    if (response.description) {
      result += `Description: ${response.description}\n`;
    }
    
    const totalRules = response.rulesGroups?.reduce((total: number, subGroup: any) => total + (subGroup.rules?.length || 0), 0) || 0;
    result += `Total Rules: ${totalRules}\n`;
    
    if (response.createdAt) {
      result += `Created: ${new Date(response.createdAt).toLocaleString()}\n`;
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to create parsing rule group: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleCreateSimpleParsingRule(client: any, args: any): Promise<string> {
  try {
    const {
      groupName,
      ruleName,
      ruleType,
      regexPattern,
      sourceField = 'text',
      destinationField = 'text',
      replaceValue,
      timeFormat,
      formatStandard,
      fieldsToRemove,
      jsonExtractField
    } = args;

    // Build the parsing rule based on type
    const parsingRule: ParsingRule = {
      name: ruleName,
      type: ruleType,
      enabled: true,
      order: 1,
      sourceField,
      destinationField
    };

    // Add type-specific fields
    switch (ruleType) {
      case 'parse':
      case 'extract':
      case 'block':
        if (!regexPattern) {
          throw new Error(`Regex pattern is required for ${ruleType} rules`);
        }
        parsingRule.rule = regexPattern;
        break;
        
      case 'replace':
        if (!regexPattern || !replaceValue) {
          throw new Error('Both regex pattern and replace value are required for replace rules');
        }
        parsingRule.rule = regexPattern;
        parsingRule.replaceNewVal = replaceValue;
        break;
        
      case 'timestampextract':
        if (!timeFormat || !formatStandard) {
          throw new Error('Both time format and format standard are required for timestamp extraction');
        }
        parsingRule.timeFormat = timeFormat;
        parsingRule.formatStandard = formatStandard;
        // Remove rule field for timestamp extract
        delete parsingRule.rule;
        break;
        
      case 'removefields':
        if (!fieldsToRemove) {
          throw new Error('Fields to remove are required for removefields rules');
        }
        parsingRule.rule = fieldsToRemove;
        break;
        
      case 'jsonextract':
        if (!regexPattern || !jsonExtractField) {
          throw new Error('Both regex pattern and JSON extract field are required for JSON extract rules');
        }
        parsingRule.rule = regexPattern;
        parsingRule.destinationField = jsonExtractField;
        break;
        
      case 'stringify':
      case 'parsejson':
        // These don't need additional fields
        break;
    }

    const request: CreateRuleGroupRequest = {
      name: groupName,
      description: `Simple rule group for ${ruleName}`,
      enabled: true,
      ruleMatchers: [],
      rulesGroups: [{
        order: 1,
        rules: [parsingRule]
      }]
    };

    const response = await client.createParsingRuleGroup(request);
    
    let result = `✅ Simple parsing rule created successfully!\n\n`;
    result += `Group ID: ${response.id}\n`;
    result += `Group Name: ${response.name}\n`;
    result += `Rule Name: ${ruleName}\n`;
    result += `Rule Type: ${ruleType}\n`;
    result += `Status: Enabled\n`;
    
    if (regexPattern) {
      result += `Pattern: ${regexPattern}\n`;
    }
    
    if (sourceField !== 'text') {
      result += `Source Field: ${sourceField}\n`;
    }
    
    if (destinationField !== 'text') {
      result += `Destination Field: ${destinationField}\n`;
    }
    
    if (response.createdAt) {
      result += `Created: ${new Date(response.createdAt).toLocaleString()}\n`;
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to create simple parsing rule: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleUpdateParsingRuleGroup(client: any, args: any): Promise<string> {
  try {
    const { groupId, name, description, enabled, order } = args;
    
    // Get current rule group
    const currentGroup = await client.getParsingRuleGroup(groupId);
    
    // Update fields
    const updatedGroup = {
      ...currentGroup,
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(enabled !== undefined && { enabled }),
      ...(order !== undefined && { order })
    };
    
    // Clean ruleMatchers for update
    if (updatedGroup.ruleMatchers === null) {
      updatedGroup.ruleMatchers = [];
    }
    
    const response = await client.updateParsingRuleGroup(updatedGroup);
    
    let result = `✅ Parsing rule group updated successfully!\n\n`;
    result += `Group ID: ${response.id}\n`;
    result += `Name: ${response.name}\n`;
    result += `Status: ${response.enabled ? 'Enabled' : 'Disabled'}\n`;
    result += `Order: ${response.order}\n`;
    
    if (response.description) {
      result += `Description: ${response.description}\n`;
    }
    
    if (response.updatedAt) {
      result += `Updated: ${new Date(response.updatedAt).toLocaleString()}\n`;
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to update parsing rule group: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleDeleteParsingRuleGroup(client: any, args: any): Promise<string> {
  try {
    const { groupId, confirmDeletion } = args;
    
    if (!confirmDeletion) {
      // Get group info for confirmation
      const group = await client.getParsingRuleGroup(groupId);
      const rulesCount = group.rulesGroups?.reduce((total: number, subGroup: any) => total + (subGroup.rules?.length || 0), 0) || 0;
      
      let result = `⚠️ DELETE CONFIRMATION REQUIRED\n\n`;
      result += `You are about to delete the parsing rule group:\n`;
      result += `Name: ${group.name}\n`;
      result += `ID: ${groupId}\n`;
      result += `Rules: ${rulesCount}\n\n`;
      result += `This will permanently delete the rule group and all its parsing rules.\n`;
      result += `Log processing for this group will stop immediately.\n\n`;
      result += `To proceed, set confirmDeletion: true\n`;
      
      return result;
    }
    
    await client.deleteParsingRuleGroup(groupId);
    
    return `✅ Parsing rule group (ID: ${groupId}) has been deleted successfully.`;
  } catch (error) {
    throw new Error(`Failed to delete parsing rule group: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleDeleteParsingRule(client: any, args: any): Promise<string> {
  try {
    const { ruleId, groupId } = args;
    
    await client.deleteParsingRule(ruleId, groupId);
    
    return `✅ Parsing rule (ID: ${ruleId}) has been deleted from group (ID: ${groupId}).`;
  } catch (error) {
    throw new Error(`Failed to delete parsing rule: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleExportImportParsingRules(client: any, args: any): Promise<string> {
  try {
    const { operation, rulesData } = args;
    
    if (operation === 'export') {
      const response = await client.getAllParsingRules();
      
      let result = `📦 Parsing Rules Export\n`;
      result += '='.repeat(30) + '\n\n';
      result += `Exported ${response.companyRulesData.length} rule groups\n\n`;
      
      // Show summary
      let totalRules = 0;
      response.companyRulesData.forEach((group: any) => {
        const rulesCount = group.rulesGroups?.reduce((total: number, subGroup: any) => total + (subGroup.rules?.length || 0), 0) || 0;
        totalRules += rulesCount;
        result += `- ${group.name}: ${rulesCount} rules\n`;
      });
      
      result += `\nTotal Rules: ${totalRules}\n\n`;
      result += `Export Data (copy this for import):\n`;
      result += '```json\n';
      result += JSON.stringify(response, null, 2);
      result += '\n```\n';
      
      return result;
    } else if (operation === 'import') {
      if (!rulesData) {
        throw new Error('Rules data is required for import operation');
      }
      
      const response = await client.exportRules(rulesData);
      
      return `✅ Parsing rules imported successfully!\n\nResponse: ${JSON.stringify(response, null, 2)}`;
    } else {
      throw new Error('Operation must be either "export" or "import"');
    }
  } catch (error) {
    throw new Error(`Failed to export/import parsing rules: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleValidateParsingRule(client: any, args: any): Promise<string> {
  try {
    const { ruleType, regexPattern, testLogSample, sourceField, destinationField } = args;
    
    let result = `✅ Parsing Rule Validation\n`;
    result += '='.repeat(30) + '\n\n';
    result += `Rule Type: ${ruleType}\n`;
    
    // Basic validation based on rule type
    const validationResults: string[] = [];
    
    switch (ruleType) {
      case 'parse':
      case 'extract':
      case 'block':
        if (!regexPattern) {
          validationResults.push('❌ Regex pattern is required');
        } else {
          try {
            new RegExp(regexPattern);
            validationResults.push('✅ Regex pattern is valid');
          } catch (e) {
            validationResults.push(`❌ Invalid regex pattern: ${e instanceof Error ? e.message : 'Unknown error'}`);
          }
        }
        break;
        
      case 'replace':
        if (!regexPattern) {
          validationResults.push('❌ Regex pattern is required for replace rules');
        } else {
          try {
            new RegExp(regexPattern);
            validationResults.push('✅ Regex pattern is valid');
          } catch (e) {
            validationResults.push(`❌ Invalid regex pattern: ${e instanceof Error ? e.message : 'Unknown error'}`);
          }
        }
        validationResults.push('⚠️ Replace value should be provided');
        break;
        
      case 'timestampextract':
        validationResults.push('⚠️ Time format and format standard are required');
        if (sourceField) {
          validationResults.push(`✅ Source field specified: ${sourceField}`);
        } else {
          validationResults.push('⚠️ Source field should be specified for timestamp extraction');
        }
        break;
        
      case 'jsonextract':
        if (!regexPattern) {
          validationResults.push('❌ Regex pattern is required for JSON extract');
        }
        if (!destinationField) {
          validationResults.push('❌ Destination field is required for JSON extract');
        } else {
          const validFields = ['category', 'className', 'methodName', 'severity', 'threadId'];
          if (validFields.includes(destinationField)) {
            validationResults.push('✅ Valid JSON extract destination field');
          } else {
            validationResults.push(`❌ Invalid destination field. Must be one of: ${validFields.join(', ')}`);
          }
        }
        break;
        
      case 'removefields':
        validationResults.push('⚠️ Comma-separated list of fields to remove is required');
        break;
        
      default:
        validationResults.push('✅ Rule type is valid');
    }
    
    result += '\nValidation Results:\n';
    validationResults.forEach(validation => {
      result += `${validation}\n`;
    });
    
    // Test against sample log if provided
    if (testLogSample && regexPattern) {
      result += '\nTest Results:\n';
      try {
        const regex = new RegExp(regexPattern);
        const match = testLogSample.match(regex);
        
        if (match) {
          result += `✅ Pattern matches test log sample\n`;
          if (match.groups) {
            result += `Named groups found:\n`;
            Object.entries(match.groups).forEach(([name, value]) => {
              result += `  ${name}: "${value}"\n`;
            });
          }
        } else {
          result += `❌ Pattern does not match test log sample\n`;
        }
      } catch (e) {
        result += `❌ Error testing pattern: ${e instanceof Error ? e.message : 'Unknown error'}\n`;
      }
    }
    
    result += '\nRecommendations:\n';
    result += '- Test your regex patterns with sample log data before deploying\n';
    result += '- Use named groups in regex for better field extraction\n';
    result += '- Consider the order of rules within groups (AND/OR logic)\n';
    result += '- Monitor rule performance after deployment\n';

    return result;
  } catch (error) {
    throw new Error(`Failed to validate parsing rule: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
