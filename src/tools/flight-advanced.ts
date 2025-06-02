/**
 * Advanced flight MCP tools
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { FlightAdvancedService } from '../services/flight-advanced.js';
import { getAmadeusService } from '../utils/service-factory.js';

let flightAdvancedService: FlightAdvancedService | null = null;

function getFlightAdvancedService(): FlightAdvancedService {
  if (!flightAdvancedService) {
    flightAdvancedService = new FlightAdvancedService(getAmadeusService());
  }
  return flightAdvancedService;
}

export const flightAdvancedTools: Tool[] = [
  {
    name: 'get_flight_seat_maps',
    description: 'Get seat maps for a specific flight order',
    inputSchema: {
      type: 'object',
      properties: {
        flightOrderId: {
          type: 'string',
          description: 'Flight order ID to get seat maps for',
        },
      },
      required: ['flightOrderId'],
    },
  },
  {
    name: 'predict_flight_delay',
    description: 'Predict flight delay probability based on flight details',
    inputSchema: {
      type: 'object',
      properties: {
        originLocationCode: {
          type: 'string',
          description: 'Origin airport IATA code (e.g., "JFK")',
        },
        destinationLocationCode: {
          type: 'string',
          description: 'Destination airport IATA code (e.g., "LAX")',
        },
        departureDate: {
          type: 'string',
          description: 'Departure date in YYYY-MM-DD format',
        },
        departureTime: {
          type: 'string',
          description: 'Departure time in HH:MM:SS format',
        },
        arrivalDate: {
          type: 'string',
          description: 'Arrival date in YYYY-MM-DD format',
        },
        arrivalTime: {
          type: 'string',
          description: 'Arrival time in HH:MM:SS format',
        },
        aircraftCode: {
          type: 'string',
          description: 'Aircraft type code (e.g., "320")',
        },
        carrierCode: {
          type: 'string',
          description: 'Airline IATA code (e.g., "AA")',
        },
        flightNumber: {
          type: 'string',
          description: 'Flight number (e.g., "100")',
        },
        duration: {
          type: 'string',
          description: 'Flight duration in ISO 8601 format (e.g., "PT5H30M")',
        },
      },
      required: [
        'originLocationCode',
        'destinationLocationCode',
        'departureDate',
        'departureTime',
        'arrivalDate',
        'arrivalTime',
        'aircraftCode',
        'carrierCode',
        'flightNumber',
        'duration',
      ],
    },
  },
];

export async function handleFlightAdvancedTool(name: string, args: any): Promise<string> {
  const service = getFlightAdvancedService();

  switch (name) {
    case 'get_flight_seat_maps':
      return await handleGetSeatMaps(service, args);
    case 'predict_flight_delay':
      return await handleFlightDelayPrediction(service, args);
    default:
      throw new Error(`Unknown advanced flight tool: ${name}`);
  }
}

async function handleGetSeatMaps(service: FlightAdvancedService, args: any): Promise<string> {
  const seatMaps = await service.getSeatMaps(args);
  
  if (seatMaps.length === 0) {
    return 'No seat maps found for the specified flight order.';
  }

  const results = seatMaps.map((seatMap, index) => {
    const flight = `${seatMap.carrierCode}${seatMap.number}`;
    const route = `${seatMap.departure.iataCode} → ${seatMap.arrival.iataCode}`;
    const aircraft = seatMap.aircraft.code;
    const deckCount = seatMap.decks.length;
    const totalSeats = seatMap.decks.reduce((total, deck) => total + deck.seats.length, 0);
    
    return `${index + 1}. Flight ${flight}
   Route: ${route}
   Aircraft: ${aircraft}
   Decks: ${deckCount}
   Total Seats: ${totalSeats}
   Departure: ${new Date(seatMap.departure.at).toLocaleString()}
   Arrival: ${new Date(seatMap.arrival.at).toLocaleString()}`;
  });

  return `Seat Maps for Flight Order ${args.flightOrderId}:\n\n${results.join('\n\n')}`;
}

async function handleFlightDelayPrediction(service: FlightAdvancedService, args: any): Promise<string> {
  const prediction = await service.getFlightDelayPrediction(args);
  
  if (!prediction) {
    return 'No delay prediction available for the specified flight.';
  }

  const flight = `${args.carrierCode}${args.flightNumber}`;
  const route = `${args.originLocationCode} → ${args.destinationLocationCode}`;
  const probability = parseFloat(prediction.probability) * 100;
  
  return `Flight Delay Prediction for ${flight}:

Route: ${route}
Departure: ${args.departureDate} ${args.departureTime}
Arrival: ${args.arrivalDate} ${args.arrivalTime}
Aircraft: ${args.aircraftCode}
Duration: ${args.duration}

Prediction Result: ${prediction.result}
Delay Probability: ${probability.toFixed(1)}%
Prediction Type: ${prediction.subType}`;
} 