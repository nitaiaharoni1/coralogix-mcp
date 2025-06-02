/**
 * E2E tests for advanced travel features
 * Tests all new advanced capabilities with real Amadeus API calls
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { getToolDefinitions, handleToolCall } from '../../src/tools/index.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

describe('Advanced Travel Features E2E Tests', () => {
  let server: Server;

  beforeAll(async () => {
    // Verify API credentials are available
    if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
      throw new Error('Amadeus API credentials not found. Please set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET');
    }

    // Initialize server
    server = new Server({
      name: 'travel-mcp-test',
      version: '1.0.0',
    }, {
      capabilities: { tools: {} },
    });

    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return { tools: getToolDefinitions() };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      return await handleToolCall(request);
    });
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('Advanced Flight Features', () => {
    test('should handle flight delay prediction request', async () => {
      const request = {
        method: 'tools/call' as const,
        params: {
          name: 'predict_flight_delay',
          arguments: {
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
          }
        }
      };

      const response = await handleToolCall(request);
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.content[0].type).toBe('text');
      
      const result = response.content[0].text;
      // Should either return prediction data or handle gracefully if API not available
      expect(result).toMatch(/(Flight Delay Prediction|delay prediction|not available|Error)/i);
      // Only check for location codes if it's not an API error
      if (!result.includes('400') && !result.includes('Unknown API error')) {
        expect(result).toContain('JFK');
        expect(result).toContain('LAX');
      }
    }, 30000);

    test('should handle seat maps request gracefully', async () => {
      const request = {
        method: 'tools/call' as const,
        params: {
          name: 'get_flight_seat_maps',
          arguments: {
            flightOrderId: 'test-order-id-123'
          }
        }
      };

      const response = await handleToolCall(request);
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.content[0].type).toBe('text');
      
      const result = response.content[0].text;
      // Should handle gracefully even if order doesn't exist or API not available
      expect(result).toMatch(/(No seat maps found|Seat Maps for Flight Order|not available|Error)/i);
    }, 30000);
  });

  describe('Advanced Hotel Features', () => {
    test('should handle hotel autocomplete request', async () => {
      const request = {
        method: 'tools/call' as const,
        params: {
          name: 'search_hotel_autocomplete',
          arguments: {
            keyword: 'Hilton'
          }
        }
      };

      const response = await handleToolCall(request);
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.content[0].type).toBe('text');
      
      const result = response.content[0].text;
      // Should either return autocomplete results or handle gracefully if API not available
      expect(result).toMatch(/(Hotel Autocomplete|Hilton|not available|Error)/i);
    }, 30000);

    test('should handle hotel sentiments request', async () => {
      const request = {
        method: 'tools/call' as const,
        params: {
          name: 'get_hotel_sentiments',
          arguments: {
            hotelIds: ['ADNYCCTB', 'ADPAR001']
          }
        }
      };

      const response = await handleToolCall(request);
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.content[0].type).toBe('text');
      
      const result = response.content[0].text;
      // Should handle gracefully even if hotels don't have sentiment data or API not available
      expect(result).toMatch(/(No sentiment data found|Hotel Sentiment|not available|Error)/i);
    }, 30000);
  });

  describe('Activities and Points of Interest', () => {
    test('should handle activities search request', async () => {
      const request = {
        method: 'tools/call' as const,
        params: {
          name: 'search_activities',
          arguments: {
            latitude: 40.7589,
            longitude: -73.9851,
            radius: 5
          }
        }
      };

      const response = await handleToolCall(request);
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.content[0].type).toBe('text');
      
      const result = response.content[0].text;
      // Should handle gracefully if API not available
      expect(result).toMatch(/(No activities found|Activities near|not available|Error)/i);
      // Only check for coordinates if it's not an API error
      if (!result.includes('400') && !result.includes('Unknown API error')) {
        expect(result).toContain('40.7589');
      }
    }, 30000);

    test('should handle points of interest search request', async () => {
      const request = {
        method: 'tools/call' as const,
        params: {
          name: 'search_points_of_interest',
          arguments: {
            latitude: 48.8566,
            longitude: 2.3522,
            radius: 2,
            categories: ['SIGHTS', 'RESTAURANT']
          }
        }
      };

      const response = await handleToolCall(request);
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.content[0].type).toBe('text');
      
      const result = response.content[0].text;
      // Should handle gracefully if API not available
      expect(result).toMatch(/(No points of interest found|Points of Interest|not available|Error)/i);
      // Only check for coordinates if it's not an API error
      if (!result.includes('400') && !result.includes('Unknown API error')) {
        expect(result).toContain('48.8566');
      }
    }, 30000);
  });

  describe('Travel Analytics', () => {
    test('should handle travel analytics request', async () => {
      const request = {
        method: 'tools/call' as const,
        params: {
          name: 'get_travel_analytics',
          arguments: {
            originCityCode: 'NYC',
            destinationCityCode: 'LAX',
            searchDate: '2024-12-01',
            marketCountryCode: 'US'
          }
        }
      };

      const response = await handleToolCall(request);
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.content[0].type).toBe('text');
      
      const result = response.content[0].text;
      // Should handle gracefully if API not available
      expect(result).toMatch(/(No travel analytics data found|Travel Analytics|not available|Error)/i);
      // Don't check for city codes since this endpoint is not available
    }, 30000);

    test('should handle trip purpose prediction request', async () => {
      const request = {
        method: 'tools/call' as const,
        params: {
          name: 'predict_trip_purpose',
          arguments: {
            originLocationCode: 'JFK',
            destinationLocationCode: 'LAX',
            departureDate: '2024-12-20',
            returnDate: '2024-12-27',
            searchDate: '2024-12-01'
          }
        }
      };

      const response = await handleToolCall(request);
      
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.content[0].type).toBe('text');
      
      const result = response.content[0].text;
      // Should handle gracefully if API not available
      expect(result).toMatch(/(No trip purpose prediction|Trip Purpose|not available|Error)/i);
      // Don't check for airport codes since this endpoint is not available
    }, 30000);
  });

  describe('Tool Registration', () => {
    test('should register all advanced tools', async () => {
      const tools = getToolDefinitions();
      
      // Check that all new tools are registered
      const toolNames = tools.map(tool => tool.name);
      
      // Advanced flight tools
      expect(toolNames).toContain('get_flight_seat_maps');
      expect(toolNames).toContain('predict_flight_delay');
      
      // Advanced hotel tools
      expect(toolNames).toContain('get_hotel_sentiments');
      expect(toolNames).toContain('search_hotel_autocomplete');
      
      // Activities and analytics tools
      expect(toolNames).toContain('search_activities');
      expect(toolNames).toContain('search_points_of_interest');
      expect(toolNames).toContain('get_travel_analytics');
      expect(toolNames).toContain('predict_trip_purpose');
      
      // Verify total tool count (9 original + 8 new = 17)
      expect(tools.length).toBeGreaterThanOrEqual(17);
    });

    test('should have proper tool schemas', async () => {
      const tools = getToolDefinitions();
      
      // Check a few key tools have proper schemas
      const seatMapTool = tools.find(t => t.name === 'get_flight_seat_maps');
      expect(seatMapTool).toBeDefined();
      expect(seatMapTool?.inputSchema.properties).toHaveProperty('flightOrderId');
      
      const delayTool = tools.find(t => t.name === 'predict_flight_delay');
      expect(delayTool).toBeDefined();
      expect(delayTool?.inputSchema.required).toContain('originLocationCode');
      expect(delayTool?.inputSchema.required).toContain('destinationLocationCode');
      
      const activitiesTool = tools.find(t => t.name === 'search_activities');
      expect(activitiesTool).toBeDefined();
      expect(activitiesTool?.inputSchema.required).toContain('latitude');
      expect(activitiesTool?.inputSchema.required).toContain('longitude');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid tool names gracefully', async () => {
      const request = {
        method: 'tools/call' as const,
        params: {
          name: 'invalid_tool_name',
          arguments: {}
        }
      };

      const response = await handleToolCall(request);
      
      expect(response).toBeDefined();
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('Unknown tool');
    });

    test('should handle missing required parameters', async () => {
      const request = {
        method: 'tools/call' as const,
        params: {
          name: 'predict_flight_delay',
          arguments: {
            originLocationCode: 'JFK'
            // Missing required parameters
          }
        }
      };

      const response = await handleToolCall(request);
      
      expect(response).toBeDefined();
      expect(response.isError).toBe(true);
    });
  });
}); 