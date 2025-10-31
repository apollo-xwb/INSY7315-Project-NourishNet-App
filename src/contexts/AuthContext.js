import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/logger';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { registerForPushNotifications } from '../services/notificationService';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'nourishnet',
    useProxy: true,
  });

  logger.log('Google Auth Redirect URI:', redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '834728778135-utaqgdlojjbvvbao6l6pts8lsa1dccsa.apps.googleusercontent.com',
    androidClientId: '834728778135-1q9sf93jb89t68nqv1itu6su6otntnrl.apps.googleusercontent.com',
    webClientId: '834728778135-cjaojtcrbovl43028pk6q4i6adhi7je0.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    redirectUri: redirectUri,
  });

  useEffect(() => {
    // On web, always clear any persisted auth on app start to force login screen
    let isInitializing = true;
    
    const preventAutoLogin = async () => {
      if (typeof window !== 'undefined') {
        try {
          // Always sign out any existing session on web app start
          // This ensures users always see onboarding/login, not auto-login
          const currentUser = auth.currentUser;
          if (currentUser) {
            logger.log('Found persisted user on web, signing out to force login');
            await signOut(auth);
            // Wait a bit to ensure signOut completes
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          logger.error('Error preventing auto-login:', error);
        }
      }
    };

    const initializeAuth = async () => {
      // Sign out first (on web) before setting up listener to prevent auto-login
      await preventAutoLogin();
      
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        // On web, ignore the first auth state change if it's null (after our sign-out)
        if (isInitializing && typeof window !== 'undefined' && !firebaseUser) {
          logger.log('Ignoring initial null auth state after web sign-out');
          isInitializing = false;
          setUser(null);
          setUserProfile(null);
          setLoading(false);
          return;
        }
        
        // Mark initialization complete after first change
        if (isInitializing) {
          isInitializing = false;
        }
        
        if (firebaseUser) {
          setUser(firebaseUser);
          await loadUserProfile(firebaseUser.uid);
          await registerForPushNotifications(firebaseUser.uid);
        } else {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      });

      return unsubscribe;
    };

    let unsubscribe;
    initializeAuth().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    } catch (error) {
      logger.error('Error loading user profile:', error);
    }
  };

  const signup = async (email, password, userData) => {
    try {
      setError(null);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user: firebaseUser } = userCredential;

      await updateProfile(firebaseUser, {
        displayName: userData.name,
      });

      const userProfileData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: userData.name,
        phone: userData.phone || '',
        role: userData.role || 'recipient',
        location: userData.location || {
          address: '',
          latitude: null,
          longitude: null,
        },
        householdSize: userData.householdSize || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        verified: false,
        profileComplete: false,
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userProfileData);
      setUserProfile(userProfileData);

      return { success: true, user: firebaseUser };
    } catch (error) {
      logger.error('Signup error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const signin = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      logger.error('Signin error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      setError(null);
      // Clear user state first to trigger navigation change
      setUser(null);
      setUserProfile(null);
      // Then sign out from Firebase
      await signOut(auth);
      logger.log('Logout successful');
      return { success: true };
    } catch (error) {
      logger.error('Logout error:', error);
      setError(error.message);
      // Ensure state is cleared even if signOut fails
      setUser(null);
      setUserProfile(null);
      return { success: false, error: error.message };
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      setError(null);
      if (!user) throw new Error('No user logged in');

      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.uid), updatedData, { merge: true });
      setUserProfile((prev) => ({ ...prev, ...updatedData }));

      if (updates.name) {
        await updateProfile(user, { displayName: updates.name });
      }

      return { success: true };
    } catch (error) {
      logger.error('Update profile error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token, access_token } = response.params;

      const signInWithGoogleToken = async () => {
        try {
          const googleCredential = GoogleAuthProvider.credential(id_token || access_token);

          const userCredential = await signInWithCredential(auth, googleCredential);
          const { user: firebaseUser } = userCredential;

          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

          if (!userDoc.exists()) {
            const userProfileData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || '',
              phone: '',
              role: 'recipient',
              location: {
                address: '',
                latitude: null,
                longitude: null,
              },
              householdSize: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              verified: false,
              profileComplete: false,
              photoURL: firebaseUser.photoURL || null,
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), userProfileData);
          }
        } catch (error) {
          logger.error('Google sign-in error:', error);
          setError(error.message);
        }
      };

      signInWithGoogleToken();
    }
  }, [response]);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const result = await promptAsync();
      return { success: result.type === 'success' };
    } catch (error) {
      logger.error('Google sign-in error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    signup,
    signin,
    signInWithGoogle,
    logout,
    updateUserProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
