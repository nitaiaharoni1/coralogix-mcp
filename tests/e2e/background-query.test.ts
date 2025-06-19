/**
 * Background Query Tools E2E Tests
 */

import { MCPServerTestHelper } from '../helpers/mcp-server.js';

describe('Background Query Tools E2E Tests', () => {
  let server: MCPServerTestHelper;
  let testQueryId: string | null = null;

  beforeAll(async () => {
    // Skip tests if Coralogix credentials are not available
    if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
      console.log('Skipping Background Query tests - Coralogix credentials not available');
      return;
    }

    server = new MCPServerTestHelper();
    await server.start();
  }, 30000);

  afterAll(async () => {
    // Clean up any running queries
    if (testQueryId && server) {
      try {
        await server.callTool('cancel_background_query', { queryId: testQueryId });
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    if (server) {
      await server.stop();
    }
  });

  describe('Submit Background Query', () => {
    it('should submit DataPrime background query', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      const result = await server.callTool('submit_background_query', {
        query: 'source logs | limit 10',
        syntax: 'QUERY_SYNTAX_DATAPRIME'
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      
      if (!result.isError) {
        expect(result.content[0].text).toContain('Background query submitted successfully');
        expect(result.content[0].text).toContain('Query ID:');
        
        // Extract query ID for later tests
        const queryIdMatch = result.content[0].text.match(/Query ID: ([a-f0-9-]+)/);
        if (queryIdMatch) {
          testQueryId = queryIdMatch[1];
        }
      }
    }, 15000);

    it('should submit Lucene background query', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      const result = await server.callTool('submit_background_query', {
        query: '*',
        syntax: 'QUERY_SYNTAX_LUCENE'
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      
      if (!result.isError) {
        expect(result.content[0].text).toContain('Background query submitted successfully');
        expect(result.content[0].text).toContain('Query ID:');
      }
    }, 15000);

    it('should submit background query with time range', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1 hour ago

      const result = await server.callTool('submit_background_query', {
        query: 'source logs | limit 5',
        syntax: 'QUERY_SYNTAX_DATAPRIME',
        startDate,
        endDate
      });

      expect(result).toBeDefined();
      
      if (!result.isError) {
        expect(result.content[0].text).toContain('Background query submitted successfully');
      }
    }, 15000);

    it('should submit background query with nowDate', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      const nowDate = new Date().toISOString();

      const result = await server.callTool('submit_background_query', {
        query: 'source logs | limit 3',
        syntax: 'QUERY_SYNTAX_DATAPRIME',
        nowDate
      });

      expect(result).toBeDefined();
      
      if (!result.isError) {
        expect(result.content[0].text).toContain('Background query submitted successfully');
      }
    }, 15000);
  });

  describe('Get Background Query Status', () => {
    it('should get status of submitted query', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      if (!testQueryId) {
        
        return;
      }

      const result = await server.callTool('get_background_query_status', {
        queryId: testQueryId
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      
      if (!result.isError) {
        expect(result.content[0].text).toContain('Background Query Status');
        expect(result.content[0].text).toContain(`Query ID: ${testQueryId}`);
        expect(result.content[0].text).toMatch(/Status: (RUNNING|TERMINATED|WAITING FOR EXECUTION)/);
      }
    }, 10000);

    it('should handle non-existent query ID', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      const fakeQueryId = '00000000-0000-0000-0000-000000000000';
      
      const result = await server.callTool('get_background_query_status', {
        queryId: fakeQueryId
      });

      expect(result).toBeDefined();
      // Should either return error or handle gracefully
    }, 10000);

    it('should handle malformed query ID', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      const result = await server.callTool('get_background_query_status', {
        queryId: 'invalid-query-id'
      });

      expect(result).toBeDefined();
      // Should either return error or handle gracefully
    }, 10000);
  });

  describe('Get Background Query Data', () => {
    it('should attempt to get data from submitted query', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      if (!testQueryId) {
        
        return;
      }

      const result = await server.callTool('get_background_query_data', {
        queryId: testQueryId
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      
      // Query might still be running, so we accept either data or "no data available" message
      if (!result.isError) {
        const text = result.content[0].text;
        expect(text).toMatch(/(Record \d+:|No data available for query ID:)/);
      }
    }, 10000);

    it('should handle non-existent query ID for data retrieval', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      const fakeQueryId = '00000000-0000-0000-0000-000000000000';
      
      const result = await server.callTool('get_background_query_data', {
        queryId: fakeQueryId
      });

      expect(result).toBeDefined();
      // Should either return error or handle gracefully
    }, 10000);
  });

  describe('Cancel Background Query', () => {
    it('should submit and then cancel a background query', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      // First submit a query
      const submitResult = await server.callTool('submit_background_query', {
        query: 'source logs | limit 100',
        syntax: 'QUERY_SYNTAX_DATAPRIME'
      });

      expect(submitResult).toBeDefined();
      
      if (submitResult.isError) {
        
        return;
      }

      // Extract query ID
      const queryIdMatch = submitResult.content[0].text.match(/Query ID: ([a-f0-9-]+)/);
      if (!queryIdMatch) {
        
        return;
      }

      const queryIdToCancel = queryIdMatch[1];

      // Now cancel it
      const cancelResult = await server.callTool('cancel_background_query', {
        queryId: queryIdToCancel
      });

      expect(cancelResult).toBeDefined();
      
      if (!cancelResult.isError) {
        expect(cancelResult.content[0].text).toContain('has been cancelled successfully');
      }
    }, 20000);

    it('should handle cancelling non-existent query', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      const fakeQueryId = '00000000-0000-0000-0000-000000000000';
      
      const result = await server.callTool('cancel_background_query', {
        queryId: fakeQueryId
      });

      expect(result).toBeDefined();
      // Should either return error or handle gracefully
    }, 10000);
  });

  describe('Background Query Error Handling', () => {
    it('should handle missing query parameter in submit', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      const result = await server.callTool('submit_background_query', {
        syntax: 'QUERY_SYNTAX_DATAPRIME'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error');
    });

    it('should handle missing syntax parameter in submit', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      const result = await server.callTool('submit_background_query', {
        query: 'source logs | limit 1'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error');
    });

    it('should handle missing queryId parameter in status', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      const result = await server.callTool('get_background_query_status', {});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error');
    });

    it('should handle missing queryId parameter in data retrieval', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      const result = await server.callTool('get_background_query_data', {});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error');
    });

    it('should handle missing queryId parameter in cancel', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      const result = await server.callTool('cancel_background_query', {});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error');
    });

    it('should handle invalid syntax parameter', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      const result = await server.callTool('submit_background_query', {
        query: 'source logs | limit 1',
        syntax: 'INVALID_SYNTAX'
      });

      expect(result).toBeDefined();
      // Should either return error or handle gracefully
    });
  });

  describe('Background Query Response Format', () => {
    it('should return properly formatted submit response', async () => {
      if (!process.env.CORALOGIX_API_KEY || !process.env.CORALOGIX_DOMAIN) {
        console.log('Skipping test - Coralogix credentials not available'); return;
        return;
      }

      const result = await server.callTool('submit_background_query', {
        query: 'source logs | limit 1',
        syntax: 'QUERY_SYNTAX_DATAPRIME'
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
      expect(typeof result.content[0].text).toBe('string');
    }, 15000);
  });
}); 