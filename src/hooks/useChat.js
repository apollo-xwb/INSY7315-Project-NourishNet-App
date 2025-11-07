import { useState, useEffect, useCallback, useRef } from 'react';
import { sendMessage as sendFirestoreMessage, subscribeToMessages } from '../services/chatService';
import logger from '../utils/logger';

const useChat = (chatId, userId, { autoSubscribe = true, onNewMessage = null } = {}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(autoSubscribe);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  const previousMessageCount = useRef(0);

  // Send a message with an optimistic update so the UI feels instant
  const sendMessage = useCallback(
    async (messageText, metadata = {}) => {
      if (!messageText || !messageText.trim()) {
        logger.warn('[useChat] Attempted to send empty message');
        return false;
      }

      if (!chatId || !userId) {
        logger.error('[useChat] Missing chatId or userId');
        return false;
      }

      setSending(true);
      setError(null);

      const tempId = `temp_${Date.now()}_${Math.random()}`;
      const tempMessage = {
        id: tempId,
        text: messageText.trim(),
        senderId: userId,
        chatId,
        createdAt: new Date(),
        isTemporary: true,
        ...metadata,
      };

      try {
        setMessages((prev) => [...prev, tempMessage]);

        logger.info(`[useChat] Sending message to chat: ${chatId}`);
        const sentMessage = await sendFirestoreMessage(
          chatId,
          userId,
          messageText.trim(),
          metadata,
        );

        setMessages((prev) => prev.map((msg) => (msg.id === tempId ? sentMessage : msg)));

        logger.info('[useChat] Message sent successfully');
        return true;
      } catch (err) {
        logger.error('[useChat] Error sending message:', err);
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        setError(err);
        return false;
      } finally {
        setSending(false);
      }
    },
    [chatId, userId],
  );

  // Handy hook API for screens that want a manual refresh button
  const refresh = useCallback(() => {
    logger.info(`[useChat] Refreshing messages for chat: ${chatId}`);
  }, [chatId]);

  // Subscribe to chat updates and clean up when the chat changes
  useEffect(() => {
    if (!chatId || !userId || !autoSubscribe) {
      return;
    }

    logger.info(`[useChat] Subscribing to chat: ${chatId}`);
    setLoading(true);

    const handleMessagesUpdate = (firestoreMessages) => {
      logger.info(`[useChat] Received ${firestoreMessages.length} messages`);
      setMessages(firestoreMessages);
      setLoading(false);
      setError(null);

      if (onNewMessage && firestoreMessages.length > previousMessageCount.current) {
        const newMessages = firestoreMessages.slice(previousMessageCount.current);
        onNewMessage(newMessages);
      }

      previousMessageCount.current = firestoreMessages.length;
    };

    const unsubscribe = subscribeToMessages(chatId, handleMessagesUpdate, (err) => {
      logger.error('[useChat] Subscription error:', err);
      setError(err);
      setLoading(false);
    });

    return () => {
      logger.info(`[useChat] Unsubscribing from chat: ${chatId}`);
      previousMessageCount.current = 0;
      unsubscribe();
    };
  }, [chatId, userId, autoSubscribe, onNewMessage]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    sending,
    refresh,
  };
};

// Deterministic chat IDs so the same two users share one thread per donation
export const generateChatId = (donationId, userId1, userId2) => {
  const sortedUserIds = [userId1, userId2].sort();
  return `${donationId}_${sortedUserIds[0]}_${sortedUserIds[1]}`;
};

export default useChat;
