import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import logger from '../utils/logger';
import { db } from '../config/firebase';

export const createDonation = async (donationData, userId) => {
  try {
    const donationRef = collection(db, 'donations');
    const donation = {
      ...donationData,
      donorId: userId,
      status: 'available',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      claimedBy: null,
      claimedAt: null,
    };

    const docRef = await addDoc(donationRef, donation);
    return { success: true, id: docRef.id };
  } catch (error) {
    logger.error('Error creating donation:', error);
    return { success: false, error: error.message };
  }
};

export const getDonations = async (filters = {}) => {
  try {
    let q = collection(db, 'donations');

    const constraints = [];

    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }

    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    if (filters.limit) {
      constraints.push(limit(filters.limit));
    }

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const querySnapshot = await getDocs(q);
    const donations = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      donations.push({
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
        expiryDate: data.expiryDate?.toDate ? data.expiryDate.toDate() : data.expiryDate || null,
      });
    });

    return { success: true, data: donations };
  } catch (error) {
    logger.error('Error getting donations:', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const getDonationById = async (donationId) => {
  try {
    const donationDoc = await getDoc(doc(db, 'donations', donationId));

    if (donationDoc.exists()) {
      return {
        success: true,
        data: {
          id: donationDoc.id,
          ...donationDoc.data(),
          createdAt: donationDoc.data().createdAt?.toDate(),
          updatedAt: donationDoc.data().updatedAt?.toDate(),
          expiryDate: donationDoc.data().expiryDate?.toDate
            ? donationDoc.data().expiryDate.toDate()
            : donationDoc.data().expiryDate || null,
        },
      };
    } else {
      return { success: false, error: 'Donation not found' };
    }
  } catch (error) {
    logger.error('Error getting donation:', error);
    return { success: false, error: error.message };
  }
};

export const updateDonation = async (donationId, updates) => {
  try {
    const donationRef = doc(db, 'donations', donationId);
    await updateDoc(donationRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    logger.error('Error updating donation:', error);
    return { success: false, error: error.message };
  }
};

export const deleteDonation = async (donationId) => {
  try {
    await deleteDoc(doc(db, 'donations', donationId));
    return { success: true };
  } catch (error) {
    logger.error('Error deleting donation:', error);
    return { success: false, error: error.message };
  }
};

export const claimDonation = async (donationId, userId, claimData) => {
  try {
    // Do not mutate donation status; allow multiple reservations.
    const claimRef = collection(db, 'claims');
    await addDoc(claimRef, {
      donationId,
      userId,
      ...claimData,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    logger.error('Error claiming donation:', error);
    return { success: false, error: error.message };
  }
};

export const markClaimPickedUp = async (donationId, userId) => {
  try {
    const q = query(
      collection(db, 'claims'),
      where('donationId', '==', donationId),
      where('userId', '==', userId),
    );
    const snap = await getDocs(q);
    if (snap.empty) return { success: false, error: 'Claim not found' };
    await Promise.all(
      snap.docs.map((d) => updateDoc(doc(db, 'claims', d.id), { status: 'picked_up', updatedAt: serverTimestamp() })),
    );
    return { success: true };
  } catch (error) {
    logger.error('Error marking claim picked up:', error);
    return { success: false, error: error.message };
  }
};

export const getUserDonations = async (userId) => {
  try {
    const q = query(
      collection(db, 'donations'),
      where('donorId', '==', userId),
      orderBy('createdAt', 'desc'),
    );

    const querySnapshot = await getDocs(q);
    const donations = [];

    querySnapshot.forEach((doc) => {
      donations.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        expiryDate: doc.data().expiryDate ? new Date(doc.data().expiryDate) : null,
      });
    });

    return { success: true, data: donations };
  } catch (error) {
    logger.error('Error getting user donations:', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const getUserClaims = async (userId) => {
  try {
    const q = query(
      collection(db, 'claims'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    );

    const querySnapshot = await getDocs(q);
    const claims = [];

    querySnapshot.forEach((doc) => {
      claims.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      });
    });

    return { success: true, data: claims };
  } catch (error) {
    logger.error('Error getting user claims:', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const subscribeToDonations = (callback, filters = {}) => {
  let q = collection(db, 'donations');

  const constraints = [];

  if (filters.status) {
    constraints.push(where('status', '==', filters.status));
  }

  constraints.push(orderBy('createdAt', 'desc'));

  if (filters.limit) {
    constraints.push(limit(filters.limit));
  }

  if (constraints.length > 0) {
    q = query(q, ...constraints);
  }

  return onSnapshot(
    q,
    (querySnapshot) => {
      const donations = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        donations.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
          expiryDate: data.expiryDate?.toDate ? data.expiryDate.toDate() : data.expiryDate || null,
        });
      });
      callback(donations);
    },
    (error) => {
      logger.error('Error in donations listener:', error);
    },
  );
};
