import React, { useMemo, useRef, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useTheme } from '../contexts/ThemeContext';

const MapComponent = ({ region, markers, style, onMarkerPress, onRegionChangeComplete }) => {
  const { theme } = useTheme();

  const apiKey =
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
    Constants?.expoConfig?.extra?.googleMapsApiKey ||
    Constants?.manifest?.extra?.googleMapsApiKey;

  const center = useMemo(() => {
    if (region && typeof region.latitude === 'number' && typeof region.longitude === 'number') {
      return { lat: region.latitude, lng: region.longitude };
    }
    return { lat: -33.9249, lng: 18.4241 };
  }, [region]);

  const zoom = useMemo(() => {
    if (region && region.latitudeDelta && region.longitudeDelta) {
      const approx = Math.min(
        15,
        Math.max(2, Math.round(12 - Math.log2((region.latitudeDelta + region.longitudeDelta) / 2)))
      );
      return approx;
    }
    return 12;
  }, [region]);

  const containerStyle = useMemo(
    () => ({ width: '100%', minHeight: 220, ...(Array.isArray(style) ? Object.assign({}, ...style) : style) }),
    [style]
  );

  const libraries = useMemo(() => ['places'], []);
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
    libraries,
  });

  const mapRef = useRef(null);
  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);
  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  if (!apiKey) {
    return (
      <View style={[styles.fallbackSize, style, { backgroundColor: theme.colors.background, padding: 16 }]}>
        <Text style={[styles.webMapTitle, { color: theme.colors.text }]}>📍 Donation Locations</Text>
        <Text style={[styles.noLocations, { color: theme.colors.textSecondary }]}>Missing Google Maps API key.</Text>
        <Text style={[styles.webMapNote, { color: theme.colors.textSecondary }]}>Set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY and reload.</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={[styles.fallbackSize, style, { backgroundColor: theme.colors.background, padding: 16 }]}>
        <Text style={[styles.webMapTitle, { color: theme.colors.text }]}>📍 Donation Locations</Text>
        <Text style={[styles.noLocations, { color: theme.colors.textSecondary }]}>Failed to load Google Maps.</Text>
      </View>
    );
  }

  if (!isLoaded) {
    return <View style={[styles.fallbackSize, style]} />;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onIdle={() => {
        if (onRegionChangeComplete && mapRef.current) {
          const c = mapRef.current.getCenter();
          onRegionChangeComplete({ latitude: c.lat(), longitude: c.lng() });
        }
      }}
      options={{
        disableDefaultUI: false,
        clickableIcons: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      }}
    >
      {(markers || []).map((m, idx) => (
        <Marker
          key={idx}
          position={{ lat: m.coordinate.latitude, lng: m.coordinate.longitude }}
          title={m.title}
          onClick={() => onMarkerPress && onMarkerPress(m)}
        />
      ))}
    </GoogleMap>
  );
};

const styles = StyleSheet.create({
  fallbackSize: { minHeight: 220, width: '100%' },
  webMapTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  webMapNote: { fontSize: 12, textAlign: 'center', marginTop: 16, fontStyle: 'italic' },
  noLocations: { textAlign: 'center', fontSize: 14, padding: 20 },
});

export default MapComponent;

