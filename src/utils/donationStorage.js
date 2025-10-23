import AsyncStorage from '@react-native-async-storage/async-storage';

const DONATIONS_KEY = '@nourishnet_donations';
const ALERTS_KEY = '@nourishnet_alerts';


export const getDonations = async () => {
  try {
    const donationsJson = await AsyncStorage.getItem(DONATIONS_KEY);
    if (donationsJson) {
      const donations = JSON.parse(donationsJson);

      return donations.map(donation => ({
        ...donation,
        expiryDate: new Date(donation.expiryDate),
        createdAt: new Date(donation.createdAt),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error getting donations from storage:', error);
    return [];
  }
};


export const saveDonation = async (donation) => {
  try {
    const donations = await getDonations();


    const newDonation = {
      ...donation,
      id: `donation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      status: 'available',
      claimed: false,
      verified: false,
    };

    donations.unshift(newDonation);
    await AsyncStorage.setItem(DONATIONS_KEY, JSON.stringify(donations));

    return newDonation;
  } catch (error) {
    console.error('Error saving donation:', error);
    throw error;
  }
};


export const updateDonation = async (donationId, updates) => {
  try {
    const donations = await getDonations();
    const index = donations.findIndex(d => d.id === donationId);

    if (index !== -1) {
      donations[index] = { ...donations[index], ...updates };
      await AsyncStorage.setItem(DONATIONS_KEY, JSON.stringify(donations));
      return donations[index];
    }

    throw new Error('Donation not found');
  } catch (error) {
    console.error('Error updating donation:', error);
    throw error;
  }
};


export const deleteDonation = async (donationId) => {
  try {
    const donations = await getDonations();
    const filtered = donations.filter(d => d.id !== donationId);
    await AsyncStorage.setItem(DONATIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting donation:', error);
    throw error;
  }
};


export const clearAllDonations = async () => {
  try {
    await AsyncStorage.removeItem(DONATIONS_KEY);
  } catch (error) {
    console.error('Error clearing donations:', error);
    throw error;
  }
};


export const getAlerts = async () => {
  try {
    const alertsJson = await AsyncStorage.getItem(ALERTS_KEY);
    if (alertsJson) {
      const alerts = JSON.parse(alertsJson);
      return alerts.map(alert => ({
        ...alert,
        timestamp: new Date(alert.timestamp),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error getting alerts from storage:', error);
    return [];
  }
};


export const saveAlert = async (alert) => {
  try {
    const alerts = await getAlerts();

    const newAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    alerts.unshift(newAlert);


    const trimmedAlerts = alerts.slice(0, 50);
    await AsyncStorage.setItem(ALERTS_KEY, JSON.stringify(trimmedAlerts));

    return newAlert;
  } catch (error) {
    console.error('Error saving alert:', error);
    throw error;
  }
};


export const markAlertAsRead = async (alertId) => {
  try {
    const alerts = await getAlerts();
    const index = alerts.findIndex(a => a.id === alertId);

    if (index !== -1) {
      alerts[index].read = true;
      await AsyncStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    }
  } catch (error) {
    console.error('Error marking alert as read:', error);
    throw error;
  }
};


export const clearAllAlerts = async () => {
  try {
    await AsyncStorage.removeItem(ALERTS_KEY);
  } catch (error) {
    console.error('Error clearing alerts:', error);
    throw error;
  }
};



