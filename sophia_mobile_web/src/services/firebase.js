import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { FIREBASE_PUBLIC_CONFIG } from '../config/firebasePublic.js';

function pickConfig(source = {}) {
  return {
    apiKey: source.apiKey || '',
    authDomain: source.authDomain || '',
    projectId: source.projectId || '',
    storageBucket: source.storageBucket || '',
    messagingSenderId: source.messagingSenderId || '',
    appId: source.appId || '',
  };
}

function configIsReady(config) {
  return Boolean(config.apiKey && config.projectId && config.appId);
}

let app = null;
let auth = null;
let db = null;
let useFirebase = false;
let bootPromise = null;

async function resolveFirebaseConfig() {
  const fromVite = pickConfig({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  });
  if (configIsReady(fromVite)) return fromVite;

  try {
    const base = import.meta.env.VITE_API_URL || '';
    const response = await fetch(`${base}/api/public/firebase`);
    if (response.ok) {
      const fromHost = pickConfig(await response.json());
      if (configIsReady(fromHost)) return fromHost;
    }
  } catch {
    // Fall through to the bundled public config.
  }

  return pickConfig(FIREBASE_PUBLIC_CONFIG);
}

async function bootFirebase() {
  if (useFirebase && auth && db) return true;
  if (bootPromise) return bootPromise;

  bootPromise = (async () => {
    const firebaseConfig = await resolveFirebaseConfig();
    if (!configIsReady(firebaseConfig)) {
      console.error('Firebase config is missing.');
      return false;
    }
    try {
      app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      useFirebase = true;
      return true;
    } catch (error) {
      console.error('Firebase did not start.', error);
      useFirebase = false;
      return false;
    }
  })();

  const ok = await bootPromise;
  if (!ok) bootPromise = null;
  return ok;
}

const ensureFirebaseEnabled = () => {
  if (!useFirebase || !auth || !db) {
    throw new Error('Firebase is not connected. Enable Email/Password and Google in the Sophia Firebase project.');
  }
};

const getUserUid = () => {
  ensureFirebaseEnabled();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Firebase user not signed in.');
  }
  return user.uid;
};

async function firebaseRegister(email, password, firstName, lastName) {
  ensureFirebaseEnabled();
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const user = result.user;

  const profile = {
    email,
    firstName: firstName || '',
    lastName: lastName || '',
    createdAt: serverTimestamp(),
  };

  void setDoc(doc(db, 'users', user.uid), profile).catch((error) => {
    console.warn('Firebase profile sync failed after registration:', error);
  });

  return {
    user: { uid: user.uid, email, firstName, lastName },
    token: await user.getIdToken(),
  };
}

async function firebaseLogin(email, password) {
  ensureFirebaseEnabled();
  const result = await signInWithEmailAndPassword(auth, email, password);
  const user = result.user;

  return {
    user: { uid: user.uid, email: user.email },
    token: await user.getIdToken(),
  };
}

function profileFromFirebaseUser(user) {
  const displayName = String(user.displayName || '').trim();
  const parts = displayName.split(/\s+/).filter(Boolean);
  return {
    uid: user.uid,
    id: user.uid,
    email: user.email,
    name: displayName || (user.email ? user.email.split('@')[0] : 'Sophia User'),
    fullName: displayName,
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
    avatar: user.photoURL || null,
  };
}

async function firebaseLoginWithGoogle() {
  ensureFirebaseEnabled();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const profile = profileFromFirebaseUser(user);

  void setDoc(
    doc(db, 'users', user.uid),
    {
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatar: profile.avatar,
      provider: 'google',
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  ).catch((error) => {
    console.warn('Firebase profile sync failed after Google sign-in:', error);
  });

  return {
    user: profile,
    token: await user.getIdToken(),
  };
}

async function firebaseLogout() {
  ensureFirebaseEnabled();
  await signOut(auth);
  return { message: 'Logged out' };
}

async function firebaseForgotPassword(email) {
  ensureFirebaseEnabled();
  await sendPasswordResetEmail(auth, email);
  return { message: 'Password reset email sent' };
}

async function firebaseRefreshToken() {
  ensureFirebaseEnabled();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user signed in to refresh token.');
  }
  const token = await user.getIdToken(true);
  return { token };
}

async function firebaseGetProfile() {
  ensureFirebaseEnabled();
  const uid = getUserUid();
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) {
    return profileFromFirebaseUser(auth.currentUser);
  }
  return { uid, ...userDoc.data(), email: auth.currentUser?.email || userDoc.data().email };
}

async function firebaseUpdateProfile(data) {
  ensureFirebaseEnabled();
  const uid = getUserUid();
  await setDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
  const userDoc = await getDoc(doc(db, 'users', uid));
  return { uid, ...userDoc.data() };
}

async function getCollectionData(collectionName) {
  ensureFirebaseEnabled();
  const uid = getUserUid();
  const q = collection(db, 'users', uid, collectionName);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
}

async function addCollectionItem(collectionName, data) {
  ensureFirebaseEnabled();
  const uid = getUserUid();
  const colRef = collection(db, 'users', uid, collectionName);
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: data.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: docRef.id, ...data };
}

async function updateCollectionItem(collectionName, id, data) {
  ensureFirebaseEnabled();
  const uid = getUserUid();
  const docRef = doc(db, 'users', uid, collectionName, id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() }).catch(async () => {
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  });
  const updatedDoc = await getDoc(docRef);
  return { id: updatedDoc.id, ...updatedDoc.data() };
}

async function deleteCollectionItem(collectionName, id) {
  ensureFirebaseEnabled();
  const uid = getUserUid();
  await deleteDoc(doc(db, 'users', uid, collectionName, id));
  return { id, deleted: true };
}

async function completeCollectionItem(collectionName, id) {
  return updateCollectionItem(collectionName, id, { completed: true, completedAt: serverTimestamp() });
}

async function firebaseGetHabitStats() {
  const habits = await getCollectionData('habits');
  return {
    total: habits.length,
    completed: habits.filter((h) => h.completed).length,
    active: habits.filter((h) => !h.completed).length,
  };
}

async function firebaseGetJournalStats() {
  const entries = await getCollectionData('journal');
  return {
    total: entries.length,
    today: entries.filter((e) => new Date(e.createdAt || e.updatedAt || e.date).toDateString() === new Date().toDateString()).length,
  };
}

async function firebaseGetStudyStats() {
  const sessions = await getCollectionData('study');
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  return {
    totalSessions: sessions.length,
    totalMinutes,
  };
}

export {
  useFirebase,
  bootFirebase,
  db,
  getUserUid,
  firebaseRegister,
  firebaseLogin,
  firebaseLoginWithGoogle,
  firebaseLogout,
  firebaseForgotPassword,
  firebaseGetProfile,
  firebaseUpdateProfile,
  getCollectionData,
  addCollectionItem,
  updateCollectionItem,
  deleteCollectionItem,
  completeCollectionItem,
  firebaseGetHabitStats,
  firebaseGetJournalStats,
  firebaseGetStudyStats,
  firebaseRefreshToken,
};
