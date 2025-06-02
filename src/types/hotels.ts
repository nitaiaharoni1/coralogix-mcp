/**
 * Hotel-related type definitions
 */

export interface HotelSearchParams {
  cityCode?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  radiusUnit?: 'KM' | 'MILE';
  chainCodes?: string[];
  amenities?: string[];
  ratings?: number[];
  hotelSource?: 'ALL' | 'BEDBANK' | 'DIRECTCHAIN';
}

export interface HotelOffersSearchParams {
  hotelIds: string[];
  adults: number;
  checkInDate: string;
  checkOutDate: string;
  children?: number;
  childAges?: number[];
  roomQuantity?: number;
  priceRange?: string;
  currency?: string;
  paymentPolicy?: 'NONE' | 'GUARANTEE' | 'DEPOSIT';
  boardType?: 'ROOM_ONLY' | 'BREAKFAST' | 'HALF_BOARD' | 'FULL_BOARD' | 'ALL_INCLUSIVE';
}export interface Hotel {
  type: string;
  hotelId: string;
  chainCode: string;
  dupeId: string;
  name: string;
  rating?: number;
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
    phone: string;
    fax?: string;
    email?: string;
  };
  description?: {
    lang: string;
    text: string;
  };
  amenities?: string[];
  media?: Media[];
}

export interface Media {
  uri: string;
  category: string;
}

export interface HotelOffer {
  type: string;
  hotel: {
    type: string;
    hotelId: string;
    chainCode: string;
    dupeId: string;
    name: string;
    cityCode: string;
    latitude: number;
    longitude: number;
  };
  available: boolean;
  offers: RoomOffer[];
  self: string;
}export interface RoomOffer {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  rateCode: string;
  rateFamilyEstimated?: {
    code: string;
    type: string;
  };
  room: {
    type: string;
    typeEstimated: {
      category: string;
      beds: number;
      bedType: string;
    };
    description: {
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
    base: string;
    total: string;
    variations: {
      average: {
        base: string;
      };
      changes: Array<{
        startDate: string;
        endDate: string;
        base: string;
      }>;
    };
  };
  policies: {
    paymentType: string;
    cancellation?: {
      description: {
        text: string;
      };
    };
  };
  self: string;
}