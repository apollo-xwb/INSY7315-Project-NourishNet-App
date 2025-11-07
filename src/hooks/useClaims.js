import { useState, useEffect, useCallback } from 'react';
import {
  getClaimedDonations,
  markDonationAsPickedUp,
  cancelClaim,
} from '../services/donationService';
import { hasUserReviewedDonation, hasUserRatedDonation } from '../services/reviewService';
import logger from '../utils/logger';

const useClaims = (userId, { autoLoad = true, includeReviewStatus = false } = {}) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);
  const [reviewedDonations, setReviewedDonations] = useState(new Set());
  const [ratedDonations, setRatedDonations] = useState(new Set());

  const loadReviewStatus = useCallback(
    async (claimsList) => {
      if (!includeReviewStatus || !userId) return;

      try {
        logger.info(`[useClaims] Loading review status for ${claimsList.length} claims`);

        const reviewChecks = claimsList.map((claim) => hasUserReviewedDonation(userId, claim.id));
        const ratingChecks = claimsList.map((claim) => hasUserRatedDonation(userId, claim.id));

        const [reviewResults, ratingResults] = await Promise.all([
          Promise.all(reviewChecks),
          Promise.all(ratingChecks),
        ]);

        const reviewed = new Set();
        const rated = new Set();

        reviewResults.forEach((hasReviewed, index) => {
          if (hasReviewed) {
            reviewed.add(claimsList[index].id);
          }
        });

        ratingResults.forEach((hasRated, index) => {
          if (hasRated) {
            rated.add(claimsList[index].id);
          }
        });

        setReviewedDonations(reviewed);
        setRatedDonations(rated);

        logger.info(
          `[useClaims] Review status loaded: ${reviewed.size} reviewed, ${rated.size} rated`,
        );
      } catch (err) {
        logger.error('[useClaims] Error loading review status:', err);
      }
    },
    [userId, includeReviewStatus],
  );

  const loadClaims = useCallback(async () => {
    if (!userId) {
      logger.warn('[useClaims] No userId provided');
      return;
    }

    try {
      logger.info('[useClaims] Loading claimed donations...');
      setLoading(true);
      setError(null);

      const { success, data, error: fetchError } = await getClaimedDonations(userId);

      if (!success) {
        throw new Error(fetchError || 'Failed to load claims');
      }

      const validClaims = data
        .filter((claim) => claim && claim.id)
        .sort((a, b) => {
          const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return bDate - aDate;
        });

      setClaims(validClaims);

      if (includeReviewStatus) {
        await loadReviewStatus(validClaims);
      }

      logger.info(`[useClaims] Loaded ${validClaims.length} claims`);
    } catch (err) {
      logger.error('[useClaims] Error loading claims:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId, includeReviewStatus, loadReviewStatus]);

  const markAsPickedUp = useCallback(
    async (claimId, donationId) => {
      const previousClaims = [...claims];

      try {
        logger.info(`[useClaims] Marking claim as picked up: ${claimId}`);

        setClaims((prev) =>
          prev.map((claim) =>
            claim.id === claimId ? { ...claim, status: 'picked_up', pickedUp: true } : claim,
          ),
        );

        const result = await markDonationAsPickedUp(donationId, userId);
        if (!result?.success) {
          throw new Error(result?.error || 'Failed to mark as picked up');
        }

        setReviewedDonations((prev) => {
          const updated = new Set(prev);
          updated.delete(claimId);
          return updated;
        });
        setRatedDonations((prev) => {
          const updated = new Set(prev);
          updated.delete(claimId);
          return updated;
        });

        logger.info('[useClaims] Claim marked as picked up');
        return { success: true };
      } catch (err) {
        logger.error('[useClaims] Error marking claim as picked up:', err);
        setClaims(previousClaims);
        setError(err);
        return { success: false, error: err.message };
      }
    },
    [claims, userId],
  );

  const cancel = useCallback(
    async (claimId, donationId) => {
      const previousClaims = [...claims];

      try {
        logger.info(`[useClaims] Cancelling claim: ${claimId}`);

        setClaims((prev) => prev.filter((claim) => claim.id !== claimId));

        const result = await cancelClaim(donationId, userId);
        if (!result?.success) {
          throw new Error(result?.error || 'Failed to cancel claim');
        }

        logger.info('[useClaims] Claim cancelled successfully');
        return { success: true };
      } catch (err) {
        logger.error('[useClaims] Error cancelling claim:', err);
        setClaims(previousClaims);
        setError(err);
        return { success: false, error: err.message };
      }
    },
    [claims, userId],
  );

  const refresh = useCallback(() => {
    logger.info('[useClaims] Refresh requested');
    return loadClaims();
  }, [loadClaims]);

  useEffect(() => {
    if (autoLoad) {
      loadClaims();
    }
  }, [autoLoad, loadClaims]);

  return {
    claims,
    loading,
    error,
    refresh,
    markAsPickedUp,
    cancel,
    reviewedDonations,
    ratedDonations,
  };
};

export default useClaims;
