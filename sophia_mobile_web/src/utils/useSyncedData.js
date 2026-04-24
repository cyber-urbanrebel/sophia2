import { useState, useEffect, useCallback } from 'react';
import { getSophiaData, onSophiaDataUpdate } from './syncUtils.js';

/**
 * useSyncedData Hook
 * Automatically syncs data from localStorage and updates in real-time
 * 
 * Usage:
 *   const [data, setData] = useSyncedData('sophia_habits', []);
 *   
 * The component will automatically re-render whenever data changes
 */
export function useSyncedData(key, initialValue) {
  const [data, setData] = useState(() => getSophiaData(key, initialValue));
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  useEffect(() => {
    // Listen for updates to this specific key
    const unsubscribe = onSophiaDataUpdate(({ key: updatedKey, timestamp }) => {
      if (updatedKey === key) {
        // Fetch fresh data from localStorage
        setData(getSophiaData(key, initialValue));
        setLastUpdated(timestamp);
      }
    });

    // Also poll every 1 second to catch updates from same-tab changes
    const pollInterval = setInterval(() => {
      setData(getSophiaData(key, initialValue));
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [key, initialValue]);

  return [data, lastUpdated];
}

/**
 * useMultipleSyncedData Hook
 * Watch multiple keys at once
 * 
 * Usage:
 *   const data = useMultipleSyncedData({
 *     habits: ['sophia_habits', []],
 *     tasks: ['sophia_tasks', []],
 *     journal: ['sophia_journal', []],
 *   });
 *   // Access as: data.habits, data.tasks, data.journal
 */
export function useMultipleSyncedData(keyMap) {
  const [data, setData] = useState(() => {
    const result = {};
    Object.entries(keyMap).forEach(([name, [key, defaultValue]]) => {
      result[name] = getSophiaData(key, defaultValue);
    });
    return result;
  });

  useEffect(() => {
    const unsubscribe = onSophiaDataUpdate(({ key: updatedKey }) => {
      // Update if any of our watched keys changed
      Object.entries(keyMap).forEach(([name, [watchKey]]) => {
        if (watchKey === updatedKey) {
          setData((prev) => ({
            ...prev,
            [name]: getSophiaData(watchKey, keyMap[name][1]),
          }));
        }
      });
    });

    // Also poll for updates
    const pollInterval = setInterval(() => {
      setData((prev) => {
        const updated = { ...prev };
        let hasChanges = false;

        Object.entries(keyMap).forEach(([name, [key, defaultValue]]) => {
          const fresh = getSophiaData(key, defaultValue);
          if (JSON.stringify(fresh) !== JSON.stringify(updated[name])) {
            updated[name] = fresh;
            hasChanges = true;
          }
        });

        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [keyMap]);

  return data;
}
