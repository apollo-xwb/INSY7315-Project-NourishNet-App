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

/**
 * Custom hook for managing alerts
 *
 * @param {string} userId - User ID to fetch alerts for
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoLoad - Auto-load alerts on mount
 * @param {boolean} options.autoCleanup - Auto-delete expired alerts
 * @param {Function} options.onNewAlert - Callback for new alerts
 *
 * @returns {Object} Hook state and methods
 * @returns {Array} alerts - Array of alert objects
 * @returns {number} unreadCount - Number of unread alerts
 * @returns {boolean} loading - Loading state
 * @returns {Error|null} error - Error object if any
 * @returns {Function} refresh - Manually refresh alerts
 * @returns {Function} markAsRead - Mark alert as read
 * @returns {Function} remove - Delete an alert
 * @returns {Function} markAllAsRead - Mark all alerts as read
 * @returns {Function} clearAll - Delete all alerts
 *
 * @example
 * ```javascript
 * function AlertsScreen() {
 *   const {
 *     alerts,
 *     unreadCount,
 *     loading,
 *     markAsRead,
 *     remove
 *   } = useAlerts(user.uid);
 *
 *   return (
 *     <>
 *       <Badge>{unreadCount}</Badge>
 *       {alerts.map(alert => (
 *         <AlertItem
 *           key={alert.id}
 *           alert={alert}
 *           onRead={() => markAsRead(alert.id)}
 *           onDelete={() => remove(alert.id)}
 *         />
 *       ))}
 *     </>
 *   );
 * }
 * ```
 */
const useAlerts = (userId, { autoLoad = true, autoCleanup = true, onNewAlert = null } = {}) => {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);

  /**
   * Calculate unread count from alerts array
   *
   * Algorithm: Filter and count
   * Time Complexity: O(n)
   *
   * @param {Array} alertsList - Array of alerts
   * @returns {number} Count of unread alerts
   */
  const calculateUnreadCount = useCallback((alertsList) => {
    return alertsList.filter((alert) => !alert.read && !alert.isRead).length;
  }, []);

  /**
   * Load alerts from Firestore
   *
   * Error Handling:
   * - Logs errors for debugging
   * - Sets error state for UI feedback
   * - Preserves existing data on error
   *
   * Data Cleanup:
   * - Optionally deletes expired alerts before loading
   * - Ensures fresh data
   */
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
      // Optional: Clean up expired alerts first
      if (autoCleanup) {
        await deleteExpiredAlerts(userId);
      }

      logger.info(`[useAlerts] Loading alerts for user: ${userId}`);
      const userAlerts = await getUserAlerts(userId);

      if (!Array.isArray(userAlerts)) {
        throw new Error('Invalid alerts data received');
      }

      // Sort by creation date (newest first)
      // Sorting Algorithm: TimSort (JavaScript default)
      // Time Complexity: O(n log n)
      const sortedAlerts = userAlerts.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB - dateA; // Descending order
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

  // Realtime subscription to user's alerts
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

  /**
   * Mark a specific alert as read
   *
   * Pattern: Optimistic UI Update
   * 1. Update local state immediately (fast feedback)
   * 2. Update server asynchronously (eventual consistency)
   * 3. Rollback on server error (error recovery)
   *
   * Benefits:
   * - Immediate visual feedback
   * - Better perceived performance
   * - Handles offline scenarios gracefully
   *
   * Reference: "Building Mobile Apps at Scale" by Gergely Orosz
   *
   * @param {string} alertId - ID of alert to mark as read
   */
  const markAsRead = useCallback(
    async (alertId) => {
      // Store previous state for rollback
      const previousAlerts = [...alerts];
      const previousUnreadCount = unreadCount;

      try {
        // Optimistic update: Update UI immediately
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertId ? { ...alert, read: true, isRead: true } : alert,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        // Server update: Sync with database
        logger.info(`[useAlerts] Marking alert as read: ${alertId}`);
        await markAlertAsRead(alertId);
      } catch (err) {
        // Rollback on error
        logger.error('[useAlerts] Error marking alert as read:', err);
        setAlerts(previousAlerts);
        setUnreadCount(previousUnreadCount);
        setError(err);
      }
    },
    [userId, alerts, unreadCount],
  );

  /**
   * Delete a specific alert
   *
   * Pattern: Optimistic UI Update with Rollback
   * Similar to markAsRead, provides immediate feedback
   *
   * @param {string} alertId - ID of alert to delete
   */
  const remove = useCallback(
    async (alertId) => {
      const previousAlerts = [...alerts];
      const previousUnreadCount = unreadCount;

      try {
        // Optimistic update
        const updatedAlerts = alerts.filter((alert) => alert.id !== alertId);
        setAlerts(updatedAlerts);
        setUnreadCount(calculateUnreadCount(updatedAlerts));

        // Server update
        logger.info(`[useAlerts] Deleting alert: ${alertId}`);
        await deleteAlert(alertId);
      } catch (err) {
        // Rollback
        logger.error('[useAlerts] Error deleting alert:', err);
        setAlerts(previousAlerts);
        setUnreadCount(previousUnreadCount);
        setError(err);
      }
    },
    [userId, alerts, unreadCount, calculateUnreadCount],
  );

  /**
   * Mark all alerts as read
   *
   * Batch Operation:
   * - Updates all unread alerts at once
   * - More efficient than individual updates
   *
   * Time Complexity: O(n) where n = number of unread alerts
   */
  const markAllAsRead = useCallback(async () => {
    const previousAlerts = [...alerts];
    const previousUnreadCount = unreadCount;

    try {
      // Optimistic update
      setAlerts((prev) => prev.map((alert) => ({ ...alert, read: true, isRead: true })));
      setUnreadCount(0);

      // Server update (batch)
      logger.info('[useAlerts] Marking all alerts as read');
      const unreadAlerts = previousAlerts.filter((alert) => !alert.read && !alert.isRead);

      await Promise.all(unreadAlerts.map((alert) => markAlertAsRead(alert.id)));
    } catch (err) {
      // Rollback
      logger.error('[useAlerts] Error marking all alerts as read:', err);
      setAlerts(previousAlerts);
      setUnreadCount(previousUnreadCount);
      setError(err);
    }
  }, [userId, alerts, unreadCount]);

  /**
   * Delete all alerts
   *
   * Batch Operation:
   * - Deletes all alerts at once
   * - Useful for "Clear All" functionality
   */
  const clearAll = useCallback(async () => {
    const previousAlerts = [...alerts];
    const previousUnreadCount = unreadCount;

    try {
      // Optimistic update
      setAlerts([]);
      setUnreadCount(0);

      // Server update (batch)
      logger.info('[useAlerts] Deleting all alerts');
      await Promise.all(previousAlerts.map((alert) => deleteAlert(alert.id)));
    } catch (err) {
      // Rollback
      logger.error('[useAlerts] Error deleting all alerts:', err);
      setAlerts(previousAlerts);
      setUnreadCount(previousUnreadCount);
      setError(err);
    }
  }, [userId, alerts, unreadCount]);

  /**
   * Refresh alerts
   *
   * Use Case: Pull-to-refresh
   */
  const refresh = useCallback(() => {
    logger.info('[useAlerts] Refreshing alerts');
    return loadAlerts();
  }, [loadAlerts]);

  /**
   * Effect: Load alerts on mount
   *
   * Lifecycle:
   * - Loads alerts when userId changes
   * - Skips if autoLoad is false
   * - Cleans up on unmount (no-op currently, but placeholder for future subscriptions)
   */
  useEffect(() => {
    if (autoLoad && userId) {
      loadAlerts();
    }

    // Cleanup function
    return () => {
      // Placeholder for future cleanup (e.g., unsubscribe from real-time updates)
      logger.info('[useAlerts] Cleaning up alerts hook');
    };
  }, [userId, autoLoad, loadAlerts]);

  /**
   * Effect: Detect new alerts
   *
   * Purpose: Trigger callback when new alerts appear
   * Use Case: Show notification toast for new alerts
   */
  useEffect(() => {
    if (onNewAlert && alerts.length > 0) {
      // Find unread alerts
      const unreadAlerts = alerts.filter((alert) => !alert.read && !alert.isRead);

      // Trigger callback for each unread alert
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
