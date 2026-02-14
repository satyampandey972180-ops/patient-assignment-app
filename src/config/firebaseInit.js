import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebaseConfig from './firebase';

let authInstance = null;

/**
 * Initialize Firebase and return service instances
 * @returns {Object} Firebase service instances
 */
export const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    // Initialize Auth with AsyncStorage persistence
    if (!authInstance) {
      try {
        authInstance = initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });
      } catch (error) {
        // If auth is already initialized, get the existing instance
        authInstance = getAuth(app);
      }
    }
    
    const firestore = getFirestore(app);
    
    return {
      app,
      auth: authInstance,
      firestore,
    };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

// Export for convenience
export { getAuth, getFirestore };
