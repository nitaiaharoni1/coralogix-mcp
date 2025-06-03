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
    const results = await locationService.searchLocations(location, 'AIRPORT');

    if (results.length > 0) {
      // Prefer airports over cities, and prioritize by traveler score
      const airports = results.filter(r => r.subType === 'AIRPORT');
      const cities = results.filter(r => r.subType === 'CITY');

      const bestMatch = airports.length > 0 ? airports[0] : cities[0];

      if (bestMatch && bestMatch.iataCode) {
        return bestMatch.iataCode;
      }
    }

    // Try city search if airport search fails
    const cityResults = await locationService.searchLocations(location, 'CITY');
    if (cityResults.length > 0) {
      return cityResults[0].iataCode;
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
    description: 'Search for specific flight offers with exact departure date. ONLY use when user provides an exact departure date (e.g., "2024-12-25"). DO NOT use for flexible date searches like "this month" or "cheapest dates" - use get_cheapest_dates instead.',
    inputSchema: {
      type: 'object',
      properties: {
        originLocationCode: {
          type: 'string',
          description: 'IATA airport code for departure (e.g., "JFK", "LAX")',
        },
        destinationLocationCode: {
          type: 'string',
          description: 'IATA airport code for arrival (e.g., "LHR", "CDG")',
        },
        departureDate: {
          type: 'string',
          description: 'Departure date in YYYY-MM-DD format (e.g., "2024-12-25")',
        },
        returnDate: {
          type: 'string',
          description: 'Return date in YYYY-MM-DD format for round-trip flights (optional)',
        },
        adults: {
          type: 'integer',
          description: 'Number of adult passengers (default: 1)',
          minimum: 1,
          maximum: 9,
        },
        children: {
          type: 'integer',
          description: 'Number of child passengers (2-11 years old)',
          minimum: 0,
          maximum: 9,
        },
        infants: {
          type: 'integer',
          description: 'Number of infant passengers (under 2 years old)',
          minimum: 0,
          maximum: 9,
        },
        travelClass: {
          type: 'string',
          description: 'Travel class preference',
          enum: ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'],
        },
        nonStop: {
          type: 'boolean',
          description: 'If true, only direct flights (helps prevent 500 errors)',
        },
        maxPrice: {
          type: 'number',
          description: 'Maximum price filter (helps prevent 500 errors by limiting results)',
        },
        currencyCode: {
          type: 'string',
          description: 'Currency for prices (e.g., "USD", "EUR", "GBP")',
        },
        max: {
          type: 'integer',
          description: 'Maximum number of flight offers to return (default: 250, max: 250)',
          minimum: 1,
          maximum: 250,
        },
        includedAirlineCodes: {
          type: 'string',
          description: 'Comma-separated airline codes to include (e.g., "AA,BA,LH") - helps filter results',
        },
        excludedAirlineCodes: {
          type: 'string',
          description: 'Comma-separated airline codes to exclude (e.g., "FR,U2") - helps filter results',
        },
        maxNumberOfConnections: {
          type: 'integer',
          description: 'Maximum number of connections (0 for direct flights only)',
          minimum: 0,
          maximum: 2,
        },
      },
      required: ['originLocationCode', 'destinationLocationCode', 'departureDate'],
    },
  },
  {
    name: 'get_flight_inspiration',
    description: 'Find flight destinations from an origin when destination is unknown or flexible. Use when user asks "where can I fly from X?" or "cheap destinations from X". Perfect for destination discovery.',
    inputSchema: {
      type: 'object',
      properties: {
        origin: {
          type: 'string',
          description: 'IATA airport code for departure (e.g., "JFK", "LAX", "TLV")',
        },
        departureDate: {
          type: 'string',
          description: 'Departure date in YYYY-MM-DD format (optional, defaults to today)',
        },
        oneWay: {
          type: 'boolean',
          description: 'Search for one-way flights only (default: true)',
        },
        nonStop: {
          type: 'boolean',
          description: 'If true, only direct flights (helps prevent 500 errors)',
        },
        maxPrice: {
          type: 'number',
          description: 'Maximum price filter (helps prevent 500 errors by limiting results)',
        },
        viewBy: {
          type: 'string',
          description: 'How to group results',
          enum: ['DATE', 'DESTINATION', 'DURATION', 'WEEK', 'COUNTRY'],
        },
        duration: {
          type: 'string',
          description: 'Trip duration in days (e.g., "1,7" for 1-7 days, "3" for exactly 3 days). Optional parameter.',
        },
        currencyCode: {
          type: 'string',
          description: 'Currency for prices (e.g., "USD", "EUR", "GBP")',
        },
        includedAirlineCodes: {
          type: 'string',
          description: 'Comma-separated airline codes to include (e.g., "AA,BA,LH") - helps filter results',
        },
        excludedAirlineCodes: {
          type: 'string',
          description: 'Comma-separated airline codes to exclude (e.g., "FR,U2") - helps filter results',
        },
      },
      required: ['origin'],
    },
  },
  {
    name: 'get_cheapest_dates',
    description: 'Find cheapest flight dates between two destinations. PRIMARY tool for finding cheap flights when no specific date is given (e.g., "cheapest flight this month", "find cheap flights to Budapest"). Use this for flexible date searches.',
    inputSchema: {
      type: 'object',
      properties: {
        origin: {
          type: 'string',
          description: 'IATA airport code for departure (e.g., "JFK", "LAX", "TLV")',
        },
        destination: {
          type: 'string',
          description: 'IATA airport code for arrival (e.g., "LHR", "CDG", "BUD")',
        },
        departureDate: {
          type: 'string',
          description: 'Earliest departure date in YYYY-MM-DD format (optional, defaults to today)',
        },
        oneWay: {
          type: 'boolean',
          description: 'Search for one-way flights only (default: true)',
        },
        nonStop: {
          type: 'boolean',
          description: 'If true, only direct flights (helps prevent 500 errors)',
        },
        maxPrice: {
          type: 'number',
          description: 'Maximum price filter (helps prevent 500 errors by limiting results)',
        },
        viewBy: {
          type: 'string',
          description: 'How to group results',
          enum: ['DATE', 'DESTINATION', 'DURATION', 'WEEK', 'COUNTRY'],
        },
        duration: {
          type: 'string',
          description: 'Trip duration in days (e.g., "1,7" for 1-7 days, "3" for exactly 3 days). Optional parameter.',
        },
        currencyCode: {
          type: 'string',
          description: 'Currency for prices (e.g., "USD", "EUR", "GBP")',
        },
        includedAirlineCodes: {
          type: 'string',
          description: 'Comma-separated airline codes to include (e.g., "AA,BA,LH") - helps filter results',
        },
        excludedAirlineCodes: {
          type: 'string',
          description: 'Comma-separated airline codes to exclude (e.g., "FR,U2") - helps filter results',
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

  const destinations = await service.getFlightInspiration(
    originCode,
    args.maxPrice,
    departureDate,
    args.oneWay,
    args.nonStop,
    args.viewBy,
    args.duration,
    args.currencyCode,
    args.includedAirlineCodes,
    args.excludedAirlineCodes,
  );

  if (destinations.length === 0) {
    return `No flight destinations found from ${originCode}. Try adjusting your search criteria or adding more filtering parameters like maxPrice, nonStop=true, or specific airlines.`;
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
      args.currencyCode,
      args.includedAirlineCodes,
      args.excludedAirlineCodes,
    );

    if (dates.length === 0) {
      return `No flight dates found for ${originCode} → ${destinationCode}. Try adding more filtering parameters like maxPrice, nonStop=true, or specific airlines to narrow the search.`;
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
      `⚠️ **Note**: Please do NOT use 'search_flights' as it requires specific dates and won't help find the cheapest options across flexible dates.\n\n` +
      `💡 **To avoid 500 errors, try adding filtering parameters like:**\n` +
      `• maxPrice (e.g., 500 for under $500)\n` +
      `• nonStop=true (for direct flights only)\n` +
      `• includedAirlineCodes (e.g., "AA,BA,LH" for specific airlines)\n` +
      `• currencyCode (e.g., "USD", "EUR")\n` +
      `• More specific departure dates`;
  }
} 