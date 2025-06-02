/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
    }],
  },
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/e2e'],
  testMatch: ['**/e2e/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 45000, // 45 seconds per test (increased for API calls)
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  
  // Parallel execution configuration
  maxWorkers: '50%', // Use 50% of available CPU cores
  workerIdleMemoryLimit: '512MB', // Limit memory per worker
  
  // Enhanced reporting
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './test-reports',
      filename: 'test-report.html',
      expand: true,
      hideIcon: false,
      pageTitle: 'Travel MCP Test Report',
      logoImgPath: undefined,
      includeFailureMsg: true,
      includeSuiteFailure: true,
      includeConsoleLog: true,
      enableMergeData: true,
      dataMergeLevel: 1,
      customInfos: [
        { title: 'Environment', value: 'Test' },
        { title: 'API', value: 'Amadeus Test API' },
        { title: 'Timestamp', value: new Date().toISOString() }
      ]
    }]
  ],
  
  // Performance optimizations
  verbose: true, // Show individual test results
  silent: false,
  bail: false, // Don't stop on first failure in parallel mode
  detectOpenHandles: true,
  forceExit: true,
  
  // Test execution strategy
  testSequencer: '@jest/test-sequencer', // Default sequencer for parallel execution
  
  // Cache configuration for faster subsequent runs
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Global setup/teardown for parallel tests
  globalSetup: undefined,
  globalTeardown: undefined,
  
  // Error handling
  errorOnDeprecated: false,
  testFailureExitCode: 1,
  
  // Output configuration
  clearMocks: true,
  restoreMocks: true,
  resetMocks: false,
}; 