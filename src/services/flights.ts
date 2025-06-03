/**
 * Flight search and booking service with comprehensive parameter support
 */

import { AmadeusService } from './amadeus.js';
import { FlightOffer, FlightSearchParams } from '../types/flights.js';

export class FlightService {
  constructor(private amadeusService: AmadeusService) {
  }

  /**
   * Search for flight offers with comprehensive parameter support
   */
  async searchFlights(params: FlightSearchParams): Promise<FlightOffer[]> {
    try {
      const searchParams: any = {
        originLocationCode: params.originLocationCode,
        destinationLocationCode: params.destinationLocationCode,
        departureDate: params.departureDate,
        adults: params.adults || 1,
      };

      // Add optional parameters to prevent 500 errors
      if (params.returnDate) searchParams.returnDate = params.returnDate;
      if (params.children) searchParams.children = params.children;
      if (params.infants) searchParams.infants = params.infants;
      if (params.travelClass) searchParams.travelClass = params.travelClass;
      if (params.nonStop !== undefined) searchParams.nonStop = params.nonStop;
      if (params.currencyCode) searchParams.currencyCode = params.currencyCode;
      if (params.maxPrice) searchParams.maxPrice = params.maxPrice;
      if (params.max) searchParams.max = params.max;
      if (params.maxNumberOfConnections !== undefined) searchParams.maxNumberOfConnections = params.maxNumberOfConnections;
      
      // Handle airline codes (can be string or array)
      if (params.includedAirlineCodes) {
        searchParams.includedAirlineCodes = Array.isArray(params.includedAirlineCodes) 
          ? params.includedAirlineCodes.join(',') 
          : params.includedAirlineCodes;
      }
      if (params.excludedAirlineCodes) {
        searchParams.excludedAirlineCodes = Array.isArray(params.excludedAirlineCodes) 
          ? params.excludedAirlineCodes.join(',') 
          : params.excludedAirlineCodes;
      }

      const response = await this.amadeusService.getClient().shopping.flightOffersSearch.get(searchParams);
      return this.transformFlightOffers(response.data);
    } catch (error) {
      throw this.amadeusService.handleError(error, 'Flight search');
    }
  }

  /**
   * Get cheapest flight dates with comprehensive filtering
   */
  async getCheapestDates(
    origin: string,
    destination: string,
    departureDate?: string,
    oneWay?: boolean,
    nonStop?: boolean,
    viewBy?: string,
    duration?: string,
    maxPrice?: number,
    currencyCode?: string,
    includedAirlineCodes?: string[],
    excludedAirlineCodes?: string[]
  ): Promise<any[]> {
    try {
      const params: any = {
        origin,
        destination,
      };

      // Add filtering parameters to prevent 500 errors
      if (departureDate) params.departureDate = departureDate;
      if (oneWay !== undefined) params.oneWay = oneWay;
      if (nonStop !== undefined) params.nonStop = nonStop;
      if (viewBy) params.viewBy = viewBy;
      if (duration) params.duration = duration;
      if (maxPrice) params.maxPrice = maxPrice;
      if (currencyCode) params.currencyCode = currencyCode;
      
      // Handle airline codes
      if (includedAirlineCodes && includedAirlineCodes.length > 0) {
        params.includedAirlineCodes = includedAirlineCodes.join(',');
      }
      if (excludedAirlineCodes && excludedAirlineCodes.length > 0) {
        params.excludedAirlineCodes = excludedAirlineCodes.join(',');
      }

      const response = await this.amadeusService.getCheapestDates(params);
      return response.data || [];
    } catch (error) {
      throw this.amadeusService.handleError(error, 'Cheapest dates search');
    }
  }

  /**
   * Get flight inspiration with comprehensive filtering
   */
  async getFlightInspiration(
    origin: string,
    maxPrice?: number,
    departureDate?: string,
    oneWay?: boolean,
    nonStop?: boolean,
    viewBy?: string,
    duration?: string,
    currencyCode?: string,
    includedAirlineCodes?: string[],
    excludedAirlineCodes?: string[]
  ): Promise<any[]> {
    try {
      const params: any = {
        origin,
      };

      // Add filtering parameters to prevent 500 errors
      if (maxPrice) params.maxPrice = maxPrice;
      if (departureDate) params.departureDate = departureDate;
      if (oneWay !== undefined) params.oneWay = oneWay;
      if (nonStop !== undefined) params.nonStop = nonStop;
      if (viewBy) params.viewBy = viewBy;
      if (duration) params.duration = duration;
      if (currencyCode) params.currencyCode = currencyCode;
      
      // Handle airline codes
      if (includedAirlineCodes && includedAirlineCodes.length > 0) {
        params.includedAirlineCodes = includedAirlineCodes.join(',');
      }
      if (excludedAirlineCodes && excludedAirlineCodes.length > 0) {
        params.excludedAirlineCodes = excludedAirlineCodes.join(',');
      }

      const response = await this.amadeusService.getFlightInspiration(params);
      return response.data || [];
    } catch (error) {
      throw this.amadeusService.handleError(error, 'Flight inspiration search');
    }
  }

  /**
   * Transform Amadeus flight offers to our format
   */
  private transformFlightOffers(offers: any[]): FlightOffer[] {
    return offers.map((offer) => ({
      type: offer.type || 'flight-offer',
      id: offer.id,
      source: offer.source || 'GDS',
      instantTicketingRequired: offer.instantTicketingRequired || false,
      nonHomogeneous: offer.nonHomogeneous || false,
      oneWay: offer.oneWay || false,
      lastTicketingDate: offer.lastTicketingDate,
      numberOfBookableSeats: offer.numberOfBookableSeats,
      itineraries: offer.itineraries.map((itinerary: any) => ({
        duration: itinerary.duration,
        segments: itinerary.segments.map((segment: any) => ({
          departure: {
            iataCode: segment.departure.iataCode,
            terminal: segment.departure.terminal,
            at: segment.departure.at,
          },
          arrival: {
            iataCode: segment.arrival.iataCode,
            terminal: segment.arrival.terminal,
            at: segment.arrival.at,
          },
          carrierCode: segment.carrierCode,
          number: segment.number,
          aircraft: segment.aircraft,
          operating: segment.operating,
          duration: segment.duration,
          id: segment.id,
          numberOfStops: segment.numberOfStops,
          blacklistedInEU: segment.blacklistedInEU || false,
        })),
      })),
      price: {
        currency: offer.price.currency,
        total: offer.price.total,
        base: offer.price.base,
        fees: offer.price.fees || [],
        grandTotal: offer.price.grandTotal,
      },
      pricingOptions: offer.pricingOptions || {
        fareType: ['PUBLISHED'],
        includedCheckedBagsOnly: false,
      },
      validatingAirlineCodes: offer.validatingAirlineCodes || [],
      travelerPricings: offer.travelerPricings || [],
    }));
  }
}