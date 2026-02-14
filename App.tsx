import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Text } from 'react-native';
import { store, persistor } from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';
import { initializeFirebase } from './src/config/firebaseInit';

export default function App() {
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Firebase when app starts
    const setupFirebase = async () => {
      try {
        await initializeFirebase();
        setFirebaseInitialized(true);
        console.log('Firebase initialized successfully');
      } catch (error) {
        console.error('Firebase initialization error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setFirebaseError(errorMessage);
        // Continue without Firebase for development
        setFirebaseInitialized(true);
      }
    };

    setupFirebase();
  }, []);

  // Show loading screen while Firebase initializes
  if (!firebaseInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Initializing Firebase...</Text>
      </View>
    );
  }

  // Show error if Firebase failed to initialize (but continue anyway)
  if (firebaseError) {
    console.warn('App running without Firebase:', firebaseError);
  }

  return (
    <Provider store={store}>
      <PersistGate 
        loading={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        } 
        persistor={persistor}
      >
        <RootNavigator />
        <StatusBar style="auto" />
      </PersistGate>
    </Provider>
  );
}
