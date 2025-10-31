// Badge component for displaying counts, status indicators, and tags
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
const Badge = ({ children, variant = 'default', size = 'medium', dot = false, style }) => {
  const { theme } = useTheme();

  // Returns color styles based on badge variant
  const getVariantStyle = () => {
    const variants = {
      default: {
        backgroundColor: theme.colors.border,
        color: theme.colors.text,
      },
      primary: {
        backgroundColor: theme.colors.primary,
        color: theme.colors.surface,
      },
      success: {
        backgroundColor: '#4CAF50', // Green
        color: '#FFFFFF',
      },
      warning: {
        backgroundColor: '#FF9800', // Orange
        color: '#FFFFFF',
      },
      error: {
        backgroundColor: theme.colors.error,
        color: theme.colors.surface,
      },
      info: {
        backgroundColor: '#2196F3', // Blue
        color: '#FFFFFF',
      },
    };

    return variants[variant] || variants.default;
  };

  /**
   * Size-based styling
   * Ensures readability while maintaining visual hierarchy
   */
  const getSizeStyle = () => {
    const sizes = {
      small: {
        container: {
          paddingHorizontal: 6,
          paddingVertical: 2,
          minWidth: dot ? 6 : 18,
          height: dot ? 6 : 18,
        },
        text: {
          fontSize: 10,
        },
      },
      medium: {
        container: {
          paddingHorizontal: 8,
          paddingVertical: 4,
          minWidth: dot ? 8 : 20,
          height: dot ? 8 : 20,
        },
        text: {
          fontSize: 12,
        },
      },
      large: {
        container: {
          paddingHorizontal: 10,
          paddingVertical: 6,
          minWidth: dot ? 10 : 24,
          height: dot ? 10 : 24,
        },
        text: {
          fontSize: 14,
        },
      },
    };

    return sizes[size] || sizes.medium;
  };

  const variantStyle = getVariantStyle();
  const sizeStyle = getSizeStyle();

  return (
    <View
      style={[
        styles.container,
        sizeStyle.container,
        { backgroundColor: variantStyle.backgroundColor },
        dot && styles.dot,
        style,
      ]}
    >
      {!dot && (
        <Text
          style={[styles.text, sizeStyle.text, { color: variantStyle.color }]}
          numberOfLines={1}
        >
          {children}
        </Text>
      )}
    </View>
  );
};

/**
 * StyleSheet for Badge component
 * Circular/pill-shaped design for visual consistency
 */
const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  dot: {
    borderRadius: 50, // Fully circular
    padding: 0,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Badge;




