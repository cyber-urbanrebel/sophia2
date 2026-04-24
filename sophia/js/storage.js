/* ═══════════════════════════════════════════════════════════
   STORAGE.JS — localStorage Abstraction Layer
   ═══════════════════════════════════════════════════════════ */

const Storage = (() => {
  const KEYS = {
    AUTH: 'sophia_auth',
    HABITS: 'sophia_habits',
    GOALS: 'sophia_goals',
    TASKS: 'sophia_tasks',
    JOURNAL: 'sophia_journal',
    CONTENT: 'sophia_content',
    WORKOUTS: 'sophia_workouts',
    METRICS: 'sophia_metrics',
    PROGRESS: 'sophia_progress',
    SETTINGS: 'sophia_settings',
    USERS_DB: 'sophia_users_db',
    CONTENT_DB: 'sophia_content_db',
  };

  const listeners = {};

  function get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error(`Storage.get error [${key}]:`, e);
      return null;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      emit(key, value);
      return true;
    } catch (e) {
      console.error(`Storage.set error [${key}]:`, e);
      return false;
    }
  }

  function remove(key) {
    try {
      localStorage.removeItem(key);
      emit(key, null);
    } catch (e) {
      console.error(`Storage.remove error [${key}]:`, e);
    }
  }

  // ── CRUD helpers for array-based stores ──

  function getAll(key) {
    return get(key) || [];
  }

  function getById(key, id) {
    return getAll(key).find(item => item.id === id) || null;
  }

  function create(key, item) {
    const items = getAll(key);
    item.id = item.id || uid();
    item.createdAt = item.createdAt || new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    items.push(item);
    set(key, items);
    return item;
  }

  function update(key, id, updates) {
    const items = getAll(key);
    const idx = items.findIndex(item => item.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
    set(key, items);
    return items[idx];
  }

  function deleteItem(key, id) {
    const items = getAll(key);
    const filtered = items.filter(item => item.id !== id);
    if (filtered.length === items.length) return false;
    set(key, filtered);
    return true;
  }

  function query(key, filterFn) {
    return getAll(key).filter(filterFn);
  }

  // ── Event system for reactive UI ──
  function on(key, callback) {
    if (!listeners[key]) listeners[key] = [];
    listeners[key].push(callback);
    return () => {
      listeners[key] = listeners[key].filter(cb => cb !== callback);
    };
  }

  function emit(key, value) {
    if (listeners[key]) {
      listeners[key].forEach(cb => {
        try { cb(value); } catch (e) { console.error('Storage listener error:', e); }
      });
    }
  }

  // ── Auth specific ──
  function getAuth() {
    return get(KEYS.AUTH) || { user: null, session: null };
  }

  function setAuth(auth) {
    return set(KEYS.AUTH, auth);
  }

  function getUser() {
    return getAuth().user;
  }

  function isLoggedIn() {
    const auth = getAuth();
    return !!(auth.user && auth.session);
  }

  function isAdmin() {
    const user = getUser();
    return user && user.role === 'admin';
  }

  // ── Progress ──
  function getProgress() {
    return get(KEYS.PROGRESS) || {
      xp: 0,
      level: 1,
      domainScores: {
        physical: 0, mental: 0, emotional: 0, spiritual: 0,
        professional: 0, financial: 0, relationships: 0, creative: 0,
      },
      weeklyData: [],
    };
  }

  function addXP(amount, domain) {
    const progress = getProgress();
    progress.xp += amount;
    progress.level = Math.floor(progress.xp / 500) + 1;
    if (domain && progress.domainScores[domain] !== undefined) {
      progress.domainScores[domain] = Math.min(100, progress.domainScores[domain] + Math.round(amount / 5));
    }
    set(KEYS.PROGRESS, progress);
    return progress;
  }

  // ── Settings ──
  function getSettings() {
    return get(KEYS.SETTINGS) || {
      theme: 'dark',
      reminders: true,
      reflectionTime: '21:00',
      privacy: { showStreak: true, showLevel: true },
    };
  }

  // ── Utility ──
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  }

  function clear() {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  }

  function hasData() {
    return get(KEYS.AUTH) !== null;
  }

  return {
    KEYS,
    get, set, remove,
    getAll, getById, create, update, delete: deleteItem, query,
    on,
    getAuth, setAuth, getUser, isLoggedIn, isAdmin,
    getProgress, addXP,
    getSettings,
    uid, clear, hasData,
  };
})();
