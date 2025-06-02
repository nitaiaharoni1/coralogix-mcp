# Travel MCP Server

A comprehensive Model Context Protocol (MCP) server for travel services using the Amadeus API. This server provides AI assistants with powerful travel capabilities including flight search, hotel booking, airport information, and travel recommendations.

## Features

### ✈️ Flight Services
- **Flight Search**: Find flights between any two destinations
- **Flight Inspiration**: Discover cheapest destinations from your origin
- **Cheapest Dates**: Find the most affordable travel dates
- **Multi-class Support**: Economy, Premium Economy, Business, and First class
- **Flexible Options**: One-way, round-trip, non-stop preferences

### 🏨 Hotel Services
- **Hotel Search**: Find hotels by city or geographic coordinates
- **Hotel Offers**: Get detailed pricing and availability
- **Advanced Filtering**: Filter by amenities, ratings, hotel chains
- **Room Details**: Comprehensive room and pricing information

### 🌍 Location Services
- **Location Search**: Find airports, cities, and points of interest
- **Airport Information**: Detailed airport data and facilities
- **Nearby Airports**: Find airports within a specified radius
- **Airline Information**: Get details about airline carriers

## Quick Start

### 1. Get Amadeus API Credentials

1. Visit [Amadeus for Developers](https://developers.amadeus.com/)
2. Create a free account
3. Create a new application to get your API credentials
4. Note your Client ID and Client Secret

### 2. Installation

```bash
# Clone or download the project
cd travel-mcp

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Amadeus credentials
# AMADEUS_CLIENT_ID=your_client_id_here
# AMADEUS_CLIENT_SECRET=your_client_secret_here
```

### 3. Build and Test

```bash
# Build the project
npm run build

# Test the server
npm start -- --help
```

### 4. Configure with Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "travel": {
      "command": "node",
      "args": ["/absolute/path/to/travel-mcp/dist/server.js"],
      "env": {
        "AMADEUS_CLIENT_ID": "your_client_id",
        "AMADEUS_CLIENT_SECRET": "your_client_secret",
        "AMADEUS_ENVIRONMENT": "test"
      }
    }
  }
}
```

## Available Tools

### Flight Tools

#### `search_flights`
Search for flight offers between two locations.

**Parameters:**
- `originLocationCode` (required): IATA airport code for departure
- `destinationLocationCode` (required): IATA airport code for arrival  
- `departureDate` (required): Departure date in YYYY-MM-DD format
- `returnDate` (optional): Return date for round-trip flights
- `adults` (default: 1): Number of adult passengers
- `children` (default: 0): Number of child passengers
- `travelClass` (optional): ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST
- `nonStop` (optional): Search for non-stop flights only
- `maxPrice` (optional): Maximum price filter
- `currencyCode` (optional): Currency for pricing

#### `get_flight_inspiration`
Get flight inspiration - cheapest destinations from an origin.

**Parameters:**
- `origin` (required): IATA airport code for departure
- `maxPrice` (optional): Maximum price filter

#### `get_cheapest_dates`
Find the cheapest dates to fly between two destinations.

**Parameters:**
- `origin` (required): IATA airport code for departure
- `destination` (required): IATA airport code for arrival
- `departureDate` (optional): Preferred departure date
- `oneWay` (optional): Search for one-way flights only

### Hotel Tools

#### `search_hotels`
Search for hotels by city or location.

**Parameters:**
- `cityCode` (required if no coordinates): IATA city code
- `latitude` (required if no city): Latitude for location search
- `longitude` (required if no city): Longitude for location search
- `radius` (default: 5): Search radius in kilometers
- `chainCodes` (optional): Hotel chain codes to filter by
- `amenities` (optional): Required amenities
- `ratings` (optional): Hotel star ratings to filter by

#### `search_hotel_offers`
Search for hotel offers with pricing and availability.

**Parameters:**
- `hotelIds` (required): Array of hotel IDs to search
- `adults` (required): Number of adult guests
- `checkInDate` (required): Check-in date in YYYY-MM-DD format
- `checkOutDate` (required): Check-out date in YYYY-MM-DD format
- `children` (optional): Number of children
- `roomQuantity` (default: 1): Number of rooms
- `currency` (optional): Currency code for pricing

### Location Tools

#### `search_locations`
Search for airports, cities, and other travel locations.

**Parameters:**
- `keyword` (required): Search keyword (city name, airport name, or IATA code)
- `subType` (optional): Types of locations (AIRPORT, CITY, POINT_OF_INTEREST, DISTRICT)

#### `get_airport_info`
Get detailed information about a specific airport.

**Parameters:**
- `iataCode` (required): IATA airport code

#### `get_nearby_airports`
Find airports near a specific location.

**Parameters:**
- `latitude` (required): Latitude of the location
- `longitude` (required): Longitude of the location
- `radius` (default: 500): Search radius in kilometers

#### `get_airline_info`
Get information about airlines.

**Parameters:**
- `airlineCodes` (required): Array of IATA airline codes

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AMADEUS_CLIENT_ID` | Yes | - | Your Amadeus API client ID |
| `AMADEUS_CLIENT_SECRET` | Yes | - | Your Amadeus API client secret |
| `AMADEUS_ENVIRONMENT` | No | `test` | API environment (`test` or `production`) |
| `DEFAULT_CURRENCY` | No | `USD` | Default currency for pricing |
| `DEFAULT_LOCALE` | No | `en-US` | Default locale for responses |

## Example Usage

Once configured with Claude Desktop, you can ask questions like:

- "Find flights from New York to London departing tomorrow"
- "What are the cheapest destinations I can fly to from LAX?"
- "Search for hotels in Paris for 2 adults, checking in December 15th"
- "What airports are near coordinates 40.7128, -74.0060?"
- "Get information about JFK airport"
- "Find the cheapest dates to fly from SFO to NRT"

## Development

### Project Structure

```
travel-mcp/
├── src/
│   ├── config/          # Configuration constants
│   ├── services/        # Amadeus API service classes
│   ├── tools/           # MCP tool definitions and handlers
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── server.ts            # Main server entry point
├── package.json         # Project configuration
└── tsconfig.json        # TypeScript configuration
```

### Available Scripts

```bash
npm run build          # Build the TypeScript project
npm run dev            # Run in development mode with ts-node
npm run dev:watch      # Run in watch mode for development
npm start              # Start the built server
npm test               # Run tests
npm run clean          # Clean build artifacts
```

### API Rate Limits

The Amadeus Test API has the following rate limits:
- 10 transactions per second
- 1000 transactions per month (free tier)

For production use, consider upgrading to a paid Amadeus plan.

## Troubleshooting

### Common Issues

1. **"Missing required environment variables"**
   - Ensure `AMADEUS_CLIENT_ID` and `AMADEUS_CLIENT_SECRET` are set
   - Check that your `.env` file is in the project root

2. **"Amadeus API Error: Invalid credentials"**
   - Verify your API credentials are correct
   - Ensure you're using the right environment (test vs production)

3. **"No flights/hotels found"**
   - Check that airport/city codes are valid IATA codes
   - Verify dates are in the future and in YYYY-MM-DD format
   - Try broader search criteria

4. **Claude Desktop not recognizing the server**
   - Ensure the path in `claude_desktop_config.json` is absolute
   - Check that the server builds successfully (`npm run build`)
   - Restart Claude Desktop after configuration changes

### Debug Mode

Enable debug logging by setting the environment variable:
```bash
DEBUG=travel-mcp npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- 📖 [Amadeus API Documentation](https://developers.amadeus.com/self-service)
- 🔧 [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- 💬 [GitHub Issues](https://github.com/nitaiaharoni1/travel-mcp/issues)

---

Built with ❤️ using the Model Context Protocol and Amadeus API. 