import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../utils/IconWrapper';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import logger from '../utils/logger';

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import PostDonationScreen from '../screens/PostDonationScreen';
import DonationDetailsScreen from '../screens/DonationDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ChatScreen from '../screens/ChatScreen';
import ChatsListScreen from '../screens/ChatsListScreen';
import MyClaimsScreen from '../screens/MyClaimsScreen';
import DonationHistoryScreen from '../screens/DonationHistoryScreen';
import CompleteProfileScreen from '../screens/CompleteProfileScreen';
import EmployeeLoginScreen from '../screens/EmployeeLoginScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Post') {
            iconName = 'add-circle';
          } else if (route.name === 'Chats') {
            iconName = 'chat';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else if (route.name === 'Activity') {
            iconName = 'inventory';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          height: 62 + Math.max(insets.bottom, 8),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 0,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.surface,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      {/* Swap to make Post central and prominent */}
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('home') }} />
      <Tab.Screen name="Chats" component={ChatsListScreen} options={{ title: 'Chats' }} />
      <Tab.Screen
        name="Post"
        component={PostDonationScreen}
        options={{
          title: t('post'),
          tabBarIcon: ({ color, size }) => (
            <View pointerEvents="box-none" style={{
              backgroundColor: theme.colors.primary,
              padding: 10,
              borderRadius: 28,
              marginTop: -20,
              elevation: 6,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: 3 },
              shadowRadius: 4,
            }}>
              <Icon name="add" size={size + 10} color={theme.colors.surface} />
            </View>
          ),
          tabBarLabel: '',
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('profile') }} />
      <Tab.Screen
        name="Activity"
        component={DonationHistoryScreen}
        options={{
          title: 'Activity',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [checkingFirstLaunch, setCheckingFirstLaunch] = useState(true);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const hasLaunched = await AsyncStorage.getItem('@nourishnet_has_launched');

      if (hasLaunched === null) {
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    } catch (error) {
      logger.error('Error checking first launch:', error);
      setIsFirstLaunch(false);
    } finally {
      setCheckingFirstLaunch(false);
    }
  };

  useEffect(() => {
    if (isFirstLaunch === false && !user) {
      setCheckingFirstLaunch(false);
    }
  }, [isFirstLaunch, user]);

  if (authLoading || checkingFirstLaunch) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer key={user ? 'authenticated' : 'unauthenticated'}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isFirstLaunch ? (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            initialParams={{
              onComplete: () => {
                setIsFirstLaunch(false);
                checkFirstLaunch();
              },
            }}
          />
        ) : !user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
              name="EmployeeLogin"
              component={EmployeeLoginScreen}
              options={{ headerShown: true, title: 'Employee Login', headerStyle: { backgroundColor: '#84bd00' }, headerTintColor: '#FFFFFF' }}
            />
            {/*employee (non-auth) access */}
            <Stack.Screen
              name="AdminDashboard"
              component={AdminDashboardScreen}
              options={{
                headerShown: true,
                title: 'Admin Dashboard',
                headerStyle: { backgroundColor: '#84bd00' },
                headerTintColor: '#FFFFFF',
                headerBackTitle: 'Back',
              }}
            />
          </>
        ) : !userProfile?.profileComplete ||
          !userProfile?.phone ||
          !userProfile?.location?.address ? (
          <Stack.Screen
            name="CompleteProfile"
            component={CompleteProfileScreen}
            options={{
              headerShown: false,
            }}
          />
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabNavigator}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="DonationDetails"
              component={DonationDetailsScreen}
              options={{
                headerShown: true,
                title: 'Donation Details',
                headerStyle: { backgroundColor: '#84bd00' },
                headerTintColor: '#FFFFFF',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{
                headerShown: true,
                title: 'Chat',
                headerStyle: { backgroundColor: '#84bd00' },
                headerTintColor: '#FFFFFF',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="MyClaims"
              component={MyClaimsScreen}
              options={{
                headerShown: true,
                title: 'My Claims',
                headerStyle: { backgroundColor: '#84bd00' },
                headerTintColor: '#FFFFFF',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="DonationHistory"
              component={DonationHistoryScreen}
              options={{
                headerShown: true,
                title: 'My Activity',
                headerStyle: { backgroundColor: '#84bd00' },
                headerTintColor: '#FFFFFF',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="Alerts"
              component={AlertsScreen}
              options={{
                headerShown: true,
                title: t('alerts'),
                headerStyle: { backgroundColor: '#84bd00' },
                headerTintColor: '#FFFFFF',
                headerBackTitle: 'Back',
              }}
            />
            {/* AdminDashboard also available post-auth*/}
            <Stack.Screen
              name="AdminDashboard"
              component={AdminDashboardScreen}
              options={{
                headerShown: true,
                title: 'Admin Dashboard',
                headerStyle: { backgroundColor: '#84bd00' },
                headerTintColor: '#FFFFFF',
                headerBackTitle: 'Back',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
