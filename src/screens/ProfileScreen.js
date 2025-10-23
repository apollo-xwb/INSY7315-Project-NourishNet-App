import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Switch,
} from 'react-native';
import Icon from '../utils/IconWrapper';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { user: authUser, userProfile, logout, updateUserProfile } = useAuth();
  const [userState, setUserState] = useState(userProfile || {
    name: '',
    email: '',
    phone: '',
    role: 'recipient',
    location: { address: '' },
    householdSize: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: userState.name || '',
    email: userState.email || '',
    phone: userState.phone || '',
    location: userState.location?.address || '',
    householdSize: userState.householdSize || '',
  });


  useEffect(() => {
    if (userProfile) {
      setUserState(userProfile);
      setEditData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        location: userProfile.location?.address || '',
        householdSize: userProfile.householdSize || '',
      });
    }
  }, [userProfile]);
  const [settings, setSettings] = useState({
    notifications: true,
    lowDataMode: false,
    darkMode: false,
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const updates = {
        name: editData.name,
        phone: editData.phone,
        location: {
          address: editData.location,
          latitude: userState.location?.latitude || null,
          longitude: userState.location?.longitude || null,
        },
        householdSize: editData.householdSize ? parseInt(editData.householdSize) : null,
      };

      const result = await updateUserProfile(updates);

      if (result.success) {
        setUserState(prev => ({
          ...prev,
          ...updates,
        }));
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditData({
      name: userState.name || '',
      email: userState.email || '',
      phone: userState.phone || '',
      location: userState.location?.address || '',
      householdSize: userState.householdSize || '',
    });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (result.success) {

              Alert.alert('Success', 'You have been logged out successfully!');
            } else {
              Alert.alert('Error', result.error || 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'zu', name: 'isiZulu' },
    { code: 'af', name: 'Afrikaans' },
  ];

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'donor': return t('donor');
      case 'recipient': return t('recipient');
      case 'volunteer': return t('volunteer');
      default: return role;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'donor': return 'volunteer-activism';
      case 'recipient': return 'family-restroom';
      case 'volunteer': return 'handshake';
      default: return 'person';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.profileInfo}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.surface }]}>
            <Icon name="person" size={40} color={theme.colors.primary} />
          </View>
          <View style={styles.profileDetails}>
            <Text style={[styles.userName, { color: theme.colors.surface }]}>
              {userState.name}
            </Text>
            <View style={styles.roleContainer}>
              <Icon
                name={getRoleIcon(userState.role)}
                size={16}
                color={theme.colors.surface}
              />
              <Text style={[styles.userRole, { color: theme.colors.surface }]}>
                {getRoleDisplayName(userState.role)}
              </Text>
            </View>
            <Text style={[styles.userLocation, { color: theme.colors.surface }]}>
              {userState.location?.address || 'Location not set'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: theme.colors.surface }]}
          onPress={isEditing ? handleSave : handleEdit}
          accessibilityLabel={isEditing ? 'Save changes' : 'Edit profile'}
        >
          <Icon
            name={isEditing ? 'check' : 'edit'}
            size={20}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      {}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Personal Information
        </Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            {t('name')}
          </Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
              value={editData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              accessibilityLabel={t('name')}
            />
          ) : (
            <Text style={[styles.inputValue, { color: theme.colors.text }]}>
              {userState.name}
            </Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            {t('email')}
          </Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
              value={editData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel={t('email')}
            />
          ) : (
          <Text style={[styles.inputValue, { color: theme.colors.text }]}>
            {userState.email}
          </Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            {t('phone')}
          </Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
              value={editData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
              accessibilityLabel={t('phone')}
            />
          ) : (
            <Text style={[styles.inputValue, { color: theme.colors.text }]}>
              {userState.phone || 'Not specified'}
            </Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            {t('location')}
          </Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
              value={editData.location}
              onChangeText={(value) => handleInputChange('location', value)}
              accessibilityLabel={t('location')}
            />
          ) : (
            <Text style={[styles.inputValue, { color: theme.colors.text }]}>
              {userState.location?.address || 'Location not set'}
            </Text>
          )}
        </View>

        {userState.role === 'recipient' && (
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              {t('householdSize')}
            </Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
                value={editData.householdSize}
                onChangeText={(value) => handleInputChange('householdSize', value)}
                keyboardType="numeric"
                accessibilityLabel={t('householdSize')}
              />
            ) : (
              <Text style={[styles.inputValue, { color: theme.colors.text }]}>
                {userState.householdSize || 'Not specified'}
              </Text>
            )}
          </View>
        )}

        {isEditing && (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.colors.border }]}
              onPress={handleCancel}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                {t('cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Settings
        </Text>

        {}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Icon name="notifications" size={24} color={theme.colors.textSecondary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                {t('notifications')}
              </Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Receive alerts about new donations
              </Text>
            </View>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={(value) => handleSettingChange('notifications', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
          />
        </View>

        {}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Icon name="data-usage" size={24} color={theme.colors.textSecondary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                {t('lowDataMode')}
              </Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Compress images and reduce data usage
              </Text>
            </View>
          </View>
          <Switch
            value={settings.lowDataMode}
            onValueChange={(value) => handleSettingChange('lowDataMode', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
          />
        </View>

        {}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Icon name="language" size={24} color={theme.colors.textSecondary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                {t('language')}
              </Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Current: {languages.find(lang => lang.code === i18n.language)?.name}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => {
              Alert.alert(
                'Select Language',
                'Choose your preferred language',
                languages.map(lang => ({
                  text: lang.name,
                  onPress: () => handleLanguageChange(lang.code),
                }))
              );
            }}
          >
            <Icon name="arrow-forward-ios" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          My Activity
        </Text>

        <TouchableOpacity
          style={styles.historyItem}
          onPress={() => navigation.navigate('MyClaims')}
        >
          <Icon name="inventory" size={24} color={theme.colors.primary} />
          <Text style={[styles.historyText, { color: theme.colors.text }]}>
            My Claims
          </Text>
          <Icon name="arrow-forward-ios" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyItem}
          onPress={() => navigation.navigate('DonationHistory')}
        >
          <Icon name="history" size={24} color={theme.colors.textSecondary} />
          <Text style={[styles.historyText, { color: theme.colors.text }]}>
            View full activity history
          </Text>
          <Icon name="arrow-forward-ios" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
        onPress={handleLogout}
        accessibilityLabel={t('logout')}
        accessibilityRole="button"
      >
        <Icon name="logout" size={20} color={theme.colors.surface} />
        <Text style={[styles.logoutText, { color: theme.colors.surface }]}>
          {t('logout')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    marginLeft: 4,
  },
  userLocation: {
    fontSize: 14,
    opacity: 0.8,
  },
  editButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputValue: {
    fontSize: 16,
    paddingVertical: 12,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
  },
  languageButton: {
    padding: 4,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  historyText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
