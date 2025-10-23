import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

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

  console.log('Google Auth Redirect URI:', redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '834728778135-utaqgdlojjbvvbao6l6pts8lsa1dccsa.apps.googleusercontent.com',
    androidClientId: '834728778135-1q9sf93jb89t68nqv1itu6su6otntnrl.apps.googleusercontent.com',
    webClientId: '834728778135-cjaojtcrbovl43028pk6q4i6adhi7je0.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    redirectUri: redirectUri,
  });


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        await loadUserProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);


  const loadUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };


  const signup = async (email, password, userData) => {
    try {
      setError(null);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user: firebaseUser } = userCredential;


      await updateProfile(firebaseUser, {
        displayName: userData.name
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
          longitude: null
        },
        householdSize: userData.householdSize || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        verified: false,
        profileComplete: false
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userProfileData);
      setUserProfile(userProfileData);

      return { success: true, user: firebaseUser };
    } catch (error) {
      console.error('Signup error:', error);
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
      console.error('Signin error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };


  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };


  const updateUserProfile = async (updates) => {
    try {
      setError(null);
      if (!user) throw new Error('No user logged in');

      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), updatedData, { merge: true });
      setUserProfile(prev => ({ ...prev, ...updatedData }));


      if (updates.name) {
        await updateProfile(user, { displayName: updates.name });
      }

      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
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
                longitude: null
              },
              householdSize: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              verified: false,
              profileComplete: false,
              photoURL: firebaseUser.photoURL || null
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), userProfileData);
          }
        } catch (error) {
          console.error('Google sign-in error:', error);
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
      console.error('Google sign-in error:', error);
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
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

