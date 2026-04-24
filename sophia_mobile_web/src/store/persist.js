const STORAGE_KEY = 'sophia_dev_state_v1';

export function loadState() {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return undefined;
    return JSON.parse(serialized);
  } catch (error) {
    return undefined;
  }
}

export function saveState(state) {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    // ignore write errors
  }
}

// Firebase Firestore sync functions — lazy loaded to avoid import crashes
export async function syncToFirestore(state) {
  try {
    const { db, getUserUid } = await import('../services/firebase.js');
    if (!db) return;

    const { doc, setDoc } = await import('firebase/firestore');
    const userId = getUserUid();
    const userDocRef = doc(db, 'userData', userId);

    await setDoc(userDocRef, { ...state, lastSynced: new Date().toISOString() }, { merge: true });
  } catch (error) {
    // Silently fail — firebase is optional
  }
}

export async function initializeSync(store) {
  try {
    const { db } = await import('../services/firebase.js');
    if (!db) return;

    setInterval(() => {
      syncToFirestore(store.getState());
    }, 30000);

    window.addEventListener('beforeunload', () => {
      syncToFirestore(store.getState());
    });
  } catch (error) {
    // Silently fail — firebase is optional
  }
}
