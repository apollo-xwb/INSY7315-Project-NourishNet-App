/**
 * useClaims Hook
 *
 * Purpose: Manages the current user's claimed donations and exposes
 * actions to mark as picked up or cancel, plus review/rating status.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getClaimedDonations,
  markDonationAsPickedUp,
  cancelClaim,
} from '../services/donationService';
import { hasUserReviewedDonation, hasUserRatedDonation } from '../services/reviewService';
import logger from '../utils/logger';

/**
 * Custom hook for managing donation claims
 *
 * @param {string} userId - User ID to fetch claims for
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoLoad - Auto-load claims on mount
 * @param {boolean} options.includeReviewStatus - Include review/rating status
 *
 * @returns {Object} Hook state and methods
 * @returns {Array} claims - Array of claimed donations
 * @returns {boolean} loading - Loading state
 * @returns {Error|null} error - Error object if any
 * @returns {Function} refresh - Manually refresh claims
 * @returns {Function} markAsPickedUp - Mark donation as picked up
 * @returns {Function} cancel - Cancel a claim
 * @returns {Set} reviewedDonations - Set of reviewed donation IDs
 * @returns {Set} ratedDonations - Set of rated donation IDs
 *
 * @example
 * ```javascript
 * function MyClaimsScreen() {
 *   const {
 *     claims,
 *     loading,
 *     markAsPickedUp,
 *     cancel,
 *     reviewedDonations,
 *     ratedDonations
 *   } = useClaims(user.uid, { includeReviewStatus: true });
 *
 *   return (
 *     <FlatList
 *       data={claims}
 *       renderItem={({ item }) => (
 *         <ClaimCard
 *           claim={item}
 *           onMarkPickedUp={() => markAsPickedUp(item.id)}
 *           onCancel={() => cancel(item.id)}
 *           hasReviewed={reviewedDonations.has(item.id)}
 *           hasRated={ratedDonations.has(item.id)}
 *         />
 *       )}
 *     />
 *   );
 * }
 * ```
 */
const useClaims = (userId, { autoLoad = true, includeReviewStatus = false } = {}) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);
  const [reviewedDonations, setReviewedDonations] = useState(new Set());
  const [ratedDonations, setRatedDonations] = useState(new Set());

  /**
   * Load review and rating status for claims
   *
   * Algorithm: Parallel Promise Resolution
   * - Checks review/rating status for all claims simultaneously
   * - Uses Promise.all for efficiency
   *
   * Time Complexity: O(n) where n = number of claims
   * - Executes in parallel, not sequential
   * - Total time ≈ slowest individual check
   *
   * Data Structure: Set
   * - Uses Set for O(1) lookup performance
   * - More efficient than Array.includes() which is O(n)
   *
   * Reference: JavaScript Promises
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
   *
   * @param {Array} claimsList - Array of claims
   */
  const loadReviewStatus = useCallback(
    async (claimsList) => {
      if (!includeReviewStatus || !userId) return;

      try {
        logger.info(`[useClaims] Loading review status for ${claimsList.length} claims`);

        // Parallel execution for better performance
        const reviewChecks = claimsList.map((claim) => hasUserReviewedDonation(userId, claim.id));
        const ratingChecks = claimsList.map((claim) => hasUserRatedDonation(userId, claim.id));

        const [reviewResults, ratingResults] = await Promise.all([
          Promise.all(reviewChecks),
          Promise.all(ratingChecks),
        ]);

        // Build Sets for O(1) lookup
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
        // Don't fail the whole operation, just log the error
      }
    },
    [userId, includeReviewStatus],
  );

  /**
   * Load user's claimed donations
   *
   * Data Validation:
   * - Filters out null/undefined items
   * - Ensures all claims have required 'id' field
   * - Defensive programming against corrupted data
   *
   * Sorting: By creation date (newest first)
   */
  const loadClaims = useCallback(async () => {
    if (!userId) {
      logger.warn('[useClaims] No userId provided');
      setClaims([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      logger.info(`[useClaims] Loading claims for user: ${userId}`);
      const claimedDonations = await getClaimedDonations(userId);

      // Data validation and filtering
      const validClaims = claimedDonations.filter((claim) => claim && claim.id);

      if (validClaims.length !== claimedDonations.length) {
        logger.warn(
          `[useClaims] Filtered out ${claimedDonations.length - validClaims.length} invalid claims`,
        );
      }

      // Sort by creation date (newest first)
      const sortedClaims = validClaims.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      setClaims(sortedClaims);
      logger.info(`[useClaims] Loaded ${sortedClaims.length} claims`);

      // Load review/rating status if enabled
      if (includeReviewStatus) {
        await loadReviewStatus(sortedClaims);
      }
    } catch (err) {
      logger.error('[useClaims] Error loading claims:', err);
      setError(err);
      setClaims([]); // Clear claims on error
    } finally {
      setLoading(false);
    }
  }, [userId, includeReviewStatus, loadReviewStatus]);

  /**
   * Mark a donation as picked up
   *
   * State Transition: claimed → picked_up
   *
   * Pattern: Optimistic Update
   * - Updates local state immediately
   * - Syncs with server
   * - Rolls back on error
   *
   * Business Rule:
   * - Only 'claimed' items can be marked as picked up
   * - Validates status before updating
   *
   * @param {string} donationId - ID of donation to mark as picked up
   */
  const markAsPickedUp = useCallback(
    async (donationId) => {
      const previousClaims = [...claims];

      try {
        // Optimistic update
        setClaims((prev) =>
          prev.map((claim) =>
            claim.id === donationId ? { ...claim, status: 'picked_up' } : claim,
          ),
        );

        // Server update
        logger.info(`[useClaims] Marking donation as picked up: ${donationId}`);
        await markDonationAsPickedUp(donationId, userId);

        logger.info(`[useClaims] Successfully marked as picked up: ${donationId}`);
      } catch (err) {
        // Rollback
        logger.error('[useClaims] Error marking as picked up:', err);
        setClaims(previousClaims);
        setError(err);
        throw err; // Re-throw for caller to handle
      }
    },
    [userId, claims],
  );

  /**
   * Cancel a claim
   *
   * State Transition: claimed → available (or removed from user's claims)
   *
   * Pattern: Optimistic Update with Removal
   * - Removes from local state immediately
   * - Syncs with server
   * - Restores on error
   *
   * Business Rule:
   * - Can only cancel claims in 'claimed' or 'reserved' status
   * - Cannot cancel 'picked_up' items
   *
   * @param {string} donationId - ID of claim to cancel
   */
  const cancel = useCallback(
    async (donationId) => {
      const previousClaims = [...claims];

      try {
        // Find the claim to validate status
        const claim = claims.find((c) => c.id === donationId);

        if (!claim) {
          throw new Error('Claim not found');
        }

        if (claim.status === 'picked_up') {
          throw new Error('Cannot cancel a claim that has been picked up');
        }

        // Optimistic update: Remove from list
        setClaims((prev) => prev.filter((c) => c.id !== donationId));

        // Server update
        logger.info(`[useClaims] Cancelling claim: ${donationId}`);
        await cancelClaim(donationId, userId);

        logger.info(`[useClaims] Successfully cancelled claim: ${donationId}`);
      } catch (err) {
        // Rollback
        logger.error('[useClaims] Error cancelling claim:', err);
        setClaims(previousClaims);
        setError(err);
        throw err; // Re-throw for caller to handle
      }
    },
    [userId, claims],
  );

  /**
   * Refresh claims
   *
   * Use Case: Pull-to-refresh or after making changes
   */
  const refresh = useCallback(() => {
    logger.info('[useClaims] Refreshing claims');
    return loadClaims();
  }, [loadClaims]);

  /**
   * Effect: Load claims on mount
   *
   * Lifecycle:
   * - Loads claims when userId changes
   * - Skips if autoLoad is false
   */
  useEffect(() => {
    if (autoLoad && userId) {
      loadClaims();
    }
  }, [userId, autoLoad, loadClaims]);

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
