import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CoralogixClient } from '../services/coralogix-client.js';

/**
 * Get target
 */
export const getTargetTool: Tool = {
  name: 'get_target',
  description: 'Get current S3 target configuration for log archiving and data export. Use this to: check current archive settings, verify S3 bucket configuration, review data retention policies, and understand archiving setup. Returns S3 bucket details, credentials, and archiving rules.',
  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  }
};

/**
 * Set target
 */
export const setTargetTool: Tool = {
  name: 'set_target',
  description: 'Configure S3 target for archiving logs and data export to external storage. Use this to: set up log archiving to S3, configure data export destinations, establish data lake connections, and manage long-term data retention. Requires S3 bucket access credentials and permissions.',
  inputSchema: {
    type: 'object',
    properties: {
      bucket: {
        type: 'string',
        description: 'S3 bucket name where logs will be archived (e.g., "my-company-coralogix-archive")'
      },
      region: {
        type: 'string',
        description: 'AWS region where the S3 bucket is located (e.g., "us-east-1", "eu-west-1")'
      },
      prefix: {
        type: 'string',
        description: 'Optional S3 key prefix for organizing archived data (e.g., "logs/", "coralogix-archive/")'
      },
      credentials: {
        type: 'object',
        description: 'AWS credentials configuration including access key, secret key, or IAM role for S3 access'
      },
      format: {
        type: 'string',
        enum: ['JSON', 'PARQUET'],
        description: 'Archive format: JSON for human-readable format, PARQUET for optimized analytics format'
      },
      compression: {
        type: 'string',
        enum: ['GZIP', 'NONE'],
        description: 'Compression type for archived files to reduce storage costs'
      }
    },
    required: ['bucket', 'region']
  }
};

/**
 * Validate target
 */
export const validateTargetTool: Tool = {
  name: 'validate_target',
  description: 'Validate S3 target configuration before applying changes. Use this to: test S3 connectivity and permissions, verify bucket access and write permissions, validate configuration settings, and prevent archiving failures. Recommended before setting up new targets.',
  inputSchema: {
    type: 'object',
    properties: {
      bucket: {
        type: 'string',
        description: 'S3 bucket name to validate access to'
      },
      region: {
        type: 'string',
        description: 'AWS region of the S3 bucket'
      },
      prefix: {
        type: 'string',
        description: 'S3 key prefix to validate write access to'
      },
      credentials: {
        type: 'object',
        description: 'AWS credentials to test for S3 access'
      }
    },
    required: ['bucket', 'region']
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

export const targetsTools: Tool[] = [
  getTargetTool,
  setTargetTool,
  validateTargetTool
]; 