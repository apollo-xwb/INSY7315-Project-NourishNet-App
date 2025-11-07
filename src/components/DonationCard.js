import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from '../utils/IconWrapper';
import { Card, Badge, Button } from './ui';
import { formatDistance } from '../utils/location';

const DonationCard = ({
  donation,
  onPress,
  variant = 'default',
  showDistance = false,
  userLocation = null,
  showClaimButton = false,
  onClaim,
  showChatButton = false,
  onChat,
  showRatingButton = false,
  onRate,
  style,
}) => {
  const { theme } = useTheme();

  const getDistance = () => {
    if (!showDistance || !userLocation || !donation.location) {
      return null;
    }

    const { calculateDistance } = require('../utils/location');
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      donation.location.latitude,
      donation.location.longitude,
    );

    return formatDistance(distance);
  };

  const getTimeAgo = (date) => {
    if (!date) return '';

    const now = new Date();
    const diffMs = now - (date.toDate ? date.toDate() : new Date(date));
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toDate ? date.toDate().toLocaleDateString() : new Date(date).toLocaleDateString();
  };

  const getStatusVariant = () => {
    const statusMap = {
      available: 'success',
      reserved: 'warning',
      claimed: 'error',
      picked_up: 'default',
    };
    return statusMap[donation.status] || 'default';
  };

  const getPrimaryImage = () => {
    if (donation.images && donation.images.length > 0) {
      return donation.images[0];
    }
    if (donation.image) {
      return donation.image;
    }
    return null;
  };

  const distance = getDistance();
  const primaryImage = getPrimaryImage();

  if (variant === 'compact') {
    return (
      <Card onPress={onPress} style={[styles.compactCard, style]}>
        <View style={styles.compactContent}>
          {primaryImage && (
            <Image source={{ uri: primaryImage }} style={styles.compactImage} resizeMode="cover" />
          )}
          <View style={styles.compactInfo}>
            <Text style={[styles.compactTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {donation.itemName || donation.donationName || 'Unknown Item'}
            </Text>
            <Text
              style={[styles.compactLocation, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              📍 {donation.location?.address || 'Unknown location'}
            </Text>
          </View>
          {distance && (
            <Badge variant="primary" size="small">
              {distance}
            </Badge>
          )}
        </View>
      </Card>
    );
  }

  return (
    <Card onPress={onPress} variant="elevated" elevation={2} style={[styles.card, style]}>
      {primaryImage && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: primaryImage }} style={styles.image} resizeMode="cover" />
          {donation.images && donation.images.length > 1 && (
            <View style={[styles.imageCountBadge, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
              <Icon name="photo-library" size={16} color="#FFF" />
              <Text style={styles.imageCountText}>{donation.images.length}</Text>
            </View>
          )}
          <View style={styles.statusBadgeContainer}>
            <Badge variant={getStatusVariant()} size="small">
              {donation.status || 'available'}
            </Badge>
          </View>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
            {donation.itemName || donation.donationName || 'Unknown Item'}
          </Text>
          {donation.category && (
            <Badge variant="default" size="small">
              {donation.category}
            </Badge>
          )}
        </View>

        <View style={styles.infoRow}>
          <Icon name="location-on" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {donation.location?.address || 'Unknown location'}
          </Text>
        </View>

        {distance && (
          <View style={styles.infoRow}>
            <Icon name="near-me" size={16} color={theme.colors.primary} />
            <Text style={[styles.infoText, { color: theme.colors.primary }]}>{distance} away</Text>
          </View>
        )}

        {donation.createdAt && (
          <View style={styles.infoRow}>
            <Icon name="schedule" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              {getTimeAgo(donation.createdAt)}
            </Text>
          </View>
        )}

        {donation.description && variant === 'detailed' && (
          <Text
            style={[styles.description, { color: theme.colors.textSecondary }]}
            numberOfLines={3}
          >
            {donation.description}
          </Text>
        )}

        {(showClaimButton || showChatButton || showRatingButton) && (
          <View style={styles.actions}>
            {showChatButton && onChat && (
              <Button
                variant="outline"
                size="small"
                icon="chat"
                onPress={(e) => {
                  e.stopPropagation();
                  onChat();
                }}
                style={styles.actionButton}
              >
                Chat
              </Button>
            )}
            {showClaimButton && onClaim && donation.status === 'available' && (
              <Button
                variant="primary"
                size="small"
                icon="check-circle"
                onPress={(e) => {
                  e.stopPropagation();
                  onClaim();
                }}
                style={styles.actionButton}
              >
                Claim
              </Button>
            )}
            {showRatingButton && onRate && (
              <Button
                variant="primary"
                size="small"
                icon="star"
                onPress={(e) => {
                  e.stopPropagation();
                  onRate();
                }}
                style={styles.actionButton}
              >
                Rate
              </Button>
            )}
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  compactCard: {
    padding: 12,
    marginBottom: 8,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  compactLocation: {
    fontSize: 14,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  imageCountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadgeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
});

export default DonationCard;
