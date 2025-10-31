import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { getMaxWidth, getPadding, isDesktop } from '../utils/responsive';
import logger from '../utils/logger';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../utils/IconWrapper';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/AlertContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { submitSassaCheck, getCurrentSassaStatus } from '../services/sassaService';
import {
  getUserAlerts,
  markAlertAsRead as markFirestoreAlertAsRead,
  markAllAlertsAsRead,
  deleteAlert,
  deleteExpiredAlerts,
} from '../services/alertsService';
import useAlerts from '../hooks/useAlerts';

const AlertsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showError, showInfo, showSuccess } = useToast();
  const { alerts, unreadCount, markAllAsRead, remove } = useAlerts(user?.uid, {
    autoLoad: true,
    autoCleanup: true,
  });
  const [activeTab, setActiveTab] = useState('notifications');
  const [sassaForm, setSassaForm] = useState({
    idNumber: '',
    dependents: '',
    monthlyIncome: '',
    employmentStatus: 'unemployed',
  });
  const [currentSassaStatus, setCurrentSassaStatus] = useState(null);
  const [isLoadingSassa, setIsLoadingSassa] = useState(false);
  const [isSubmittingSassa, setIsSubmittingSassa] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (activeTab === 'sassa' && user) {
        loadSassaStatus();
      }
    }, [activeTab, user]),
  );

  const loadSassaStatus = async () => {
    if (!user) return;

    setIsLoadingSassa(true);
    try {
      const status = await getCurrentSassaStatus(user.uid);
      setCurrentSassaStatus(status);
    } catch (error) {
      logger.error('Error loading SASSA status:', error);
    } finally {
      setIsLoadingSassa(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    const doMarkAll = async () => {
      try {
        await markAllAsRead();
        showSuccess('All notifications marked as read.');
      } catch (error) {
        logger.error('Error marking all alerts as read:', error);
        showError('Failed to mark all as read. Please try again.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' && window.confirm(
        'Mark all notifications as read?'
      );
      if (confirmed) doMarkAll();
      return;
    }

    Alert.alert('Mark All as Read', 'Mark all notifications as read?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Mark All Read', onPress: doMarkAll },
    ]);
  };

  const handleDeleteAlert = async (alertId, event) => {
    if (event) {
      event.stopPropagation();
    }

    const doDelete = async () => {
      try {
        await remove(alertId);
        showSuccess('Notification deleted.');
      } catch (error) {
        logger.error('Error deleting alert:', error);
        showError('Failed to delete notification. Please try again.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' && window.confirm(
        'Delete this notification?'
      );
      if (confirmed) doDelete();
      return;
    }

    Alert.alert('Delete Notification', 'Are you sure you want to delete this notification?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: doDelete },
    ]);
  };

  const handleNotificationPress = async (notification) => {
    if (user && !notification.read && !notification.isRead) {
      try {
        await markFirestoreAlertAsRead(notification.id);
      } catch (error) {
        logger.error('Error marking alert as read:', error);
      }
    }

    if (notification.type === 'message' && notification.chatId) {
      const { getDonationById } = require('../services/donationService');
      try {
        const donation = await getDonationById(notification.donationId);
        if (donation) {
          const recipientName = notification.title?.replace('New message from ', '') || 'User';
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
            recipientName: recipientName,
            recipientId: notification.senderId,
          });
        }
      } catch (error) {
        logger.error('Error loading chat:', error);
      }
    } else if (notification.donationId) {
      const { getDonationById } = require('../services/donationService');
      try {
        const donation = await getDonationById(notification.donationId);

        if (donation) {
          navigation.navigate('DonationDetails', { donation });
        } else {
          showInfo('This donation is no longer available.');
        }
      } catch (error) {
        logger.error('Error loading donation:', error);
        showInfo('This donation is no longer available or has been removed.');
      }
    }
  };

  const handleSassaSubmit = async () => {
    if (!sassaForm.idNumber.trim()) {
      showError('Please enter your ID number');
      return;
    }

    if (!user) {
      showError('You must be logged in to check eligibility');
      return;
    }

    setIsSubmittingSassa(true);

    try {
      const result = await submitSassaCheck(user.uid, sassaForm);

      setCurrentSassaStatus(result);

      setSassaForm({
        idNumber: '',
        dependents: '',
        monthlyIncome: '',
        employmentStatus: 'unemployed',
      });

      const statusMessages = {
        eligible: {
          title: '✅ Likely Eligible',
          message: result.notes,
        },
        potentially_eligible: {
          title: '⚠️ Potentially Eligible',
          message: result.notes,
        },
        not_eligible: {
          title: 'ℹ️ May Not Qualify',
          message: result.notes,
        },
      };

      const statusMsg = statusMessages[result.eligibilityStatus] || statusMessages['not_eligible'];

      showInfo(`${statusMsg.title}: ${statusMsg.message}`);
    } catch (error) {
      logger.error('Error submitting SASSA check:', error);
      showError('Failed to submit eligibility check. Please try again.');
    } finally {
      setIsSubmittingSassa(false);
    }
  };

  const renderNotification = ({ item }) => {
    const isRead = item.read || item.isRead;
    const createdAt = item.createdAt?.toDate?.() || (item.createdAt ? new Date(item.createdAt) : new Date());

    return (
      <View
        style={[
          styles.notificationCard,
          {
            backgroundColor: theme.colors.surface,
            borderLeftColor: isRead ? theme.colors.border : theme.colors.primary,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.notificationContentWrapper}
          onPress={() => handleNotificationPress(item)}
          accessibilityLabel={`${item.title}: ${item.message}`}
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <Text style={[styles.notificationTitle, { color: theme.colors.text }]}>{item.title}</Text>
              {!isRead && (
                <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
              )}
            </View>
            <Text style={[styles.notificationMessage, { color: theme.colors.textSecondary }]}>
              {item.message}
            </Text>
            <Text style={[styles.notificationTime, { color: theme.colors.textSecondary }]}>
              {createdAt.toLocaleDateString()} at {createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => handleDeleteAlert(item.id, e)}
          accessibilityLabel="Delete notification"
          accessibilityRole="button"
        >
          <Icon name="delete-outline" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderSassaForm = () => (
    <View style={[styles.sassaForm, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.sassaHeader}>
        <Icon name="account-balance" size={32} color={theme.colors.primary} />
        <Text style={[styles.sassaTitle, { color: theme.colors.text }]}>
          SASSA Eligibility Check
        </Text>
        <Text style={[styles.sassaDescription, { color: theme.colors.textSecondary }]}>
          Check if you're eligible for SASSA grants and food assistance programs
        </Text>
      </View>

      {/* Current Status Display */}
      {isLoadingSassa ? (
        <View style={[styles.statusCard, { backgroundColor: theme.colors.surface }]}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
            Loading your status...
          </Text>
        </View>
      ) : currentSassaStatus && !currentSassaStatus.isExpired ? (
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor:
                currentSassaStatus.eligibilityStatus === 'eligible'
                  ? theme.colors.success + '20'
                  : currentSassaStatus.eligibilityStatus === 'potentially_eligible'
                    ? theme.colors.warning + '20'
                    : theme.colors.error + '20',
            },
          ]}
        >
          <View style={styles.statusHeader}>
            <Icon
              name={currentSassaStatus.eligibilityStatus === 'eligible' ? 'check-circle' : 'info'}
              size={24}
              color={
                currentSassaStatus.eligibilityStatus === 'eligible'
                  ? theme.colors.success
                  : currentSassaStatus.eligibilityStatus === 'potentially_eligible'
                    ? theme.colors.warning
                    : theme.colors.error
              }
            />
            <Text style={[styles.statusTitle, { color: theme.colors.text }]}>
              Current Status:{' '}
              {currentSassaStatus.eligibilityStatus === 'eligible'
                ? 'Likely Eligible'
                : currentSassaStatus.eligibilityStatus === 'potentially_eligible'
                  ? 'Potentially Eligible'
                  : 'May Not Qualify'}
            </Text>
          </View>
          <Text style={[styles.statusNotes, { color: theme.colors.textSecondary }]}>
            {currentSassaStatus.notes}
          </Text>
          <Text style={[styles.statusDate, { color: theme.colors.textSecondary }]}>
            Checked on: {currentSassaStatus.checkedAt?.toLocaleDateString()}
          </Text>
          <Text style={[styles.statusExpiry, { color: theme.colors.textSecondary }]}>
            Valid until: {currentSassaStatus.expiresAt?.toLocaleDateString()}
          </Text>
        </View>
      ) : currentSassaStatus?.isExpired ? (
        <View style={[styles.statusCard, { backgroundColor: theme.colors.warning + '20' }]}>
          <Icon name="warning" size={24} color={theme.colors.warning} />
          <Text style={[styles.statusText, { color: theme.colors.text }]}>
            Your eligibility check has expired. Please check again below.
          </Text>
        </View>
      ) : null}

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>ID Number *</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
            placeholder="Enter your South African ID number"
            placeholderTextColor={theme.colors.textSecondary}
            value={sassaForm.idNumber}
            onChangeText={(value) => setSassaForm((prev) => ({ ...prev, idNumber: value }))}
            keyboardType="numeric"
            maxLength={13}
            accessibilityLabel="ID Number"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            Number of Dependents
          </Text>
          <TextInput
            style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
            placeholder="How many people depend on you?"
            placeholderTextColor={theme.colors.textSecondary}
            value={sassaForm.dependents}
            onChangeText={(value) => setSassaForm((prev) => ({ ...prev, dependents: value }))}
            keyboardType="numeric"
            accessibilityLabel="Number of dependents"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Monthly Income (R)</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
            placeholder="Your monthly household income"
            placeholderTextColor={theme.colors.textSecondary}
            value={sassaForm.monthlyIncome}
            onChangeText={(value) => setSassaForm((prev) => ({ ...prev, monthlyIncome: value }))}
            keyboardType="numeric"
            accessibilityLabel="Monthly income"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Employment Status</Text>
          <View style={styles.employmentOptions}>
            {['Employed', 'Unemployed', 'Self-employed', 'Student', 'Retired'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.employmentOption,
                  {
                    backgroundColor:
                      sassaForm.employmentStatus === status
                        ? theme.colors.primary
                        : theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setSassaForm((prev) => ({ ...prev, employmentStatus: status }))}
              >
                <Text
                  style={[
                    styles.employmentOptionText,
                    {
                      color:
                        sassaForm.employmentStatus === status
                          ? theme.colors.surface
                          : theme.colors.text,
                    },
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.checkButton,
            {
              backgroundColor: isSubmittingSassa ? theme.colors.border : theme.colors.primary,
              opacity: isSubmittingSassa ? 0.7 : 1,
            },
          ]}
          onPress={handleSassaSubmit}
          disabled={isSubmittingSassa}
          accessibilityLabel="Check SASSA eligibility"
          accessibilityRole="button"
        >
          {isSubmittingSassa ? (
            <ActivityIndicator size="small" color={theme.colors.surface} />
          ) : (
            <Text style={[styles.checkButtonText, { color: theme.colors.surface }]}>
              {currentSassaStatus ? 'Check Again' : 'Check Eligibility'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.sassaInfo}>
        <Icon name="info" size={20} color={theme.colors.info} />
        <Text style={[styles.sassaInfoText, { color: theme.colors.textSecondary }]}>
          This is a preliminary check. Visit your nearest SASSA office for official verification.
        </Text>
      </View>
    </View>
  );

  const formattedAlerts = alerts.map((alert) => ({
    id: alert.id,
    type: alert.type,
    title: alert.title,
    message: alert.message,
    createdAt: alert.createdAt,
    read: alert.read,
    isRead: alert.read,
    donationId: alert.donationId,
    senderId: alert.senderId,
    chatId: alert.chatId,
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          Platform.OS === 'web' && styles.headerWeb,
          { backgroundColor: '#000000' },
        ]}
      >
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: theme.colors.surface }]}>{t('alerts')}</Text>
          {activeTab === 'notifications' && unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={handleMarkAllAsRead}
              accessibilityLabel="Mark all as read"
            >
              <Icon name="done-all" size={20} color={theme.colors.surface} />
              <Text style={[styles.markAllText, { color: theme.colors.surface }]}>
                Mark All Read
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              {
                backgroundColor:
                  activeTab === 'notifications' ? theme.colors.surface : 'transparent',
              },
            ]}
            onPress={() => setActiveTab('notifications')}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === 'notifications' ? theme.colors.primary : theme.colors.surface,
                },
              ]}
            >
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              {
                backgroundColor: activeTab === 'sassa' ? theme.colors.surface : 'transparent',
              },
            ]}
            onPress={() => setActiveTab('sassa')}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'sassa' ? theme.colors.primary : theme.colors.surface,
                },
              ]}
            >
              SASSA Check
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {activeTab === 'notifications' ? (
        <FlatList
          data={formattedAlerts}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.notificationsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="notifications-none" size={64} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No notifications yet
              </Text>
            </View>
          }
        />
      ) : (
        <ScrollView style={styles.sassaContainer}>{renderSassaForm()}</ScrollView>
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
  headerWeb: {
    paddingTop: 20,
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
    flex: 1,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    gap: 6,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notificationsList: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationContentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationContent: {
    flex: 1,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  sassaContainer: {
    flex: 1,
    padding: 16,
  },
  sassaForm: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sassaHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sassaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  sassaDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  statusNotes: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  statusDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  statusExpiry: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  formContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  employmentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  employmentOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  employmentOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sassaInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  sassaInfoText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
});

export default AlertsScreen;
