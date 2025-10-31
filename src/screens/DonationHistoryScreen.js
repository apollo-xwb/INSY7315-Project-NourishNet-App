import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMaxWidth, getPadding, isDesktop } from '../utils/responsive';
import logger from '../utils/logger';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../utils/IconWrapper';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/AlertContext';
import { cancelClaim as cancelClaimService } from '../services/donationService';
import { markClaimPickedUp } from '../services/firestoreService';
import RatingModal from '../components/RatingModal';
import ReviewModal from '../components/ReviewModal';
import { hasUserRatedDonation } from '../services/ratingService';
import { hasUserReviewedDonation } from '../services/reviewService';
import { getUserDonations, deleteDonation as deleteFirestoreDonation, markDonationAsPickedUp } from '../services/donationService';
import { getUserClaims, getDonationById } from '../services/firestoreService';

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

const DonationHistoryScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [myDonations, setMyDonations] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [activeTab, setActiveTab] = useState('donations');
  const [deletingDonationId, setDeletingDonationId] = useState(null);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [ratingClaimData, setRatingClaimData] = useState(null);
  const [reviewClaimData, setReviewClaimData] = useState(null);
  const [ratedDonations, setRatedDonations] = useState(new Set());
  const [reviewedDonations, setReviewedDonations] = useState(new Set());

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadHistory();
      }
    }, [user]),
  );

  const loadHistory = async () => {
    try {
      const donations = await getUserDonations(user.uid);
      const claimsRes = await getUserClaims(user.uid);

      const donationsArray = Array.isArray(donations) ? donations : [];
      const claimsArray = Array.isArray(claimsRes?.data) ? claimsRes.data : [];

      const validDonations = donationsArray.filter((d) => d && typeof d === 'object' && d.id);
      const validClaims = claimsArray.filter((c) => c && typeof c === 'object' && c.id);

      logger.info('Loaded donations:', validDonations.length, 'from', donationsArray.length);
      logger.info('Loaded claims:', validClaims.length, 'from', claimsArray.length);

      if (validDonations.length !== donationsArray.length) {
        logger.warn(
          'Filtered out invalid donations:',
          donationsArray.length - validDonations.length,
        );
      }
      if (validClaims.length !== claimsArray.length) {
        logger.warn('Filtered out invalid claims:', claimsArray.length - validClaims.length);
      }

      setMyDonations(validDonations);
      // expand claim docs with donation details
      const expandedClaims = [];
      for (const c of validClaims) {
        try {
          const dRes = await getDonationById(c.donationId);
          const d = dRes?.data || {};
          expandedClaims.push({
            id: c.donationId,
            claimId: c.id,
            ...d,
            status: c.status || d.status || 'pending',
            claimedAt: c.createdAt || d.claimedAt || new Date(),
          });
        } catch (e) {
          expandedClaims.push({ id: c.donationId, claimId: c.id, status: c.status || 'pending', claimedAt: c.createdAt || new Date() });
        }
      }
      setMyClaims(expandedClaims);

      // Load simple rated/reviewed state (best-effort)
      const rated = new Set();
      const reviewed = new Set();
      for (const c of expandedClaims) {
        try {
          const r = await hasUserRatedDonation(user.uid, c.id);
          if (r) rated.add(c.id);
        } catch (_e) {}
        try {
          const v = await hasUserReviewedDonation(user.uid, c.id);
          if (v) reviewed.add(c.id);
        } catch (_e) {}
      }
      setRatedDonations(rated);
      setReviewedDonations(reviewed);
    } catch (error) {
      logger.error('Error loading history:', error);
      showError('Failed to load donation history.');
      setMyDonations([]);
      setMyClaims([]);
    }
  };

  const handleMarkPickedUp = async (donation) => {
    const doMark = async () => {
      try {
        await markDonationAsPickedUp(donation.id, user.uid);
        showSuccess('Donation marked as picked up!');
        loadHistory();
      } catch (error) {
        logger.error('Error marking donation as picked up:', error);
        showError(error.message || 'Failed to update status. Please try again.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' && window.confirm(
        'Mark as Picked Up?\n\nHas the recipient collected this donation?'
      );
      if (confirmed) doMark();
      return;
    }

    Alert.alert('Mark as Picked Up', 'Has the recipient collected this donation?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes, Picked Up', onPress: doMark },
    ]);
  };

  const handleDeleteDonation = (donation) => {
    if (deletingDonationId === donation.id) return;
    const doDelete = async () => {
      setDeletingDonationId(donation.id);
      try {
        await deleteFirestoreDonation(donation.id);
        showSuccess('Donation deleted.');
        setTimeout(() => { setDeletingDonationId(null); loadHistory(); }, 400);
      } catch (error) {
        logger.error('Error deleting donation:', error);
        showError('Failed to delete donation.');
        setDeletingDonationId(null);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' ? window.confirm('Are you sure you want to delete this donation?') : true;
      if (confirmed) doDelete();
      return;
    }

    Alert.alert('Delete Donation', 'Are you sure you want to delete this donation?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: doDelete },
    ]);
  };

  const handleViewDonation = (donation) => {
    navigation.navigate('DonationDetails', {
      donation: toSerializableDonation(donation),
    });
  };

  const renderDonationItem = ({ item }) => {
    try {
      if (!item) {
        logger.warn('Donation item is null/undefined');
        return null;
      }

      if (typeof item !== 'object') {
        logger.warn('Donation item is not an object:', typeof item);
        return null;
      }

      if (!item.id) {
        logger.warn('Donation item missing id:', JSON.stringify(item));
        return null;
      }

      const imageUri = (item && (item.imageUrl || item.image)) || null;
      const itemName = (item && item.itemName) || 'Unknown Item';
      const location =
        (item && item.location && (item.location.address || item.location)) ||
        'Location not available';
      const quantity = (item && item.quantity) || 'N/A';
      const status = (item && item.status) || 'available';
      const createdAt = (item && (item.createdAt || item.postedDate)) || new Date();

      return (
        <TouchableOpacity
          style={[styles.historyCard, { backgroundColor: theme.colors.surface }]}
          onPress={() => handleViewDonation(item)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.itemImage} />
            ) : (
              <View
                style={[
                  styles.itemImage,
                  styles.placeholderImage,
                  { backgroundColor: theme.colors.primary + '20' },
                ]}
              >
                <Icon name="restaurant" size={28} color={theme.colors.primary} />
              </View>
            )}
            <View style={styles.itemInfo}>
              <View style={styles.itemNameRow}>
                <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={1}>
                  {itemName}
                </Text>
                {(status === 'claimed' || status === 'picked_up') && (
                  <View style={[styles.statusBadge, { backgroundColor: '#FFA726' + '20' }]}>
                    <Text style={[styles.statusText, { color: status === 'claimed' ? '#FFA726' : '#66BB6A' }]}>
                      {status === 'claimed' ? 'Claimed' : 'Picked Up'}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.locationRow}>
                <Icon name="location-on" size={14} color={theme.colors.textSecondary} />
                <Text
                  style={[styles.location, { color: theme.colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {location}
                </Text>
              </View>
              <Text style={[styles.quantity, { color: theme.colors.textSecondary }]}>
                {quantity}
              </Text>
            </View>
          </View>

          <Text style={[styles.postedAt, { color: theme.colors.textSecondary }]}>
            Posted {new Date(createdAt).toLocaleDateString()} at{' '}
            {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => handleViewDonation(item)}
            >
              <Icon name="visibility" size={18} color={theme.colors.surface} />
              <Text style={[styles.actionButtonText, { color: theme.colors.surface }]}>View</Text>
            </TouchableOpacity>

            {status === 'available' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#66BB6A' }]}
                onPress={() => handleMarkPickedUp(item)}
              >
                <Icon name="check-circle" size={18} color="#FFFFFF" />
                <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Mark Picked Up</Text>
              </TouchableOpacity>
            )}

            {status !== 'claimed' && status !== 'picked_up' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#EF5350' }]}
                onPress={() => handleDeleteDonation(item)}
              >
                <Icon name="delete" size={18} color="#FFFFFF" />
                <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      );
    } catch (error) {
      logger.error('Error rendering donation item:', error);
      return null;
    }
  };

  const handleCancelClaimInline = async (item) => {
    try {
      await cancelClaimService(item.id, user.uid);
      showSuccess('Claim cancelled.');
      loadHistory();
    } catch (e) {
      logger.error('Cancel claim failed:', e);
      showError(
        'Unable to cancel. The donor may have already marked this as picked up. Please check with the donor.',
      );
    }
  };

  const handleRecipientPickedUp = async (item) => {
    try {
      const res = await markClaimPickedUp(item.id, user.uid);
      if (!res.success) throw new Error(res.error || 'Failed');
      showSuccess('Marked as picked up. You can now rate and review.');
      loadHistory();
    } catch (e) {
      logger.error('Mark claim picked up failed:', e);
      showError('Could not update claim. Please try again later.');
    }
  };

  const handleRateDonor = (claim) => {
    setRatingClaimData({
      donation: claim,
      ratedUser: { id: claim.donorId || claim.userId, name: claim.donorName || 'Donor' },
      raterUserId: user.uid,
    });
    setRatingModalVisible(true);
  };

  const handleRatingSubmitted = () => {
    if (ratingClaimData && ratingClaimData.donation) {
      setRatedDonations((prev) => new Set([...prev, ratingClaimData.donation.id]));
    }
    setRatingModalVisible(false);
    setRatingClaimData(null);
    loadHistory();
  };

  const handleLeaveReview = (claim) => {
    setReviewClaimData(claim);
    setReviewModalVisible(true);
  };

  const handleReviewSubmitted = () => {
    if (reviewClaimData) {
      setReviewedDonations((prev) => new Set([...prev, reviewClaimData.id]));
    }
    setReviewModalVisible(false);
    setReviewClaimData(null);
    loadHistory();
  };

  const renderClaimItem = ({ item }) => {
    try {
      if (!item) {
        logger.warn('Claim item is null/undefined');
        return null;
      }

      if (typeof item !== 'object') {
        logger.warn('Claim item is not an object:', typeof item);
        return null;
      }

      if (!item.id) {
        logger.warn('Claim item missing id:', JSON.stringify(item));
        return null;
      }

      const imageUri = (item && (item.imageUrl || item.image)) || null;
      const itemName = (item && item.itemName) || 'Unknown Item';
      const location =
        (item && item.location && (item.location.address || item.location)) ||
        'Location not available';
      const status = (item && item.status) || 'claimed';
      const claimedAt = (item && item.claimedAt) || new Date();

      return (
        <TouchableOpacity
          style={[styles.historyCard, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('DonationDetails', { donation: toSerializableDonation(item) })}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.itemImage} />
            ) : (
              <View
                style={[
                  styles.itemImage,
                  styles.placeholderImage,
                  { backgroundColor: theme.colors.primary + '20' },
                ]}
              >
                <Icon name="restaurant" size={28} color={theme.colors.primary} />
              </View>
            )}
            <View style={styles.itemInfo}>
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
              <View
                style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '20' }]}
              >
                <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                  {getStatusText(status)}
                </Text>
              </View>
            </View>
          </View>

          <Text style={[styles.postedAt, { color: theme.colors.textSecondary }]}>Claimed {claimedAt.toLocaleDateString()} at {claimedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('Chat', { donation: toSerializableDonation(item), recipientName: item.donorName || 'Donor', recipientId: item.userId })}
            >
              <Icon name="chat" size={18} color={theme.colors.surface} />
              <Text style={[styles.actionButtonText, { color: theme.colors.surface }]}>Chat</Text>
            </TouchableOpacity>

            {status !== 'picked_up' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#66BB6A' }]}
                onPress={() => handleRecipientPickedUp(item)}
              >
                <Icon name="check-circle" size={18} color="#FFFFFF" />
                <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Picked Up</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#EF5350' }]}
              onPress={() => handleCancelClaimInline(item)}
            >
              <Icon name="cancel" size={18} color="#FFFFFF" />
              <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Cancel</Text>
            </TouchableOpacity>

            {status === 'picked_up' && !ratedDonations.has(item.id) && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#FFC107' }]}
                onPress={() => handleRateDonor(item)}
              >
                <Icon name="star" size={18} color="#FFFFFF" />
                <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Rate</Text>
              </TouchableOpacity>
            )}

            {status === 'picked_up' && !reviewedDonations.has(item.id) && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleLeaveReview(item)}
              >
                <Icon name="rate-review" size={18} color={theme.colors.surface} />
                <Text style={[styles.actionButtonText, { color: theme.colors.surface }]}>Review</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      );
    } catch (error) {
      logger.error('Error rendering claim item:', error);
      return null;
    }
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
        return 'Pending';
      case 'picked_up':
        return 'Picked Up';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon
        name={activeTab === 'donations' ? 'add-circle-outline' : 'inventory'}
        size={64}
        color={theme.colors.border}
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        {activeTab === 'donations' ? 'No Donations Yet' : 'No Claims Yet'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        {activeTab === 'donations'
          ? 'Post your first donation to help your community'
          : 'Claim a donation to see it here'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {}
      <View style={[styles.tabContainer, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'donations' && {
              borderBottomColor: theme.colors.primary,
              borderBottomWidth: 3,
            },
          ]}
          onPress={() => setActiveTab('donations')}
        >
          <Icon
            name="volunteer-activism"
            size={20}
            color={activeTab === 'donations' ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'donations' ? theme.colors.primary : theme.colors.textSecondary,
              },
            ]}
          >
            My Donations ({myDonations.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'claims' && {
              borderBottomColor: theme.colors.primary,
              borderBottomWidth: 3,
            },
          ]}
          onPress={() => setActiveTab('claims')}
        >
          <Icon
            name="inventory"
            size={20}
            color={activeTab === 'claims' ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'claims' ? theme.colors.primary : theme.colors.textSecondary },
            ]}
          >
            My Claims ({myClaims.length})
          </Text>
        </TouchableOpacity>
      </View>

      {}
      <FlatList
        data={activeTab === 'donations' ? myDonations : myClaims}
        keyExtractor={(item, index) => item?.id || `item-${index}`}
        renderItem={activeTab === 'donations' ? renderDonationItem : renderClaimItem}
        contentContainerStyle={
          (activeTab === 'donations' ? myDonations : myClaims).length === 0
            ? styles.emptyList
            : styles.list
        }
        removeClippedSubviews={false}
        ListEmptyComponent={renderEmpty}
      />
      {/* Modals for rating/review */}
      {ratingClaimData && (
        <RatingModal
          visible={ratingModalVisible}
          onClose={() => {
            setRatingModalVisible(false);
            setRatingClaimData(null);
          }}
          donation={ratingClaimData.donation || ratingClaimData}
          ratedUser={ratingClaimData.ratedUser}
          raterUserId={user?.uid}
          type="donor"
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
      {reviewClaimData && (
        <ReviewModal
          visible={reviewModalVisible}
          onClose={() => {
            setReviewModalVisible(false);
            setReviewClaimData(null);
          }}
          claim={reviewClaimData}
          reviewerUserId={user?.uid}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  historyCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    marginLeft: 4,
    flex: 1,
  },
  quantity: {
    fontSize: 13,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  postedAt: {
    fontSize: 12,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
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
});

export default DonationHistoryScreen;
