import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../utils/IconWrapper';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const MESSAGES_KEY = '@nourishnet_chat_messages';

const ChatsListScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [chats, setChats] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      loadChats();
    }, [])
  );

  const loadChats = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const chatKeys = keys.filter(key => key.startsWith(MESSAGES_KEY));

      const chatPromises = chatKeys.map(async (key) => {
        const messagesData = await AsyncStorage.getItem(key);
        if (messagesData) {
          const messages = JSON.parse(messagesData);
          const donationId = key.replace(`${MESSAGES_KEY}_`, '');


          const lastMessage = messages[messages.length - 1];


          const welcomeMessage = messages[0];
          const itemMatch = welcomeMessage.text.match(/donation: (.+)\. When/);
          const itemName = itemMatch ? itemMatch[1] : 'Unknown Item';


          const donationsData = await AsyncStorage.getItem('@nourishnet_donations');
          let location = 'Location not available';
          let donationData = null;

          if (donationsData) {
            const donations = JSON.parse(donationsData);
            donationData = donations.find(d => d.id === donationId);
            if (donationData) {
              location = donationData.location?.address || donationData.location || 'Location available';
            }
          }

          return {
            id: donationId,
            itemName,
            location,
            lastMessage: lastMessage.text,
            lastMessageTime: new Date(lastMessage.timestamp),
            unread: lastMessage.sender === 'donor',
            donationData: donationData || {
              id: donationId,
              itemName,
              location: { address: location },
              quantity: 'Unknown',
            },
          };
        }
        return null;
      });

      const loadedChats = (await Promise.all(chatPromises)).filter(Boolean);


      loadedChats.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

      setChats(loadedChats);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const handleChatPress = (chat) => {
    navigation.navigate('Chat', {
      donation: chat.donationData,
      recipientName: 'Donor',
      recipientId: 'donor_123',
    });
  };

  const formatTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.chatItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleChatPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
        <Icon name="restaurant" size={28} color={theme.colors.primary} />
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={1}>
            {item.itemName}
          </Text>
          <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
            {formatTime(item.lastMessageTime)}
          </Text>
        </View>

        <View style={styles.locationRow}>
          <Icon name="location-on" size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.location, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {item.location}
          </Text>
        </View>

        <Text
          style={[
            styles.lastMessage,
            { color: item.unread ? theme.colors.text : theme.colors.textSecondary },
            item.unread && styles.unreadMessage,
          ]}
          numberOfLines={2}
        >
          {item.lastMessage}
        </Text>
      </View>

      {item.unread && (
        <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]} />
      )}
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="chat-bubble-outline" size={64} color={theme.colors.border} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Chats Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        When you claim a donation, you can chat with the donor here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={chats.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 8,
  },
  emptyList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 8,
    marginHorizontal: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  location: {
    fontSize: 13,
    marginLeft: 4,
    flex: 1,
  },
  lastMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  unreadMessage: {
    fontWeight: '600',
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ChatsListScreen;



