import { createSlice } from '@reduxjs/toolkit';

const ONBOARDING_KEY = 'sophia-onboarding-complete';
const USER_PROFILE_KEY = 'sophia-user-profile';
const ONBOARDING_STEP_KEY = 'sophia-onboarding-step';

function loadStoredProfile() {
  try {
    return JSON.parse(localStorage.getItem(USER_PROFILE_KEY)) || {};
  } catch {
    return {};
  }
}

const storedProfile = loadStoredProfile();
const storedOnboardingComplete = localStorage.getItem(ONBOARDING_KEY) === 'true';

const initialState = {
  hasCompletedOnboarding: storedOnboardingComplete,
  userProfile: {
    name: '',
    reasons: [],
    selectedGoals: [],
    wakeTime: '06:00',
    sleepTime: '22:00',
    trainingDays: 3,
    hasGym: false,
    calories: '',
    protein: '',
    water: '',
    sleepHours: '',
    habitsPerDay: '',
    ...storedProfile,
  },
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    completeOnboarding(state, action) {
      state.hasCompletedOnboarding = true;
      state.userProfile = { ...state.userProfile, ...(action.payload || {}) };
      localStorage.setItem(ONBOARDING_KEY, 'true');
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(state.userProfile));
      localStorage.removeItem(ONBOARDING_STEP_KEY);
    },
    saveOnboardingStep(state, action) {
      localStorage.setItem(ONBOARDING_STEP_KEY, String(action.payload));
    },
    resetOnboarding(state) {
      state.hasCompletedOnboarding = false;
      state.userProfile = { name: '', reasons: [], selectedGoals: [] };
      localStorage.removeItem(ONBOARDING_KEY);
      localStorage.removeItem(ONBOARDING_STEP_KEY);
    },
  },
});

export const { completeOnboarding, saveOnboardingStep, resetOnboarding } = onboardingSlice.actions;
export default onboardingSlice.reducer;