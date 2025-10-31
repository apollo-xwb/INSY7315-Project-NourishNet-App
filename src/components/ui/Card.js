// Card container component with elevation and shadow support
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
const Card = ({ children, onPress, variant = 'elevated', elevation = 2, style, ...rest }) => {
  const { theme } = useTheme();

  // Returns shadow styles based on elevation level
  const getElevationStyle = () => {
    const elevationLevels = {
      0: {
        elevation: 0,
        shadowOpacity: 0,
      },
      1: {
        elevation: 1,
        shadowOpacity: 0.1,
        shadowRadius: 1,
        shadowOffset: { width: 0, height: 1 },
      },
      2: {
        elevation: 2,
        shadowOpacity: 0.15,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
      },
      3: {
        elevation: 3,
        shadowOpacity: 0.2,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
      },
      4: {
        elevation: 4,
        shadowOpacity: 0.25,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      5: {
        elevation: 5,
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
      },
    };

    return elevationLevels[elevation] || elevationLevels[2];
  };

  // Returns variant-specific styles
  const getVariantStyle = () => {
    const variants = {
      elevated: {
        backgroundColor: theme.colors.surface,
        borderWidth: 0,
      },
      outlined: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
      },
      filled: {
        backgroundColor: theme.colors.background,
        borderWidth: 0,
      },
    };

    return variants[variant] || variants.elevated;
  };

  const cardStyle = [
    styles.card,
    getVariantStyle(),
    variant === 'elevated' && getElevationStyle(),
    style,
  ];

  /**
   * Conditional rendering: Interactive vs Static Card
   * If onPress is provided, render as TouchableOpacity for interactivity
   * Otherwise, render as static View
   *
   * UX Consideration: Interactive elements should be clearly distinguishable
   * Reference: Nielsen Norman Group - Signifiers
   */
  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7} {...rest}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    overflow: 'hidden',
  },
});

export default Card;




