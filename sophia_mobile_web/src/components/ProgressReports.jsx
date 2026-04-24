import React, { useState, useEffect, useCallback } from 'react';

const SECTIONS = ['Overview', 'Habits', 'Study', 'Journal', 'Goals', 'Tasks'];

function getHabitData() {
  try {
    const raw = localStorage.getItem('sophia_habits');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function getPomodoroData() {
  try {
    const raw = localStorage.getItem('sophia_pomodoro_sessions');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function getJournalData() {
  try {
    const raw = localStorage.getItem('sophia_journal');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function getXPData() {
  try {
    const raw = localStorage.getItem('sophia_xp_state');
    return raw ? JSON.parse(raw) : { xp: 0, history: [] };
  } catch { return { xp: 0, history: [] }; }
}

function getStreakData() {
  try {
    const raw = localStorage.getItem('sophia_streak');
    return raw ? JSON.parse(raw) : { current: 0, best: 0 };
  } catch { return { current: 0, best: 0 }; }
}

function getTaskData() {
  try {
    const raw = localStorage.getItem('sophia_tasks');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function getGoalData() {
  try {
    const raw = localStorage.getItem('sophia_goals');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function last7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ProgressReports() {
  const [activeSection, setActiveSection] = useState('Overview');
  const [generating, setGenerating] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // State for all data (will update when localStorage changes)
  const [habits, setHabits] = useState(getHabitData);
  const [pomodoro, setPomodoro] = useState(getPomodoroData);
  const [journal, setJournal] = useState(getJournalData);
  const [xpData, setXpData] = useState(getXPData);
  const [streak, setStreak] = useState(getStreakData);
  const [tasks, setTasks] = useState(getTaskData);
  const [goals, setGoals] = useState(getGoalData);
  const days = last7Days();

  // Sync with localStorage changes in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      setHabits(getHabitData());
      setPomodoro(getPomodoroData());
      setJournal(getJournalData());
      setXpData(getXPData());
      setStreak(getStreakData());
      setTasks(getTaskData());
      setGoals(getGoalData());
    };

    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom events from this tab (when data is saved)
    window.addEventListener('sophia-data-updated', handleStorageChange);

    // Poll every 2 seconds to catch localStorage updates from same tab
    const pollInterval = setInterval(handleStorageChange, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sophia-data-updated', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, []);

  const weekPomodoro = pomodoro.filter(s => days.includes(s.date?.split('T')?.[0]));
  const totalFocusMin = weekPomodoro.reduce((a, s) => a + (s.duration || 25), 0);
  const weekSessions = weekPomodoro.length;

  const completedTasks = tasks.filter(t => t.completed || t.status === 'done').length;
  const totalGoals = goals.length;
  const goalProgress = goals.length ? Math.round(goals.reduce((a, g) => a + (g.progress || 0), 0) / goals.length) : 0;

  const xpThisWeek = xpData.history ? xpData.history.filter(h => {
    const d = h.date?.split('T')?.[0];
    return days.includes(d);
  }).reduce((a, h) => a + (h.amount || 0), 0) : 0;

  const focusByDay = days.map(d => {
    const sessions = weekPomodoro.filter(s => (s.date || s.timestamp || '').split('T')[0] === d);
    return sessions.reduce((a, s) => a + (s.duration || 25), 0);
  });
  const maxFocus = Math.max(1, ...focusByDay);

  const generatePDF = useCallback(async () => {
    setGenerating(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      await import('jspdf-autotable');

      const doc = new jsPDF();
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      // Header
      doc.setFillColor(10, 10, 20);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(0, 212, 255);
      doc.setFontSize(24);
      doc.text('SOPHIA', 20, 22);
      doc.setFontSize(10);
      doc.setTextColor(180, 180, 180);
      doc.text(`Weekly Progress Report — ${dateStr}`, 20, 32);

      let y = 52;

      // Overview
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.text('Weekly Overview', 20, y); y += 10;

      doc.autoTable({
        startY: y,
        head: [['Metric', 'Value']],
        body: [
          ['Focus Sessions', String(weekSessions)],
          ['Total Focus Time', `${totalFocusMin} min`],
          ['Current Streak', `${streak.current} days`],
          ['Best Streak', `${streak.best} days`],
          ['XP Earned', `+${xpThisWeek} XP`],
          ['Total XP', `${xpData.xp} XP`],
          ['Tasks Completed', String(completedTasks)],
          ['Goal Progress', `${goalProgress}%`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [0, 160, 200] },
        margin: { left: 20 },
      });
      y = doc.lastAutoTable.finalY + 15;

      // Habits section
      if (habits.length) {
        doc.setFontSize(16);
        doc.text('Habits', 20, y); y += 10;
        doc.autoTable({
          startY: y,
          head: [['Habit', 'Status']],
          body: habits.slice(0, 20).map(h => [h.name || h.title || 'Unnamed', h.completed ? 'Completed' : 'In Progress']),
          theme: 'striped',
          headStyles: { fillColor: [63, 185, 80] },
          margin: { left: 20 },
        });
        y = doc.lastAutoTable.finalY + 15;
      }

      // Focus sessions
      if (weekPomodoro.length) {
        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFontSize(16);
        doc.text('Focus Sessions (Last 7 Days)', 20, y); y += 10;
        doc.autoTable({
          startY: y,
          head: [['Date', 'Subject', 'Duration']],
          body: weekPomodoro.slice(0, 15).map(s => [
            formatDate(s.date || s.timestamp),
            s.subject || 'General',
            `${s.duration || 25} min`,
          ]),
          theme: 'striped',
          headStyles: { fillColor: [0, 140, 255] },
          margin: { left: 20 },
        });
        y = doc.lastAutoTable.finalY + 15;
      }

      // Journal entries
      if (journal.length) {
        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFontSize(16);
        doc.text('Journal Entries', 20, y); y += 10;
        doc.autoTable({
          startY: y,
          head: [['Date', 'Mood', 'Preview']],
          body: journal.slice(0, 10).map(j => [
            formatDate(j.date || j.createdAt),
            j.mood || '—',
            (j.content || j.text || '').substring(0, 60) + '...',
          ]),
          theme: 'striped',
          headStyles: { fillColor: [187, 134, 252] },
          margin: { left: 20 },
        });
        y = doc.lastAutoTable.finalY + 15;
      }

      // Goals
      if (goals.length) {
        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFontSize(16);
        doc.text('Goals', 20, y); y += 10;
        doc.autoTable({
          startY: y,
          head: [['Goal', 'Progress', 'Status']],
          body: goals.slice(0, 10).map(g => [
            g.title || g.name || 'Untitled',
            `${g.progress || 0}%`,
            g.completed ? 'Achieved' : 'In Progress',
          ]),
          theme: 'striped',
          headStyles: { fillColor: [201, 168, 76] },
          margin: { left: 20 },
        });
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`SOPHIA Progress Report — Page ${i}/${pageCount}`, 105, 290, { align: 'center' });
      }

      doc.save(`SOPHIA_Report_${now.toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  }, [weekSessions, totalFocusMin, streak, xpThisWeek, xpData, completedTasks, goalProgress, habits, weekPomodoro, journal, goals]);

  const s = {
    page: { minHeight: '100vh', padding: '32px 24px', color: '#e0ddd6', fontFamily: '"Inter", -apple-system, sans-serif' },
    header: { fontSize: 28, fontWeight: 700, marginBottom: 4, background: 'linear-gradient(135deg, #bb86fc, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    sub: { color: '#8a8a9a', fontSize: 14, marginBottom: 24 },
    tabs: { display: 'flex', gap: 6, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 },
    tab: (active) => ({
      padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
      background: active ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.03)',
      color: active ? '#00d4ff' : '#8a8a9a',
      outline: active ? '1px solid rgba(0,212,255,0.2)' : '1px solid rgba(255,255,255,0.05)',
    }),
    downloadBtn: {
      padding: '12px 28px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
      background: generating ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #bb86fc, #00d4ff)',
      color: generating ? '#8a8a9a' : '#000', marginBottom: 28,
    },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 28 },
    statCard: {
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14,
      padding: '18px 16px', textAlign: 'center',
    },
    statValue: { fontSize: 24, fontWeight: 700 },
    statLabel: { fontSize: 12, color: '#8a8a9a', marginTop: 4 },
    chartArea: {
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14,
      padding: '20px', marginBottom: 20, overflow: 'hidden',
    },
    barRow: { display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, padding: '0 8px' },
    bar: (h, color) => ({
      flex: 1, height: `${Math.max(h, 4)}%`, background: `linear-gradient(to top, ${color}, ${color}aa)`,
      borderRadius: '6px 6px 0 0', minWidth: 20, transition: 'height 0.3s',
    }),
    barLabel: { textAlign: 'center', fontSize: 10, color: '#6a6a7a', marginTop: 4 },
    listItem: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px',
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, marginBottom: 6,
    },
  };

  return (
    <div style={s.page}>
      <h1 style={s.header}>Progress Reports</h1>
      <p style={s.sub}>Track your growth and download weekly reports</p>

      <button style={s.downloadBtn} onClick={generatePDF} disabled={generating}>
        {generating ? '⏳ Generating...' : '📄 Download PDF Report'}
      </button>

      <div style={s.tabs}>
        {SECTIONS.map(sec => (
          <button key={sec} style={s.tab(activeSection === sec)} onClick={() => setActiveSection(sec)}>{sec}</button>
        ))}
      </div>

      {activeSection === 'Overview' && (
        <>
          <div style={s.statsGrid}>
            <div style={s.statCard}>
              <div style={{ ...s.statValue, color: '#00d4ff' }}>{weekSessions}</div>
              <div style={s.statLabel}>Focus Sessions</div>
            </div>
            <div style={s.statCard}>
              <div style={{ ...s.statValue, color: '#bb86fc' }}>{totalFocusMin}m</div>
              <div style={s.statLabel}>Focus Time</div>
            </div>
            <div style={s.statCard}>
              <div style={{ ...s.statValue, color: '#c9a84c' }}>{streak.current}</div>
              <div style={s.statLabel}>Day Streak</div>
            </div>
            <div style={s.statCard}>
              <div style={{ ...s.statValue, color: '#3fb950' }}>+{xpThisWeek}</div>
              <div style={s.statLabel}>XP This Week</div>
            </div>
            <div style={s.statCard}>
              <div style={{ ...s.statValue, color: '#ff6b6b' }}>{completedTasks}</div>
              <div style={s.statLabel}>Tasks Done</div>
            </div>
            <div style={s.statCard}>
              <div style={{ ...s.statValue, color: '#00d4ff' }}>{goalProgress}%</div>
              <div style={s.statLabel}>Goal Progress</div>
            </div>
          </div>
          <div style={s.chartArea}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e0ddd6', marginBottom: 14 }}>Focus Time (Last 7 Days)</div>
            <div style={s.barRow}>
              {focusByDay.map((v, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={s.bar(v / maxFocus * 100, '#00d4ff')} title={`${v} min`} />
                  <div style={s.barLabel}>{formatDate(days[i])}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeSection === 'Habits' && (
        <div>
          {habits.length === 0 && <div style={{ color: '#6a6a7a', padding: 40, textAlign: 'center' }}>No habit data yet. Start tracking habits!</div>}
          {habits.map((h, i) => (
            <div key={i} style={s.listItem}>
              <span style={{ fontSize: 14, color: '#e0ddd6' }}>{h.name || h.title}</span>
              <span style={{ fontSize: 12, color: h.completed ? '#3fb950' : '#c9a84c' }}>{h.completed ? '✓ Done' : 'Active'}</span>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'Study' && (
        <div>
          {weekPomodoro.length === 0 && <div style={{ color: '#6a6a7a', padding: 40, textAlign: 'center' }}>No study sessions this week. Start a Pomodoro!</div>}
          {weekPomodoro.map((s2, i) => (
            <div key={i} style={s.listItem}>
              <div>
                <div style={{ fontSize: 14, color: '#e0ddd6' }}>{s2.subject || 'General'}</div>
                <div style={{ fontSize: 11, color: '#6a6a7a' }}>{formatDate(s2.date || s2.timestamp)}</div>
              </div>
              <span style={{ fontSize: 13, color: '#00d4ff', fontWeight: 600 }}>{s2.duration || 25}m</span>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'Journal' && (
        <div>
          {journal.length === 0 && <div style={{ color: '#6a6a7a', padding: 40, textAlign: 'center' }}>No journal entries yet. Write your first entry!</div>}
          {journal.slice(0, 20).map((j, i) => (
            <div key={i} style={s.listItem}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: '#e0ddd6', marginBottom: 4 }}>{j.mood ? `${j.mood} ` : ''}{formatDate(j.date || j.createdAt)}</div>
                <div style={{ fontSize: 12, color: '#8a8a9a' }}>{(j.content || j.text || '').substring(0, 100)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'Goals' && (
        <div>
          {goals.length === 0 && <div style={{ color: '#6a6a7a', padding: 40, textAlign: 'center' }}>No goals set yet. Create your first goal!</div>}
          {goals.map((g, i) => (
            <div key={i} style={s.listItem}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: '#e0ddd6' }}>{g.title || g.name}</div>
                <div style={{ marginTop: 6, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ width: `${g.progress || 0}%`, height: '100%', background: 'linear-gradient(90deg, #c9a84c, #3fb950)', borderRadius: 2 }} />
                </div>
              </div>
              <span style={{ fontSize: 13, color: '#c9a84c', fontWeight: 600, marginLeft: 12 }}>{g.progress || 0}%</span>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'Tasks' && (
        <div>
          {tasks.length === 0 && <div style={{ color: '#6a6a7a', padding: 40, textAlign: 'center' }}>No tasks yet. Add your first task!</div>}
          {tasks.slice(0, 30).map((t, i) => (
            <div key={i} style={s.listItem}>
              <span style={{ fontSize: 14, color: '#e0ddd6', textDecoration: t.completed ? 'line-through' : 'none' }}>{t.title || t.name}</span>
              <span style={{ fontSize: 12, color: t.completed ? '#3fb950' : t.priority === 'high' ? '#ff6b6b' : '#8a8a9a' }}>
                {t.completed ? '✓' : t.priority || 'todo'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
