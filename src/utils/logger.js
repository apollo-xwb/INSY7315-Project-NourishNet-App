import logger from '../utils/logger';

const isDevelopment = __DEV__;

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      logger.log(...args);
    }
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      logger.warn(...args);
    }
  },
  
  error: (...args) => {
    if (isDevelopment) {
      logger.error(...args);
    } else {
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      logger.info(...args);
    }
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      logger.debug(...args);
    }
  }
};

export default logger;

