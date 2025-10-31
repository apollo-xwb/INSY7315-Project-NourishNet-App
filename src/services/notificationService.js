import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import logger from '../utils/logger';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotifications = async (userId) => {
  try {
    if (!Device.isDevice) {
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;

    if (userId && token) {
      await setDoc(
        doc(db, 'users', userId),
        { pushToken: token, updatedAt: new Date() },
        { merge: true },
      );
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2E7D32',
      });
    }

    return token;
  } catch (error) {
    if (error.message && error.message.includes('projectId')) {
      return null;
    }
    logger.error('Error registering for push notifications:', error);
    return null;
  }
};

export const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const pushToken = userDoc.data()?.pushToken;

    if (!pushToken) {
      logger.warn('No push token for user:', userId);
      return;
    }

    const message = {
      to: pushToken,
      sound: 'default',
      title: title,
      body: body,
      data: data,
      priority: 'high',
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    logger.info('Push notification sent to user:', userId);
  } catch (error) {
    logger.error('Error sending push notification:', error);
  }
};

export const scheduleDonationExpiryNotification = async (donationId, itemName, expiryDate) => {
  try {
    const trigger = new Date(expiryDate);
    trigger.setHours(trigger.getHours() - 2);

    if (trigger > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Donation Expiring Soon!',
          body: `"${itemName}" expires in 2 hours. Claim it now!`,
          data: { donationId, type: 'expiry' },
        },
        trigger,
      });
    }
  } catch (error) {
    logger.error('Error scheduling expiry notification:', error);
  }
};

export const cancelNotification = async (identifier) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    logger.error('Error canceling notification:', error);
  }
};

export const addNotificationReceivedListener = (callback) => {
  return Notifications.addNotificationReceivedListener(callback);
};

export const addNotificationResponseReceivedListener = (callback) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};
