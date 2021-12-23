import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testTimeout: 30000,
  verbose: true,
  testEnvironment: "node",
};
export default config;