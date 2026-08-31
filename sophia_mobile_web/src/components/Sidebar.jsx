import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChartBarIcon, SettingsGearIcon, BrainIcon, BodyFitIcon, LightningIcon, TrendUpIcon, MoonIcon, TargetIcon, MeditationIcon, FlameIcon } from './SophiaIcons.jsx';

const PRIMARY = [
  { id: 'path', label: 'Path', path: '/path', icon: PathIcon },
  { id: 'mind', label: 'Mind', path: '/mind', icon: MindIcon },
  { id: 'body', label: 'Body', path: '/body', icon: BodyIcon },
  { id: 'discipline', label: 'Discipline', path: '/discipline', icon: DisciplineIcon },
  { id: 'shadow', label: 'Shadow', path: '/shadow', icon: ShadowIcon },
  { id: 'progress', label: 'Progress', path: '/progress', icon: ProgressIcon },
];

const MORE = [
  { id: 'voice', label: 'Voice', path: '/voice', icon: VoiceIcon },
  { id: 'wisdom', label: 'Wisdom', path: '/wisdom', icon: WisdomIcon },
  { id: 'goals', label: 'Goals', path: '/goals', icon: TasksIcon },
  { id: 'focus', label: 'Focus', path: '/focus', icon: FocusIcon },
  { id: 'profile', label: 'You', path: '/profile', icon: SettingsNavIcon },
];

function AnalyticsNavIcon() {
  return <ChartBarIcon size={18} />;
}
function SettingsNavIcon() {
  return <SettingsGearIcon size={18} />;
}
function DashboardIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>);
}
function PathIcon() {
  return <TrendUpIcon size={18} />;
}
function TasksIcon() {
  return <TargetIcon size={18} />;
}
function MindIcon() {
  return <BrainIcon size={18} />;
}
function BodyIcon() {
  return <BodyFitIcon size={18} />;
}
function DisciplineIcon() {
  return <LightningIcon size={18} />;
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
  return <ChartBarIcon size={18} />;
}
function FocusIcon() {
  return <TargetIcon size={18} />;
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
function ShadowIcon() {
  return <MoonIcon size={18} />;
}
function VoiceIcon() {
  return <MeditationIcon size={18} />;
}
function WisdomIcon() {
  return <FlameIcon size={18} />;
}
function CommunityIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>);
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
    background: 'rgba(255, 255, 255, 0.88)',
    border: '1px solid rgba(0,0,0,0.16)',
    borderRadius: 30,
    boxShadow: '0 18px 40px rgba(26,16,51,0.28), 0 4px 12px rgba(0,0,0,0.1)',
    backdropFilter: 'blur(24px)',
    display: 'flex', flexDirection: 'column', zIndex: 100,
    fontFamily: "'Dark Castle'",
    color: '#000',
    overflowY: 'auto',
    transition: 'transform 220ms ease, opacity 220ms ease, box-shadow 220ms ease',
  },
  brandWrap: {
    padding: '22px 18px 16px',
  },
  logo: {
    fontSize: '30px', fontWeight: 400, letterSpacing: '0.02em', lineHeight: 0.95,
    color: '#000', fontFamily: "'Dark Castle'",
    textTransform: 'none',
  },
  brandSub: {
    marginTop: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
  },
  brandChip: {
    padding: '8px 12px', borderRadius: 999, fontSize: 11, fontWeight: 400,
    letterSpacing: '0.04em', textTransform: 'uppercase', color: '#000',
    background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.16)',
    boxShadow: '0 6px 16px rgba(26,16,51,0.14)',
    fontFamily: "'Dark Castle'",
  },
  userCard: {
    marginTop: 16,
    display: 'grid', gridTemplateColumns: '44px 1fr', gap: 12,
    padding: '14px', borderRadius: 22,
    background: 'rgba(255,255,255,0.95)',
    border: '1px solid rgba(0,0,0,0.16)',
    boxShadow: '0 10px 24px rgba(26,16,51,0.16)',
  },
  avatar: {
    width: 44, height: 44, borderRadius: 16,
    display: 'grid', placeItems: 'center',
    background: 'linear-gradient(135deg, #30cfd0, #5b2aa8)', color: '#000',
    fontWeight: 400, fontSize: 16,
    fontFamily: "'Dark Castle'",
    boxShadow: '0 10px 20px rgba(26,16,51,0.22)',
  },
  userMeta: { minWidth: 0 },
  userLabel: {
    fontSize: 10, fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#000',
    fontFamily: "'Dark Castle'",
  },
  userName: {
    marginTop: 4, fontSize: 15, fontWeight: 400, color: '#000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    fontFamily: "'Dark Castle'",
  },
  userMode: {
    marginTop: 2, fontSize: 12, color: '#000',
    fontFamily: "'Dark Castle'",
  },
  navShell: { flex: 1, display: 'flex', flexDirection: 'column', padding: '6px 10px 10px' },
  navSectionLabel: {
    padding: '8px 12px', fontSize: 10, fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#000',
    fontFamily: "'Dark Castle'",
  },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px' },
  link: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '18px',
    textDecoration: 'none', fontSize: '14px', fontWeight: '400', color: '#000',
    transition: 'all 0.2s', border: '1px solid transparent', background: 'transparent', cursor: 'pointer',
    width: '100%', textAlign: 'left', position: 'relative',
    fontFamily: "'Dark Castle'",
  },
  linkActive: {
    color: '#000',
    background: 'rgba(255,255,255,0.95)',
    border: '2px solid #30cfd0',
    boxShadow: '0 10px 22px rgba(26,16,51,0.16)',
  },
  signOut: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '20px',
    textDecoration: 'none', fontSize: '14px', fontWeight: '400', color: '#000',
    transition: 'all 0.2s', border: '1px solid rgba(0,0,0,0.16)', background: 'rgba(255,255,255,0.92)', cursor: 'pointer',
    width: 'calc(100% - 20px)', textAlign: 'left', margin: '8px 10px 18px',
    fontFamily: "'Dark Castle'",
    boxShadow: '0 8px 18px rgba(26,16,51,0.12)',
  },
  goldDot: {
    width: 8, height: 8, borderRadius: '50%', background: '#000', marginLeft: 'auto', flexShrink: 0,
    boxShadow: '0 0 0 6px rgba(0,0,0,0.08)',
  },
  footerNote: {
    margin: '0 10px 6px', padding: '14px 16px', borderRadius: 20,
    background: 'rgba(255,255,255,0.95)',
    border: '1px solid rgba(0,0,0,0.16)',
    boxShadow: '0 8px 18px rgba(26,16,51,0.12)',
  },
  footerKicker: {
    fontSize: 10, fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#000',
    fontFamily: "'Dark Castle'",
  },
  footerText: {
    marginTop: 6, fontSize: 13, lineHeight: 1.45, color: '#000',
    fontFamily: "'Dark Castle'",
  },
};

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen = true, setSidebarOpen = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(s => s.auth.user);
  const isAdmin = user?.role === 'admin';

  const [moreOpen, setMoreOpen] = useState(false);
  const primaryNavItems = PRIMARY;
  const moreItems = isAdmin
    ? [...MORE, { id: 'admin', label: 'Admin', path: '/admin', icon: AdminIcon }]
    : MORE;
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
      (item.id === 'path' && location.pathname === '/path') ||
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
            color: 'var(--color-text)',
              background: 'rgba(42,157,143,0.1)',
              border: '1px solid rgba(42,157,143,0.18)',
            });
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            Object.assign(e.currentTarget.style, {
              color: 'var(--color-text-muted)',
              background: 'transparent',
              border: '1px solid transparent',
            });
          }
        }}
      >
        <Icon />
        {!isDesktopCollapsed && <span>{item.label}</span>}
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
                <span style={styles.brandChip}>Calm space</span>
                <span style={{ ...styles.brandChip, color: 'var(--color-text)' }}>Path · Mind · Body</span>
              </div>
              <div style={styles.userCard}>
                <div style={styles.avatar}>{initials || 'SO'}</div>
                <div style={styles.userMeta}>
                  <div style={styles.userLabel}>Active profile</div>
                  <div style={styles.userName}>{user?.name || user?.email || 'Sophia User'}</div>
                  <div style={styles.userMode}>{isAdmin ? 'Looking after the space' : 'Growing at your pace'}</div>
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
          {!isDesktopCollapsed && <div style={styles.navSectionLabel}>Rooms</div>}
          <nav style={styles.nav}>{renderNavItems(primaryNavItems)}</nav>
          {moreItems.length > 0 && (
            <>
              {!isDesktopCollapsed && (
                <button
                  type="button"
                  onClick={() => setMoreOpen((open) => !open)}
                  style={{
                    ...styles.navSectionLabel,
                    marginTop: 12,
                    background: 'none',
                    border: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--color-primary)',
                  }}
                >
                  {moreOpen ? 'More ▾' : 'More ▸'}
                </button>
              )}
              {(moreOpen || isDesktopCollapsed) && <nav style={styles.nav}>{renderNavItems(moreItems)}</nav>}
            </>
          )}
        </div>
        {!isDesktopCollapsed && (
          <div style={styles.footerNote}>
            <div style={styles.footerKicker}>HUD // calm core</div>
            <div style={styles.footerText}>Habits, journaling, and shadow work — held gently, not scored like a contest.</div>
            <a href="https://github.com/cyber-urbanrebel/sophia2" target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 10, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-primary-dark)', fontFamily: 'var(--font-mono)' }}>
              GitHub
            </a>
          </div>
        )}
      <button
        style={signOutStyle}
        aria-label="Sign out"
        title={isDesktopCollapsed ? 'Sign Out' : undefined}
        onClick={handleSignOut}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, { color: '#6B4F24', background: 'rgba(217,162,75,0.16)' })}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, { color: '#8A6A3A', background: 'rgba(217,162,75,0.08)' })}
      >
        <SignOutIcon />
        {!isDesktopCollapsed && <span>Sign Out</span>}
      </button>
    </aside>
    </>
  );
}
