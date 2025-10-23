import {
import logger from '../utils/logger';

  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';


export const uploadDonationImage = async (uri, donationId) => {
  try {

    const response = await fetch(uri);
    const blob = await response.blob();


    const filename = `${donationId}_${Date.now()}.jpg`;
    const storageRef = ref(storage, `donations/${filename}`);


    await uploadBytes(storageRef, blob);


    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    logger.error('Error uploading image:', error);
    throw error;
  }
};


export const createDonation = async (donationData, userId) => {
  try {

    const donation = {
      ...donationData,
      userId,
      status: 'available',
      claimedBy: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };


    if (donationData.image && donationData.image.startsWith('file://')) {

      const tempId = `temp_${Date.now()}`;
      const imageUrl = await uploadDonationImage(donationData.image, tempId);
      donation.image = imageUrl;
      donation.imageUrl = imageUrl;
    }


    const docRef = await addDoc(collection(db, 'donations'), donation);

    return {
      id: docRef.id,
      ...donation,
    };
  } catch (error) {
    logger.error('Error creating donation:', error);
    throw error;
  }
};


export const getDonations = async () => {
  try {
    const q = query(
      collection(db, 'donations'),
      where('status', '==', 'available'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const donations = [];

    querySnapshot.forEach((doc) => {
      donations.push({
        id: doc.id,
        ...doc.data(),

        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        expiryDate: doc.data().expiryDate?.toDate ? doc.data().expiryDate.toDate() : new Date(doc.data().expiryDate),
      });
    });

    return donations;
  } catch (error) {
    logger.error('Error getting donations:', error);
    throw error;
  }
};


export const getUserDonations = async (userId) => {
  try {
    const q = query(
      collection(db, 'donations'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const donations = [];

    querySnapshot.forEach((doc) => {
      donations.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        expiryDate: doc.data().expiryDate?.toDate ? doc.data().expiryDate.toDate() : new Date(doc.data().expiryDate),
      });
    });

    return donations;
  } catch (error) {
    logger.error('Error getting user donations:', error);
    throw error;
  }
};


export const getDonationById = async (donationId) => {
  try {
    const docRef = doc(db, 'donations', donationId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
        expiryDate: docSnap.data().expiryDate?.toDate ? docSnap.data().expiryDate.toDate() : new Date(docSnap.data().expiryDate),
      };
    } else {
      throw new Error('Donation not found');
    }
  } catch (error) {
    logger.error('Error getting donation:', error);
    throw error;
  }
};


export const updateDonationStatus = async (donationId, status, claimedBy = null) => {
  try {
    const docRef = doc(db, 'donations', donationId);
    const updateData = {
      status,
      updatedAt: Timestamp.now(),
    };

    if (claimedBy) {
      updateData.claimedBy = claimedBy;
      updateData.claimedAt = Timestamp.now();
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    logger.error('Error updating donation status:', error);
    throw error;
  }
};


export const deleteDonation = async (donationId) => {
  try {
    const docRef = doc(db, 'donations', donationId);
    await deleteDoc(docRef);
  } catch (error) {
    logger.error('Error deleting donation:', error);
    throw error;
  }
};


export const getClaimedDonations = async (userId) => {
  try {
    const q = query(
      collection(db, 'donations'),
      where('claimedBy', '==', userId),
      orderBy('claimedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const donations = [];

    querySnapshot.forEach((doc) => {
      donations.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        claimedAt: doc.data().claimedAt?.toDate(),
        expiryDate: doc.data().expiryDate?.toDate ? doc.data().expiryDate.toDate() : new Date(doc.data().expiryDate),
      });
    });

    return donations;
  } catch (error) {
    logger.error('Error getting claimed donations:', error);
    throw error;
  }
};


