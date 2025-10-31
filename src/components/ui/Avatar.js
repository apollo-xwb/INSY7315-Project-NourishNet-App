// Avatar component that displays profile image or user initials as fallback
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
const Avatar = ({ imageUri, name = '', size = 'medium', style }) => {
  const { theme } = useTheme();

  // Generates initials from user name (first letter of first two words)
  const getInitials = () => {
    if (!name || name.trim() === '') return '?';

    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0][0].toUpperCase();
    }

    return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
  };

  // Generates consistent background color from user name hash
  const getBackgroundColor = () => {
    if (!name) return theme.colors.border;

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  const sizeStyles = {
    small: {
      container: {
        width: 32,
        height: 32,
        borderRadius: 16,
      },
      text: {
        fontSize: 14,
      },
    },
    medium: {
      container: {
        width: 40,
        height: 40,
        borderRadius: 20,
      },
      text: {
        fontSize: 16,
      },
    },
    large: {
      container: {
        width: 56,
        height: 56,
        borderRadius: 28,
      },
      text: {
        fontSize: 22,
      },
    },
    xlarge: {
      container: {
        width: 80,
        height: 80,
        borderRadius: 40,
      },
      text: {
        fontSize: 32,
      },
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;

  return (
    <View
      style={[
        styles.container,
        currentSize.container,
        { backgroundColor: imageUri ? 'transparent' : getBackgroundColor() },
        style,
      ]}
    >
      {imageUri ? (
        // Display profile image if available
        <Image source={{ uri: imageUri }} style={[styles.image, currentSize.container]} />
      ) : (
        // Display initials if no image
        <Text
          style={[
            styles.initials,
            currentSize.text,
            { color: '#FFFFFF' }, // White text for contrast on colored background
          ]}
        >
          {getInitials()}
        </Text>
      )}
    </View>
  );
};

/**
 * StyleSheet for Avatar component
 */
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Ensures image respects border radius
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Avatar;
