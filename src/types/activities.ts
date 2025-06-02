/**
 * Activities and points of interest type definitions
 */

export interface ActivitiesSearchParams {
  latitude: number;
  longitude: number;
  radius?: number;
}

export interface PointsOfInterestParams {
  latitude: number;
  longitude: number;
  radius?: number;
  categories?: string[];
}

export interface Activity {
  type: string;
  id: string;
  self: {
    href: string;
    methods: string[];
  };
  name: string;
  shortDescription: string;
  description: string;
  geoCode: {
    latitude: number;
    longitude: number;
  };
  rating: string;
  pictures: string[];
  bookingLink: string;
  price: {
    currencyCode: string;
    amount: string;
  };
  minimumDuration?: string;
  maximumDuration?: string;
  categories: string[];
  tags: string[];
}

export interface PointOfInterest {
  type: string;
  id: string;
  self: {
    href: string;
    methods: string[];
  };
  name: string;
  category: string;
  rank: string;
  tags: string[];
  geoCode: {
    latitude: number;
    longitude: number;
  };
  analytics?: {
    travelers: {
      score: number;
    };
  };
} 