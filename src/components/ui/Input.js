// Text input component with validation, error messages, and password visibility toggle
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from '../../utils/IconWrapper';
const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  type = 'text',
  error,
  helperText,
  icon,
  disabled = false,
  required = false,
  maxLength,
  multiline = false,
  numberOfLines = 1,
  style,
  ...rest
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Returns appropriate keyboard type based on input type
  const getKeyboardType = () => {
    const keyboardTypes = {
      email: 'email-address',
      phone: 'phone-pad',
      number: 'numeric',
      text: 'default',
      password: 'default',
    };
    return keyboardTypes[type] || 'default';
  };

  // Returns auto-capitalize setting based on input type
  const getAutoCapitalize = () => {
    if (type === 'email') return 'none';
    if (type === 'password') return 'none';
    return 'sentences';
  };

  const isSecureTextEntry = type === 'password' && !showPassword;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {label}
          {required && <Text style={[styles.required, { color: theme.colors.error }]}> *</Text>}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error
              ? theme.colors.error
              : isFocused
                ? theme.colors.primary
                : theme.colors.border,
          },
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
        ]}
      >
        {icon && (
          <Icon
            name={icon}
            size={20}
            color={error ? theme.colors.error : theme.colors.textSecondary}
            style={styles.icon}
          />
        )}

        <TextInput
          style={[styles.input, { color: theme.colors.text }, multiline && styles.multilineInput]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType={getKeyboardType()}
          autoCapitalize={getAutoCapitalize()}
          secureTextEntry={isSecureTextEntry}
          editable={!disabled}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          {...rest}
        />

        {type === 'password' && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.passwordToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name={showPassword ? 'visibility-off' : 'visibility'}
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.messageContainer}>
          <Icon name="error" size={16} color={theme.colors.error} style={styles.messageIcon} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        </View>
      )}

      {helperText && !error && (
        <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>{helperText}</Text>
      )}

      {maxLength && !error && !helperText && (
        <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
          {value?.length || 0} / {maxLength}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  inputContainerFocused: {
    borderWidth: 2,
  },
  inputContainerError: {
    borderWidth: 2,
  },
  inputContainerDisabled: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  icon: {
    marginRight: 8,
  },
  passwordToggle: {
    padding: 4,
    marginLeft: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  messageIcon: {
    marginRight: 4,
  },
  errorText: {
    fontSize: 12,
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    marginTop: 6,
  },
});

export default Input;




