/**
 * Travel analytics and predictions service
 */

import { AmadeusService } from './amadeus.js';
import { 
  TravelAnalyticsParams, 
  TripPurposePredictionParams,
  AirTrafficAnalytics,
  TripPurposePrediction
} from '../types/analytics.js';

export class AnalyticsService {
  constructor(private amadeusService: AmadeusService) {}

  /**
   * Get travel analytics for air traffic
   */
  async getTravelAnalytics(params: TravelAnalyticsParams): Promise<AirTrafficAnalytics[]> {
    try {
      const searchParams = {
        originCityCode: params.originCityCode,
        destinationCityCode: params.destinationCityCode,
        searchDate: params.searchDate,
        marketCountryCode: params.marketCountryCode,
        ...(params.sourceCountry && params.sourceCountry.length > 0 && { sourceCountry: params.sourceCountry.join(',') })
      };
      const response = await this.amadeusService.getTravelAnalytics(searchParams);
      return response.data || [];
    } catch (error) {
      throw new Error(`Travel analytics failed: ${error}`);
    }
  }

  /**
   * Get trip purpose prediction
   */
  async getTripPurposePrediction(params: TripPurposePredictionParams): Promise<TripPurposePrediction | null> {
    try {
      const searchParams = {
        originLocationCode: params.originLocationCode,
        destinationLocationCode: params.destinationLocationCode,
        departureDate: params.departureDate,
        returnDate: params.returnDate,
        searchDate: params.searchDate
      };
      const response = await this.amadeusService.getTripPurposePrediction(searchParams);
      return response.data || null;
    } catch (error) {
      throw new Error(`Trip purpose prediction failed: ${error}`);
    }
  }
} 