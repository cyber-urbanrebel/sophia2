import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice.js';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
  { id: 'tasks', label: 'Tasks', path: '/discipline', icon: TasksIcon },
  { id: 'mind', label: 'Mind', path: '/mind', icon: MindIcon },
  { id: 'body', label: 'Body', path: '/body', icon: BodyIcon },
  { id: 'discipline', label: 'Discipline', path: '/discipline', icon: DisciplineIcon },
  { id: 'growth', label: 'Inner Growth', path: '/growth', icon: GrowthIcon },
  { id: 'habits', label: 'Habits', path: '/discipline', icon: HabitsIcon },
  { id: 'journal', label: 'Journal', path: '/mind', icon: JournalIcon },
  { id: 'projects', label: 'Projects', path: '/projects', icon: ProjectsIcon },
  { id: 'progress', label: 'Progress', path: '/progress', icon: ProgressIcon },
  { id: 'focus', label: 'Focus Timer', path: '/focus', icon: FocusIcon },
  { id: 'achievements', label: 'Achievements', path: '/achievements', icon: TrophyIcon },
  { id: 'reminders', label: 'Reminders', path: '/reminders', icon: BellIcon },
  { id: 'reports', label: 'Reports', path: '/reports', icon: ReportIcon },
  { id: 'premium', label: 'Premium', path: '/premium', icon: PremiumIcon },
];

function DashboardIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>);
}
function PathIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20"/><path d="M2 12h20"/></svg>);
}
function TasksIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>);
}
function MindIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C7.58 2 4 5.58 4 10c0 2.12.83 4.05 2.18 5.48C7.56 17 8 19 8 20h8c0-1-.44-3-1.82-4.52A7.96 7.96 0 0020 10c0-4.42-3.58-8-8-8z"/><path d="M10 20v2h4v-2"/></svg>);
}
function BodyIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2.5"/><path d="M8 10h8l1 5h-2l-.5 6h-5L9 15H7l1-5z"/></svg>);
}
function DisciplineIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 14.5,9 22,9 16,13.5 18.5,21 12,16.5 5.5,21 8,13.5 2,9 9.5,9"/></svg>);
}
function GrowthIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V8"/><path d="M5 12H2a10 10 0 0020 0h-3"/><path d="M12 2a4 4 0 014 4c0 2-2 4-4 6-2-2-4-4-4-6a4 4 0 014-4z"/></svg>);
}
function HabitsIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>);
}
function JournalIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>);
}
function ProjectsIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="2" y1="13" x2="22" y2="13"/></svg>);
}
function ProgressIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>);
}
function FocusIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
}
function TrophyIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4a2 2 0 01-2-2V5h4"/><path d="M18 9h2a2 2 0 002-2V5h-4"/><path d="M4 5h16v4a6 6 0 01-6 6h-4a6 6 0 01-6-6V5z"/><path d="M12 15v3"/><path d="M8 21h8"/><path d="M8 18h8"/></svg>);
}
function BellIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>);
}
function ReportIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>);
}
function PremiumIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>);
}
function AdminIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>);
}
function SignOutIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);
}

const styles = {
  sidebar: {
    position: 'fixed', top: 14, left: 14, bottom: 14, width: 234,
    background: 'linear-gradient(180deg, rgba(5,13,30,0.95), rgba(3,8,20,0.92))',
    border: '1px solid rgba(0,212,255,0.18)',
    borderRadius: 30,
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.48), 0 0 0 1px rgba(123,47,255,0.12)',
    backdropFilter: 'blur(24px)',
    display: 'flex', flexDirection: 'column', zIndex: 100,
    fontFamily: 'var(--sophia-body)',
    overflowY: 'auto',
    transition: 'transform 220ms ease, opacity 220ms ease, box-shadow 220ms ease',
  },
  brandWrap: {
    padding: '22px 18px 16px',
  },
  logo: {
    fontSize: '30px', fontWeight: 800, letterSpacing: '-0.06em', lineHeight: 0.9,
    color: '#f5fbff', fontFamily: '"Orbitron", "Space Grotesk", sans-serif',
    textTransform: 'uppercase',
  },
  brandSub: {
    marginTop: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
  },
  brandChip: {
    padding: '8px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
    letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9fdfff',
    background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.16)',
  },
  userCard: {
    marginTop: 16,
    display: 'grid', gridTemplateColumns: '44px 1fr', gap: 12,
    padding: '14px', borderRadius: 22,
    background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(123,47,255,0.08))',
    border: '1px solid rgba(0,212,255,0.14)',
  },
  avatar: {
    width: 44, height: 44, borderRadius: 16,
    display: 'grid', placeItems: 'center',
    background: 'linear-gradient(135deg, #00d4ff, #7b2fff)', color: '#03101d',
    fontWeight: 800, fontSize: 14,
    boxShadow: '0 12px 22px rgba(0,212,255,0.22)',
  },
  userMeta: { minWidth: 0 },
  userLabel: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7f9eb8',
  },
  userName: {
    marginTop: 4, fontSize: 15, fontWeight: 700, color: '#f5fbff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  userMode: {
    marginTop: 2, fontSize: 12, color: '#9ab2ca',
  },
  navShell: { flex: 1, display: 'flex', flexDirection: 'column', padding: '6px 10px 10px' },
  navSectionLabel: {
    padding: '8px 12px', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#83a3c0',
  },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px' },
  link: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '18px',
    textDecoration: 'none', fontSize: '14px', fontWeight: '600', color: '#9ab2ca',
    transition: 'all 0.2s', border: '1px solid transparent', background: 'transparent', cursor: 'pointer',
    width: '100%', textAlign: 'left', position: 'relative',
  },
  linkActive: {
    color: '#f5fbff',
    background: 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(123,47,255,0.12))',
    border: '1px solid rgba(0,212,255,0.2)',
    boxShadow: '0 10px 26px rgba(0,212,255,0.12)',
  },
  signOut: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '20px',
    textDecoration: 'none', fontSize: '14px', fontWeight: '700', color: '#f8b0a0',
    transition: 'all 0.2s', border: '1px solid rgba(255,132,95,0.18)', background: 'rgba(255,132,95,0.06)', cursor: 'pointer',
    width: 'calc(100% - 20px)', textAlign: 'left', margin: '8px 10px 18px',
  },
  goldDot: {
    width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #00d4ff, #7b2fff)', marginLeft: 'auto', flexShrink: 0,
    boxShadow: '0 0 0 6px rgba(0,212,255,0.08)',
  },
  footerNote: {
    margin: '0 10px 6px', padding: '14px 16px', borderRadius: 20,
    background: 'linear-gradient(135deg, rgba(0,212,255,0.05), rgba(123,47,255,0.05))',
    border: '1px solid rgba(0,212,255,0.14)',
  },
  footerKicker: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#83a3c0',
  },
  footerText: {
    marginTop: 6, fontSize: 13, lineHeight: 1.45, color: '#9ab2ca',
  },
};

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen = true, setSidebarOpen = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(s => s.auth.user);
  const isAdmin = user?.role === 'admin';

  const allNavItems = isAdmin
    ? [...navItems, { id: 'admin', label: 'Admin', path: '/admin', icon: AdminIcon }]
    : navItems;
  const primaryNavItems = allNavItems.slice(0, 8);
  const secondaryNavItems = allNavItems.slice(8);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  const initials = String(user?.name || user?.email || 'Sophia')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  const isDesktopCollapsed = !isMobile && !sidebarOpen;

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => { if (isMobile) setMobileOpen(false); }, [location.pathname, isMobile]);

  const handleSignOut = () => {
    dispatch(logout());
    navigate('/auth', { replace: true });
  };

  const sidebarStyle = {
    ...styles.sidebar,
    ...(!isMobile && !sidebarOpen ? {
      width: 72,
      borderRadius: 24,
      overflowX: 'hidden',
      boxShadow: '0 18px 40px rgba(0, 0, 0, 0.34), 0 0 0 1px rgba(123,47,255,0.12)',
    } : {}),
    ...(isMobile ? {
      transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
      boxShadow: mobileOpen ? '18px 0 44px rgba(0,0,0,0.44)' : 'none',
      top: 10,
      left: 10,
      bottom: 10,
    } : {}),
  };

  const brandWrapStyle = {
    ...styles.brandWrap,
    ...(isDesktopCollapsed ? { padding: '18px 10px 12px' } : {}),
  };

  const navShellStyle = {
    ...styles.navShell,
    ...(isDesktopCollapsed ? { padding: '4px 8px 8px' } : {}),
  };

  const signOutStyle = {
    ...styles.signOut,
    ...(isDesktopCollapsed ? {
      width: 48,
      minWidth: 48,
      margin: '8px auto 16px',
      padding: '12px',
      justifyContent: 'center',
      borderRadius: 16,
    } : {}),
  };

  const renderNavItems = (items) => items.map((item) => {
    const isActive = location.pathname === item.path ||
      (item.id === 'dashboard' && location.pathname === '/dashboard') ||
      (item.id === activeTab);
    const Icon = item.icon;
    return (
      <NavLink
        key={item.id}
        to={item.path}
        end
        onClick={() => setActiveTab(item.id)}
        style={({ isActive: navActive }) => ({
          ...styles.link,
          ...(isDesktopCollapsed ? {
            justifyContent: 'center',
            gap: 0,
            padding: '12px',
            borderRadius: '16px',
          } : {}),
          ...(navActive || isActive ? styles.linkActive : {}),
        })}
        title={isDesktopCollapsed ? item.label : undefined}
        aria-label={item.label}
        onMouseEnter={(e) => {
          if (!isActive) {
            Object.assign(e.currentTarget.style, {
              color: '#f5fbff',
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.16)',
            });
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            Object.assign(e.currentTarget.style, {
              color: '#9ab2ca',
              background: 'transparent',
              border: '1px solid transparent',
            });
          }
        }}
      >
        <Icon />
        {!isDesktopCollapsed && <span>{item.label}</span>}
        {item.id === 'projects' && location.pathname.startsWith('/projects') && (
          <span style={styles.goldDot} />
        )}
      </NavLink>
    );
  });

  return (
    <>
      {!isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Collapse navigation sidebar' : 'Expand navigation sidebar'}
          aria-pressed={sidebarOpen}
          style={{
            position: 'fixed',
            top: 18,
            left: sidebarOpen ? 224 : 52,
            zIndex: 160,
            width: 44,
            height: 44,
            borderRadius: 15,
            border: '1px solid rgba(0,212,255,0.18)',
            background: 'rgba(5,13,30,0.82)',
            backdropFilter: 'blur(16px)',
            color: '#c9ecff',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            boxShadow: '0 18px 38px rgba(0,0,0,0.35)',
            transition: 'left 220ms ease, transform 220ms ease, background 220ms ease',
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = 'rgba(8,18,40,0.94)';
            event.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = 'rgba(5,13,30,0.82)';
            event.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {sidebarOpen ? (
              <>
                <path d="M15 18l-6-6 6-6" />
                <path d="M20 5v14" />
              </>
            ) : (
              <>
                <path d="M9 18l6-6-6-6" />
                <path d="M4 5v14" />
              </>
            )}
          </svg>
        </button>
      )}

      {/* Mobile hamburger button */}
      {isMobile && !mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          style={{
            position: 'fixed', top: 14, left: 14, zIndex: 200,
            width: 44, height: 44, borderRadius: 14, border: '1px solid rgba(0,212,255,0.22)',
            background: 'rgba(5,13,30,0.84)', backdropFilter: 'blur(14px)',
            color: '#bfeaff', fontSize: 20, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 18px 44px rgba(0,0,0,0.42)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      )}

      {/* Mobile backdrop */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 99,
            background: 'rgba(3, 6, 16, 0.64)', backdropFilter: 'blur(6px)',
          }}
        />
      )}

      <aside style={sidebarStyle} role="navigation" aria-label="Main navigation">
        <div style={brandWrapStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: isMobile ? 6 : 0 }}>
            <div style={{ ...styles.logo, fontSize: isDesktopCollapsed ? '16px' : styles.logo.fontSize, letterSpacing: isDesktopCollapsed ? '0.08em' : styles.logo.letterSpacing }}>
              {isDesktopCollapsed ? 'SO' : 'Sophia'}
            </div>
          {isMobile && (
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu"
              style={{ background: 'none', border: 'none', color: '#bfeaff', cursor: 'pointer', fontSize: 20, padding: 4 }}>✕</button>
          )}
          </div>
          {!isDesktopCollapsed && (
            <>
              <div style={styles.brandSub}>
                <span style={styles.brandChip}>Hyper Mode</span>
                <span style={{ ...styles.brandChip, color: '#f5fbff' }}>Body. Mind. Discipline.</span>
              </div>
              <div style={styles.userCard}>
                <div style={styles.avatar}>{initials || 'SO'}</div>
                <div style={styles.userMeta}>
                  <div style={styles.userLabel}>Active profile</div>
                  <div style={styles.userName}>{user?.name || user?.email || 'Sophia User'}</div>
                  <div style={styles.userMode}>{isAdmin ? 'Administrator access' : 'Daily growth workspace'}</div>
                </div>
              </div>
            </>
          )}
          {isDesktopCollapsed && (
            <div style={{ marginTop: 12, display: 'grid', placeItems: 'center' }}>
              <div title={user?.name || user?.email || 'Sophia User'} style={{ ...styles.avatar, width: 40, height: 40, borderRadius: 14, fontSize: 13 }}>
                {initials || 'SO'}
              </div>
            </div>
          )}
        </div>
        <div style={navShellStyle}>
          {!isDesktopCollapsed && <div style={styles.navSectionLabel}>Primary</div>}
          <nav style={styles.nav}>{renderNavItems(primaryNavItems)}</nav>
          {secondaryNavItems.length > 0 && (
            <>
              {!isDesktopCollapsed && <div style={{ ...styles.navSectionLabel, marginTop: 12 }}>Explore</div>}
              <nav style={styles.nav}>{renderNavItems(secondaryNavItems)}</nav>
            </>
          )}
        </div>
        {!isDesktopCollapsed && (
          <div style={styles.footerNote}>
            <div style={styles.footerKicker}>Daily System</div>
            <div style={styles.footerText}>A brighter command center for habits, journaling, focus, projects, and progress.</div>
          </div>
        )}
      <button
        style={signOutStyle}
        aria-label="Sign out"
        title={isDesktopCollapsed ? 'Sign Out' : undefined}
        onClick={handleSignOut}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, { color: '#ffd0c6', background: 'rgba(255,132,95,0.12)' })}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, { color: '#f8b0a0', background: 'rgba(255,132,95,0.06)' })}
      >
        <SignOutIcon />
        {!isDesktopCollapsed && <span>Sign Out</span>}
      </button>
    </aside>
    </>
  );
}
