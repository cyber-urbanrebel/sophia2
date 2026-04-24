import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  darkMode: true,
  notifications: false,
  autoSave: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
    },
    toggleNotifications(state) {
      state.notifications = !state.notifications;
    },
    toggleAutoSave(state) {
      state.autoSave = !state.autoSave;
    },
  },
});

export const { toggleDarkMode, toggleNotifications, toggleAutoSave } = settingsSlice.actions;
export default settingsSlice.reducer;
