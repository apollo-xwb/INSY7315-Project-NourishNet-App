import React, { useState, useEffect, useRef } from 'react';
import {
import logger from '../utils/logger';

  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from '../utils/IconWrapper';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage as sendFirestoreMessage, subscribeToMessages } from '../services/chatService';

const ChatScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user, userProfile } = useAuth();
  const { donation, recipientName, recipientId } = route.params;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {

    navigation.setOptions({
      title: `Chat with ${recipientName}`,
    });


    const unsubscribe = subscribeToMessages(donation.id, (firestoreMessages) => {
      setMessages(firestoreMessages);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [donation.id]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      const messageData = {
        text: inputText.trim(),
        senderId: user.uid,
        senderName: userProfile?.name || user?.displayName || 'User',
        receiverId: recipientId,
        receiverName: recipientName,
      };


      await sendFirestoreMessage(donation.id, messageData);

      setInputText('');


      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      logger.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === user.uid;

    return (
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
            { color: isMe ? theme.colors.surface : theme.colors.textSecondary },
          ]}
        >
          {item.timestamp?.toLocaleTimeString?.([], { hour: '2-digit', minute: '2-digit' }) || ''}
        </Text>
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
          onPress={() => navigation.navigate('DonationDetails', { donation })}
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
            style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.background }]}
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
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
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
    fontSize: 12,
    opacity: 0.7,
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


