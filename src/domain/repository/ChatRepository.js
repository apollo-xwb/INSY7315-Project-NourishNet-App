import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

export class FirebaseChatRepository {
  async sendMessage(chatId, messageData) {
    const message = { ...messageData, chatId, createdAt: Timestamp.now(), read: false };
    const docRef = await addDoc(collection(db, 'messages'), message);
    return { id: docRef.id, ...message, timestamp: new Date() };
  }

  async getMessages(chatId) {
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      timestamp: d.data().createdAt?.toDate() || new Date(),
    }));
  }

  subscribeMessages(chatId, callback, errorCallback) {
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc'),
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          timestamp: d.data().createdAt?.toDate() || new Date(),
        }));
        callback(messages);
      },
      errorCallback,
    );
  }

  async markAsRead(chatId, userId) {
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      where('receiverId', '==', userId),
      where('read', '==', false),
    );
    const snapshot = await getDocs(q);
    await Promise.all(
      snapshot.docs.map((docSnap) => updateDoc(doc(db, 'messages', docSnap.id), { read: true })),
    );
  }

  async getUserChats(userId) {
    const sentQ = query(
      collection(db, 'messages'),
      where('senderId', '==', userId),
      orderBy('createdAt', 'desc'),
    );
    const recvQ = query(
      collection(db, 'messages'),
      where('receiverId', '==', userId),
      orderBy('createdAt', 'desc'),
    );
    const [sentSnap, recvSnap] = await Promise.all([getDocs(sentQ), getDocs(recvQ)]);
    const chatMap = new Map();
    [...sentSnap.docs, ...recvSnap.docs].forEach((d) => {
      const data = d.data();
      const chatId = data.chatId;
      if (!chatMap.has(chatId)) {
        chatMap.set(chatId, {
          chatId,
          lastMessage: data.text,
          lastMessageTime: data.createdAt?.toDate() || new Date(),
          donationId: chatId,
        });
      }
    });
    return Array.from(chatMap.values());
  }
}

export default FirebaseChatRepository;





