/**
 * Amadeus API type definitions
 */

// Base types
export interface AmadeusCredentials {
  clientId: string;
  clientSecret: string;
  environment: 'test' | 'production';
}

export interface AmadeusTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface AmadeusError {
  code: number;
  title: string;
  detail: string;
  source?: {
    parameter?: string;
    pointer?: string;
  };
}// Location types
export interface Location {
  type: string;
  subType: string;
  name: string;
  detailedName: string;
  id: string;
  self: {
    href: string;
    methods: string[];
  };
  timeZoneOffset: string;
  iataCode: string;
  geoCode: {
    latitude: number;
    longitude: number;
  };
  address: {
    cityName: string;
    cityCode: string;
    countryName: string;
    countryCode: string;
    regionCode: string;
  };
  analytics: {
    travelers: {
      score: number;
    };
  };
}