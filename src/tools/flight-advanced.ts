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
  {
    name: 'create_flight_booking',
    description: 'Create a flight booking order with traveler information',
    inputSchema: {
      type: 'object',
      properties: {
        flightOffers: {
          type: 'array',
          description: 'Array of flight offers to book (from search results)',
          items: {
            type: 'object',
            description: 'Flight offer object from search results',
          },
        },
        travelers: {
          type: 'array',
          description: 'Array of traveler information',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Traveler ID (e.g., "1", "2")',
              },
              dateOfBirth: {
                type: 'string',
                description: 'Date of birth in YYYY-MM-DD format',
              },
              name: {
                type: 'object',
                properties: {
                  firstName: {
                    type: 'string',
                    description: 'First name',
                  },
                  lastName: {
                    type: 'string',
                    description: 'Last name',
                  },
                },
                required: ['firstName', 'lastName'],
              },
              gender: {
                type: 'string',
                enum: ['MALE', 'FEMALE'],
                description: 'Gender',
              },
              contact: {
                type: 'object',
                properties: {
                  emailAddress: {
                    type: 'string',
                    description: 'Email address',
                  },
                  phones: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        deviceType: {
                          type: 'string',
                          enum: ['MOBILE', 'LANDLINE'],
                          description: 'Phone device type',
                        },
                        countryCallingCode: {
                          type: 'string',
                          description: 'Country calling code (e.g., "1" for US)',
                        },
                        number: {
                          type: 'string',
                          description: 'Phone number',
                        },
                      },
                      required: ['deviceType', 'countryCallingCode', 'number'],
                    },
                  },
                },
                required: ['emailAddress'],
              },
              documents: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    documentType: {
                      type: 'string',
                      enum: ['PASSPORT', 'IDENTITY_CARD'],
                      description: 'Document type',
                    },
                    birthPlace: {
                      type: 'string',
                      description: 'Birth place',
                    },
                    issuanceLocation: {
                      type: 'string',
                      description: 'Document issuance location',
                    },
                    issuanceDate: {
                      type: 'string',
                      description: 'Document issuance date in YYYY-MM-DD format',
                    },
                    number: {
                      type: 'string',
                      description: 'Document number',
                    },
                    expiryDate: {
                      type: 'string',
                      description: 'Document expiry date in YYYY-MM-DD format',
                    },
                    issuanceCountry: {
                      type: 'string',
                      description: 'Document issuance country code',
                    },
                    validityCountry: {
                      type: 'string',
                      description: 'Document validity country code',
                    },
                    nationality: {
                      type: 'string',
                      description: 'Nationality country code',
                    },
                    holder: {
                      type: 'boolean',
                      description: 'Whether the traveler is the document holder',
                    },
                  },
                  required: ['documentType', 'number', 'expiryDate', 'issuanceCountry', 'nationality', 'holder'],
                },
              },
            },
            required: ['id', 'dateOfBirth', 'name', 'gender', 'contact'],
          },
        },
        remarks: {
          type: 'object',
          properties: {
            general: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  subType: {
                    type: 'string',
                    description: 'Remark subtype',
                  },
                  text: {
                    type: 'string',
                    description: 'Remark text',
                  },
                },
                required: ['subType', 'text'],
              },
            },
          },
        },
        ticketingAgreement: {
          type: 'object',
          properties: {
            option: {
              type: 'string',
              enum: ['DELAY_TO_CANCEL', 'DELAY_TO_QUEUE'],
              description: 'Ticketing agreement option',
            },
            delay: {
              type: 'string',
              description: 'Delay period (e.g., "6D" for 6 days)',
            },
          },
          required: ['option'],
        },
        contacts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              addresseeName: {
                type: 'object',
                properties: {
                  firstName: {
                    type: 'string',
                    description: 'First name',
                  },
                  lastName: {
                    type: 'string',
                    description: 'Last name',
                  },
                },
                required: ['firstName', 'lastName'],
              },
              companyName: {
                type: 'string',
                description: 'Company name',
              },
              purpose: {
                type: 'string',
                enum: ['STANDARD', 'INVOICE'],
                description: 'Contact purpose',
              },
              phones: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    deviceType: {
                      type: 'string',
                      enum: ['MOBILE', 'LANDLINE'],
                      description: 'Phone device type',
                    },
                    countryCallingCode: {
                      type: 'string',
                      description: 'Country calling code',
                    },
                    number: {
                      type: 'string',
                      description: 'Phone number',
                    },
                  },
                  required: ['deviceType', 'countryCallingCode', 'number'],
                },
              },
              emailAddress: {
                type: 'string',
                description: 'Email address',
              },
              address: {
                type: 'object',
                properties: {
                  lines: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                    description: 'Address lines',
                  },
                  postalCode: {
                    type: 'string',
                    description: 'Postal code',
                  },
                  cityName: {
                    type: 'string',
                    description: 'City name',
                  },
                  countryCode: {
                    type: 'string',
                    description: 'Country code',
                  },
                },
                required: ['lines', 'postalCode', 'cityName', 'countryCode'],
              },
            },
            required: ['addresseeName', 'purpose'],
          },
        },
      },
      required: ['flightOffers', 'travelers'],
    },
  },
  {
    name: 'get_flight_booking',
    description: 'Retrieve flight booking details by booking ID',
    inputSchema: {
      type: 'object',
      properties: {
        bookingId: {
          type: 'string',
          description: 'Flight booking ID to retrieve details for',
        },
      },
      required: ['bookingId'],
    },
  },
  {
    name: 'get_flight_pricing',
    description: 'Get detailed flight pricing information with booking links',
    inputSchema: {
      type: 'object',
      properties: {
        flightOffers: {
          type: 'array',
          description: 'Array of flight offers to get pricing for (from search results)',
          items: {
            type: 'object',
            description: 'Flight offer object from search results',
          },
        },
      },
      required: ['flightOffers'],
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
    case 'create_flight_booking':
      return await handleCreateFlightBooking(service, args);
    case 'get_flight_booking':
      return await handleGetFlightBooking(service, args);
    case 'get_flight_pricing':
      return await handleGetFlightPricing(service, args);
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

async function handleCreateFlightBooking(service: FlightAdvancedService, args: any): Promise<string> {
  const bookingParams = {
    data: {
      type: 'flight-order',
      flightOffers: args.flightOffers,
      travelers: args.travelers,
      remarks: args.remarks,
      ticketingAgreement: args.ticketingAgreement,
      contacts: args.contacts,
    },
  };

  const booking = await service.createFlightBooking(bookingParams);
  
  if (!booking) {
    return 'Flight booking failed. Please check your booking details and try again.';
  }

  const bookingId = booking.id;
  const associatedRecords = booking.associatedRecords || [];
  const flightOffers = booking.flightOffers || [];
  
  let result = `✅ Flight Booking Created Successfully!

📋 Booking Details:
   Booking ID: ${bookingId}
   Type: ${booking.type}
   Booking Status: ${booking.queuingOfficeId ? 'Confirmed' : 'Pending'}`;

  if (associatedRecords.length > 0) {
    result += `\n\n🎫 Ticket Information:`;
    associatedRecords.forEach((record: any, index: number) => {
      result += `\n   ${index + 1}. Reference: ${record.reference}
      Creation Date: ${new Date(record.creationDate).toLocaleString()}
      Origin System: ${record.originSystemCode}`;
    });
  }

  if (flightOffers.length > 0) {
    result += `\n\n✈️ Booked Flights:`;
    flightOffers.forEach((offer: any, index: number) => {
      const itinerary = offer.itineraries[0];
      const outbound = itinerary.segments[0];
      const lastSegment = itinerary.segments[itinerary.segments.length - 1];
      
      result += `\n   ${index + 1}. ${outbound.carrierCode}${outbound.number}
      Route: ${outbound.departure.iataCode} → ${lastSegment.arrival.iataCode}
      Departure: ${new Date(outbound.departure.at).toLocaleString()}
      Arrival: ${new Date(lastSegment.arrival.at).toLocaleString()}
      Price: ${offer.price.currency} ${offer.price.total}`;
    });
  }

  // Add booking management links/information
  result += `\n\n🔗 Booking Management:
   • Use Booking ID "${bookingId}" for future reference
   • Contact airline directly for seat selection and special requests
   • Check-in typically opens 24 hours before departure
   • Keep booking confirmation for travel documents`;

  if (associatedRecords.length > 0) {
    result += `\n   • Ticket Reference: ${associatedRecords[0].reference}`;
  }

  return result;
}

async function handleGetFlightBooking(service: FlightAdvancedService, args: any): Promise<string> {
  const booking = await service.getFlightBooking(args.bookingId);
  
  if (!booking) {
    return 'Flight booking not found for the specified booking ID.';
  }

  const bookingId = booking.id;
  const associatedRecords = booking.associatedRecords || [];
  const flightOffers = booking.flightOffers || [];
  
  let result = `📋 Booking Details:
   Booking ID: ${bookingId}
   Type: ${booking.type}
   Booking Status: ${booking.queuingOfficeId ? 'Confirmed' : 'Pending'}`;

  if (associatedRecords.length > 0) {
    result += `\n\n🎫 Ticket Information:`;
    associatedRecords.forEach((record: any, index: number) => {
      result += `\n   ${index + 1}. Reference: ${record.reference}
      Creation Date: ${new Date(record.creationDate).toLocaleString()}
      Origin System: ${record.originSystemCode}`;
    });
  }

  if (flightOffers.length > 0) {
    result += `\n\n✈️ Booked Flights:`;
    flightOffers.forEach((offer: any, index: number) => {
      const itinerary = offer.itineraries[0];
      const outbound = itinerary.segments[0];
      const lastSegment = itinerary.segments[itinerary.segments.length - 1];
      
      result += `\n   ${index + 1}. ${outbound.carrierCode}${outbound.number}
      Route: ${outbound.departure.iataCode} → ${lastSegment.arrival.iataCode}
      Departure: ${new Date(outbound.departure.at).toLocaleString()}
      Arrival: ${new Date(lastSegment.arrival.at).toLocaleString()}
      Price: ${offer.price.currency} ${offer.price.total}`;
    });
  }

  // Add booking management links/information
  result += `\n\n🔗 Booking Management:
   • Use Booking ID "${bookingId}" for future reference
   • Contact airline directly for seat selection and special requests
   • Check-in typically opens 24 hours before departure
   • Keep booking confirmation for travel documents`;

  if (associatedRecords.length > 0) {
    result += `\n   • Ticket Reference: ${associatedRecords[0].reference}`;
  }

  return result;
}

async function handleGetFlightPricing(service: FlightAdvancedService, args: any): Promise<string> {
  const pricingParams = {
    data: {
      type: 'flight-offers-pricing',
      flightOffers: args.flightOffers,
    },
  };

  const pricing = await service.getFlightPricing(pricingParams);
  
  if (!pricing || !pricing.flightOffers) {
    return 'No pricing information available for the specified flight offers.';
  }

  const results = pricing.flightOffers.map((offer: any, index: number) => {
    const itinerary = offer.itineraries[0];
    const outbound = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];
    
    let result = `${index + 1}. ${outbound.carrierCode}${outbound.number}
   Route: ${outbound.departure.iataCode} → ${lastSegment.arrival.iataCode}
   Departure: ${new Date(outbound.departure.at).toLocaleString()}
   Arrival: ${new Date(lastSegment.arrival.at).toLocaleString()}
   
   💰 Pricing Details:
   • Total Price: ${offer.price.currency} ${offer.price.total}
   • Base Price: ${offer.price.currency} ${offer.price.base}
   • Grand Total: ${offer.price.currency} ${offer.price.grandTotal}`;

    if (offer.price.fees && offer.price.fees.length > 0) {
      result += `\n   • Fees: ${offer.price.fees.map((fee: any) => `${fee.type}: ${offer.price.currency} ${fee.amount}`).join(', ')}`;
    }

    result += `\n   
   🔗 Booking Information:
   • Offer ID: ${offer.id}
   • Last Ticketing Date: ${new Date(offer.lastTicketingDate).toLocaleDateString()}
   • Instant Ticketing: ${offer.instantTicketingRequired ? 'Required' : 'Not Required'}
   • Seats Available: ${offer.numberOfBookableSeats}
   
   📝 Ready to Book:
   • Use 'create_flight_booking' tool with this offer
   • Pricing confirmed and ready for booking
   • All taxes and fees included in grand total`;

    return result;
  });

  return `✈️ Detailed Flight Pricing:\n\n${results.join('\n\n')}\n\n💡 Next Steps:
• All prices include taxes and fees
• Use the offer IDs to proceed with booking
• Pricing is valid until the last ticketing date
• Contact information and traveler details required for booking`;
} 