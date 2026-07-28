import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import settingsReducer from './slices/settingsSlice.js';
import onboardingReducer from './slices/onboardingSlice.js';
import { loadState, saveState, initializeSync } from './persist.js';

// Load persisted state but exclude auth/onboarding (they read their own localStorage keys)
const persisted = loadState();
const preloadedState = persisted
  ? { settings: persisted.settings }
  : undefined;

const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
    onboarding: onboardingReducer,
  },
  preloadedState,
  devTools: true,
});

// Initialize Firestore sync
initializeSync(store);

// Subscribe to localStorage saves — only persist non-auth slices
store.subscribe(() => {
  const state = store.getState();
  saveState({ settings: state.settings });
});

export default store;
