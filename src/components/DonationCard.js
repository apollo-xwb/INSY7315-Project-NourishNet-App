/**
 * DonationCard
 *
 * Purpose: Visualizes a donation with image, status, location, optional
 * distance, and context actions (chat/claim/rate).
 */

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from '../utils/IconWrapper';
import { Card, Badge, Button } from './ui';
import { formatDistance } from '../utils/location';

/**
 * DonationCard Component
 *
 * @param {Object} props - Component props
 * @param {Object} props.donation - Donation object
 * @param {Function} props.onPress - Handler when card is pressed
 * @param {string} props.variant - Card variant: 'default', 'compact', 'detailed'
 * @param {boolean} props.showDistance - Whether to show distance (requires userLocation)
 * @param {Object} props.userLocation - User's location for distance calculation
 * @param {boolean} props.showClaimButton - Whether to show claim button
 * @param {Function} props.onClaim - Handler for claim button
 * @param {boolean} props.showChatButton - Whether to show chat button
 * @param {Function} props.onChat - Handler for chat button
 * @param {boolean} props.showRatingButton - Whether to show rating button
 * @param {Function} props.onRate - Handler for rating button
 * @param {Object} props.style - Additional custom styles
 *
 * @returns {React.Component} Donation card component
 */
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

  /**
   * Calculate distance if user location is provided
   * Uses Haversine formula from location utils
   */
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

  /**
   * Format time ago from timestamp
   * Converts absolute time to relative time for better UX
   *
   * UX Pattern: Relative Time
   * - "2 hours ago" is more intuitive than "14:32"
   * - Reference: "Designing Interfaces" by Jenifer Tidwell
   */
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

  /**
   * Get status badge variant based on donation status
   * Visual coding: Different colors represent different states
   *
   * Color Psychology in UI:
   * - Green (success): Available, positive
   * - Orange (warning): Reserved, pending action
   * - Red (error): Claimed, unavailable
   *
   * Reference: "The Principles of Beautiful Web Design" by Jason Beaird
   */
  const getStatusVariant = () => {
    const statusMap = {
      available: 'success',
      reserved: 'warning',
      claimed: 'error',
      picked_up: 'default',
    };
    return statusMap[donation.status] || 'default';
  };

  /**
   * Get the primary image from donation
   * Handles both single image (legacy) and multiple images (new)
   *
   * Backward Compatibility Pattern:
   * - Supports old data structure (image string)
   * - Supports new data structure (images array)
   */
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

  /**
   * Render compact variant
   * Used in lists where space is limited
   */
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

  /**
   * Render default/detailed variant
   * Full card with all information and actions
   */
  return (
    <Card onPress={onPress} variant="elevated" elevation={2} style={[styles.card, style]}>
      {/* Donation Image */}
      {primaryImage && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: primaryImage }} style={styles.image} resizeMode="cover" />
          {/* Multiple images indicator */}
          {donation.images && donation.images.length > 1 && (
            <View style={[styles.imageCountBadge, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
              <Icon name="photo-library" size={16} color="#FFF" />
              <Text style={styles.imageCountText}>{donation.images.length}</Text>
            </View>
          )}
          {/* Status badge overlay */}
          <View style={styles.statusBadgeContainer}>
            <Badge variant={getStatusVariant()} size="small">
              {donation.status || 'available'}
            </Badge>
          </View>
        </View>
      )}

      {/* Donation Information */}
      <View style={styles.content}>
        {/* Title and Category */}
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

        {/* Location */}
        <View style={styles.infoRow}>
          <Icon name="location-on" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {donation.location?.address || 'Unknown location'}
          </Text>
        </View>

        {/* Distance (if available) */}
        {distance && (
          <View style={styles.infoRow}>
            <Icon name="near-me" size={16} color={theme.colors.primary} />
            <Text style={[styles.infoText, { color: theme.colors.primary }]}>{distance} away</Text>
          </View>
        )}

        {/* Time Posted */}
        {donation.createdAt && (
          <View style={styles.infoRow}>
            <Icon name="schedule" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              {getTimeAgo(donation.createdAt)}
            </Text>
          </View>
        )}

        {/* Description */}
        {donation.description && variant === 'detailed' && (
          <Text
            style={[styles.description, { color: theme.colors.textSecondary }]}
            numberOfLines={3}
          >
            {donation.description}
          </Text>
        )}

        {/* Action Buttons */}
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

/**
 * StyleSheet for DonationCard
 * Follows Material Design card specifications
 */
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
