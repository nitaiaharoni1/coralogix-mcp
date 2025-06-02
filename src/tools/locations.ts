/**
 * Location-related MCP tools
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { LocationService } from '../services/locations.js';
import { getAmadeusService } from '../utils/service-factory.js';

let locationService: LocationService | null = null;

function getLocationService(): LocationService {
  if (!locationService) {
    locationService = new LocationService(getAmadeusService());
  }
  return locationService;
}

export const locationTools: Tool[] = [
  {
    name: 'search_locations',
    description: 'Search for airports, cities, and other travel locations',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'Search keyword (city name, airport name, or IATA code)',
        },
        subType: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['AIRPORT', 'CITY', 'POINT_OF_INTEREST', 'DISTRICT'],
          },
          description: 'Types of locations to search for (default: AIRPORT,CITY)',
        },
      },
      required: ['keyword'],
    },
  },
  {
    name: 'get_airport_info',
    description: 'Get detailed information about a specific airport',
    inputSchema: {
      type: 'object',
      properties: {
        iataCode: {
          type: 'string',
          description: 'IATA airport code (e.g., "JFK", "LAX")',
        },
      },
      required: ['iataCode'],
    },
  },
  {
    name: 'get_nearby_airports',
    description: 'Find airports near a specific location',
    inputSchema: {
      type: 'object',
      properties: {
        latitude: {
          type: 'number',
          description: 'Latitude of the location',
        },
        longitude: {
          type: 'number',
          description: 'Longitude of the location',
        },
        radius: {
          type: 'number',
          description: 'Search radius in kilometers (default: 500)',
          default: 500,
        },
      },
      required: ['latitude', 'longitude'],
    },
  },
  {
    name: 'get_airline_info',
    description: 'Get information about airlines',
    inputSchema: {
      type: 'object',
      properties: {
        airlineCodes: {
          type: 'array',
          items: { type: 'string' },
          description: 'IATA airline codes (e.g., ["AA", "DL", "UA"])',
        },
      },
      required: ['airlineCodes'],
    },
  },
];

export async function handleLocationTool(name: string, args: any): Promise<string> {
  const service = getLocationService();

  switch (name) {
    case 'search_locations':
      return await handleSearchLocations(service, args);
    case 'get_airport_info':
      return await handleGetAirportInfo(service, args);
    case 'get_nearby_airports':
      return await handleGetNearbyAirports(service, args);
    case 'get_airline_info':
      return await handleGetAirlineInfo(service, args);
    default:
      throw new Error(`Unknown location tool: ${name}`);
  }
}

async function handleSearchLocations(service: LocationService, args: any): Promise<string> {
  const locations = await service.searchLocations(args.keyword, args.subType);
  
  if (locations.length === 0) {
    return `No locations found for "${args.keyword}".`;
  }

  const results = locations.slice(0, 15).map((location, index) => {
    const address = location.address;
    const coords = location.geoCode;
    
    return `${index + 1}. ${location.name} (${location.iataCode})
   Type: ${location.subType}
   Location: ${address.cityName}, ${address.countryName}
   Coordinates: ${coords.latitude}, ${coords.longitude}
   Timezone: ${location.timeZoneOffset}`;
  });

  return `Found ${locations.length} locations for "${args.keyword}":\n\n${results.join('\n\n')}`;
}

async function handleGetAirportInfo(service: LocationService, args: any): Promise<string> {
  const airport = await service.getAirportInfo(args.iataCode);
  
  if (!airport) {
    return `No airport found with IATA code "${args.iataCode}".`;
  }

  const address = airport.address;
  const coords = airport.geoCode;
  
  return `Airport Information for ${args.iataCode}:

Name: ${airport.name}
Detailed Name: ${airport.detailedName}
Type: ${airport.subType}
Location: ${address.cityName}, ${address.countryName}
Region: ${address.regionCode}
Coordinates: ${coords.latitude}, ${coords.longitude}
Timezone Offset: ${airport.timeZoneOffset}
Traveler Score: ${airport.analytics?.travelers?.score || 'N/A'}`;
}

async function handleGetNearbyAirports(service: LocationService, args: any): Promise<string> {
  const airports = await service.getNearbyAirports(args.latitude, args.longitude, args.radius);
  
  if (airports.length === 0) {
    return `No airports found within ${args.radius}km of coordinates ${args.latitude}, ${args.longitude}.`;
  }

  const results = airports.slice(0, 10).map((airport, index) => {
    const address = airport.address;
    
    return `${index + 1}. ${airport.name} (${airport.iataCode})
   Location: ${address.cityName}, ${address.countryName}
   Distance: ${airport.geoCode ? 
     Math.round(calculateDistance(args.latitude, args.longitude, airport.geoCode.latitude, airport.geoCode.longitude)) + 'km' : 'N/A'}`;
  });

  return `Found ${airports.length} airports within ${args.radius}km:\n\n${results.join('\n\n')}`;
}

async function handleGetAirlineInfo(service: LocationService, args: any): Promise<string> {
  const airlines = await service.getAirlineInfo(args.airlineCodes);
  
  if (airlines.length === 0) {
    return 'No airline information found for the specified codes.';
  }

  const results = airlines.map((airline, index) => {
    return `${index + 1}. ${airline.businessName || airline.commonName} (${airline.iataCode})
   Type: ${airline.type}
   Country: ${airline.countryCode}`;
  });

  return `Airline Information:\n\n${results.join('\n\n')}`;
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
} 