import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../utils/IconWrapper';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserDonations,
  deleteDonation as deleteFirestoreDonation,
  getClaimedDonations
} from '../services/donationService';

const DonationHistoryScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [myDonations, setMyDonations] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [activeTab, setActiveTab] = useState('donations');

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadHistory();
      }
    }, [user])
  );

  const loadHistory = async () => {
    try {

      const donations = await getUserDonations(user.uid);

      const claims = await getClaimedDonations(user.uid);

      setMyDonations(donations);
      setMyClaims(claims);
    } catch (error) {
      console.error('Error loading history:', error);
      Alert.alert('Error', 'Failed to load donation history.');
    }
  };

  const handleDeleteDonation = (donation) => {
    Alert.alert(
      'Delete Donation',
      'Are you sure you want to delete this donation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFirestoreDonation(donation.id);
              loadHistory();
            } catch (error) {
              console.error('Error deleting donation:', error);
              Alert.alert('Error', 'Failed to delete donation.');
            }
          },
        },
      ]
    );
  };

  const handleViewDonation = (donation) => {
    navigation.navigate('DonationDetails', { donation });
  };

  const renderDonationItem = ({ item }) => {
    const imageUri = item.imageUrl || item.image;

    return (
      <TouchableOpacity
        style={[styles.historyCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => handleViewDonation(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.itemImage}
            />
          ) : (
            <View style={[styles.itemImage, styles.placeholderImage, { backgroundColor: theme.colors.primary + '20' }]}>
              <Icon name="restaurant" size={28} color={theme.colors.primary} />
            </View>
          )}
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={1}>
              {item.itemName}
            </Text>
            <View style={styles.locationRow}>
              <Icon name="location-on" size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.location, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {item.location?.address || item.location || 'Location available'}
              </Text>
            </View>
            <Text style={[styles.quantity, { color: theme.colors.textSecondary }]}>
              {item.quantity}
            </Text>
          </View>
        </View>

        <Text style={[styles.postedAt, { color: theme.colors.textSecondary }]}>
          Posted {new Date(item.createdAt || item.postedDate).toLocaleDateString()} at{' '}
          {new Date(item.createdAt || item.postedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => handleViewDonation(item)}
          >
            <Icon name="visibility" size={18} color={theme.colors.surface} />
            <Text style={[styles.actionButtonText, { color: theme.colors.surface }]}>
              View
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#EF5350' }]}
            onPress={() => handleDeleteDonation(item)}
          >
            <Icon name="delete" size={18} color="#FFFFFF" />
            <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderClaimItem = ({ item }) => {
    const imageUri = item.donation.imageUrl || item.donation.image;

    return (
      <TouchableOpacity
        style={[styles.historyCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => navigation.navigate('MyClaims')}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.itemImage}
            />
          ) : (
            <View style={[styles.itemImage, styles.placeholderImage, { backgroundColor: theme.colors.primary + '20' }]}>
              <Icon name="restaurant" size={28} color={theme.colors.primary} />
            </View>
          )}
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={1}>
              {item.donation.itemName}
            </Text>
            <View style={styles.locationRow}>
              <Icon name="location-on" size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.location, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {item.donation.location?.address || item.donation.location || 'Location available'}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.postedAt, { color: theme.colors.textSecondary }]}>
          Claimed {item.claimedAt.toLocaleDateString()} at{' '}
          {item.claimedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </TouchableOpacity>
    );
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
          : 'Claim a donation to see it here'
        }
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
            activeTab === 'donations' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 3 },
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
              { color: activeTab === 'donations' ? theme.colors.primary : theme.colors.textSecondary },
            ]}
          >
            My Donations ({myDonations.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'claims' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 3 },
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
        keyExtractor={(item) => item.id}
        renderItem={activeTab === 'donations' ? renderDonationItem : renderClaimItem}
        contentContainerStyle={
          (activeTab === 'donations' ? myDonations : myClaims).length === 0
            ? styles.emptyList
            : styles.list
        }
        ListEmptyComponent={renderEmpty}
      />
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
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
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


