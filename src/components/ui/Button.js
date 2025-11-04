// Reusable button component with variants and loading states
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from '../../utils/IconWrapper';
const Button = ({
  variant = 'primary',
  size = 'medium',
  onPress,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  style,
  ...rest
}) => {
  const { theme } = useTheme();

  // Returns button styles based on variant
  const getButtonStyles = () => {
    const baseStyle = {
      backgroundColor: theme.colors.primary,
      borderWidth: 0,
    };

    const variantStyles = {
      primary: {
        backgroundColor: theme.colors.primary,
      },
      secondary: {
        backgroundColor: theme.colors.secondary || theme.colors.textSecondary,
      },
      danger: {
        backgroundColor: theme.colors.error,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: theme.colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return { ...baseStyle, ...variantStyles[variant] };
  };

  const getTextStyles = () => {
    const baseStyle = {
      color: theme.colors.surface,
    };

    const variantStyles = {
      outline: {
        color: theme.colors.primary,
      },
      ghost: {
        color: theme.colors.primary,
      },
    };

    return { ...baseStyle, ...(variantStyles[variant] || {}) };
  };

  // Size-based padding styles
  const sizeStyles = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    large: {
      paddingVertical: 16,
      paddingHorizontal: 32,
    },
  };

  const textSizeStyles = {
    small: {
      fontSize: 14,
    },
    medium: {
      fontSize: 16,
    },
    large: {
      fontSize: 18,
    },
  };

  const iconSizes = {
    small: 18,
    medium: 20,
    large: 24,
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyles(),
        sizeStyles[size],
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      delayPressIn={Platform.OS === 'web' ? 0 : undefined}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'outline' || variant === 'ghost'
              ? theme.colors.primary
              : theme.colors.surface
          }
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Icon
              name={icon}
              size={iconSizes[size]}
              color={getTextStyles().color}
              style={styles.iconLeft}
            />
          )}
          <Text style={[styles.text, getTextStyles(), textSizeStyles[size]]}>{children}</Text>
          {icon && iconPosition === 'right' && (
            <Icon
              name={icon}
              size={iconSizes[size]}
              color={getTextStyles().color}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Button;




