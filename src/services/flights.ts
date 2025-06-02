/**
 * Flight search and booking service
 */

import { AmadeusService } from './amadeus.js';
import { FlightSearchParams, FlightOffer } from '../types/flights.js';

export class FlightService {
  constructor(private amadeusService: AmadeusService) {}

  /**
   * Search for flight offers
   */
  async searchFlights(params: FlightSearchParams): Promise<FlightOffer[]> {
    try {
      const searchParams = {
        originLocationCode: params.originLocationCode,
        destinationLocationCode: params.destinationLocationCode,
        departureDate: params.departureDate,
        returnDate: params.returnDate,
        adults: params.adults,
        children: params.children || 0,
        infants: params.infants || 0,
        travelClass: params.travelClass,
        includedAirlineCodes: params.includedAirlineCodes?.join(','),
        excludedAirlineCodes: params.excludedAirlineCodes?.join(','),
        nonStop: params.nonStop,
        currencyCode: params.currencyCode,
        maxPrice: params.maxPrice,
        max: params.max || 50,
      };

      const response = await this.amadeusService.searchFlights(searchParams);
      return response.data || [];
    } catch (error) {
      throw new Error(`Flight search failed: ${error}`);
    }
  }

  /**
   * Get flight inspiration (cheapest destinations)
   */
  async getFlightInspiration(origin: string, maxPrice?: number): Promise<any[]> {
    try {
      const searchParams = {
        origin,
        maxPrice,
      };

      const response = await this.amadeusService.getFlightInspiration(searchParams);
      return response.data || [];
    } catch (error) {
      throw new Error(`Flight inspiration search failed: ${error}`);
    }
  }

  /**
   * Get cheapest flight dates
   */
  async getCheapestDates(
    origin: string,
    destination: string,
    departureDate?: string,
    oneWay?: boolean
  ): Promise<any[]> {
    try {
      const searchParams = {
        origin,
        destination,
        departureDate,
        oneWay,
      };

      const response = await this.amadeusService.getCheapestDates(searchParams);
      return response.data || [];
    } catch (error) {
      throw new Error(`Cheapest dates search failed: ${error}`);
    }
  }
}