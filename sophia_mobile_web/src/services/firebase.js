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

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const wantsFirebase = import.meta.env.VITE_USE_FIREBASE === 'true';
const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

let app = null;
let auth = null;
let db = null;
let useFirebase = false;

if (wantsFirebase && hasFirebaseConfig) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    useFirebase = true;
  } catch (error) {
    console.error('Firebase did not start. Using the Sophia API instead.', error);
  }
}

const ensureFirebaseEnabled = () => {
  if (!useFirebase) {
    throw new Error('Firebase support is not enabled. Set VITE_USE_FIREBASE=true in .env.');
  }
  if (!auth || !db) {
    throw new Error('Firebase is not initialized. Check configuration values.');
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
    throw new Error('Profile not found');
  }
  return { uid, ...userDoc.data() };
}

async function firebaseUpdateProfile(data) {
  ensureFirebaseEnabled();
  const uid = getUserUid();
  await updateDoc(doc(db, 'users', uid), data);
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
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
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
