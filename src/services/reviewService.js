import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import logger from '../utils/logger';
import { db } from '../config/firebase';

export const createReview = async (reviewData) => {
  try {
    // Check if user has already reviewed this donation
    const existingReview = await hasUserReviewedDonation(
      reviewData.reviewerId,
      reviewData.donationId,
    );

    if (existingReview) {
      logger.warn('User has already reviewed this donation');
      return {
        success: false,
        error: 'You have already reviewed this donation.',
      };
    }

    const review = {
      donationId: reviewData.donationId,
      donorId: reviewData.donorId,
      reviewerId: reviewData.reviewerId,
      claimId: reviewData.claimId,
      ratings: {
        punctuality: reviewData.ratings.punctuality || 0,
        quality: reviewData.ratings.quality || 0,
        communication: reviewData.ratings.communication || 0,
        overall: reviewData.ratings.overall || 0,
      },
      comment: reviewData.comment || '',
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'reviews'), review);

    logger.info('Review created successfully:', docRef.id);
    return {
      success: true,
      id: docRef.id,
      ...review,
    };
  } catch (error) {
    logger.error('Error creating review:', error);
    return {
      success: false,
      error: error.message || 'Failed to submit review',
    };
  }
};

export const getUserReviews = async (userId) => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('donorId', '==', userId),
      orderBy('createdAt', 'desc'),
    );

    const querySnapshot = await getDocs(q);
    const reviews = [];

    querySnapshot.forEach((doc) => {
      reviews.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      });
    });

    return reviews;
  } catch (error) {
    logger.error('Error getting user reviews:', error);
    return [];
  }
};

export const getUserRatingStats = async (userId) => {
  try {
    const reviews = await getUserReviews(userId);

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        punctuality: 0,
        quality: 0,
        communication: 0,
        overall: 0,
      };
    }

    const totals = reviews.reduce(
      (acc, review) => {
        acc.punctuality += review.ratings.punctuality || 0;
        acc.quality += review.ratings.quality || 0;
        acc.communication += review.ratings.communication || 0;
        acc.overall += review.ratings.overall || 0;
        return acc;
      },
      { punctuality: 0, quality: 0, communication: 0, overall: 0 },
    );

    const count = reviews.length;

    return {
      averageRating: (totals.overall / count).toFixed(1),
      totalReviews: count,
      punctuality: (totals.punctuality / count).toFixed(1),
      quality: (totals.quality / count).toFixed(1),
      communication: (totals.communication / count).toFixed(1),
      overall: (totals.overall / count).toFixed(1),
    };
  } catch (error) {
    logger.error('Error calculating user rating stats:', error);
    return {
      averageRating: 0,
      totalReviews: 0,
      punctuality: 0,
      quality: 0,
      communication: 0,
      overall: 0,
    };
  }
};

export const hasUserReviewedDonation = async (userId, donationId) => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('reviewerId', '==', userId),
      where('donationId', '==', donationId),
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    logger.error('Error checking if user reviewed donation:', error);
    return false;
  }
};

export const getDonationReviews = async (donationId) => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('donationId', '==', donationId),
      orderBy('createdAt', 'desc'),
    );

    const querySnapshot = await getDocs(q);
    const reviews = [];

    querySnapshot.forEach((doc) => {
      reviews.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      });
    });

    return reviews;
  } catch (error) {
    logger.error('Error getting donation reviews:', error);
    return [];
  }
};
