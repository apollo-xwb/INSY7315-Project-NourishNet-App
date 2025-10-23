import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../utils/IconWrapper';
import MapComponent from '../components/MapComponent';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { mockCategories } from '../mocks/data';
import { getDonations as getFirestoreDonations } from '../services/donationService';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showMap, setShowMap] = useState(true);
  const [region, setRegion] = useState({
    latitude: -26.2041,
    longitude: 28.0473,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });


  useFocusEffect(
    React.useCallback(() => {
      loadDonations();
    }, [])
  );

  const loadDonations = async () => {
    try {
      const firestoreDonations = await getFirestoreDonations();
      setDonations(firestoreDonations);
    } catch (error) {
      console.error('Error loading donations:', error);
      setDonations([]);
    }
  };

  useEffect(() => {
    filterDonations();
  }, [searchQuery, selectedCategory, donations]);

  const filterDonations = () => {
    let filtered = donations.filter(donation => donation.status === 'available');

    if (searchQuery.trim()) {
      filtered = filtered.filter(donation =>
        donation.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donation.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(donation => donation.category === selectedCategory);
    }

    setFilteredDonations(filtered);
  };

  const handleDonationPress = (donation) => {
    navigation.navigate('DonationDetails', { donation });
  };

  const handleClaimDonation = (donationId) => {
    Alert.alert(
      'Claim Donation',
      'Are you sure you want to claim this donation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Claim',
          onPress: () => {

            setDonations(prev =>
              prev.map(donation =>
                donation.id === donationId
                  ? { ...donation, status: 'claimed', claimedBy: 'current-user-id' }
                  : donation
              )
            );
            Alert.alert('Success', 'Donation claimed successfully!');
          },
        },
      ]
    );
  };

  const getDistance = (donation) => {

    return Math.floor(Math.random() * 10) + 1;
  };

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'expired', color: theme.colors.error };
    if (diffDays <= 1) return { status: 'expires today', color: theme.colors.warning };
    if (diffDays <= 3) return { status: `${diffDays} days left`, color: theme.colors.warning };
    return { status: `${diffDays} days left`, color: theme.colors.success };
  };

  const renderDonationCard = ({ item }) => {
    const distance = getDistance(item);
    const expiryStatus = getExpiryStatus(item.expiryDate);

    return (
      <TouchableOpacity
        style={[styles.donationCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => handleDonationPress(item)}
        accessibilityLabel={`${item.itemName} donation, ${distance}km away`}
        accessibilityRole="button"
      >
        {(item.imageUrl || item.image) ? (
          <Image source={{ uri: item.imageUrl || item.image }} style={styles.donationImage} />
        ) : (
          <View style={[styles.donationImage, { backgroundColor: theme.colors.border, justifyContent: 'center', alignItems: 'center' }]}>
            <Icon name="image" size={40} color={theme.colors.textSecondary} />
          </View>
        )}
        <View style={styles.donationInfo}>
          <Text style={[styles.donationTitle, { color: theme.colors.text }]}>
            {item.itemName}
          </Text>
          <Text style={[styles.donationDescription, { color: theme.colors.textSecondary }]}>
            {item.description.substring(0, 60)}...
          </Text>
          <View style={styles.donationMeta}>
            <View style={styles.metaItem}>
              <Icon name="location-on" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                {distance}km
              </Text>
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
          onPress={() => handleClaimDonation(item.id)}
          accessibilityLabel={`Claim ${item.itemName}`}
        >
          <Text style={[styles.claimButtonText, { color: theme.colors.surface }]}>
            {t('claim')}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const getMapMarkers = () => {
    return filteredDonations.map(donation => {
      const categoryIcon = mockCategories.find(cat => cat.id === donation.category)?.icon || '📦';

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
            <Text style={styles.mapMarkerText}>{categoryIcon}</Text>
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: theme.colors.surface }]}>
            {t('appName')}
          </Text>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Alerts')}
            accessibilityLabel="Notifications"
          >
            <Icon name="notifications" size={24} color={theme.colors.surface} />
            <View style={[styles.notificationBadge, { backgroundColor: theme.colors.error }]}>
              <Text style={[styles.badgeText, { color: theme.colors.surface }]}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {}
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
            onPress={() => setShowMap(!showMap)}
            style={styles.toggleButton}
            accessibilityLabel={showMap ? 'Show list view' : 'Show map view'}
          >
            <Icon
              name={showMap ? 'list' : 'map'}
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>

        {}
        <FlatList
          data={[{ id: 'all', name: 'All' }, ...mockCategories]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                {
                  backgroundColor: selectedCategory === item.id
                    ? theme.colors.surface
                    : 'transparent',
                  borderColor: theme.colors.surface,
                },
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  {
                    color: selectedCategory === item.id
                      ? theme.colors.primary
                      : theme.colors.surface,
                  },
                ]}
              >
                {item.icon} {item.name}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {}
      {showMap ? (
        <MapComponent
          style={styles.map}
          region={region}
          markers={getMapMarkers()}
          onRegionChangeComplete={setRegion}
          onMarkerPress={handleMarkerPress}
        />
      ) : (
        <FlatList
          data={filteredDonations}
          keyExtractor={(item) => item.id}
          renderItem={renderDonationCard}
          contentContainerStyle={styles.donationList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
  map: {
    flex: 1,
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
    padding: 16,
  },
  donationCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
});

export default HomeScreen;
