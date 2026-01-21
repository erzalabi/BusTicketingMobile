import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

// Import reducers
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';

// Configuration untuk Redux Persist
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'booking'],
  stateReconciler: autoMergeLevel2,
  timeout: 10000,
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  booking: bookingReducer,
});

// Buat persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store dengan middleware yang aman
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
          'auth/login/fulfilled',
          'auth/register/fulfilled',
          'booking/downloadTicket/fulfilled',
        ],
        ignoredActionPaths: [
          'meta.arg',
          'payload.timestamp',
          'payload.config',
          'payload.request',
        ],
        ignoredPaths: [
          'booking.ticketData',
          'auth.error',
          'booking.error',
          '_persist',
        ],
      },
      immutableCheck: false,
    }),
  
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

// Utility function untuk reset store (untuk logout)
export const resetStore = async () => {
  await persistor.purge();
  store.dispatch({ type: 'RESET_STORE' });
};

// Re-export semua actions dan selectors untuk kemudahan impor
export * from './slices/authSlice';
export * from './slices/bookingSlice';