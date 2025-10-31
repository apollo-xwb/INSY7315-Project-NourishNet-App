/**
 * useChat Hook
 *
 * Purpose: Subscribes to a chat's messages, provides a sendMessage helper,
 * and tracks loading/sending states for the given chatId.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { sendMessage as sendFirestoreMessage, subscribeToMessages } from '../services/chatService';
import logger from '../utils/logger';

/**
 * Custom hook for managing chat messages
 *
 * @param {string} chatId - Unique chat identifier
 * @param {string} userId - Current user's ID
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoSubscribe - Auto-subscribe to messages on mount
 * @param {Function} options.onNewMessage - Callback for new messages
 *
 * @returns {Object} Hook state and methods
 * @returns {Array} messages - Array of message objects
 * @returns {boolean} loading - Loading state
 * @returns {Error|null} error - Error object if any
 * @returns {Function} sendMessage - Send a message
 * @returns {boolean} sending - Whether a message is being sent
 * @returns {Function} refresh - Manually refresh messages
 *
 * @example
 * ```javascript
 * function ChatScreen({ donation, recipientId }) {
 *   const chatId = generateChatId(donation.id, user.uid, recipientId);
 *
 *   const {
 *     messages,
 *     loading,
 *     sendMessage,
 *     sending
 *   } = useChat(chatId, user.uid);
 *
 *   return (
 *     <>
 *       <MessageList messages={messages} />
 *       <MessageInput
 *         onSend={sendMessage}
 *         disabled={sending}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
const useChat = (chatId, userId, { autoSubscribe = true, onNewMessage = null } = {}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(autoSubscribe);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  // Ref to track previous message count for detecting new messages
  const previousMessageCount = useRef(0);

  /**
   * Send a message
   *
   * Optimistic UI Pattern:
   * 1. Create temporary message with local ID
   * 2. Add to messages array immediately (instant feedback)
   * 3. Send to server
   * 4. Replace temporary message with server response (has real ID)
   * 5. On error, remove temporary message and show error
   *
   * Benefits:
   * - Instant visual feedback
   * - Works offline (queues message)
   * - Better perceived performance
   *
   * Reference: "Designing for Performance" by Lara Hogan
   *
   * @param {string} messageText - Message content
   * @param {Object} metadata - Additional message metadata
   * @returns {Promise<boolean>} Success status
   */
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

      // Create temporary message for optimistic update
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
        // Optimistic update: Add message immediately
        setMessages((prev) => [...prev, tempMessage]);

        // Send to server
        logger.info(`[useChat] Sending message to chat: ${chatId}`);
        const sentMessage = await sendFirestoreMessage(
          chatId,
          userId,
          messageText.trim(),
          metadata,
        );

        // Replace temporary message with real one
        setMessages((prev) => prev.map((msg) => (msg.id === tempId ? sentMessage : msg)));

        logger.info(`[useChat] Message sent successfully`);
        return true;
      } catch (err) {
        // Remove temporary message on error
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

  /**
   * Refresh messages
   *
   * Note: With real-time subscription, this is rarely needed
   * Useful for forcing a sync or recovering from errors
   */
  const refresh = useCallback(() => {
    logger.info(`[useChat] Refreshing messages for chat: ${chatId}`);
    // With Firestore subscriptions, we don't need manual refresh
    // The subscription automatically gets latest data
    // This is a no-op but kept for API consistency
  }, [chatId]);

  /**
   * Effect: Subscribe to messages
   *
   * Real-time Subscription Pattern:
   * - Subscribes to Firestore collection
   * - Receives updates automatically when messages added/modified
   * - Unsubscribes on unmount to prevent memory leaks
   *
   * Message Sorting:
   * - Firestore query handles ordering (by timestamp)
   * - Ensures consistent message order across all clients
   *
   * New Message Detection:
   * - Compares message count to detect new messages
   * - Triggers onNewMessage callback for notifications
   *
   * Lifecycle:
   * - Runs when chatId or userId changes
   * - Cleans up subscription on unmount
   * - Prevents multiple subscriptions to same chat
   *
   * Reference: React useEffect cleanup
   * https://react.dev/reference/react/useEffect#cleaning-up-after-an-effect
   */
  useEffect(() => {
    if (!chatId || !userId || !autoSubscribe) {
      return;
    }

    logger.info(`[useChat] Subscribing to chat: ${chatId}`);
    setLoading(true);

    /**
     * Subscription callback
     * Called whenever messages change in Firestore
     *
     * @param {Array} firestoreMessages - Updated message array
     */
    const handleMessagesUpdate = (firestoreMessages) => {
      logger.info(`[useChat] Received ${firestoreMessages.length} messages`);
      setMessages(firestoreMessages);
      setLoading(false);
      setError(null);

      // Detect new messages
      if (onNewMessage && firestoreMessages.length > previousMessageCount.current) {
        const newMessages = firestoreMessages.slice(previousMessageCount.current);
        newMessages.forEach((msg) => {
          // Don't trigger for own messages
          if (msg.senderId !== userId) {
            onNewMessage(msg);
          }
        });
      }

      previousMessageCount.current = firestoreMessages.length;
    };

    /**
     * Error callback
     * Called if subscription fails
     *
     * @param {Error} err - Error object
     */
    const handleError = (err) => {
      logger.error(`[useChat] Subscription error for chat ${chatId}:`, err);
      setError(err);
      setLoading(false);
    };

    // Subscribe to messages
    const unsubscribe = subscribeToMessages(chatId, handleMessagesUpdate, handleError);

    // Cleanup function
    // Called on unmount or when dependencies change
    return () => {
      if (unsubscribe) {
        logger.info(`[useChat] Unsubscribing from chat: ${chatId}`);
        unsubscribe();
      }
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

/**
 * Utility: Generate unique chat ID
 *
 * Chat ID Format: {donationId}_{userId1}_{userId2}
 * Where userIds are sorted alphabetically for consistency
 *
 * Rationale:
 * - Same two users always generate same chat ID
 * - Ensures messages go to single conversation
 * - Prevents duplicate chats between same users
 *
 * Algorithm:
 * 1. Sort user IDs alphabetically (deterministic ordering)
 * 2. Combine with donation ID
 * 3. Result is always the same regardless of who initiates
 *
 * Example:
 * - User A (id: "abc") chats with User B (id: "xyz") about Donation "123"
 * - User B chats with User A about same donation
 * - Both generate: "123_abc_xyz" (same chat ID)
 *
 * @param {string} donationId - Donation ID
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {string} Unique chat ID
 */
export const generateChatId = (donationId, userId1, userId2) => {
  const sortedUserIds = [userId1, userId2].sort();
  return `${donationId}_${sortedUserIds[0]}_${sortedUserIds[1]}`;
};

export default useChat;
