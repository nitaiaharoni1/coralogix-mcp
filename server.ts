#!/usr/bin/env node

/**
 * Travel MCP Server
 * Main entry point for the MCP server with Amadeus API integration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { getToolDefinitions, handleToolCall } from './src/tools/index.js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

// Server configuration
const SERVER_CONFIG = {
  name: 'travel-mcp',
  version: '1.0.0',
};

// Initialize MCP server
const server = new Server({
  name: SERVER_CONFIG.name,
  version: SERVER_CONFIG.version,
}, {
  capabilities: {
    tools: {},
  },
});

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: getToolDefinitions() };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const result = await handleToolCall(request);
  
  // Ensure we return the correct MCP SDK format
  return {
    content: result.content,
    isError: result.isError || false
  };
});

// Main server function
async function main(): Promise<void> {
  try {
    // Validate required environment variables
    const requiredEnvVars = ['AMADEUS_CLIENT_ID', 'AMADEUS_CLIENT_SECRET'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('ERROR: Missing required environment variables:', missingVars.join(', '));
      console.error('       Please set up your Amadeus API credentials in .env file');
      console.error('       Get credentials from: https://developers.amadeus.com/');
      process.exit(1);
    }

    console.error('INFO: Environment variables validated');
    console.error(`INFO: Using Amadeus ${process.env.AMADEUS_ENVIRONMENT || 'test'} environment`);

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('INFO: Travel MCP Server started successfully');
    console.error('INFO: Available tools: flights, hotels, locations, airports, airlines, advanced features, activities, analytics');
  } catch (error) {
    console.error('ERROR: Server startup failed:', (error as Error).message);
    process.exit(1);
  }
}

// Check if this is the main module (ES module equivalent of require.main === module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isMainModule = process.argv[1] === __filename;

// Handle CLI commands or start server
if (isMainModule) {
  const args = process.argv.slice(2);
  
  // Handle help command
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Travel MCP Server v${SERVER_CONFIG.version}

A Model Context Protocol server for travel services using Amadeus API.

SETUP:
  1. Get Amadeus API credentials from https://developers.amadeus.com/
  2. Copy .env.example to .env and fill in your credentials
  3. Install dependencies: npm install
  4. Build the server: npm run build
  5. Configure in Claude Desktop or your MCP client

ENVIRONMENT VARIABLES:
  AMADEUS_CLIENT_ID      - Your Amadeus API client ID (required)
  AMADEUS_CLIENT_SECRET  - Your Amadeus API client secret (required)
  AMADEUS_ENVIRONMENT    - API environment: 'test' or 'production' (default: test)

AVAILABLE TOOLS:
  - search_flights         - Search for flight offers
  - get_flight_inspiration - Get cheapest destinations from origin
  - get_cheapest_dates     - Find cheapest dates to fly
  - search_hotels          - Search for hotels by location
  - search_hotel_offers    - Get hotel offers with pricing
  - search_locations       - Search airports, cities, locations
  - get_airport_info       - Get detailed airport information
  - get_nearby_airports    - Find airports near coordinates
  - get_airline_info       - Get airline information
  
  Advanced Flight Features:
  - get_flight_seat_maps   - Get seat maps for flight orders
  - predict_flight_delay   - Predict flight delay probability
  
  Advanced Hotel Features:
  - get_hotel_sentiments   - Get hotel ratings and sentiment analysis
  - search_hotel_autocomplete - Hotel name autocomplete search
  
  Activities & Points of Interest:
  - search_activities      - Search for activities and tours
  - search_points_of_interest - Search for points of interest
  
  Travel Analytics:
  - get_travel_analytics   - Get air traffic analytics between cities
  - predict_trip_purpose   - Predict trip purpose (business/leisure)

USAGE:
  travel-mcp              - Start the MCP server
  travel-mcp --help       - Show this help message

For more information, visit: https://github.com/nitaiaharoni1/travel-mcp
`);
    process.exit(0);
  }
  
  // Start the server
  main().catch((error) => {
    console.error('FATAL:', error);
    process.exit(1);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.error('INFO: Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('INFO: Received SIGTERM, shutting down gracefully...');
  process.exit(0);
}); 