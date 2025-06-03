/**
 * Flight-related type definitions
 */

export interface FlightSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  includedAirlineCodes?: string[] | string;
  excludedAirlineCodes?: string[] | string;
  nonStop?: boolean;
  currencyCode?: string;
  maxPrice?: number;
  max?: number;
  maxNumberOfConnections?: number;
}

export interface FlightOffer {
  type: string;
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: Itinerary[];
  price: Price;
  pricingOptions: PricingOptions;
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
}export interface Itinerary {
  duration: string;
  segments: Segment[];
}

export interface Segment {
  departure: FlightEndPoint;
  arrival: FlightEndPoint;
  carrierCode: string;
  number: string;
  aircraft: Aircraft;
  operating?: Operating;
  duration: string;
  id: string;
  numberOfStops: number;
  blacklistedInEU: boolean;
}

export interface FlightEndPoint {
  iataCode: string;
  terminal?: string;
  at: string;
}

export interface Aircraft {
  code: string;
}

export interface Operating {
  carrierCode: string;
}

export interface Price {
  currency: string;
  total: string;
  base: string;
  fees: Fee[];
  grandTotal: string;
}

export interface Fee {
  amount: string;
  type: string;
}

export interface PricingOptions {
  fareType: string[];
  includedCheckedBagsOnly: boolean;
}

export interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: Price;
  fareDetailsBySegment: FareDetailsBySegment[];
}export interface FareDetailsBySegment {
  segmentId: string;
  cabin: string;
  fareBasis: string;
  brandedFare?: string;
  class: string;
  includedCheckedBags: {
    quantity: number;
  };
}