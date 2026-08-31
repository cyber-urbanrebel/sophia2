import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage.jsx';
import OnboardingFlow from './components/OnboardingFlow.jsx';
import AuthGuard from './components/AuthGuard.jsx';
import Sidebar from './components/Sidebar.jsx';
import BottomNav from './components/BottomNav.jsx';
import MindSection from './components/MindSection.jsx';
import BodySection from './components/BodySection.jsx';
import DisciplineSection from './components/DisciplineSection.jsx';
import ShadowSection from './components/ShadowSection.jsx';
import ProgressSection from './components/ProgressSection.jsx';
import FloatingAI from './components/FloatingAI.jsx';
import HomeDashboard from './components/HomeDashboard.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import SophiaCursor from './components/SophiaCursor.jsx';
import ParticleCanvas from './components/ParticleCanvas.jsx';
import PageTransition from './components/PageTransition.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import SophiaFooter from './components/SophiaFooter.jsx';
import HudBar from './components/HudBar.jsx';
import { initSophiaAnimations } from './sophia-animations.js';
import { completeOnboarding as completeOnboardingSlice } from './store/slices/onboardingSlice.js';
import { logout } from './store/slices/authSlice.js';
import { resetOnboarding } from './store/slices/onboardingSlice.js';
import styles from './styles/App.module.css';

const VoiceAssistant = lazy(() => import('./components/VoiceAssistant.jsx'));
const NotificationSystem = lazy(() => import('./components/NotificationSystem.jsx'));
const GrowthSystem = lazy(() => import('./components/GrowthSystem.jsx'));
const AdminPage = lazy(() => import('./components/AdminPage.jsx'));
const PomodoroTimer = lazy(() => import('./components/PomodoroTimer.jsx'));
const GamificationPage = lazy(() => import('./components/GamificationPage.jsx'));
const SmartReminders = lazy(() => import('./components/SmartReminders.jsx'));
const ProgressReports = lazy(() => import('./components/ProgressReports.jsx'));
const PremiumPage = lazy(() => import('./components/PremiumPage.jsx'));
const WisdomLibrary = lazy(() => import('./components/WisdomLibrary.jsx'));
const PhilosophyExplorer = lazy(() => import('./components/PhilosophyExplorer.jsx'));
const CommunityPage = lazy(() => import('./components/CommunityPage.jsx'));
const GoalsPage = lazy(() => import('./components/GoalsPage.jsx'));
const AdvancedAnalytics = lazy(() => import('./components/AdvancedAnalytics.jsx'));

const AUTH_TOKEN_KEY = 'sophia-auth-token';
const ONBOARDING_KEY = 'sophia-onboarding-complete';
const SIDEBAR_KEY = 'sophia-sidebar-open';

const CALM_ROUTES = ['/admin', '/reports', '/reminders'];

function getAmbientMode(pathname) {
  const path = String(pathname || '/').toLowerCase();
  return CALM_ROUTES.some((route) => path.startsWith(route)) ? 'calm' : 'immersive';
}

function AppShell({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, children }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const location = useLocation();
  const room = String(location.pathname || '/path').replace(/^\//, '').toUpperCase() || 'PATH';
  const pageContainerClassName = [
    styles.pageContainer,
    !isMobile && sidebarOpen ? styles.pageContainerWithSidebar : '',
    !isMobile && !sidebarOpen ? styles.pageContainerSidebarHidden : '',
  ].filter(Boolean).join(' ');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className={pageContainerClassName} style={isMobile ? { paddingTop: 56 } : undefined}>
        <HudBar room={room} />
        <Suspense fallback={<LoadingScreen />}>
          {children}
        </Suspense>
        <SophiaFooter />
      </div>
      {isMobile && <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />}
      <FloatingAI />
    </div>
  );
}

export default function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const hasCompletedOnboarding = useSelector((state) => state.onboarding.hasCompletedOnboarding);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('path');
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(window.localStorage.getItem('sophia_goals')) || [];
    } catch {
      return [];
    }
  });
  const [philosophyProfile, setPhilosophyProfile] = useState(() => {
    if (typeof window === 'undefined') return { values: [] };
    try {
      return JSON.parse(window.localStorage.getItem('sophia_philosophy_profile')) || { values: [] };
    } catch {
      return { values: [] };
    }
  });
  const [wisdomFavourites, setWisdomFavourites] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(window.localStorage.getItem('sophia_wisdom_favourites')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem('sophia_goals', JSON.stringify(goals));
  }, [goals]);
  useEffect(() => {
    window.localStorage.setItem('sophia_philosophy_profile', JSON.stringify(philosophyProfile));
  }, [philosophyProfile]);
  useEffect(() => {
    window.localStorage.setItem('sophia_wisdom_favourites', JSON.stringify(wisdomFavourites));
  }, [wisdomFavourites]);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = window.localStorage.getItem(SIDEBAR_KEY);
    return stored === null ? true : stored === 'true';
  });

  const darkMode = useSelector((state) => state.settings.darkMode);
  const themeClass = darkMode ? styles.dark : styles.light;
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', Boolean(darkMode));
    document.body.classList.toggle('dark', Boolean(darkMode));
  }, [darkMode]);

  useEffect(() => {
    document.body.dataset.sophiaAmbient = getAmbientMode(location.pathname);
    return () => {
      delete document.body.dataset.sophiaAmbient;
    };
  }, [location.pathname]);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_KEY, String(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    const cleanup = initSophiaAnimations();
    return cleanup;
  }, [location.pathname, loading]);

  const entryPath = useMemo(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token || !isAuthenticated) return '/auth';
    const onboarded = localStorage.getItem(ONBOARDING_KEY) === 'true';
    if (!onboarded || !hasCompletedOnboarding) return '/onboarding';
    return '/path';
  }, [hasCompletedOnboarding, isAuthenticated]);

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.startsWith('/path') || path.startsWith('/dashboard')) setActiveTab('path');
    else if (path.startsWith('/body')) setActiveTab('body');
    else if (path.startsWith('/mind')) setActiveTab('mind');
    else if (path.startsWith('/discipline')) setActiveTab('discipline');
    else if (path.startsWith('/shadow')) setActiveTab('shadow');
    else if (path.startsWith('/progress')) setActiveTab('progress');
    else if (path.startsWith('/profile')) setActiveTab('profile');
    else if (path.startsWith('/growth')) setActiveTab('growth');
    else if (path.startsWith('/wisdom')) setActiveTab('wisdom');
    else if (path.startsWith('/philosophy')) setActiveTab('philosophy');
    else if (path.startsWith('/goals')) setActiveTab('goals');
    else if (path.startsWith('/community')) setActiveTab('community');
    else if (path.startsWith('/analytics')) setActiveTab('analytics');
    else if (path.startsWith('/admin')) setActiveTab('admin');
    else if (path.startsWith('/notifications')) setActiveTab('notifications');
    else if (path.startsWith('/focus')) setActiveTab('focus');
    else if (path.startsWith('/achievements')) setActiveTab('achievements');
    else if (path.startsWith('/reminders')) setActiveTab('reminders');
    else if (path.startsWith('/reports')) setActiveTab('reports');
    else if (path.startsWith('/premium')) setActiveTab('premium');
    else if (path.startsWith('/voice')) setActiveTab('voice');
  }, [location.pathname]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Transition state for smooth page changes
  const [transitioning, setTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');

  const handleOnboardingComplete = (data) => {
    const profile = {
      ...data,
      email: user?.email || data?.email || '',
      name: data?.name || user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' '),
      joinDate: data?.joinDate || new Date().toLocaleDateString(),
      goals: data?.selectedGoals || data?.goals || [],
      focusArea: data?.reasons?.[0] || '',
    };

    // Save onboarding answers for FloatingAI welcome sequence
    localStorage.setItem('sophia_onboarding_data', JSON.stringify({
      name: profile.name,
      goals: data?.selectedGoals || [],
      focusAreas: data?.focusAreas || [],
      notifications: data?.notifications || {},
    }));
    // Reset AI welcome flag so the welcome sequence triggers on dashboard
    localStorage.removeItem('sophia_ai_welcomed');
    localStorage.removeItem('sophia_floating_ai_msgs');

    localStorage.setItem('sophia-user-profile', JSON.stringify(profile));
    localStorage.setItem('sophia-onboarding-complete', 'true');
    dispatch(completeOnboardingSlice(profile));

    // Smooth transition to the Path dashboard
    setTransitionMessage(`Welcome, ${profile.name || 'friend'}. Your space is ready.`);
    setTransitioning(true);
    setTimeout(() => {
      navigate('/path', { replace: true });
      setTimeout(() => setTransitioning(false), 600);
    }, 1800);
  };

  const handleHomeNavigate = (destination) => {
    const nextTab = String(destination || 'path').trim().toLowerCase();
    const nextPath = {
      path: '/path',
      dashboard: '/path',
      body: '/body',
      mind: '/mind',
      discipline: '/discipline',
      shadow: '/shadow',
      progress: '/progress',
    }[nextTab] || '/path';

    setActiveTab(nextTab === 'dashboard' ? 'path' : nextTab);
    navigate(nextPath);
  };

  const renderProtected = (element) => (
    <AuthGuard>
      <AppShell
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      >
        {element}
      </AppShell>
    </AuthGuard>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  // Full-screen transition overlay
  if (transitioning) {
    return <PageTransition message={transitionMessage} />;
  }

  return (
    <div className={themeClass}>
      <ParticleCanvas />
      <SophiaCursor />
      <CommandPalette />
      <div className={styles.appContainer}>
        <Routes>
          <Route path="/" element={<Navigate to={entryPath} replace />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route
            path="/onboarding"
            element={
              !isAuthenticated || !localStorage.getItem(AUTH_TOKEN_KEY) ? (
                <Navigate to="/auth" replace />
              ) : hasCompletedOnboarding && localStorage.getItem(ONBOARDING_KEY) === 'true' ? (
                <Navigate to="/path" replace />
              ) : (
                <OnboardingFlow onComplete={handleOnboardingComplete} />
              )
            }
          />
          {/* Legacy redirects to the renamed Path dashboard */}
          <Route path="/home" element={<Navigate to="/path" replace />} />
          <Route path="/dashboard" element={<Navigate to="/path" replace />} />

          {/* Primary six — Path / Mind / Body / Discipline / Shadow / Progress */}
          <Route path="/path" element={renderProtected(<HomeDashboard onNavigate={handleHomeNavigate} />)} />
          <Route path="/mind" element={renderProtected(<MindSection />)} />
          <Route path="/body" element={renderProtected(<BodySection />)} />
          <Route path="/discipline" element={renderProtected(<DisciplineSection />)} />
          <Route path="/shadow" element={renderProtected(<ShadowSection />)} />
          <Route path="/progress" element={renderProtected(<ProgressSection />)} />

          {/* Voice assistant + floating AI */}
          <Route path="/voice" element={renderProtected(<VoiceAssistant />)} />
          <Route path="/ai" element={<Navigate to="/voice" replace />} />

          {/* Secondary / "More" menu */}
          <Route path="/profile" element={renderProtected(<ProfilePage />)} />
          <Route path="/growth" element={renderProtected(<GrowthSystem />)} />
          <Route path="/wisdom" element={renderProtected(<WisdomLibrary favourites={wisdomFavourites} setFavourites={setWisdomFavourites} />)} />
          <Route path="/philosophy" element={renderProtected(<PhilosophyExplorer profile={philosophyProfile} setProfile={setPhilosophyProfile} />)} />
          <Route path="/goals" element={renderProtected(<GoalsPage goals={goals} setGoals={setGoals} />)} />
          <Route path="/community" element={renderProtected(<CommunityPage user={user} />)} />
          <Route path="/analytics" element={renderProtected(<AdvancedAnalytics />)} />
          <Route path="/notifications" element={renderProtected(<NotificationSystem />)} />
          <Route path="/focus" element={renderProtected(<PomodoroTimer />)} />
          <Route path="/achievements" element={renderProtected(<GamificationPage />)} />
          <Route path="/reminders" element={renderProtected(<SmartReminders />)} />
          <Route path="/reports" element={renderProtected(<ProgressReports />)} />
          <Route path="/premium" element={renderProtected(<PremiumPage />)} />
          <Route path="/admin" element={renderProtected(<AdminPage />)} />
          <Route path="*" element={<Navigate to={entryPath} replace />} />
        </Routes>
      </div>
    </div>
  );
}
