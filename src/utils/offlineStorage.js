


import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/logger';


const STORAGE_KEYS = {
  USER_DATA: 'user_data',
  DONATIONS: 'donations',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
  FIRST_LAUNCH: 'first_launch',
  CACHED_LOCATION: 'cached_location',
};


export const saveUserData = async (userData) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    return true;
  } catch (error) {
    logger.error('Error saving user data:', error);
    return false;
  }
};

export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    logger.error('Error getting user data:', error);
    return null;
  }
};

export const clearUserData = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    return true;
  } catch (error) {
    logger.error('Error clearing user data:', error);
    return false;
  }
};


export const saveDonations = async (donations) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));
    return true;
  } catch (error) {
    logger.error('Error saving donations:', error);
    return false;
  }
};

export const getDonations = async () => {
  try {
    const donations = await AsyncStorage.getItem(STORAGE_KEYS.DONATIONS);
    return donations ? JSON.parse(donations) : [];
  } catch (error) {
    logger.error('Error getting donations:', error);
    return [];
  }
};

export const addDonation = async (donation) => {
  try {
    const existingDonations = await getDonations();
    const updatedDonations = [...existingDonations, donation];
    await saveDonations(updatedDonations);
    return true;
  } catch (error) {
    logger.error('Error adding donation:', error);
    return false;
  }
};

export const updateDonation = async (donationId, updates) => {
  try {
    const existingDonations = await getDonations();
    const updatedDonations = existingDonations.map(donation =>
      donation.id === donationId ? { ...donation, ...updates } : donation
    );
    await saveDonations(updatedDonations);
    return true;
  } catch (error) {
    logger.error('Error updating donation:', error);
    return false;
  }
};


export const saveNotifications = async (notifications) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    return true;
  } catch (error) {
    logger.error('Error saving notifications:', error);
    return false;
  }
};

export const getNotifications = async () => {
  try {
    const notifications = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return notifications ? JSON.parse(notifications) : [];
  } catch (error) {
    logger.error('Error getting notifications:', error);
    return [];
  }
};

export const addNotification = async (notification) => {
  try {
    const existingNotifications = await getNotifications();
    const updatedNotifications = [...existingNotifications, notification];
    await saveNotifications(updatedNotifications);
    return true;
  } catch (error) {
    logger.error('Error adding notification:', error);
    return false;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const existingNotifications = await getNotifications();
    const updatedNotifications = existingNotifications.map(notification =>
      notification.id === notificationId ? { ...notification, isRead: true } : notification
    );
    await saveNotifications(updatedNotifications);
    return true;
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    return false;
  }
};


export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    logger.error('Error saving settings:', error);
    return false;
  }
};

export const getSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : {
      notifications: true,
      lowDataMode: false,
      language: 'en',
    };
  } catch (error) {
    logger.error('Error getting settings:', error);
    return {
      notifications: true,
      lowDataMode: false,
      language: 'en',
    };
  }
};


export const setFirstLaunch = async (isFirstLaunch) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, JSON.stringify(isFirstLaunch));
    return true;
  } catch (error) {
    logger.error('Error setting first launch:', error);
    return false;
  }
};

export const getFirstLaunch = async () => {
  try {
    const firstLaunch = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
    return firstLaunch ? JSON.parse(firstLaunch) : true;
  } catch (error) {
    logger.error('Error getting first launch:', error);
    return true;
  }
};


export const saveLocation = async (location) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CACHED_LOCATION, JSON.stringify(location));
    return true;
  } catch (error) {
    logger.error('Error saving location:', error);
    return false;
  }
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


export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    return true;
  } catch (error) {
    logger.error('Error clearing all data:', error);
    return false;
  }
};


export const compressImage = async (imageUri, quality = 0.8) => {
  try {


    return imageUri;
  } catch (error) {
    logger.error('Error compressing image:', error);
    return imageUri;
  }
};


export const isOnline = () => {

  return true;
};


export const syncDataWhenOnline = async () => {
  try {
    if (!isOnline()) {
      return false;
    }







    logger.log('Data sync completed');
    return true;
  } catch (error) {
    logger.error('Error syncing data:', error);
    return false;
  }
};


