import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import logger from '../utils/logger';
import { db } from '../config/firebase';

const DEFAULT_SETTINGS = {
  notifications: {
    enabled: true,
    newDonations: true,
    claimUpdates: true,
    messages: true,
    sassa: true,
  },
  preferences: {
    theme: 'light',
    language: 'en',
    distanceUnit: 'km',
    lowDataMode: false,
  },
  privacy: {
    showLocation: true,
    showPhone: true,
    allowMessages: true,
    publicProfile: true,
  },
  map: {
    defaultRadius: 10,
    showAllDonations: true,
    autoRefresh: true,
  },
  updatedAt: new Date().toISOString(),
};

export const getUserSettings = async (userId) => {
  try {
    const settingsRef = doc(db, 'userSettings', userId);
    const settingsDoc = await getDoc(settingsRef);

    if (settingsDoc.exists()) {
      return {
        ...DEFAULT_SETTINGS,
        ...settingsDoc.data(),
      };
    } else {
      await setDoc(settingsRef, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
  } catch (error) {
    logger.error('Error getting user settings:', error);
    return DEFAULT_SETTINGS;
  }
};

export const updateUserSettings = async (userId, settings) => {
  try {
    const settingsRef = doc(db, 'userSettings', userId);

    const updatedSettings = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };

    const settingsDoc = await getDoc(settingsRef);

    if (settingsDoc.exists()) {
      await updateDoc(settingsRef, updatedSettings);
    } else {
      await setDoc(settingsRef, {
        ...DEFAULT_SETTINGS,
        ...updatedSettings,
      });
    }

    return await getUserSettings(userId);
  } catch (error) {
    logger.error('Error updating user settings:', error);
    throw error;
  }
};

export const updateNotificationSettings = async (userId, notificationSettings) => {
  try {
    return await updateUserSettings(userId, {
      notifications: notificationSettings,
    });
  } catch (error) {
    logger.error('Error updating notification settings:', error);
    throw error;
  }
};

export const updateThemePreference = async (userId, theme) => {
  try {
    const currentSettings = await getUserSettings(userId);
    return await updateUserSettings(userId, {
      preferences: {
        ...currentSettings.preferences,
        theme,
      },
    });
  } catch (error) {
    logger.error('Error updating theme preference:', error);
    throw error;
  }
};

export const updateLanguagePreference = async (userId, language) => {
  try {
    const currentSettings = await getUserSettings(userId);
    return await updateUserSettings(userId, {
      preferences: {
        ...currentSettings.preferences,
        language,
      },
    });
  } catch (error) {
    logger.error('Error updating language preference:', error);
    throw error;
  }
};

export const updatePrivacySettings = async (userId, privacySettings) => {
  try {
    return await updateUserSettings(userId, {
      privacy: privacySettings,
    });
  } catch (error) {
    logger.error('Error updating privacy settings:', error);
    throw error;
  }
};

export const resetSettings = async (userId) => {
  try {
    const settingsRef = doc(db, 'userSettings', userId);
    await setDoc(settingsRef, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  } catch (error) {
    logger.error('Error resetting settings:', error);
    throw error;
  }
};

export const toggleLowDataMode = async (userId, enabled) => {
  try {
    const currentSettings = await getUserSettings(userId);
    return await updateUserSettings(userId, {
      preferences: {
        ...currentSettings.preferences,
        lowDataMode: enabled,
      },
    });
  } catch (error) {
    logger.error('Error toggling low data mode:', error);
    throw error;
  }
};
