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
  const performanceLabel = masterScore >= 80 ? 'You are in a strong rhythm' : masterScore >= 60 ? 'Steady and present' : 'Warming up — that is enough';
  const todaysFocus = useMemo(() => {
    const ranked = [
      { id: 'body', score: todayStats.waterIntake + Math.floor(todayStats.habitsTracked / 2), label: 'care for your body' },
      { id: 'mind', score: todayStats.meditationMinutes, label: 'a quieter mind' },
      { id: 'discipline', score: todayStats.tasksCompleted * 2, label: 'one small follow-through' },
      { id: 'progress', score: masterScore, label: 'looking back kindly' },
    ].sort((a, b) => b.score - a.score);
    return ranked[0]?.label || 'Execution rhythm';
  }, [masterScore, todayStats]);
  const getHumanizedTip = () => {
    const tips = [
      `${firstName}, start with one thing you can finish before lunch. Small is still real.`,
      `If everything feels loud, ${firstName}, pick the kindest next step — not the biggest one.`,
      `You do not have to earn rest. One honest action today is plenty.`,
      `${firstName}, check in with your body before you push. Alignment beats force.`,
      `Yesterday already happened. Today only asks for the next kind choice.`,
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };
  const dailyTip = getHumanizedTip();
  const quickLinks = [
    { key: 'body', icon: <BodyFitIcon size={34} />, label: 'Body', copy: 'Water, rest, movement — the quiet basics that hold you up.' },
    { key: 'mind', icon: <BrainIcon size={34} />, label: 'Mind', copy: 'A place to notice mood, write things down, and breathe.' },
    { key: 'discipline', icon: <LightningIcon size={34} />, label: 'Discipline', copy: 'Habits and tasks, treated as promises to yourself — not punishment.' },
    { key: 'progress', icon: <TrendUpIcon size={34} />, label: 'Progress', copy: 'See the pattern of your weeks without turning it into a scoreboard.' },
  ];
  const stats = [
    { label: 'Meditation', value: todayStats.meditationMinutes, suffix: 'm', icon: <MeditationIcon size={20} /> },
    { label: 'Hydration', value: todayStats.waterIntake, suffix: 'L', icon: <WaterIcon size={20} /> },
    { label: 'Tasks', value: todayStats.tasksCompleted, suffix: '', icon: <TaskCheckIcon size={20} /> },
    { label: 'Habits', value: todayStats.habitsTracked, suffix: '', icon: <ChartBarIcon size={20} /> },
  ];
  const activeGoals = goals.slice(0, 3);
  const timeline = [
    { title: 'Arrive', copy: 'A short check-in: how you slept, how you feel, what actually matters today.' },
    { title: 'Do one kind thing', copy: 'Move through Body, Mind, or Discipline — whichever feels honest, not heroic.' },
    { title: 'Close the loop', copy: 'Note a win, however small, so tomorrow does not start from zero.' },
  ];
  const systemChips = [
    { label: isOffline ? 'Working offline' : 'Link live', tone: isOffline ? '#E8C36A' : '#30cfd0' },
    { label: `Next: ${todaysFocus}`, tone: '#9BE9EA' },
  ];

  return (
    <div className="sophia-home sophia-reveal" data-sophia-reveal style={{ paddingBottom: 48 }}>
      <div className="loop-grid">
        <div className="loop-cell">
          <div className="idx">01 / arrive</div>
          <h3>How am I?</h3>
          <p>{greeting.text}, {firstName}. {performanceLabel}.</p>
        </div>
        <div className="loop-cell">
          <div className="idx">02 / one step</div>
          <h3>What is kind next?</h3>
          <p>Today leans toward {todaysFocus}.</p>
          <button type="button" onClick={() => onNavigate && onNavigate('discipline')}>Open that room →</button>
        </div>
        <div className="loop-cell">
          <div className="idx">03 / close</div>
          <h3>Did I close yesterday?</h3>
          <p>{recentActivity.length ? `${recentActivity.length} marks on the log.` : 'Nothing logged yet. A sip of water or a sentence counts.'}</p>
          <button type="button" onClick={() => onNavigate && onNavigate('progress')}>Review the loop →</button>
        </div>
      </div>

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
                background: 'rgba(255, 255, 255, 0.88)',
                border: `1px solid ${chip.tone}66`,
                color: '#000',
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
            Open today's notes
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

          <h1 className="hero-title sophia-gradient-text" style={{ margin: 0, fontSize: 'clamp(44px, 7vw, 88px)', lineHeight: 0.94, letterSpacing: '-0.04em' }}>
            You are here,
            <br />
            <span style={{ color: 'var(--color-text)', WebkitTextFillColor: 'var(--color-text)' }}>{firstName}.</span>
          </h1>

          <p className="hero-sub sophia-shell-copy" style={{ margin: '20px 0 8px', maxWidth: 620, fontSize: 17, lineHeight: 1.75 }}>
            SOPHIA is a wellness companion — not a drill sergeant. We will keep your habits, journal, and progress in one calm place.
          </p>
          <p className="sophia-mono" style={{ margin: '0 0 24px', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
            01 / path · last synced {new Date().toLocaleDateString()}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <button type="button" className="sophia-primary-btn" onClick={() => onNavigate && onNavigate('discipline')} style={{ padding: '14px 20px', borderRadius: 16, cursor: 'pointer', fontWeight: 800 }}>
              Begin gently
            </button>
            <button type="button" className="sophia-secondary-btn" onClick={() => onNavigate && onNavigate('progress')} style={{ padding: '14px 20px', borderRadius: 16, cursor: 'pointer', fontWeight: 700 }}>
              See how you are doing
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
            <p className="eyebrow sophia-mono">02 / today</p>
            <h3 style={{ margin: '8px 0 0', fontSize: 32 }}>How today is unfolding</h3>
          </div>
        </div>
        {loading ? (
          <SkeletonLoader variant="stat" count={4} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {stats.map((stat) => (
            <TiltCard key={stat.label} className="stat-card sophia-card-hover" maxTilt={5} scale={1.02} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: 160, padding: '24px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={{ color: 'var(--color-primary)', fontSize: 18 }}>{stat.icon}</span>
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 12, fontFamily: "var(--font-plain)", marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{stat.label}</div>
                <div className="sophia-stat-number" data-sophia-count={stat.value} data-sophia-suffix={stat.suffix} style={{ fontSize: 32, fontWeight: 400, color: 'var(--color-primary)', fontFamily: "var(--font-plain)" }}>
                  {stat.value}<span style={{ fontSize: 20, color: 'var(--color-text)', marginLeft: 4 }}>{stat.suffix}</span>
                </div>
              </TiltCard>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-card sophia-reveal" data-sophia-reveal style={{ padding: 28, marginTop: 22 }}>
        <div className="section-heading" style={{ marginBottom: 18 }}>
          <div>
            <p className="eyebrow sophia-mono">03 / rooms</p>
            <h3 style={{ margin: '8px 0 0', fontSize: 32 }}>Choose a room, not a grind</h3>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {quickLinks.map((item) => (
            <TiltCard key={item.key} className="section-card sophia-card-hover" maxTilt={6} scale={1.02} onClick={() => onNavigate && onNavigate(item.key)} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: 240, padding: '28px 24px' }}>
              <div style={{ marginBottom: 18, color: 'var(--color-primary)', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 400, marginBottom: 14, color: 'var(--color-text)', fontFamily: "var(--font-plain)", letterSpacing: '-0.02em' }}>{item.label}</div>
              <div style={{ color: 'var(--color-text-muted)', lineHeight: 1.65, fontSize: 14, maxWidth: '100%', wordWrap: 'break-word', hyphens: 'auto' }}>{item.copy}</div>
            </TiltCard>
          ))}
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 22, marginTop: 22 }}>
        <section className="dashboard-card sophia-reveal" data-sophia-reveal style={{ padding: 28 }}>
          <div className="section-heading" style={{ marginBottom: 18 }}>
            <div>
            <p className="eyebrow sophia-mono">04 / aims</p>
            <h3 style={{ margin: '8px 0 0', fontSize: 32 }}>What you are tending</h3>
            </div>
          </div>
          {activeGoals.length ? (
            <div style={{ display: 'grid', gap: 16 }}>
              {activeGoals.map((goal, index) => {
                const progress = Number(goal.progress || Math.min(35 + (index * 18), 92));
                return (
                  <div key={`${goal.title || goal.name || 'goal'}-${index}`} className="sophia-panel" style={{ padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                      <div style={{ color: 'var(--color-text)', fontWeight: 700 }}>{goal.title || goal.name || `Goal ${index + 1}`}</div>
                      <div className="sophia-mono" style={{ color: 'var(--color-accent)', fontSize: 13 }}>{progress}%</div>
                    </div>
                    <div className="sophia-progress-meter">
                      <span data-sophia-progress={progress} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>Nothing here yet. When you name a goal, it will sit quietly until you are ready to move it.</div>
          )}
        </section>

        <section className="sophia-quote sophia-reveal" data-sophia-reveal>
          <div className="quote-line" />
          <p className="eyebrow sophia-mono" style={{ marginBottom: 12 }}>A note for {firstName}</p>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.8, color: 'var(--color-text)', fontStyle: 'italic' }}>
            "{dailyTip}"
          </p>
          <p style={{ margin: '14px 0 0', color: 'var(--color-text-muted)', fontSize: 14 }}>
            SOPHIA learns your rhythm over time. There is no late, and there is no failing the day.
          </p>
        </section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 22, marginTop: 22 }}>
        <section className="dashboard-card sophia-reveal" data-sophia-reveal style={{ padding: 28 }}>
          <div className="section-heading" style={{ marginBottom: 18 }}>
            <div>
            <p className="eyebrow sophia-mono">05 / lately</p>
            <h3 style={{ margin: '8px 0 0', fontSize: 32 }}>Recent kindnesses to yourself</h3>
            </div>
          </div>
          {recentActivity.length === 0 ? (
            <div style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, padding: '20px', textAlign: 'center', background: 'rgba(42, 157, 143, 0.06)', borderRadius: 12 }}>This page fills as you go. A habit, a sip of water, a sentence in the journal — any of those counts.</div>
          ) : (
            <div style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, padding: '20px', textAlign: 'center', background: 'rgba(42, 157, 143, 0.06)', borderRadius: 12 }}>This page fills as you go. A habit, a sip of water, a sentence in the journal — any of those counts.</div>
          )
          }
        </section>

        <section className="sophia-timeline sophia-reveal" data-sophia-reveal>
          <p className="eyebrow sophia-mono" style={{ marginBottom: 18 }}>06 / a simple day</p>
          <div className="sophia-timeline-list">
            {timeline.map((step) => (
              <div key={step.title} className="sophia-timeline-item">
                <div style={{ color: 'var(--color-text)', fontWeight: 700, marginBottom: 6 }}>{step.title}</div>
                <div style={{ color: 'var(--color-text-muted)', lineHeight: 1.65 }}>{step.copy}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
            <span className="hero-pill"><FlameIcon size={16} /> Keep a streak if it feels kind</span>
            <span className="hero-pill"><TrendUpIcon size={16} /> Look back once a week</span>
            <span className="hero-pill"><LightbulbIcon size={16} /> Ask SOPHIA when you feel stuck</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomeDashboard;