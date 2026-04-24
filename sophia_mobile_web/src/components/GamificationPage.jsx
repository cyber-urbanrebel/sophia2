import React, { useState, useEffect, useMemo } from 'react';

const XP_KEY = 'sophia_xp_state';
const STREAK_KEY = 'sophia_streak';

// XP rewards per action
const XP_REWARDS = {
  habitComplete: 25,
  journalEntry: 30,
  pomodoroComplete: 40,
  taskComplete: 20,
  goalMilestone: 100,
  dailyLogin: 10,
  streakBonus7: 50,
  streakBonus30: 200,
};

// Level thresholds
function getLevelInfo(totalXP) {
  // Each level requires 20% more XP than the previous
  let level = 1, threshold = 100, accum = 0;
  while (accum + threshold <= totalXP) {
    accum += threshold;
    level++;
    threshold = Math.floor(threshold * 1.2);
  }
  const xpInLevel = totalXP - accum;
  const nextThreshold = threshold;
  return { level, xpInLevel, nextThreshold, totalXP };
}

const LEVEL_TITLES = [
  '', 'Beginner', 'Novice', 'Apprentice', 'Practitioner', 'Journeyman',
  'Adept', 'Expert', 'Master', 'Grandmaster', 'Sage', 'Enlightened',
  'Transcendent', 'Ascended', 'Legendary', 'Mythic', 'Divine', 'Cosmic',
  'Eternal', 'Infinite', 'Absolute',
];

const BADGES = [
  { id: 'first_habit', name: 'First Steps', desc: 'Complete your first habit', icon: '🌱', check: (s) => s.habitsCompleted >= 1 },
  { id: 'habit_10', name: 'Habit Builder', desc: 'Complete 10 habits', icon: '⚡', check: (s) => s.habitsCompleted >= 10 },
  { id: 'habit_50', name: 'Habit Master', desc: 'Complete 50 habits', icon: '🔥', check: (s) => s.habitsCompleted >= 50 },
  { id: 'journal_5', name: 'Reflective', desc: 'Write 5 journal entries', icon: '📝', check: (s) => s.journalEntries >= 5 },
  { id: 'journal_30', name: 'Storyteller', desc: 'Write 30 journal entries', icon: '📖', check: (s) => s.journalEntries >= 30 },
  { id: 'pomodoro_10', name: 'Focused', desc: 'Complete 10 focus sessions', icon: '🎯', check: (s) => s.pomodorosCompleted >= 10 },
  { id: 'pomodoro_50', name: 'Deep Worker', desc: 'Complete 50 focus sessions', icon: '🧠', check: (s) => s.pomodorosCompleted >= 50 },
  { id: 'streak_7', name: 'Week Warrior', desc: '7-day login streak', icon: '🏆', check: (s) => s.maxStreak >= 7 },
  { id: 'streak_30', name: 'Monthly Champion', desc: '30-day login streak', icon: '👑', check: (s) => s.maxStreak >= 30 },
  { id: 'level_5', name: 'Rising Star', desc: 'Reach level 5', icon: '⭐', check: (s) => getLevelInfo(s.totalXP).level >= 5 },
  { id: 'level_10', name: 'Elite', desc: 'Reach level 10', icon: '💎', check: (s) => getLevelInfo(s.totalXP).level >= 10 },
  { id: 'tasks_25', name: 'Productive', desc: 'Complete 25 tasks', icon: '✅', check: (s) => s.tasksCompleted >= 25 },
];

function loadState() {
  try {
    const v = localStorage.getItem(XP_KEY);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}

function loadStreak() {
  try {
    const v = localStorage.getItem(STREAK_KEY);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}

const defaultState = {
  totalXP: 0,
  habitsCompleted: 0,
  journalEntries: 0,
  pomodorosCompleted: 0,
  tasksCompleted: 0,
  goalsCompleted: 0,
  earnedBadges: [],
  xpHistory: [], // { xp, action, timestamp }
};

// Exported helper: call this from other components to award XP
export function awardXP(action, extra = {}) {
  const state = loadState() || { ...defaultState };
  const xpAmount = XP_REWARDS[action] || 0;
  if (!xpAmount) return state;

  state.totalXP += xpAmount;

  // Increment counters
  if (action === 'habitComplete') state.habitsCompleted = (state.habitsCompleted || 0) + 1;
  if (action === 'journalEntry') state.journalEntries = (state.journalEntries || 0) + 1;
  if (action === 'pomodoroComplete') state.pomodorosCompleted = (state.pomodorosCompleted || 0) + 1;
  if (action === 'taskComplete') state.tasksCompleted = (state.tasksCompleted || 0) + 1;
  if (action === 'goalMilestone') state.goalsCompleted = (state.goalsCompleted || 0) + 1;

  // Update streak
  const streak = loadStreak() || { current: 0, max: 0, lastDate: '' };
  state.maxStreak = streak.max || 0;

  // Log
  state.xpHistory = [...(state.xpHistory || []).slice(-200), { xp: xpAmount, action, timestamp: Date.now(), ...extra }];

  // Check new badges
  state.earnedBadges = state.earnedBadges || [];
  BADGES.forEach(b => {
    if (!state.earnedBadges.includes(b.id) && b.check(state)) {
      state.earnedBadges.push(b.id);
      state.totalXP += 50; // Bonus XP for badge
      state.xpHistory.push({ xp: 50, action: 'badge_earned', badge: b.name, timestamp: Date.now() });
    }
  });

  localStorage.setItem(XP_KEY, JSON.stringify(state));
  return state;
}

// Track daily login streak
export function trackDailyLogin() {
  const streak = loadStreak() || { current: 0, max: 0, lastDate: '' };
  const today = new Date().toDateString();

  if (streak.lastDate === today) return streak; // Already logged today

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (streak.lastDate === yesterday) {
    streak.current += 1;
  } else {
    streak.current = 1;
  }
  streak.max = Math.max(streak.max, streak.current);
  streak.lastDate = today;
  localStorage.setItem(STREAK_KEY, JSON.stringify(streak));

  // Award login XP
  awardXP('dailyLogin');
  if (streak.current === 7) awardXP('streakBonus7');
  if (streak.current === 30) awardXP('streakBonus30');

  return streak;
}

export default function GamificationPage() {
  const [state, setState] = useState(() => loadState() || { ...defaultState });
  const [streak, setStreak] = useState(() => loadStreak() || { current: 0, max: 0, lastDate: '' });
  const [showXPPopup, setShowXPPopup] = useState(null);

  // Track login
  useEffect(() => {
    const s = trackDailyLogin();
    setStreak(s);
    setState(loadState() || { ...defaultState });
  }, []);

  // Listen for XP changes from other components
  useEffect(() => {
    const interval = setInterval(() => {
      const current = loadState();
      if (current && current.totalXP !== state.totalXP) {
        setState(current);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [state.totalXP]);

  const levelInfo = useMemo(() => getLevelInfo(state.totalXP), [state.totalXP]);
  const title = LEVEL_TITLES[Math.min(levelInfo.level, LEVEL_TITLES.length - 1)] || 'Absolute';
  const progressPct = (levelInfo.xpInLevel / levelInfo.nextThreshold) * 100;

  const earnedBadges = BADGES.filter(b => (state.earnedBadges || []).includes(b.id));
  const lockedBadges = BADGES.filter(b => !(state.earnedBadges || []).includes(b.id));

  const recentXP = (state.xpHistory || []).slice(-10).reverse();

  const st = {
    page: { minHeight: '100vh', padding: '32px 24px', color: '#e0ddd6', fontFamily: '"Inter", -apple-system, sans-serif' },
    header: { fontSize: 28, fontWeight: 700, marginBottom: 4, background: 'linear-gradient(135deg, #c9a84c, #bb86fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    sub: { color: '#8a8a9a', fontSize: 14, marginBottom: 32 },
    levelCard: {
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18,
      padding: '28px 24px', marginBottom: 28, textAlign: 'center',
    },
    levelNum: { fontSize: 64, fontWeight: 800, background: 'linear-gradient(135deg, #c9a84c, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    levelTitle: { fontSize: 20, fontWeight: 600, color: '#c9a84c', marginTop: 4 },
    xpText: { fontSize: 14, color: '#8a8a9a', marginTop: 8 },
    progOuter: { width: '100%', maxWidth: 300, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', margin: '12px auto 0', overflow: 'hidden' },
    progInner: { height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, #c9a84c, #00d4ff)', transition: 'width 0.8s ease' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 32 },
    statCard: { padding: '16px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' },
    statVal: (color) => ({ fontSize: 24, fontWeight: 700, color }),
    statLabel: { fontSize: 12, color: '#8a8a9a', marginTop: 4 },
    sectionTitle: { fontSize: 18, fontWeight: 600, color: '#e0ddd6', marginBottom: 16 },
    badgeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 32 },
    badge: (earned) => ({
      padding: '16px 12px', borderRadius: 14, textAlign: 'center',
      background: earned ? 'rgba(201,168,76,0.06)' : 'rgba(255,255,255,0.02)',
      border: earned ? '1px solid rgba(201,168,76,0.2)' : '1px solid rgba(255,255,255,0.05)',
      opacity: earned ? 1 : 0.5,
    }),
    badgeIcon: { fontSize: 32, marginBottom: 8 },
    badgeName: (earned) => ({ fontSize: 13, fontWeight: 600, color: earned ? '#c9a84c' : '#8a8a9a' }),
    badgeDesc: { fontSize: 11, color: '#6a6a7a', marginTop: 4 },
    historyItem: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.04)', marginBottom: 4,
    },
  };

  return (
    <div style={st.page}>
      <h1 style={st.header}>Level & Achievements</h1>
      <p style={st.sub}>Earn XP for every action. Level up your growth.</p>

      {/* Level Card */}
      <div style={st.levelCard}>
        <div style={st.levelNum}>{levelInfo.level}</div>
        <div style={st.levelTitle}>{title}</div>
        <div style={st.xpText}>{state.totalXP.toLocaleString()} total XP • {levelInfo.xpInLevel} / {levelInfo.nextThreshold} to next level</div>
        <div style={st.progOuter}>
          <div style={{ ...st.progInner, width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Stats Grid */}
      <div style={st.statsGrid}>
        <div style={st.statCard}><div style={st.statVal('#3fb950')}>{state.habitsCompleted || 0}</div><div style={st.statLabel}>Habits Completed</div></div>
        <div style={st.statCard}><div style={st.statVal('#bb86fc')}>{state.journalEntries || 0}</div><div style={st.statLabel}>Journal Entries</div></div>
        <div style={st.statCard}><div style={st.statVal('#00d4ff')}>{state.pomodorosCompleted || 0}</div><div style={st.statLabel}>Focus Sessions</div></div>
        <div style={st.statCard}><div style={st.statVal('#f78166')}>{state.tasksCompleted || 0}</div><div style={st.statLabel}>Tasks Done</div></div>
        <div style={st.statCard}><div style={st.statVal('#c9a84c')}>{streak.current || 0}</div><div style={st.statLabel}>Day Streak</div></div>
        <div style={st.statCard}><div style={st.statVal('#c9a84c')}>{streak.max || 0}</div><div style={st.statLabel}>Best Streak</div></div>
      </div>

      {/* Earned Badges */}
      <h2 style={st.sectionTitle}>🏆 Earned Badges ({earnedBadges.length})</h2>
      {earnedBadges.length === 0 ? (
        <div style={{ color: '#6a6a7a', fontSize: 14, marginBottom: 32 }}>Complete actions to earn your first badge!</div>
      ) : (
        <div style={st.badgeGrid}>
          {earnedBadges.map(b => (
            <div key={b.id} style={st.badge(true)}>
              <div style={st.badgeIcon}>{b.icon}</div>
              <div style={st.badgeName(true)}>{b.name}</div>
              <div style={st.badgeDesc}>{b.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* Locked Badges */}
      <h2 style={st.sectionTitle}>🔒 Locked ({lockedBadges.length})</h2>
      <div style={st.badgeGrid}>
        {lockedBadges.map(b => (
          <div key={b.id} style={st.badge(false)}>
            <div style={st.badgeIcon}>{b.icon}</div>
            <div style={st.badgeName(false)}>{b.name}</div>
            <div style={st.badgeDesc}>{b.desc}</div>
          </div>
        ))}
      </div>

      {/* XP History */}
      {recentXP.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <h2 style={st.sectionTitle}>Recent XP</h2>
          {recentXP.map((entry, i) => (
            <div key={i} style={st.historyItem}>
              <span style={{ color: '#e0ddd6', fontSize: 13 }}>{entry.action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}{entry.badge ? `: ${entry.badge}` : ''}</span>
              <span style={{ color: '#3fb950', fontSize: 13, fontWeight: 600 }}>+{entry.xp} XP</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
