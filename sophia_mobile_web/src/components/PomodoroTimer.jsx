import React, { useState, useEffect, useRef, useCallback } from 'react';

const SESSIONS_KEY = 'sophia_pomodoro_sessions';
const SETTINGS_KEY = 'sophia_pomodoro_settings';

const defaultSettings = { focus: 25, shortBreak: 5, longBreak: 15, sessionsUntilLong: 4 };

function loadJSON(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}

export default function PomodoroTimer() {
  const [settings, setSettings] = useState(() => loadJSON(SETTINGS_KEY, defaultSettings));
  const [mode, setMode] = useState('focus'); // focus | shortBreak | longBreak
  const [timeLeft, setTimeLeft] = useState(settings.focus * 60);
  const [running, setRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [sessions, setSessions] = useState(() => loadJSON(SESSIONS_KEY, []));
  const [showSettings, setShowSettings] = useState(false);
  const [subject, setSubject] = useState('');
  const [isCompact, setIsCompact] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 980 : false));
  const [isPhone, setIsPhone] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 640 : false));
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Persist sessions
  useEffect(() => { localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(-100))); }, [sessions]);
  useEffect(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }, [settings]);

  useEffect(() => {
    const onResize = () => {
      setIsCompact(window.innerWidth < 980);
      setIsPhone(window.innerWidth < 640);
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const getDuration = useCallback((m) => {
    if (m === 'focus') return settings.focus * 60;
    if (m === 'shortBreak') return settings.shortBreak * 60;
    return settings.longBreak * 60;
  }, [settings]);

  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current); return; }
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const handleTimerComplete = () => {
    setRunning(false);
    // Play sound
    try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1aW2RtdHmFjZSXm5yal5WRjYqHgoB+fHx9f4OIjZKXm52dnJqXk4+LhoJ/fXx8fn+DhoyRlZmbnJuamJWQjIiEgH59fH1/g4eMkZaZm5ybnJmWkY2Ig4B+fX19f4OHjJGWmZubnJuZlpGNiYSAfn19fX+DiI2SlpmbnJybmZWRjYmEgH59fH1/g4iN').play(); } catch {}
    if (mode === 'focus') {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      // Log completed session
      setSessions(prev => [...prev, {
        id: Date.now(),
        subject: subject || 'General Focus',
        duration: settings.focus,
        completedAt: new Date().toISOString(),
        type: 'pomodoro',
      }]);
      // Notify
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Focus session complete!', { body: `Great work! ${subject || 'Time for a break.'}`, icon: '/icon-192x192.png' });
      }
      // Switch to break
      if (newCount % settings.sessionsUntilLong === 0) {
        setMode('longBreak');
        setTimeLeft(settings.longBreak * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft(settings.shortBreak * 60);
      }
    } else {
      // Break complete â†’ back to focus
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Break over!', { body: 'Time to focus again.', icon: '/icon-192x192.png' });
      }
      setMode('focus');
      setTimeLeft(settings.focus * 60);
    }
  };

  const toggleTimer = () => setRunning(!running);
  const resetTimer = () => { setRunning(false); setTimeLeft(getDuration(mode)); };
  const skipToNext = () => { setRunning(false); handleTimerComplete(); };

  const switchMode = (m) => { setRunning(false); setMode(m); setTimeLeft(getDuration(m)); };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = 1 - (timeLeft / getDuration(mode));
  const circumference = 2 * Math.PI * 120;
  const dashOffset = circumference * (1 - progress);

  const todaySessions = sessions.filter(s => {
    const d = new Date(s.completedAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  const streak = sessionCount;

  const modeColors = { focus: 'var(--color-primary)', shortBreak: '#3fb950', longBreak: '#bb86fc' };
  const modeLabels = { focus: 'Focus', shortBreak: 'Short Break', longBreak: 'Long Break' };
  const color = modeColors[mode];

  const s = {
    page: {
      minHeight: '100vh',
      padding: '8px 0 36px',
      color: 'var(--sophia-text)',
      fontFamily: 'var(--sophia-body)',
      width: '100%',
    },
    shell: {
      display: 'grid',
      gridTemplateColumns: isCompact ? 'minmax(0, 1fr)' : 'minmax(0, 1.15fr) minmax(320px, 0.85fr)',
      gap: 24,
      alignItems: 'start',
    },
    leftPanel: {
      background: 'linear-gradient(180deg, rgba(6, 14, 30, 0.92), rgba(5, 12, 24, 0.92))',
      border: '1px solid rgba(0,212,255,0.18)',
      borderRadius: 30,
      padding: isPhone ? '22px 16px 24px' : '26px 24px 28px',
      boxShadow: 'var(--sophia-shadow)',
      minWidth: 0,
    },
    rightPanel: {
      background: 'linear-gradient(180deg, rgba(6, 14, 30, 0.88), rgba(5, 12, 24, 0.9))',
      border: '1px solid rgba(123,47,255,0.16)',
      borderRadius: 28,
      padding: isPhone ? '20px 16px' : '24px 22px',
      boxShadow: 'var(--sophia-shadow)',
      minWidth: 0,
    },
    header: { fontSize: 34, fontWeight: 800, marginBottom: 8, fontFamily: 'var(--sophia-display)', background: 'linear-gradient(135deg, #ffffff, var(--color-primary) 45%, #b9d7ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.04em' },
    sub: { color: 'var(--sophia-text-dim)', fontSize: 15, marginBottom: 26, maxWidth: 520 },
    modeTabs: { display: 'inline-flex', gap: 8, marginBottom: 24, justifyContent: 'flex-start', padding: 6, borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' },
    modeTab: (active) => ({
      padding: '9px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
      background: active ? `linear-gradient(135deg, ${color}22, rgba(123,47,255,0.16))` : 'transparent',
      color: active ? color : 'var(--sophia-text-dim)',
      outline: active ? `1px solid ${color}55` : '1px solid transparent',
      transition: 'all 0.2s',
      fontFamily: 'var(--sophia-body)',
    }),
    timerWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 },
    svgWrap: { position: 'relative', width: 260, height: 260 },
    timeText: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 56, fontWeight: 300, color: 'var(--sophia-text)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--sophia-mono)' },
    modeLabel: { textAlign: 'center', color, fontSize: 13, fontWeight: 700, marginTop: 14, textTransform: 'uppercase', letterSpacing: '0.18em', fontFamily: 'var(--sophia-display)' },
    controls: { display: 'grid', gridTemplateColumns: isPhone ? 'minmax(0, 1fr)' : 'repeat(3, minmax(0, 1fr))', gap: 12, justifyContent: 'center', marginBottom: 24, width: '100%' },
    btn: (primary) => ({
      padding: '14px 18px', borderRadius: 16, border: primary ? '1px solid transparent' : '1px solid rgba(255,255,255,0.08)', fontSize: 15, fontWeight: 700, cursor: 'pointer',
      background: primary ? `linear-gradient(135deg, ${color}, ${color}cc)` : 'rgba(255,255,255,0.05)',
      color: primary ? '#03101d' : 'var(--sophia-text)',
      boxShadow: primary ? `0 12px 30px ${color}25` : 'none',
      transition: 'all 0.2s',
      fontFamily: 'var(--sophia-body)',
    }),
    subjectInput: {
      width: '100%', maxWidth: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14, padding: '14px 16px', color: 'var(--sophia-text)', fontSize: 14, fontFamily: 'var(--sophia-body)',
      outline: 'none', textAlign: 'left', marginBottom: 20,
    },
    statsRow: { display: 'grid', gridTemplateColumns: isPhone ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))', gap: 14, marginBottom: 24 },
    stat: { padding: '18px 18px', borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'left', minWidth: 0 },
    statVal: { fontSize: 30, fontWeight: 700, color, fontFamily: 'var(--sophia-mono)' },
    statLabel: { fontSize: 12, color: 'var(--sophia-text-dim)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.12em' },
    historyTitle: { fontSize: 18, fontWeight: 700, color: 'var(--sophia-text)', marginBottom: 12, fontFamily: 'var(--sophia-display)' },
    sessionItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 8, gap: 12 },
    settingsBtn: { padding: '9px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)', color: 'var(--sophia-text-dim)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--sophia-body)' },
    settingsPanel: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 20, marginBottom: 22 },
    settInput: { width: 70, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 10px', color: 'var(--sophia-text)', fontSize: 14, textAlign: 'center', fontFamily: 'var(--sophia-mono)' },
    sideHeading: { fontSize: 16, fontWeight: 700, color: 'var(--sophia-text)', marginBottom: 10, fontFamily: 'var(--sophia-display)' },
    sideText: { fontSize: 13, color: 'var(--sophia-text-dim)', lineHeight: 1.6, marginBottom: 16 },
    sideList: { display: 'grid', gap: 10, marginBottom: 20 },
    sideListItem: { padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' },
    sideListTitle: { fontSize: 12, color: 'var(--sophia-text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 },
    sideListValue: { fontSize: 22, color, fontWeight: 700, fontFamily: 'var(--sophia-mono)' },
  };

  return (
    <div style={s.page}>
      <div style={s.shell}>
        <section style={s.leftPanel}>
          <h1 style={s.header}>Focus Timer</h1>
          <p style={s.sub}>A cleaner deep-work console. The oversized top control strip is gone; timing, controls, and session context now sit in one focused workspace.</p>

          <div style={s.modeTabs}>
            {['focus', 'shortBreak', 'longBreak'].map(m => (
              <button key={m} style={s.modeTab(mode === m)} onClick={() => switchMode(m)}>
                {modeLabels[m]}
              </button>
            ))}
            <button style={s.settingsBtn} onClick={() => setShowSettings(!showSettings)}>Tune</button>
          </div>

          {showSettings && (
            <div style={s.settingsPanel}>
              <div style={{ display: 'flex', gap: 20, justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                {[['focus', 'Focus (min)'], ['shortBreak', 'Short Break'], ['longBreak', 'Long Break'], ['sessionsUntilLong', 'Sessions']].map(([key, label]) => (
                  <div key={key} style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 12, color: 'var(--sophia-text-dim)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
                    <input type="number" min="1" max="120" value={settings[key]}
                      onChange={(e) => { const v = Math.max(1, parseInt(e.target.value) || 1); setSettings(prev => ({ ...prev, [key]: v })); if (!running && key === mode) setTimeLeft(v * 60); }}
                      style={s.settInput} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <input placeholder="What are you working on right now?" value={subject} onChange={e => setSubject(e.target.value)}
            style={s.subjectInput} />

          <div style={s.timerWrap}>
            <div style={s.svgWrap}>
              <svg width="260" height="260" viewBox="0 0 260 260">
                <circle cx="130" cy="130" r="120" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                <circle cx="130" cy="130" r="120" fill="none" stroke={color} strokeWidth="6"
                  strokeDasharray={circumference} strokeDashoffset={dashOffset}
                  strokeLinecap="round" transform="rotate(-90 130 130)"
                  style={{ transition: 'stroke-dashoffset 0.5s ease', filter: `drop-shadow(0 0 8px ${color}40)` }} />
              </svg>
              <div style={s.timeText}>{formatTime(timeLeft)}</div>
            </div>
            <div style={s.modeLabel}>{modeLabels[mode]}</div>
          </div>

          <div style={s.controls}>
            <button style={s.btn(false)} onClick={resetTimer}>Reset</button>
            <button style={s.btn(true)} onClick={toggleTimer}>{running ? 'Pause' : 'Start'}</button>
            <button style={s.btn(false)} onClick={skipToNext}>Next</button>
          </div>
        </section>

        <aside style={s.rightPanel}>
          <div style={s.sideHeading}>Session Snapshot</div>
          <div style={s.sideText}>Everything important is visible without the previous oversized bar interrupting the page. This panel keeps your status and history readable while the timer stays central.</div>

          <div style={s.sideList}>
            <div style={s.sideListItem}>
              <div style={s.sideListTitle}>Current Mode</div>
              <div style={s.sideListValue}>{modeLabels[mode]}</div>
            </div>
            <div style={s.sideListItem}>
              <div style={s.sideListTitle}>Subject</div>
              <div style={{ fontSize: 16, color: 'var(--sophia-text)', fontWeight: 600 }}>{subject || 'General focus block'}</div>
            </div>
          </div>

          <div style={s.statsRow}>
            <div style={s.stat}><div style={s.statVal}>{todaySessions.length}</div><div style={s.statLabel}>Sessions Today</div></div>
            <div style={s.stat}><div style={s.statVal}>{todayMinutes}</div><div style={s.statLabel}>Minutes Focused</div></div>
            <div style={s.stat}><div style={s.statVal}>{streak}</div><div style={s.statLabel}>Current Streak</div></div>
            <div style={s.stat}><div style={s.statVal}>{sessions.length}</div><div style={s.statLabel}>Total Sessions</div></div>
          </div>

          {todaySessions.length > 0 && (
            <div>
              <div style={s.historyTitle}>Today's Sessions</div>
              {todaySessions.slice().reverse().map(sess => (
                <div key={sess.id} style={s.sessionItem}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ color: 'var(--sophia-text)', fontWeight: 600, fontSize: 14 }}>{sess.subject}</span>
                    <span style={{ color: 'var(--sophia-text-dim)', fontSize: 12, marginLeft: 8 }}>{sess.duration} min</span>
                  </div>
                  <span style={{ color: 'var(--sophia-text-dim)', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {new Date(sess.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
