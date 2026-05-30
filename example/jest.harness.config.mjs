/** @type {import('jest').Config} */
export default {
  preset: 'react-native-harness',
  testMatch: ['<rootDir>/harness/tests/**/*.harness.{js,jsx,ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/harness/setupAfterEnv.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {},
  transformIgnorePatterns: ['/node_modules/'],
};
