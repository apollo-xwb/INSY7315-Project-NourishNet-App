import React, { useState, useEffect } from 'react';
import {
import logger from '../utils/logger';

  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { useTheme } from '../contexts/ThemeContext';
import Icon from '../utils/IconWrapper';
import MapComponent from './MapComponent';


const MOCK_LOCATIONS = [
  { id: 1, name: 'Soweto, Johannesburg', address: 'Soweto, Johannesburg, South Africa', lat: -26.2678, lng: 27.8585 },
  { id: 2, name: 'Alexandra, Johannesburg', address: 'Alexandra Township, Johannesburg, South Africa', lat: -26.1028, lng: 28.0997 },
  { id: 3, name: 'Khayelitsha, Cape Town', address: 'Khayelitsha, Cape Town, South Africa', lat: -34.0387, lng: 18.6677 },
  { id: 4, name: 'Umlazi, Durban', address: 'Umlazi, Durban, South Africa', lat: -29.9674, lng: 30.8942 },
  { id: 5, name: 'Mamelodi, Pretoria', address: 'Mamelodi, Pretoria, South Africa', lat: -25.7110, lng: 28.3562 },
  { id: 6, name: 'Mitchells Plain, Cape Town', address: 'Mitchells Plain, Cape Town, South Africa', lat: -34.0515, lng: 18.6286 },
  { id: 7, name: 'Tembisa, Johannesburg', address: 'Tembisa, Johannesburg, South Africa', lat: -25.9966, lng: 28.2249 },
  { id: 8, name: 'KwaMashu, Durban', address: 'KwaMashu, Durban, South Africa', lat: -29.7432, lng: 30.9811 },
];

const LocationPickerModal = ({ visible, onClose, onLocationSelect, initialLocation }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [showMap, setShowMap] = useState(false);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: -26.2041,
    longitude: 28.0473,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  useEffect(() => {
    if (searchQuery.length > 2) {

      const filtered = MOCK_LOCATIONS.filter(loc =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const getCurrentLocation = async () => {
    try {
      setIsLoadingGPS(true);


      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Please grant location permissions to use GPS feature.',
          [{ text: 'OK' }]
        );
        setIsLoadingGPS(false);
        return;
      }


      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;


      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const address = addresses[0];
      const formattedAddress = address
        ? `${address.street || ''}, ${address.city || ''}, ${address.region || ''}, ${address.country || ''}`.replace(/^,\s*/, '').replace(/,\s*,/g, ',')
        : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      const locationData = {
        address: formattedAddress,
        latitude,
        longitude,
      };

      setSelectedLocation(locationData);
      setSearchQuery(formattedAddress);
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      Alert.alert('Success', 'Current location detected!');
      setIsLoadingGPS(false);
    } catch (error) {
      logger.error('GPS Error:', error);
      Alert.alert(
        'GPS Error',
        'Could not retrieve your location. Please ensure GPS is enabled or select location manually.',
        [{ text: 'OK' }]
      );
      setIsLoadingGPS(false);
    }
  };

  const handleSuggestionSelect = (location) => {
    const locationData = {
      address: location.address,
      latitude: location.lat,
      longitude: location.lng,
    };

    setSelectedLocation(locationData);
    setSearchQuery(location.address);
    setSuggestions([]);
    setMapRegion({
      latitude: location.lat,
      longitude: location.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const handleMapPress = async (event) => {

    const coordinate = event.nativeEvent.coordinate;


    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      });

      const address = addresses[0];
      const formattedAddress = address
        ? `${address.street || ''}, ${address.city || ''}, ${address.region || ''}, ${address.country || ''}`.replace(/^,\s*/, '').replace(/,\s*,/g, ',')
        : `${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`;

      const locationData = {
        address: formattedAddress,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      };

      setSelectedLocation(locationData);
      setSearchQuery(formattedAddress);
      setMapRegion({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {

      const locationData = {
        address: `${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      };

      setSelectedLocation(locationData);
      setSearchQuery(locationData.address);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    } else {
      Alert.alert('No Location Selected', 'Please select a location before confirming.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {}
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={theme.colors.surface} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.surface }]}>
            Select Location
          </Text>
          <View style={styles.placeholder} />
        </View>

        {}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
          <Icon name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search for an address..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="cancel" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {}
        <TouchableOpacity
          style={[styles.gpsButton, { backgroundColor: theme.colors.accent }]}
          onPress={getCurrentLocation}
          disabled={isLoadingGPS}
        >
          {isLoadingGPS ? (
            <ActivityIndicator size="small" color={theme.colors.surface} />
          ) : (
            <Icon name="my-location" size={20} color={theme.colors.surface} />
          )}
          <Text style={[styles.gpsButtonText, { color: theme.colors.surface }]}>
            {isLoadingGPS ? 'Getting Location...' : 'Use My Current Location'}
          </Text>
        </TouchableOpacity>

        {}
        {suggestions.length > 0 && (
          <ScrollView style={styles.suggestionsContainer}>
            {suggestions.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={[styles.suggestionItem, { backgroundColor: theme.colors.surface }]}
                onPress={() => handleSuggestionSelect(location)}
              >
                <Icon name="location-on" size={20} color={theme.colors.primary} />
                <View style={styles.suggestionText}>
                  <Text style={[styles.suggestionName, { color: theme.colors.text }]}>
                    {location.name}
                  </Text>
                  <Text style={[styles.suggestionAddress, { color: theme.colors.textSecondary }]}>
                    {location.address}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {}
        <TouchableOpacity
          style={[styles.mapToggle, { backgroundColor: theme.colors.surface }]}
          onPress={() => setShowMap(!showMap)}
        >
          <Icon name={showMap ? 'list' : 'map'} size={20} color={theme.colors.primary} />
          <Text style={[styles.mapToggleText, { color: theme.colors.text }]}>
            {showMap ? 'Show List' : 'Show Map'}
          </Text>
        </TouchableOpacity>

        {}
        {showMap && (
          <View style={styles.mapContainer}>
            <MapComponent
              style={styles.map}
              region={mapRegion}
              markers={selectedLocation ? [{
                coordinate: {
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                },
                title: 'Selected Location',
                description: selectedLocation.address,
              }] : []}
              onRegionChangeComplete={setMapRegion}
              onLongPress={handleMapPress}
            />
            <Text style={[styles.mapHint, { color: theme.colors.textSecondary }]}>
              📍 On mobile: Long press on map to pin a location
            </Text>
          </View>
        )}

        {}
        {selectedLocation && (
          <View style={[styles.selectedLocation, { backgroundColor: theme.colors.surface }]}>
            <Icon name="check-circle" size={20} color={theme.colors.success} />
            <Text style={[styles.selectedText, { color: theme.colors.text }]}>
              {selectedLocation.address}
            </Text>
          </View>
        )}

        {}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            { backgroundColor: selectedLocation ? theme.colors.primary : theme.colors.border }
          ]}
          onPress={handleConfirm}
          disabled={!selectedLocation}
        >
          <Text style={[styles.confirmButtonText, { color: theme.colors.surface }]}>
            Confirm Location
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  gpsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  suggestionsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  suggestionText: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  suggestionAddress: {
    fontSize: 14,
  },
  mapToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  mapToggleText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
    minHeight: 300,
  },
  mapHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  selectedLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  selectedText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  confirmButton: {
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 32 : 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LocationPickerModal;

