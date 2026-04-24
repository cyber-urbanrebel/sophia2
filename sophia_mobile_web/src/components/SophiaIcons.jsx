import React from 'react';

/* ─────────────────────────────────────────────
   SOPHIA Infographic Icons
   Premium SVG icons with gradient fills to
   replace plain emojis throughout the app.
   ───────────────────────────────────────────── */

const W = ({ size, children }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, flexShrink: 0, verticalAlign: 'middle' }}>
    {children}
  </span>
);

/* ── Water Droplet ── */
export const WaterIcon = ({ size = 24 }) => (
  <W size={size}>
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="si-w" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00d4ff" />
          <stop offset="1" stopColor="#0066ff" />
        </linearGradient>
      </defs>
      <path d="M12 2.5s-7 8-7 12.5a7 7 0 0014 0c0-4.5-7-12.5-7-12.5z" fill="url(#si-w)" fillOpacity="0.85" />
      <ellipse cx="9.5" cy="14" rx="1.5" ry="2" fill="#fff" fillOpacity="0.18" />
    </svg>
  </W>
);

/* ── Meditation / Lotus ── */
export const MeditationIcon = ({ size = 24 }) => (
  <W size={size}>
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="si-m" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3d9e75" />
          <stop offset="1" stopColor="#00d4ff" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="6" r="2.8" fill="url(#si-m)" />
      <path d="M12 10v4" stroke="url(#si-m)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 13c1.5 0 2.5-.5 4-.5s2.5.5 4 .5" stroke="url(#si-m)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M6 20c0-3 3-5 6-5s6 2 6 5" stroke="url(#si-m)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  </W>
);

/* ── Task / Checkmark ── */
export const TaskCheckIcon = ({ size = 24 }) => (
  <W size={size}>
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="si-ck" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3d9e75" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" stroke="url(#si-ck)" strokeWidth="1.8" fill="url(#si-ck)" fillOpacity="0.12" />
      <path d="M7.5 12.5l3 3 6-6.5" stroke="url(#si-ck)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </W>
);

/* ── Analytics / Bar Chart ── */
export const ChartBarIcon = ({ size = 24 }) => (
  <W size={size}>
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="si-ch" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a855f7" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <rect x="3" y="13" width="4" height="8" rx="1.2" fill="url(#si-ch)" fillOpacity="0.7" />
      <rect x="10" y="8" width="4" height="13" rx="1.2" fill="url(#si-ch)" fillOpacity="0.85" />
      <rect x="17" y="3" width="4" height="18" rx="1.2" fill="url(#si-ch)" />
    </svg>
  </W>
);

/* ── Body / Fitness ── */
export const BodyFitIcon = ({ size = 24 }) => (
  <W size={size}>
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="si-bf" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff6b6b" />
          <stop offset="1" stopColor="#ffa502" />
        </linearGradient>
      </defs>
      <rect x="2" y="8" width="3" height="8" rx="1.5" fill="url(#si-bf)" />
      <rect x="19" y="8" width="3" height="8" rx="1.5" fill="url(#si-bf)" />
      <rect x="5" y="10" width="14" height="4" rx="2" fill="url(#si-bf)" fillOpacity="0.8" />
      <rect x="5" y="9" width="3" height="6" rx="1" fill="url(#si-bf)" />
      <rect x="16" y="9" width="3" height="6" rx="1" fill="url(#si-bf)" />
    </svg>
  </W>
);

/* ── Brain / Mind ── */
export const BrainIcon = ({ size = 24 }) => (
  <W size={size}>
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="si-br" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a855f7" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <path d="M12 2C8.5 2 5.5 4.5 5 7.5c-1.5.8-2.5 2.5-2.5 4.3 0 2 1.2 3.7 3 4.4.5 2.2 2.5 3.8 4.8 3.8H12" stroke="url(#si-br)" strokeWidth="1.6" strokeLinecap="round" fill="url(#si-br)" fillOpacity="0.08" />
      <path d="M12 2c3.5 0 6.5 2.5 7 5.5 1.5.8 2.5 2.5 2.5 4.3 0 2-1.2 3.7-3 4.4-.5 2.2-2.5 3.8-4.8 3.8H12" stroke="url(#si-br)" strokeWidth="1.6" strokeLinecap="round" fill="url(#si-br)" fillOpacity="0.08" />
      <line x1="12" y1="2" x2="12" y2="20" stroke="url(#si-br)" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.5" />
    </svg>
  </W>
);

/* ── Lightning / Discipline ── */
export const LightningIcon = ({ size = 24 }) => (
  <W size={size}>
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="si-lt" x1="8" y1="2" x2="16" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <path d="M13 2L4.5 13h5.5l-1.5 9L18 11h-5.5L13 2z" fill="url(#si-lt)" fillOpacity="0.9" />
    </svg>
  </W>
);

/* ── Flame / Streak ── */
export const FlameIcon = ({ size = 24 }) => (
  <W size={size}>
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="si-fl" x1="12" y1="1" x2="12" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" />
          <stop offset=".5" stopColor="#f97316" />
          <stop offset="1" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <path d="M12 1c-1.5 4-6 6.5-6 12a6 6 0 0012 0c0-5.5-4.5-8-6-12z" fill="url(#si-fl)" fillOpacity="0.9" />
      <path d="M12 10c-.8 2-2.5 3-2.5 5.5a2.5 2.5 0 005 0c0-2.5-1.7-3.5-2.5-5.5z" fill="#fff" fillOpacity="0.2" />
    </svg>
  </W>
);

/* ── Trend Up / Progress ── */
export const TrendUpIcon = ({ size = 24 }) => (
  <W size={size}>
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="si-tu" x1="2" y1="20" x2="22" y2="4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <polyline points="2,18 7,11 12,14 22,4" stroke="url(#si-tu)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="22" cy="4" r="2.2" fill="url(#si-tu)" />
      <path d="M2 18L7 11 12 14 22 4V18H2z" fill="url(#si-tu)" fillOpacity="0.08" />
    </svg>
  </W>
);

/* ── Lightbulb / Tip ── */
export const LightbulbIcon = ({ size = 24 }) => (
  <W size={size}>
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="si-lb" x1="12" y1="1" x2="12" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" />
          <stop offset="1" stopColor="#c9a84c" />
        </linearGradient>
      </defs>
      <path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" fill="url(#si-lb)" fillOpacity="0.85" />
      <rect x="9" y="18" width="6" height="2" rx="1" fill="url(#si-lb)" fillOpacity="0.6" />
      <rect x="10" y="21" width="4" height="1.5" rx="0.75" fill="url(#si-lb)" fillOpacity="0.4" />
      <path d="M10 8l2 3 2-3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
    </svg>
  </W>
);

/* ── Sunrise / Morning ── */
export const SunriseIcon = ({ size = 24 }) => (
  <W size={size}>
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="si-sr" x1="12" y1="6" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <path d="M12 8a6 6 0 00-6 6h12a6 6 0 00-6-6z" fill="url(#si-sr)" fillOpacity="0.8" />
      <line x1="12" y1="2" x2="12" y2="5" stroke="url(#si-sr)" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="4.2" y1="8.2" x2="6" y2="10" stroke="url(#si-sr)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="19.8" y1="8.2" x2="18" y2="10" stroke="url(#si-sr)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="16" x2="22" y2="16" stroke="url(#si-sr)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="20" x2="22" y2="20" stroke="url(#si-sr)" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    </svg>
  </W>
);

/* ── Sun / Afternoon ── */
export const SunIcon = ({ size = 24 }) => (
  <W size={size}>
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="si-sn" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="5" fill="url(#si-sn)" fillOpacity="0.9" />
      <g stroke="url(#si-sn)" strokeWidth="1.8" strokeLinecap="round">
        <line x1="12" y1="1" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="23" />
        <line x1="1" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="23" y2="12" />
        <line x1="4.2" y1="4.2" x2="6.3" y2="6.3" />
        <line x1="17.7" y1="17.7" x2="19.8" y2="19.8" />
        <line x1="4.2" y1="19.8" x2="6.3" y2="17.7" />
        <line x1="17.7" y1="6.3" x2="19.8" y2="4.2" />
      </g>
    </svg>
  </W>
);

/* ── Moon / Evening ── */
export const MoonIcon = ({ size = 24 }) => (
  <W size={size}>
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="si-mn" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="url(#si-mn)" fillOpacity="0.85" />
      <circle cx="9" cy="8" r="0.8" fill="#fff" fillOpacity="0.3" />
      <circle cx="13" cy="14" r="0.5" fill="#fff" fillOpacity="0.2" />
    </svg>
  </W>
);

/* ── Target / Goal ── */
export const TargetIcon = ({ size = 24 }) => (
  <W size={size}>
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="si-tg" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ef4444" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" stroke="url(#si-tg)" strokeWidth="1.5" fill="url(#si-tg)" fillOpacity="0.06" />
      <circle cx="12" cy="12" r="6.5" stroke="url(#si-tg)" strokeWidth="1.5" fill="url(#si-tg)" fillOpacity="0.1" />
      <circle cx="12" cy="12" r="3" fill="url(#si-tg)" fillOpacity="0.85" />
    </svg>
  </W>
);

/* ── Invite / Person+ ── */
export const InviteIcon = ({ size = 24 }) => (
  <W size={size}>
    <svg viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="si-inv" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c9a84c" />
          <stop offset="1" stopColor="#e8c564" />
        </linearGradient>
      </defs>
      <circle cx="10" cy="7" r="4" stroke="url(#si-inv)" strokeWidth="1.8" />
      <path d="M2 21v-2a6 6 0 0112 0v2" stroke="url(#si-inv)" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="19" y1="8" x2="19" y2="16" stroke="url(#si-inv)" strokeWidth="2" strokeLinecap="round" />
      <line x1="15" y1="12" x2="23" y2="12" stroke="url(#si-inv)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </W>
);

/* ── Emoji → Icon mapping utility ── */
const ICON_MAP = {
  '💧': WaterIcon,
  '🧘': MeditationIcon,
  '✅': TaskCheckIcon,
  '📊': ChartBarIcon,
  '💪': BodyFitIcon,
  '🧠': BrainIcon,
  '⚡': LightningIcon,
  '🔥': FlameIcon,
  '📈': TrendUpIcon,
  '💡': LightbulbIcon,
  '🌅': SunriseIcon,
  '☀️': SunIcon,
  '🌙': MoonIcon,
  '🎯': TargetIcon,
};

/**
 * Converts an emoji string to a rich SVG icon.
 * Falls back to the original emoji if no icon exists.
 */
export function renderIcon(emoji, size = 24) {
  const Comp = ICON_MAP[emoji];
  if (Comp) return <Comp size={size} />;
  return <span style={{ fontSize: size * 0.85 }}>{emoji}</span>;
}
