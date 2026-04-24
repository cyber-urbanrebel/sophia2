import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { AvatarDisplay } from './AvatarUpload.jsx';
import SophiaOrb from './SophiaOrb.jsx';
import { MeditationIcon, WaterIcon, TaskCheckIcon, ChartBarIcon, BodyFitIcon, BrainIcon, LightningIcon, FlameIcon, TrendUpIcon, LightbulbIcon, SunriseIcon, SunIcon, MoonIcon } from './SophiaIcons.jsx';
import { SkeletonLoader } from './ui/EmptyState.jsx';
import TiltCard from './ui/TiltCard.jsx';

const STATS_KEY = 'sophia_today_stats';
const ACTIVITY_KEY = 'sophia_recent_activity';

function loadJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

const HomeDashboard = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [profile] = useState(() => loadJSON('sophia-user-profile', loadJSON('sophia_user_profile', { name: 'User' })));
  const [masterScore, setMasterScore] = useState(0);
  const [goals] = useState(() => loadJSON('sophia_goals', []));
  const [todayStats, setTodayStats] = useState(() => loadJSON(STATS_KEY, {
    meditationMinutes: 0,
    waterIntake: 0,
    tasksCompleted: 0,
    habitsTracked: 0,
  }));
  const [recentActivity] = useState(() => loadJSON(ACTIVITY_KEY, []));
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [habits, tasks] = await Promise.allSettled([
          api.getHabitStats(),
          api.getTasks('all'),
        ]);

        const habitData = habits.status === 'fulfilled' ? habits.value : {};
        const taskData = tasks.status === 'fulfilled' ? tasks.value : [];
        const completedTasks = Array.isArray(taskData) ? taskData.filter((task) => task.completed).length : 0;

        if (!cancelled) {
          const liveStats = {
            meditationMinutes: todayStats.meditationMinutes,
            waterIntake: todayStats.waterIntake,
            tasksCompleted: completedTasks,
            habitsTracked: habitData.completed || 0,
          };
          setTodayStats(liveStats);
          localStorage.setItem(STATS_KEY, JSON.stringify(liveStats));
        }
      } catch {
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [todayStats.meditationMinutes, todayStats.waterIntake]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { icon: <SunriseIcon size={24} />, text: 'Good morning' };
    if (hour < 18) return { icon: <SunIcon size={24} />, text: 'Good afternoon' };
    return { icon: <MoonIcon size={24} />, text: 'Good evening' };
  };

  const calculateMasterScore = useCallback(() => {
    const scores = [
      Math.min(todayStats.tasksCompleted * 15, 100),
      Math.min(todayStats.habitsTracked * 15, 100),
      Math.min(todayStats.meditationMinutes * 3, 100),
      Math.min(todayStats.waterIntake * 12, 100),
    ];
    const average = scores.reduce((sum, value) => sum + value, 0) / scores.length;
    return Math.min(Math.round(average), 100);
  }, [todayStats]);

  useEffect(() => {
    setMasterScore(calculateMasterScore());
  }, [calculateMasterScore]);

  const greeting = getGreeting();
  const fullName = String(profile?.name || 'User') || 'User';
  const firstName = fullName.split(/\s+/)[0] || 'User';
  const performanceLabel = masterScore >= 80 ? 'Peak state' : masterScore >= 60 ? 'Locked in' : 'Warming up';
  const todaysFocus = useMemo(() => {
    const ranked = [
      { id: 'body', score: todayStats.waterIntake + Math.floor(todayStats.habitsTracked / 2), label: 'Body cadence' },
      { id: 'mind', score: todayStats.meditationMinutes, label: 'Mind stillness' },
      { id: 'discipline', score: todayStats.tasksCompleted * 2, label: 'Execution rhythm' },
      { id: 'progress', score: masterScore, label: 'Progress review' },
    ].sort((a, b) => b.score - a.score);
    return ranked[0]?.label || 'Execution rhythm';
  }, [masterScore, todayStats]);
  const getHumanizedTip = () => {
    const tips = [
      `${firstName}, Sophia recommends one visible win before noon. Start with the smallest task that creates momentum.`,
      `${firstName}'s moment: Complete one habit before checking anything else. That builds unstoppable momentum.`,
      `Hey ${firstName} — consistency beats intensity. One small action today is worth a week of planning.`,
      `${firstName}, your body and mind perform best when aligned. Check both before proceeding.`,
      `Remember ${firstName}: the best time to act was yesterday. The next best time is now.`,
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };
  const dailyTip = getHumanizedTip();
  const quickLinks = [
    { key: 'body', icon: <BodyFitIcon size={34} />, label: 'Body', copy: 'Training, hydration, sleep, and physical systems.' },
    { key: 'mind', icon: <BrainIcon size={34} />, label: 'Mind', copy: 'Mood tracking, reflection, and inner clarity.' },
    { key: 'discipline', icon: <LightningIcon size={34} />, label: 'Discipline', copy: 'Habits, goals, routines, and execution.' },
    { key: 'progress', icon: <TrendUpIcon size={34} />, label: 'Progress', copy: 'Metrics, patterns, and weekly visibility.' },
  ];
  const stats = [
    { label: 'Meditation', value: todayStats.meditationMinutes, suffix: 'm', icon: <MeditationIcon size={20} /> },
    { label: 'Hydration', value: todayStats.waterIntake, suffix: 'L', icon: <WaterIcon size={20} /> },
    { label: 'Tasks', value: todayStats.tasksCompleted, suffix: '', icon: <TaskCheckIcon size={20} /> },
    { label: 'Habits', value: todayStats.habitsTracked, suffix: '', icon: <ChartBarIcon size={20} /> },
  ];
  const activeGoals = goals.slice(0, 3);
  const timeline = [
    { title: 'Neural check-in', copy: 'Sophia syncs your priorities, streaks, and current focus windows.' },
    { title: 'Execution window', copy: 'Move through Body, Mind, and Discipline with visible progress feedback.' },
    { title: 'Reflection loop', copy: 'Close the day with updated insights, wins, and trend visibility.' },
  ];
  const systemChips = [
    { label: isOffline ? 'Offline mode' : 'Realtime sync', tone: isOffline ? '#ff845f' : '#01d5c1' },
    { label: `Focus: ${todaysFocus}`, tone: '#35a8ff' },
    { label: `Auth: ${localStorage.getItem('use_firebase_auth') === 'true' ? 'Firebase' : 'API'}`, tone: '#7a6cff' },
  ];

  return (
    <div className="sophia-home sophia-reveal" data-sophia-reveal style={{ paddingBottom: 48 }}>
      <section className="dashboard-card sophia-reveal" data-sophia-reveal style={{ padding: 18, marginBottom: 22 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          {systemChips.map((chip) => (
            <span
              key={chip.label}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 999,
                padding: '8px 14px',
                background: 'rgba(255,255,255,0.55)',
                border: `1px solid ${chip.tone}55`,
                color: '#11253d',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.03em',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: chip.tone }} />
              {chip.label}
            </span>
          ))}
          <button
            type="button"
            className="sophia-secondary-btn"
            onClick={() => onNavigate && onNavigate('progress')}
            style={{ marginLeft: 'auto', borderRadius: 14, padding: '10px 14px', fontWeight: 700 }}
          >
            Open command center
          </button>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 22, alignItems: 'stretch' }}>
        <section className="dashboard-card sophia-feature-card sophia-reveal" data-sophia-reveal style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
            <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
              <AvatarDisplay size={56} fallbackName={profile.name} />
            </div>
            <div className="hero-kicker sophia-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999 }}>
              {greeting.icon}
              <span>{greeting.text}</span>
            </div>
          </div>

          <h1 className="hero-title sophia-gradient-text" style={{ margin: 0, fontSize: 'clamp(54px, 7vw, 94px)', lineHeight: 0.9, letterSpacing: '-0.08em' }}>
            SOPHIA guides
            <br />
            <span style={{ color: '#f5fbff', WebkitTextFillColor: 'inherit' }}>{firstName}'s next move.</span>
          </h1>

          <p className="hero-sub sophia-shell-copy" style={{ margin: '20px 0 24px', maxWidth: 620, fontSize: 17, lineHeight: 1.75 }}>
            Meet your personal AI operating system. SOPHIA learns your rhythms, celebrates your wins, and guides your execution across Body, Mind, Discipline, and Progress. Built for {firstName}.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <button type="button" className="sophia-primary-btn" onClick={() => onNavigate && onNavigate('discipline')} style={{ padding: '14px 20px', borderRadius: 16, cursor: 'pointer', fontWeight: 800 }}>
              Open SOPHIA Core
            </button>
            <button type="button" className="sophia-secondary-btn" onClick={() => onNavigate && onNavigate('progress')} style={{ padding: '14px 20px', borderRadius: 16, cursor: 'pointer', fontWeight: 700 }}>
              Review progress
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <span className="hero-pill">Hello {firstName}</span>
            <span className="hero-pill">Master score {masterScore}</span>
            <span className="hero-pill">{performanceLabel}</span>
          </div>
        </section>

        <section className="dashboard-card sophia-feature-card sophia-reveal" data-sophia-reveal style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SophiaOrb />
        </section>
      </div>

      <section className="dashboard-card sophia-reveal" data-sophia-reveal style={{ padding: 28, marginTop: 22 }}>
        <div className="section-heading" style={{ marginBottom: 18 }}>
          <div>
            <p className="eyebrow sophia-mono">Live metrics</p>
            <h3 style={{ margin: '8px 0 0', fontSize: 32 }}>Cognitive + physical signal board</h3>
          </div>
        </div>
        {loading ? (
          <SkeletonLoader variant="stat" count={4} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {stats.map((stat) => (
              <TiltCard key={stat.label} className="stat-card sophia-card-hover" maxTilt={10} scale={1.02} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: 160, padding: '24px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={{ color: '#00d4ff', fontSize: 18 }}>{stat.icon}</span>
                </div>
                <div style={{ color: '#9ab2ca', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{stat.label}</div>
                <div className="sophia-stat-number" data-sophia-count={stat.value} data-sophia-suffix={stat.suffix} style={{ fontSize: 32, fontWeight: 800, color: '#00d4ff', fontFamily: 'JetBrains Mono, monospace' }}>
                  {stat.value}<span style={{ fontSize: 20, color: '#f5fbff', marginLeft: 4 }}>{stat.suffix}</span>
                </div>
              </TiltCard>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-card sophia-reveal" data-sophia-reveal style={{ padding: 28, marginTop: 22 }}>
        <div className="section-heading" style={{ marginBottom: 18 }}>
          <div>
            <p className="eyebrow sophia-mono">Core systems</p>
            <h3 style={{ margin: '8px 0 0', fontSize: 32 }}>Navigate the self-improvement stack</h3>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {quickLinks.map((item) => (
            <TiltCard key={item.key} className="section-card sophia-card-hover" maxTilt={14} scale={1.03} onClick={() => onNavigate && onNavigate(item.key)} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: 240, padding: '28px 24px' }}>
              <div style={{ marginBottom: 18, color: '#00d4ff', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 14, color: '#f5fbff', fontFamily: 'Orbitron, Space Grotesk, sans-serif', letterSpacing: '0.02em' }}>{item.label}</div>
              <div style={{ color: '#9ab2ca', lineHeight: 1.65, fontSize: 14, maxWidth: '100%', wordWrap: 'break-word', hyphens: 'auto' }}>{item.copy}</div>
            </TiltCard>
          ))}
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 22, marginTop: 22 }}>
        <section className="dashboard-card sophia-reveal" data-sophia-reveal style={{ padding: 28 }}>
          <div className="section-heading" style={{ marginBottom: 18 }}>
            <div>
              <p className="eyebrow sophia-mono">Goal sync</p>
              <h3 style={{ margin: '8px 0 0', fontSize: 32 }}>Progress and momentum</h3>
            </div>
          </div>
          {activeGoals.length ? (
            <div style={{ display: 'grid', gap: 16 }}>
              {activeGoals.map((goal, index) => {
                const progress = Number(goal.progress || Math.min(35 + (index * 18), 92));
                return (
                  <div key={`${goal.title || goal.name || 'goal'}-${index}`} className="sophia-panel" style={{ padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                      <div style={{ color: '#f5fbff', fontWeight: 700 }}>{goal.title || goal.name || `Goal ${index + 1}`}</div>
                      <div className="sophia-mono" style={{ color: '#00d4ff', fontSize: 13 }}>{progress}%</div>
                    </div>
                    <div className="sophia-progress-meter">
                      <span data-sophia-progress={progress} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ color: '#9ab2ca', lineHeight: 1.7 }}>No tracked goals are active yet. Sophia will light this board up as soon as you begin creating measurable targets.</div>
          )}
        </section>

        <section className="sophia-quote sophia-reveal" data-sophia-reveal>
          <div className="quote-line" />
          <p className="eyebrow sophia-mono" style={{ marginBottom: 12 }}>💡 Personal message for {firstName}</p>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.8, color: '#f5fbff', fontStyle: 'italic' }}>
            "{dailyTip}"
          </p>
          <p style={{ margin: '14px 0 0', color: '#9ab2ca', fontSize: 14 }}>
            Sophia grows with you. Every action you log strengthens her understanding of your rhythms and patterns.
          </p>
        </section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 22, marginTop: 22 }}>
        <section className="dashboard-card sophia-reveal" data-sophia-reveal style={{ padding: 28 }}>
          <div className="section-heading" style={{ marginBottom: 18 }}>
            <div>
              <p className="eyebrow sophia-mono">🔥 {firstName}'s momentum</p>
              <h3 style={{ margin: '8px 0 0', fontSize: 32 }}>Your recent victories</h3>
            </div>
          </div>
          {recentActivity.length === 0 ? (
            <div style={{ color: '#9ab2ca', lineHeight: 1.7, padding: '20px', textAlign: 'center', background: 'rgba(0, 212, 255, 0.05)', borderRadius: 12 }}>🌱 Your momentum starts with the first action, {firstName}. Complete a habit, task, or session to light this up.</div>
          ) : (
            <div style={{ color: '#9ab2ca', lineHeight: 1.7, padding: '20px', textAlign: 'center', background: 'rgba(0, 212, 255, 0.05)', borderRadius: 12 }}>🌱 Your momentum starts with the first action, {firstName}. Complete a habit, task, or session to light this up.</div>
          )
          }
        </section>

        <section className="sophia-timeline sophia-reveal" data-sophia-reveal>
          <p className="eyebrow sophia-mono" style={{ marginBottom: 18 }}>Sophia flow</p>
          <div className="sophia-timeline-list">
            {timeline.map((step) => (
              <div key={step.title} className="sophia-timeline-item">
                <div style={{ color: '#f5fbff', fontWeight: 700, marginBottom: 6 }}>{step.title}</div>
                <div style={{ color: '#9ab2ca', lineHeight: 1.65 }}>{step.copy}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
            <span className="hero-pill"><FlameIcon size={16} /> Build visible streaks</span>
            <span className="hero-pill"><TrendUpIcon size={16} /> Review progress weekly</span>
            <span className="hero-pill"><LightbulbIcon size={16} /> Let SOPHIA coach the next step</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomeDashboard;