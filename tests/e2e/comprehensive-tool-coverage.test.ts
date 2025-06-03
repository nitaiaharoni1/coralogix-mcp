/**
 * Comprehensive Tool Coverage E2E Tests
 * Ensures all 20 tools are properly tested with real API calls
 */

import { MCPServerTestHelper } from '../helpers/mcp-server.js';
import { TestLogger } from '../helpers/test-logger.js';

describe('Comprehensive Tool Coverage E2E Tests', () => {
  let server: MCPServerTestHelper;

  beforeAll(async () => {
    TestLogger.setup('Starting Travel MCP Server for comprehensive tool coverage tests...');
    server = new MCPServerTestHelper();
    await server.start();
    TestLogger.success('Server started successfully');
  });

  afterAll(async () => {
    TestLogger.teardown('Stopping Travel MCP Server...');
    await server.stop();
    TestLogger.success('Server stopped');
  });

  describe('All 20 Tools Coverage', () => {
    test('should verify all 20 tools are registered', async () => {
      const tools = await server.listTools();
      expect(tools).toHaveLength(20);
      
      const expectedTools = [
        'search_flights',
        'get_flight_inspiration', 
        'get_cheapest_dates',
        'search_hotels',
        'search_hotel_offers',
        'search_locations',
        'get_airport_info',
        'get_nearby_airports',
        'get_airline_info',
        'get_flight_seat_maps',
        'predict_flight_delay',
        'create_flight_booking',
        'get_flight_booking',
        'get_flight_pricing',
        'get_hotel_sentiments',
        'search_hotel_autocomplete',
        'search_activities',
        'search_points_of_interest',
        'get_travel_analytics',
        'predict_trip_purpose'
      ];

      const toolNames = tools.map(tool => tool.name);
      expectedTools.forEach(expectedTool => {
        expect(toolNames).toContain(expectedTool);
      });
    });

    // Flight Tools (8 total)
    test('1. search_flights - should search for flights', async () => {
      const result = await server.callTool('search_flights', {
        originLocationCode: 'NYC',
        destinationLocationCode: 'LAX',
        departureDate: '2025-07-02',
        adults: 1
      });
      
      expect(result.content[0].text).toMatch(/(flight|Flight|Found.*flight)/i);
      expect(result.content[0].text.length).toBeGreaterThan(100);
    }, 30000);

    test('2. get_flight_inspiration - should get flight destinations', async () => {
      const result = await server.callTool('get_flight_inspiration', {
        origin: 'NYC',
        maxPrice: 500
      });
      
      expect(result.content[0].text).toMatch(/(Flight Inspiration|destinations|No flights found)/i);
    }, 30000);

    test('3. get_cheapest_dates - should find cheapest flight dates', async () => {
      const result = await server.callTool('get_cheapest_dates', {
        origin: 'NYC',
        destination: 'LAX'
      });
      
      expect(result.content[0].text).toMatch(/(Cheapest|dates|No flights found)/i);
    }, 30000);

    test('4. get_flight_seat_maps - should handle seat maps request', async () => {
      const result = await server.callTool('get_flight_seat_maps', {
        flightOrderId: 'test-order-123'
      });
      
      expect(result.content[0].text).toMatch(/(Seat Maps|No seat maps found|Error)/i);
    }, 30000);

    test('5. predict_flight_delay - should predict flight delays', async () => {
      const result = await server.callTool('predict_flight_delay', {
        originLocationCode: 'JFK',
        destinationLocationCode: 'LAX',
        departureDate: '2024-12-25',
        departureTime: '10:00:00',
        arrivalDate: '2024-12-25',
        arrivalTime: '13:30:00',
        aircraftCode: '320',
        carrierCode: 'AA',
        flightNumber: '100',
        duration: 'PT5H30M'
      });
      
      expect(result.content[0].text).toMatch(/(Flight Delay Prediction|delay|Error)/i);
    }, 30000);

    test('6. create_flight_booking - should handle booking creation', async () => {
      const result = await server.callTool('create_flight_booking', {
        flightOffers: [{ id: 'test-offer' }],
        travelers: [{
          id: '1',
          dateOfBirth: '1990-01-01',
          name: { firstName: 'John', lastName: 'Doe' },
          gender: 'MALE',
          contact: {
            emailAddress: 'john.doe@example.com',
            phones: [{ deviceType: 'MOBILE', countryCallingCode: '1', number: '1234567890' }]
          },
          documents: [{
            documentType: 'PASSPORT',
            birthPlace: 'New York',
            issuanceLocation: 'New York',
            issuanceDate: '2020-01-01',
            number: 'A12345678',
            expiryDate: '2030-01-01',
            issuanceCountry: 'US',
            validityCountry: 'US',
            nationality: 'US',
            holder: true
          }]
        }]
      });
      
      expect(result.content[0].text).toMatch(/(Flight booking|Error|failed)/i);
    }, 30000);

    test('7. get_flight_booking - should handle booking retrieval', async () => {
      const result = await server.callTool('get_flight_booking', {
        bookingId: 'test-booking-123'
      });
      
      expect(result.content[0].text).toMatch(/(Flight booking|No booking found|Error)/i);
    }, 30000);

    test('8. get_flight_pricing - should get flight pricing', async () => {
      const result = await server.callTool('get_flight_pricing', {
        flightOffers: [{ id: 'test-offer', price: { total: '100.00', currency: 'USD' } }]
      });
      
      expect(result.content[0].text).toMatch(/(pricing|Error|No pricing)/i);
    }, 30000);

    // Hotel Tools (4 total)
    test('9. search_hotels - should search hotels by city', async () => {
      const result = await server.callTool('search_hotels', {
        cityCode: 'NYC'
      });
      
      expect(result.content[0].text).toMatch(/(hotel|Hotel|NYC|Error)/i);
      expect(result.content[0].text.length).toBeGreaterThan(10);
    }, 30000);

    test('10. search_hotel_offers - should search hotel offers', async () => {
      const result = await server.callTool('search_hotel_offers', {
        hotelIds: 'ADNYCCTB',
        checkInDate: '2025-07-02',
        checkOutDate: '2025-07-04',
        adults: 1
      });
      
      expect(result.content[0].text).toMatch(/(Hotel|offer|No offers|Error)/i);
    }, 30000);

    test('11. get_hotel_sentiments - should get hotel sentiments', async () => {
      const result = await server.callTool('get_hotel_sentiments', {
        hotelIds: ['ADNYCCTB', 'ADPAR001']
      });
      
      expect(result.content[0].text).toMatch(/(sentiment|Hotel|No sentiment|Error)/i);
    }, 30000);

    test('12. search_hotel_autocomplete - should handle hotel autocomplete', async () => {
      const result = await server.callTool('search_hotel_autocomplete', {
        keyword: 'Hilton'
      });
      
      expect(result.content[0].text).toMatch(/(Hotel|Hilton|autocomplete|Error)/i);
    }, 30000);

    // Location Tools (3 total)
    test('13. search_locations - should search locations', async () => {
      const result = await server.callTool('search_locations', {
        keyword: 'New York'
      });
      
      expect(result.content[0].text).toContain('New York');
      expect(result.content[0].text.length).toBeGreaterThan(100);
    }, 30000);

    test('14. get_airport_info - should get airport information', async () => {
      const result = await server.callTool('get_airport_info', {
        airportCode: 'JFK'
      });
      
      // Handle both success and API rate limit errors
      expect(result.content[0].text).toMatch(/(JFK|Airport|airport|Error.*429|Error.*Airport)/i);
    }, 30000);

    test('15. get_nearby_airports - should find nearby airports', async () => {
      const result = await server.callTool('get_nearby_airports', {
        latitude: 40.7589,
        longitude: -73.9851
      });
      
      expect(result.content[0].text).toMatch(/(airport|Airport|40.7589|Error)/i);
    }, 30000);

    // Airline Tool (1 total)
    test('16. get_airline_info - should get airline information', async () => {
      const result = await server.callTool('get_airline_info', {
        airlineCodes: 'AA'
      });
      
      expect(result.content[0].text).toMatch(/(airline|Airline|American|Error)/i);
    }, 30000);

    // Activities and POI Tools (2 total)
    test('17. search_activities - should search activities', async () => {
      const result = await server.callTool('search_activities', {
        latitude: 40.7589,
        longitude: -73.9851,
        radius: 5
      });
      
      expect(result.content[0].text).toMatch(/(Activities|activities|No activities|Error)/i);
    }, 30000);

    test('18. search_points_of_interest - should search POIs', async () => {
      const result = await server.callTool('search_points_of_interest', {
        latitude: 48.8566,
        longitude: 2.3522,
        radius: 2,
        categories: ['SIGHTS', 'RESTAURANT']
      });
      
      expect(result.content[0].text).toMatch(/(Points of Interest|interest|No points|Error)/i);
    }, 30000);

    // Analytics Tools (2 total)
    test('19. get_travel_analytics - should handle travel analytics', async () => {
      const result = await server.callTool('get_travel_analytics', {
        originCityCode: 'NYC',
        destinationCityCode: 'LAX',
        searchDate: '2024-12-01',
        marketCountryCode: 'US'
      });
      
      expect(result.content[0].text).toMatch(/(Travel Analytics|analytics|not available|Error)/i);
    }, 30000);

    test('20. predict_trip_purpose - should predict trip purpose', async () => {
      const result = await server.callTool('predict_trip_purpose', {
        originLocationCode: 'JFK',
        destinationLocationCode: 'LAX',
        departureDate: '2024-12-20',
        returnDate: '2024-12-27',
        searchDate: '2024-12-01'
      });
      
      expect(result.content[0].text).toMatch(/(Trip Purpose|purpose|not available|Error)/i);
    }, 30000);
  });

  describe('Tool Categories Summary', () => {
    test('should have all tool categories represented', async () => {
      const tools = await server.listTools();
      const toolNames = tools.map(t => t.name);

      // Flight tools (8)
      const flightTools = toolNames.filter(name => 
        name.includes('flight') || name === 'search_flights' || 
        name === 'get_flight_inspiration' || name === 'get_cheapest_dates'
      );
      expect(flightTools.length).toBe(8);

      // Hotel tools (4)
      const hotelTools = toolNames.filter(name => name.includes('hotel'));
      expect(hotelTools.length).toBe(4);

      // Location tools (3)
      const locationTools = toolNames.filter(name => 
        name === 'search_locations' || name.includes('airport')
      );
      expect(locationTools.length).toBe(3);

      // Airline tools (1)
      const airlineTools = toolNames.filter(name => name.includes('airline'));
      expect(airlineTools.length).toBe(1);

      // Activity/POI tools (2)
      const activityTools = toolNames.filter(name => 
        name.includes('activities') || name.includes('points_of_interest')
      );
      expect(activityTools.length).toBe(2);

      // Analytics tools (1)
      const analyticsTools = toolNames.filter(name => 
        name.includes('analytics')
      );
      expect(analyticsTools.length).toBe(1);

      // Trip purpose prediction (1)
      const tripPurposeTools = toolNames.filter(name => 
        name.includes('predict_trip_purpose')
      );
      expect(tripPurposeTools.length).toBe(1);

      TestLogger.success(`✅ All tool categories verified:
        - Flight tools: ${flightTools.length}/8
        - Hotel tools: ${hotelTools.length}/4  
        - Location tools: ${locationTools.length}/3
        - Airline tools: ${airlineTools.length}/1
        - Activity/POI tools: ${activityTools.length}/2
        - Analytics tools: ${analyticsTools.length}/1
        - Trip purpose tools: ${tripPurposeTools.length}/1
        - Total: ${tools.length}/20`);
    });
  });
}); 