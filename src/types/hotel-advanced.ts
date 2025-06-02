/**
 * Advanced hotel feature type definitions
 */

export interface HotelSentimentParams {
  hotelIds: string[];
}

export interface HotelBookingParams {
  data: {
    type: string;
    hotelOffers: HotelOffer[];
    guests: Guest[];
    payments: Payment[];
  };
}

export interface HotelOffer {
  type: string;
  hotel: {
    type: string;
    hotelId: string;
    chainCode?: string;
    dupeId?: string;
    name: string;
    rating?: string;
    cityCode: string;
    latitude: number;
    longitude: number;
    hotelDistance?: {
      distance: number;
      distanceUnit: string;
    };
    address: {
      lines: string[];
      postalCode: string;
      cityName: string;
      countryCode: string;
    };
    contact?: {
      phone?: string;
      fax?: string;
      email?: string;
    };
    description?: {
      lang: string;
      text: string;
    };
    amenities?: string[];
    media?: Media[];
  };
  available: boolean;
  offers: Offer[];
  self?: string;
}

export interface Media {
  uri: string;
  category: string;
}

export interface Offer {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  rateCode?: string;
  rateFamilyEstimated?: {
    code: string;
    type: string;
  };
  category?: string;
  description?: {
    text: string;
    lang: string;
  };
  commission?: {
    percentage: string;
  };
  boardType?: string;
  room: {
    type: string;
    typeEstimated?: {
      category: string;
      beds: number;
      bedType: string;
    };
    description?: {
      text: string;
      lang: string;
    };
  };
  guests: {
    adults: number;
    childAges?: number[];
  };
  price: {
    currency: string;
    base?: string;
    total: string;
    taxes?: Tax[];
    markups?: Markup[];
    variations?: {
      average: {
        base: string;
      };
      changes: Change[];
    };
  };
  policies?: {
    paymentType?: string;
    guarantee?: {
      acceptedPayments: {
        creditCards?: string[];
        methods?: string[];
      };
    };
    deposit?: {
      acceptedPayments: {
        creditCards?: string[];
        methods?: string[];
      };
      amount?: string;
      deadline?: string;
    };
    prepay?: {
      acceptedPayments: {
        creditCards?: string[];
        methods?: string[];
      };
      amount?: string;
      deadline?: string;
    };
    holdTime?: string;
    cancellation?: {
      numberOfNights?: number;
      percentage?: string;
      amount?: string;
      deadline?: string;
      description?: {
        text: string;
        lang: string;
      };
      type?: string;
    };
  };
  self?: string;
}

export interface Tax {
  amount: string;
  currency: string;
  code: string;
  percentage?: string;
  included: boolean;
  description?: string;
  pricingFrequency?: string;
  pricingMode?: string;
}

export interface Markup {
  amount: string;
}

export interface Change {
  startDate: string;
  endDate: string;
  base: string;
}

export interface Guest {
  id: number;
  name: {
    title: string;
    firstName: string;
    lastName: string;
  };
  contact: {
    phone: string;
    email: string;
  };
}

export interface Payment {
  id: number;
  method: string;
  card?: {
    vendorCode: string;
    cardNumber: string;
    expiryDate: string;
  };
}

export interface HotelSentiment {
  type: string;
  hotelId: string;
  overallRating: number;
  numberOfRatings: number;
  numberOfReviews: number;
  sentiments: {
    sleepQuality: SentimentScore;
    service: SentimentScore;
    facilities: SentimentScore;
    roomComforts: SentimentScore;
    valueForMoney: SentimentScore;
    catering: SentimentScore;
    location: SentimentScore;
    internet: SentimentScore;
    pointsOfInterest: SentimentScore;
    staff: SentimentScore;
  };
}

export interface SentimentScore {
  score: number;
  description: string;
}

export interface HotelAutocomplete {
  type: string;
  subType: string;
  name: string;
  detailedName: string;
  id: string;
  self: {
    href: string;
    methods: string[];
  };
  timeZoneOffset?: string;
  iataCode?: string;
  geoCode: {
    latitude: number;
    longitude: number;
  };
  address: {
    cityName: string;
    cityCode?: string;
    countryName: string;
    countryCode: string;
    regionCode?: string;
  };
  distance?: {
    value: number;
    unit: string;
  };
  analytics?: {
    travelers: {
      score: number;
    };
  };
} 