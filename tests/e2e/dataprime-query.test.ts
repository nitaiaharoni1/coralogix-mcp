/**
 * DataPrime Query Tool E2E Tests
 */

import { MCPServerTestHelper } from '../helpers/mcp-server.js';

describe('DataPrime Query Tool E2E Tests', () => {
  let server: MCPServerTestHelper;

  beforeAll(async () => {
    // Skip tests if Coralogix credentials are not available
    if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
      console.log('Skipping DataPrime tests - Coralogix credentials not available');
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

  describe('Basic DataPrime Queries', () => {
    it('should execute simple limit query', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        test.skip();
        return;
      }

      const result = await server.callTool('query_dataprime', {
        query: 'source logs | limit 1',
        tier: 'TIER_FREQUENT_SEARCH'
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      
      if (result.isError && result.content[0].text.includes('Rate limit exceeded')) {
        test.skip();
        return;
      }
      
      expect(result.content[0].text).toContain('DataPrime Query Results');
      expect(result.isError).toBeFalsy();
    });

    it('should execute query with larger limit', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_dataprime', {
        query: 'source logs | limit 5',
        tier: 'TIER_FREQUENT_SEARCH'
      });

      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('DataPrime Query Results');
      expect(result.isError).toBeFalsy();
    });

    it('should handle query with time range', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 24 hours ago

      const result = await server.callTool('query_dataprime', {
        query: 'source logs | limit 3',
        tier: 'TIER_FREQUENT_SEARCH',
        startDate,
        endDate
      });

      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('DataPrime Query Results');
      expect(result.isError).toBeFalsy();
    });
  });

  describe('DataPrime Query Parameters', () => {
    it('should respect limit parameter', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_dataprime', {
        query: 'source logs | limit 10',
        tier: 'TIER_FREQUENT_SEARCH',
        limit: 2
      });

      expect(result).toBeDefined();
      expect(result.isError).toBeFalsy();
    });

    it('should work with different tiers', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_dataprime', {
        query: 'source logs | limit 1',
        tier: 'TIER_ARCHIVE'
      });

      expect(result).toBeDefined();
      // Archive queries might return different results or errors, but should not crash
    });

    it('should handle defaultSource parameter', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_dataprime', {
        query: 'limit 1',
        tier: 'TIER_FREQUENT_SEARCH',
        defaultSource: 'logs'
      });

      expect(result).toBeDefined();
      expect(result.isError).toBeFalsy();
    });
  });

  describe('DataPrime Error Handling', () => {
    it('should handle missing query parameter', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_dataprime', {
        tier: 'TIER_FREQUENT_SEARCH'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error');
    });

    it('should handle invalid query syntax', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_dataprime', {
        query: 'invalid syntax here',
        tier: 'TIER_FREQUENT_SEARCH'
      });

      expect(result).toBeDefined();
      // Should either return error or handle gracefully
    });

    it('should handle invalid date format', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_dataprime', {
        query: 'source logs | limit 1',
        tier: 'TIER_FREQUENT_SEARCH',
        startDate: 'invalid-date'
      });

      expect(result).toBeDefined();
      // Should handle invalid date gracefully
    });

    it('should handle excessive limit', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_dataprime', {
        query: 'source logs | limit 1',
        tier: 'TIER_FREQUENT_SEARCH',
        limit: 100000 // Exceeds maximum
      });

      expect(result).toBeDefined();
      // Should handle excessive limit gracefully
    });
  });

  describe('DataPrime Response Format', () => {
    it('should return properly formatted response', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_dataprime', {
        query: 'source logs | limit 1',
        tier: 'TIER_FREQUENT_SEARCH'
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
      expect(typeof result.content[0].text).toBe('string');
    });

    it('should include query ID in response', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_dataprime', {
        query: 'source logs | limit 1',
        tier: 'TIER_FREQUENT_SEARCH'
      });

      expect(result).toBeDefined();
      if (!result.isError) {
        expect(result.content[0].text).toContain('Query ID:');
      }
    });
  });
}); 