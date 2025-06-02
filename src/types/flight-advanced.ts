/**
 * Advanced flight feature type definitions
 */

export interface FlightSeatMapParams {
  flightOrderId: string;
}

export interface FlightDelayPredictionParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  aircraftCode: string;
  carrierCode: string;
  flightNumber: string;
  duration: string;
}

export interface FlightPricingParams {
  data: {
    type: string;
    flightOffers: FlightOffer[];
  };
}

export interface FlightBookingParams {
  data: {
    type: string;
    flightOffers: FlightOffer[];
    travelers: Traveler[];
    remarks?: {
      general?: GeneralRemark[];
    };
    ticketingAgreement?: {
      option: string;
      delay?: string;
    };
    contacts?: Contact[];
  };
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
}

export interface Itinerary {
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
}

export interface FareDetailsBySegment {
  segmentId: string;
  cabin: string;
  fareBasis: string;
  brandedFare?: string;
  class: string;
  includedCheckedBags: {
    quantity: number;
  };
}

export interface Traveler {
  id: string;
  dateOfBirth: string;
  name: {
    firstName: string;
    lastName: string;
  };
  gender: string;
  contact?: {
    emailAddress?: string;
    phones?: Phone[];
  };
  documents?: Document[];
}

export interface Phone {
  deviceType: string;
  countryCallingCode: string;
  number: string;
}

export interface Document {
  documentType: string;
  birthPlace?: string;
  issuanceLocation?: string;
  issuanceDate?: string;
  number: string;
  expiryDate: string;
  issuanceCountry: string;
  validityCountry: string;
  nationality: string;
  holder: boolean;
}

export interface GeneralRemark {
  subType: string;
  text: string;
}

export interface Contact {
  addresseeName: {
    firstName: string;
    lastName: string;
  };
  companyName?: string;
  purpose: string;
  phones: Phone[];
  emailAddress: string;
  address: {
    lines: string[];
    postalCode: string;
    cityName: string;
    countryCode: string;
  };
}

export interface SeatMap {
  type: string;
  flightOfferId: string;
  segmentId: string;
  carrierCode: string;
  number: string;
  aircraft: {
    code: string;
  };
  departure: {
    iataCode: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    at: string;
  };
  decks: Deck[];
}

export interface Deck {
  deckType: string;
  deckConfiguration: {
    width: number;
    length: number;
    startseatRow: number;
    endSeatRow: number;
  };
  facilities: Facility[];
  seats: Seat[];
}

export interface Facility {
  code: string;
  column: string;
  row: string;
  position: {
    x: number;
    y: number;
  };
}

export interface Seat {
  cabin: string;
  number: string;
  characteristicsCodes: string[];
  travelerPricing: {
    travelerId: string;
    seatAvailabilityStatus: string;
    price?: {
      currency: string;
      total: string;
      base: string;
      taxes: Tax[];
    };
  }[];
}

export interface Tax {
  amount: string;
  code: string;
}

export interface FlightDelayPrediction {
  id: string;
  probability: string;
  result: string;
  subType: string;
  type: string;
} 