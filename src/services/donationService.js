/**
 * Donation Service
 * 
 * Purpose: Business logic layer for donation operations
 * Acts as a facade over the repository pattern, adding business rules and notifications
 */

import { Timestamp, collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { sendPushNotification } from './notificationService';
import { createAlert } from './alertsService';
import logger from '../utils/logger';
import { FirebaseDonationRepository } from '../domain/repository/DonationRepository';
import { db } from '../config/firebase';

// Create repository instance - encapsulates all Firestore operations
const repo = new FirebaseDonationRepository();

/**
 * Uploads a donation image to Firebase Storage
 * @param {string} uri - Local file URI of the image
 * @param {string} donationId - ID of the donation (used for filename)
 * @returns {Promise<string>} Download URL of uploaded image
 */
export const uploadDonationImage = async (uri, donationId) => {
  try {
    // Repository handles the upload logic (checks if already uploaded, converts to blob, etc.)
    return await repo.uploadImageIfNeeded(uri, donationId);
  } catch (error) {
    logger.error('Error uploading image:', error);
    throw error; // Re-throw to let caller handle the error
  }
};

/**
 * Creates a new donation in Firestore
 * @param {Object} donationData - Donation data (itemName, description, etc.)
 * @param {string} userId - ID of the user creating the donation
 * @returns {Promise<Object>} Created donation object with generated ID
 */
export const createDonation = async (donationData, userId) => {
  try {
    // Repository handles Firestore document creation and timestamp generation
    const donation = await repo.create(donationData, userId);
    return donation;
  } catch (error) {
    logger.error('Error creating donation:', error);
    throw error;
  }
};

/**
 * Retrieves all available donations (status = 'available')
 * @returns {Promise<Array>} Array of available donation objects
 */
export const getDonations = async () => {
  try {
    // Repository queries Firestore for donations with status 'available'
    return await repo.findAvailable();
  } catch (error) {
    logger.error('Error getting donations:', error);
    throw error;
  }
};

/**
 * Retrieves all donations created by a specific user
 * @param {string} userId - ID of the user
 * @returns {Promise<Array>} Array of donation objects
 */
export const getUserDonations = async (userId) => {
  try {
    // Repository queries Firestore filtering by userId
    return await repo.findByUser(userId);
  } catch (error) {
    logger.error('Error getting user donations:', error);
    throw error;
  }
};

/**
 * Retrieves a single donation by its ID
 * @param {string} donationId - ID of the donation
 * @returns {Promise<Object>} Donation object
 */
export const getDonationById = async (donationId) => {
  try {
    // Repository fetches single document by ID from Firestore
    return await repo.findById(donationId);
  } catch (error) {
    logger.error('Error getting donation:', error);
    throw error;
  }
};

/**
 * Updates a donation's status (e.g., from 'available' to 'claimed')
 * Also sends push notification to donation owner if someone else claims it
 * @param {string} donationId - ID of the donation
 * @param {string} status - New status ('available', 'claimed', 'picked_up')
 * @param {string|null} claimedBy - ID of user claiming (null if unclaiming)
 */
export const updateDonationStatus = async (donationId, status, claimedBy = null) => {
  try {
    // Get previous state to check if owner notification is needed
    const previous = await repo.updateStatus(donationId, status, claimedBy);

    // If someone else claimed this donation, notify the owner
    // Business rule: owners should know when their donations are claimed
    if (claimedBy && previous && previous.userId && previous.userId !== claimedBy) {
      await sendPushNotification(
        previous.userId, // Notify the donation owner
        'Donation Claimed!',
        `Your "${previous.itemName}" has been claimed`,
        { donationId, type: 'claim' }, // Include metadata for deep linking
      );
    }
  } catch (error) {
    logger.error('Error updating donation status:', error);
    throw error;
  }
};

export const markDonationAsPickedUp = async (donationId, userId) => {
  try {
    const donation = await repo.findById(donationId);
    // Allow either the claimant or the donor to mark as picked up
    const isClaimant = donation.claimedBy === userId;
    const isDonor = donation.userId === userId;
    if (!isClaimant && !isDonor) {
      throw new Error('Only the donor or the claimant can mark this as picked up');
    }

    await repo.updateStatus(donationId, 'picked_up');

    // Notify the counterparty
    const notifyUserId = isDonor ? donation.claimedBy : donation.userId;
    if (notifyUserId) {
      await sendPushNotification(
        notifyUserId,
        'Item Picked Up',
        `"${donation.itemName}" has been marked as picked up`,
        { donationId, type: 'picked_up' },
      );
      try {
        await createAlert(notifyUserId, {
          type: 'info',
          title: 'Donation Status Updated',
          message: `The donor marked "${donation.itemName}" as picked up. If you have not collected it, please contact the donor via chat.`,
          donationId,
        });
      } catch (e) {
        logger.warn('Failed to create pickup alert:', e);
      }
    }

    logger.info('Donation marked as picked up:', donationId);
  } catch (error) {
    logger.error('Error marking donation as picked up:', error);
    throw error;
  }
};

export const cancelClaim = async (donationId, userId) => {
  try {
    // Delete the claimant's claim document; do not mutate the donation
    const q = query(
      collection(db, 'claims'),
      where('donationId', '==', donationId),
      where('userId', '==', userId),
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      throw new Error('No claim found to cancel');
    }
    await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, 'claims', d.id))));
    logger.info('Claim document(s) deleted for donation:', donationId);
  } catch (error) {
    logger.error('Error cancelling claim:', error);
    throw error;
  }
};

export const deleteDonation = async (donationId) => {
  try {
    await repo.delete(donationId);
  } catch (error) {
    logger.error('Error deleting donation:', error);
    throw error;
  }
};

export const getClaimedDonations = async (userId) => {
  try {
    const all = await repo.findClaimedBy(userId);
    return all.sort((a, b) => (b.claimedAt?.getTime?.() || 0) - (a.claimedAt?.getTime?.() || 0));
  } catch (error) {
    logger.error('Error getting claimed donations:', error);
    throw error;
  }
};

export const subscribeToDonations = (callback, errorCallback) => {
  try {
    return repo.subscribeAvailable(callback, errorCallback);
  } catch (error) {
    logger.error('Error setting up donation subscription:', error);
    if (errorCallback) errorCallback(error);
    return () => {};
  }
};
