import { db } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  updateDoc,
  increment,
} from 'firebase/firestore';
import logger from '../utils/logger';

export const submitRating = async (ratingData) => {
  try {
    const { donationId, ratedUserId, raterUserId, rating, review, type } = ratingData;

    const ratingDoc = {
      donationId,
      ratedUserId,
      raterUserId,
      rating,
      review: review || '',
      type,
      createdAt: Timestamp.now(),
    };

    const ratingRef = doc(collection(db, 'ratings'));
    await setDoc(ratingRef, ratingDoc);

    const userRef = doc(db, 'users', ratedUserId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const currentRating = userData.averageRating || 0;
      const totalRatings = userData.totalRatings || 0;

      const newTotalRatings = totalRatings + 1;
      const newAverageRating = (currentRating * totalRatings + rating) / newTotalRatings;

      await updateDoc(userRef, {
        averageRating: newAverageRating,
        totalRatings: newTotalRatings,
        updatedAt: Timestamp.now(),
      });
    }

    logger.info('Rating submitted successfully');
    return { success: true, ratingId: ratingRef.id };
  } catch (error) {
    logger.error('Error submitting rating:', error);
    return { success: false, error: error.message };
  }
};

export const getUserRatings = async (userId) => {
  try {
    const q = query(
      collection(db, 'ratings'),
      where('ratedUserId', '==', userId),
      orderBy('createdAt', 'desc'),
    );

    const querySnapshot = await getDocs(q);
    const ratings = [];

    querySnapshot.forEach((doc) => {
      ratings.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      });
    });

    return ratings;
  } catch (error) {
    logger.error('Error getting user ratings:', error);
    return [];
  }
};

export const getUserRatingStats = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        averageRating: data.averageRating || 0,
        totalRatings: data.totalRatings || 0,
      };
    }

    return { averageRating: 0, totalRatings: 0 };
  } catch (error) {
    logger.error('Error getting user rating stats:', error);
    return { averageRating: 0, totalRatings: 0 };
  }
};

export const checkIfUserCanRate = async (donationId, raterUserId) => {
  try {
    const q = query(
      collection(db, 'ratings'),
      where('donationId', '==', donationId),
      where('raterUserId', '==', raterUserId),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  } catch (error) {
    logger.error('Error checking if user can rate:', error);
    return false;
  }
};

export const hasUserRatedDonation = async (userId, donationId) => {
  try {
    const q = query(
      collection(db, 'ratings'),
      where('raterUserId', '==', userId),
      where('donationId', '==', donationId),
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    logger.error('Error checking if user has rated donation:', error);
    return false;
  }
};
