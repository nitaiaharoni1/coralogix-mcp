/**
 * Flight-related MCP tools
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { FlightService } from '../services/flights.js';
import { getAmadeusService } from '../utils/service-factory.js';

let flightService: FlightService | null = null;

function getFlightService(): FlightService {
  if (!flightService) {
    flightService = new FlightService(getAmadeusService());
  }
  return flightService;
}

export const flightTools: Tool[] = [
  {
    name: 'search_flights',
    description: 'Search for flight offers between two locations',
    inputSchema: {
      type: 'object',
      properties: {
        originLocationCode: {
          type: 'string',
          description: 'IATA airport code for departure (e.g., "NYC", "LAX")',
        },
        destinationLocationCode: {
          type: 'string',
          description: 'IATA airport code for arrival (e.g., "LON", "PAR")',
        },
        departureDate: {
          type: 'string',
          description: 'Departure date in YYYY-MM-DD format',
        },
        returnDate: {
          type: 'string',
          description: 'Return date in YYYY-MM-DD format (optional for one-way)',
        },
        adults: {
          type: 'number',
          description: 'Number of adult passengers (default: 1)',
          default: 1,
        },
        children: {
          type: 'number',
          description: 'Number of child passengers (default: 0)',
          default: 0,
        },
        infants: {
          type: 'number',
          description: 'Number of infant passengers (default: 0)',
          default: 0,
        },
        travelClass: {
          type: 'string',
          enum: ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'],
          description: 'Travel class preference',
        },
        nonStop: {
          type: 'boolean',
          description: 'Search for non-stop flights only',
        },
        currencyCode: {
          type: 'string',
          description: 'Currency code for pricing (e.g., "USD", "EUR")',
        },
        maxPrice: {
          type: 'number',
          description: 'Maximum price filter',
        },
        max: {
          type: 'number',
          description: 'Maximum number of results (default: 50)',
          default: 50,
        },
      },
      required: ['originLocationCode', 'destinationLocationCode', 'departureDate'],
    },
  },
  {
    name: 'get_flight_inspiration',
    description: 'Get flight inspiration - cheapest destinations from an origin',
    inputSchema: {
      type: 'object',
      properties: {
        origin: {
          type: 'string',
          description: 'IATA airport code for departure (e.g., "NYC")',
        },
        maxPrice: {
          type: 'number',
          description: 'Maximum price filter',
        },
      },
      required: ['origin'],
    },
  },
  {
    name: 'get_cheapest_dates',
    description: 'Find the cheapest dates to fly between two destinations',
    inputSchema: {
      type: 'object',
      properties: {
        origin: {
          type: 'string',
          description: 'IATA airport code for departure',
        },
        destination: {
          type: 'string',
          description: 'IATA airport code for arrival',
        },
        departureDate: {
          type: 'string',
          description: 'Preferred departure date in YYYY-MM-DD format (optional)',
        },
        oneWay: {
          type: 'boolean',
          description: 'Search for one-way flights only',
        },
      },
      required: ['origin', 'destination'],
    },
  },
];

export async function handleFlightTool(name: string, args: any): Promise<string> {
  const service = getFlightService();

  switch (name) {
    case 'search_flights':
      return await handleSearchFlights(service, args);
    case 'get_flight_inspiration':
      return await handleFlightInspiration(service, args);
    case 'get_cheapest_dates':
      return await handleCheapestDates(service, args);
    default:
      throw new Error(`Unknown flight tool: ${name}`);
  }
}

async function handleSearchFlights(service: FlightService, args: any): Promise<string> {
  const offers = await service.searchFlights(args);
  
  if (offers.length === 0) {
    return 'No flights found for the specified criteria.';
  }

  const results = offers.slice(0, 10).map((offer, index) => {
    const itinerary = offer.itineraries[0];
    const outbound = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];
    
    return `${index + 1}. ${outbound.carrierCode}${outbound.number}
   Route: ${outbound.departure.iataCode} → ${lastSegment.arrival.iataCode}
   Departure: ${new Date(outbound.departure.at).toLocaleString()}
   Arrival: ${new Date(lastSegment.arrival.at).toLocaleString()}
   Duration: ${itinerary.duration}
   Price: ${offer.price.currency} ${offer.price.total}
   Stops: ${itinerary.segments.length - 1}
   Seats Available: ${offer.numberOfBookableSeats}`;
  });

  return `Found ${offers.length} flight offers:\n\n${results.join('\n\n')}`;
}

async function handleFlightInspiration(service: FlightService, args: any): Promise<string> {
  const destinations = await service.getFlightInspiration(args.origin, args.maxPrice);
  
  if (destinations.length === 0) {
    return 'No flight destinations found.';
  }

  const results = destinations.slice(0, 15).map((dest, index) => {
    return `${index + 1}. ${dest.destination} - ${dest.price?.total || 'N/A'}`;
  });

  return `Flight inspiration from ${args.origin}:\n\n${results.join('\n')}`;
}

async function handleCheapestDates(service: FlightService, args: any): Promise<string> {
  const dates = await service.getCheapestDates(
    args.origin,
    args.destination,
    args.departureDate,
    args.oneWay
  );
  
  if (dates.length === 0) {
    return 'No date options found.';
  }

  const results = dates.slice(0, 10).map((date, index) => {
    return `${index + 1}. ${date.departureDate} - ${date.price?.total || 'N/A'}`;
  });

  return `Cheapest dates for ${args.origin} → ${args.destination}:\n\n${results.join('\n')}`;
} 