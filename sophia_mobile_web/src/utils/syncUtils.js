/**
 * Data Sync Utilities
 * Provides real-time data synchronization across components
 * when localStorage data is updated
 */

const DATA_KEYS = [
  'sophia_habits',
  'sophia_pomodoro_sessions',
  'sophia_journal',
  'sophia_xp_state',
  'sophia_streak',
  'sophia_tasks',
  'sophia_goals',
  'sophia_workouts',
  'sophia_meals',
  'sophia_sleep',
  'sophia_body_stats',
  'sophia_hydration_log',
  'sophia_challenges',
  'disc_habits',
  'disc_habit_completions',
  'disc_journal',
  'disc_schedule',
  'disc_schedule_done',
  'disc_goals',
  'mind_mood',
  'mind_meditations',
  'mind_journal',
  'progress_daily_steps',
];

/**
 * Emit a data update event when data is saved to localStorage
 * This allows components to listen and update in real-time
 */
export function broadcastDataUpdate(key) {
  if (DATA_KEYS.includes(key)) {
    // Emit custom event for components to listen to
    window.dispatchEvent(
      new CustomEvent('sophia-data-updated', {
        detail: { key, timestamp: Date.now() },
      })
    );
  }
}

/**
 * Wrap localStorage.setItem to automatically broadcast updates
 */
export function setSophiaData(key, value) {
  try {
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, jsonValue);
    broadcastDataUpdate(key);
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    return false;
  }
}

/**
 * Get data from localStorage
 */
export function getSophiaData(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Hook to listen for data updates
 * Usage: const unsubscribe = onSophiaDataUpdate(callback);
 */
export function onSophiaDataUpdate(callback) {
  const handleUpdate = (event) => {
    callback(event.detail);
  };

  window.addEventListener('sophia-data-updated', handleUpdate);

  // Return unsubscribe function
  return () => {
    window.removeEventListener('sophia-data-updated', handleUpdate);
  };
}

/**
 * Use this in setters to ensure automatic broadcasting
 * Example: useStateWithSync('myKey', initialValue)
 */
export function createSyncedLocalStorage(key, initialValue) {
  return {
    get: () => getSophiaData(key, initialValue),
    set: (value) => setSophiaData(key, value),
    clear: () => {
      localStorage.removeItem(key);
      broadcastDataUpdate(key);
    },
  };
}
