import {
import logger from '../utils/logger';

  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';


export const sendMessage = async (chatId, messageData) => {
  try {
    const message = {
      ...messageData,
      chatId,
      createdAt: Timestamp.now(),
      read: false,
    };

    const docRef = await addDoc(collection(db, 'messages'), message);

    return {
      id: docRef.id,
      ...message,
    };
  } catch (error) {
    logger.error('Error sending message:', error);
    throw error;
  }
};


export const getChatMessages = async (chatId) => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const messages = [];

    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().createdAt?.toDate() || new Date(),
      });
    });

    return messages;
  } catch (error) {
    logger.error('Error getting messages:', error);
    throw error;
  }
};


export const subscribeToMessages = (chatId, callback) => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().createdAt?.toDate() || new Date(),
        });
      });
      callback(messages);
    });

    return unsubscribe;
  } catch (error) {
    logger.error('Error subscribing to messages:', error);
    throw error;
  }
};


export const getUserChats = async (userId) => {
  try {

    const q = query(
      collection(db, 'messages'),
      where('senderId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const chatMap = new Map();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
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


    const q2 = query(
      collection(db, 'messages'),
      where('receiverId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot2 = await getDocs(q2);

    querySnapshot2.forEach((doc) => {
      const data = doc.data();
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
  } catch (error) {
    logger.error('Error getting user chats:', error);
    throw error;
  }
};


export const markMessagesAsRead = async (chatId, userId) => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      where('receiverId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);

    const updatePromises = [];
    querySnapshot.forEach((document) => {
      const docRef = doc(db, 'messages', document.id);
      updatePromises.push(updateDoc(docRef, { read: true }));
    });

    await Promise.all(updatePromises);
  } catch (error) {
    logger.error('Error marking messages as read:', error);
    throw error;
  }
};


