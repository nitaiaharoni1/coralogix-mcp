/**
 * Service factory for managing Amadeus service instances
 */

import { AmadeusService } from '../services/amadeus.js';
import { AmadeusCredentials } from '../types/amadeus.js';

let amadeusService: AmadeusService | null = null;

export function getAmadeusService(): AmadeusService {
  if (!amadeusService) {
    const credentials: AmadeusCredentials = {
      clientId: process.env.AMADEUS_CLIENT_ID || '',
      clientSecret: process.env.AMADEUS_CLIENT_SECRET || '',
      environment: (process.env.AMADEUS_ENVIRONMENT as 'test' | 'production') || 'test',
    };

    if (!credentials.clientId || !credentials.clientSecret) {
      throw new Error('Amadeus API credentials are required. Please set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET environment variables.');
    }

    amadeusService = new AmadeusService(credentials);
  }

  return amadeusService;
}

export function resetAmadeusService(): void {
  amadeusService = null;
} 