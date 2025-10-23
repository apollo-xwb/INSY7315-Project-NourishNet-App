import React, { useState } from 'react';
import {
import logger from '../utils/logger';

  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import Icon from '../utils/IconWrapper';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getUserClaims } from '../services/firestoreService';

const MyClaimsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadClaims();
      }
    }, [user])
  );

  const loadClaims = async () => {
    if (!user) return;
    try {
      const result = await getUserClaims(user.uid);
      if (result.success) {
        setClaims(result.data);
      }
    } catch (error) {
      logger.error('Error loading claims:', error);
    }
  };

  const handleViewQR = (claim) => {
    setSelectedClaim(claim);
    setQrModalVisible(true);
  };

  const handleMarkPickedUp = async (claim) => {
    Alert.alert(
      'Mark as Picked Up',
      'Have you collected this donation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Picked Up',
          onPress: async () => {
            Alert.alert('Feature Coming Soon', 'Claim status updates will be implemented with Firestore.');
          },
        },
      ]
    );
  };

  const handleCancelClaim = async (claim) => {
    Alert.alert(
      'Cancel Claim',
      'Are you sure you want to cancel this claim?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            Alert.alert('Feature Coming Soon', 'Claim cancellation will be implemented with Firestore.');
          },
        },
      ]
    );
  };

  const handleChat = (claim) => {
    navigation.navigate('Chat', {
      donation: claim.donation,
      recipientName: 'Donor',
      recipientId: 'donor_123',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFA726';
      case 'picked_up':
        return '#66BB6A';
      case 'cancelled':
        return '#EF5350';
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending Pickup';
      case 'picked_up':
        return 'Picked Up';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const renderClaimItem = ({ item }) => {
    const imageUri = item.donation.imageUrl || item.donation.image;

    return (
      <View style={[styles.claimCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.claimHeader}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.claimImage}
            />
          ) : (
            <View style={[styles.claimImage, styles.placeholderImage, { backgroundColor: theme.colors.primary + '20' }]}>
              <Icon name="restaurant" size={32} color={theme.colors.primary} />
            </View>
          )}
          <View style={styles.claimInfo}>
            <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={1}>
              {item.donation.itemName}
            </Text>
            <View style={styles.locationRow}>
              <Icon name="location-on" size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.location, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {item.donation.location?.address || item.donation.location || 'Location available'}
              </Text>
            </View>
            <Text style={[styles.quantity, { color: theme.colors.textSecondary }]}>
              {item.donation.quantity}
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>

        <Text style={[styles.claimedAt, { color: theme.colors.textSecondary }]}>
          Claimed {item.claimedAt.toLocaleDateString()} at {item.claimedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>

        {item.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => handleViewQR(item)}
            >
              <Icon name="qr-code" size={20} color={theme.colors.surface} />
              <Text style={[styles.actionButtonText, { color: theme.colors.surface }]}>
                Show QR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => handleChat(item)}
            >
              <Icon name="chat" size={20} color={theme.colors.surface} />
              <Text style={[styles.actionButtonText, { color: theme.colors.surface }]}>
                Chat
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#66BB6A' }]}
              onPress={() => handleMarkPickedUp(item)}
            >
              <Icon name="check-circle" size={20} color="#FFFFFF" />
              <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                Picked Up
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#EF5350' }]}
              onPress={() => handleCancelClaim(item)}
            >
              <Icon name="cancel" size={20} color="#FFFFFF" />
              <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="inventory" size={64} color={theme.colors.border} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Claims Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        When you claim a donation, it will appear here with your QR code
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={claims}
        keyExtractor={(item) => item.id}
        renderItem={renderClaimItem}
        contentContainerStyle={claims.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmpty}
      />

      {}
      <Modal
        visible={qrModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setQrModalVisible(false)}
            >
              <Icon name="close" size={28} color={theme.colors.text} />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.qrScrollContent}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Pickup QR Code
              </Text>

              {selectedClaim && (
                <>
                  <View style={styles.qrContainer}>
                    <QRCode
                      value={selectedClaim.qrData}
                      size={250}
                      backgroundColor="white"
                    />
                  </View>

                  <View style={styles.qrInfoContainer}>
                    <Text style={[styles.qrInfoTitle, { color: theme.colors.text }]}>
                      {selectedClaim.donation.itemName}
                    </Text>
                    <Text style={[styles.qrInfoText, { color: theme.colors.textSecondary }]}>
                      Show this QR code to the donor when picking up
                    </Text>

                    <View style={styles.pickupDetails}>
                      <Icon name="access-time" size={20} color={theme.colors.primary} />
                      <Text style={[styles.pickupText, { color: theme.colors.text }]}>
                        Pickup: {selectedClaim.donation.pickupTimeStart || selectedClaim.donation.pickupTime?.start || 'Time available'}
                      </Text>
                    </View>

                    <View style={styles.pickupDetails}>
                      <Icon name="location-on" size={20} color={theme.colors.primary} />
                      <Text style={[styles.pickupText, { color: theme.colors.text }]}>
                        {selectedClaim.donation.location?.address || selectedClaim.donation.location || 'Location available'}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  claimCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  claimHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  claimImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  claimInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    marginLeft: 4,
    flex: 1,
  },
  quantity: {
    fontSize: 14,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  claimedAt: {
    fontSize: 13,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  qrScrollContent: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  qrInfoContainer: {
    width: '100%',
  },
  qrInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  qrInfoText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  pickupDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickupText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
});

export default MyClaimsScreen;

