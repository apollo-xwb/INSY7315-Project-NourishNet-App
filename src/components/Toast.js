// Toast notification component for displaying temporary non-blocking messages
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from '../utils/IconWrapper';
const Toast = ({
  id,
  message,
  variant = 'info',
  duration = 3000,
  actionText,
  onAction,
  onDismiss,
  onClose,
}) => {
  const { theme } = useTheme();
  const slideAnim = new Animated.Value(-100); // Start off-screen
  const opacityAnim = new Animated.Value(0);

  // Returns color and icon styles based on toast variant
  const getVariantStyle = () => {
    const variants = {
      success: {
        backgroundColor: '#4CAF50', // Green
        icon: 'check-circle',
        iconColor: '#FFFFFF',
      },
      error: {
        backgroundColor: theme.colors.error,
        icon: 'error',
        iconColor: '#FFFFFF',
      },
      warning: {
        backgroundColor: '#FF9800', // Orange
        icon: 'warning',
        iconColor: '#FFFFFF',
      },
      info: {
        backgroundColor: theme.colors.primary,
        icon: 'info',
        iconColor: '#FFFFFF',
      },
    };

    return variants[variant] || variants.info;
  };

  const variantStyle = getVariantStyle();

  // Animate toast entrance and schedule auto-dismiss
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timeout = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timeout);
  }, []);

  // Reverse the animation before removing the toast
  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.(id);
    });
  };

  const handleClose = () => {
    handleDismiss();
    onClose?.(id);
  };

  const handleAction = () => {
    onAction?.();
    // Don't dismiss on action - let user dismiss manually or wait for timeout
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: variantStyle.backgroundColor,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Icon name={variantStyle.icon} size={24} color={variantStyle.iconColor} style={styles.icon} />

      <Text style={[styles.message, { color: variantStyle.iconColor }]} numberOfLines={2}>
        {message}
      </Text>

      {actionText && onAction && (
        <TouchableOpacity
          onPress={handleAction}
          style={styles.actionButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.actionText, { color: variantStyle.iconColor }]}>{actionText}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={handleClose}
        style={styles.closeButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel="Close notification"
      >
        <Icon name="close" size={20} color={variantStyle.iconColor} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  actionButton: {
    marginLeft: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 4,
  },
});

export default Toast;




