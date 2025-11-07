import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { sendPushNotification } from './notificationService';
import { createAlert } from './alertsService';
import logger from '../utils/logger';
import { FirebaseDonationRepository } from '../domain/repository/DonationRepository';
import { db } from '../config/firebase';

const repo = new FirebaseDonationRepository();

export const uploadDonationImage = async (uri, donationId) => {
  try {
    return await repo.uploadImageIfNeeded(uri, donationId);
  } catch (error) {
    logger.error('Error uploading image:', error);
    throw error;
  }
};

export const createDonation = async (donationData, userId) => {
  try {
    return await repo.create(donationData, userId);
  } catch (error) {
    logger.error('Error creating donation:', error);
    throw error;
  }
};

export const getDonations = async () => {
  try {
    return await repo.findAvailable();
  } catch (error) {
    logger.error('Error getting donations:', error);
    throw error;
  }
};

export const getUserDonations = async (userId) => {
  try {
    return await repo.findByUser(userId);
  } catch (error) {
    logger.error('Error getting user donations:', error);
    throw error;
  }
};

export const getDonationById = async (donationId) => {
  try {
    return await repo.findById(donationId);
  } catch (error) {
    logger.error('Error getting donation:', error);
    throw error;
  }
};

export const updateDonationStatus = async (donationId, status, claimedBy = null) => {
  try {
    const previous = await repo.updateStatus(donationId, status, claimedBy);

    if (claimedBy && previous && previous.userId && previous.userId !== claimedBy) {
      await sendPushNotification(
        previous.userId,
        'Donation Claimed!',
        `Your "${previous.itemName}" has been claimed`,
        { donationId, type: 'claim' },
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
    const isClaimant = donation.claimedBy === userId;
    const isDonor = donation.userId === userId;
    if (!isClaimant && !isDonor) {
      throw new Error('Only the donor or the claimant can mark this as picked up');
    }

    await repo.updateStatus(donationId, 'picked_up');

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
