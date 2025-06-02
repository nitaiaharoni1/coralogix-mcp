/**
 * Hotel search and booking service
 */

import { AmadeusService } from './amadeus.js';
import { HotelSearchParams, HotelOffersSearchParams, Hotel, HotelOffer } from '../types/hotels.js';

export class HotelService {
  constructor(private amadeusService: AmadeusService) {}

  /**
   * Search for hotels by location
   */
  async searchHotels(params: HotelSearchParams): Promise<Hotel[]> {
    try {
      let response;

      if (params.cityCode) {
        // Search by city code
        const searchParams: Record<string, any> = {
          cityCode: params.cityCode,
        };

        if (params.chainCodes) {
          searchParams.chainCodes = params.chainCodes.join(',');
        }
        if (params.amenities) {
          searchParams.amenities = params.amenities.join(',');
        }
        if (params.ratings) {
          searchParams.ratings = params.ratings.join(',');
        }
        if (params.hotelSource) {
          searchParams.hotelSource = params.hotelSource;
        }

        response = await this.amadeusService.searchHotelsByCity(searchParams);
      } else if (params.latitude && params.longitude) {
        // Search by geocode (coordinates)
        const searchParams: Record<string, any> = {
          latitude: params.latitude,
          longitude: params.longitude,
          radius: params.radius || 5,
          radiusUnit: params.radiusUnit || 'KM',
        };

        if (params.chainCodes) {
          searchParams.chainCodes = params.chainCodes.join(',');
        }
        if (params.amenities) {
          searchParams.amenities = params.amenities.join(',');
        }
        if (params.ratings) {
          searchParams.ratings = params.ratings.join(',');
        }
        if (params.hotelSource) {
          searchParams.hotelSource = params.hotelSource;
        }

        response = await this.amadeusService.searchHotelsByGeocode(searchParams);
      } else {
        throw new Error('Either cityCode or latitude/longitude coordinates are required');
      }

      return response.data || [];
    } catch (error) {
      throw new Error(`Hotel search failed: ${error}`);
    }
  }

  /**
   * Search for hotel offers with pricing
   */
  async searchHotelOffers(params: HotelOffersSearchParams): Promise<HotelOffer[]> {
    try {
      const searchParams = {
        hotelIds: params.hotelIds.join(','),
        adults: params.adults,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        children: params.children,
        childAges: params.childAges?.join(','),
        roomQuantity: params.roomQuantity || 1,
        priceRange: params.priceRange,
        currency: params.currency,
        paymentPolicy: params.paymentPolicy,
        boardType: params.boardType,
      };

      const response = await this.amadeusService.searchHotelOffers(searchParams);
      return response.data || [];
    } catch (error) {
      throw new Error(`Hotel offers search failed: ${error}`);
    }
  }
} 