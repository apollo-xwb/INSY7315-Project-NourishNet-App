/**
 * useAlerts Hook
 *
 * Purpose: Loads the user's alerts, tracks unread count, and exposes
 * helpers to mark read, delete, and clear alerts.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getUserAlerts,
  markAlertAsRead,
  deleteAlert,
  getUnreadAlerts,
  deleteExpiredAlerts,
} from '../services/alertsService';
import logger from '../utils/logger';
import { onSnapshot, query, collection, where } from 'firebase/firestore';
import { db } from '../config/firebase';

const useAlerts = (userId, { autoLoad = true, autoCleanup = true, onNewAlert = null } = {}) => {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);

  const calculateUnreadCount = useCallback((alertsList) => {
    return alertsList.filter((alert) => !alert.read && !alert.isRead).length;
  }, []);

  const loadAlerts = useCallback(async () => {
    if (!userId) {
      logger.warn('[useAlerts] No userId provided');
      setAlerts([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (autoCleanup) {
        await deleteExpiredAlerts(userId);
      }

      logger.info(`[useAlerts] Loading alerts for user: ${userId}`);
      const userAlerts = await getUserAlerts(userId);

      if (!Array.isArray(userAlerts)) {
        throw new Error('Invalid alerts data received');
      }

      const sortedAlerts = userAlerts.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB - dateA;
      });

      setAlerts(sortedAlerts);
      setUnreadCount(calculateUnreadCount(sortedAlerts));

      logger.info(
        `[useAlerts] Loaded ${sortedAlerts.length} alerts, ${calculateUnreadCount(sortedAlerts)} unread`,
      );
    } catch (err) {
      logger.error('[useAlerts] Error loading alerts:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId, autoCleanup, calculateUnreadCount]);

  useEffect(() => {
    if (!userId) return;

    const q = query(collection(db, 'alerts'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const now = new Date();
          const items = snapshot.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((a) => {
              const exp = a.expiresAt?.toDate?.() || (a.expiresAt ? new Date(a.expiresAt) : null);
              return !exp || exp >= now;
            })
            .sort((a, b) => {
              const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
              const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
              return dateB - dateA;
            });
          setAlerts(items);
          setUnreadCount(calculateUnreadCount(items));
        } catch (err) {
          logger.error('[useAlerts] Realtime alerts parse error:', err);
        }
      },
      (err) => logger.error('[useAlerts] Realtime alerts error:', err),
    );

    return () => unsubscribe();
  }, [userId, calculateUnreadCount]);

  const markAsRead = useCallback(
    async (alertId) => {
      const previousAlerts = [...alerts];
      const previousUnreadCount = unreadCount;

      try {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertId ? { ...alert, read: true, isRead: true } : alert,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        logger.info(`[useAlerts] Marking alert as read: ${alertId}`);
        await markAlertAsRead(alertId);
      } catch (err) {
        logger.error('[useAlerts] Error marking alert as read:', err);
        setAlerts(previousAlerts);
        setUnreadCount(previousUnreadCount);
        setError(err);
      }
    },
    [userId, alerts, unreadCount],
  );

  const remove = useCallback(
    async (alertId) => {
      const previousAlerts = [...alerts];
      const previousUnreadCount = unreadCount;

      try {
        const updatedAlerts = alerts.filter((alert) => alert.id !== alertId);
        const updatedUnreadCount = updatedAlerts.filter((alert) => !alert.read && !alert.isRead).length;

        setAlerts(updatedAlerts);
        setUnreadCount(updatedUnreadCount);

        logger.info(`[useAlerts] Removing alert: ${alertId}`);
        await deleteAlert(alertId);
      } catch (err) {
        logger.error('[useAlerts] Error removing alert:', err);
        setAlerts(previousAlerts);
        setUnreadCount(previousUnreadCount);
        setError(err);
      }
    },
    [userId, alerts, unreadCount],
  );

  const markAllAsRead = useCallback(async () => {
    const previousAlerts = [...alerts];
    const previousUnreadCount = unreadCount;

    try {
      setAlerts((prev) => prev.map((alert) => ({ ...alert, read: true, isRead: true })));
      setUnreadCount(0);

      logger.info('[useAlerts] Marking all alerts as read');
      const unreadAlerts = previousAlerts.filter((alert) => !alert.read && !alert.isRead);

      await Promise.all(unreadAlerts.map((alert) => markAlertAsRead(alert.id)));
    } catch (err) {
      logger.error('[useAlerts] Error marking all alerts as read:', err);
      setAlerts(previousAlerts);
      setUnreadCount(previousUnreadCount);
      setError(err);
    }
  }, [userId, alerts, unreadCount]);

  const clearAll = useCallback(async () => {
    const previousAlerts = [...alerts];
    const previousUnreadCount = unreadCount;

    try {
      setAlerts([]);
      setUnreadCount(0);

      logger.info('[useAlerts] Deleting all alerts');
      await Promise.all(previousAlerts.map((alert) => deleteAlert(alert.id)));
    } catch (err) {
      logger.error('[useAlerts] Error deleting all alerts:', err);
      setAlerts(previousAlerts);
      setUnreadCount(previousUnreadCount);
      setError(err);
    }
  }, [userId, alerts, unreadCount]);

  const refresh = useCallback(() => {
    logger.info('[useAlerts] Refreshing alerts');
    return loadAlerts();
  }, [loadAlerts]);

  useEffect(() => {
    if (autoLoad && userId) {
      loadAlerts();
    }

    return () => {
      logger.info('[useAlerts] Cleaning up alerts hook');
    };
  }, [userId, autoLoad, loadAlerts]);

  useEffect(() => {
    if (onNewAlert && alerts.length > 0) {
      const unreadAlerts = alerts.filter((alert) => !alert.read && !alert.isRead);
      unreadAlerts.forEach((alert) => {
        onNewAlert(alert);
      });
    }
  }, [alerts, onNewAlert]);

  return {
    alerts,
    unreadCount,
    loading,
    error,
    refresh,
    markAsRead,
    remove,
    markAllAsRead,
    clearAll,
  };
};

export default useAlerts;
