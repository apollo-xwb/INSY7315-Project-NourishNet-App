import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from './logger';

const STORAGE_KEYS = {
  CACHED_LOCATION: '@nourishnet_cached_location',
  USER_SETTINGS: '@nourishnet_user_settings',
  FIRST_LAUNCH: '@nourishnet_has_launched',
};

export const getCachedLocation = async () => {
  try {
    const location = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_LOCATION);
    return location ? JSON.parse(location) : null;
  } catch (error) {
    logger.error('Error getting cached location:', error);
    return null;
  }
};

export const saveCachedLocation = async (location) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CACHED_LOCATION, JSON.stringify(location));
    return true;
  } catch (error) {
    logger.error('Error saving location:', error);
    return false;
  }
};

export const getUserSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    return settings
      ? JSON.parse(settings)
      : {
          notifications: true,
          lowDataMode: false,
          language: 'en',
        };
  } catch (error) {
    logger.error('Error getting settings:', error);
    return { notifications: true, lowDataMode: false, language: 'en' };
  }
};

export const saveUserSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    logger.error('Error saving settings:', error);
    return false;
  }
};

export const getFirstLaunch = async () => {
  try {
    const hasLaunched = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
    return hasLaunched === null;
  } catch (error) {
    logger.error('Error checking first launch:', error);
    return true;
  }
};

export const setFirstLaunchComplete = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, 'true');
    return true;
  } catch (error) {
    logger.error('Error setting first launch:', error);
    return false;
  }
};
