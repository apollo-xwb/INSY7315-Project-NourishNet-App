import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import logger from '../utils/logger';
import Icon from '../utils/IconWrapper';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage as sendFirestoreMessage, subscribeToMessages } from '../services/chatService';
import { markMessagesAsRead } from '../services/chatService';
import { useToast } from '../contexts/AlertContext';

function toSerializableDonation(obj) {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(toSerializableDonation);
  if (typeof obj === 'object') {
    const res = {};
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      const v = obj[key];
      if (typeof v === 'function' || v === undefined) continue;
      res[key] = toSerializableDonation(v);
    }
    return res;
  }
  return obj;
}

const ChatScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user, userProfile } = useAuth();
  const { showError } = useToast();
  const { donation, recipientName, recipientId } = route.params;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  const getChatId = () => {
    const userIds = [user.uid, recipientId].sort();
    return `${donation.id}_${userIds[0]}_${userIds[1]}`;
  };

  const chatId = getChatId();

  useEffect(() => {
    navigation.setOptions({
      title: `Chat with ${recipientName}`,
    });

    const unsubscribe = subscribeToMessages(chatId, (firestoreMessages) => {
      setMessages(firestoreMessages);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [chatId]);

  // Mark as read whenever new messages arrive (and user is viewer)
  useEffect(() => {
    if (!user?.uid || !chatId) return;
    (async () => {
      try {
        await markMessagesAsRead(chatId, user.uid);
      } catch (e) {
        logger.error('Failed to mark messages as read:', e);
      }
    })();
  }, [messages.length, chatId, user?.uid]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      const messageData = {
        text: inputText.trim(),
        senderId: user.uid,
        senderName: userProfile?.name || user?.displayName || 'User',
        receiverId: recipientId,
        receiverName: recipientName,
        donationId: donation.id,
        donationName: donation.itemName,
      };

      await sendFirestoreMessage(chatId, messageData);

      setInputText('');

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      logger.error('Error sending message:', error);
      showError('Failed to send message. Please try again.');
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === user.uid;
    const senderName = isMe ? userProfile?.name || 'You' : item.senderName || recipientName;
    const initials = senderName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <View style={[styles.messageContainer, isMe && styles.myMessageContainer]}>
        {!isMe && (
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '30' }]}>
            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>{initials}</Text>
          </View>
        )}

        <View style={styles.messageContent}>
          {!isMe && (
            <Text style={[styles.senderName, { color: theme.colors.textSecondary }]}>
              {senderName}
            </Text>
          )}

          <View
            style={[
              styles.messageBubble,
              isMe ? styles.myMessage : styles.theirMessage,
              { backgroundColor: isMe ? theme.colors.primary : theme.colors.surface },
            ]}
          >
            <Text
              style={[
                styles.messageText,
                { color: isMe ? theme.colors.surface : theme.colors.text },
              ]}
            >
              {item.text}
            </Text>
            <Text
              style={[
                styles.timestamp,
                { color: isMe ? theme.colors.surface + 'CC' : theme.colors.textSecondary },
              ]}
            >
              {item.timestamp?.toLocaleTimeString?.([], { hour: '2-digit', minute: '2-digit' }) ||
                ''}
            </Text>
          </View>
        </View>

        {isMe && (
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.avatarText, { color: theme.colors.surface }]}>{initials}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {}
        <TouchableOpacity
          style={[styles.donationHeader, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('DonationDetails', { donation: toSerializableDonation(donation) })}
          activeOpacity={0.7}
        >
          <Icon name="restaurant" size={24} color={theme.colors.primary} />
          <View style={styles.donationInfo}>
            <Text style={[styles.donationName, { color: theme.colors.text }]}>
              {donation.itemName}
            </Text>
            <Text style={[styles.donationMeta, { color: theme.colors.textSecondary }]}>
              {donation.quantity} • {donation.location?.address || 'Location available'}
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        {}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {}
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
          <TextInput
            style={[
              styles.input,
              { color: theme.colors.text, backgroundColor: theme.colors.background },
            ]}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim() ? theme.colors.primary : theme.colors.border,
              },
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Icon name="send" size={24} color={theme.colors.surface} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  donationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  donationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  donationName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  donationMeta: {
    fontSize: 14,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  messageContent: {
    flex: 1,
    maxWidth: '70%',
  },
  senderName: {
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 12,
    fontWeight: '600',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  myMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;
