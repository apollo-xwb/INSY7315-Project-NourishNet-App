/**
 * useDonations Hook
 *
 * Purpose: Exposes donation data and simple controls to load/refresh it.
 * - donations: current list of donations
 * - loading: true while data is being fetched
 * - error: last error (if any)
 * - refresh/retry: trigger a reload
 */

import { useState, useEffect, useCallback } from 'react';
import { getDonations, subscribeToDonations } from '../services/donationService';
import logger from '../utils/logger';

/**
 * Custom hook for managing donations
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.realtime - Whether to subscribe to real-time updates
 * @param {boolean} options.autoLoad - Whether to automatically load on mount
 * @param {Function} options.onError - Optional error callback
 *
 * @returns {Object} Hook state and methods
 * @returns {Array} donations - Array of donation objects
 * @returns {boolean} loading - Loading state indicator
 * @returns {Error|null} error - Error object if fetch failed
 * @returns {Function} refresh - Function to manually refresh donations
 * @returns {Function} retry - Function to retry after error
 *
 * @example
 * ```javascript
 * function HomeScreen() {
 *   const { donations, loading, error, refresh } = useDonations({
 *     realtime: true
 *   });
 *
 *   if (loading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} onRetry={refresh} />;
 *
 *   return <DonationList donations={donations} />;
 * }
 * ```
 */
const useDonations = ({ realtime = false, autoLoad = true, onError = null } = {}) => {
  // State management
  // Using separate state variables for clarity and granular updates
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);

  /**
   * Load donations from Firestore
   *
   * Error Handling Strategy:
   * - Catches and logs errors
   * - Sets error state for UI feedback
   * - Calls optional error callback
   * - Maintains previous data on error (doesn't clear)
   *
   * Performance Consideration:
   * - Wrapped in useCallback to prevent unnecessary re-renders
   * - Dependency array ensures stable reference
   */
  const loadDonations = useCallback(async () => {
    setLoading(true);
    setError(null);

    const start = Date.now();
    try {
      logger.info('[useDonations] Loading donations...');
      // Placeholder for future fan-out: Promise.all([getDonations(), getSomethingElse()])
      const [data] = await Promise.all([getDonations()]);

      // Data validation
      // Defensive programming: ensure we always have an array
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from server');
      }

      setDonations(data);
      const duration = Date.now() - start;
      logger.info(`[useDonations] Loaded ${data.length} donations in ${duration}ms`);
    } catch (err) {
      // Error handling
      logger.error('[useDonations] Error loading donations:', err);
      setError(err);

      // Optional error callback for custom handling
      if (onError) {
        onError(err);
      }
    } finally {
      // Always set loading to false, regardless of success/failure
      setLoading(false);
    }
  }, [onError]);

  /**
   * Refresh donations
   *
   * Use Case: Pull-to-refresh functionality
   * Simply calls loadDonations again
   */
  const refresh = useCallback(() => {
    logger.info('[useDonations] Refreshing donations...');
    return loadDonations();
  }, [loadDonations]);

  /**
   * Retry after error
   *
   * Use Case: Error recovery UI
   * Clears error state and retries
   */
  const retry = useCallback(() => {
    logger.info('[useDonations] Retrying donation load...');
    setError(null);
    return loadDonations();
  }, [loadDonations]);

  /**
   * Effect: Load donations on mount (if autoLoad is true)
   *
   * Lifecycle Management:
   * - Runs once on component mount
   * - Conditionally loads based on autoLoad option
   * - Conditionally subscribes to real-time updates
   *
   * Cleanup Pattern:
   * - Returns cleanup function to unsubscribe
   * - Prevents memory leaks
   * - Follows React best practices
   *
   * Reference: React Documentation - "Synchronizing with Effects"
   * https://react.dev/learn/synchronizing-with-effects
   */
  useEffect(() => {
    let unsubscribe = null;

    if (autoLoad) {
      if (realtime) {
        // Real-time subscription mode
        // More efficient for frequently changing data
        logger.info('[useDonations] Setting up real-time subscription');

        setLoading(true);
        const start = Date.now();
        unsubscribe = subscribeToDonations(
          (data) => {
            const duration = Date.now() - start;
            logger.info(
              `[useDonations] Real-time update: ${data.length} donations in ${duration}ms`,
            );
            setDonations(data);
            setLoading(false);
            setError(null);
          },
          (err) => {
            logger.error('[useDonations] Real-time subscription error:', err);
            setError(err);
            setLoading(false);
            if (onError) onError(err);
          },
        );
      } else {
        // One-time fetch mode
        // More efficient for static data
        loadDonations();
      }
    }

    // Cleanup function
    // Called when component unmounts or dependencies change
    return () => {
      if (unsubscribe) {
        logger.info('[useDonations] Cleaning up real-time subscription');
        unsubscribe();
      }
    };
  }, [autoLoad, realtime, loadDonations, onError]);

  /**
   * Return hook interface
   *
   * Design Decision: Object return vs Array return
   * - Object allows named destructuring: { donations, loading }
   * - More flexible than array: can add new properties without breaking existing code
   * - Follows common hook patterns (e.g., useAuth, useTheme)
   *
   * Reference: JavaScript Destructuring
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
   */
  return {
    donations,
    loading,
    error,
    refresh,
    retry,
  };
};

export default useDonations;
