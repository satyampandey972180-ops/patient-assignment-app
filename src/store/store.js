import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

import themeReducer from './themeSlice';
import authReducer from './authSlice';
import patientsReducer from './patientSlice';
import recordsReducer from './recordsSlice';

// Combine all reducers
const rootReducer = combineReducers({
  theme: themeReducer,
  auth: authReducer,
  patients: patientsReducer,
  records: recordsReducer,
});

// Configure persist
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['theme', 'auth', 'patients', 'records'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
