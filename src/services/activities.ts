/**
 * Activities and points of interest service
 */

import { AmadeusService } from './amadeus.js';
import { 
  ActivitiesSearchParams, 
  PointsOfInterestParams,
  Activity,
  PointOfInterest
} from '../types/activities.js';

export class ActivitiesService {
  constructor(private amadeusService: AmadeusService) {}

  /**
   * Search for activities and tours near a location
   */
  async searchActivities(params: ActivitiesSearchParams): Promise<Activity[]> {
    try {
      const searchParams = {
        latitude: params.latitude,
        longitude: params.longitude,
        radius: params.radius || 1
      };
      const response = await this.amadeusService.searchActivities(searchParams);
      return response.data || [];
    } catch (error) {
      throw this.amadeusService.handleError(error, 'Activities search');
    }
  }

  /**
   * Search for points of interest near a location
   */
  async searchPointsOfInterest(params: PointsOfInterestParams): Promise<PointOfInterest[]> {
    try {
      const searchParams = {
        latitude: params.latitude,
        longitude: params.longitude,
        radius: params.radius || 1,
        ...(params.categories && params.categories.length > 0 && { categories: params.categories.join(',') })
      };
      const response = await this.amadeusService.searchPointsOfInterest(searchParams);
      return response.data || [];
    } catch (error) {
      throw this.amadeusService.handleError(error, 'Points of interest search');
    }
  }
} 