import logger from '../utils/logger';
import { FirebaseAlertsRepository } from '../domain/repository/AlertsRepository';

const repo = new FirebaseAlertsRepository();

export const createAlert = async (userId, alertData) => {
  try {
    return await repo.create(userId, alertData);
  } catch (error) {
    logger.error('Error creating alert:', error);
    throw error;
  }
};

export const getUnreadAlerts = async (userId) => {
  try {
    return await repo.findUnread(userId);
  } catch (error) {
    logger.error('Error getting unread alerts:', error);
    return [];
  }
};

export const getUserAlerts = async (userId, includeRead = true) => {
  try {
    return await repo.findByUser(userId, includeRead);
  } catch (error) {
    logger.error('Error getting user alerts:', error);
    throw error;
  }
};

export const getUnreadAlertCount = async (userId) => {
  try {
    return await repo.unreadCount(userId);
  } catch (error) {
    logger.error('Error getting unread alert count:', error);
    return 0;
  }
};

export const markAlertAsRead = async (alertId) => {
  try {
    await repo.markRead(alertId);
  } catch (error) {
    logger.error('Error marking alert as read:', error);
    throw error;
  }
};

export const markAllAlertsAsRead = async (userId) => {
  try {
    await repo.markAllRead(userId);
  } catch (error) {
    logger.error('Error marking all alerts as read:', error);
    throw error;
  }
};

export const deleteAlert = async (alertId) => {
  try {
    await repo.delete(alertId);
  } catch (error) {
    logger.error('Error deleting alert:', error);
    throw error;
  }
};

export const deleteExpiredAlerts = async (userId) => {
  try {
    return await repo.deleteExpired(userId);
  } catch (error) {
    logger.error('Error deleting expired alerts:', error);
    return 0;
  }
};

export const notifyNearbyUsers = async (donation, nearbyUserIds) => {
  try {
    const alertPromises = nearbyUserIds.map((userId) =>
      createAlert(userId, {
        type: 'donation',
        title: 'New Donation Nearby',
        message: `${donation.itemName} is available for pickup near you!`,
        donationId: donation.id,
      }),
    );

    return await Promise.all(alertPromises);
  } catch (error) {
    logger.error('Error notifying nearby users:', error);
    throw error;
  }
};
