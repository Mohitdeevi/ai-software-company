export default {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: [],
  moduleNameMapper: {},
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js', '!src/server.js'],
  coverageThreshold: {
    global: { branches: 70, functions: 80, lines: 80, statements: 80 }
  },
  setupFilesAfterSetup: ['./tests/setup.js'],
  testTimeout: 30000,
};
