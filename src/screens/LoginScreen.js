import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../utils/IconWrapper';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/AlertContext';
import sanitize from '../utils/sanitize';

const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { signin, signInWithGoogle } = useAuth();
  const { showError } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Client-side validation: ensure both fields are provided
    if (!email.trim() || !password.trim()) {
      showError('Please fill in all fields');
      return;
    }

    // Set loading state to disable button and show feedback
    setIsLoading(true);

    try {
      // Sanitize inputs to remove potentially malicious characters (XSS prevention)
      const cleanEmail = sanitize(email.trim());
      const cleanPassword = sanitize(password);
      
      // Call authentication service which handles Firebase Auth
      const result = await signin(cleanEmail, cleanPassword);

      // If authentication fails, show specific error message to user
      if (!result.success) {
        showError(result.error || 'Login failed. Please check your credentials.');
      }
      // On success, navigation is handled automatically by AuthContext and AppNavigator
    } catch (error) {
      // Catch any unexpected errors and show generic message (security: don't leak details)
      showError('Login failed. Please try again.');
    } finally {
      // Always reset loading state, even if authentication fails
      setIsLoading(false);
    }
  };

  /**
   * Handles Google OAuth sign-in
   * - Opens Google sign-in flow via expo-auth-session
   * - Handles redirect and token exchange
   * - Shows appropriate error messages
   */
  const handleGoogleSignIn = async () => {
    // Set loading state during OAuth flow
    setIsLoading(true);

    try {
      // Initiates Google OAuth flow (opens browser/Google sign-in page)
      const result = await signInWithGoogle();

      // Check if OAuth flow completed successfully
      if (!result.success) {
        showError(result.error || 'Google sign-in failed. Please try again.');
      }
      // On success, AuthContext handles navigation automatically
    } catch (error) {
      // Handle any errors during OAuth flow
      showError('Google sign-in failed. Please try again.');
    } finally {
      // Reset loading state when done
      setIsLoading(false);
    }
  };

  /**
   * Placeholder for password reset functionality
   * Currently shows alert, will integrate Firebase Auth password reset in future
   */
  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      'Password reset functionality will be implemented with Firebase Auth.',
      [{ text: 'OK' }],
    );
  };

  return (
    // SafeAreaView ensures content doesn't overlap with system UI (notch, status bar)
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* KeyboardAvoidingView prevents keyboard from covering input fields */}
      {/* iOS uses 'padding', Android uses 'height' due to different keyboard behaviors */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {/* ScrollView allows content to scroll if keyboard takes up space */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header section: App logo and welcome text */}
          <View style={styles.header}>
            {/* App logo image */}
            <Image source={require('../UTurn.png')} style={styles.logo} resizeMode="contain" />
            {/* App name text with theme-aware color */}
            <Text style={[styles.appName, { color: theme.colors.text }]}>{t('appName')}</Text>
            {/* Welcome message translated based on user's language preference */}
            <Text style={[styles.welcomeText, { color: theme.colors.textSecondary }]}>
              {t('welcome')}
            </Text>
          </View>

          {/* Form container: Contains all login inputs and buttons */}
          <View style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
            {/* Form title */}
            <Text style={[styles.formTitle, { color: theme.colors.text }]}>{t('login')}</Text>

            {/* Email input field */}
            <View style={styles.inputContainer}>
              <Icon
                name="email"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder={t('email')}
                placeholderTextColor={theme.colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel={t('email')}
              />
            </View>

            {}
            <View style={styles.inputContainer}>
              <Icon
                name="lock"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder={t('password')}
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                accessibilityLabel={t('password')}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {}
            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
              <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
                {t('forgotPassword')}
              </Text>
            </TouchableOpacity>

            {}
            <TouchableOpacity
              style={[
                styles.loginButton,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: isLoading ? 0.7 : 1,
                },
              ]}
              onPress={handleLogin}
              disabled={isLoading}
              accessibilityLabel={t('login')}
              accessibilityRole="button"
            >
              <Text style={[styles.loginButtonText, { color: theme.colors.surface }]}>
                {isLoading ? t('loading') : t('login')}
              </Text>
            </TouchableOpacity>

            {}
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>OR</Text>
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            </View>

            {}
            <TouchableOpacity
              style={[styles.googleButton, { borderColor: theme.colors.border }]}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              accessibilityLabel="Sign in with Google"
              accessibilityRole="button"
            >
              <View style={styles.googleIconContainer}>
                <Text style={styles.googleG}>G</Text>
              </View>
              <Text style={[styles.googleButtonText, { color: theme.colors.text }]}>
                Continue with Google
              </Text>
            </TouchableOpacity>

            {}
            <View style={styles.registerContainer}>
              <Text style={[styles.registerText, { color: theme.colors.textSecondary }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.registerLink, { color: theme.colors.primary }]}>
                  {t('signUp')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
    elevation: 5,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
  },
  formContainer: {
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F9F9F9',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleG: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DB4437',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
  },
  registerLink: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
