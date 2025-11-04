import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const DEFAULT_EMPLOYEE_USERNAME = 'nourishnetadmin';
const DEFAULT_EMPLOYEE_PASSWORD = 'Nouri$hNET';

const EmployeeLoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const expectedUser = process.env.EXPO_PUBLIC_EMPLOYEE_USERNAME || DEFAULT_EMPLOYEE_USERNAME;
      const expectedPass = process.env.EXPO_PUBLIC_EMPLOYEE_PASSWORD || DEFAULT_EMPLOYEE_PASSWORD;

      if (username.trim() === expectedUser && password === expectedPass) {
        navigation.replace('AdminDashboard');
      } else {
        Alert.alert('Access denied', 'Invalid employee credentials');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Employee Login</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
      />
      <TouchableOpacity
        onPress={handleLogin}
        disabled={submitting}
        style={[styles.button, { backgroundColor: theme.colors.primary, opacity: submitting ? 0.6 : 1 }]}
      >
        <Text style={[styles.buttonText, { color: theme.colors.surface }]}>{submitting ? 'Signing in…' : 'Sign In'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Platform.OS === 'web' ? 12 : 10,
    marginBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.02)'
  },
  button: { padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '700' },
});

export default EmployeeLoginScreen;


