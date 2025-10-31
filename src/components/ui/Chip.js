// Chip component for displaying categories, tags, and status indicators
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from '../../utils/IconWrapper';
const Chip = ({ label, icon, onPress, onDelete, selected = false, variant = 'filled', style }) => {
  const { theme } = useTheme();

  // Returns chip styles based on variant and selection state
  const getChipStyle = () => {
    if (selected) {
      return {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
      };
    }

    if (variant === 'outlined') {
      return {
        backgroundColor: 'transparent',
        borderColor: theme.colors.border,
      };
    }

    return {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
    };
  };

  const getTextStyle = () => {
    if (selected) {
      return { color: theme.colors.surface };
    }
    return { color: theme.colors.text };
  };

  const getIconColor = () => {
    if (selected) {
      return theme.colors.surface;
    }
    return theme.colors.textSecondary;
  };

  // Renders chip content with optional icon and delete button
  const ChipContent = () => (
    <View style={[styles.chip, getChipStyle(), style]}>
      {icon && <Icon name={icon} size={18} color={getIconColor()} style={styles.iconLeft} />}

      <Text style={[styles.label, getTextStyle()]} numberOfLines={1}>
        {label}
      </Text>

      {onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="close" size={16} color={getIconColor()} />
        </TouchableOpacity>
      )}
    </View>
  );

  // If onPress is provided, wrap in TouchableOpacity to make it interactive
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <ChipContent />
      </TouchableOpacity>
    );
  }

  return <ChipContent />;
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  iconLeft: {
    marginRight: 6,
  },
  deleteButton: {
    marginLeft: 4,
    padding: 2,
  },
});

export default Chip;




