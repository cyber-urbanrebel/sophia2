import { createSlice } from '@reduxjs/toolkit';

const AUTH_TOKEN_KEY = 'sophia-auth-token';
const USER_PROFILE_KEY = 'sophia-user-profile';

function loadPersistedAuthState() {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const profile = localStorage.getItem(USER_PROFILE_KEY);
    if (token && profile) {
      return {
        isAuthenticated: true,
        user: JSON.parse(profile),
        token,
        error: null,
      };
    }
  } catch {
    // Ignore invalid persisted state
  }
  return null;
}

const initialState = loadPersistedAuthState() || {
  isAuthenticated: false,
  user: null,
  token: null,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      localStorage.setItem(AUTH_TOKEN_KEY, action.payload.token);
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(action.payload.user));
    },
    loginFailure(state, action) {
      state.error = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_PROFILE_KEY);
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const { loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
