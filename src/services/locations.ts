/**
 * Location search service
 */

import { AmadeusService } from './amadeus.js';
import { Location } from '../types/amadeus.js';

export class LocationService {
  constructor(private amadeusService: AmadeusService) {}

  /**
   * Search for airports and cities
   */
  async searchLocations(keyword: string, subType?: string[]): Promise<Location[]> {
    try {
      const searchParams = {
        keyword,
        subType: subType?.join(',') || 'AIRPORT,CITY',
      };

      const response = await this.amadeusService.searchLocations(searchParams);
      return response.data || [];
    } catch (error) {
      throw new Error(`Location search failed: ${error}`);
    }
  }

  /**
   * Get airport information by IATA code
   */
  async getAirportInfo(iataCode: string): Promise<Location | null> {
    try {
      const searchParams = {
        keyword: iataCode,
        subType: 'AIRPORT',
      };

      const response = await this.amadeusService.searchLocations(searchParams);
      return response.data?.[0] || null;
    } catch (error) {
      throw new Error(`Airport info search failed: ${error}`);
    }
  }

  /**
   * Get nearby airports
   */
  async getNearbyAirports(latitude: number, longitude: number, radius: number = 500): Promise<Location[]> {
    try {
      const searchParams = {
        latitude,
        longitude,
        radius,
      };

      const response = await this.amadeusService.getNearbyAirports(searchParams);
      return response.data || [];
    } catch (error) {
      throw new Error(`Nearby airports search failed: ${error}`);
    }
  }

  /**
   * Get airline information
   */
  async getAirlineInfo(airlineCodes: string[]): Promise<any[]> {
    try {
      const searchParams = {
        airlineCodes: airlineCodes.join(','),
      };

      const response = await this.amadeusService.getAirlineInfo(searchParams);
      return response.data || [];
    } catch (error) {
      throw new Error(`Airline info search failed: ${error}`);
    }
  }
} 