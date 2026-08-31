/**
 * API Service Layer
 * Centralized API calls to backend (Node.js Express on port 3001)
 * with optional Firebase Firestore fallback.
 */
import {
  bootFirebase,
  useFirebase,
  firebaseRegister,
  firebaseLogin,
  firebaseLoginWithGoogle,
  firebaseLogout,
  firebaseForgotPassword,
  firebaseGetProfile,
  firebaseUpdateProfile,
  firebaseRefreshToken,
  getCollectionData,
  addCollectionItem,
  updateCollectionItem,
  deleteCollectionItem,
  completeCollectionItem,
  firebaseGetHabitStats,
  firebaseGetJournalStats,
  firebaseGetStudyStats,
} from './firebase.js';

const API_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? 'http://localhost:3001' : '');
const STATE_STORAGE_KEYS = ['sophia_dev_state_v1', 'sophia_state'];
const AUTH_TOKEN_KEY = 'sophia-auth-token';
const LOCAL_ACCOUNTS_KEY = 'sophia-local-accounts';

const AUTH_UNAVAILABLE = 'Firebase is not connected. Enable Email/Password and Google sign-in in the Sophia Firebase project.';

async function requireFirebase() {
  const ready = await bootFirebase();
  if (!ready || !useFirebase) {
    throw new Error(AUTH_UNAVAILABLE);
  }
}

class API {
  constructor() {
    this.baseURL = API_URL;
    this.token = this.getToken();
  }

  getToken() {
    // First check Redux persisted state
    for (const storageKey of STATE_STORAGE_KEYS) {
      try {
        const state = JSON.parse(localStorage.getItem(storageKey));
        if (state?.auth?.token) {
          return state.auth.token;
        }
      } catch {
        // Ignore malformed persisted state and keep checking fallbacks.
      }
    }

    // Fallback: check direct auth token storage
    try {
      const directToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (directToken) {
        return directToken;
      }
    } catch {
      // Ignore
    }

    return null;
  }

  setToken(token) {
    this.token = token;
    // Also store in direct auth token key for fallback
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    // Always get fresh token to ensure it's current
    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  normalizePayload(payload) {
    return payload?.data ?? payload;
  }

  normalizeAuthResponse(payload) {
    const data = this.normalizePayload(payload) || {};
    const rawUser = data.user || {};
    const fullName = rawUser.fullName
      || rawUser.name
      || [rawUser.firstName, rawUser.lastName].filter(Boolean).join(' ').trim();
    const [derivedFirstName = '', ...derivedLastNameParts] = fullName.split(' ').filter(Boolean);

    return {
      ...data,
      user: {
        ...rawUser,
        id: rawUser.id || rawUser.uid || rawUser.userId || null,
        name: rawUser.name || fullName || rawUser.email || 'Sophia User',
        firstName: rawUser.firstName || derivedFirstName,
        lastName: rawUser.lastName || derivedLastNameParts.join(' '),
      },
    };
  }

  normalizeProfileResponse(payload) {
    const data = this.normalizePayload(payload) || {};
    return data.user || data.profile || data;
  }

  getLocalAccounts() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_ACCOUNTS_KEY) || '{}');
    } catch {
      return {};
    }
  }

  createLocalAuthFallback(email, fullName = '') {
    const safeEmail = String(email || '').trim().toLowerCase();
    const nameFromEmail = fullName.trim() || (safeEmail.includes('@') ? safeEmail.split('@')[0] : 'Sophia User');
    const token = `local-${Date.now()}`;

    return {
      token,
      user: {
        id: `local-${Math.random().toString(36).slice(2, 10)}`,
        email: safeEmail || 'user@sophia.dev',
        name: nameFromEmail,
        fullName: nameFromEmail,
        role: safeEmail === 'testuser@sophia.dev' ? 'admin' : 'user',
        level: 1,
        experience: 0,
      },
      fallback: true,
    };
  }

  saveLocalAccount(email, password, fullName) {
    const safeEmail = String(email || '').trim().toLowerCase();
    const accounts = this.getLocalAccounts();
    accounts[safeEmail] = { password, fullName };
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
    return this.createLocalAuthFallback(safeEmail, fullName);
  }

  getLocalAccount(email) {
    return this.getLocalAccounts()[String(email || '').trim().toLowerCase()];
  }

  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method,
      headers: this.getHeaders(),
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const payload = await response.json();
      return this.normalizePayload(payload);
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error.message);
      throw error;
    }
  }

  // ============ AUTH ENDPOINTS ============
  async register(email, password, firstName, lastName) {
    await requireFirebase();
    const result = this.normalizeAuthResponse(
      await firebaseRegister(email, password, firstName, lastName)
    );
    this.setToken(result.token);
    return result;
  }

  async loginWithGoogle() {
    await requireFirebase();
    const result = this.normalizeAuthResponse(await firebaseLoginWithGoogle());
    this.setToken(result.token);
    return result;
  }

  async login(email, password) {
    await requireFirebase();
    const result = this.normalizeAuthResponse(await firebaseLogin(email, password));
    this.setToken(result.token);
    return result;
  }

  async logout() {
    try {
      await requireFirebase();
      await firebaseLogout();
    } catch {
      // Still clear the local session if Firebase is already signed out or offline.
    }
    this.setToken(null);
    return { message: 'Logged out' };
  }

  async refreshToken() {
    await requireFirebase();
    const result = await firebaseRefreshToken();
    this.setToken(result.token);
    return result;
  }

  async forgotPassword(email) {
    await requireFirebase();
    return firebaseForgotPassword(email);
  }

  // ============ USER ENDPOINTS ============
  async getProfile() {
    await requireFirebase();
    return this.normalizeProfileResponse(await firebaseGetProfile());
  }

  async updateProfile(data) {
    await requireFirebase();
    return this.normalizeProfileResponse(await firebaseUpdateProfile(data));
  }

  // ============ HABITS ENDPOINTS ============
  async getHabits() {
    await requireFirebase();
    return getCollectionData('habits');
  }

  async createHabit(habitData) {
    await requireFirebase();
    return addCollectionItem('habits', habitData);
  }

  async updateHabit(id, habitData) {
    await requireFirebase();
    return updateCollectionItem('habits', id, habitData);
  }

  async deleteHabit(id) {
    await requireFirebase();
    return deleteCollectionItem('habits', id);
  }

  async completeHabit(id) {
    await requireFirebase();
    return completeCollectionItem('habits', id);
  }

  async uncompleteHabit(id) {
    await requireFirebase();
    return updateCollectionItem('habits', id, { completed: false });
  }

  async getHabitStats() {
    await requireFirebase();
    return firebaseGetHabitStats();
  }

  async getJournalEntries() {
    await requireFirebase();
    return getCollectionData('journal');
  }

  async createJournalEntry(entryData) {
    await requireFirebase();
    return addCollectionItem('journal', entryData);
  }

  async updateJournalEntry(id, entryData) {
    await requireFirebase();
    return updateCollectionItem('journal', id, entryData);
  }

  async deleteJournalEntry(id) {
    await requireFirebase();
    return deleteCollectionItem('journal', id);
  }

  async getJournalStats() {
    await requireFirebase();
    return firebaseGetJournalStats();
  }

  async getStudySessions() {
    await requireFirebase();
    return getCollectionData('study');
  }

  async createStudySession(sessionData) {
    await requireFirebase();
    return addCollectionItem('study', sessionData);
  }

  async endStudySession(id, sessionData) {
    await requireFirebase();
    return updateCollectionItem('study', id, sessionData);
  }

  async getStudyStats() {
    await requireFirebase();
    return firebaseGetStudyStats();
  }

  async getTasks(filter = 'all') {
    await requireFirebase();
    const tasks = await getCollectionData('tasks');
    if (filter === 'completed') return tasks.filter((t) => t.completed);
    if (filter === 'active') return tasks.filter((t) => !t.completed);
    return tasks;
  }

  async createTask(taskData) {
    await requireFirebase();
    return addCollectionItem('tasks', taskData);
  }

  async updateTask(id, taskData) {
    await requireFirebase();
    return updateCollectionItem('tasks', id, taskData);
  }

  async deleteTask(id) {
    await requireFirebase();
    return deleteCollectionItem('tasks', id);
  }

  async completeTask(id) {
    await requireFirebase();
    return completeCollectionItem('tasks', id);
  }

  // ============ ANALYTICS ENDPOINTS ============
  async getDashboardStats() {
    return this.request('GET', '/api/analytics/dashboard');
  }

  async getHabitAnalytics() {
    return this.request('GET', '/api/analytics/habits');
  }

  async getJournalAnalytics() {
    return this.request('GET', '/api/analytics/journal');
  }

  async getStudyAnalytics() {
    return this.request('GET', '/api/analytics/study');
  }

  // ============ ASSISTANT ENDPOINTS ============
  async getSummary() {
    return this.request('GET', '/api/assistant/summary');
  }

  async askAssistant(prompt) {
    return this.request('POST', '/api/assistant/ask', { prompt });
  }

  // ============ ML ENDPOINTS ============
  async analyzeSentiment(text) {
    return this.request('POST', '/api/ml/sentiment', { text });
  }

  async predictHabitSuccess(habitData) {
    return this.request('POST', '/api/ml/habit-prediction', habitData);
  }

  async getStudyRecommendations() {
    return this.request('GET', '/api/ml/study-recommendations');
  }

  // ============ NOTION ENDPOINTS ============
  async getNotionWorkspace() {
    return this.request('GET', '/api/notion/workspace');
  }

  async createNotionPage(pageData) {
    return this.request('POST', '/api/notion/pages', pageData);
  }

  async updateNotionPage(id, pageData) {
    return this.request('PUT', `/api/notion/pages/${id}`, pageData);
  }

  async deleteNotionPage(id) {
    return this.request('DELETE', `/api/notion/pages/${id}`);
  }

  // ============ PORTFOLIO ENDPOINTS ============
  async getPortfolio() {
    return this.request('GET', '/api/portfolio');
  }

  async createPortfolioProject(projectData) {
    return this.request('POST', '/api/portfolio/projects', projectData);
  }

  async updatePortfolioProject(id, projectData) {
    return this.request('PUT', `/api/portfolio/projects/${id}`, projectData);
  }

  async deletePortfolioProject(id) {
    return this.request('DELETE', `/api/portfolio/projects/${id}`);
  }

  // ============ PAYMENTS ENDPOINTS ============
  async initiateMPesaPayment(amount, phoneNumber) {
    return this.request('POST', '/api/payments/mpesa/pay', {
      amount,
      phoneNumber,
    });
  }

  async checkPaymentStatus(transactionId) {
    return this.request('GET', `/api/payments/status/${transactionId}`);
  }

  // ============ COACH ENDPOINTS ============
  async getCoachHistory(conversationId) {
    return this.request('GET', `/api/coach/history?conversation_id=${encodeURIComponent(conversationId)}`);
  }

  async getCoachReply(message, conversationId) {
    return this.request('POST', '/api/coach/reply', { message, conversation_id: conversationId });
  }

  async getCoachBriefing(conversationId) {
    return this.request('POST', '/api/coach/briefing', { conversation_id: conversationId });
  }

  // ============ SHADOW WORK ENDPOINTS ============
  async getShadowEntries() {
    await requireFirebase();
    return getCollectionData('shadow');
  }

  async createShadowEntry(entryData) {
    await requireFirebase();
    return addCollectionItem('shadow', entryData);
  }

  async updateShadowEntry(id, entryData) {
    await requireFirebase();
    return updateCollectionItem('shadow', id, entryData);
  }

  async deleteShadowEntry(id) {
    await requireFirebase();
    return deleteCollectionItem('shadow', id);
  }

  // ============ ADMIN ENDPOINTS ============
  async getAdminDashboard() {
    return this.request('GET', '/api/admin/dashboard');
  }

  async getAdminUsers() {
    return this.request('GET', '/api/admin/users');
  }

  async updateUserRole(userId, role) {
    return this.request('PUT', `/api/admin/users/${userId}/role`, { role });
  }

  async deleteUser(userId) {
    return this.request('DELETE', `/api/admin/users/${userId}`);
  }

  async getSystemHealth() {
    return this.request('GET', '/api/admin/system');
  }

  async getAdminUserDetail(userId) {
    return this.request('GET', `/api/admin/users/${userId}/detail`);
  }

  async getAdminActivity(limit = 50) {
    return this.request('GET', `/api/admin/activity?limit=${limit}`);
  }

  // Download CSV — triggers a file save in the browser
  async downloadAdminCSV(type, userId) {
    const endpoint = userId
      ? `${API_URL}/api/admin/export/users/${userId}/full.csv`
      : `${API_URL}/api/admin/export/users.csv`;
    const headers = { Authorization: `Bearer ${this.token}` };
    const res = await fetch(endpoint, { headers });
    if (!res.ok) throw new Error(`Export failed (${res.status})`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = userId ? `sophia_user_data.csv` : 'sophia_users.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export default new API();
