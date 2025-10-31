module.exports = {
  preset: 'react-native',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/jest.setup.js',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo(nent)?|@expo(nent)?|@react-navigation|@testing-library|firebase|@firebase)/)'
  ],
  testMatch: ['**/__tests__/**/*ui*.test.[jt]s?(x)'],
};

