import React, { useState } from 'react';
import {
import logger from '../utils/logger';

  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DatePickerWrapper from '../components/DatePickerWrapper';
import LocationPickerModal from '../components/LocationPickerModal';
import Icon from '../utils/IconWrapper';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { DONATION_CATEGORIES } from '../constants/categories';
import { createDonation } from '../services/donationService';
import { createAlert } from '../services/alertsService';

const PostDonationScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    quantity: '',
    category: 'vegetables',
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    pickupTimeStart: '09:00',
    pickupTimeEnd: '17:00',
    location: '',
    locationCoords: null,
  });
  const [image, setImage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationSelect = (locationData) => {
    setFormData(prev => ({
      ...prev,
      location: locationData.address,
      locationCoords: {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      },
    }));
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const validateForm = () => {
    const { itemName, description, quantity, location } = formData;

    if (!image) {
      Alert.alert(t('error'), 'Please add a photo of the donation');
      return false;
    }

    if (!itemName.trim()) {
      Alert.alert(t('error'), 'Please enter the item name');
      return false;
    }

    if (!description.trim()) {
      Alert.alert(t('error'), 'Please enter a description');
      return false;
    }

    if (!quantity.trim()) {
      Alert.alert(t('error'), 'Please enter the quantity');
      return false;
    }

    if (!location.trim()) {
      Alert.alert(t('error'), 'Please enter the pickup location');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {

      const donationData = {
        itemName: formData.itemName,
        description: formData.description,
        quantity: formData.quantity,
        category: formData.category,
        expiryDate: formData.expiryDate,
        pickupTimeStart: formData.pickupTimeStart,
        pickupTimeEnd: formData.pickupTimeEnd,
        location: {
          address: formData.location,
          latitude: formData.locationCoords?.latitude || 0,
          longitude: formData.locationCoords?.longitude || 0,
        },
        image: image?.uri || null,
        donorName: userProfile?.name || user?.displayName || 'Anonymous',
        donorContact: userProfile?.phone || 'Not provided',
        donorEmail: userProfile?.email || user?.email || '',
      };


      const savedDonation = await createDonation(donationData, user.uid);

      logger.log('Donation created in Firestore:', savedDonation.id);


      try {
        await createAlert(user.uid, {
          type: 'success',
          title: 'Donation Posted Successfully',
          message: `Your donation "${formData.itemName}" is now live and visible to recipients!`,
          donationId: savedDonation.id,
        });
      } catch (alertError) {
        logger.error('Error creating alert:', alertError);

      }

      Alert.alert(
        t('success'),
        'Donation posted successfully! It will be visible to recipients shortly.',
        [
          {
            text: 'OK',
            onPress: () => {

              setFormData({
                itemName: '',
                description: '',
                quantity: '',
                category: 'vegetables',
                expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                pickupTimeStart: '09:00',
                pickupTimeEnd: '17:00',
                location: '',
                locationCoords: null,
              });
              setImage(null);
              navigation.navigate('Home');
            },
          },
        ]
      );
    } catch (error) {
      logger.error('Error posting donation:', error);
      Alert.alert(t('error'), 'Failed to post donation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Photo (Required)
          </Text>
          <TouchableOpacity
            style={[styles.imageContainer, { borderColor: theme.colors.border }]}
            onPress={showImagePicker}
            accessibilityLabel="Add photo"
            accessibilityRole="button"
          >
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.selectedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon name="add-a-photo" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.imagePlaceholderText, { color: theme.colors.textSecondary }]}>
                  Tap to add photo
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Basic Information
          </Text>

          {}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              {t('itemName')} *
            </Text>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
              placeholder="e.g., Fresh Vegetables"
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.itemName}
              onChangeText={(value) => handleInputChange('itemName', value)}
              accessibilityLabel={t('itemName')}
            />
          </View>

          {}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              Category
            </Text>
            <View style={[styles.categoryGrid]}>
              {DONATION_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.value}
                  style={[
                    styles.categoryOption,
                    {
                      backgroundColor: formData.category === category.value
                        ? theme.colors.primary
                        : theme.colors.background,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => handleInputChange('category', category.value)}
                >
                  <Icon name={category.icon} size={24} color={formData.category === category.value ? theme.colors.surface : theme.colors.text} />
                  <Text
                    style={[
                      styles.categoryText,
                      {
                        color: formData.category === category.value
                          ? theme.colors.surface
                          : theme.colors.text,
                      },
                    ]}
                  >
                    {t(category.label)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              {t('description')} *
            </Text>
            <TextInput
              style={[styles.textArea, { borderColor: theme.colors.border, color: theme.colors.text }]}
              placeholder="Describe the donation, condition, and any special instructions..."
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              accessibilityLabel={t('description')}
            />
          </View>

          {}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              {t('quantity')} *
            </Text>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
              placeholder="e.g., 5 kg, 10 pieces, 2 bags"
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.quantity}
              onChangeText={(value) => handleInputChange('quantity', value)}
              accessibilityLabel={t('quantity')}
            />
          </View>
        </View>

        {}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Timing & Location
          </Text>

          {}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              {t('expiryDate')}
            </Text>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: theme.colors.border }]}
              onPress={() => setShowDatePicker(true)}
              accessibilityLabel="Select expiry date"
            >
              <Icon name="event" size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.dateButtonText, { color: theme.colors.text }]}>
                {formatDate(formData.expiryDate)}
              </Text>
            </TouchableOpacity>
          </View>

          {}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              {t('pickupTime')}
            </Text>
            <View style={styles.timeContainer}>
              <View style={styles.timeInput}>
                <Text style={[styles.timeLabel, { color: theme.colors.textSecondary }]}>
                  From
                </Text>
                <TextInput
                  style={[styles.timeInputField, { borderColor: theme.colors.border, color: theme.colors.text }]}
                  value={formData.pickupTimeStart}
                  onChangeText={(value) => handleInputChange('pickupTimeStart', value)}
                  placeholder="09:00"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
              <View style={styles.timeInput}>
                <Text style={[styles.timeLabel, { color: theme.colors.textSecondary }]}>
                  To
                </Text>
                <TextInput
                  style={[styles.timeInputField, { borderColor: theme.colors.border, color: theme.colors.text }]}
                  value={formData.pickupTimeEnd}
                  onChangeText={(value) => handleInputChange('pickupTimeEnd', value)}
                  placeholder="17:00"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            </View>
          </View>

          {}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              {t('location')} *
            </Text>
            <TouchableOpacity
              style={[styles.locationButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
              onPress={() => setShowLocationPicker(true)}
              accessibilityLabel={t('location')}
            >
              <Icon name="location-on" size={20} color={theme.colors.primary} />
              <Text
                style={[
                  styles.locationButtonText,
                  {
                    color: formData.location ? theme.colors.text : theme.colors.textSecondary,
                  },
                ]}
                numberOfLines={1}
              >
                {formData.location || 'Tap to select pickup location'}
              </Text>
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            {formData.locationCoords && (
              <Text style={[styles.coordsText, { color: theme.colors.textSecondary }]}>
                📍 GPS: {formData.locationCoords.latitude.toFixed(6)}, {formData.locationCoords.longitude.toFixed(6)}
              </Text>
            )}
          </View>
        </View>

        {}
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: theme.colors.primary,
              opacity: isLoading ? 0.7 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
          accessibilityLabel="Post donation"
          accessibilityRole="button"
        >
          <Text style={[styles.submitButtonText, { color: theme.colors.surface }]}>
            {isLoading ? t('loading') : 'Post Donation'}
          </Text>
        </TouchableOpacity>
      </View>

      {}
      <DatePickerWrapper
        modal
        open={showDatePicker}
        date={formData.expiryDate}
        mode="date"
        minimumDate={new Date()}
        onConfirm={(date) => {
          setShowDatePicker(false);
          handleInputChange('expiryDate', date);
        }}
        onCancel={() => {
          setShowDatePicker(false);
        }}
      />

      {}
      <LocationPickerModal
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={formData.locationCoords ? {
          address: formData.location,
          latitude: formData.locationCoords.latitude,
          longitude: formData.locationCoords.longitude,
        } : null}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
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
  imageContainer: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
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
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  timeInputField: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  locationButtonText: {
    flex: 1,
    fontSize: 16,
  },
  coordsText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  gpsButton: {
    padding: 12,
    borderRadius: 8,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PostDonationScreen;
