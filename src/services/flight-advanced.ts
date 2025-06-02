/**
 * Advanced flight service for seat maps, delay predictions, and booking
 */

import { AmadeusService } from './amadeus.js';
import { 
  FlightSeatMapParams, 
  FlightDelayPredictionParams, 
  FlightPricingParams,
  FlightBookingParams,
  SeatMap,
  FlightDelayPrediction
} from '../types/flight-advanced.js';

export class FlightAdvancedService {
  constructor(private amadeusService: AmadeusService) {}

  /**
   * Get seat maps for a flight
   */
  async getSeatMaps(params: FlightSeatMapParams): Promise<SeatMap[]> {
    try {
      const searchParams = {
        'flight-orderId': params.flightOrderId
      };
      const response = await this.amadeusService.getSeatMaps(searchParams);
      return response.data || [];
    } catch (error) {
      throw new Error(`Seat maps search failed: ${error}`);
    }
  }

  /**
   * Get flight delay prediction
   */
  async getFlightDelayPrediction(params: FlightDelayPredictionParams): Promise<FlightDelayPrediction | null> {
    try {
      const searchParams = {
        originLocationCode: params.originLocationCode,
        destinationLocationCode: params.destinationLocationCode,
        departureDate: params.departureDate,
        departureTime: params.departureTime,
        arrivalDate: params.arrivalDate,
        arrivalTime: params.arrivalTime,
        aircraftCode: params.aircraftCode,
        carrierCode: params.carrierCode,
        flightNumber: params.flightNumber,
        duration: params.duration
      };
      const response = await this.amadeusService.getFlightDelayPrediction(searchParams);
      return response.data || null;
    } catch (error) {
      throw new Error(`Flight delay prediction failed: ${error}`);
    }
  }

  /**
   * Get flight pricing with detailed breakdown
   */
  async getFlightPricing(params: FlightPricingParams): Promise<any> {
    try {
      const response = await this.amadeusService.getFlightPricing(params);
      return response.data || null;
    } catch (error) {
      throw new Error(`Flight pricing failed: ${error}`);
    }
  }

  /**
   * Create flight booking order
   */
  async createFlightBooking(params: FlightBookingParams): Promise<any> {
    try {
      const response = await this.amadeusService.createFlightOrder(params);
      return response.data || null;
    } catch (error) {
      throw new Error(`Flight booking failed: ${error}`);
    }
  }

  /**
   * Get flight booking by ID
   */
  async getFlightBooking(bookingId: string): Promise<any> {
    try {
      const response = await this.amadeusService.getFlightOrder(bookingId);
      return response.data || null;
    } catch (error) {
      throw new Error(`Flight booking retrieval failed: ${error}`);
    }
  }
} 