/**
 * Advanced hotel service for sentiments, ratings, and enhanced search
 */

import { AmadeusService } from './amadeus.js';
import { 
  HotelSentimentParams, 
  HotelBookingParams,
  HotelSentiment,
  HotelAutocomplete
} from '../types/hotel-advanced.js';

export class HotelAdvancedService {
  constructor(private amadeusService: AmadeusService) {}

  /**
   * Get hotel sentiments and ratings
   */
  async getHotelSentiments(params: HotelSentimentParams): Promise<HotelSentiment[]> {
    try {
      const searchParams = {
        hotelIds: params.hotelIds.join(',')
      };
      const response = await this.amadeusService.getHotelSentiments(searchParams);
      return response.data || [];
    } catch (error) {
      throw new Error(`Hotel sentiments search failed: ${error}`);
    }
  }

  /**
   * Search hotel names with autocomplete
   */
  async searchHotelAutocomplete(keyword: string): Promise<HotelAutocomplete[]> {
    try {
      const searchParams = {
        keyword,
        subType: 'HOTEL'
      };
      const response = await this.amadeusService.searchLocations(searchParams);
      return response.data || [];
    } catch (error) {
      throw new Error(`Hotel autocomplete search failed: ${error}`);
    }
  }

  /**
   * Create hotel booking order
   */
  async createHotelBooking(params: HotelBookingParams): Promise<any> {
    try {
      const response = await this.amadeusService.createHotelOrder(params);
      return response.data || null;
    } catch (error) {
      throw new Error(`Hotel booking failed: ${error}`);
    }
  }
} 