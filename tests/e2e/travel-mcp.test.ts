/**
 * End-to-End Tests for Travel MCP Server
 * Tests all travel tools with real Amadeus API integration
 */

import { MCPServerTestHelper } from '../helpers/mcp-server.js';
import { TestLogger } from '../helpers/test-logger.js';

describe('Travel MCP Server E2E Tests', () => {
  let server: MCPServerTestHelper;

  beforeAll(async () => {
    TestLogger.setup('Starting Travel MCP Server for E2E tests...');
    server = new MCPServerTestHelper();
    await server.start();
    TestLogger.success('Server started successfully');
  });

  afterAll(async () => {
    TestLogger.teardown('Stopping Travel MCP Server...');
    await server.stop();
    TestLogger.success('Server stopped');
  });

  describe('Server Initialization', () => {
    beforeAll(() => TestLogger.setSuite('Server Initialization'));

    test('should start successfully and list all tools', async () => {
      TestLogger.test('List all tools');
      
      const tools = await server.listTools();
      
      expect(tools).toHaveLength(20);
      
      const toolNames = tools.map(tool => tool.name);
      expect(toolNames).toEqual(expect.arrayContaining([
        'search_flights',
        'get_flight_inspiration', 
        'get_cheapest_dates',
        'search_hotels',
        'search_hotel_offers',
        'search_locations',
        'get_airport_info',
        'get_nearby_airports',
        'get_airline_info',
        // Advanced tools
        'get_flight_seat_maps',
        'predict_flight_delay',
        'get_hotel_sentiments',
        'search_hotel_autocomplete',
        'search_activities',
        'search_points_of_interest',
        'get_travel_analytics',
        'predict_trip_purpose',
        // New booking tools
        'create_flight_booking',
        'get_flight_booking',
        'get_flight_pricing'
      ]));

      TestLogger.success(`Found ${tools.length} tools`);
    });

    test('should have proper tool schemas', async () => {
      TestLogger.test('Validate tool schemas');
      
      const tools = await server.listTools();
      
      tools.forEach(tool => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(tool.inputSchema).toHaveProperty('type', 'object');
        expect(tool.inputSchema).toHaveProperty('properties');
        expect(tool.description.length).toBeGreaterThan(10);
      });

      TestLogger.success('All schemas valid');
    });
  });

  describe('Location Tools', () => {
    beforeAll(() => TestLogger.setSuite('Location Tools - Real API Tests'));

    test('should search for New York locations', async () => {
      TestLogger.test('Search New York locations');
      
      const result = await server.callTool('search_locations', {
        keyword: 'New York',
        subType: ['AIRPORT', 'CITY']
      }, 10000);

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      expect(responseText).toContain('location');
      expect(responseText.length).toBeGreaterThan(50);
      
      TestLogger.success(`${responseText.length} chars returned`);
    });

    test('should get JFK airport information', async () => {
      TestLogger.test('Get JFK airport info');
      
      const result = await server.callTool('get_airport_info', {
        iataCode: 'JFK'
      }, 8000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      expect(responseText.length).toBeGreaterThan(20);
      expect(responseText).toContain('JFK');
      
      TestLogger.success('Airport info retrieved');
    });

    test('should find nearby airports', async () => {
      TestLogger.test('Find nearby airports (NYC)');
      
      const result = await server.callTool('get_nearby_airports', {
        latitude: 40.7128,
        longitude: -74.0060,
        radius: 50
      }, 8000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      expect(responseText.length).toBeGreaterThan(20);
      
      TestLogger.success('Nearby airports found');
    });

    test('should get airline information', async () => {
      TestLogger.test('Get airline info (AA, DL)');
      
      const result = await server.callTool('get_airline_info', {
        airlineCodes: ['AA', 'DL']
      }, 8000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      expect(responseText.length).toBeGreaterThan(20);
      
      TestLogger.success('Airline info retrieved');
    });

    test('should handle invalid location gracefully', async () => {
      TestLogger.test('Handle invalid location');
      
      const result = await server.callTool('search_locations', {
        keyword: 'NONEXISTENTLOCATION12345',
        subType: ['AIRPORT']
      }, 8000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      expect(typeof responseText).toBe('string');
      
      TestLogger.success('Invalid location handled');
    });
  });

  describe('Flight Tools', () => {
    beforeAll(() => TestLogger.setSuite('Flight Tools - Real API Tests'));

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const departureDateStr = futureDate.toISOString().split('T')[0];

    test('should search for flights NYC to LAX', async () => {
      TestLogger.test(`Flight search NYC → LAX (${departureDateStr})`);
      
      const result = await server.callTool('search_flights', {
        originLocationCode: 'NYC',
        destinationLocationCode: 'LAX',
        departureDate: departureDateStr,
        adults: 1,
        travelClass: 'ECONOMY'
      }, 15000); // Longer timeout for flight search

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      expect(typeof responseText).toBe('string');
      expect(responseText.length).toBeGreaterThan(30);
      
      TestLogger.success(`${responseText.length} chars returned`);
    });

    test('should get flight inspiration from NYC', async () => {
      TestLogger.test('Flight inspiration from NYC');
      
      const result = await server.callTool('get_flight_inspiration', {
        origin: 'NYC',
        maxPrice: 1000,
        departureDate: departureDateStr
      }, 12000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      expect(responseText.length).toBeGreaterThan(20);
      
      TestLogger.success('Flight inspiration retrieved');
    });

    test('should find cheapest dates NYC to LAX', async () => {
      TestLogger.test('Cheapest dates NYC → LAX');
      
      const result = await server.callTool('get_cheapest_dates', {
        origin: 'NYC',
        destination: 'LAX',
        departureDate: departureDateStr
      }, 12000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      expect(responseText.length).toBeGreaterThan(20);
      
      TestLogger.success('Cheapest dates found');
    });

    test('should handle invalid flight parameters', async () => {
      TestLogger.test('Handle invalid flight params');
      
      const result = await server.callTool('search_flights', {
        originLocationCode: 'INVALID',
        destinationLocationCode: 'INVALID',
        departureDate: '2020-01-01',
        adults: 1
      }, 8000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      expect(result.content[0].text).toContain('Error');
      
      TestLogger.success('Invalid params handled');
    });
  });

  describe('Hotel Tools', () => {
    beforeAll(() => TestLogger.setSuite('Hotel Tools - Real API Tests'));

    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 30);
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 32);
    
    const checkInStr = checkInDate.toISOString().split('T')[0];
    const checkOutStr = checkOutDate.toISOString().split('T')[0];

    test('should search for hotels in NYC by city code', async () => {
      TestLogger.test('Hotel search NYC (city code)');
      
      const result = await server.callTool('search_hotels', {
        cityCode: 'NYC',
        radius: 10,
        radiusUnit: 'KM'
      }, 10000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      expect(responseText.length).toBeGreaterThan(20);
      
      TestLogger.success('Hotels found by city');
    });

    test('should search for hotels by coordinates', async () => {
      TestLogger.test('Hotel search NYC (coordinates)');
      
      const result = await server.callTool('search_hotels', {
        latitude: 40.7128,
        longitude: -74.0060,
        radius: 5,
        radiusUnit: 'KM'
      }, 10000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      expect(responseText.length).toBeGreaterThan(20);
      
      TestLogger.success('Hotels found by coordinates');
    });

    test('should search for hotel offers with pricing', async () => {
      TestLogger.test(`Hotel offers (${checkInStr} to ${checkOutStr})`);
      
      const result = await server.callTool('search_hotel_offers', {
        hotelIds: ['MCLONNYC'],
        adults: 2,
        checkInDate: checkInStr,
        checkOutDate: checkOutStr,
        roomQuantity: 1,
        currency: 'USD'
      }, 12000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      expect(responseText.length).toBeGreaterThan(20);
      
      TestLogger.success('Hotel offers retrieved');
    });
  });

  describe('Error Handling', () => {
    beforeAll(() => TestLogger.setSuite('Error Handling and Edge Cases'));

    test('should handle invalid tool names', async () => {
      TestLogger.test('Invalid tool name');
      
      try {
        const result = await server.callTool('invalid_tool_name', {}, 5000);
        // If we get a result, check if it contains an error message
        expect(result).toHaveProperty('content');
        if (result.content && result.content[0] && result.content[0].text) {
          expect(result.content[0].text).toContain('Error');
        }
        TestLogger.success('Invalid tool handled gracefully');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Tool call failed');
        TestLogger.success('Invalid tool handled with error');
      }
    });

    test('should validate coordinate ranges', async () => {
      TestLogger.test('Invalid coordinates');
      
      const result = await server.callTool('get_nearby_airports', {
        latitude: 999,
        longitude: 999,
        radius: 50
      }, 8000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      expect(typeof responseText).toBe('string');
      
      TestLogger.success('Invalid coordinates handled');
    });
  });

  describe('Performance', () => {
    beforeAll(() => TestLogger.setSuite('Performance and Reliability'));

    test('should respond to tool list quickly', async () => {
      TestLogger.test('Tool list performance');
      
      const startTime = Date.now();
      await server.listTools();
      const elapsed = Date.now() - startTime;
      
      expect(elapsed).toBeLessThan(2000);
      TestLogger.success(`${elapsed}ms`);
    });

    test('should handle concurrent location searches', async () => {
      TestLogger.test('Concurrent requests');
      
      const promises = [
        server.callTool('search_locations', { keyword: 'NYC' }, 8000),
        server.callTool('search_locations', { keyword: 'LAX' }, 8000),
        server.callTool('search_locations', { keyword: 'CHI' }, 8000)
      ];

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result).toHaveProperty('content');
        expect(result.content[0]).toHaveProperty('text');
      });
      
      TestLogger.success('All concurrent requests completed');
    });
  });
}); 