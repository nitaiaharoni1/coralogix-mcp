/**
 * Amadeus API service using the official Amadeus Node SDK
 */

import Amadeus from 'amadeus';
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
  private handleError(error: any, operation: string): Error {
    if (error.response) {
      const status = error.response.statusCode || error.response.status;
      const errorData = error.response.body || error.response.data;
      
      if (errorData && errorData.errors) {
        const errorMessages = errorData.errors.map((err: any) => 
          `${err.code}: ${err.title} - ${err.detail || err.description || ''}`
        ).join('; ');
        return new Error(`${operation} failed (${status}): ${errorMessages}`);
      } else {
        return new Error(`${operation} failed (${status}): ${error.message || 'Unknown API error'}`);
      }
    } else if (error.code) {
      return new Error(`${operation} failed: ${error.code} - ${error.message}`);
    } else {
      return new Error(`${operation} failed: ${error.message || error.toString()}`);
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
      const response = await this.client.shopping.flightDates.get(params);
      return response;
    } catch (error) {
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