import React from 'react';
import { View, Text, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from '../utils/IconWrapper';


const MapComponent = ({ region, markers, style, onRegionChangeComplete, onMarkerPress, onLongPress }) => {
  const { theme } = useTheme();


  const WebFallback = () => (
    <View style={[style, { backgroundColor: theme.colors.background, padding: 16 }]}>
      <Text style={[styles.webMapTitle, { color: theme.colors.text }]}>
        📍 Donation Locations
      </Text>
      {markers && markers.map((marker, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.locationItem, { backgroundColor: theme.colors.surface }]}
          onPress={() => onMarkerPress && onMarkerPress(marker)}
          activeOpacity={0.7}
        >
          <Icon name="location-on" size={20} color={theme.colors.primary} />
          <View style={styles.locationInfo}>
            <Text style={[styles.locationTitle, { color: theme.colors.text }]}>
              {marker.title}
            </Text>
            <Text style={[styles.locationAddress, { color: theme.colors.textSecondary }]}>
              {marker.description}
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      ))}
      <Text style={[styles.webMapNote, { color: theme.colors.textSecondary }]}>
        Interactive map is available on mobile devices
      </Text>
    </View>
  );


  if (Platform.OS === 'web') {
    return <WebFallback />;
  }


  try {
    const MapView = require('react-native-maps').default;
    const { Marker } = require('react-native-maps');

    return (
      <MapView
        style={style}
        region={region}
        onRegionChangeComplete={onRegionChangeComplete}
        onLongPress={onLongPress}
      >
        {markers && markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: marker.coordinate.latitude,
              longitude: marker.coordinate.longitude,
            }}
            title={marker.title}
            description={marker.description}
            onPress={() => onMarkerPress && onMarkerPress(marker)}
          >
            {marker.customMarker}
          </Marker>
        ))}
      </MapView>
    );
  } catch (error) {

    console.warn('Native maps failed to load, using fallback:', error);
    return <WebFallback />;
  }
};

const styles = StyleSheet.create({
  webMapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
  },
  webMapNote: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});

export default MapComponent;
