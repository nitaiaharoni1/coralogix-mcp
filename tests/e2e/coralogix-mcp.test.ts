/**
 * Coralogix MCP Server E2E Tests
 */

import { MCPServerTestHelper } from '../helpers/mcp-server.js';

describe('Coralogix MCP Server E2E Tests', () => {
  let server: MCPServerTestHelper;

  beforeAll(async () => {
    // Skip tests if Coralogix credentials are not available
    if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
      console.log('Skipping Coralogix tests - credentials not available');
      return;
    }

    server = new MCPServerTestHelper();
    await server.start();
  }, 30000);

  afterAll(async () => {
    if (server) {
      await server.stop();
    }
  });

  describe('Server Initialization', () => {
    it('should start successfully and list all tools', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      const tools = await server.listTools();
      expect(tools).toBeDefined();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);

      // Check for expected Coralogix tools
      const toolNames = tools.map(tool => tool.name);
      expect(toolNames).toContain('query_dataprime');
      expect(toolNames).toContain('query_lucene');
    });

    it('should have proper tool schemas', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      const tools = await server.listTools();
      
      for (const tool of tools) {
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema.properties).toBeDefined();
      }
    });
  });

  describe('Query Tools', () => {
    it('should handle DataPrime query tool call', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      const result = await server.callTool('query_dataprime', {
        query: 'source logs | limit 1',
        tier: 'TIER_FREQUENT_SEARCH'
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
    });

    it('should handle Lucene query tool call', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      const result = await server.callTool('query_lucene', {
        query: '*',
        limit: 1,
        tier: 'TIER_FREQUENT_SEARCH'
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid tool names', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      const result = await server.callTool('invalid_tool', {});
      expect(result.isError).toBe(true);
    });

    it('should handle missing required parameters', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      const result = await server.callTool('query_dataprime', {});
      expect(result.isError).toBe(true);
    });
  });
}); 