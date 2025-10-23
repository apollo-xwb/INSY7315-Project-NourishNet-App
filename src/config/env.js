export const ENV = {
  isDevelopment: __DEV__,
  enableMockData: false,
  enableLogging: __DEV__,
  
  app: {
    name: 'NourishNet',
    version: '1.0.0',
  },
  
  firebase: {
    offlineEnabled: true,
    cacheSizeUnlimited: true,
  },
  
  features: {
    googleSignIn: true,
    offlineQueue: true,
    alerts: true,
    chat: true,
    sassa: true,
    qrScanner: false,
  },
};

export default ENV;

