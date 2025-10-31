// Repository for donation data access operations (Firestore and Storage)

import {
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
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';

// Main repository class implementing donation CRUD operations
export class FirebaseDonationRepository {
  async uploadImageIfNeeded(image, donationIdHint) {
    if (!image || !image.startsWith('file://')) {
      return image;
    }
    const response = await fetch(image);
    const blob = await response.blob();
    const filename = `${donationIdHint}_${Date.now()}.jpg`;
    const storageRef = ref(storage, `donations/${filename}`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  }

  async create(donationData, userId) {
    const donation = {
      ...donationData,
      userId,
      status: 'available',
      claimedBy: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    if (donationData.image) {
      const tempId = `temp_${Date.now()}`;
      const imageUrl = await this.uploadImageIfNeeded(donationData.image, tempId);
      if (imageUrl) {
        donation.image = imageUrl;
        donation.imageUrl = imageUrl;
      }
    }

    const docRef = await addDoc(collection(db, 'donations'), donation);
    return { id: docRef.id, ...donation };
  }

  async findAvailable() {
    // Only show 'available' donations on Home. Claimed and picked_up are hidden.
    const q = query(
      collection(db, 'donations'),
      where('status', '==', 'available'),
      orderBy('createdAt', 'desc'),
    );
    const snapshot = await getDocs(q);
    const now = new Date();
    // Filter out expired donations client-side to avoid requiring extra indexes
    return snapshot.docs
      .map((d) => this._toDonation(d))
      .filter((donation) => {
        const expiry = donation.expiryDate instanceof Date
          ? donation.expiryDate
          : donation.expiryDate
              ? new Date(donation.expiryDate)
              : null;
        return !expiry || expiry >= now;
      });
  }

  async findByUser(userId) {
    const q = query(
      collection(db, 'donations'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => this._toDonation(d));
  }

  async findClaimedBy(userId) {
    const q = query(
      collection(db, 'donations'),
      where('claimedBy', '==', userId),
      orderBy('claimedAt', 'desc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => this._toDonation(d));
  }

  async findById(id) {
    const refDoc = doc(db, 'donations', id);
    const snap = await getDoc(refDoc);
    if (!snap.exists()) {
      throw new Error('Donation not found');
    }
    return this._toDonation(snap, true);
  }

  async updateStatus(id, status, claimedBy = null) {
    const refDoc = doc(db, 'donations', id);
    const donationSnap = await getDoc(refDoc);
    const updateData = { status, updatedAt: Timestamp.now() };
    if (claimedBy) {
      updateData.claimedBy = claimedBy;
      updateData.claimedAt = Timestamp.now();
    }
    if (status === 'picked_up') {
      updateData.pickedUpAt = Timestamp.now();
    }
    await updateDoc(refDoc, updateData);
    return donationSnap.data();
  }

  async delete(id) {
    const refDoc = doc(db, 'donations', id);
    await deleteDoc(refDoc);
  }

  subscribeAvailable(callback, errorCallback) {
    // Only stream 'available' donations to Home. Claimed and picked_up are hidden.
    const q = query(
      collection(db, 'donations'),
      where('status', '==', 'available'),
      orderBy('createdAt', 'desc'),
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const now = new Date();
        const donations = snapshot.docs
          .map((d) => this._toDonation(d))
          .filter((donation) => {
            const expiry = donation.expiryDate instanceof Date
              ? donation.expiryDate
              : donation.expiryDate
                  ? new Date(donation.expiryDate)
                  : null;
            return !expiry || expiry >= now;
          });
        callback(donations);
      },
      (err) => errorCallback && errorCallback(err),
    );
  }

  _toDonation(docOrSnap) {
    const raw = typeof docOrSnap.data === 'function' ? docOrSnap.data() : docOrSnap.data;
    const id = docOrSnap.id;
    return {
      id,
      ...raw,
      createdAt: raw.createdAt?.toDate ? raw.createdAt.toDate() : raw.createdAt,
      updatedAt: raw.updatedAt?.toDate ? raw.updatedAt.toDate() : raw.updatedAt,
      claimedAt: raw.claimedAt?.toDate ? raw.claimedAt.toDate() : raw.claimedAt,
      pickedUpAt: raw.pickedUpAt?.toDate ? raw.pickedUpAt.toDate() : raw.pickedUpAt,
      expiryDate: raw.expiryDate?.toDate ? raw.expiryDate.toDate() : raw.expiryDate,
    };
  }
}

export default FirebaseDonationRepository;
