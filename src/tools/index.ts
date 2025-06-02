/**
 * MCP Tools registry and handlers
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { flightTools, handleFlightTool } from './flights.js';
import { hotelTools, handleHotelTool } from './hotels.js';
import { locationTools, handleLocationTool } from './locations.js';
import { flightAdvancedTools, handleFlightAdvancedTool } from './flight-advanced.js';
import { hotelAdvancedTools, handleHotelAdvancedTool } from './hotel-advanced.js';
import { activitiesAnalyticsTools, handleActivitiesAnalyticsTool } from './activities-analytics.js';

// Combine all tool definitions
export function getToolDefinitions(): Tool[] {
  return [
    ...flightTools,
    ...hotelTools,
    ...locationTools,
    ...flightAdvancedTools,
    ...hotelAdvancedTools,
    ...activitiesAnalyticsTools,
  ];
}

// Main tool call handler
export async function handleToolCall(request: CallToolRequest): Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}> {
  const { name, arguments: args } = request.params;

  try {
    let result: string;

    // Route to appropriate handler based on tool name
    // Check specific advanced tools first to avoid conflicts with general patterns
    if (name === 'get_flight_seat_maps' || name === 'predict_flight_delay' || name === 'create_flight_booking' || name === 'get_flight_booking' || name === 'get_flight_pricing') {
      result = await handleFlightAdvancedTool(name, args || {});
    } else if (name === 'get_hotel_sentiments' || name === 'search_hotel_autocomplete') {
      result = await handleHotelAdvancedTool(name, args || {});
    } else if (name === 'search_activities' || name === 'search_points_of_interest' || name === 'get_travel_analytics' || name === 'predict_trip_purpose') {
      result = await handleActivitiesAnalyticsTool(name, args || {});
    } else if (name.startsWith('search_flights') || name.startsWith('get_flight') || name.startsWith('get_cheapest')) {
      result = await handleFlightTool(name, args || {});
    } else if (name.startsWith('search_hotels') || name.startsWith('get_hotel')) {
      result = await handleHotelTool(name, args || {});
    } else if (name.startsWith('search_locations') || name.startsWith('get_airport') || name.startsWith('get_nearby') || name.startsWith('get_airline')) {
      result = await handleLocationTool(name, args || {});
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: 'text', text: result }],
      isError: false,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [{ type: 'text', text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
} 