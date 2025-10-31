module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  moduleFileExtensions: ['js', 'json'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '__tests__/use.*.test.js',
    '__tests__/LoginScreen.test.js',
    '__tests__/rules\\.donations\\.test\\.js',
    '__tests__/chatService.test.js',
    '__tests__/alertsService.test.js',
    '__tests__/ui\\.smoke\\.test\\.js',
  ],
};
