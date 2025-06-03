/**
 * Amadeus API service using the amadeus-ts SDK with full TypeScript support
 */

import Amadeus, { ResponseError } from 'amadeus-ts';
import { AmadeusCredentials } from '../types/amadeus.js';

interface AmadeusResponse<T = any> {
  data: T;
  result: any;
  body: any;
}

export class AmadeusService {
  private client: Amadeus;

  constructor(credentials: AmadeusCredentials) {
    this.client = new Amadeus({
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
      hostname: credentials.environment === 'production' ? 'production' : 'test',
    });
  }

  /**
   * Get the Amadeus client instance
   */
  getClient(): Amadeus {
    return this.client;
  }

  /**
   * Handle Amadeus API errors with detailed information
   */
  public handleError(error: any, operation: string): Error {
    // Handle the new ResponseError from amadeus-ts
    if (error instanceof ResponseError) {
      const status = error.code;
      const errorData = error.response?.body;

      // Special handling for 500 errors - these typically indicate searches are too generic
      if (status === 'ServerError' || (error.response?.statusCode === 500)) {
        return new Error(
          `${operation} failed: Search too generic - need more request parameters to filter results. ` +
          `Try adding parameters like: maxPrice, nonStop=true, includedAirlineCodes, excludedAirlineCodes, ` +
          `travelClass, or more specific dates. The Amadeus API times out when searches are too broad.`
        );
      }

      if (error.description && error.description.length > 0) {
        const errorMessages = error.description.map((err: any) =>
          `${err.code}: ${err.title} - ${err.detail || ''}`,
        ).join('; ');
        return new Error(`${operation} failed (${status}): ${errorMessages}`);
      } else {
        return new Error(`${operation} failed (${status}): Unknown API error`);
      }
    } else if (error.response) {
      const status = error.response.statusCode || error.response.status;
      
      // Also handle 500 errors from regular HTTP responses
      if (status === 500) {
        return new Error(
          `${operation} failed: Search too generic - need more request parameters to filter results. ` +
          `Try adding parameters like: maxPrice, nonStop=true, includedAirlineCodes, excludedAirlineCodes, ` +
          `travelClass, or more specific dates. The Amadeus API times out when searches are too broad.`
        );
      }

      const errorData = error.response.data || error.response.body;
      if (errorData && errorData.errors) {
        const errorMessages = errorData.errors.map((err: any) =>
          `${err.code}: ${err.title} - ${err.detail || ''}`,
        ).join('; ');
        return new Error(`${operation} failed (${status}): ${errorMessages}`);
      } else {
        return new Error(`${operation} failed (${status}): ${errorData?.message || 'Unknown error'}`);
      }
    } else {
      return new Error(`${operation} failed: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Search for flight offers
   */
  async searchFlights(params: any): Promise<AmadeusResponse> {
    try {
      const response = await this.client.shopping.flightOffersSearch.get(params);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Flight search');
    }
  }

  /**
   * Get flight inspiration
   */
  async getFlightInspiration(params: any): Promise<AmadeusResponse> {
    try {
      const response = await this.client.shopping.flightDestinations.get(params);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Flight inspiration search');
    }
  }

  /**
   * Get cheapest flight dates
   */
  async getCheapestDates(params: any): Promise<AmadeusResponse> {
    try {
      // Validate required parameters
      if (!params.origin || !params.destination) {
        throw new Error('Origin and destination are required for cheapest dates search');
      }

      // Ensure IATA codes are uppercase and 3 characters
      const validatedParams = {
        ...params,
        origin: params.origin.toUpperCase().trim(),
        destination: params.destination.toUpperCase().trim(),
      };

      // Validate IATA code format (3 letters)
      if (!/^[A-Z]{3}$/.test(validatedParams.origin)) {
        throw new Error(`Invalid origin IATA code: ${validatedParams.origin}. Must be 3 letters.`);
      }
      if (!/^[A-Z]{3}$/.test(validatedParams.destination)) {
        throw new Error(`Invalid destination IATA code: ${validatedParams.destination}. Must be 3 letters.`);
      }

      // Convert ISO 8601 duration to days format if needed
      if (validatedParams.duration && validatedParams.duration.startsWith('PT')) {
        // Convert PT8H to days format (8 hours = 1 day approximately)
        // For simplicity, convert hours to days and create a range
        const hours = parseInt(validatedParams.duration.match(/(\d+)H/)?.[1] || '24');
        const days = Math.ceil(hours / 24);
        validatedParams.duration = `1,${Math.max(days, 7)}`; // Range from 1 to calculated days (minimum 7)
      }

      const response = await this.client.shopping.flightDates.get(validatedParams);
      return response;
    } catch (error: any) {
      // Enhanced error logging for debugging 500 errors (but don't use console.log to avoid JSON-RPC interference)
      if (error.response) {
        // Log to stderr instead of stdout to avoid JSON-RPC interference
        process.stderr.write(`Cheapest dates API error: ${error.response.statusCode || error.response.status}\n`);
        process.stderr.write(`Request params: ${JSON.stringify(params, null, 2)}\n`);
        process.stderr.write(`Response body: ${JSON.stringify(error.response.body || error.response.data, null, 2)}\n`);
      }

      // Handle specific API errors for cheapest dates
      if (error.description && Array.isArray(error.description)) {
        const errorDetails = error.description[0];
        process.stderr.write(`Error description: ${JSON.stringify(errorDetails, null, 2)}\n`);
      }
      
      throw this.handleError(error, 'Cheapest dates search');
    }
  }

  /**
   * Search for hotels by city
   */
  async searchHotelsByCity(params: any): Promise<AmadeusResponse> {
    try {
      const response = await this.client.referenceData.locations.hotels.byCity.get(params);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Hotel search by city');
    }
  }

  /**
   * Search for hotels by geocode (coordinates)
   */
  async searchHotelsByGeocode(params: any): Promise<AmadeusResponse> {
    try {
      const response = await this.client.referenceData.locations.hotels.byGeocode.get(params);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Hotel search by geocode');
    }
  }

  /**
   * Search for hotel offers
   */
  async searchHotelOffers(params: any): Promise<AmadeusResponse> {
    try {
      const response = await this.client.shopping.hotelOffersSearch.get(params);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Hotel offers search');
    }
  }

  /**
   * Search for locations (airports, cities)
   */
  async searchLocations(params: any): Promise<AmadeusResponse> {
    try {
      const response = await this.client.referenceData.locations.get(params);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Location search');
    }
  }

  /**
   * Get nearby airports
   */
  async getNearbyAirports(params: any): Promise<AmadeusResponse> {
    try {
      const response = await this.client.referenceData.locations.airports.get(params);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Nearby airports search');
    }
  }

  /**
   * Get airline information
   */
  async getAirlineInfo(params: any): Promise<AmadeusResponse> {
    try {
      const response = await this.client.referenceData.airlines.get(params);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Airline info search');
    }
  }

  /**
   * Get seat maps for a flight
   */
  async getSeatMaps(params: any): Promise<AmadeusResponse> {
    try {
      const response = await this.client.shopping.seatmaps.get(params);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Seat maps search');
    }
  }

  /**
   * Get flight delay prediction
   */
  async getFlightDelayPrediction(params: any): Promise<AmadeusResponse> {
    try {
      const response = await this.client.travel.predictions.flightDelay.get(params);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Flight delay prediction');
    }
  }

  /**
   * Create flight order (booking)
   */
  async createFlightOrder(params: any): Promise<AmadeusResponse> {
    try {
      const response = await this.client.booking.flightOrders.post(params);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Flight booking');
    }
  }

  /**
   * Get flight order by ID
   */
  async getFlightOrder(flightOrderId: string): Promise<AmadeusResponse> {
    try {
      const response = await this.client.booking.flightOrder(flightOrderId).get();
      return response;
    } catch (error) {
      throw this.handleError(error, 'Flight order retrieval');
    }
  }

  /**
   * Get flight pricing
   */
  async getFlightPricing(params: any): Promise<AmadeusResponse> {
    try {
      const response = await this.client.shopping.flightOffers.pricing.post(params);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Flight pricing');
    }
  }

  /**
   * Get hotel sentiments and ratings
   */
  async getHotelSentiments(params: any): Promise<AmadeusResponse> {
    try {
      const response = await this.client.eReputation.hotelSentiments.get(params);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Hotel sentiments search');
    }
  }

  /**
   * Create hotel order (booking)
   */
  async createHotelOrder(params: any): Promise<AmadeusResponse> {
    try {
      const response = await this.client.booking.hotelOrders.post(params);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Hotel booking');
    }
  }

  /**
   * Search for activities and tours
   */
  async searchActivities(params: any): Promise<AmadeusResponse> {
    try {
      const response = await this.client.shopping.activities.get(params);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Activities search');
    }
  }

  /**
   * Search for points of interest
   */
  async searchPointsOfInterest(params: any): Promise<AmadeusResponse> {
    try {
      const response = await this.client.referenceData.locations.pointsOfInterest.get(params);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Points of interest search');
    }
  }

  /**
   * Get travel analytics
   */
  async getTravelAnalytics(params: any): Promise<AmadeusResponse> {
    try {
      // Note: This endpoint may not be available in the test environment
      throw new Error('Travel analytics endpoint not available in current Amadeus SDK version');
      // const response = await this.client.travel.analytics.airTraffic.get(params);
      // return response;
    } catch (error) {
      throw this.handleError(error, 'Travel analytics');
    }
  }

  /**
   * Get trip purpose prediction
   */
  async getTripPurposePrediction(params: any): Promise<AmadeusResponse> {
    try {
      // Note: This endpoint may not be available in the test environment
      throw new Error('Trip purpose prediction endpoint not available in current Amadeus SDK version');
      // const response = await this.client.travel.predictions.tripPurpose.get(params);
      // return response;
    } catch (error) {
      throw this.handleError(error, 'Trip purpose prediction');
    }
  }
}