import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, inMemoryPersistence, setPersistence, browserSessionPersistence } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyBFzJXSF8YwnnXjEBjw7NxDOLL7w4JxXjA',
  authDomain: 'mealsonwheels-275c2.firebaseapp.com',
  projectId: 'mealsonwheels-275c2',
  storageBucket: 'mealsonwheels-275c2.firebasestorage.app',
  messagingSenderId: '834728778135',
  appId: '1:834728778135:web:2535ee06df78b7f3144cd2',
  measurementId: 'G-209E40JXX7',
};

const app = initializeApp(firebaseConfig);

let auth;
if (Platform.OS === 'web') {
  // On web, use getAuth with session persistence
  // We'll manually sign out on app start in AuthContext to force login every time
  auth = getAuth(app);
  // Use session persistence instead of localStorage to reduce persistence window
  setPersistence(auth, browserSessionPersistence).catch((err) => {
    console.error('Failed to set auth persistence:', err);
  });
} else {
  // Disable persisted auth so users always see Splash/Login until they sign in
  auth = initializeAuth(app, { persistence: inMemoryPersistence });
}

let db;
if (Platform.OS === 'web') {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} else {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    }),
  });
}

const storage = getStorage(app);

export { auth, db, storage };
export default app;
