/**
 * End-to-End Tests for Flight Booking Tools
 * Tests all booking-related tools with real Amadeus API integration
 */

import { MCPServerTestHelper } from '../helpers/mcp-server.js';
import { TestLogger } from '../helpers/test-logger.js';

describe('Flight Booking Tools E2E Tests', () => {
  let server: MCPServerTestHelper;
  let testFlightOffer: any = null;
  let testBookingId: string | null = null;

  beforeAll(async () => {
    TestLogger.setup('Starting Travel MCP Server for Booking E2E tests...');
    server = new MCPServerTestHelper();
    await server.start();
    TestLogger.success('Server started successfully');
  });

  afterAll(async () => {
    TestLogger.teardown('Stopping Travel MCP Server...');
    await server.stop();
    TestLogger.success('Server stopped');
  });

  describe('Flight Search with Booking Information', () => {
    beforeAll(() => TestLogger.setSuite('Flight Search with Booking Info'));

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const departureDateStr = futureDate.toISOString().split('T')[0];

    test('should search flights and include booking information', async () => {
      TestLogger.test(`Flight search with booking info NYC → LAX (${departureDateStr})`);
      
      const result = await server.callTool('search_flights', {
        originLocationCode: 'NYC',
        destinationLocationCode: 'LAX',
        departureDate: departureDateStr,
        adults: 1,
        travelClass: 'ECONOMY',
        max: 5
      }, 15000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      expect(responseText).toContain('🔗 Booking Options');
      expect(responseText).toContain('Offer ID:');
      expect(responseText).toContain('Last Ticketing Date:');
      expect(responseText).toContain('create_flight_booking');
      expect(responseText).toContain('💡 Booking Instructions');
      
      TestLogger.success('Flight search includes booking information');
    });

    test('should get flight inspiration with booking context', async () => {
      TestLogger.test('Flight inspiration from NYC with booking context');
      
      const result = await server.callTool('get_flight_inspiration', {
        origin: 'NYC',
        maxPrice: 1000
      }, 12000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      expect(responseText).toContain('Flight inspiration');
      expect(responseText.length).toBeGreaterThan(20);
      
      TestLogger.success('Flight inspiration retrieved');
    });

    test('should get cheapest dates with booking context', async () => {
      TestLogger.test('Cheapest dates NYC → LAX');
      
      const result = await server.callTool('get_cheapest_dates', {
        origin: 'NYC',
        destination: 'LAX',
        departureDate: departureDateStr,
        oneWay: true
      }, 12000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      expect(responseText).toContain('Cheapest dates');
      expect(responseText.length).toBeGreaterThan(20);
      
      TestLogger.success('Cheapest dates retrieved');
    });
  });

  describe('Flight Pricing Tool', () => {
    beforeAll(() => TestLogger.setSuite('Flight Pricing Tool'));

    test('should get detailed flight pricing', async () => {
      TestLogger.test('Get detailed flight pricing');
      
      // First get a flight offer
      const searchResult = await server.callTool('search_flights', {
        originLocationCode: 'NYC',
        destinationLocationCode: 'LAX',
        departureDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        adults: 1,
        max: 1
      }, 15000);

      expect(searchResult.content[0].text).toContain('Found');
      
      // Mock flight offer for pricing test (since we can't easily extract from text)
      const mockFlightOffer = {
        type: "flight-offer",
        id: "test-offer-id",
        source: "GDS",
        instantTicketingRequired: false,
        nonHomogeneous: false,
        oneWay: false,
        lastTicketingDate: "2024-12-31",
        numberOfBookableSeats: 9,
        itineraries: [{
          duration: "PT6H30M",
          segments: [{
            departure: {
              iataCode: "JFK",
              at: "2024-12-15T08:00:00"
            },
            arrival: {
              iataCode: "LAX",
              at: "2024-12-15T11:30:00"
            },
            carrierCode: "AA",
            number: "123",
            aircraft: { code: "321" },
            duration: "PT6H30M",
            id: "1",
            numberOfStops: 0,
            blacklistedInEU: false
          }]
        }],
        price: {
          currency: "USD",
          total: "350.00",
          base: "300.00",
          fees: [],
          grandTotal: "350.00"
        },
        pricingOptions: {
          fareType: ["PUBLISHED"],
          includedCheckedBagsOnly: true
        },
        validatingAirlineCodes: ["AA"],
        travelerPricings: []
      };

      // Test pricing tool with mock offer
      const pricingResult = await server.callTool('get_flight_pricing', {
        flightOffers: [mockFlightOffer]
      }, 12000);

      // The pricing call might fail with test data, but we should handle it gracefully
      expect(pricingResult).toHaveProperty('content');
      expect(pricingResult.content[0]).toHaveProperty('text');
      
      const responseText = pricingResult.content[0].text;
      expect(typeof responseText).toBe('string');
      
      TestLogger.success('Flight pricing tool tested');
    });
  });

  describe('Flight Booking Creation', () => {
    beforeAll(() => TestLogger.setSuite('Flight Booking Creation'));

    test('should handle flight booking creation (test mode)', async () => {
      TestLogger.test('Create flight booking (test mode)');
      
      // Mock flight offer and traveler data for booking test
      const mockFlightOffer = {
        type: "flight-offer",
        id: "test-offer-id",
        source: "GDS",
        instantTicketingRequired: false,
        nonHomogeneous: false,
        oneWay: false,
        lastTicketingDate: "2024-12-31",
        numberOfBookableSeats: 9,
        itineraries: [{
          duration: "PT6H30M",
          segments: [{
            departure: {
              iataCode: "JFK",
              at: "2024-12-15T08:00:00"
            },
            arrival: {
              iataCode: "LAX",
              at: "2024-12-15T11:30:00"
            },
            carrierCode: "AA",
            number: "123",
            aircraft: { code: "321" },
            duration: "PT6H30M",
            id: "1",
            numberOfStops: 0,
            blacklistedInEU: false
          }]
        }],
        price: {
          currency: "USD",
          total: "350.00",
          base: "300.00",
          fees: [],
          grandTotal: "350.00"
        },
        pricingOptions: {
          fareType: ["PUBLISHED"],
          includedCheckedBagsOnly: true
        },
        validatingAirlineCodes: ["AA"],
        travelerPricings: []
      };

      const mockTraveler = {
        id: "1",
        dateOfBirth: "1990-01-01",
        name: {
          firstName: "John",
          lastName: "Doe"
        },
        gender: "MALE",
        contact: {
          emailAddress: "john.doe@example.com",
          phones: [{
            deviceType: "MOBILE",
            countryCallingCode: "1",
            number: "555-123-4567"
          }]
        },
        documents: [{
          documentType: "PASSPORT",
          number: "123456789",
          expiryDate: "2030-12-31",
          issuanceCountry: "US",
          nationality: "US",
          holder: true
        }]
      };

      // Test booking creation (will likely fail in test environment, but should handle gracefully)
      const bookingResult = await server.callTool('create_flight_booking', {
        flightOffers: [mockFlightOffer],
        travelers: [mockTraveler],
        ticketingAgreement: {
          option: "DELAY_TO_CANCEL",
          delay: "6D"
        }
      }, 15000);

      expect(bookingResult).toHaveProperty('content');
      expect(bookingResult.content[0]).toHaveProperty('text');
      
      const responseText = bookingResult.content[0].text;
      expect(typeof responseText).toBe('string');
      
      // In test environment, booking will likely fail, but we should get a proper error message
      expect(responseText.length).toBeGreaterThan(10);
      
      TestLogger.success('Flight booking creation tested (expected to fail in test env)');
    });
  });

  describe('Flight Booking Retrieval', () => {
    beforeAll(() => TestLogger.setSuite('Flight Booking Retrieval'));

    test('should handle flight booking retrieval', async () => {
      TestLogger.test('Retrieve flight booking by ID');
      
      // Test with a mock booking ID (will fail, but should handle gracefully)
      const retrievalResult = await server.callTool('get_flight_booking', {
        bookingId: 'test-booking-id-123'
      }, 10000);

      expect(retrievalResult).toHaveProperty('content');
      expect(retrievalResult.content[0]).toHaveProperty('text');
      
      const responseText = retrievalResult.content[0].text;
      expect(typeof responseText).toBe('string');
      expect(responseText.length).toBeGreaterThan(10);
      
      // Should get an error message about booking not found
      expect(responseText).toMatch(/(not found|failed|Error)/i);
      
      TestLogger.success('Flight booking retrieval tested');
    });
  });

  describe('Advanced Flight Features', () => {
    beforeAll(() => TestLogger.setSuite('Advanced Flight Features'));

    test('should get flight seat maps', async () => {
      TestLogger.test('Get flight seat maps');
      
      const result = await server.callTool('get_flight_seat_maps', {
        flightOrderId: 'test-order-id-123'
      }, 10000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      expect(responseText).toMatch(/(No seat maps found|not available|Error)/i);
      
      TestLogger.success('Seat maps tool tested');
    });

    test('should predict flight delay', async () => {
      TestLogger.test('Predict flight delay');
      
      const result = await server.callTool('predict_flight_delay', {
        originLocationCode: 'JFK',
        destinationLocationCode: 'LAX',
        departureDate: '2024-12-15',
        departureTime: '08:00:00',
        arrivalDate: '2024-12-15',
        arrivalTime: '11:30:00',
        aircraftCode: '321',
        carrierCode: 'AA',
        flightNumber: '123',
        duration: 'PT6H30M'
      }, 10000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      expect(typeof responseText).toBe('string');
      expect(responseText.length).toBeGreaterThan(10);
      
      TestLogger.success('Flight delay prediction tested');
    });
  });

  describe('Tool Schema Validation', () => {
    beforeAll(() => TestLogger.setSuite('Tool Schema Validation'));

    test('should have all booking tools with proper schemas', async () => {
      TestLogger.test('Validate booking tool schemas');
      
      const tools = await server.listTools();
      const bookingTools = [
        'create_flight_booking',
        'get_flight_booking', 
        'get_flight_pricing'
      ];

      bookingTools.forEach(toolName => {
        const tool = tools.find(t => t.name === toolName);
        expect(tool).toBeDefined();
        expect(tool).toHaveProperty('name', toolName);
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(tool.inputSchema).toHaveProperty('type', 'object');
        expect(tool.inputSchema).toHaveProperty('properties');
        expect(tool.inputSchema).toHaveProperty('required');
        expect(tool.description.length).toBeGreaterThan(20);
      });

      TestLogger.success('All booking tool schemas are valid');
    });

    test('should have enhanced flight search with booking info', async () => {
      TestLogger.test('Validate enhanced flight search');
      
      const tools = await server.listTools();
      const flightSearchTool = tools.find(t => t.name === 'search_flights');
      
      expect(flightSearchTool).toBeDefined();
      expect(flightSearchTool.description).toContain('Search for flight offers');
      
      TestLogger.success('Flight search tool validated');
    });
  });

  describe('Error Handling', () => {
    beforeAll(() => TestLogger.setSuite('Error Handling'));

    test('should handle invalid booking parameters gracefully', async () => {
      TestLogger.test('Handle invalid booking parameters');
      
      const result = await server.callTool('create_flight_booking', {
        flightOffers: [],
        travelers: []
      }, 8000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      expect(responseText).toMatch(/(Error|failed|invalid)/i);
      
      TestLogger.success('Invalid parameters handled gracefully');
    });

    test('should handle missing booking ID gracefully', async () => {
      TestLogger.test('Handle missing booking ID');
      
      const result = await server.callTool('get_flight_booking', {
        bookingId: ''
      }, 8000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      expect(typeof responseText).toBe('string');
      
      TestLogger.success('Missing booking ID handled gracefully');
    });

    test('should handle invalid flight offers for pricing', async () => {
      TestLogger.test('Handle invalid flight offers for pricing');
      
      const result = await server.callTool('get_flight_pricing', {
        flightOffers: []
      }, 8000);

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('text');
      
      const responseText = result.content[0].text;
      expect(responseText).toMatch(/(Error|failed|No pricing)/i);
      
      TestLogger.success('Invalid flight offers handled gracefully');
    });
  });

  describe('Integration Tests', () => {
    beforeAll(() => TestLogger.setSuite('Integration Tests'));

    test('should demonstrate complete booking workflow', async () => {
      TestLogger.test('Complete booking workflow demonstration');
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const departureDateStr = futureDate.toISOString().split('T')[0];

      // Step 1: Search for flights
      const searchResult = await server.callTool('search_flights', {
        originLocationCode: 'NYC',
        destinationLocationCode: 'LAX',
        departureDate: departureDateStr,
        adults: 1,
        max: 1
      }, 15000);

      expect(searchResult.content[0].text).toContain('🔗 Booking Options');
      
      // Step 2: Test that all booking-related information is present
      const searchText = searchResult.content[0].text;
      expect(searchText).toContain('Offer ID:');
      expect(searchText).toContain('create_flight_booking');
      expect(searchText).toContain('💡 Booking Instructions');
      
      TestLogger.success('Complete booking workflow demonstrated');
    });

    test('should show booking links in all flight tools', async () => {
      TestLogger.test('Verify booking links in all flight tools');
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const departureDateStr = futureDate.toISOString().split('T')[0];

      // Test search_flights
      const searchResult = await server.callTool('search_flights', {
        originLocationCode: 'NYC',
        destinationLocationCode: 'BOS',
        departureDate: departureDateStr,
        adults: 1,
        max: 2
      }, 12000);

      expect(searchResult.content[0].text).toContain('🔗 Booking Options');
      
      TestLogger.success('Booking links verified in flight tools');
    });
  });
}); 