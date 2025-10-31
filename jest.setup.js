import 'react-native-gesture-handler/jestSetup';

global.__DEV__ = true;

// Silence React Native logs in tests
jest.spyOn(global.console, 'error').mockImplementation(() => {});
jest.spyOn(global.console, 'warn').mockImplementation(() => {});
