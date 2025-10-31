// Empty state component for displaying helpful messages when no content is available
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from '../../utils/IconWrapper';
import Button from './Button';
const EmptyState = ({
  icon = 'inbox',
  title = 'No items yet',
  message = 'Items will appear here when available',
  actionText,
  onAction,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {/* Large icon for visual interest */}
      {/* Visual hierarchy: Icon draws attention, then title, then message */}
      <Icon name={icon} size={80} color={theme.colors.border} style={styles.icon} />

      {/* Clear, concise title */}
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>

      {/* Explanatory message in softer color */}
      {/* Color contrast ensures readability while maintaining hierarchy */}
      <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>

      {/* Optional call-to-action button */}
      {/* Provides users with a clear next step */}
      {actionText && onAction && (
        <Button variant="primary" onPress={onAction} style={styles.actionButton}>
          {actionText}
        </Button>
      )}
    </View>
  );
};

/**
 * StyleSheet for EmptyState component
 * Centered layout for visual balance
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    marginBottom: 16,
    opacity: 0.5, // Subtle icon for less visual weight
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  actionButton: {
    marginTop: 8,
  },
});

export default EmptyState;




