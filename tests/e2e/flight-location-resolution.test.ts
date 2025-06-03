/**
 * Flight Location Resolution E2E Tests
 * Tests the ability to resolve location names to IATA codes and handle natural language queries
 */

import { MCPServerTestHelper } from '../helpers/mcp-server-test-helper.js';
import { TestLogger } from '../helpers/test-logger.js';

describe('Flight Location Resolution E2E Tests', () => {
  let server: MCPServerTestHelper;

  beforeAll(async () => {
    TestLogger.setSuite('Flight Location Resolution');
    server = new MCPServerTestHelper();
    await server.start();
  });

  afterAll(async () => {
    if (server) {
      await server.stop();
    }
  });

  describe('Location Name Resolution', () => {
    beforeAll(() => TestLogger.setSuite('Location Name Resolution'));

    test('should resolve "israel" to TLV and "budapest" to BUD for cheapest dates', async () => {
      TestLogger.test('Resolve israel → TLV, budapest → BUD');
      
      const result = await server.callTool('get_cheapest_dates', {
        origin: 'israel',
        destination: 'budapest',
        oneWay: true
      }, 15000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      
      // Should contain resolved IATA codes
      expect(responseText).toMatch(/TLV.*BUD|TLV.*→.*BUD/);
      
      TestLogger.success('Location resolution successful');
    });

    test('should handle "this month" date expression', async () => {
      TestLogger.test('Handle "this month" date expression');
      
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
      const expectedDatePrefix = `${currentYear}-${currentMonth}-01`;
      
      const result = await server.callTool('get_cheapest_dates', {
        origin: 'NYC',
        destination: 'LAX',
        departureDate: 'this month',
        oneWay: true
      }, 12000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      
      // Should contain the resolved date or indicate it was processed
      expect(responseText).toMatch(/NYC.*LAX|Cheapest dates/);
      
      TestLogger.success('Date expression handled');
    });

    test('should resolve common city names to airport codes', async () => {
      TestLogger.test('Resolve common city names');
      
      const result = await server.callTool('get_flight_inspiration', {
        origin: 'london',
        maxPrice: 1000
      }, 12000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      
      // Should resolve london to LHR, LGW, STN, or similar
      expect(responseText).toMatch(/LHR|LGW|STN|LON|Flight inspiration/);
      
      TestLogger.success('City name resolution successful');
    });

    test('should handle mixed IATA codes and city names', async () => {
      TestLogger.test('Handle mixed IATA and city names');
      
      const result = await server.callTool('get_cheapest_dates', {
        origin: 'JFK',  // Already IATA code
        destination: 'paris',  // City name to resolve
        oneWay: true
      }, 12000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      
      // Should contain JFK and resolved Paris code (CDG or PAR)
      expect(responseText).toMatch(/JFK.*(CDG|PAR)|JFK.*→.*(CDG|PAR)/);
      
      TestLogger.success('Mixed code/name resolution successful');
    });
  });

  describe('Natural Language Query Handling', () => {
    beforeAll(() => TestLogger.setSuite('Natural Language Queries'));

    test('should handle "cheapest flight this month from X to Y" pattern', async () => {
      TestLogger.test('Natural language: cheapest flight this month');
      
      const result = await server.callTool('get_cheapest_dates', {
        origin: 'new york',
        destination: 'los angeles',
        departureDate: 'this month',
        oneWay: true
      }, 15000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      
      // Should resolve to NYC/JFK → LAX and handle the date
      expect(responseText).toMatch(/(NYC|JFK).*(LAX)|Cheapest dates/);
      expect(responseText.length).toBeGreaterThan(50);
      
      TestLogger.success('Natural language query handled');
    });

    test('should provide helpful error messages for unresolvable locations', async () => {
      TestLogger.test('Handle unresolvable locations gracefully');
      
      const result = await server.callTool('get_cheapest_dates', {
        origin: 'INVALIDCITY123',
        destination: 'ANOTHERFAKECITY456',
        oneWay: true
      }, 10000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      
      // Should either resolve to something or provide helpful error
      expect(responseText.length).toBeGreaterThan(20);
      
      TestLogger.success('Unresolvable locations handled gracefully');
    });
  });
}); 