import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMaxWidth, getPadding, isDesktop } from '../utils/responsive';
import logger from '../utils/logger';
import { useFocusEffect } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import Icon from '../utils/IconWrapper';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  getClaimedDonations,
  markDonationAsPickedUp,
  cancelClaim,
} from '../services/donationService';
import RatingModal from '../components/RatingModal';
import ReviewModal from '../components/ReviewModal';
import { hasUserReviewedDonation } from '../services/reviewService';
import { hasUserRatedDonation } from '../services/ratingService';
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

const MyClaimsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user, userProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [ratingClaimData, setRatingClaimData] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewClaimData, setReviewClaimData] = useState(null);
  const [reviewedDonations, setReviewedDonations] = useState(new Set());
  const [ratedDonations, setRatedDonations] = useState(new Set());

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadClaims();
      }
    }, [user]),
  );

  const loadClaims = async () => {
    if (!user) return;
    try {
      const claimedDonations = await getClaimedDonations(user.uid);
      logger.info('Loaded claims:', claimedDonations);

      const validClaims = claimedDonations.filter((claim) => claim && claim.id);
      setClaims(validClaims);

      const reviewed = new Set();
      const rated = new Set();
      for (const claim of validClaims) {
        const hasReviewed = await hasUserReviewedDonation(user.uid, claim.id);
        if (hasReviewed) {
          reviewed.add(claim.id);
        }

        const hasRated = await hasUserRatedDonation(user.uid, claim.id);
        if (hasRated) {
          rated.add(claim.id);
        }
      }
      setReviewedDonations(reviewed);
      setRatedDonations(rated);
    } catch (error) {
      logger.error('Error loading claims:', error);
      showError('Failed to load your claims. Please try again.');
    }
  };

  const handleViewQR = (claim) => {
    const qrData = JSON.stringify({
      donationId: claim.id,
      itemName: claim.itemName,
      claimant: userProfile?.name || user?.displayName || 'User',
      claimantEmail: userProfile?.email || user?.email,
      claimDate: claim.claimedAt?.toISOString() || new Date().toISOString(),
    });

    setSelectedClaim({ ...claim, qrData });
    setQrModalVisible(true);
  };

  const handleMarkPickedUp = async (claim) => {
    Alert.alert('Mark as Picked Up', 'Have you collected this donation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Picked Up',
        onPress: async () => {
          try {
            await markDonationAsPickedUp(claim.id, user.uid);
            showSuccess('Donation marked as picked up!');
            loadClaims(); // Reload to update the list
          } catch (error) {
            logger.error('Error marking as picked up:', error);
            showError(error.message || 'Failed to update status. Please try again.');
          }
        },
      },
    ]);
  };

  const handleCancelClaim = async (claim) => {
    const doCancel = async () => {
      try {
        await cancelClaim(claim.id, user.uid);
        showSuccess('Your claim has been cancelled. The donation is now available to others.');
        loadClaims();
      } catch (error) {
        logger.error('Error cancelling claim:', error);
        showError(error.message || 'Failed to cancel claim. Please try again.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' && window.confirm(
        'Cancel Claim?\n\nAre you sure you want to cancel this claim? The donation will become available to others on a first-come-first-serve basis.'
      );
      if (confirmed) doCancel();
      return;
    }

    Alert.alert(
      'Cancel Claim',
      'Are you sure you want to cancel this claim? The donation will become available to others on a first-come-first-serve basis.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: doCancel,
        },
      ],
    );
  };

  const handleChat = (claim) => {
    navigation.navigate('Chat', {
      donation: {
        ...claim,
        createdAt:
          claim.createdAt instanceof Date ? claim.createdAt.toISOString() : claim.createdAt,
        updatedAt:
          claim.updatedAt instanceof Date ? claim.updatedAt.toISOString() : claim.updatedAt,
        expiryDate:
          claim.expiryDate instanceof Date ? claim.expiryDate.toISOString() : claim.expiryDate,
      },
      recipientName: claim.donorName || 'Donor',
      recipientId: claim.userId || claim.donorId,
    });
  };

  const handleRateDonor = (claim) => {
    setRatingClaimData({
      donation: claim,
      ratedUser: {
        id: claim.userId || claim.donorId,
        name: claim.donorName || 'Donor',
      },
    });
    setRatingModalVisible(true);
  };

  const handleRatingSubmitted = () => {
    if (ratingClaimData && ratingClaimData.donation) {
      setRatedDonations((prev) => new Set([...prev, ratingClaimData.donation.id]));
    }
    loadClaims();
  };

  const handleLeaveReview = (claim) => {
    setReviewClaimData(claim);
    setReviewModalVisible(true);
  };

  const handleReviewSubmitted = () => {
    setReviewedDonations((prev) => new Set([...prev, reviewClaimData.id]));
    loadClaims();
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
    if (!item) return null;

    const imageUri = item.imageUrl || item.image;
    const itemName = item.itemName || 'Unknown Item';
    const location = item.location?.address || item.location || 'Location not available';
    const quantity = item.quantity || 'N/A';
    const status = item.status || 'claimed';
    const claimedAt = item.claimedAt || new Date();

    const handleOpenClaim = () => {
      navigation.navigate('DonationDetails', {
        donation: toSerializableDonation(item),
      });
    };

    return (
      <TouchableOpacity
        style={[styles.claimCard, { backgroundColor: theme.colors.surface }]}
        onPress={handleOpenClaim}
        activeOpacity={0.7}
      >
        <View style={styles.claimHeader}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.claimImage} />
          ) : (
            <View
              style={[
                styles.claimImage,
                styles.placeholderImage,
                { backgroundColor: theme.colors.primary + '20' },
              ]}
            >
              <Icon name="restaurant" size={32} color={theme.colors.primary} />
            </View>
          )}
          <View style={styles.claimInfo}>
            <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={1}>
              {itemName}
            </Text>
            <View style={styles.locationRow}>
              <Icon name="location-on" size={14} color={theme.colors.textSecondary} />
              <Text
                style={[styles.location, { color: theme.colors.textSecondary }]}
                numberOfLines={1}
              >
                {location}
              </Text>
            </View>
            <Text style={[styles.quantity, { color: theme.colors.textSecondary }]}>{quantity}</Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
            {getStatusText(status)}
          </Text>
        </View>

        <Text style={[styles.claimedAt, { color: theme.colors.textSecondary }]}>
          Claimed {claimedAt.toLocaleDateString()} at{' '}
          {claimedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>

        {(item.status === 'pending' || item.status === 'claimed') && item.claimedBy === user?.uid && (
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
              <Text style={[styles.actionButtonText, { color: theme.colors.surface }]}>Chat</Text>
            </TouchableOpacity>

            {item.status !== 'picked_up' && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#66BB6A' }]}
                  onPress={() => handleMarkPickedUp(item)}
                >
                  <Icon name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Picked Up</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#EF5350' }]}
                  onPress={() => handleCancelClaim(item)}
                >
                  <Icon name="cancel" size={20} color="#FFFFFF" />
                  <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Cancel Claim</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {(item.status === 'claimed' || item.status === 'picked_up') && (
          <View style={styles.actionButtons}>
            {!ratedDonations.has(item.id) && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: '#FFC107',
                    flex: reviewedDonations.has(item.id) ? 1 : 0.48,
                  },
                ]}
                onPress={() => handleRateDonor(item)}
              >
                <Icon name="star" size={20} color="#FFFFFF" />
                <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Rate Donor</Text>
              </TouchableOpacity>
            )}

            {ratedDonations.has(item.id) && (
              <View
                style={[
                  styles.ratedBadge,
                  {
                    backgroundColor: '#FFC107',
                    flex: reviewedDonations.has(item.id) ? 1 : 0.48,
                  },
                ]}
              >
                <Icon name="check-circle" size={20} color="#FFFFFF" />
                <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Rated</Text>
              </View>
            )}

            {!reviewedDonations.has(item.id) && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: theme.colors.primary,
                    flex: ratedDonations.has(item.id) ? 1 : 0.48,
                  },
                ]}
                onPress={() => handleLeaveReview(item)}
              >
                <Icon name="rate-review" size={20} color="#FFFFFF" />
                <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Leave Review</Text>
              </TouchableOpacity>
            )}

            {reviewedDonations.has(item.id) && (
              <View
                style={[
                  styles.reviewedBadge,
                  {
                    backgroundColor: theme.colors.success,
                    flex: ratedDonations.has(item.id) ? 1 : 0.48,
                  },
                ]}
              >
                <Icon name="check-circle" size={20} color="#FFFFFF" />
                <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Reviewed</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="inventory" size={64} color={theme.colors.border} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Claims Yet</Text>
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
            <TouchableOpacity style={styles.closeButton} onPress={() => setQrModalVisible(false)}>
              <Icon name="close" size={28} color={theme.colors.text} />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.qrScrollContent}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Pickup QR Code</Text>

              {selectedClaim && (
                <>
                  <View style={styles.qrContainer}>
                    <QRCode value={selectedClaim.qrData} size={250} backgroundColor="white" />
                  </View>

                  <View style={styles.qrInfoContainer}>
                    <Text style={[styles.qrInfoTitle, { color: theme.colors.text }]}>
                      {selectedClaim.itemName}
                    </Text>
                    <Text style={[styles.qrInfoText, { color: theme.colors.textSecondary }]}>
                      Show this QR code to the donor when picking up
                    </Text>

                    <View style={styles.pickupDetails}>
                      <Icon name="access-time" size={20} color={theme.colors.primary} />
                      <Text style={[styles.pickupText, { color: theme.colors.text }]}>
                        Pickup:{' '}
                        {selectedClaim.pickupTimeStart ||
                          selectedClaim.pickupTime?.start ||
                          'Time available'}
                      </Text>
                    </View>

                    <View style={styles.pickupDetails}>
                      <Icon name="location-on" size={20} color={theme.colors.primary} />
                      <Text style={[styles.pickupText, { color: theme.colors.text }]}>
                        {selectedClaim.location?.address ||
                          selectedClaim.location ||
                          'Location available'}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {ratingClaimData && (
        <RatingModal
          visible={ratingModalVisible}
          onClose={() => {
            setRatingModalVisible(false);
            setRatingClaimData(null);
          }}
          donation={ratingClaimData.donation}
          ratedUser={ratingClaimData.ratedUser}
          raterUserId={user.uid}
          type="donor"
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}

      <ReviewModal
        visible={reviewModalVisible}
        onClose={() => {
          setReviewModalVisible(false);
          setReviewClaimData(null);
        }}
        claim={reviewClaimData}
        onReviewSubmitted={handleReviewSubmitted}
      />
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
  reviewedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    flex: 1,
  },
  ratedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    flex: 1,
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
