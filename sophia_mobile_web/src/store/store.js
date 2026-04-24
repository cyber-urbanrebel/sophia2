import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import chatReducer from './slices/chatSlice.js';
import filesReducer from './slices/filesSlice.js';
import settingsReducer from './slices/settingsSlice.js';
import onboardingReducer from './slices/onboardingSlice.js';
import { loadState, saveState, initializeSync } from './persist.js';

// Load persisted state but exclude auth/onboarding (they read their own localStorage keys)
const persisted = loadState();
const preloadedState = persisted
  ? { chat: persisted.chat, files: persisted.files, settings: persisted.settings }
  : undefined;

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    files: filesReducer,
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
  saveState({ chat: state.chat, files: state.files, settings: state.settings });
});

export default store;
