import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import Icon from '../utils/IconWrapper';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const CompleteProfileScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { userProfile, updateUserProfile } = useAuth();

  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [householdSize, setHouseholdSize] = useState(userProfile?.householdSize?.toString() || '');
  const [location, setLocation] = useState(userProfile?.location?.address || '');
  const [coordinates, setCoordinates] = useState({
    latitude: userProfile?.location?.latitude || null,
    longitude: userProfile?.location?.longitude || null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        setLocationPermissionGranted(true);
        getCurrentLocation();
      } else {
        Alert.alert(
          'Location Permission',
          'Location access helps us show you nearby donations. You can still use the app without it.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      setCoordinates({ latitude, longitude });


      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addresses.length > 0) {
        const address = addresses[0];
        const formattedAddress = `${address.street || ''}, ${address.city || ''}, ${address.region || ''}, ${address.country || ''}`.replace(/^, |, $/g, '');
        setLocation(formattedAddress);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your current location. Please enter it manually.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {

    if (!phone.trim()) {
      Alert.alert('Required', 'Please enter your phone number');
      return;
    }

    if (userProfile?.role === 'recipient' && !householdSize.trim()) {
      Alert.alert('Required', 'Please enter your household size');
      return;
    }

    if (!location.trim()) {
      Alert.alert('Required', 'Please enter your location');
      return;
    }

    setIsLoading(true);

    try {
      const updates = {
        phone: phone.trim(),
        householdSize: householdSize ? parseInt(householdSize) : null,
        location: {
          address: location.trim(),
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        },
        profileComplete: true,
      };

      const result = await updateUserProfile(updates);

      if (result.success) {
        Alert.alert('Success', 'Your profile has been updated!', [
          {
            text: 'OK',
            onPress: () => {


            },
          },
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Profile Setup',
      'You can complete your profile later from the Profile tab.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: async () => {
            await updateUserProfile({ profileComplete: true });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {}
        <View style={styles.header}>
          <Icon name="account-circle" size={80} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Complete Your Profile
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Help us personalize your experience
          </Text>
        </View>

        {}
        <View style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
          {}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Phone Number *
            </Text>
            <View style={[styles.input, { borderColor: theme.colors.border }]}>
              <Icon name="phone" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: theme.colors.text }]}
                placeholder="Enter your phone number"
                placeholderTextColor={theme.colors.textSecondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {}
          {userProfile?.role === 'recipient' && (
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Household Size *
              </Text>
              <View style={[styles.input, { borderColor: theme.colors.border }]}>
                <Icon name="family-restroom" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { color: theme.colors.text }]}
                  placeholder="Number of people in your household"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={householdSize}
                  onChangeText={setHouseholdSize}
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}

          {}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Location *
            </Text>
            <View style={[styles.input, { borderColor: theme.colors.border }]}>
              <Icon name="location-on" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: theme.colors.text }]}
                placeholder="Enter your address"
                placeholderTextColor={theme.colors.textSecondary}
                value={location}
                onChangeText={setLocation}
                multiline
              />
            </View>
            {locationPermissionGranted && (
              <TouchableOpacity
                style={[styles.locationButton, { backgroundColor: theme.colors.primary }]}
                onPress={getCurrentLocation}
                disabled={isLoading}
              >
                <Icon name="my-location" size={18} color={theme.colors.surface} />
                <Text style={[styles.locationButtonText, { color: theme.colors.surface }]}>
                  {isLoading ? 'Getting location...' : 'Use Current Location'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={[styles.saveButtonText, { color: theme.colors.surface }]}>
              {isLoading ? 'Saving...' : 'Save & Continue'}
            </Text>
          </TouchableOpacity>

          {}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={isLoading}
          >
            <Text style={[styles.skipButtonText, { color: theme.colors.textSecondary }]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9F9F9',
    minHeight: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  skipButtonText: {
    fontSize: 16,
  },
});

export default CompleteProfileScreen;



