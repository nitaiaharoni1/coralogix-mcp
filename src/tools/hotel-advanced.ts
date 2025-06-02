/**
 * Advanced hotel MCP tools
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { HotelAdvancedService } from '../services/hotel-advanced.js';
import { getAmadeusService } from '../utils/service-factory.js';

let hotelAdvancedService: HotelAdvancedService | null = null;

function getHotelAdvancedService(): HotelAdvancedService {
  if (!hotelAdvancedService) {
    hotelAdvancedService = new HotelAdvancedService(getAmadeusService());
  }
  return hotelAdvancedService;
}

export const hotelAdvancedTools: Tool[] = [
  {
    name: 'get_hotel_sentiments',
    description: 'Get hotel ratings and sentiment analysis from reviews',
    inputSchema: {
      type: 'object',
      properties: {
        hotelIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of hotel IDs to get sentiments for',
        },
      },
      required: ['hotelIds'],
    },
  },
  {
    name: 'search_hotel_autocomplete',
    description: 'Hotel name autocomplete search for finding hotels by name',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'Hotel name or partial name to search for',
        },
      },
      required: ['keyword'],
    },
  },
];

export async function handleHotelAdvancedTool(name: string, args: any): Promise<string> {
  const service = getHotelAdvancedService();

  switch (name) {
    case 'get_hotel_sentiments':
      return await handleGetHotelSentiments(service, args);
    case 'search_hotel_autocomplete':
      return await handleHotelAutocomplete(service, args);
    default:
      throw new Error(`Unknown advanced hotel tool: ${name}`);
  }
}

async function handleGetHotelSentiments(service: HotelAdvancedService, args: any): Promise<string> {
  const sentiments = await service.getHotelSentiments(args);
  
  if (sentiments.length === 0) {
    return 'No sentiment data found for the specified hotels.';
  }

  const results = sentiments.map((sentiment, index) => {
    const overallRating = sentiment.overallRating;
    const reviewCount = sentiment.numberOfReviews;
    const ratingCount = sentiment.numberOfRatings;
    
    const sentimentScores = [
      `Sleep Quality: ${sentiment.sentiments.sleepQuality.score}/100 (${sentiment.sentiments.sleepQuality.description})`,
      `Service: ${sentiment.sentiments.service.score}/100 (${sentiment.sentiments.service.description})`,
      `Facilities: ${sentiment.sentiments.facilities.score}/100 (${sentiment.sentiments.facilities.description})`,
      `Room Comfort: ${sentiment.sentiments.roomComforts.score}/100 (${sentiment.sentiments.roomComforts.description})`,
      `Value for Money: ${sentiment.sentiments.valueForMoney.score}/100 (${sentiment.sentiments.valueForMoney.description})`,
      `Location: ${sentiment.sentiments.location.score}/100 (${sentiment.sentiments.location.description})`,
      `Staff: ${sentiment.sentiments.staff.score}/100 (${sentiment.sentiments.staff.description})`
    ];
    
    return `${index + 1}. Hotel ID: ${sentiment.hotelId}
   Overall Rating: ${overallRating}/100
   Reviews: ${reviewCount} | Ratings: ${ratingCount}
   
   Detailed Sentiments:
   ${sentimentScores.join('\n   ')}`;
  });

  return `Hotel Sentiment Analysis:\n\n${results.join('\n\n')}`;
}

async function handleHotelAutocomplete(service: HotelAdvancedService, args: any): Promise<string> {
  const hotels = await service.searchHotelAutocomplete(args.keyword);
  
  if (hotels.length === 0) {
    return `No hotels found matching "${args.keyword}".`;
  }

  const results = hotels.slice(0, 15).map((hotel, index) => {
    const coords = hotel.geoCode;
    const address = hotel.address;
    const score = hotel.analytics?.travelers?.score || 'N/A';
    
    return `${index + 1}. ${hotel.name}
   Type: ${hotel.subType}
   Location: ${address.cityName}, ${address.countryName}
   Coordinates: ${coords.latitude}, ${coords.longitude}
   Traveler Score: ${score}`;
  });

  return `Hotel Autocomplete Results for "${args.keyword}":\n\n${results.join('\n\n')}`;
} 