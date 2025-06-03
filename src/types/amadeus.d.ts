declare module 'amadeus' {
  interface AmadeusConfig {
    clientId: string;
    clientSecret: string;
    hostname?: string;
  }

  interface AmadeusResponse<T = any> {
    data: T;
    result: any;
    body: any;
    response?: any;
    statusCode?: number;
    status?: number;
  }

  class Amadeus {
    constructor(config: AmadeusConfig);
    
    shopping: {
      flightOffersSearch: {
        get(params: any): Promise<AmadeusResponse>;
      };
      flightDestinations: {
        get(params: any): Promise<AmadeusResponse>;
      };
      flightDates: {
        get(params: any): Promise<AmadeusResponse>;
      };
      hotelOffersSearch: {
        get(params: any): Promise<AmadeusResponse>;
      };
      seatmaps: {
        get(params: any): Promise<AmadeusResponse>;
      };
      flightOffers: {
        pricing: {
          post(params: any): Promise<AmadeusResponse>;
        };
      };
      activities: {
        get(params: any): Promise<AmadeusResponse>;
      };
    };
    
    referenceData: {
      locations: {
        get(params: any): Promise<AmadeusResponse>;
        airports: {
          get(params: any): Promise<AmadeusResponse>;
        };
        hotels: {
          byCity: {
            get(params: any): Promise<AmadeusResponse>;
          };
          byGeocode: {
            get(params: any): Promise<AmadeusResponse>;
          };
        };
        pointsOfInterest: {
          get(params: any): Promise<AmadeusResponse>;
        };
      };
      airlines: {
        get(params: any): Promise<AmadeusResponse>;
      };
    };
    
    travel: {
      predictions: {
        flightDelay: {
          get(params: any): Promise<AmadeusResponse>;
        };
        tripPurpose: {
          get(params: any): Promise<AmadeusResponse>;
        };
      };
      analytics: {
        airTraffic: {
          get(params: any): Promise<AmadeusResponse>;
        };
      };
    };
    
    booking: {
      flightOrders: {
        post(params: any): Promise<AmadeusResponse>;
        get(params: any): Promise<AmadeusResponse>;
      };
      flightOrder(orderId: string): {
        get(): Promise<AmadeusResponse>;
        delete(): Promise<AmadeusResponse>;
      };
      hotelOrders: {
        post(params: any): Promise<AmadeusResponse>;
      };
    };
    
    eReputation: {
      hotelSentiments: {
        get(params: any): Promise<AmadeusResponse>;
      };
    };
  }

  export = Amadeus;
} 