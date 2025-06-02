/**
 * Activities and analytics MCP tools
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ActivitiesService } from '../services/activities.js';
import { AnalyticsService } from '../services/analytics.js';
import { getAmadeusService } from '../utils/service-factory.js';

let activitiesService: ActivitiesService | null = null;
let analyticsService: AnalyticsService | null = null;

function getActivitiesService(): ActivitiesService {
  if (!activitiesService) {
    activitiesService = new ActivitiesService(getAmadeusService());
  }
  return activitiesService;
}

function getAnalyticsService(): AnalyticsService {
  if (!analyticsService) {
    analyticsService = new AnalyticsService(getAmadeusService());
  }
  return analyticsService;
}

export const activitiesAnalyticsTools: Tool[] = [
  {
    name: 'search_activities',
    description: 'Search for activities and tours near a location',
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
          description: 'Search radius in kilometers (default: 1)',
          default: 1,
        },
      },
      required: ['latitude', 'longitude'],
    },
  },
  {
    name: 'search_points_of_interest',
    description: 'Search for points of interest near a location',
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
          description: 'Search radius in kilometers (default: 1)',
          default: 1,
        },
        categories: {
          type: 'array',
          items: { type: 'string' },
          description: 'Categories to filter by (e.g., ["SIGHTS", "RESTAURANT", "SHOPPING"])',
        },
      },
      required: ['latitude', 'longitude'],
    },
  },
  {
    name: 'get_travel_analytics',
    description: 'Get travel analytics and air traffic data between cities',
    inputSchema: {
      type: 'object',
      properties: {
        originCityCode: {
          type: 'string',
          description: 'Origin city IATA code (e.g., "NYC")',
        },
        destinationCityCode: {
          type: 'string',
          description: 'Destination city IATA code (e.g., "LAX")',
        },
        searchDate: {
          type: 'string',
          description: 'Search date in YYYY-MM-DD format',
        },
        marketCountryCode: {
          type: 'string',
          description: 'Market country code (e.g., "US")',
        },
        sourceCountry: {
          type: 'array',
          items: { type: 'string' },
          description: 'Source countries to analyze (e.g., ["US", "CA"])',
        },
      },
      required: ['originCityCode', 'destinationCityCode', 'searchDate'],
    },
  },
  {
    name: 'predict_trip_purpose',
    description: 'Predict the purpose of a trip (business or leisure)',
    inputSchema: {
      type: 'object',
      properties: {
        originLocationCode: {
          type: 'string',
          description: 'Origin airport IATA code (e.g., "JFK")',
        },
        destinationLocationCode: {
          type: 'string',
          description: 'Destination airport IATA code (e.g., "LAX")',
        },
        departureDate: {
          type: 'string',
          description: 'Departure date in YYYY-MM-DD format',
        },
        returnDate: {
          type: 'string',
          description: 'Return date in YYYY-MM-DD format (optional for one-way)',
        },
        searchDate: {
          type: 'string',
          description: 'Search date in YYYY-MM-DD format',
        },
      },
      required: ['originLocationCode', 'destinationLocationCode', 'departureDate', 'searchDate'],
    },
  },
];

export async function handleActivitiesAnalyticsTool(name: string, args: any): Promise<string> {
  switch (name) {
    case 'search_activities':
      return await handleSearchActivities(args);
    case 'search_points_of_interest':
      return await handleSearchPointsOfInterest(args);
    case 'get_travel_analytics':
      return await handleTravelAnalytics(args);
    case 'predict_trip_purpose':
      return await handleTripPurposePrediction(args);
    default:
      throw new Error(`Unknown activities/analytics tool: ${name}`);
  }
}

async function handleSearchActivities(args: any): Promise<string> {
  const service = getActivitiesService();
  const activities = await service.searchActivities(args);
  
  if (activities.length === 0) {
    return `No activities found near coordinates ${args.latitude}, ${args.longitude}.`;
  }

  const results = activities.slice(0, 10).map((activity, index) => {
    const price = activity.price ? `${activity.price.amount} ${activity.price.currencyCode}` : 'Price not available';
    const rating = activity.rating || 'No rating';
    const duration = activity.minimumDuration ? `Duration: ${activity.minimumDuration}` : '';
    const categories = activity.categories && Array.isArray(activity.categories) ? activity.categories.join(', ') : 'No categories';
    
    return `${index + 1}. ${activity.name}
   Description: ${activity.shortDescription}
   Price: ${price}
   Rating: ${rating}
   ${duration}
   Categories: ${categories}
   Location: ${activity.geoCode.latitude}, ${activity.geoCode.longitude}`;
  });

  return `Activities near ${args.latitude}, ${args.longitude}:\n\n${results.join('\n\n')}`;
}

async function handleSearchPointsOfInterest(args: any): Promise<string> {
  const service = getActivitiesService();
  const pois = await service.searchPointsOfInterest(args);
  
  if (pois.length === 0) {
    return `No points of interest found near coordinates ${args.latitude}, ${args.longitude}.`;
  }

  const results = pois.slice(0, 15).map((poi, index) => {
    const score = poi.analytics?.travelers?.score || 'N/A';
    const tags = poi.tags && Array.isArray(poi.tags) && poi.tags.length > 0 ? poi.tags.join(', ') : 'No tags';
    
    return `${index + 1}. ${poi.name}
   Category: ${poi.category}
   Rank: ${poi.rank}
   Traveler Score: ${score}
   Tags: ${tags}
   Location: ${poi.geoCode.latitude}, ${poi.geoCode.longitude}`;
  });

  return `Points of Interest near ${args.latitude}, ${args.longitude}:\n\n${results.join('\n\n')}`;
}

async function handleTravelAnalytics(args: any): Promise<string> {
  const service = getAnalyticsService();
  const analytics = await service.getTravelAnalytics(args);
  
  if (analytics.length === 0) {
    return `No travel analytics data found for ${args.originCityCode} to ${args.destinationCityCode}.`;
  }

  const results = analytics.map((analytic, index) => {
    const flightScore = analytic.analytics.flights.score;
    const travelerScore = analytic.analytics.travelers.score;
    
    return `${index + 1}. Destination: ${analytic.destination}
   Type: ${analytic.subType}
   Flight Score: ${flightScore}
   Traveler Score: ${travelerScore}`;
  });

  return `Travel Analytics for ${args.originCityCode} → ${args.destinationCityCode} (${args.searchDate}):\n\n${results.join('\n\n')}`;
}

async function handleTripPurposePrediction(args: any): Promise<string> {
  const service = getAnalyticsService();
  const prediction = await service.getTripPurposePrediction(args);
  
  if (!prediction) {
    return 'No trip purpose prediction available for the specified route.';
  }

  const route = `${args.originLocationCode} → ${args.destinationLocationCode}`;
  const probability = parseFloat(prediction.probability) * 100;
  const tripType = args.returnDate ? 'Round-trip' : 'One-way';
  
  return `Trip Purpose Prediction for ${route}:

Trip Type: ${tripType}
Departure: ${args.departureDate}
${args.returnDate ? `Return: ${args.returnDate}` : ''}
Search Date: ${args.searchDate}

Predicted Purpose: ${prediction.result}
Confidence: ${probability.toFixed(1)}%
Prediction Type: ${prediction.subType}`;
} 