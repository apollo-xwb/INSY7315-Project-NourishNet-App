import logger from '../utils/logger';
import { sendPushNotification } from './notificationService';
import { createAlert } from './alertsService';
import { FirebaseChatRepository } from '../domain/repository/ChatRepository';

const repo = new FirebaseChatRepository();

export const sendMessage = async (chatId, messageData) => {
  try {
    const sent = await repo.sendMessage(chatId, messageData);

    if (messageData.receiverId && messageData.receiverId !== messageData.senderId) {
      await sendPushNotification(messageData.receiverId, 'New Message', messageData.text, {
        chatId,
        type: 'message',
        donationId: messageData.donationId,
      });

      try {
        await createAlert(messageData.receiverId, {
          type: 'message',
          title: `New message from ${messageData.senderName}`,
          message: messageData.text,
          donationId: messageData.donationId,
          chatId: chatId,
          senderId: messageData.senderId,
        });
      } catch (alertError) {
        logger.error('Error creating message alert:', alertError);
      }
    }

    return sent;
  } catch (error) {
    logger.error('Error sending message:', error);
    throw error;
  }
};

export const getChatMessages = async (chatId) => {
  try {
    return await repo.getMessages(chatId);
  } catch (error) {
    logger.error('Error getting messages:', error);
    throw error;
  }
};

export const subscribeToMessages = (chatId, callback, errorCallback) => {
  try {
    return repo.subscribeMessages(chatId, callback, errorCallback);
  } catch (error) {
    logger.error('Error subscribing to messages:', error);
    throw error;
  }
};

export const getUserChats = async (userId) => {
  try {
    return await repo.getUserChats(userId);
  } catch (error) {
    logger.error('Error getting user chats:', error);
    throw error;
  }
};

export const markMessagesAsRead = async (chatId, userId) => {
  try {
    await repo.markAsRead(chatId, userId);
  } catch (error) {
    logger.error('Error marking messages as read:', error);
    throw error;
  }
};
