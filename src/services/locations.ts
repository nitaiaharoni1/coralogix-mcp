/**
 * Location search service
 */

import { AmadeusService } from './amadeus.js';
import { Location } from '../types/amadeus.js';

export class LocationService {
  constructor(private amadeusService: AmadeusService) {}

  /**
   * Search for locations (airports, cities)
   */
  async searchLocations(keyword: string, subType?: string): Promise<Location[]> {
    try {
      const params: any = {
        keyword,
        'page[limit]': 10,
      };
      
      if (subType) {
        params.subType = subType;
      }

      const response = await this.amadeusService.searchLocations(params);
      return response.data || [];
    } catch (error) {
      throw this.amadeusService.handleError(error, 'Location search');
    }
  }

  /**
   * Get airport information by IATA code
   */
  async getAirportInfo(iataCode: string): Promise<Location[]> {
    try {
      const params = {
        keyword: iataCode,
        subType: 'AIRPORT',
      };

      const response = await this.amadeusService.searchLocations(params);
      return response.data || [];
    } catch (error) {
      throw this.amadeusService.handleError(error, 'Airport info search');
    }
  }

  /**
   * Get nearby airports by coordinates
   */
  async getNearbyAirports(latitude: number, longitude: number, radius?: number): Promise<Location[]> {
    try {
      const params = {
        latitude,
        longitude,
        radius: radius || 500,
        'page[limit]': 10,
        sort: 'relevance',
      };

      const response = await this.amadeusService.getNearbyAirports(params);
      return response.data || [];
    } catch (error) {
      throw this.amadeusService.handleError(error, 'Nearby airports search');
    }
  }

  /**
   * Get airline information by IATA code
   */
  async getAirlineInfo(airlineCodes: string[]): Promise<any[]> {
    try {
      const params = {
        airlineCodes: airlineCodes.join(','),
      };

      const response = await this.amadeusService.getAirlineInfo(params);
      return response.data || [];
    } catch (error) {
      throw this.amadeusService.handleError(error, 'Airline info search');
    }
  }
} 