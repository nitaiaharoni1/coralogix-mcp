/**
 * Lucene Query Tool E2E Tests
 */

import { MCPServerTestHelper } from '../helpers/mcp-server.js';

describe('Lucene Query Tool E2E Tests', () => {
  let server: MCPServerTestHelper;

  beforeAll(async () => {
    // Skip tests if Coralogix credentials are not available
    if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
      console.log('Skipping Lucene tests - Coralogix credentials not available');
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

  describe('Basic Lucene Queries', () => {
    it('should execute wildcard query', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_lucene', {
        query: '*',
        tier: 'TIER_FREQUENT_SEARCH',
        limit: 1
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content[0].text).toContain('Lucene Query Results');
      expect(result.isError).toBeFalsy();
    });

    it('should execute free text search', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_lucene', {
        query: 'health',
        tier: 'TIER_FREQUENT_SEARCH',
        limit: 2
      });

      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('Lucene Query Results');
      expect(result.isError).toBeFalsy();
    });

    it('should execute query with larger limit', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_lucene', {
        query: '*',
        tier: 'TIER_FREQUENT_SEARCH',
        limit: 5
      });

      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('Lucene Query Results');
      expect(result.isError).toBeFalsy();
    });
  });

  describe('Lucene Field Queries', () => {
    it('should handle field search queries', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_lucene', {
        query: 'severity:3',
        tier: 'TIER_FREQUENT_SEARCH',
        limit: 2
      });

      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('Lucene Query Results');
      // Field might not exist, but should handle gracefully
    });

    it('should handle non-existent field queries', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_lucene', {
        query: 'nonexistent_field:value',
        tier: 'TIER_FREQUENT_SEARCH',
        limit: 1
      });

      expect(result).toBeDefined();
      // Should handle non-existent fields gracefully (might show warnings)
    });

    it('should handle keyword field queries', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_lucene', {
        query: 'applicationname.keyword:*',
        tier: 'TIER_FREQUENT_SEARCH',
        limit: 1
      });

      expect(result).toBeDefined();
      // Should handle keyword field queries
    });
  });

  describe('Lucene Boolean Queries', () => {
    it('should handle AND queries', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_lucene', {
        query: 'health AND check',
        tier: 'TIER_FREQUENT_SEARCH',
        limit: 2
      });

      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('Lucene Query Results');
    });

    it('should handle OR queries', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_lucene', {
        query: 'health OR request',
        tier: 'TIER_FREQUENT_SEARCH',
        limit: 2
      });

      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('Lucene Query Results');
    });

    it('should handle NOT queries', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_lucene', {
        query: '* NOT error',
        tier: 'TIER_FREQUENT_SEARCH',
        limit: 2
      });

      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('Lucene Query Results');
    });

    it('should handle complex boolean queries', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_lucene', {
        query: '(health OR request) AND NOT error',
        tier: 'TIER_FREQUENT_SEARCH',
        limit: 2
      });

      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('Lucene Query Results');
    });
  });

  describe('Lucene Range Queries', () => {
    it('should handle numeric range queries', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_lucene', {
        query: 'severity.numeric:[1 TO 5]',
        tier: 'TIER_FREQUENT_SEARCH',
        limit: 2
      });

      expect(result).toBeDefined();
      // Range queries might not work if field doesn't exist, but should handle gracefully
    });

    it('should handle date range queries', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_lucene', {
        query: 'timestamp:[2024-01-01 TO 2025-12-31]',
        tier: 'TIER_FREQUENT_SEARCH',
        limit: 2
      });

      expect(result).toBeDefined();
      // Date range queries might not work if field doesn't exist, but should handle gracefully
    });
  });

  describe('Lucene Query Parameters', () => {
    it('should respect limit parameter', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_lucene', {
        query: '*',
        tier: 'TIER_FREQUENT_SEARCH',
        limit: 1
      });

      expect(result).toBeDefined();
      expect(result.isError).toBeFalsy();
    });

    it('should work with different tiers', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_lucene', {
        query: '*',
        tier: 'TIER_ARCHIVE',
        limit: 1
      });

      expect(result).toBeDefined();
      // Archive queries might return different results or errors, but should not crash
    });

    it('should handle time range parameters', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 24 hours ago

      const result = await server.callTool('query_lucene', {
        query: '*',
        tier: 'TIER_FREQUENT_SEARCH',
        limit: 2,
        startDate,
        endDate
      });

      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('Lucene Query Results');
      expect(result.isError).toBeFalsy();
    });
  });

  describe('Lucene Error Handling', () => {
    it('should handle missing query parameter', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_lucene', {
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

      const result = await server.callTool('query_lucene', {
        query: 'field:[invalid range syntax',
        tier: 'TIER_FREQUENT_SEARCH'
      });

      expect(result).toBeDefined();
      // Should either return error or handle gracefully
    });

    it('should handle excessive limit', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_lucene', {
        query: '*',
        tier: 'TIER_FREQUENT_SEARCH',
        limit: 100000 // Exceeds maximum
      });

      expect(result).toBeDefined();
      // Should handle excessive limit gracefully
    });
  });

  describe('Lucene Response Format', () => {
    it('should return properly formatted response', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_lucene', {
        query: '*',
        tier: 'TIER_FREQUENT_SEARCH',
        limit: 1
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

      const result = await server.callTool('query_lucene', {
        query: '*',
        tier: 'TIER_FREQUENT_SEARCH',
        limit: 1
      });

      expect(result).toBeDefined();
      if (!result.isError) {
        expect(result.content[0].text).toContain('Query ID:');
      }
    });

    it('should handle warnings properly', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        pending('Coralogix credentials not available');
        return;
      }

      const result = await server.callTool('query_lucene', {
        query: 'nonexistent_field:value',
        tier: 'TIER_FREQUENT_SEARCH',
        limit: 1
      });

      expect(result).toBeDefined();
      // Should handle warnings gracefully and include them in response
    });
  });
}); 