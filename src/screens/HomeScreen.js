import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import logger from '../utils/logger';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../utils/IconWrapper';
import MapComponent from '../components/MapComponent';
import { Badge } from '../components/ui';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { DONATION_CATEGORIES } from '../constants/categories';
import { useDonations, useFilters, useAlerts } from '../hooks';
import { formatDistance, calculateDistance } from '../utils/location';
import { getColumns, getMaxWidth, getPadding, isMobile } from '../utils/responsive';

function toSerializableDonation(obj) {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(toSerializableDonation);
  if (typeof obj === 'object') {
    const res = {};
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      const v = obj[key];
      // Prevent passing functions, React elements, or undefined
      if (typeof v === 'function' || v === undefined) continue;
      res[key] = toSerializableDonation(v);
    }
    return res;
  }
  return obj;
}

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { userProfile, user } = useAuth();
  // Donations (realtime)
  const { donations } = useDonations({ realtime: true });
  // Filters and search
  const {
    filteredItems: filteredDonations,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filters,
    updateFilters,
    clearFilters,
  } = useFilters(donations, userProfile?.location || null);
  // Alerts (unread count)
  const { unreadCount: unreadAlertsCount } = useAlerts(user?.uid, { autoLoad: true });
  const [showMap, setShowMap] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [region, setRegion] = useState({
    latitude: userProfile?.location?.latitude || -33.9249,
    longitude: userProfile?.location?.longitude || 18.4241,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // useFilters handles filtering; no manual effect needed

  useEffect(() => {
    if (userProfile?.location?.latitude && userProfile?.location?.longitude) {
      setRegion({
        latitude: userProfile.location.latitude,
        longitude: userProfile.location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [userProfile]);

  // Filtering handled by useFilters

  const handleDonationPress = (donation) => {
    navigation.navigate('DonationDetails', { donation: toSerializableDonation(donation) });
  };

  const handleClaimDonation = (donation) => {
    navigation.navigate('DonationDetails', { donation: toSerializableDonation(donation) });
  };

  const getDistance = (donation) => {
    if (!userProfile?.location || !donation?.location?.latitude || !donation?.location?.longitude)
      return null;
    const km = calculateDistance(
      userProfile.location.latitude,
      userProfile.location.longitude,
      donation.location.latitude,
      donation.location.longitude,
    );
    return formatDistance(km);
  };

  const getExpiryStatus = (expiryDate, createdAt) => {
    const parseDate = (d) => {
      try {
        if (!d) return null;
        if (d?.toDate) return d.toDate();
        if (typeof d === 'number') return new Date(d);
        return new Date(d);
      } catch {
        return null;
      }
    };

    let expiry = parseDate(expiryDate);

    // Fallback: assume 7-day window from creation if expiry missing/invalid
    if (!expiry) {
      const created = parseDate(createdAt);
      if (created && !isNaN(created.getTime())) {
        expiry = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000);
      }
    }

    if (!expiry || isNaN(expiry.getTime())) {
      return { status: 'N/A', color: theme.colors.textSecondary };
    }

    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'expired', color: theme.colors.error };
    if (diffDays <= 1) return { status: 'expires today', color: theme.colors.warning };
    return { status: `${diffDays} days left`, color: diffDays <= 3 ? theme.colors.warning : theme.colors.success };
  };

  const renderDonationCard = ({ item }) => {
    const distance = getDistance(item);
    const expiryStatus = getExpiryStatus(item.expiryDate, item.createdAt);

    return (
      <TouchableOpacity
        style={[styles.donationCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => handleDonationPress(item)}
        accessibilityLabel={`${item.itemName} donation, ${distance}km away`}
        accessibilityRole="button"
        delayPressIn={Platform.OS === 'web' ? 0 : undefined}
        activeOpacity={0.7}
      >
        {item.imageUrl || item.image ? (
          <Image source={{ uri: item.imageUrl || item.image }} style={styles.donationImage} />
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
            <Icon name="image" size={40} color={theme.colors.textSecondary} />
          </View>
        )}
        <View style={styles.donationInfo}>
          <Text style={[styles.donationTitle, { color: theme.colors.text }]}>{item.itemName}</Text>
          {item.description ? (
            <Text style={[styles.donationDescription, { color: theme.colors.textSecondary }]}>
              {item.description.substring(0, 60)}...
            </Text>
          ) : null}
          <View style={styles.donationMeta}>
            <View style={styles.metaItem}>
              <Icon name="location-on" size={16} color={theme.colors.textSecondary} />
              {distance && (
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                  {distance}
                </Text>
              )}
            </View>
            <View style={styles.metaItem}>
              <Icon name="schedule" size={16} color={expiryStatus.color} />
              <Text style={[styles.metaText, { color: expiryStatus.color }]}>
                {expiryStatus.status}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.claimButton, { backgroundColor: theme.colors.primary }]}
          onPress={(e) => {
            e.stopPropagation();
            handleClaimDonation(item);
          }}
          accessibilityLabel={`Claim ${item.itemName}`}
        >
          <Text style={[styles.claimButtonText, { color: theme.colors.surface }]}>
            {item.status === 'claimed' ? 'Claim (First Come, First Serve)' : t('claim')}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const getMapMarkers = () => {
    return filteredDonations.map((donation) => {
      const categoryIcon =
        DONATION_CATEGORIES.find((cat) => cat.value === donation.category)?.icon || 'category';

      return {
        donation: donation,
        coordinate: {
          latitude: donation.location.latitude,
          longitude: donation.location.longitude,
        },
        title: donation.itemName,
        description: donation.description.substring(0, 50),
        customMarker: (
          <View style={[styles.mapMarker, { backgroundColor: theme.colors.primary }]}>
            <Icon name={categoryIcon} size={24} color={theme.colors.surface} />
          </View>
        ),
      };
    });
  };

  const handleMarkerPress = (marker) => {
    if (marker.donation) {
      handleDonationPress(marker.donation);
    }
  };

  const columns = getColumns();
  const maxWidth = getMaxWidth();
  const padding = getPadding();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.headerTopSection, { backgroundColor: '#000000' }]}>
          <View style={[styles.headerContent, { maxWidth, alignSelf: 'center', width: '100%' }]}>
            <View style={styles.headerTop}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../UTurn.png')}
                  style={styles.headerLogo}
                  resizeMode="contain"
                />
                <Text style={[styles.headerTitle, { color: theme.colors.surface }]}>
                  {t('appName')}
                </Text>
                <Text style={[styles.tagline, { color: theme.colors.surface }]}>
                  Turning Surplus Into Support
                </Text>
              </View>
              <View style={styles.headerIcons}>
                <TouchableOpacity
                  style={styles.headerIconButton}
                  onPress={() => navigation.navigate('DonationHistory')}
                  accessibilityLabel="Activity Center"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  delayPressIn={0}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Icon name="inventory" size={24} color={theme.colors.surface} />
                    <Text style={{ color: theme.colors.surface, fontWeight: '600' }}>Activity Center</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerIconButton}
                  onPress={() => navigation.navigate('Alerts')}
                  accessibilityLabel="Notifications"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  delayPressIn={0}
                  activeOpacity={0.7}
                >
                  <Icon name="notifications" size={24} color={theme.colors.surface} />
                  {unreadAlertsCount > 0 && (
                    <View style={{ position: 'absolute', top: -10, right: -10, pointerEvents: 'none' }}>
                      <Badge variant="error" size="small">
                        {unreadAlertsCount}
                      </Badge>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.headerBottomSection, { backgroundColor: '#000000' }]}>
          <View style={[styles.headerContent, { maxWidth, alignSelf: 'center', width: '100%' }]}>
            <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
              <Icon name="search" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.colors.text }]}
                placeholder={t('search')}
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                accessibilityLabel={t('search')}
              />
              <TouchableOpacity
                onPress={() => setShowFilters(true)}
                style={styles.filterButton}
                accessibilityLabel="Open filters"
              >
                <Icon
                  name="tune"
                  size={24}
                  color={
                    filters.maxDistance || filters.expiryDays
                      ? theme.colors.primary
                      : theme.colors.textSecondary
                  }
                />
              </TouchableOpacity>
              {!isMobile() && (
                <TouchableOpacity
                  onPress={() => setShowMap(!showMap)}
                  style={styles.toggleButton}
                  accessibilityLabel={showMap ? 'Show list view' : 'Show map view'}
                >
                  <Icon name={showMap ? 'list' : 'map'} size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={[{ value: 'all', label: 'all' }, ...DONATION_CATEGORIES]}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor:
                        selectedCategory === item.value ? theme.colors.surface : 'transparent',
                      borderColor: theme.colors.surface,
                    },
                  ]}
                  onPress={() => setSelectedCategory(item.value)}
                >
                  {item.icon && (
                    <Icon
                      name={item.icon}
                      size={18}
                      color={
                        selectedCategory === item.value
                          ? theme.colors.primary
                          : theme.colors.surface
                      }
                    />
                  )}
                  <Text
                    style={[
                      styles.categoryButtonText,
                      {
                        color:
                          selectedCategory === item.value
                            ? theme.colors.primary
                            : theme.colors.surface,
                      },
                    ]}
                  >
                    {t(item.label)}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.categoryList}
            />
          </View>
        </View>
      </View>

      {!isMobile() && showMap ? (
        <View
          style={[styles.desktopLayout, { maxWidth, alignSelf: 'center', width: '100%', padding }]}
        >
          <View style={styles.mapContainer}>
            <MapComponent
              style={styles.map}
              region={region}
              markers={getMapMarkers()}
              onRegionChangeComplete={setRegion}
              onMarkerPress={handleMarkerPress}
            />
            <Text
              style={[
                styles.mapInstructions,
                {
                  color: theme.colors.textSecondary,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                },
              ]}
            >
              Click markers to view details • Scroll to zoom • Drag to explore
            </Text>
          </View>
          <View style={styles.listContainer}>
            <FlatList
              data={filteredDonations}
              keyExtractor={(item) => item.id}
              renderItem={renderDonationCard}
              contentContainerStyle={{ padding: 8 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      ) : (
        <View style={{ flex: 1, maxWidth, alignSelf: 'center', width: '100%' }}>
          <FlatList
            data={filteredDonations}
            keyExtractor={(item) => item.id}
            renderItem={renderDonationCard}
            numColumns={columns}
            key={columns}
            contentContainerStyle={[styles.donationList, { padding }]}
            columnWrapperStyle={columns > 1 ? styles.columnWrapper : null}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              isMobile() ? (
                <View style={styles.mobileMapContainer}>
                  <MapComponent
                    style={styles.mobileMap}
                    region={region}
                    markers={getMapMarkers()}
                    onRegionChangeComplete={setRegion}
                    onMarkerPress={handleMarkerPress}
                  />
                  <Text style={[styles.mapInstructions, { color: theme.colors.textSecondary }]}>
                    Tap markers to view details • Pinch to zoom • Drag to explore
                  </Text>
                </View>
              ) : null
            }
          />
        </View>
      )}

      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.filterModalOverlay}>
          <View style={[styles.filterModalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.filterHeader}>
              <Text style={[styles.filterTitle, { color: theme.colors.text }]}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterOptions}>
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
                  Maximum Distance (km)
                </Text>
                <View style={styles.distanceButtons}>
                  {[5, 10, 20, 50].map((distance) => (
                    <TouchableOpacity
                      key={distance}
                      style={[
                        styles.distanceButton,
                        { borderColor: theme.colors.border },
                        filters.maxDistance === distance && {
                          backgroundColor: theme.colors.primary,
                        },
                      ]}
                      onPress={() =>
                        updateFilters({
                          maxDistance: filters.maxDistance === distance ? null : distance,
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.distanceButtonText,
                          {
                            color:
                              filters.maxDistance === distance
                                ? theme.colors.surface
                                : theme.colors.text,
                          },
                        ]}
                      >
                        {distance} km
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {filters.maxDistance && (
                  <TouchableOpacity
                    onPress={() => updateFilters({ maxDistance: null })}
                    style={styles.clearButton}
                  >
                    <Text style={{ color: theme.colors.primary }}>Clear Distance Filter</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
                  Expiry Within (days)
                </Text>
                <View style={styles.distanceButtons}>
                  {[1, 3, 7, 14].map((days) => (
                    <TouchableOpacity
                      key={days}
                      style={[
                        styles.distanceButton,
                        { borderColor: theme.colors.border },
                        filters.expiryDays === days && { backgroundColor: theme.colors.primary },
                      ]}
                      onPress={() =>
                        updateFilters({
                          expiryDays: filters.expiryDays === days ? null : days,
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.distanceButtonText,
                          {
                            color:
                              filters.expiryDays === days
                                ? theme.colors.surface
                                : theme.colors.text,
                          },
                        ]}
                      >
                        {days} {days === 1 ? 'day' : 'days'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {filters.expiryDays && (
                  <TouchableOpacity
                    onPress={() => updateFilters({ expiryDays: null })}
                    style={styles.clearButton}
                  >
                    <Text style={{ color: theme.colors.primary }}>Clear Expiry Filter</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={[styles.applyButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowFilters(false)}
              >
                <Text style={[styles.applyButtonText, { color: theme.colors.surface }]}>
                  Apply Filters
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.clearAllButton, { borderColor: theme.colors.border }]}
                onPress={() => {
                  clearFilters();
                  setShowFilters(false);
                }}
              >
                <Text style={{ color: theme.colors.primary }}>Clear All Filters</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {},
  headerTopSection: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerBottomSection: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerWeb: {
    paddingTop: 20,
  },
  headerContent: {
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  headerLogo: {
    width: 120,
    height: 70,
    marginBottom: 0,
    marginTop: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.9,
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconButton: {
    position: 'relative',
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  toggleButton: {
    padding: 4,
  },
  categoryList: {
    paddingRight: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  listContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mobileMapContainer: {
    height: 280,
    marginTop: 16,
    marginBottom: 0,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 0,
    backgroundColor: '#f5f5f5',
  },
  mobileMap: {
    height: 250,
  },
  mapInstructions: {
    fontSize: 11,
    textAlign: 'center',
    padding: 8,
    fontStyle: 'italic',
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
  mapMarkerText: {
    fontSize: 20,
  },
  donationList: {
    paddingBottom: 16,
  },
  columnWrapper: {
    gap: 12,
    paddingHorizontal: 8,
  },
  donationCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
  },
  donationImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  donationInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  donationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  donationDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  donationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  claimButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  claimButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  filterButton: {
    padding: 4,
    marginLeft: 8,
  },
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
    minHeight: '50%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterOptions: {
    flex: 1,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  distanceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  distanceButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  distanceButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  applyButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearAllButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 20,
  },
});

export default HomeScreen;
