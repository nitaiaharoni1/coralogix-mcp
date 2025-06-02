/**
 * Flight-related MCP tools
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { FlightService } from '../services/flights.js';
import { LocationService } from '../services/locations.js';
import { getAmadeusService } from '../utils/service-factory.js';

let flightService: FlightService | null = null;
let locationService: LocationService | null = null;

function getFlightService(): FlightService {
  if (!flightService) {
    flightService = new FlightService(getAmadeusService());
  }
  return flightService;
}

function getLocationService(): LocationService {
  if (!locationService) {
    locationService = new LocationService(getAmadeusService());
  }
  return locationService;
}

/**
 * Resolve location name to IATA code
 * Handles cases like "israel" -> "TLV", "budapest" -> "BUD"
 */
async function resolveLocationToIATA(location: string): Promise<string> {
  // If it's already a 3-letter IATA code, return as-is
  if (/^[A-Z]{3}$/i.test(location.trim())) {
    return location.toUpperCase();
  }

  try {
    const locationService = getLocationService();
    const results = await locationService.searchLocations(location, ['AIRPORT', 'CITY']);

    if (results.length > 0) {
      // Prefer airports over cities, and prioritize by traveler score
      const airports = results.filter(r => r.subType === 'AIRPORT');
      const cities = results.filter(r => r.subType === 'CITY');

      const bestMatch = airports.length > 0 ? airports[0] : cities[0];

      if (bestMatch && bestMatch.iataCode) {
        return bestMatch.iataCode;
      }
    }

    // Fallback: return original if no match found
    return location.toUpperCase();
  } catch (error) {
    // If location search fails, return original
    return location.toUpperCase();
  }
}

/**
 * Parse date expressions like "this month" into actual dates
 */
function parseDateExpression(dateExpression?: string): string | undefined {
  if (!dateExpression) {
    return undefined;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Handle "this month" - use first day of current month
  if (dateExpression.toLowerCase().includes('this month')) {
    return new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
  }

  // Handle "next month" - use first day of next month
  if (dateExpression.toLowerCase().includes('next month')) {
    return new Date(currentYear, currentMonth + 1, 1).toISOString().split('T')[0];
  }

  // Handle month names (e.g., "january", "feb", "march 2024")
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
  ];

  const monthAbbrevs = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
  ];

  const lowerExpression = dateExpression.toLowerCase();

  for (let i = 0; i < monthNames.length; i++) {
    if (lowerExpression.includes(monthNames[i]) || lowerExpression.includes(monthAbbrevs[i])) {
      // Extract year if present, otherwise use current year
      const yearMatch = dateExpression.match(/\b(20\d{2})\b/);
      const year = yearMatch ? parseInt(yearMatch[1]) : currentYear;

      return new Date(year, i, 1).toISOString().split('T')[0];
    }
  }

  // If it's already in YYYY-MM-DD format, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateExpression)) {
    return dateExpression;
  }

  return undefined;
}

export const flightTools: Tool[] = [
  {
    name: 'search_flights',
    description: 'Search for specific flight offers ONLY when the user provides an exact departure date (e.g., "June 15th", "2025-06-15", "tomorrow"). DO NOT use this tool for finding cheapest dates, flexible dates, or when user asks for "this month" without a specific date. This tool requires a specific date and returns detailed booking information.',
    inputSchema: {
      type: 'object',
      properties: {
        originLocationCode: {
          type: 'string',
          description: 'IATA airport code for departure (e.g., "NYC", "LAX", "TLV" for Tel Aviv)',
        },
        destinationLocationCode: {
          type: 'string',
          description: 'IATA airport code for arrival (e.g., "LON", "PAR", "BUD" for Budapest)',
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
    description: 'Find cheapest destinations from a specific origin when the destination is unknown or flexible. Use when user asks "where can I fly cheapest from X" or wants destination inspiration. NOT for finding dates to a specific destination.',
    inputSchema: {
      type: 'object',
      properties: {
        origin: {
          type: 'string',
          description: 'IATA airport code for departure (e.g., "NYC", "TLV" for Tel Aviv)',
        },
        maxPrice: {
          type: 'number',
          description: 'Maximum price filter',
        },
        departureDate: {
          type: 'string',
          description: 'Preferred departure date in YYYY-MM-DD format (optional)',
        },
        oneWay: {
          type: 'boolean',
          description: 'Search for one-way flights only (default: true)',
          default: true,
        },
      },
      required: ['origin'],
    },
  },
  {
    name: 'get_cheapest_dates',
    description: 'Find the cheapest dates to fly between two specific destinations when dates are flexible. PERFECT for queries like "cheapest flight this month from X to Y", "when is cheapest to fly from X to Y", or "find cheapest flight this month from israel to budapest". Use when both origin and destination are known but dates are flexible. This is the PRIMARY tool for finding cheap flights when no specific date is given.',
    inputSchema: {
      type: 'object',
      properties: {
        origin: {
          type: 'string',
          description: 'IATA airport code for departure (e.g., "TLV" for Tel Aviv, "NYC")',
        },
        destination: {
          type: 'string',
          description: 'IATA airport code for arrival (e.g., "BUD" for Budapest, "PAR")',
        },
        departureDate: {
          type: 'string',
          description: 'Preferred departure date in YYYY-MM-DD format (optional). If user mentions "this month" or a specific month, use the first day of that month.',
        },
        oneWay: {
          type: 'boolean',
          description: 'Search for one-way flights only (default: true)',
          default: true,
        },
        maxPrice: {
          type: 'number',
          description: 'Maximum price filter',
        },
        duration: {
          type: 'string',
          description: 'Trip duration in days (e.g., "1,7" for 1-7 days, "3" for exactly 3 days). Optional parameter.',
        },
        nonStop: {
          type: 'boolean',
          description: 'Search for non-stop flights only',
        },
        viewBy: {
          type: 'string',
          enum: ['DATE', 'DURATION', 'WEEK', 'COUNTRY'],
          description: 'How to group results (default: DATE for chronological cheapest dates)',
          default: 'DATE',
        },
      },
      required: ['origin', 'destination', 'nonStop', 'viewBy', 'duration'],
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
  // Resolve location codes
  const originCode = await resolveLocationToIATA(args.originLocationCode);
  const destinationCode = await resolveLocationToIATA(args.destinationLocationCode);

  const resolvedArgs = {
    ...args,
    originLocationCode: originCode,
    destinationLocationCode: destinationCode,
  };

  const offers = await service.searchFlights(resolvedArgs);

  if (offers.length === 0) {
    return `No flights found for ${originCode} → ${destinationCode} on ${args.departureDate}. Try different dates or check if the airport codes are correct.`;
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
   Seats Available: ${offer.numberOfBookableSeats}
   
   🔗 Booking Options:
   • Offer ID: ${offer.id} (use for booking)
   • Last Ticketing Date: ${new Date(offer.lastTicketingDate).toLocaleDateString()}
   • Instant Ticketing: ${offer.instantTicketingRequired ? 'Required' : 'Not Required'}
   • Validating Airlines: ${offer.validatingAirlineCodes.join(', ')}
   
   📝 To book this flight:
   • Use the 'create_flight_booking' tool with this offer
   • Provide traveler information (name, DOB, contact, documents)
   • Include payment and contact details`;
  });

  return `Found ${offers.length} flight offers for ${originCode} → ${destinationCode}:\n\n${results.join('\n\n')}\n\n💡 Booking Instructions:
• Each flight offer has a unique ID that can be used for booking
• Use the 'create_flight_booking' tool to complete your reservation
• Ensure you have all required traveler information ready
• Check last ticketing dates to avoid offer expiration`;
}

async function handleFlightInspiration(service: FlightService, args: any): Promise<string> {
  // Resolve origin location
  const originCode = await resolveLocationToIATA(args.origin);

  // Parse date expression if provided
  const departureDate = parseDateExpression(args.departureDate);

  const resolvedArgs = {
    ...args,
    origin: originCode,
    departureDate,
  };

  const destinations = await service.getFlightInspiration(
    resolvedArgs.origin,
    resolvedArgs.maxPrice,
    resolvedArgs.departureDate,
    resolvedArgs.oneWay,
  );

  if (destinations.length === 0) {
    return `No flight destinations found from ${originCode}. Try adjusting your search criteria.`;
  }

  const results = destinations.slice(0, 15).map((dest, index) => {
    const price = dest.price?.total ? `${dest.price.currency || ''} ${dest.price.total}` : 'N/A';
    const departureDate = dest.departureDate ? ` (${dest.departureDate})` : '';
    return `${index + 1}. ${dest.destination}${departureDate} - ${price}`;
  });

  const dateInfo = departureDate ? ` for ${departureDate}` : '';
  return `Flight inspiration from ${originCode}${dateInfo}:\n\n${results.join('\n')}\n\n💡 Tip: Use the 'get_cheapest_dates' tool to find the best dates for a specific destination.`;
}

async function handleCheapestDates(service: FlightService, args: any): Promise<string> {
  // Resolve location codes
  const originCode = await resolveLocationToIATA(args.origin);
  const destinationCode = await resolveLocationToIATA(args.destination);

  try {
    const dates = await service.getCheapestDates(
      originCode,
      destinationCode,
      args.departureDate,
      args.oneWay,
      args.maxPrice,
      args.viewBy,
      args.duration,
      args.nonStop,
    );

    if (dates.length === 0) {
      return `No flight dates found for ${originCode} → ${destinationCode}.`;
    }

    // Format standard API results
    const results = dates.slice(0, 15).map((date, index) => {
      const price = date.price?.total ? `${date.price.currency || ''} ${date.price.total}` : 'N/A';
      const departureDate = date.departureDate || 'N/A';
      return `${index + 1}. ${departureDate} - ${price}`;
    });

    return `Cheapest flight dates ${originCode} → ${destinationCode}:\n\n${results.join('\n')}`;
  } catch (error) {
    // When cheapest dates API fails, provide helpful alternatives
    return `❌ The cheapest dates search is temporarily unavailable for ${originCode} → ${destinationCode}.\n\n` +
      `🔄 **Alternative options:**\n` +
      `• Use 'get_flight_inspiration' to see all available destinations from ${originCode}\n` +
      `• This route may have limited availability in the cheapest dates database\n` +
      `• The cheapest dates API works best for popular international routes\n\n` +
      `⚠️ **Note**: Please do NOT use 'search_flights' as it requires specific dates and won't help find the cheapest options across flexible dates.`;
  }
} 