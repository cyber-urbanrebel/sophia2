import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

// ── helpers ──────────────────────────────────────────────────────────────────
const today  = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d) => {
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
  catch { return d; }
};
const fmtTime = (d) => {
  try { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
};
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const pct   = (v, t) => (t > 0 ? clamp(Math.round((v / t) * 100), 0, 100) : 0);

function readLS(key, def) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
  catch { return def; }
}

function useLive(key, def) {
  const [val, setVal] = useState(() => readLS(key, def));
  useEffect(() => {
    const refresh = () => setVal(readLS(key, def));
    const tick = setInterval(refresh, 1500);
    window.addEventListener('sophia-data-updated', refresh);
    return () => { clearInterval(tick); window.removeEventListener('sophia-data-updated', refresh); };
  }, [key]);
  return val;
}

const P = {
  bg:     'transparent',
  card:   'rgba(255,255,255,0.88)',
  border: 'rgba(0,0,0,0.16)',
  cyan:   '#000000',
  purple: '#000000',
  green:  '#000000',
  amber:  '#000000',
  red:    '#000000',
  pink:   '#000000',
  text:   '#000000',
  muted:  '#000000',
  glow:   'rgba(0,0,0,0.12)',
};

function Ring({ pct: p = 0, size = 80, stroke = 8, color = P.cyan, bg = P.border, children }) {
  const r  = (size - stroke) / 2;
  const c  = size / 2;
  const ci = 2 * Math.PI * r;
  const dash = ci * clamp(p, 0, 100) / 100;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
        <circle cx={c} cy={c} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dash} ${ci}`}
          style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

function BarChart({ data = [], color = P.cyan, height = 60 }) {
  const max = Math.max(...data.map(d => d.v), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height, width: '100%' }}>
      {data.map((d, i) => (
        <div key={i} title={`${d.label}: ${d.v}`}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{
            width: '100%', borderRadius: 3,
            height: Math.max(3, (d.v / max) * (height - 16)),
            background: d.today ? P.cyan : color,
            opacity: d.v > 0 ? 1 : 0.15,
            transition: 'height 0.4s ease',
          }} />
          <div style={{ fontSize: 9, color: P.muted }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

function LineChart({ data = [], color = P.cyan, height = 140, fill = true, yMax }) {
  const w = 560;
  const h = height;
  const p = 18;
  const max = Math.max(yMax || 0, ...data.map(d => d.v), 1);
  const min = 0;

  const points = data.map((d, i) => {
    const x = p + (i * (w - p * 2)) / Math.max(data.length - 1, 1);
    const y = h - p - ((d.v - min) / (max - min || 1)) * (h - p * 2);
    return { ...d, x, y };
  });

  const path = points.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x},${pt.y}`).join(' ');
  const area = points.length
    ? `${path} L${points[points.length - 1].x},${h - p} L${points[0].x},${h - p} Z`
    : '';

  return (
    <div style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
        <defs>
          <linearGradient id={`grad-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
          <line
            key={i}
            x1={p}
            y1={p + r * (h - p * 2)}
            x2={w - p}
            y2={p + r * (h - p * 2)}
            stroke={P.border}
            strokeWidth="1"
          />
        ))}

        {fill && area && <path d={area} fill={`url(#grad-${color.replace(/[^a-z0-9]/gi, '')})`} />}
        {!!path && <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />}

        {points.map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r="3.3" fill={color} />
            <circle cx={pt.x} cy={pt.y} r="7" fill={color} opacity="0.15" />
          </g>
        ))}
      </svg>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ fontSize: 10, color: P.muted }}>{d.label}</div>
        ))}
      </div>
    </div>
  );
}

function RadarChart({ values = [], labels = [], color = P.cyan, size = 200, maxValue = 100 }) {
  const c = size / 2;
  const r = size / 2 - 24;
  const angle = (Math.PI * 2) / Math.max(values.length, 1);

  const toPoint = (idx, val) => {
    const a = -Math.PI / 2 + idx * angle;
    const rr = (clamp(val, 0, maxValue) / maxValue) * r;
    return { x: c + Math.cos(a) * rr, y: c + Math.sin(a) * rr };
  };

  const polygon = values.map((v, i) => {
    const p = toPoint(i, v);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {[0.25, 0.5, 0.75, 1].map((ring, i) => (
        <circle
          key={i}
          cx={c}
          cy={c}
          r={r * ring}
          fill="none"
          stroke={P.border}
          strokeWidth="1"
        />
      ))}

      {labels.map((lb, i) => {
        const p = toPoint(i, maxValue);
        return (
          <g key={lb}>
            <line x1={c} y1={c} x2={p.x} y2={p.y} stroke={P.border} strokeWidth="1" />
            <text x={p.x} y={p.y} fill={P.muted} fontSize="10" textAnchor="middle" dy={p.y > c ? 12 : -6}>{lb}</text>
          </g>
        );
      })}

      <polygon points={polygon} fill={color} opacity="0.2" stroke={color} strokeWidth="2" />
      {values.map((v, i) => {
        const p = toPoint(i, v);
        return <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />;
      })}
    </svg>
  );
}

function HeatMap({ data = {}, color = P.cyan }) {
  const days = useMemo(() => {
    const arr = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      arr.push({ key, v: data[key] || 0, isToday: i === 0 });
    }
    return arr;
  }, [data]);
  const max = Math.max(...days.map(d => d.v), 1);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
      {days.map(d => (
        <div key={d.key} title={`${d.key}: ${d.v}`}
          style={{
            width: '100%', paddingBottom: '100%', borderRadius: 2,
            background: d.v > 0
              ? `${color}${Math.round(40 + (d.v / max) * 190).toString(16).padStart(2, '0')}`
              : P.border,
            outline: d.isToday ? `2px solid ${color}` : 'none',
          }} />
      ))}
    </div>
  );
}

function Tile({ label, value, sub, color = P.cyan, icon }) {
  return (
    <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: '14px 16px', minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 11, color: P.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</div>
        {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: P.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function SectionHead({ title, sub, icon, color = P.cyan, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: P.text }}>{title}</h2>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
        </div>
        {sub && <div style={{ fontSize: 12, color: P.muted, marginTop: 3 }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: active ? 700 : 500,
      border: active ? `1px solid ${P.cyan}` : `1px solid ${P.border}`,
      background: active ? `${P.cyan}18` : 'transparent',
      color: active ? P.cyan : P.muted, cursor: 'pointer', whiteSpace: 'nowrap',
      transition: 'all 0.2s',
    }}>{label}</button>
  );
}

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: 28, fontWeight: 400, color: P.text, letterSpacing: '-0.04em', lineHeight: 1, fontFamily: "var(--font-plain)" }}>
        {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div style={{ fontSize: 11, color: P.muted }}>{days[now.getDay()]}, {fmtDate(now)}</div>
    </div>
  );
}

function PulseDot({ color = P.green }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%', background: color,
        boxShadow: `0 0 6px ${color}`,
        animation: 'pulse-dot 1.8s ease-in-out infinite',
      }} />
    </span>
  );
}

function OverviewTab({ data }) {
  const { habits, completions, journal, goals, discGoals, schedule, schedDone, mood,
          workouts, meals, sleep, hydration, bodyStats } = data;
  const todayKey = today();

  const habitsDoneToday = useMemo(() =>
    habits.filter(h => (completions[h.id] || {})[todayKey]).length,
  [habits, completions, todayKey]);

  const journalStreak = useMemo(() => {
    let s = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      if (Array.isArray(journal) ? journal.some(e => e.date === k) : journal[k]) s++;
      else if (i > 0) break;
    }
    return s;
  }, [journal]);

  const allGoals = [...(Array.isArray(goals) ? goals : []), ...(Array.isArray(discGoals) ? discGoals : [])];
  const goalsCompleted = allGoals.filter(g => g.done || g.completed).length;

  const schedCompleted = Object.values(schedDone[todayKey] || {}).filter(Boolean).length;
  const schedTotal = Array.isArray(schedule) ? schedule.length : 0;

  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const workoutsThisWeek = Array.isArray(workouts)
    ? workouts.filter(w => new Date(w.date || w.timestamp) >= weekStart).length : 0;

  const sArr = Array.isArray(sleep) ? sleep : [];
  const lastSleep = sArr.length ? sArr[sArr.length - 1] : null;
  const sleepHrs = lastSleep ? (lastSleep.duration || lastSleep.hours || 0) : 0;

  const habitScore  = pct(habitsDoneToday, Math.max(habits.length, 1));
  const goalScore   = pct(goalsCompleted, Math.max(allGoals.length, 1));
  const schedScore  = pct(schedCompleted, Math.max(schedTotal, 1));
  const jScore      = journalStreak > 0 ? 100 : 0;
  const overallScore = Math.round((habitScore + goalScore * 0.7 + schedScore * 0.8 + jScore * 0.5) / 3.0);

  const last7 = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const k = d.toISOString().slice(0, 10);
    return { label: d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1), v: habits.filter(h => (completions[h.id] || {})[k]).length, today: i === 6 };
  }), [habits, completions]);

  const todayMood = (mood || {})[todayKey];
  const MOOD_LABELS = ['Awful','Bad','Meh','Good','Great'];
  const MOOD_COLORS = [P.red, P.amber, P.muted, P.green, P.cyan];

  const habitHeatData = useMemo(() => {
    const acc = {};
    habits.forEach(h => {
      Object.entries(completions[h.id] || {}).forEach(([k, v]) => { if (v) acc[k] = (acc[k] || 0) + 1; });
    });
    return acc;
  }, [habits, completions]);

  const habits14 = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const k = d.toISOString().slice(0, 10);
    return {
      label: d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1),
      v: habits.filter(h => (completions[h.id] || {})[k]).length,
    };
  }), [habits, completions]);

  const workouts14 = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const k = d.toISOString().slice(0, 10);
    return {
      label: d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1),
      v: (Array.isArray(workouts) ? workouts : []).filter(w => {
        const raw = w?.date || (w?.timestamp ? new Date(w.timestamp).toISOString().slice(0, 10) : '');
        return raw === k;
      }).length,
    };
  }), [workouts]);

  const mood14 = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const k = d.toISOString().slice(0, 10);
    return {
      label: d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1),
      v: (mood || {})[k] !== undefined ? (mood[k] + 1) : 0,
    };
  }), [mood]);

  const insights = useMemo(() => {
    const take = (arr, n) => arr.slice(-n).reduce((a, b) => a + b.v, 0);
    const habitRecent = take(habits14, 7);
    const habitPrev = take(habits14.slice(0, 7), 7);
    const workoutRecent = take(workouts14, 7);
    const workoutPrev = take(workouts14.slice(0, 7), 7);
    const moodRecent = take(mood14, 7);
    const moodPrev = take(mood14.slice(0, 7), 7);

    const lines = [];
    lines.push(
      habitRecent > habitPrev
        ? `Habit momentum is improving (+${habitRecent - habitPrev} completions vs previous week).`
        : habitRecent < habitPrev
          ? `Habit consistency dipped (${habitPrev - habitRecent} fewer completions than previous week).`
          : 'Habit consistency is stable week-over-week.'
    );

    lines.push(
      workoutRecent > workoutPrev
        ? `Training intensity is up (${workoutRecent} sessions this week).`
        : workoutRecent === 0
          ? 'No workouts detected recently; schedule 2 short sessions to restart momentum.'
          : `Training frequency is moderate (${workoutRecent} sessions this week).`
    );

    lines.push(
      moodRecent > moodPrev
        ? 'Mood trend is improving over the last 7 days.'
        : moodRecent < moodPrev
          ? 'Mood trend softened this week; prioritize sleep and low-friction habits.'
          : 'Mood trend is steady this week.'
    );

    const focus = habitScore < 60
      ? 'Primary focus: complete 1 more habit daily to cross the 60% consistency threshold.'
      : goalScore < 50
        ? 'Primary focus: move one active goal by 10% this week to rebalance execution.'
        : 'Primary focus: maintain consistency and avoid missed schedule blocks.';

    return { lines, focus, habitRecent, workoutRecent, moodRecent };
  }, [habits14, workouts14, mood14, habitScore, goalScore]);

  const activity = useMemo(() => {
    const feed = [];
    (Array.isArray(journal) ? journal : []).slice(0, 3).forEach(e =>
      feed.push({ ts: e.timestamp || Date.now(), icon: '📓', text: 'Reflection saved', sub: (e.text || '').slice(0, 55) + '…', color: P.purple }));
    (Array.isArray(workouts) ? workouts : []).slice(-3).forEach(w =>
      feed.push({ ts: new Date(w.date || w.timestamp).getTime(), icon: '💪', text: w.name || 'Workout logged', sub: w.type || '', color: P.amber }));
    habits.forEach(h => {
      if ((completions[h.id] || {})[todayKey])
        feed.push({ ts: Date.now() - Math.random() * 3.6e6, icon: '✅', text: `${h.name} completed`, sub: 'today', color: P.green });
    });
    return feed.sort((a, b) => b.ts - a.ts).slice(0, 8);
  }, [journal, workouts, habits, completions, todayKey]);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, alignItems: 'center', marginBottom: 28 }}>
        <Ring pct={overallScore} size={110} stroke={10} color={overallScore >= 70 ? P.green : overallScore >= 40 ? P.amber : P.red}>
          <div style={{ fontSize: 22, fontWeight: 900, color: P.text }}>{overallScore}</div>
          <div style={{ fontSize: 9, color: P.muted, textTransform: 'uppercase' }}>score</div>
        </Ring>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: P.text, lineHeight: 1.2 }}>
            {overallScore >= 80 ? "You're in a strong stretch. ●" : overallScore >= 60 ? "Solid progress ◕" : overallScore >= 40 ? "Keep going ◑" : "Start your streak ○"}
          </div>
          <div style={{ fontSize: 13, color: P.muted, marginTop: 6 }}>
            {habitsDoneToday}/{habits.length} habits · {journalStreak}d journal streak · {goalsCompleted}/{allGoals.length} goals done
          </div>
          {todayMood !== undefined && (
            <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6,
              background: `${MOOD_COLORS[todayMood] || P.muted}18`, border: `1px solid ${MOOD_COLORS[todayMood] || P.muted}40`,
              borderRadius: 20, padding: '4px 12px', fontSize: 12, color: MOOD_COLORS[todayMood] || P.muted }}>
              Mood today: {MOOD_LABELS[todayMood] || 'Logged'}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 24 }}>
        <Tile label="Habits today" value={`${habitsDoneToday}/${habits.length}`} color={P.cyan} icon="🔁" />
        <Tile label="Journal streak" value={`${journalStreak}d`} color={P.purple} icon="📓" />
        <Tile label="Goals done" value={`${goalsCompleted}/${allGoals.length}`} color={P.green} icon="🎯" />
        <Tile label="Workouts/wk" value={workoutsThisWeek} color={P.amber} icon="💪" />
        <Tile label="Sleep last" value={sleepHrs ? `${sleepHrs}h` : '—'} color={P.pink} icon="🌙" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 11, color: P.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Habits last 7 days</div>
          <BarChart data={last7} color={P.purple} height={70} />
        </div>
        <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 11, color: P.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>12-week habit heatmap</div>
          <HeatMap data={habitHeatData} color={P.cyan} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: 16 }}>
          <SectionHead title="Live Trend Analytics" sub="14-day rolling trajectories" icon="📈" color={P.cyan} />
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: P.muted, marginBottom: 6 }}>Habit Completions</div>
              <LineChart data={habits14} color={P.cyan} height={118} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: P.muted, marginBottom: 6 }}>Workout Frequency</div>
              <LineChart data={workouts14} color={P.amber} height={118} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: P.muted, marginBottom: 6 }}>Mood Trajectory</div>
              <LineChart data={mood14} color={P.purple} height={118} yMax={5} />
            </div>
          </div>
        </div>

        <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: 16 }}>
          <SectionHead title="Performance Profile" sub="Balanced capability map" icon="🧭" color={P.green} />
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <RadarChart
              size={190}
              color={P.green}
              values={[
                habitScore,
                goalScore,
                schedScore,
                Math.min(100, insights.workoutRecent * 20),
                Math.min(100, insights.moodRecent * 12),
              ]}
              labels={['Habits', 'Goals', 'Schedule', 'Training', 'Mood']}
            />
          </div>

          <div style={{ borderTop: `1px solid ${P.border}`, paddingTop: 12 }}>
            <div style={{ fontSize: 11, color: P.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>AI Analysis</div>
            {insights.lines.map((line, i) => (
              <div key={i} style={{ fontSize: 12, color: P.text, lineHeight: 1.55, marginBottom: 7 }}>
                {line}
              </div>
            ))}
            <div style={{ marginTop: 10, padding: '9px 10px', background: `${P.cyan}12`, border: `1px solid ${P.cyan}33`, borderRadius: 10, fontSize: 12, color: P.cyan }}>
              {insights.focus}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: 16 }}>
        <SectionHead title="Live Activity Feed" sub="Real-time actions across all modules" icon="⚡" color={P.cyan} />
        {activity.length === 0 ? (
          <div style={{ textAlign: 'center', color: P.muted, fontSize: 13, padding: '20px 0' }}>No activity yet — start logging!</div>
        ) : activity.map((a, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0',
            borderBottom: i < activity.length - 1 ? `1px solid ${P.border}` : 'none', alignItems: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: `${a.color}18`,
              border: `1px solid ${a.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 14 }}>{a.icon}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: P.text, fontWeight: 500 }}>{a.text}</div>
              {a.sub && <div style={{ fontSize: 11, color: P.muted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.sub}</div>}
            </div>
            <div style={{ fontSize: 10, color: P.muted, whiteSpace: 'nowrap', flexShrink: 0 }}>{fmtTime(new Date(a.ts))}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HabitsTab({ data }) {
  const { habits, completions } = data;
  const todayKey = today();
  const last14 = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    return d.toISOString().slice(0, 10);
  }), []);
  const CAT_COLORS = { Body: P.cyan, Mind: P.purple, Discipline: P.amber, Health: P.green, default: P.pink };
  const weekData = useMemo(() => habits.map(h => {
    const completedDays = Object.entries(completions[h.id] || {}).filter(([, v]) => v).length;
    let streak = 0;
    for (let i = 0; i < 90; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      if ((completions[h.id] || {})[k]) streak++;
      else if (i > 0) break;
    }
    return { ...h, completedDays, streak };
  }), [habits, completions]);
  const totalPct = pct(weekData.filter(h => (completions[h.id] || {})[todayKey]).length, Math.max(habits.length, 1));
  const habitHeatData = useMemo(() => {
    const acc = {};
    habits.forEach(h => { Object.entries(completions[h.id] || {}).forEach(([k, v]) => { if (v) acc[k] = (acc[k] || 0) + 1; }); });
    return acc;
  }, [habits, completions]);
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 22 }}>
        <Tile label="Done today" value={`${weekData.filter(h => (completions[h.id] || {})[todayKey]).length}/${habits.length}`} color={P.cyan} icon="✅" />
        <Tile label="Best streak" value={`${Math.max(...weekData.map(h => h.streak), 0)}d`} color={P.amber} icon="●" />
        <Tile label="Total logged" value={weekData.reduce((a, h) => a + h.completedDays, 0)} color={P.green} icon="📊" />
        <Tile label="Today rate" value={`${totalPct}%`} color={totalPct >= 80 ? P.green : totalPct >= 50 ? P.amber : P.red} icon="🎯" />
      </div>
      <SectionHead title="Habit Tracker" sub="Last 14 days per habit" icon="🔁" color={P.cyan} />
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 60px 60px', padding: '8px 16px',
          background: 'rgba(255,255,255,0.03)', fontSize: 10, color: P.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          <div>Habit</div><div style={{ textAlign: 'center' }}>14 days</div>
          <div style={{ textAlign: 'center' }}>Streak</div><div style={{ textAlign: 'center' }}>Total</div>
        </div>
        {weekData.length === 0 && <div style={{ padding: '32px 16px', textAlign: 'center', color: P.muted, fontSize: 13 }}>No habits yet — add in Discipline tab!</div>}
        {weekData.map((h, i) => {
          const col = CAT_COLORS[h.category] || CAT_COLORS.default;
          const doneToday = !!(completions[h.id] || {})[todayKey];
          return (
            <div key={h.id} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 60px 60px',
              padding: '10px 16px', borderBottom: i < weekData.length - 1 ? `1px solid ${P.border}` : 'none',
              alignItems: 'center', background: doneToday ? `${col}08` : 'transparent' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: P.text, marginBottom: 2 }}>{h.name}</div>
                <div style={{ fontSize: 10, color: col }}>{h.category}</div>
              </div>
              <div style={{ display: 'flex', gap: 2, padding: '0 8px' }}>
                {last14.map(k => {
                  const done = !!(completions[h.id] || {})[k];
                  return <div key={k} title={k} style={{ flex: 1, height: 20, borderRadius: 3, background: done ? col : P.border,
                    outline: k === todayKey ? `2px solid ${col}` : 'none', opacity: done ? 1 : 0.25 }} />;
                })}
              </div>
              <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: h.streak > 0 ? P.amber : P.muted }}>{h.streak}d</div>
              <div style={{ textAlign: 'center', fontSize: 12, color: P.muted }}>{h.completedDays}</div>
            </div>
          );
        })}
      </div>
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: 16 }}>
        <SectionHead title="12-Week Activity Map" sub="All habits combined" icon="📅" color={P.purple} />
        <HeatMap data={habitHeatData} color={P.cyan} />
        <div style={{ marginTop: 8, fontSize: 10, color: P.muted }}>Lighter = fewer habits done · Darker = more done</div>
      </div>
    </div>
  );
}

function GoalsTab({ data }) {
  const { goals, discGoals } = data;
  const allGoals = [...(Array.isArray(goals) ? goals : []), ...(Array.isArray(discGoals) ? discGoals : [])];
  const done    = allGoals.filter(g => g.done || g.completed).length;
  const active  = allGoals.filter(g => !g.done && !g.completed).length;
  const overdue = allGoals.filter(g => g.deadline && !g.done && !g.completed && new Date(g.deadline) < new Date()).length;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 22 }}>
        <Tile label="Total" value={allGoals.length} color={P.cyan} icon="🎯" />
        <Tile label="Completed" value={done} color={P.green} icon="✅" />
        <Tile label="Active" value={active} color={P.amber} icon="⚡" />
        <Tile label="Overdue" value={overdue} color={overdue > 0 ? P.red : P.muted} icon="⚠️" />
      </div>
      <SectionHead title="All Goals" sub={`${done}/${allGoals.length} completed`} icon="🎯" color={P.green} />
      {allGoals.length === 0 ? (
        <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: '32px 16px', textAlign: 'center', color: P.muted }}>
          No goals yet — create some in the Discipline section.
        </div>
      ) : allGoals.map((g, i) => {
        const completed = g.done || g.completed;
        const p = g.progress !== undefined ? g.progress : (completed ? 100 : 0);
        const isOverdue = g.deadline && !completed && new Date(g.deadline) < new Date();
        return (
          <div key={g.id || i} style={{ background: P.card, border: `1px solid ${completed ? P.green + '40' : isOverdue ? P.red + '40' : P.border}`,
            borderRadius: 14, padding: '14px 16px', marginBottom: 10, display: 'flex', gap: 14, alignItems: 'center' }}>
            <Ring pct={p} size={52} stroke={5} color={completed ? P.green : isOverdue ? P.red : P.cyan}>
              <div style={{ fontSize: 10, fontWeight: 700, color: P.text }}>{p}%</div>
            </Ring>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: P.text, marginBottom: 3 }}>{g.title || g.name || 'Goal'}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {g.category && <span style={{ fontSize: 10, background: `${P.purple}22`, color: P.purple, borderRadius: 10, padding: '2px 8px' }}>{g.category}</span>}
                {completed && <span style={{ fontSize: 10, background: `${P.green}22`, color: P.green, borderRadius: 10, padding: '2px 8px' }}>✓ Done</span>}
                {isOverdue && <span style={{ fontSize: 10, background: `${P.red}22`, color: P.red, borderRadius: 10, padding: '2px 8px' }}>Overdue</span>}
                {g.deadline && <span style={{ fontSize: 10, color: P.muted }}>Due {fmtDate(g.deadline)}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function JournalTab({ data }) {
  const { journal, mood } = data;
  const entries = Array.isArray(journal) ? journal : [];
  const streak = useMemo(() => {
    let s = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      if (entries.some(e => e.date === k)) s++;
      else if (i > 0) break;
    }
    return s;
  }, [entries]);
  const avgWords = useMemo(() => {
    if (!entries.length) return 0;
    return Math.round(entries.reduce((a, e) => a + (e.text || '').split(/\s+/).filter(Boolean).length, 0) / entries.length);
  }, [entries]);
  const moodData = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const k = d.toISOString().slice(0, 10);
    return { label: d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1), v: (mood || {})[k] !== undefined ? ((mood || {})[k] + 1) : 0, today: i === 13 };
  }), [mood]);
  const entryHeat = useMemo(() => entries.reduce((acc, e) => { if (e.date) acc[e.date] = (acc[e.date] || 0) + 1; return acc; }, {}), [entries]);
  const MOOD_LABELS = ['○','◔','◑','◕','●'];
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 22 }}>
        <Tile label="Total entries" value={entries.length} color={P.purple} icon="📓" />
        <Tile label="Streak" value={`${streak}d`} color={P.cyan} icon="●" />
        <Tile label="Avg words" value={avgWords} color={P.green} icon="✍️" />
        <Tile label="This month" value={entries.filter(e => (e.date || '').slice(0, 7) === today().slice(0, 7)).length} color={P.amber} icon="📅" />
      </div>
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <SectionHead title="Mood Trend" sub="Last 14 days" icon="🌡️" color={P.purple} />
        <BarChart data={moodData} color={P.purple} height={70} />
      </div>
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <SectionHead title="12-Week Writing Map" icon="📅" color={P.pink} />
        <HeatMap data={entryHeat} color={P.purple} />
      </div>
      <SectionHead title="Recent Entries" sub={`${entries.length} total`} icon="📖" color={P.cyan} />
      {entries.length === 0 ? (
        <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: '32px 16px', textAlign: 'center', color: P.muted }}>
          No journal entries yet — start reflecting in Discipline!
        </div>
      ) : entries.slice(0, 10).map((e, i) => (
        <div key={e.id || i} style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>{MOOD_LABELS[e.mood] || '📓'}</span>
              <div style={{ fontSize: 12, color: P.muted }}>{fmtDate(e.date)}</div>
              <span style={{ fontSize: 10, background: `${P.purple}22`, color: P.purple, borderRadius: 10, padding: '2px 8px' }}>{e.mode || 'free'}</span>
            </div>
            <div style={{ fontSize: 11, color: P.muted }}>{(e.text || '').split(/\s+/).filter(Boolean).length} words</div>
          </div>
          {e.prompt && <div style={{ fontSize: 11, color: P.purple, marginBottom: 6, fontStyle: 'italic' }}>"{e.prompt}"</div>}
          <div style={{ fontSize: 12, color: P.muted, lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{e.text}</div>
        </div>
      ))}
    </div>
  );
}

function BodyTab({ data }) {
  const { workouts, meals, sleep, hydration, bodyStats } = data;
  const wArr = Array.isArray(workouts) ? workouts : [];
  const sArr = Array.isArray(sleep) ? sleep : [];
  const mArr = Array.isArray(meals) ? meals : [];
  const hArr = Array.isArray(hydration) ? hydration : [];
  const workoutDays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const k = d.toISOString().slice(0, 10);
    return { label: d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1), v: wArr.filter(w => (w.date || (w.timestamp ? new Date(w.timestamp).toISOString().slice(0,10) : '')) === k).length, today: i === 6 };
  }), [wArr]);
  const sleepData = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const k = d.toISOString().slice(0, 10);
    const e = sArr.find(s => (s.date || '').startsWith(k));
    return { label: d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1), v: e ? (e.duration || e.hours || 0) : 0, today: i === 6 };
  }), [sArr]);
  const todayMeals = mArr.filter(m => (m.date || '').startsWith(today()));
  const caloriesToday = todayMeals.reduce((a, m) => a + (m.calories || 0), 0);
  const todayHydration = hArr.filter(h => (h.date || '').startsWith(today())).reduce((a, h) => a + (h.amount || h.ml || 0), 0);
  const bsArr = Array.isArray(bodyStats) ? bodyStats : (bodyStats ? [bodyStats] : []);
  const latest = bsArr.length ? bsArr[bsArr.length - 1] : null;
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const workoutsThisWeek = wArr.filter(w => new Date(w.date || w.timestamp) >= weekStart).length;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 22 }}>
        <Tile label="Workouts/wk" value={workoutsThisWeek} color={P.amber} icon="💪" />
        <Tile label="Cal today" value={caloriesToday || '—'} color={P.cyan} icon="🍽️" />
        <Tile label="Hydration" value={todayHydration ? `${Math.round(todayHydration)}ml` : '—'} color={P.cyan} icon="💧" />
        <Tile label="Sleep avg" value={sArr.length ? `${(sArr.slice(-7).reduce((a, s) => a + (s.duration || s.hours || 0), 0) / Math.min(sArr.length, 7)).toFixed(1)}h` : '—'} color={P.pink} icon="🌙" />
      </div>
      {latest && (
        <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: 16, marginBottom: 16,
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12 }}>
          {latest.weight && <div><div style={{ fontSize: 10, color: P.muted, textTransform: 'uppercase' }}>Weight</div><div style={{ fontSize: 22, fontWeight: 800, color: P.text }}>{latest.weight} <span style={{ fontSize: 12, color: P.muted }}>kg</span></div></div>}
          {latest.height && <div><div style={{ fontSize: 10, color: P.muted, textTransform: 'uppercase' }}>Height</div><div style={{ fontSize: 22, fontWeight: 800, color: P.text }}>{latest.height} <span style={{ fontSize: 12, color: P.muted }}>cm</span></div></div>}
          {latest.bmi    && <div><div style={{ fontSize: 10, color: P.muted, textTransform: 'uppercase' }}>BMI</div><div style={{ fontSize: 22, fontWeight: 800, color: P.text }}>{latest.bmi}</div></div>}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 11, color: P.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Workouts — 7 days</div>
          <BarChart data={workoutDays} color={P.amber} height={70} />
        </div>
        <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 11, color: P.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Sleep (hrs) — 7 days</div>
          <BarChart data={sleepData} color={P.pink} height={70} />
        </div>
      </div>
      <SectionHead title="Recent Workouts" icon="💪" color={P.amber} />
      {wArr.length === 0 ? (
        <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: '24px', textAlign: 'center', color: P.muted }}>No workouts logged yet.</div>
      ) : wArr.slice(-6).reverse().map((w, i) => (
        <div key={i} style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 8,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: P.text }}>{w.name || w.type || 'Workout'}</div>
            <div style={{ fontSize: 11, color: P.muted }}>{fmtDate(w.date || w.timestamp)}{w.duration ? ` · ${w.duration}min` : ''}</div>
          </div>
          {w.calories && <div style={{ fontSize: 12, color: P.amber }}>{w.calories} cal</div>}
        </div>
      ))}
    </div>
  );
}

function MindTab({ data }) {
  const { mood, meditations } = data;
  const moodEntries = Object.entries(mood || {}).sort((a, b) => b[0].localeCompare(a[0]));
  const MOOD_LABELS = ['Awful','Bad','Meh','Good','Great'];
  const MOOD_COLORS = [P.red, P.amber, P.muted, P.green, P.cyan];
  const MOOD_ICONS  = ['○','◔','◑','◕','●'];
  const medsArr = Array.isArray(meditations) ? meditations : [];
  const totalMedMins = medsArr.reduce((a, m) => a + (m.duration || m.minutes || 0), 0);
  const moodData14 = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const k = d.toISOString().slice(0, 10);
    return { label: d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1), v: (mood || {})[k] !== undefined ? (mood || {})[k] + 1 : 0, today: i === 13 };
  }), [mood]);
  const avgMood = useMemo(() => {
    const vals = Object.values(mood || {}).filter(v => v !== undefined);
    return vals.length ? (vals.reduce((a, v) => a + v, 0) / vals.length).toFixed(1) : null;
  }, [mood]);
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 22 }}>
        <Tile label="Mood logged" value={moodEntries.length} color={P.purple} icon="🌡️" />
        <Tile label="Avg mood" value={avgMood ? `${avgMood}/4` : '—'} color={P.cyan} icon="●" />
        <Tile label="Meditations" value={medsArr.length} color={P.green} icon="🧘" />
        <Tile label="Med minutes" value={totalMedMins} color={P.amber} icon="⏱️" />
      </div>
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <SectionHead title="Mood — Last 14 days" icon="🌡️" color={P.purple} />
        <BarChart data={moodData14} color={P.purple} height={70} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 12 }}>
          {MOOD_ICONS.map((m, i) => (
            <div key={i} style={{ fontSize: 11, color: MOOD_COLORS[i], textAlign: 'center' }}>
              <div style={{ fontSize: 18 }}>{m}</div>
              <div>{MOOD_LABELS[i]}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <SectionHead title="12-Week Mood Map" icon="📅" color={P.pink} />
        <HeatMap data={Object.fromEntries(moodEntries.map(([k, v]) => [k, v + 1]))} color={P.purple} />
      </div>
      <SectionHead title="Mood Log" sub={`${moodEntries.length} days recorded`} icon="📋" color={P.cyan} />
      {moodEntries.length === 0 ? (
        <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: '24px', textAlign: 'center', color: P.muted }}>No mood data — log your mood daily in the Mind section.</div>
      ) : moodEntries.slice(0, 14).map(([date, v]) => (
        <div key={date} style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 8,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 24 }}>{MOOD_ICONS[v] || '○'}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: MOOD_COLORS[v] || P.muted }}>{MOOD_LABELS[v] || 'Logged'}</div>
              <div style={{ fontSize: 11, color: P.muted }}>{fmtDate(date)}</div>
            </div>
          </div>
          <div style={{ width: 60 }}>
            <div style={{ height: 4, borderRadius: 2, background: P.border }}>
              <div style={{ height: '100%', borderRadius: 2, width: `${((v || 0) / 4) * 100}%`, background: MOOD_COLORS[v] || P.muted }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DisciplineTab({ data }) {
  const { habits, completions, schedule, schedDone, discGoals } = data;
  const todayKey = today();
  const schedCompleted = Object.values(schedDone[todayKey] || {}).filter(Boolean).length;
  const schedTotal = Array.isArray(schedule) ? schedule.length : 0;
  const weekHabitData = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const k = d.toISOString().slice(0, 10);
    return { label: d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1), v: habits.filter(h => (completions[h.id] || {})[k]).length, today: i === 6 };
  }), [habits, completions]);
  const goalsArr = Array.isArray(discGoals) ? discGoals : [];
  const goalsDone = goalsArr.filter(g => g.done || g.completed).length;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 22 }}>
        <Tile label="Schedule done" value={`${schedCompleted}/${schedTotal}`} color={P.cyan} icon="📅" />
        <Tile label="Habits today" value={`${habits.filter(h => (completions[h.id] || {})[todayKey]).length}/${habits.length}`} color={P.amber} icon="🔁" />
        <Tile label="Goals done" value={`${goalsDone}/${goalsArr.length}`} color={P.green} icon="🎯" />
        <Tile label="Total habits" value={habits.length} color={P.purple} icon="📊" />
      </div>
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <SectionHead title="Today's Schedule" sub={`${schedCompleted}/${schedTotal} blocks completed`} icon="🗓️" color={P.cyan} action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ height: 4, width: 100, borderRadius: 2, background: P.border, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: P.cyan, width: `${pct(schedCompleted, Math.max(schedTotal, 1))}%`, transition: 'width 0.6s' }} />
            </div>
            <span style={{ fontSize: 11, color: P.cyan }}>{pct(schedCompleted, Math.max(schedTotal, 1))}%</span>
          </div>
        } />
        {!Array.isArray(schedule) || schedule.length === 0 ? (
          <div style={{ textAlign: 'center', color: P.muted, fontSize: 12, padding: '16px 0' }}>No schedule blocks — add some in Discipline!</div>
        ) : schedule.map((b, i) => {
          const done = !!(schedDone[todayKey] || {})[b.id || i];
          return (
            <div key={b.id || i} style={{ display: 'flex', gap: 12, padding: '10px 0',
              borderBottom: i < schedule.length - 1 ? `1px solid ${P.border}` : 'none', alignItems: 'center' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${done ? P.green : P.border}`,
                background: done ? P.green : 'transparent', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#000' }}>{done && '✓'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: done ? P.muted : P.text, textDecoration: done ? 'line-through' : 'none' }}>{b.label || b.name || 'Block'}</div>
                {b.time && <div style={{ fontSize: 10, color: P.muted }}>{b.time}</div>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: 16 }}>
        <SectionHead title="Habit Activity — 7 days" icon="🔁" color={P.amber} />
        <BarChart data={weekHabitData} color={P.amber} height={70} />
      </div>
    </div>
  );
}

const TABS = [
  { id: 'overview',   label: '⚡ Overview'   },
  { id: 'habits',     label: '🔁 Habits'     },
  { id: 'goals',      label: '🎯 Goals'      },
  { id: 'journal',    label: '📓 Journal'    },
  { id: 'body',       label: '💪 Body'       },
  { id: 'mind',       label: '🧘 Mind'       },
  { id: 'discipline', label: '⚔️ Discipline' },
];

const ProgressSection = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 3000);
    return () => clearInterval(t);
  }, []);

  const habits      = useLive('disc_habits', []);
  const completions = useLive('disc_habit_completions', {});
  const journal     = useLive('disc_journal', []);
  const schedule    = useLive('disc_schedule', []);
  const schedDone   = useLive('disc_schedule_done', {});
  const discGoals   = useLive('disc_goals', []);
  const goals       = useLive('sophia_goals', []);
  const mood        = useLive('disc_daily_mood', {});
  const meditations = useLive('mind_meditations', []);
  const mindJournal = useLive('mind_journal', {});
  const workouts    = useLive('sophia_workouts', []);
  const meals       = useLive('sophia_meals', []);
  const sleep       = useLive('sophia_sleep', []);
  const hydration   = useLive('sophia_hydration', []);
  const bodyStats   = useLive('sophia_body_stats', []);

  const profile = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('sophia-user-profile') || '{}'); }
    catch { return {}; }
  }, [tick]);

  const data = { habits, completions, journal, schedule, schedDone, discGoals, goals, mood,
                 meditations, mindJournal, workouts, meals, sleep, hydration, bodyStats };

  const todayKey = today();
  const habitsToday = habits.filter(h => (completions[h.id] || {})[todayKey]).length;
  const journalToday = Array.isArray(journal) && journal.some(e => e.date === todayKey);
  const schedToday = Object.values(schedDone[todayKey] || {}).filter(Boolean).length;

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':   return <OverviewTab   data={data} />;
      case 'habits':     return <HabitsTab     data={data} />;
      case 'goals':      return <GoalsTab      data={data} />;
      case 'journal':    return <JournalTab    data={data} />;
      case 'body':       return <BodyTab       data={data} />;
      case 'mind':       return <MindTab       data={data} />;
      case 'discipline': return <DisciplineTab data={data} />;
      default:           return null;
    }
  };

  return (
    <div style={{ color: P.text, fontFamily: "var(--font-plain)", padding: '0 0 60px 0', minWidth: 0 }}>
      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
        @keyframes slide-in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .prog-tab-content { animation: slide-in 0.25s ease; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: P.text, letterSpacing: '-0.04em' }}>Progress Hub</h1>
            <PulseDot color={P.green} />
            <span style={{ fontSize: 10, color: P.green, background: `${P.green}18`, border: `1px solid ${P.green}30`, borderRadius: 20, padding: '3px 10px' }}>LIVE</span>
          </div>
          <div style={{ fontSize: 12, color: P.muted, marginTop: 4 }}>
            {profile.name ? `${profile.name}'s ` : ''}real-time performance across all modules
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            <span style={{ fontSize: 11, background: habitsToday > 0 ? `${P.cyan}15` : 'transparent',
              border: `1px solid ${habitsToday > 0 ? P.cyan + '40' : P.border}`,
              color: habitsToday > 0 ? P.cyan : P.muted, borderRadius: 20, padding: '3px 10px' }}>
              {habitsToday}/{habits.length} habits today
            </span>
            <span style={{ fontSize: 11, background: journalToday ? `${P.purple}15` : 'transparent',
              border: `1px solid ${journalToday ? P.purple + '40' : P.border}`,
              color: journalToday ? P.purple : P.muted, borderRadius: 20, padding: '3px 10px' }}>
              {journalToday ? '📓 Journaled today' : '📓 No journal yet'}
            </span>
            <span style={{ fontSize: 11, background: schedToday > 0 ? `${P.green}15` : 'transparent',
              border: `1px solid ${schedToday > 0 ? P.green + '40' : P.border}`,
              color: schedToday > 0 ? P.green : P.muted, borderRadius: 20, padding: '3px 10px' }}>
              🗓️ {schedToday} schedule blocks done
            </span>
          </div>
        </div>
        <LiveClock />
      </div>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 20, scrollbarWidth: 'none' }}>
        {TABS.map(t => <Tab key={t.id} label={t.label} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} />)}
      </div>

      <div className="prog-tab-content" key={activeTab}>
        {renderTab()}
      </div>
    </div>
  );
};

export default ProgressSection;
