// Icon-only button component with loading states and variants
import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from '../../utils/IconWrapper';
const IconButton = ({
  icon,
  onPress,
  variant = 'default',
  size = 'medium',
  disabled = false,
  loading = false,
  accessibilityLabel,
  style,
  ...rest
}) => {
  const { theme } = useTheme();

  const getVariantStyle = () => {
    const variants = {
      default: {
        backgroundColor: 'transparent',
        iconColor: theme.colors.text,
      },
      primary: {
        backgroundColor: theme.colors.primary,
        iconColor: theme.colors.surface,
      },
      danger: {
        backgroundColor: theme.colors.error,
        iconColor: theme.colors.surface,
      },
    };
    return variants[variant] || variants.default;
  };

  const sizeStyles = {
    small: { container: { width: 36, height: 36, borderRadius: 18 }, icon: 20 },
    medium: { container: { width: 48, height: 48, borderRadius: 24 }, icon: 24 },
    large: { container: { width: 56, height: 56, borderRadius: 28 }, icon: 28 },
  };
  const variantStyle = getVariantStyle();
  const currentSize = sizeStyles[size] || sizeStyles.medium;

  if (!accessibilityLabel && __DEV__) {
    console.warn(`IconButton with icon "${icon}" is missing accessibilityLabel (required for screen readers).`);
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        currentSize.container,
        { backgroundColor: variantStyle.backgroundColor },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.iconColor} size="small" />
      ) : (
        <Icon name={icon} size={currentSize.icon} color={variantStyle.iconColor} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default IconButton;

