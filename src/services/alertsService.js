import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';


export const createAlert = async (userId, alertData) => {
  try {
    const alert = {
      userId,
      type: alertData.type || 'info',
      title: alertData.title,
      message: alertData.message,
      donationId: alertData.donationId || null,
      read: false,
      createdAt: Timestamp.now(),
      expiresAt: alertData.expiresAt
        ? Timestamp.fromDate(alertData.expiresAt)
        : Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    };

    const docRef = await addDoc(collection(db, 'alerts'), alert);

    return {
      id: docRef.id,
      ...alert,
      createdAt: alert.createdAt.toDate(),
      expiresAt: alert.expiresAt.toDate(),
    };
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};


export const getUserAlerts = async (userId, includeRead = true) => {
  try {
    let q;

    if (includeRead) {
      q = query(
        collection(db, 'alerts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'alerts'),
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const alerts = [];

    const now = new Date();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const expiresAt = data.expiresAt?.toDate();


      if (expiresAt && expiresAt < now) {
        return;
      }

      alerts.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        expiresAt: expiresAt,
      });
    });

    return alerts;
  } catch (error) {
    console.error('Error getting user alerts:', error);
    throw error;
  }
};


export const getUnreadAlertCount = async (userId) => {
  try {
    const q = query(
      collection(db, 'alerts'),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);


    const now = new Date();
    let count = 0;

    querySnapshot.forEach((doc) => {
      const expiresAt = doc.data().expiresAt?.toDate();
      if (!expiresAt || expiresAt >= now) {
        count++;
      }
    });

    return count;
  } catch (error) {
    console.error('Error getting unread alert count:', error);
    return 0;
  }
};


export const markAlertAsRead = async (alertId) => {
  try {
    const alertRef = doc(db, 'alerts', alertId);
    await updateDoc(alertRef, {
      read: true,
    });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    throw error;
  }
};


export const markAllAlertsAsRead = async (userId) => {
  try {
    const q = query(
      collection(db, 'alerts'),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);

    const updatePromises = [];
    querySnapshot.forEach((document) => {
      const alertRef = doc(db, 'alerts', document.id);
      updatePromises.push(updateDoc(alertRef, { read: true }));
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all alerts as read:', error);
    throw error;
  }
};


export const deleteAlert = async (alertId) => {
  try {
    await deleteDoc(doc(db, 'alerts', alertId));
  } catch (error) {
    console.error('Error deleting alert:', error);
    throw error;
  }
};


export const deleteExpiredAlerts = async (userId) => {
  try {
    const q = query(
      collection(db, 'alerts'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const now = new Date();

    const deletePromises = [];
    querySnapshot.forEach((document) => {
      const expiresAt = document.data().expiresAt?.toDate();
      if (expiresAt && expiresAt < now) {
        deletePromises.push(deleteDoc(doc(db, 'alerts', document.id)));
      }
    });

    await Promise.all(deletePromises);
    return deletePromises.length;
  } catch (error) {
    console.error('Error deleting expired alerts:', error);
    return 0;
  }
};


export const notifyNearbyUsers = async (donation, nearbyUserIds) => {
  try {
    const alertPromises = nearbyUserIds.map(userId =>
      createAlert(userId, {
        type: 'donation',
        title: 'New Donation Nearby',
        message: `${donation.itemName} is available for pickup near you!`,
        donationId: donation.id,
      })
    );

    return await Promise.all(alertPromises);
  } catch (error) {
    console.error('Error notifying nearby users:', error);
    throw error;
  }
};


