import React, { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notifications.js';

const REMINDERS_KEY = 'sophia_habit_reminders';
const PREFS_KEY = 'sophia_notif_prefs';

function loadJSON(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}

const DEFAULT_PREFS = {
  habitReminders: true,
  journalReminder: true,
  journalTime: '21:00',
  studyReminder: true,
  streakReminder: true,
  morningBrief: true,
  morningTime: '07:00',
};

const DEFAULT_HABITS = [
  { id: 1, name: 'Morning Workout', time: '06:30', enabled: true, days: [1,2,3,4,5] },
  { id: 2, name: 'Meditation', time: '07:00', enabled: true, days: [0,1,2,3,4,5,6] },
  { id: 3, name: 'Read 30 min', time: '20:00', enabled: true, days: [0,1,2,3,4,5,6] },
  { id: 4, name: 'Drink 2L Water', time: '12:00', enabled: true, days: [0,1,2,3,4,5,6] },
  { id: 5, name: 'Journal', time: '21:00', enabled: true, days: [0,1,2,3,4,5,6] },
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SmartReminders() {
  const [permission, setPermission] = useState(notificationService.getPermissionStatus());
  const [prefs, setPrefs] = useState(() => loadJSON(PREFS_KEY, DEFAULT_PREFS));
  const [reminders, setReminders] = useState(() => loadJSON(REMINDERS_KEY, DEFAULT_HABITS));
  const [editingId, setEditingId] = useState(null);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); }, [prefs]);
  useEffect(() => { localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders)); }, [reminders]);

  // Schedule reminders
  useEffect(() => {
    if (permission !== 'granted') return;
    const timers = [];

    reminders.filter(r => r.enabled).forEach(r => {
      const today = new Date().getDay();
      if (!r.days.includes(today)) return;

      const [h, m] = r.time.split(':').map(Number);
      const target = new Date();
      target.setHours(h, m, 0, 0);
      const delay = target.getTime() - Date.now();
      if (delay > 0 && delay < 86400000) {
        timers.push(setTimeout(() => {
          notificationService.showNotification(`Habit Reminder: ${r.name}`, {
            body: `Time to ${r.name.toLowerCase()}. Stay consistent! 💪`,
            tag: `habit-${r.id}`,
          });
        }, delay));
      }
    });

    // Journal reminder
    if (prefs.journalReminder) {
      const [h, m] = prefs.journalTime.split(':').map(Number);
      const target = new Date(); target.setHours(h, m, 0, 0);
      const delay = target.getTime() - Date.now();
      if (delay > 0) {
        timers.push(setTimeout(() => {
          notificationService.showJournalReminder();
        }, delay));
      }
    }

    // Morning brief
    if (prefs.morningBrief) {
      const [h, m] = prefs.morningTime.split(':').map(Number);
      const target = new Date(); target.setHours(h, m, 0, 0);
      const delay = target.getTime() - Date.now();
      if (delay > 0) {
        timers.push(setTimeout(() => {
          const todayReminders = reminders.filter(r => r.enabled && r.days.includes(new Date().getDay()));
          notificationService.showNotification('Good Morning! â˜€️', {
            body: `You have ${todayReminders.length} habits scheduled today. Let's make it count!`,
            tag: 'morning-brief',
          });
        }, delay));
      }
    }

    return () => timers.forEach(clearTimeout);
  }, [reminders, prefs, permission]);

  const requestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setPermission(granted ? 'granted' : 'denied');
  };

  const sendTest = () => {
    notificationService.showNotification('SOPHIA Test Notification', {
      body: 'Notifications are working! You\'ll receive habit reminders at scheduled times.',
      tag: 'test',
    });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const toggleReminder = (id) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const updateReminder = (id, field, value) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addReminder = () => {
    const newId = Math.max(0, ...reminders.map(r => r.id)) + 1;
    setReminders(prev => [...prev, { id: newId, name: 'New Habit', time: '09:00', enabled: true, days: [0,1,2,3,4,5,6] }]);
    setEditingId(newId);
  };

  const removeReminder = (id) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const toggleDay = (id, day) => {
    setReminders(prev => prev.map(r => {
      if (r.id !== id) return r;
      const days = r.days.includes(day) ? r.days.filter(d => d !== day) : [...r.days, day];
      return { ...r, days };
    }));
  };

  const s = {
    page: { minHeight: '100vh', padding: '32px 24px', color: '#e0ddd6', fontFamily: 'var(--sophia-body)', position: 'relative', zIndex: 3 },
    header: { fontSize: 28, fontWeight: 700, marginBottom: 4, background: 'linear-gradient(135deg, #3fb950, var(--color-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    sub: { color: '#8a8a9a', fontSize: 14, marginBottom: 28 },
    permCard: {
      background: 'linear-gradient(180deg, rgba(7, 15, 32, 0.95), rgba(8, 17, 35, 0.94))', border: '1px solid rgba(0,212,255,0.14)', borderRadius: 20,
      padding: '20px 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      position: 'relative', zIndex: 2, backdropFilter: 'blur(10px)', boxShadow: '0 18px 40px rgba(0, 10, 24, 0.36)',
    },
    permBtn: (granted) => ({
      padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
      background: granted ? '#3fb950' : 'linear-gradient(135deg, var(--color-primary), #bb86fc)',
      color: '#000',
    }),
    section: { marginBottom: 28 },
    sectionTitle: { fontSize: 16, fontWeight: 600, color: '#e0ddd6', marginBottom: 12 },
    reminderCard: (enabled) => ({
      background: enabled ? 'linear-gradient(180deg, rgba(7, 15, 32, 0.96), rgba(8, 17, 35, 0.94))' : 'linear-gradient(180deg, rgba(7, 15, 32, 0.76), rgba(8, 17, 35, 0.72))',
      border: enabled ? '1px solid rgba(0,212,255,0.16)' : '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '16px 18px',
      marginBottom: 12, opacity: enabled ? 1 : 0.65, position: 'relative', zIndex: 2, overflow: 'hidden', backdropFilter: 'blur(12px)', boxShadow: '0 16px 34px rgba(0, 10, 24, 0.32)',
    }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, position: 'relative', zIndex: 2 },
    nameInput: {
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
      padding: '6px 12px', color: '#e0ddd6', fontSize: 14, fontFamily: 'inherit', outline: 'none', width: 'auto', flex: 1,
    },
    timeInput: {
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
      padding: '6px 10px', color: '#e0ddd6', fontSize: 13, fontFamily: 'inherit', outline: 'none', width: 80,
    },
    toggle: (on) => ({
      width: 42, height: 22, borderRadius: 11, position: 'relative', cursor: 'pointer', flexShrink: 0,
      background: on ? 'linear-gradient(135deg, #3fb950, var(--color-primary))' : 'rgba(255,255,255,0.1)',
    }),
    toggleDot: (on) => ({
      position: 'absolute', top: 2, left: on ? 22 : 2, width: 18, height: 18,
      borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
    }),
    dayPills: { display: 'flex', gap: 4, marginTop: 10, position: 'relative', zIndex: 2 },
    dayPill: (active) => ({
      width: 32, height: 26, borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 500,
      background: active ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.03)',
      color: active ? 'var(--color-primary)' : '#6a6a7a',
      outline: active ? '1px solid rgba(0,212,255,0.3)' : '1px solid rgba(255,255,255,0.05)',
    }),
    addBtn: {
      padding: '10px 20px', borderRadius: 10, border: '1px dashed rgba(255,255,255,0.15)',
      background: 'transparent', color: '#8a8a9a', cursor: 'pointer', fontSize: 13, fontWeight: 500, width: '100%',
    },
    prefRow: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
      padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)', marginBottom: 6,
    },
    removeBtn: {
      padding: '4px 10px', borderRadius: 6, border: 'none', background: 'rgba(255,100,100,0.1)',
      color: '#ff6b6b', cursor: 'pointer', fontSize: 12,
    },
  };

  return (
    <div style={s.page}>
      <h1 style={s.header}>Smart Reminders</h1>
      <p style={s.sub}>Never miss a habit. Get notified at the right time.</p>

      {/* Permission Card */}
      <div style={s.permCard}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#e0ddd6' }}>
            {permission === 'granted' ? '✅ Notifications enabled' : '🔔 Enable notifications'}
          </div>
          <div style={{ fontSize: 12, color: '#8a8a9a', marginTop: 4 }}>
            {permission === 'granted' ? 'You\'ll receive reminders at scheduled times' : 'Allow SOPHIA to send you habit reminders'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {permission !== 'granted' && (
            <button style={s.permBtn(false)} onClick={requestPermission}>Enable</button>
          )}
          {permission === 'granted' && (
            <button style={{ ...s.permBtn(true), background: testSent ? '#3fb950' : 'rgba(255,255,255,0.08)', color: testSent ? '#000' : '#8a8a9a' }}
              onClick={sendTest}>{testSent ? '✓ Sent!' : 'Test'}</button>
          )}
        </div>
      </div>

      {/* Habit Reminders */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Habit Reminders</div>
        {reminders.map(r => (
          <div key={r.id} style={s.reminderCard(r.enabled)}>
            <div style={s.row}>
              {editingId === r.id ? (
                <input style={s.nameInput} value={r.name}
                  onChange={e => updateReminder(r.id, 'name', e.target.value)}
                  onBlur={() => setEditingId(null)} autoFocus />
              ) : (
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500, cursor: 'pointer', color: '#e0ddd6' }}
                  onClick={() => setEditingId(r.id)}>{r.name}</span>
              )}
              <input type="time" value={r.time} onChange={e => updateReminder(r.id, 'time', e.target.value)} style={s.timeInput} />
              <div style={s.toggle(r.enabled)} onClick={() => toggleReminder(r.id)}>
                <div style={s.toggleDot(r.enabled)} />
              </div>
              <button style={s.removeBtn} onClick={() => removeReminder(r.id)}>✕</button>
            </div>
            {r.enabled && (
              <div style={s.dayPills}>
                {DAY_LABELS.map((d, i) => (
                  <button key={i} style={s.dayPill(r.days.includes(i))} onClick={() => toggleDay(r.id, i)}>{d}</button>
                ))}
              </div>
            )}
          </div>
        ))}
        <button style={s.addBtn} onClick={addReminder}>+ Add Reminder</button>
      </div>

      {/* General Preferences */}
      <div style={s.section}>
        <div style={s.sectionTitle}>General Notifications</div>
        {[
          ['morningBrief', 'Morning Briefing', 'Daily overview at ', 'morningTime'],
          ['journalReminder', 'Journal Reminder', 'Evening prompt at ', 'journalTime'],
          ['streakReminder', 'Streak Alert', 'Don\'t break your streak!', null],
          ['studyReminder', 'Study Nudge', 'Gentle focus reminders', null],
        ].map(([key, label, desc, timeKey]) => (
          <div key={key} style={s.prefRow}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#e0ddd6' }}>{label}</div>
              <div style={{ fontSize: 12, color: '#8a8a9a', marginTop: 2 }}>
                {desc}{timeKey && <input type="time" value={prefs[timeKey]}
                  onChange={e => setPrefs(p => ({ ...p, [timeKey]: e.target.value }))}
                  style={{ ...s.timeInput, marginLeft: 4, width: 70, padding: '2px 6px', fontSize: 12 }} />}
              </div>
            </div>
            <div style={s.toggle(prefs[key])} onClick={() => setPrefs(p => ({ ...p, [key]: !p[key] }))}>
              <div style={s.toggleDot(prefs[key])} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
