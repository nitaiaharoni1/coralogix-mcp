import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CoralogixClient } from '../services/coralogix-client.js';

/**
 * List team groups
 */
export const listTeamGroupsTool: Tool = {
  name: 'list_team_groups',
  description: 'List all team groups for access control management',
  inputSchema: {
    type: 'object',
    properties: {
      teamId: {
        type: 'number',
        description: 'Optional team ID to filter groups'
      }
    }
  }
};

/**
 * Create team group
 */
export const createTeamGroupTool: Tool = {
  name: 'create_team_group',
  description: 'Create a new team group for organizing users and permissions',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name of the team group'
      },
      description: {
        type: 'string',
        description: 'Description of the team group'
      },
      teamId: {
        type: 'number',
        description: 'Team ID to associate with the group'
      },
      externalId: {
        type: 'string',
        description: 'External ID for externally managed groups'
      },
      roleIds: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Array of role IDs to assign to the group'
      },
      userIds: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Array of user IDs to add to the group'
      },
      scopeFilters: {
        type: 'object',
        properties: {
          subsystems: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Subsystem filters for scoped access'
          },
          applications: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Application filters for scoped access'
          }
        },
        description: 'Scope filters for the group'
      },
      nextGenScopeId: {
        type: 'string',
        description: 'Next generation scope ID'
      }
    },
    required: ['name']
  }
};

/**
 * Update team group
 */
export const updateTeamGroupTool: Tool = {
  name: 'update_team_group',
  description: 'Update an existing team group',
  inputSchema: {
    type: 'object',
    properties: {
      groupId: {
        type: 'number',
        description: 'ID of the group to update'
      },
      name: {
        type: 'string',
        description: 'New name for the group'
      },
      description: {
        type: 'string',
        description: 'New description for the group'
      },
      externalId: {
        type: 'string',
        description: 'New external ID for the group'
      },
      roleIds: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Array of role IDs to assign to the group'
      },
      userIds: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Array of user IDs to add to the group'
      },
      scopeFilters: {
        type: 'object',
        properties: {
          subsystems: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Subsystem filters for scoped access'
          },
          applications: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Application filters for scoped access'
          }
        },
        description: 'New scope filters for the group'
      },
      nextGenScopeId: {
        type: 'string',
        description: 'New next generation scope ID'
      }
    },
    required: ['groupId']
  }
};

/**
 * Get team group
 */
export const getTeamGroupTool: Tool = {
  name: 'get_team_group',
  description: 'Get details of a specific team group by ID',
  inputSchema: {
    type: 'object',
    properties: {
      groupId: {
        type: 'number',
        description: 'ID of the group to retrieve'
      }
    },
    required: ['groupId']
  }
};

/**
 * Delete team group
 */
export const deleteTeamGroupTool: Tool = {
  name: 'delete_team_group',
  description: 'Delete a team group',
  inputSchema: {
    type: 'object',
    properties: {
      groupId: {
        type: 'number',
        description: 'ID of the group to delete'
      }
    },
    required: ['groupId']
  }
};

/**
 * Get team group users
 */
export const getTeamGroupUsersTool: Tool = {
  name: 'get_team_group_users',
  description: 'Get all users in a specific team group',
  inputSchema: {
    type: 'object',
    properties: {
      groupId: {
        type: 'number',
        description: 'ID of the group to get users for'
      },
      pageSize: {
        type: 'number',
        description: 'Number of users per page',
        default: 100
      },
      pageToken: {
        type: 'string',
        description: 'Pagination token for next page'
      }
    },
    required: ['groupId']
  }
};

/**
 * Add users to team group
 */
export const addUsersToTeamGroupTool: Tool = {
  name: 'add_users_to_team_group',
  description: 'Add users to a team group',
  inputSchema: {
    type: 'object',
    properties: {
      groupId: {
        type: 'number',
        description: 'ID of the group to add users to'
      },
      userIds: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Array of user IDs to add to the group'
      }
    },
    required: ['groupId', 'userIds']
  }
};

/**
 * Remove users from team group
 */
export const removeUsersFromTeamGroupTool: Tool = {
  name: 'remove_users_from_team_group',
  description: 'Remove users from a team group',
  inputSchema: {
    type: 'object',
    properties: {
      groupId: {
        type: 'number',
        description: 'ID of the group to remove users from'
      }
    },
    required: ['groupId']
  }
};

/**
 * Handle team permissions tool calls
 */
export async function handleTeamPermissionsTools(
  name: string,
  args: any,
  client: CoralogixClient
): Promise<any> {
  try {
    switch (name) {
      case 'list_team_groups': {
        const response = await client.getTeamGroups(args.teamId);
        
        return {
          success: true,
          message: `👥 Retrieved ${response.groups?.length || 0} team groups`,
          data: {
            groups: response.groups,
            summary: {
              total: response.groups?.length || 0,
              teamId: args.teamId || 'all teams'
            }
          }
        };
      }

      case 'create_team_group': {
        const groupData = {
          name: args.name,
          description: args.description,
          teamId: args.teamId ? { id: args.teamId } : undefined,
          externalId: args.externalId,
          roleIds: args.roleIds?.map((id: string) => ({ id })),
          userIds: args.userIds?.map((id: string) => ({ id })),
          scopeFilters: args.scopeFilters,
          nextGenScopeId: args.nextGenScopeId
        };

        const response = await client.createTeamGroup(groupData);
        
        return {
          success: true,
          message: `✅ Created team group "${args.name}"`,
          data: {
            groupId: response.groupId,
            details: {
              name: args.name,
              description: args.description,
              teamId: args.teamId,
              rolesCount: args.roleIds?.length || 0,
              usersCount: args.userIds?.length || 0,
              scoped: !!args.scopeFilters
            }
          }
        };
      }

      case 'update_team_group': {
        const groupData = {
          groupId: { id: args.groupId },
          name: args.name,
          description: args.description,
          externalId: args.externalId,
          roleUpdates: args.roleIds ? {
            roleIds: args.roleIds.map((id: string) => ({ id }))
          } : undefined,
          userUpdates: args.userIds ? {
            userIds: args.userIds.map((id: string) => ({ id }))
          } : undefined,
          scopeFilters: args.scopeFilters,
          nextGenScopeId: args.nextGenScopeId
        };

        await client.updateTeamGroup(groupData);
        
        const updatedFields = Object.keys(args).filter(key => key !== 'groupId' && args[key] !== undefined);
        
        return {
          success: true,
          message: `✅ Updated team group ${args.groupId}`,
          data: {
            groupId: args.groupId,
            updatedFields,
            changes: {
              name: args.name,
              description: args.description,
              rolesCount: args.roleIds?.length,
              usersCount: args.userIds?.length
            }
          }
        };
      }

      case 'get_team_group': {
        const response = await client.getTeamGroup(args.groupId);
        
        return {
          success: true,
          message: `👥 Retrieved team group "${response.group?.name}"`,
          data: {
            group: response.group,
            summary: {
              id: response.group?.groupId?.id,
              name: response.group?.name,
              description: response.group?.description,
              teamId: response.group?.teamId?.id,
              rolesCount: response.group?.roles?.length || 0,
              origin: response.group?.groupOrigin,
              createdAt: response.group?.createdAt,
              updatedAt: response.group?.updatedAt
            }
          }
        };
      }

      case 'delete_team_group': {
        await client.deleteTeamGroup(args.groupId);
        
        return {
          success: true,
          message: `🗑️ Deleted team group ${args.groupId}`,
          data: {
            deletedGroupId: args.groupId
          }
        };
      }

      case 'get_team_group_users': {
        const response = await client.getTeamGroupUsers(args.groupId, args.pageSize, args.pageToken);
        
        const hasMorePages = !response.noMorePages;
        
        return {
          success: true,
          message: `👤 Retrieved ${response.users?.length || 0} users from group ${args.groupId}`,
          data: {
            users: response.users,
            pagination: {
              hasMorePages,
              nextToken: response.token?.nextPageToken,
              currentPageSize: response.users?.length || 0
            }
          }
        };
      }

      case 'add_users_to_team_group': {
        const userIds = args.userIds.map((id: string) => ({ id }));
        const response = await client.addUsersToTeamGroup(args.groupId, userIds);
        
        return {
          success: true,
          message: `✅ Added ${args.userIds.length} users to team group ${args.groupId}`,
          data: {
            groupId: args.groupId,
            addedUsers: args.userIds,
            teamId: response.teamId?.id
          }
        };
      }

      case 'remove_users_from_team_group': {
        await client.removeUsersFromTeamGroup(args.groupId);
        
        return {
          success: true,
          message: `🗑️ Removed users from team group ${args.groupId}`,
          data: {
            groupId: args.groupId
          }
        };
      }

      default:
        throw new Error(`Unknown team permissions tool: ${name}`);
    }
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Failed to execute team permissions operation: ${error.message}`,
      error: error.message
    };
  }
}

export const teamPermissionsTools = [
  listTeamGroupsTool,
  createTeamGroupTool,
  updateTeamGroupTool,
  getTeamGroupTool,
  deleteTeamGroupTool,
  getTeamGroupUsersTool,
  addUsersToTeamGroupTool,
  removeUsersFromTeamGroupTool
]; 