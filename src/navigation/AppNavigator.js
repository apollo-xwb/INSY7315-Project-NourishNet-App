import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform, ActivityIndicator } from 'react-native';
import Icon from '../utils/IconWrapper';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';


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

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


const MainTabNavigator = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

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
          } else if (route.name === 'Alerts') {
            iconName = 'notifications';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 5,
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
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: t('home') }}
      />
      <Tab.Screen
        name="Post"
        component={PostDonationScreen}
        options={{ title: t('post') }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsListScreen}
        options={{ title: 'Chats' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('profile') }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{ title: t('alerts') }}
      />
    </Tab.Navigator>
  );
};


const AppNavigator = () => {
  const { theme } = useTheme();
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
      console.error('Error checking first launch:', error);
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
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isFirstLaunch ? (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            initialParams={{
              onComplete: () => {
                setIsFirstLaunch(false);
                checkFirstLaunch();
              }
            }}
          />
        ) : !user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : !userProfile?.profileComplete || !userProfile?.phone || !userProfile?.location?.address ? (
          <Stack.Screen
            name="CompleteProfile"
            component={CompleteProfileScreen}
            options={{
              headerShown: false,
            }}
          />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen
              name="DonationDetails"
              component={DonationDetailsScreen}
              options={{
                headerShown: true,
                title: 'Donation Details',
                headerStyle: { backgroundColor: '#2E7D32' },
                headerTintColor: '#FFFFFF',
              }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{
                headerShown: true,
                title: 'Chat',
                headerStyle: { backgroundColor: '#2E7D32' },
                headerTintColor: '#FFFFFF',
              }}
            />
            <Stack.Screen
              name="MyClaims"
              component={MyClaimsScreen}
              options={{
                headerShown: true,
                title: 'My Claims',
                headerStyle: { backgroundColor: '#2E7D32' },
                headerTintColor: '#FFFFFF',
              }}
            />
            <Stack.Screen
              name="DonationHistory"
              component={DonationHistoryScreen}
              options={{
                headerShown: true,
                title: 'My Activity',
                headerStyle: { backgroundColor: '#2E7D32' },
                headerTintColor: '#FFFFFF',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
