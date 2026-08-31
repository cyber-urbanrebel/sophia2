import React from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import styles from '../styles/BottomNav.module.css';

/* ── Animated SVG icons ── */
const PathIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pathG" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#30cfd0" />
        <stop offset="100%" stopColor="#330867" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="9" stroke="url(#pathG)" strokeWidth="1.6">
      <animate attributeName="stroke-dasharray" from="0 60" to="60 0" dur="1.2s" fill="freeze" />
    </circle>
    <path d="M12 3a14.5 14.5 0 000 18" stroke="url(#pathG)" strokeWidth="1.2" opacity="0.6" />
    <circle cx="12" cy="12" r="2" fill="url(#pathG)">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const ShadowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shadowG" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#4b3a6e" />
        <stop offset="100%" stopColor="#1a1028" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="9" stroke="#a855f7" strokeWidth="1.5">
      <animate attributeName="stroke-dasharray" values="0 60;60 0" dur="1.5s" fill="freeze" />
    </circle>
    <path d="M12 3a9 9 0 000 18 9 9 0 010-18z" fill="url(#shadowG)" opacity="0.75">
      <animate attributeName="opacity" values="0.5;0.85;0.5" dur="3s" repeatCount="indefinite" />
    </path>
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="homeG" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="var(--color-primary)" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" stroke="url(#homeG)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <animate attributeName="stroke-dasharray" from="0 80" to="80 0" dur="1.2s" fill="freeze" />
    </path>
    <rect x="9" y="14" width="6" height="8" rx="1" stroke="url(#homeG)" strokeWidth="1.4" opacity="0.7">
      <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3s" repeatCount="indefinite" />
    </rect>
  </svg>
);

const BodyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bodyG" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#30cfd0" />
        <stop offset="100%" stopColor="#9BE9EA" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="5" r="2.5" stroke="url(#bodyG)" strokeWidth="1.5">
      <animate attributeName="r" values="2.5;2.8;2.5" dur="2s" repeatCount="indefinite" />
    </circle>
    <path d="M8 10h8l1 5h-2l-.5 6h-5L9 15H7l1-5z" stroke="url(#bodyG)" strokeWidth="1.4" strokeLinejoin="round">
      <animateTransform attributeName="transform" type="scale" values="1;1.03;1" dur="2.5s" repeatCount="indefinite" additive="sum" />
    </path>
    <path d="M6 11l-2 4M18 11l2 4" stroke="url(#bodyG)" strokeWidth="1.3" strokeLinecap="round">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
    </path>
  </svg>
);

const MindIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mindG" x1="2" y1="2" x2="22" y2="22">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    <path d="M12 2C7.58 2 4 5.58 4 10c0 2.12.83 4.05 2.18 5.48C7.56 17 8 19 8 20h8c0-1-.44-3-1.82-4.52A7.96 7.96 0 0020 10c0-4.42-3.58-8-8-8z" stroke="url(#mindG)" strokeWidth="1.5">
      <animate attributeName="stroke-dasharray" values="0 60;60 0" dur="1.5s" fill="freeze" />
    </path>
    <circle cx="12" cy="10" r="1.5" fill="url(#mindG)" opacity="0.8">
      <animate attributeName="r" values="1;2;1" dur="2.4s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" repeatCount="indefinite" />
    </circle>
    <path d="M10 20v2h4v-2" stroke="url(#mindG)" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const DisciplineIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="discG" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>
    </defs>
    <polygon points="12,2 14.5,9 22,9 16,13.5 18.5,21 12,16.5 5.5,21 8,13.5 2,9 9.5,9" stroke="url(#discG)" strokeWidth="1.4" fill="none" strokeLinejoin="round">
      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="12s" repeatCount="indefinite" />
    </polygon>
    <circle cx="12" cy="12" r="3" stroke="url(#discG)" strokeWidth="1.2" opacity="0.6">
      <animate attributeName="r" values="2.5;3.5;2.5" dur="3s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const ProgressIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="progG" x1="0" y1="24" x2="24" y2="0">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
    <polyline points="3,18 8,12 13,15 21,6" stroke="url(#progG)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <animate attributeName="stroke-dasharray" from="0 40" to="40 0" dur="1.4s" fill="freeze" />
    </polyline>
    <circle cx="21" cy="6" r="2" fill="url(#progG)">
      <animate attributeName="opacity" values="0;1;0.8" dur="1.6s" fill="freeze" />
      <animate attributeName="r" values="2;2.6;2" dur="2.5s" repeatCount="indefinite" begin="1.6s" />
    </circle>
    <line x1="3" y1="22" x2="22" y2="22" stroke="url(#progG)" strokeWidth="1.2" opacity="0.3" />
  </svg>
);

const AiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="aiG" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="var(--color-primary)" />
        <stop offset="100%" stopColor="#00ff88" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="9" stroke="url(#aiG)" strokeWidth="1.5">
      <animate attributeName="stroke-dasharray" values="0 60;60 0" dur="1.2s" fill="freeze" />
    </circle>
    <circle cx="9" cy="10" r="1.2" fill="url(#aiG)">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="15" cy="10" r="1.2" fill="url(#aiG)">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="0.3s" />
    </circle>
    <path d="M9 15c1.5 1.5 4.5 1.5 6 0" stroke="url(#aiG)" strokeWidth="1.3" strokeLinecap="round">
      <animate attributeName="d" values="M9 15c1.5 1.5 4.5 1.5 6 0;M9 14c1.5 2 4.5 2 6 0;M9 15c1.5 1.5 4.5 1.5 6 0" dur="3s" repeatCount="indefinite" />
    </path>
  </svg>
);

const AdminIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="adminG" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#c9a84c" />
        <stop offset="100%" stopColor="#f5d98a" />
      </linearGradient>
    </defs>
    <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="url(#adminG)" strokeWidth="1.5" fill="none">
      <animate attributeName="stroke-dasharray" from="0 70" to="70 0" dur="1.2s" fill="freeze" />
    </path>
    <path d="M9 12l2 2 4-4" stroke="url(#adminG)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <animate attributeName="opacity" values="0;1" dur="0.6s" begin="0.8s" fill="freeze" />
    </path>
  </svg>
);

const iconMap = {
  path: <PathIcon />,
  mind: <MindIcon />,
  body: <BodyIcon />,
  progress: <ProgressIcon />,
  profile: <PathIcon />,
};

const baseTabs = [
  { id: 'path', label: 'Path', path: '/path' },
  { id: 'mind', label: 'Mind', path: '/mind' },
  { id: 'body', label: 'Body', path: '/body' },
  { id: 'progress', label: 'Progress', path: '/progress' },
  { id: 'profile', label: 'You', path: '/profile' },
];

export default function BottomNav({ activeTab, setActiveTab }) {
  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    if (tab.path) navigate(tab.path);
  };

  return (
    <nav className={styles.nav} aria-label="Primary">
      {baseTabs.map((tab) => {
        const isActive = activeTab === tab.id || (tab.id === 'path' && activeTab === 'dashboard');
        return (
          <button
            key={tab.id}
            type="button"
            className={clsx(styles.tab, { [styles.active]: isActive })}
            onClick={() => handleTabClick(tab)}
            aria-label={tab.label}
          >
            <span className={styles.icon}>{iconMap[tab.id]}</span>
            <span className={styles.label}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

