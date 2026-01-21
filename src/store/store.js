import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';

// Persist config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'booking'],
  stateReconciler: (inboundState, originalState) => ({
    ...originalState,
    ...inboundState,
    auth: {
      ...originalState.auth,
      ...inboundState.auth,
      isLoading: false,
      error: null,
    },
    booking: {
      ...originalState.booking,
      ...inboundState.booking,
      loading: false,
      error: null,
      busLoading: false,
      busError: null,
      seatLoading: false,
      seatError: null,
    },
  }),
};

const rootReducer = combineReducers({
  auth: authReducer,
  booking: bookingReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
          'booking/downloadTicket/fulfilled',
        ],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: [
          'booking.ticketData',
          'booking.downloadTicket',
          'auth.user.avatar',
          '_persist',
        ],
      },
    }),
});

export const persistor = persistStore(store);