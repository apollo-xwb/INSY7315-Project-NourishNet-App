import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Share,
  Modal,
  Linking,
  Platform,
  SafeAreaView,
} from 'react-native';
import { getMaxWidth, getPadding, isDesktop } from '../utils/responsive';
import logger from '../utils/logger';
import QRCode from 'react-native-qrcode-svg';
import Icon from '../utils/IconWrapper';
import MapComponent from '../components/MapComponent';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { updateDonationStatus, markDonationAsPickedUp, cancelClaim } from '../services/donationService';
import { claimDonation } from '../services/firestoreService';
import { createAlert } from '../services/alertsService';
import { useToast } from '../contexts/AlertContext';
import { getUserRatingStats } from '../services/ratingService';

const { width } = Dimensions.get('window');

const DonationDetailsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user, userProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  const rawDonation = route.params?.donation || {};
  const donation = {
    ...rawDonation,
    expiryDate: typeof rawDonation.expiryDate === 'string' ? new Date(rawDonation.expiryDate) : rawDonation.expiryDate,
    createdAt: typeof rawDonation.createdAt === 'string' ? new Date(rawDonation.createdAt) : rawDonation.createdAt,
    updatedAt: typeof rawDonation.updatedAt === 'string' ? new Date(rawDonation.updatedAt) : rawDonation.updatedAt,
    claimedAt: typeof rawDonation.claimedAt === 'string' ? new Date(rawDonation.claimedAt) : rawDonation.claimedAt,
    pickedUpAt: typeof rawDonation.pickedUpAt === 'string' ? new Date(rawDonation.pickedUpAt) : rawDonation.pickedUpAt,
  };
  const [isClaimed, setIsClaimed] = useState(donation.status === 'claimed');
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [donorRating, setDonorRating] = useState({ averageRating: 0, totalRatings: 0 });

  const donationImages = donation.images || (donation.imageUrl ? [donation.imageUrl] : []);

  useEffect(() => {
    const loadDonorRating = async () => {
      if (donation.userId) {
        try {
          const stats = await getUserRatingStats(donation.userId);
          setDonorRating(stats);
        } catch (error) {
          logger.error('Error loading donor rating:', error);
        }
      }
    };
    loadDonorRating();
  }, [donation.userId]);

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'Expired', color: theme.colors.error };
    if (diffDays <= 1) return { status: 'Expires today', color: theme.colors.warning };
    if (diffDays <= 3) return { status: `${diffDays} days left`, color: theme.colors.warning };
    return { status: `${diffDays} days left`, color: theme.colors.success };
  };

  const handleMarkPickedUp = async () => {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' && window.confirm('Have you collected this donation?');
      if (!confirmed) return;
      try {
        await markDonationAsPickedUp(donation.id, user.uid);
        donation.status = 'picked_up';
        donation.pickedUpAt = new Date();
        setIsClaimed(true);
        showSuccess('Donation marked as picked up! You can now rate and review the donor.');
      } catch (error) {
        logger.error('Error marking as picked up:', error);
        showError(error.message || 'Failed to update status. Please try again.');
      }
      return;
    }

    Alert.alert('Mark as Picked Up', 'Have you collected this donation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Picked Up',
        onPress: async () => {
          try {
            await markDonationAsPickedUp(donation.id, user.uid);
            donation.status = 'picked_up';
            donation.pickedUpAt = new Date();
            setIsClaimed(true);
            showSuccess('Donation marked as picked up! You can now rate and review the donor.');
          } catch (error) {
            logger.error('Error marking as picked up:', error);
            showError(error.message || 'Failed to update status. Please try again.');
          }
        },
      },
    ]);
  };

  const handleCancelClaim = async () => {
    const doCancel = async () => {
      try {
        await cancelClaim(donation.id, user.uid);
        donation.status = 'available';
        donation.claimedBy = null;
        setIsClaimed(false);
        showSuccess('Your claim has been cancelled. The donation is now available to others on a first-come-first-serve basis.');
      } catch (error) {
        logger.error('Error cancelling claim:', error);
        showError(error.message || 'Failed to cancel claim. Please try again.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' && window.confirm(
        'Cancel Claim?\n\nAre you sure you want to cancel this claim? The donation will become available to others on a first-come-first-serve basis. Please chat with the donor to confirm availability.'
      );
      if (confirmed) doCancel();
      return;
    }

    Alert.alert(
      'Cancel Claim',
      'Are you sure you want to cancel this claim? The donation will become available to others on a first-come-first-serve basis. Please chat with the donor to confirm availability.',
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

  const handleClaim = async () => {
    if (donation?.status === 'picked_up') {
      showError && showError('This donation has already been picked up.');
      return;
    }
    if (!user) {
      if (Platform.OS === 'web') {
        typeof window !== 'undefined' && window.alert('You must be logged in to claim a donation.');
        return;
      }
      Alert.alert('Error', 'You must be logged in to claim a donation.');
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' && window.confirm(
        'Claim Donation?\n\nNote: Donations are first-come-first-serve. Multiple people may claim, so please chat with the donor to confirm availability. You will need to pick it up within the specified time.'
      );
      if (!confirmed) return;
          try {
            logger.info('Claiming donation (web):', donation.id);
            await claimDonation(donation.id, user.uid, {});
        setIsClaimed(true);
        setShowQRCode(true);
        try {
          await createAlert(user.uid, {
            type: 'success',
            title: 'Donation Claimed',
            message: `You've successfully claimed "${donation.itemName}". Don't forget to pick it up!`,
            donationId: donation.id,
          });
        } catch (alertError) {
          logger.error('Error creating claim alert:', alertError);
        }
        if (donation.userId) {
          try {
            await createAlert(donation.userId, {
              type: 'info',
              title: 'Donation Claimed',
              message: `Your donation "${donation.itemName}" has been claimed by ${userProfile?.name || 'a recipient'}.`,
              donationId: donation.id,
            });
          } catch (alertError) {
            logger.error('Error creating donor alert:', alertError);
          }
        }
        donation.status = 'claimed';
        donation.claimedBy = user.uid;
        donation.claimantName = userProfile?.name || user?.displayName || 'User';
        donation.claimedAt = new Date();
        showSuccess('Donation claimed successfully! You can now chat with the donor.');
      } catch (error) {
        logger.error('Error claiming donation:', error);
        showError('Failed to claim donation. Please try again.');
      }
      return;
    }

    Alert.alert(
      'Claim Donation',
      'Note: Donations are first-come-first-serve. Multiple people may claim, so please chat with the donor to confirm availability.\n\nAre you sure you want to claim this donation? You will need to pick it up within the specified time.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Claim',
          onPress: async () => {
            try {
              logger.info('Claiming donation:', donation.id);
              await claimDonation(donation.id, user.uid, {});

              const qrData = JSON.stringify({
                donationId: donation.id,
                itemName: donation.itemName,
                claimant: userProfile?.name || user?.displayName || 'User',
                claimantEmail: userProfile?.email || user?.email,
                claimDate: new Date().toISOString(),
              });

              setIsClaimed(true);
              setShowQRCode(true);

              try {
                await createAlert(user.uid, {
                  type: 'success',
                  title: 'Donation Claimed',
                  message: `You've successfully claimed "${donation.itemName}". Don't forget to pick it up!`,
                  donationId: donation.id,
                });
              } catch (alertError) {
                logger.error('Error creating claim alert:', alertError);
              }

              if (donation.userId) {
                try {
                  await createAlert(donation.userId, {
                    type: 'info',
                    title: 'Donation Claimed',
                    message: `Your donation "${donation.itemName}" has been claimed by ${userProfile?.name || 'a recipient'}.`,
                    donationId: donation.id,
                  });
                } catch (alertError) {
                  logger.error('Error creating donor alert:', alertError);
                }
              }

              donation.status = 'claimed';
              donation.claimedBy = user.uid;
              donation.claimantName = userProfile?.name || user?.displayName || 'User';
              donation.claimedAt = new Date();

              showSuccess('Donation claimed successfully! You can now chat with the donor.');
            } catch (error) {
              logger.error('Error claiming donation:', error);
              showError('Failed to claim donation. Please try again.');
            }
          },
        },
      ],
    );
  };

  const handleChat = () => {
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
      recipientName: donation.donorName,
      recipientId: donation.donorId || 'donor123',
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this donation on NourishNet: ${donation.itemName} - ${donation.description}`,
        title: 'NourishNet Donation',
      });
    } catch (error) {
      logger.error('Error sharing:', error);
    }
  };

  const handleGetDirections = () => {
    const location = donation.location;
    const latitude = location?.latitude || location?.lat;
    const longitude = location?.longitude || location?.lng;
    const address = location?.address;

    if (!latitude || !longitude) {
      showError('Location coordinates not available');
      return;
    }

    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${latitude},${longitude}`;
    const label = address || 'Donation Pickup Location';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
      web: `https://www.google.com/maps/search/?api=1&query=${latLng}`,
    });

    Linking.openURL(url).catch((err) => {
      logger.error('Error opening maps:', err);
      showError('Could not open maps application');
    });
  };

  const handleReport = () => {
    Alert.alert('Report Donation', 'Why are you reporting this donation?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Inappropriate content', onPress: () => reportDonation('inappropriate') },
      { text: 'Fake listing', onPress: () => reportDonation('fake') },
      { text: 'Other', onPress: () => reportDonation('other') },
    ]);
  };

  const reportDonation = (reason) => {
    Alert.alert('Reported', 'Thank you for your report. We will review it shortly.');
  };

  const expiryStatus = getExpiryStatus(donation.expiryDate);

  return (
    <SafeAreaView
      style={[
        { flex: 1, backgroundColor: theme.colors.background },
        Platform.OS === 'web' ? { height: '100vh' } : {},
      ]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          minHeight: '100%',
          maxWidth: Platform.OS === 'web' ? 1200 : getMaxWidth(),
          alignSelf: 'center',
          width: '100%',
          paddingHorizontal: getPadding(),
          paddingBottom: 160, // leave space for sticky footer
        }}
        keyboardShouldPersistTaps="handled"
      >
        {}
        <View style={styles.imageSection}>
          {donationImages.length > 0 ? (
            <>
              <TouchableOpacity
                onPress={() => {
                  setSelectedImageIndex(0);
                  setShowImageViewer(true);
                }}
                activeOpacity={0.9}
              >
                <Image source={{ uri: donationImages[0] }} style={styles.donationImage} />
              </TouchableOpacity>

              {donationImages.length > 1 && (
                <View style={styles.imageGallery}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.thumbnailScroll}
                  >
                    {donationImages.map((img, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          setSelectedImageIndex(index);
                          setShowImageViewer(true);
                        }}
                        style={styles.thumbnailContainer}
                      >
                        <Image source={{ uri: img }} style={styles.thumbnail} />
                        {index === 0 && (
                          <View style={[styles.mainBadge, { backgroundColor: theme.colors.primary }]}>
                            <Text style={[styles.mainBadgeText, { color: theme.colors.surface }]}>
                              Main
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <View style={[styles.imageCounter, { backgroundColor: theme.colors.surface }]}>
                    <Icon name="image" size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.imageCounterText, { color: theme.colors.textSecondary }]}>
                      {donationImages.length}
                    </Text>
                  </View>
                </View>
              )}
            </>
          ) : (
            <View
              style={[
                styles.donationImage,
                {
                  backgroundColor: theme.colors.border,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
            >
              <Icon name="image" size={80} color={theme.colors.textSecondary} />
            </View>
          )}
          <TouchableOpacity
            style={[styles.shareButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleShare}
            accessibilityLabel="Share donation"
          >
            <Icon name="share" size={20} color={theme.colors.surface} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.reportButton, { backgroundColor: theme.colors.error }]}
            onPress={handleReport}
            accessibilityLabel="Report donation"
          >
            <Icon name="flag" size={20} color={theme.colors.surface} />
          </TouchableOpacity>
        </View>

        {}
        <View style={styles.content}>
          {}
          <View style={[styles.headerCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.itemName, { color: theme.colors.text }]}>{donation.itemName}</Text>
            <View style={styles.donorInfoContainer}>
              <Text style={[styles.donorName, { color: theme.colors.textSecondary }]}>
                by {donation.donorName}
              </Text>
              {donorRating.totalRatings > 0 && (
                <View style={styles.ratingContainer}>
                  <View style={styles.starRatingContainer}>
                    <Icon name="star" size={16} color="#FFC107" />
                    <Text style={[styles.ratingText, { color: theme.colors.text }]}>
                      {donorRating.averageRating.toFixed(1)}
                    </Text>
                  </View>
                  <Text style={[styles.ratingCount, { color: theme.colors.textSecondary }]}>
                    ({donorRating.totalRatings} {donorRating.totalRatings === 1 ? 'rating' : 'ratings'})
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: expiryStatus.color }]}>
                <Text style={[styles.statusText, { color: theme.colors.surface }]}>
                  {expiryStatus.status}
                </Text>
              </View>
              <View style={[styles.quantityBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.quantityText, { color: theme.colors.surface }]}>
                  {donation.quantity}
                </Text>
              </View>
            </View>
          </View>

          {}
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Description</Text>
            <Text style={[styles.description, { color: theme.colors.text }]}>
              {donation.description}
            </Text>
          </View>

          {}
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Details</Text>

            <View style={styles.detailRow}>
              <Icon name="event" size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Expiry Date:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {donation.expiryDate ? new Date(donation.expiryDate).toLocaleDateString() : 'N/A'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="schedule" size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Pickup Time:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {donation.pickupTime
                  ? `${donation.pickupTime.start} - ${donation.pickupTime.end}`
                  : `${donation.pickupTimeStart || '09:00'} - ${donation.pickupTimeEnd || '17:00'}`}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="location-on" size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Location:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {donation.location?.address || donation.location || 'Location not specified'}
              </Text>
            </View>
          </View>

          {}
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.locationHeader}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Location</Text>
              <TouchableOpacity
                style={[styles.directionsButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleGetDirections}
              >
                <Icon name="directions" size={18} color={theme.colors.surface} />
                <Text style={[styles.directionsText, { color: theme.colors.surface }]}>
                  Get Directions
                </Text>
              </TouchableOpacity>
            </View>
            <MapComponent
              style={[styles.map, Platform.OS === 'web' ? { height: 360 } : null]}
              region={{
                latitude: donation.location?.latitude || -26.2041,
                longitude: donation.location?.longitude || 28.0473,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              markers={[
                {
                  coordinate: {
                    latitude: donation.location?.latitude || -26.2041,
                    longitude: donation.location?.longitude || 28.0473,
                  },
                  title: donation.itemName,
                  description: donation.location?.address || 'Location not available',
                  customMarker: (
                    <View style={[styles.mapMarker, { backgroundColor: theme.colors.primary }]}>
                      <Icon name="restaurant" size={20} color={theme.colors.surface} />
                    </View>
                  ),
                },
              ]}
            />
          </View>

          {}
          {isClaimed && (
            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Pickup Verification
              </Text>
              <View style={styles.qrContainer}>
                <View style={styles.qrCodeWrapper}>
                  <QRCode
                    value={JSON.stringify({
                      donationId: donation.id,
                      claimantId: 'user123',
                      itemName: donation.itemName,
                      timestamp: new Date().toISOString(),
                    })}
                    size={200}
                    color={theme.colors.text}
                    backgroundColor={theme.colors.surface}
                  />
                </View>
              </View>
              <Text style={[styles.qrInstructions, { color: theme.colors.textSecondary }]}>
                Show this QR code to the donor when picking up your donation.
              </Text>
            </View>
          )}

        </View>

        {}
        <Modal
          visible={showImageViewer}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowImageViewer(false)}
        >
          <View style={styles.imageViewerContainer}>
            <TouchableOpacity
              style={styles.closeImageViewer}
              onPress={() => setShowImageViewer(false)}
            >
              <Icon name="close" size={30} color="#FFFFFF" />
            </TouchableOpacity>

            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                setSelectedImageIndex(newIndex);
              }}
              contentOffset={{ x: selectedImageIndex * width, y: 0 }}
            >
              {donationImages.map((img, index) => (
                <View key={index} style={styles.fullImageContainer}>
                  <Image source={{ uri: img }} style={styles.fullImage} resizeMode="contain" />
                </View>
              ))}
            </ScrollView>

            {donationImages.length > 1 && (
              <View style={styles.imageViewerIndicator}>
                <Text style={styles.imageViewerIndicatorText}>
                  {selectedImageIndex + 1} / {donationImages.length}
                </Text>
              </View>
            )}
          </View>
        </Modal>
        <View style={{alignItems:'center',paddingVertical:32}}><Text>End of content</Text></View>
      </ScrollView>

      {/* Sticky footer actions for guaranteed accessibility */}
      <View
        style={[
          {
            position: Platform.OS === 'web' ? 'fixed' : 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: getPadding(),
            paddingTop: 12,
            paddingBottom: 12,
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            style={[styles.chatButton, { flex: 1, backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}
            onPress={() =>
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
                recipientName: donation.donorName || 'Donor',
                recipientId: donation.userId,
              })
            }
            accessibilityLabel="Chat with donor"
            accessibilityRole="button"
          >
            <Icon name="chat" size={20} color={theme.colors.primary} />
            <Text style={[styles.chatButtonText, { color: theme.colors.primary }]}>Chat</Text>
          </TouchableOpacity>

          {donation.status === 'picked_up' ? (
            <View style={[styles.claimedButton, { flex: 1, backgroundColor: theme.colors.border }]}>
              <Icon name="check-circle" size={20} color={theme.colors.surface} />
              <Text style={[styles.claimButtonText, { color: theme.colors.surface }]}>Picked Up</Text>
            </View>
          ) : !isClaimed ? (
            <TouchableOpacity
              style={[styles.claimButton, { flex: 1, backgroundColor: theme.colors.primary }]}
              onPress={handleClaim}
              accessibilityLabel={t('claim')}
              accessibilityRole="button"
            >
              <Icon name="shopping-cart" size={20} color={theme.colors.surface} />
              <Text style={[styles.claimButtonText, { color: theme.colors.surface }]}>
                {t('claim')}
              </Text>
            </TouchableOpacity>
          ) : donation.claimedBy === user?.uid && donation.status !== 'picked_up' ? (
            <TouchableOpacity
              style={[styles.claimButton, { flex: 1, backgroundColor: '#FFC107' }]}
              onPress={handleMarkPickedUp}
              accessibilityLabel="Mark as picked up"
              accessibilityRole="button"
            >
              <Icon name="check-circle" size={20} color={theme.colors.surface} />
              <Text style={[styles.claimButtonText, { color: theme.colors.surface }]}>Mark as Picked Up</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.claimedButton, { flex: 1, backgroundColor: theme.colors.success }]}>
              <Icon name="check-circle" size={20} color={theme.colors.surface} />
              <Text style={[styles.claimedButtonText, { color: theme.colors.surface }]}>
                {donation.status === 'picked_up' ? 'Picked Up' : t('reserved')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageSection: {
    position: 'relative',
  },
  donationImage: {
    width: '100%',
    height: 250,
  },
  shareButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportButton: {
    position: 'absolute',
    top: 16,
    right: 64,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  headerCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  donorInfoContainer: {
    marginBottom: 8,
  },
  donorName: {
    fontSize: 14,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  starRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratingCount: {
    fontSize: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  quantityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  directionsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    marginLeft: 8,
    marginRight: 8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  map: {
    height: 200,
    borderRadius: 8,
  },
  mapMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrCode: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  qrText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  qrSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  qrInstructions: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
    borderWidth: 2,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  claimButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  claimButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  claimedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  claimedButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    gap: 8,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  webMapText: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  imageGallery: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  thumbnailScroll: {
    flexGrow: 0,
  },
  thumbnailContainer: {
    marginRight: 8,
    position: 'relative',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  mainBadge: {
    position: 'absolute',
    top: 2,
    left: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mainBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  imageCounter: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  imageCounterText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
  },
  closeImageViewer: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullImageContainer: {
    width: width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width,
    height: '80%',
  },
  imageViewerIndicator: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  imageViewerIndicatorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default DonationDetailsScreen;
