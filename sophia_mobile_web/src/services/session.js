import api from './api.js';
import { logout } from '../store/slices/authSlice.js';

const EXTRA_AUTH_KEYS = ['sophia_dev_state_v1', 'sophia_state'];

function stripPersistedAuthBlobs() {
  EXTRA_AUTH_KEYS.forEach((key) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.auth) {
        delete parsed.auth;
        localStorage.setItem(key, JSON.stringify(parsed));
      }
    } catch {
      // Ignore malformed blobs.
    }
  });
}

export async function signOutUser(dispatch, navigate) {
  try {
    await api.logout();
  } catch {
    api.setToken(null);
  }
  dispatch(logout());
  stripPersistedAuthBlobs();
  if (navigate) {
    navigate('/auth', { replace: true });
  }
}
