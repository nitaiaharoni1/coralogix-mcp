// /**
//  * Jest test setup file for E2E tests with real Amadeus API
//  */
//
// process.env.AMADEUS_CLIENT_ID = 'WkesBR5xClxgTkIr5AoL9Heod9lLchhb';
// process.env.AMADEUS_CLIENT_SECRET = 'vMG5Dg0e1qPCGe4V';
// process.env.AMADEUS_ENVIRONMENT = 'test';
// // Ensure required environment variables are set for testing
// if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
//   process.stderr.write('ERROR: Amadeus API credentials not found in environment variables\n');
//   process.stderr.write('       Please ensure AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET are set in .env file\n');
//   process.stderr.write('       E2E tests require real API credentials to function properly\n');
//   process.exit(1);
// }
//
// // Set test environment to use Amadeus test API
// process.env.AMADEUS_ENVIRONMENT = 'test';
//
// // Setup message
// process.stdout.write('TEST SETUP: E2E tests configured\n');
// process.stdout.write(`            Environment: ${process.env.AMADEUS_ENVIRONMENT}\n`);
// process.stdout.write(`            Client ID: ${process.env.AMADEUS_CLIENT_ID?.substring(0, 8)}...\n\n`);
//
// // Global test timeout for real API calls
// jest.setTimeout(30000);