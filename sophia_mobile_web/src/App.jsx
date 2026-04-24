import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage.jsx';
import OnboardingFlow from './components/OnboardingFlow.jsx';
import AuthGuard from './components/AuthGuard.jsx';
import Sidebar from './components/Sidebar.jsx';
import MindSection from './components/MindSection.jsx';
import BodySection from './components/BodySection.jsx';
import DisciplineSection from './components/DisciplineSection.jsx';
import ProgressSection from './components/ProgressSection.jsx';
import FloatingAI from './components/FloatingAI.jsx';
import NotificationSystem from './components/NotificationSystem.jsx';
import GrowthSystem from './components/GrowthSystem.jsx';
import HomeDashboard from './components/HomeDashboard.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import AdminPage from './components/AdminPage.jsx';
import PomodoroTimer from './components/PomodoroTimer.jsx';
import GamificationPage from './components/GamificationPage.jsx';
import SmartReminders from './components/SmartReminders.jsx';
import ProgressReports from './components/ProgressReports.jsx';
import PremiumPage from './components/PremiumPage.jsx';
import SophiaCursor from './components/SophiaCursor.jsx';
import PageTransition from './components/PageTransition.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import SophiaFooter from './components/SophiaFooter.jsx';
import { initSophiaAnimations } from './sophia-animations.js';
import { completeOnboarding as completeOnboardingSlice } from './store/slices/onboardingSlice.js';
import { logout } from './store/slices/authSlice.js';
import { resetOnboarding } from './store/slices/onboardingSlice.js';
import styles from './styles/App.module.css';

const ProjectsFeature = React.lazy(() => import('./features/projects/index.jsx'));

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
        {children}
        <SophiaFooter />
      </div>
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = window.localStorage.getItem(SIDEBAR_KEY);
    return stored === null ? true : stored === 'true';
  });

  const themeClass = useSelector((state) => (state.settings.darkMode ? styles.dark : styles.light));
  const location = useLocation();

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
  }, [location.pathname]);

  const entryPath = useMemo(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token || !isAuthenticated) return '/auth';
    const onboarded = localStorage.getItem(ONBOARDING_KEY) === 'true';
    if (!onboarded || !hasCompletedOnboarding) return '/onboarding';
    return '/dashboard';
  }, [hasCompletedOnboarding, isAuthenticated]);

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.startsWith('/dashboard')) setActiveTab('dashboard');
    else if (path.startsWith('/body')) setActiveTab('body');
    else if (path.startsWith('/mind')) setActiveTab('mind');
    else if (path.startsWith('/discipline')) setActiveTab('discipline');
    else if (path.startsWith('/progress')) setActiveTab('progress');
    else if (path.startsWith('/profile')) setActiveTab('profile');
    else if (path.startsWith('/growth')) setActiveTab('growth');
    else if (path.startsWith('/projects')) setActiveTab('projects');
    else if (path.startsWith('/admin')) setActiveTab('admin');
    else if (path.startsWith('/notifications')) setActiveTab('notifications');
    else if (path.startsWith('/focus')) setActiveTab('focus');
    else if (path.startsWith('/achievements')) setActiveTab('achievements');
    else if (path.startsWith('/reminders')) setActiveTab('reminders');
    else if (path.startsWith('/reports')) setActiveTab('reports');
    else if (path.startsWith('/premium')) setActiveTab('premium');
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

    // Smooth transition to dashboard
    setTransitionMessage(`Welcome, ${profile.name || 'Friend'}! Preparing your dashboard...`);
    setTransitioning(true);
    setTimeout(() => {
      navigate('/dashboard', { replace: true });
      setTimeout(() => setTransitioning(false), 600);
    }, 1800);
  };

  const handleHomeNavigate = (destination) => {
    const nextTab = String(destination || 'dashboard').trim().toLowerCase();
    const nextPath = {
      dashboard: '/dashboard',
      body: '/body',
      mind: '/mind',
      discipline: '/discipline',
      progress: '/progress',
    }[nextTab] || '/dashboard';

    setActiveTab(nextTab);
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
                <Navigate to="/dashboard" replace />
              ) : (
                <OnboardingFlow onComplete={handleOnboardingComplete} />
              )
            }
          />
          {/* Legacy /home redirect */}
          <Route path="/home" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={renderProtected(<HomeDashboard onNavigate={handleHomeNavigate} />)} />
          <Route path="/body" element={renderProtected(<BodySection />)} />
          <Route path="/mind" element={renderProtected(<MindSection />)} />
          <Route path="/discipline" element={renderProtected(<DisciplineSection />)} />
          <Route path="/progress" element={renderProtected(<ProgressSection />)} />
          <Route path="/ai" element={<Navigate to="/dashboard" replace />} />
          <Route path="/profile" element={renderProtected(<ProfilePage />)} />
          <Route path="/growth" element={renderProtected(<GrowthSystem />)} />
          <Route path="/projects" element={renderProtected(<React.Suspense fallback={<div style={{color:'#4a4a62',padding:40,textAlign:'center'}}>Loading…</div>}><ProjectsFeature /></React.Suspense>)} />
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
