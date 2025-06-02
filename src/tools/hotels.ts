/**
 * Hotel-related MCP tools
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { HotelService } from '../services/hotels.js';
import { getAmadeusService } from '../utils/service-factory.js';

let hotelService: HotelService | null = null;

function getHotelService(): HotelService {
  if (!hotelService) {
    hotelService = new HotelService(getAmadeusService());
  }
  return hotelService;
}

export const hotelTools: Tool[] = [
  {
    name: 'search_hotels',
    description: 'Search for hotels by city or location',
    inputSchema: {
      type: 'object',
      properties: {
        cityCode: {
          type: 'string',
          description: 'IATA city code (e.g., "NYC", "PAR")',
        },
        latitude: {
          type: 'number',
          description: 'Latitude for location-based search',
        },
        longitude: {
          type: 'number',
          description: 'Longitude for location-based search',
        },
        radius: {
          type: 'number',
          description: 'Search radius in kilometers (default: 5)',
          default: 5,
        },
        radiusUnit: {
          type: 'string',
          enum: ['KM', 'MILE'],
          description: 'Unit for radius (default: KM)',
          default: 'KM',
        },
        chainCodes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Hotel chain codes to filter by',
        },
        amenities: {
          type: 'array',
          items: { type: 'string' },
          description: 'Required amenities',
        },
        ratings: {
          type: 'array',
          items: { type: 'number' },
          description: 'Hotel star ratings to filter by',
        },
      },
      anyOf: [
        { required: ['cityCode'] },
        { required: ['latitude', 'longitude'] }
      ],
    },
  },
  {
    name: 'search_hotel_offers',
    description: 'Search for hotel offers with pricing and availability',
    inputSchema: {
      type: 'object',
      properties: {
        hotelIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Hotel IDs to search for offers',
        },
        adults: {
          type: 'number',
          description: 'Number of adult guests',
        },
        checkInDate: {
          type: 'string',
          description: 'Check-in date in YYYY-MM-DD format',
        },
        checkOutDate: {
          type: 'string',
          description: 'Check-out date in YYYY-MM-DD format',
        },
        children: {
          type: 'number',
          description: 'Number of children',
        },
        childAges: {
          type: 'array',
          items: { type: 'number' },
          description: 'Ages of children',
        },
        roomQuantity: {
          type: 'number',
          description: 'Number of rooms (default: 1)',
          default: 1,
        },
        currency: {
          type: 'string',
          description: 'Currency code for pricing',
        },
        paymentPolicy: {
          type: 'string',
          enum: ['NONE', 'GUARANTEE', 'DEPOSIT'],
          description: 'Payment policy filter',
        },
        boardType: {
          type: 'string',
          enum: ['ROOM_ONLY', 'BREAKFAST', 'HALF_BOARD', 'FULL_BOARD', 'ALL_INCLUSIVE'],
          description: 'Board type filter',
        },
      },
      required: ['hotelIds', 'adults', 'checkInDate', 'checkOutDate'],
    },
  },
];

export async function handleHotelTool(name: string, args: any): Promise<string> {
  const service = getHotelService();

  switch (name) {
    case 'search_hotels':
      return await handleSearchHotels(service, args);
    case 'search_hotel_offers':
      return await handleSearchHotelOffers(service, args);
    default:
      throw new Error(`Unknown hotel tool: ${name}`);
  }
}

async function handleSearchHotels(service: HotelService, args: any): Promise<string> {
  const hotels = await service.searchHotels(args);
  
  if (hotels.length === 0) {
    return 'No hotels found for the specified criteria.';
  }

  const results = hotels.slice(0, 20).map((hotel, index) => {
    const address = hotel.address;
    const rating = hotel.rating ? `${hotel.rating}⭐` : 'No rating';
    
    return `${index + 1}. ${hotel.name} (${hotel.hotelId})
   ${rating} | ${hotel.chainCode || 'Independent'}
   ${address.lines.join(', ')}, ${address.cityName}, ${address.countryCode}
   Distance: ${hotel.hotelDistance ? `${hotel.hotelDistance.distance} ${hotel.hotelDistance.distanceUnit}` : 'N/A'}`;
  });

  return `Found ${hotels.length} hotels:\n\n${results.join('\n\n')}`;
}

async function handleSearchHotelOffers(service: HotelService, args: any): Promise<string> {
  const offers = await service.searchHotelOffers(args);
  
  if (offers.length === 0) {
    return 'No hotel offers found for the specified criteria.';
  }

  const results = offers.slice(0, 10).map((hotelOffer, index) => {
    const hotel = hotelOffer.hotel;
    const offer = hotelOffer.offers[0]; // Show first offer
    
    if (!offer) return `${index + 1}. ${hotel.name} - No offers available`;
    
    return `${index + 1}. ${hotel.name}
   Check-in: ${offer.checkInDate} | Check-out: ${offer.checkOutDate}
   Room: ${offer.room.description.text}
   Guests: ${offer.guests.adults} adults${offer.guests.childAges ? `, ${offer.guests.childAges.length} children` : ''}
   Price: ${offer.price.currency} ${offer.price.total}
   Payment: ${offer.policies.paymentType}`;
  });

  return `Found ${offers.length} hotel offers:\n\n${results.join('\n\n')}`;
} 