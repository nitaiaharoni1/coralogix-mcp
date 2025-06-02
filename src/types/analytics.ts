/**
 * Travel analytics and predictions type definitions
 */

export interface TravelAnalyticsParams {
  originCityCode: string;
  destinationCityCode: string;
  searchDate: string;
  marketCountryCode?: string;
  sourceCountry?: string[];
}

export interface TripPurposePredictionParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  searchDate: string;
}

export interface AirTrafficAnalytics {
  type: string;
  destination: string;
  subType: string;
  analytics: {
    flights: {
      score: number;
    };
    travelers: {
      score: number;
    };
  };
}

export interface TripPurposePrediction {
  type: string;
  id: string;
  probability: string;
  result: string;
  subType: string;
} 