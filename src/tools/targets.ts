import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CoralogixClient } from '../services/coralogix-client.js';

/**
 * Get target
 */
export const getTargetTool: Tool = {
  name: 'get_target',
  description: 'Get the current storage target configuration for log archives',
  inputSchema: {
    type: 'object',
    properties: {}
  }
};

/**
 * Set target
 */
export const setTargetTool: Tool = {
  name: 'set_target',
  description: 'Set or update the storage target configuration for log archives',
  inputSchema: {
    type: 'object',
    properties: {
      isActive: {
        type: 'boolean',
        description: 'Whether the target should be active'
      },
      s3: {
        type: 'object',
        properties: {
          bucket: {
            type: 'string',
            description: 'S3 bucket name'
          },
          region: {
            type: 'string',
            description: 'S3 region (e.g., us-west-2)'
          }
        },
        description: 'S3 target configuration'
      },
      ibmCos: {
        type: 'object',
        properties: {
          bucketCrn: {
            type: 'string',
            description: 'IBM COS bucket CRN'
          },
          endpoint: {
            type: 'string',
            description: 'IBM COS endpoint URL'
          },
          serviceCrn: {
            type: 'string',
            description: 'IBM COS service CRN'
          },
          bucketType: {
            type: 'string',
            description: 'IBM COS bucket type'
          }
        },
        description: 'IBM COS target configuration'
      }
    },
    required: ['isActive']
  }
};

/**
 * Validate target
 */
export const validateTargetTool: Tool = {
  name: 'validate_target',
  description: 'Validate a storage target configuration before setting it',
  inputSchema: {
    type: 'object',
    properties: {
      isActive: {
        type: 'boolean',
        description: 'Whether the target should be active'
      },
      s3: {
        type: 'object',
        properties: {
          bucket: {
            type: 'string',
            description: 'S3 bucket name to validate'
          },
          region: {
            type: 'string',
            description: 'S3 region to validate'
          }
        },
        description: 'S3 target configuration to validate'
      },
      ibmCos: {
        type: 'object',
        properties: {
          bucketCrn: {
            type: 'string',
            description: 'IBM COS bucket CRN to validate'
          },
          endpoint: {
            type: 'string',
            description: 'IBM COS endpoint URL to validate'
          },
          serviceCrn: {
            type: 'string',
            description: 'IBM COS service CRN to validate'
          },
          bucketType: {
            type: 'string',
            description: 'IBM COS bucket type to validate'
          }
        },
        description: 'IBM COS target configuration to validate'
      }
    },
    required: ['isActive']
  }
};

/**
 * Handle targets tool calls
 */
export async function handleTargetsTools(
  name: string,
  args: any,
  client: CoralogixClient
): Promise<any> {
  try {
    switch (name) {
      case 'get_target': {
        const response = await client.getTarget();
        
        let targetType = 'none';
        let targetDetails: any = {};
        
        if (response.target?.s3) {
          targetType = 'S3';
          targetDetails = {
            bucket: response.target.s3.bucket,
            region: response.target.s3.region
          };
        } else if (response.target?.ibmCos) {
          targetType = 'IBM COS';
          targetDetails = {
            endpoint: response.target.ibmCos.endpoint,
            bucketType: response.target.ibmCos.bucketType
          };
        }
        
        return {
          success: true,
          message: `📦 Current storage target: ${targetType}`,
          data: {
            target: response.target,
            summary: {
              type: targetType,
              configured: targetType !== 'none',
              details: targetDetails
            }
          }
        };
      }

      case 'set_target': {
        const targetData = {
          isActive: args.isActive,
          s3: args.s3,
          ibmCos: args.ibmCos
        };

        const response = await client.setTarget(targetData);
        
        let targetType = 'none';
        if (args.s3) {
          targetType = 'S3';
        } else if (args.ibmCos) {
          targetType = 'IBM COS';
        }
        
        const statusIcon = args.isActive ? '🟢' : '🔴';
        
        return {
          success: true,
          message: `✅ ${statusIcon} Set storage target to ${targetType} (${args.isActive ? 'active' : 'inactive'})`,
          data: {
            target: response.target,
            configuration: {
              type: targetType,
              active: args.isActive,
              details: args.s3 || args.ibmCos || {}
            }
          }
        };
      }

      case 'validate_target': {
        const targetData = {
          isActive: args.isActive,
          s3: args.s3,
          ibmCos: args.ibmCos
        };

        const response = await client.validateTarget(targetData);
        
        let targetType = 'none';
        if (args.s3) {
          targetType = 'S3';
        } else if (args.ibmCos) {
          targetType = 'IBM COS';
        }
        
        const validationIcon = response.isValid ? '✅' : '❌';
        
        return {
          success: true,
          message: `${validationIcon} Target validation ${response.isValid ? 'passed' : 'failed'} for ${targetType}`,
          data: {
            isValid: response.isValid,
            validatedConfiguration: {
              type: targetType,
              active: args.isActive,
              details: args.s3 || args.ibmCos || {}
            }
          }
        };
      }

      default:
        throw new Error(`Unknown targets tool: ${name}`);
    }
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Failed to execute targets operation: ${error.message}`,
      error: error.message
    };
  }
}

export const targetsTools = [
  getTargetTool,
  setTargetTool,
  validateTargetTool
]; 