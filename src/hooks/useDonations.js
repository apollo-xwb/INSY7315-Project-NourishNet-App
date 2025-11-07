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

const useDonations = ({ realtime = false, autoLoad = true, onError = null } = {}) => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);

  const loadDonations = useCallback(async () => {
    logger.info('[useDonations] Loading donations...');

    setLoading(true);
    setError(null);

    try {
      const data = await getDonations();

      if (!Array.isArray(data)) {
        throw new Error('Invalid donations data');
      }

      setDonations(data);
      logger.info(`[useDonations] Loaded ${data.length} donations`);
      return data;
    } catch (err) {
      logger.error('[useDonations] Error loading donations:', err);
      setError(err);
      if (onError) onError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [onError]);

  const refresh = useCallback(async () => {
    logger.info('[useDonations] Refresh triggered');
    return loadDonations();
  }, [loadDonations]);

  const retry = useCallback(() => {
    logger.info('[useDonations] Retrying donation load...');
    setError(null);
    return loadDonations();
  }, [loadDonations]);

  useEffect(() => {
    let unsubscribe = null;

    if (autoLoad) {
      if (realtime) {
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
        loadDonations();
      }
    }

    return () => {
      if (unsubscribe) {
        logger.info('[useDonations] Cleaning up real-time subscription');
        unsubscribe();
      }
    };
  }, [autoLoad, realtime, loadDonations, onError]);

  return {
    donations,
    loading,
    error,
    refresh,
    retry,
  };
};

export default useDonations;
