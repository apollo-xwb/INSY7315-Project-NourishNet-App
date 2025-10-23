import React, { useState } from 'react';
import {
import logger from '../utils/logger';

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
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Icon from '../utils/IconWrapper';
import MapComponent from '../components/MapComponent';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { updateDonationStatus } from '../services/donationService';
import { createAlert } from '../services/alertsService';

const { width } = Dimensions.get('window');

const DonationDetailsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user, userProfile } = useAuth();
  const { donation } = route.params;
  const [isClaimed, setIsClaimed] = useState(donation.status === 'claimed');
  const [showQRCode, setShowQRCode] = useState(false);

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

  const handleClaim = async () => {
    Alert.alert(
      'Claim Donation',
      'Are you sure you want to claim this donation? You will need to pick it up within the specified time.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Claim',
          onPress: async () => {
            try {

              await updateDonationStatus(donation.id, 'claimed', user.uid);


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

              Alert.alert(
                'Success!',
                'Donation claimed successfully. You can view your claim in Donation History.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              logger.error('Error claiming donation:', error);
              Alert.alert(
                'Error',
                'Failed to claim donation. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const handleChat = () => {
    navigation.navigate('Chat', {
      donation: donation,
      recipientName: donation.donorName,
      recipientId: donation.donorId || 'donor123'
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

  const handleReport = () => {
    Alert.alert(
      'Report Donation',
      'Why are you reporting this donation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Inappropriate content', onPress: () => reportDonation('inappropriate') },
        { text: 'Fake listing', onPress: () => reportDonation('fake') },
        { text: 'Other', onPress: () => reportDonation('other') },
      ]
    );
  };

  const reportDonation = (reason) => {

    Alert.alert('Reported', 'Thank you for your report. We will review it shortly.');
  };

  const expiryStatus = getExpiryStatus(donation.expiryDate);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {}
      <View style={styles.imageSection}>
        {(donation.imageUrl || donation.image) ? (
          <Image source={{ uri: donation.imageUrl || donation.image }} style={styles.donationImage} />
        ) : (
          <View style={[styles.donationImage, { backgroundColor: theme.colors.border, justifyContent: 'center', alignItems: 'center' }]}>
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
          <Text style={[styles.itemName, { color: theme.colors.text }]}>
            {donation.itemName}
          </Text>
          <Text style={[styles.donorName, { color: theme.colors.textSecondary }]}>
            by {donation.donorName}
          </Text>
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
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Description
          </Text>
          <Text style={[styles.description, { color: theme.colors.text }]}>
            {donation.description}
          </Text>
        </View>

        {}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Details
          </Text>

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
              {donation.pickupTime ? `${donation.pickupTime.start} - ${donation.pickupTime.end}` : `${donation.pickupTimeStart || '09:00'} - ${donation.pickupTimeEnd || '17:00'}`}
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
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Location
          </Text>
          <MapComponent
            style={styles.map}
            region={{
              latitude: donation.location?.latitude || -26.2041,
              longitude: donation.location?.longitude || 28.0473,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            markers={[{
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
            }]}
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

        {}
        <View style={styles.actionButtons}>
          {!isClaimed ? (
            <TouchableOpacity
              style={[styles.claimButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleClaim}
              accessibilityLabel={t('claim')}
              accessibilityRole="button"
            >
              <Icon name="shopping-cart" size={20} color={theme.colors.surface} />
              <Text style={[styles.claimButtonText, { color: theme.colors.surface }]}>
                {t('claim')}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.claimedButton, { backgroundColor: theme.colors.success }]}>
              <Icon name="check-circle" size={20} color={theme.colors.surface} />
              <Text style={[styles.claimedButtonText, { color: theme.colors.surface }]}>
                {t('reserved')}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.chatButton, { borderColor: theme.colors.primary }]}
            onPress={handleChat}
            accessibilityLabel={t('chat')}
            accessibilityRole="button"
          >
            <Icon name="chat" size={20} color={theme.colors.primary} />
            <Text style={[styles.chatButtonText, { color: theme.colors.primary }]}>
              {t('chat')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  donorName: {
    fontSize: 16,
    marginBottom: 12,
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
});

export default DonationDetailsScreen;
