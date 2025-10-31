import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import logger from '../utils/logger';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../utils/IconWrapper';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getDonationById } from '../services/donationService';
import { useToast } from '../contexts/AlertContext';

const ChatsListScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showError } = useToast();
  const [chats, setChats] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState(new Set());

  useFocusEffect(
    React.useCallback(() => {
      loadChats();
    }, []),
  );

  const loadChats = async () => {
    if (!user) return;

    try {
      const q = query(collection(db, 'messages'), where('senderId', '==', user.uid));

      const q2 = query(collection(db, 'messages'), where('receiverId', '==', user.uid));

      const [sentSnapshot, receivedSnapshot] = await Promise.all([getDocs(q), getDocs(q2)]);

      const allMessages = [];
      sentSnapshot.forEach((doc) => {
        allMessages.push({ id: doc.id, ...doc.data() });
      });
      receivedSnapshot.forEach((doc) => {
        allMessages.push({ id: doc.id, ...doc.data() });
      });

      const chatMap = new Map();

      for (const msg of allMessages) {
        const chatId = msg.chatId;
        if (!chatId) continue;

        const donationId = chatId.split('_')[0];
        const otherUserId = msg.senderId === user.uid ? msg.receiverId : msg.senderId;
        const otherUserName = msg.senderId === user.uid ? msg.receiverName : msg.senderName;

        if (!chatMap.has(chatId) || msg.createdAt?.toDate() > chatMap.get(chatId).lastMessageTime) {
          let donationData = null;
          try {
            donationData = await getDonationById(donationId);
          } catch (error) {
            logger.error('Could not load donation details for chat:', error);
          }

          chatMap.set(chatId, {
            id: chatId,
            donationId,
            itemName: donationData?.itemName || msg.donationName || 'Unknown Item',
            location: donationData?.location?.address || 'Unknown location',
            lastMessage: msg.text,
            lastMessageTime: msg.createdAt?.toDate() || new Date(),
            unread: msg.receiverId === user.uid && !msg.read,
            otherUserId,
            otherUserName,
            donationData: donationData || {
              id: donationId,
              itemName: msg.donationName || 'Unknown Item',
              location: { address: 'Unknown location' },
            },
          });
        }
      }

      const loadedChats = Array.from(chatMap.values());
      loadedChats.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

      setChats(loadedChats);
    } catch (error) {
      logger.error('Error loading chats:', error);
    }
  };

  const handleChatPress = (chat) => {
    const donation = chat.donationData;
    navigation.navigate('Chat', {
      donation: {
        ...donation,
        createdAt:
          donation.createdAt instanceof Date
            ? donation.createdAt.toISOString()
            : donation.createdAt,
        updatedAt:
          donation.updatedAt instanceof Date
            ? donation.updatedAt.toISOString()
            : donation.updatedAt,
        expiryDate:
          donation.expiryDate instanceof Date
            ? donation.expiryDate.toISOString()
            : donation.expiryDate,
      },
      recipientName: chat.otherUserName || 'User',
      recipientId: chat.otherUserId,
    });
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedChats(new Set());
  };

  const toggleChatSelection = (chatId) => {
    const newSelected = new Set(selectedChats);
    if (newSelected.has(chatId)) {
      newSelected.delete(chatId);
    } else {
      newSelected.add(chatId);
    }
    setSelectedChats(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedChats.size === 0) return;

    const doDelete = async () => {
      try {
        const deletePromises = [];
        for (const chatId of selectedChats) {
          const q = query(collection(db, 'messages'), where('chatId', '==', chatId));
          const snapshot = await getDocs(q);
          snapshot.forEach((docSnapshot) => {
            deletePromises.push(deleteDoc(docSnapshot.ref));
          });
        }
        await Promise.all(deletePromises);
        setChats((prev) => prev.filter((c) => !selectedChats.has(c.id)));
        setSelectedChats(new Set());
        setIsSelectionMode(false);
      } catch (error) {
        logger.error('Error deleting chats:', error);
        showError('Failed to delete chats. Please try again.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' && window.confirm(`Delete ${selectedChats.size} conversation(s)?`);
      if (confirmed) await doDelete();
      return;
    }

    Alert.alert(
      'Delete Chats',
      `Are you sure you want to delete ${selectedChats.size} conversation(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => doDelete() },
      ],
    );
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

  const renderChatItem = ({ item }) => {
    const isSelected = selectedChats.has(item.id);

    const handlePress = () => {
      if (isSelectionMode) {
        toggleChatSelection(item.id);
      } else {
        handleChatPress(item);
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.chatItemContainer,
          { backgroundColor: theme.colors.surface },
          isSelected && { backgroundColor: theme.colors.primary + '20' },
        ]}
        onPress={handlePress}
        onLongPress={() => {
          if (!isSelectionMode) {
            setIsSelectionMode(true);
            toggleChatSelection(item.id);
          }
        }}
        activeOpacity={0.7}
      >
        {isSelectionMode && (
          <View style={styles.selectionCheckbox}>
            <Icon
              name={isSelected ? 'check-circle' : 'radio-button-unchecked'}
              size={24}
              color={isSelected ? theme.colors.primary : theme.colors.border}
            />
          </View>
        )}
        <View style={[styles.chatItem, isSelectionMode && { paddingLeft: 48 }]}>
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
              <Text
                style={[styles.location, { color: theme.colors.textSecondary }]}
                numberOfLines={1}
              >
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
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="chat-bubble-outline" size={64} color={theme.colors.border} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Chats Yet</Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        When you claim a donation, you can chat with the donor here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {chats.length > 0 && (
        <View
          style={[
            styles.header,
            { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border },
          ]}
        >
          <View style={styles.headerContent}>
            {isSelectionMode ? (
              <>
                <TouchableOpacity style={styles.headerButton} onPress={toggleSelectionMode}>
                  <Icon name="close" size={24} color={theme.colors.text} />
                  <Text style={[styles.headerButtonText, { color: theme.colors.text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.selectedCount, { color: theme.colors.text }]}>
                  {selectedChats.size} selected
                </Text>
                <TouchableOpacity
                  style={[
                    styles.deleteButton,
                    { backgroundColor: theme.colors.error },
                    selectedChats.size === 0 && styles.deleteButtonDisabled,
                  ]}
                  onPress={handleDeleteSelected}
                  disabled={selectedChats.size === 0}
                >
                  <Icon name="delete" size={20} color={theme.colors.surface} />
                  <Text style={[styles.deleteButtonText, { color: theme.colors.surface }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Chats</Text>
                <TouchableOpacity style={styles.headerButton} onPress={toggleSelectionMode}>
                  <Icon name="check-box-outline-blank" size={24} color={theme.colors.text} />
                  <Text style={[styles.headerButtonText, { color: theme.colors.text }]}>
                    Select
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}
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
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  chatItemContainer: {
    marginBottom: 8,
    marginHorizontal: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
  },
  selectionCheckbox: {
    position: 'absolute',
    left: 12,
    top: '50%',
    marginTop: -12,
    zIndex: 1,
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
