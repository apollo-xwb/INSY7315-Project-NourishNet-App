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
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

export class FirebaseAlertsRepository {
  async create(userId, alertData) {
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
  }

  async findUnread(userId) {
    const q = query(
      collection(db, 'alerts'),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate() || new Date(),
      expiresAt: d.data().expiresAt?.toDate() || new Date(),
    }));
  }

  async findByUser(userId, includeRead = true) {
    const q = includeRead
      ? query(collection(db, 'alerts'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
      : query(
          collection(db, 'alerts'),
          where('userId', '==', userId),
          where('read', '==', false),
          orderBy('createdAt', 'desc'),
        );
    const snapshot = await getDocs(q);
    const now = new Date();
    return snapshot.docs
      .map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate(),
        expiresAt: d.data().expiresAt?.toDate(),
      }))
      .filter((a) => !a.expiresAt || a.expiresAt >= now);
  }

  async unreadCount(userId) {
    const q = query(
      collection(db, 'alerts'),
      where('userId', '==', userId),
      where('read', '==', false),
    );
    const snapshot = await getDocs(q);
    const now = new Date();
    return snapshot.docs.reduce((acc, d) => {
      const exp = d.data().expiresAt?.toDate();
      return acc + (exp && exp < now ? 0 : 1);
    }, 0);
  }

  async markRead(alertId) {
    await updateDoc(doc(db, 'alerts', alertId), { read: true });
  }

  async markAllRead(userId) {
    const q = query(
      collection(db, 'alerts'),
      where('userId', '==', userId),
      where('read', '==', false),
    );
    const snapshot = await getDocs(q);
    await Promise.all(snapshot.docs.map((d) => updateDoc(doc(db, 'alerts', d.id), { read: true })));
  }

  async delete(alertId) {
    await deleteDoc(doc(db, 'alerts', alertId));
  }

  async deleteExpired(userId) {
    const q = query(collection(db, 'alerts'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const now = new Date();
    const expired = snapshot.docs.filter((d) => {
      const exp = d.data().expiresAt?.toDate();
      return exp && exp < now;
    });
    await Promise.all(expired.map((d) => deleteDoc(doc(db, 'alerts', d.id))));
    return expired.length;
  }
}

export default FirebaseAlertsRepository;




