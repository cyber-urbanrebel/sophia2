import { useState, useEffect, useCallback } from "react";
import api from '../services/api.js';

// ─── useLocalStorage hook ───────────────────────────────────────────────────
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });
  const set = useCallback(
    (v) => {
      const next = typeof v === "function" ? v(value) : v;
      setValue(next);
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
    },
    [key, value]
  );
  return [value, set];
}

const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const fmtDay  = (d) => new Date(d).toLocaleDateString("en-US", { weekday: "short" });
const uid     = () => Math.random().toString(36).slice(2, 9);

// ─── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg:      "#0d1117",
  surface: "#161b22",
  card:    "#1c2129",
  border:  "#30363d",
  primary: "#7b68ee",
  accent:  "#9580ff",
  green:   "#3fb950",
  cyan:    "#58a6ff",
  purple:  "#d2a8ff",
  text:    "#c9d1d9",
  muted:   "#8b949e",
  danger:  "#f85149",
};

const styles = {
  wrap: { background: "transparent", color: C.text, fontFamily: "'DM Mono', 'Fira Code', monospace", padding: "0", paddingBottom: 40 },
  tabs: { display: "flex", gap: 4, marginBottom: 28, flexWrap: "wrap", borderBottom: `1px solid ${C.border}`, paddingBottom: 12 },
  tabActive: { background: C.primary, color: "#fff", borderRadius: 6, padding: "7px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "inherit", letterSpacing: "0.03em" },
  tabInactive: { background: "transparent", color: C.muted, borderRadius: 6, padding: "7px 14px", fontSize: 13, cursor: "pointer", border: "none", fontFamily: "inherit", transition: "color .2s" },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginBottom: 14 },
  statRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 18 },
  statCard: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 10px", textAlign: "center" },
  statNum: { fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 },
  statLabel: { fontSize: 10, color: C.muted, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.08em" },
  input: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: "8px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" },
  btn: { background: C.primary, color: "#000", border: "none", borderRadius: 6, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.04em" },
  btnGhost: { background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 6, padding: "7px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  h2: { fontSize: 15, fontWeight: 700, marginBottom: 12, color: C.text, letterSpacing: "0.04em", textTransform: "uppercase" },
  h3: { fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 },
  label: { fontSize: 11, color: C.muted, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" },
  row: { display: "flex", gap: 10, alignItems: "center" },
  badge: (color) => ({ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }),
  progress: { height: 6, borderRadius: 4, background: C.border, overflow: "hidden", marginTop: 6 },
  progressFill: (pct, color) => ({ height: "100%", width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 4, transition: "width .4s ease" }),
};

// ─── TABS definition ──────────────────────────────────────────────────────
const TABS = [
  { id: "habits",    label: "🔥 Habits"    },
  { id: "mindset",   label: "🧠 Mindset"   },
  { id: "schedule",  label: "⏰ Schedule"  },
  { id: "goals",     label: "🎯 Goals"     },
  { id: "journal",   label: "📓 Journal"   },
  { id: "score",     label: "⚡ Score"     },
];

// ═══════════════════════════════════════════════════════════════════════════
// TAB 1 — 🔥 HABITS
// ═══════════════════════════════════════════════════════════════════════════
const DEFAULT_HABITS = [
  { id: "h1", name: "Cold shower", category: "Body",    target: 1, unit: "session", streak: 0 },
  { id: "h2", name: "No social media", category: "Mind", target: 1, unit: "day",    streak: 0 },
  { id: "h3", name: "Read 30 min",   category: "Mind",  target: 30, unit: "min",   streak: 0 },
  { id: "h4", name: "Meditate",      category: "Mind",  target: 10, unit: "min",   streak: 0 },
  { id: "h5", name: "No junk food",  category: "Body",  target: 1, unit: "day",    streak: 0 },
  { id: "h6", name: "Exercise",      category: "Body",  target: 1, unit: "session",streak: 0 },
  { id: "h7", name: "Early wake (5am)", category: "Discipline", target: 1, unit: "day", streak: 0 },
  { id: "h8", name: "Journaling",    category: "Mind",  target: 1, unit: "entry",  streak: 0 },
];

const CAT_COLORS = { Body: C.cyan, Mind: C.purple, Discipline: C.primary, Health: C.green };

function HabitsTab() {
  const [habits, setHabits]     = useState([]);
  const [showAdd, setShowAdd]   = useState(false);
  const [newHabit, setNewHabit] = useState({ name: "", category: "Discipline", target: 1, unit: "day" });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [habitError, setHabitError] = useState("");

  const todayKey = today();

  const normalizeHabit = useCallback((h, idx = 0) => {
    const categoryFromDescription = typeof h?.description === "string" && h.description.includes("Category:")
      ? (h.description.split("Category:")[1]?.split(";")[0] || "").trim()
      : "";
    const unitFromDescription = typeof h?.description === "string" && h.description.includes("Unit:")
      ? (h.description.split("Unit:")[1] || "").trim()
      : "";

    return {
      id: h?.id || `local-h-${idx}-${uid()}`,
      name: h?.name || "Untitled Habit",
      category: h?.category || categoryFromDescription || "Discipline",
      target: Number(h?.target ?? h?.targetCount ?? h?.target_count ?? 1) || 1,
      unit: h?.unit || unitFromDescription || "day",
      streak: Number(h?.streak || 0),
      completedDates: Array.isArray(h?.completedDates) ? h.completedDates : [],
      userId: h?.userId || h?.user_id,
      frequency: h?.frequency || "daily",
      description: h?.description || "",
      isActive: h?.isActive ?? h?.is_active ?? true,
      createdAt: h?.createdAt || h?.created_at,
      updatedAt: h?.updatedAt || h?.updated_at,
    };
  }, []);

  const buildCompletionsMap = useCallback((habitList) => {
    const map = {};
    (habitList || []).forEach((h) => {
      (h.completedDates || []).forEach((dateKey) => {
        if (!map[dateKey]) map[dateKey] = {};
        map[dateKey][h.id] = true;
      });
    });
    return map;
  }, []);

  const syncHabitsToStorage = useCallback((habitList) => {
    const normalized = (habitList || []).map((h, i) => normalizeHabit(h, i));
    const completionMap = buildCompletionsMap(normalized);

    localStorage.setItem('sophia_habits', JSON.stringify(normalized));
    localStorage.setItem('disc_habits', JSON.stringify(normalized));
    localStorage.setItem('disc_habit_completions', JSON.stringify(completionMap));

    ['sophia_habits', 'disc_habits', 'disc_habit_completions'].forEach((key) => {
      window.dispatchEvent(new CustomEvent('sophia-data-updated', {
        detail: { key, timestamp: Date.now() }
      }));
    });

    return normalized;
  }, [buildCompletionsMap, normalizeHabit]);

  // Load habits from database
  useEffect(() => {
    const loadHabits = async () => {
      try {
        setLoading(true);
        const data = await api.getHabits();
        const habitsData = Array.isArray(data) ? data.map((h, i) => normalizeHabit(h, i)) : [];
        setHabits(syncHabitsToStorage(habitsData));
      } catch (error) {
        console.error('Failed to load habits:', error);
        const fallback = (() => {
          try {
            const stored = JSON.parse(localStorage.getItem('disc_habits') || '[]');
            return Array.isArray(stored) && stored.length ? stored.map((h, i) => normalizeHabit(h, i)) : DEFAULT_HABITS.map((h, i) => normalizeHabit(h, i));
          } catch {
            return DEFAULT_HABITS.map((h, i) => normalizeHabit(h, i));
          }
        })();
        setHabits(syncHabitsToStorage(fallback));
      } finally {
        setLoading(false);
      }
    };
    loadHabits();
  }, [normalizeHabit, syncHabitsToStorage]);

  const toggle = async (id) => {
    const currentHabit = habits.find(h => h.id === id);
    const doneToday = !!currentHabit?.completedDates?.includes(todayKey);

    try {
      if (typeof id === 'string' && id.length > 10) {
        if (doneToday && api.uncompleteHabit) {
          await api.uncompleteHabit(id);
        } else {
          await api.completeHabit(id);
        }

        const data = await api.getHabits();
        const habitsData = Array.isArray(data) ? data.map((h, i) => normalizeHabit(h, i)) : [];
        setHabits(syncHabitsToStorage(habitsData));
        return;
      }
      throw new Error('Local-only habit');
    } catch (error) {
      const localUpdated = habits.map((h) => {
        if (h.id !== id) return h;
        const hasToday = (h.completedDates || []).includes(todayKey);
        const nextDates = hasToday
          ? (h.completedDates || []).filter((d) => d !== todayKey)
          : [...(h.completedDates || []), todayKey];
        return { ...h, completedDates: nextDates };
      });
      setHabits(syncHabitsToStorage(localUpdated));
    }
  };

  const getStreak = (habit) => {
    let streak = 0;
    let d = new Date();
    while (true) {
      const k = d.toISOString().slice(0, 10);
      if (habit.completedDates?.includes(k)) { 
        streak++; 
        d.setDate(d.getDate() - 1); 
      } else {
        break;
      }
    }
    return streak;
  };

  const todayDone = habits.filter(h => h.completedDates?.includes(todayKey)).length;
  const pct = Math.round((todayDone / habits.length) * 100);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const k = d.toISOString().slice(0, 10);
    const done = habits.filter(h => h.completedDates?.includes(k)).length;
    return { label: fmtDay(k), pct: habits.length ? Math.round(done / habits.length * 100) : 0, done, k };
  });

  const addHabit = async () => {
    setHabitError("");
    if (!newHabit.name.trim()) {
      setHabitError("Habit name is required");
      return;
    }
    if (!newHabit.unit.trim()) {
      setHabitError("Unit is required (e.g., sessions, days, minutes)");
      return;
    }
    setSaving(true);
    try {
      const habitData = {
        name: newHabit.name.trim(),
        frequency: 'daily',
        targetCount: Number(newHabit.target) || 1,
        description: `Category: ${newHabit.category}; Unit: ${newHabit.unit.trim()}`,
      };
      const createdHabit = await api.createHabit(habitData);
      const normalizedCreated = normalizeHabit({
        ...createdHabit,
        category: newHabit.category,
        target: Number(newHabit.target) || 1,
        unit: newHabit.unit.trim(),
      });
      const allHabits = [...habits, normalizedCreated];
      setHabits(syncHabitsToStorage(allHabits));
      
      setNewHabit({ name: "", category: "Discipline", target: 1, unit: "day" });
      setHabitError("");
      setShowAdd(false);
    } catch (error) {
      const isNetworkIssue = String(error?.message || '').toLowerCase().includes('failed to fetch')
        || String(error?.message || '').toLowerCase().includes('network');

      if (isNetworkIssue) {
        const fallbackHabit = normalizeHabit({
          id: uid(),
          name: newHabit.name.trim(),
          category: newHabit.category,
          target: Number(newHabit.target) || 1,
          unit: newHabit.unit.trim(),
          completedDates: [],
          streak: 0,
          isActive: true,
        });
        const allHabits = [...habits, fallbackHabit];
        setHabits(syncHabitsToStorage(allHabits));
        setNewHabit({ name: "", category: "Discipline", target: 1, unit: "day" });
        setHabitError("");
        setShowAdd(false);
      } else {
        console.error('Failed to create habit:', error);
        setHabitError(error?.message || "Failed to save habit. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteHabit = async (id) => {
    try {
      await api.deleteHabit(id);
      const updatedHabits = habits.filter(h => h.id !== id);
      setHabits(syncHabitsToStorage(updatedHabits));
    } catch (error) {
      const updatedHabits = habits.filter(h => h.id !== id);
      setHabits(syncHabitsToStorage(updatedHabits));
    }
  };

  const longestStreak = Math.max(...habits.map(h => getStreak(h)), 0);

  return (
    <div>
      <div style={styles.statRow}>
        <div style={styles.statCard}><div style={{ ...styles.statNum, color: C.primary }}>{todayDone}/{habits.length}</div><div style={styles.statLabel}>Today Done</div></div>
        <div style={styles.statCard}><div style={{ ...styles.statNum, color: C.accent }}>{pct}%</div><div style={styles.statLabel}>Completion</div></div>
        <div style={styles.statCard}><div style={{ ...styles.statNum, color: C.cyan }}>{longestStreak}</div><div style={styles.statLabel}>Best Streak</div></div>
        <div style={styles.statCard}><div style={{ ...styles.statNum, color: C.green }}>{habits.length}</div><div style={styles.statLabel}>Total Habits</div></div>
      </div>

      <div style={{ ...styles.card, marginBottom: 18 }}>
        <div style={{ ...styles.row, justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Today's Discipline Score</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: pct === 100 ? C.green : pct > 60 ? C.accent : C.primary }}>{pct}%</span>
        </div>
        <div style={styles.progress}>
          <div style={styles.progressFill(pct, pct === 100 ? C.green : pct > 60 ? C.accent : C.primary)} />
        </div>
        {pct === 100 && <div style={{ marginTop: 8, fontSize: 12, color: C.green }}>🔥 PERFECT DAY — You showed up fully today.</div>}
      </div>

      <div style={{ ...styles.row, justifyContent: "space-between", marginBottom: 10 }}>
        <div style={styles.h2}>Daily Habits</div>
        <button style={styles.btn} onClick={() => setShowAdd(!showAdd)}>+ Add Habit</button>
      </div>

      {showAdd && (
        <div style={{ ...styles.card, border: `1px solid ${habitError ? C.danger : C.primary}44`, marginBottom: 14 }}>
          <div style={styles.h3}>New Habit</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><label style={styles.label}>Name</label><input style={styles.input} value={newHabit.name} onChange={e => { setNewHabit(p => ({ ...p, name: e.target.value })); setHabitError(""); }} placeholder="Habit name" /></div>
            <div><label style={styles.label}>Category</label>
              <select style={styles.input} value={newHabit.category} onChange={e => { setNewHabit(p => ({ ...p, category: e.target.value })); setHabitError(""); }}>
                {["Body","Mind","Discipline","Health"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={styles.label}>Target</label><input style={styles.input} type="number" value={newHabit.target} onChange={e => { setNewHabit(p => ({ ...p, target: +e.target.value })); setHabitError(""); }} /></div>
            <div><label style={styles.label}>Unit</label><input style={styles.input} value={newHabit.unit} onChange={e => { setNewHabit(p => ({ ...p, unit: e.target.value })); setHabitError(""); }} placeholder="min / session / day" /></div>
          </div>
          {habitError && <div style={{ fontSize: 12, color: C.danger, marginBottom: 10, padding: "6px 10px", background: C.danger + "15", borderRadius: 4, borderLeft: `3px solid ${C.danger}` }}>⚠️ {habitError}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...styles.btn, opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }} onClick={addHabit} disabled={saving}>{saving ? "Saving..." : "Save Habit"}</button>
            <button style={styles.btnGhost} onClick={() => { setShowAdd(false); setHabitError(""); }} disabled={saving}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {habits.map(h => {
          const done    = !!h.completedDates?.includes(todayKey);
          const streak  = getStreak(h);
          const catColor = CAT_COLORS[h.category] || C.muted;
          return (
            <div key={h.id} style={{ ...styles.card, border: `1px solid ${done ? C.green + "55" : C.border}`, background: done ? C.green + "08" : C.card, display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
              <button onClick={() => toggle(h.id)} style={{ width: 28, height: 28, borderRadius: 6, border: `2px solid ${done ? C.green : C.border}`, background: done ? C.green : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s" }}>
                {done && <span style={{ fontSize: 14 }}>✓</span>}
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: done ? C.muted : C.text, textDecoration: done ? "line-through" : "none" }}>{h.name}</span>
                  <span style={styles.badge(catColor)}>{h.category}</span>
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{h.target} {h.unit} · 🔥 {streak} day streak</div>
              </div>
              <button onClick={() => deleteHabit(h.id)} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, padding: "0 4px" }}>🗑️</button>
            </div>
          );
        })}
      </div>

      <div style={{ ...styles.card, marginTop: 18 }}>
        <div style={styles.h3}>7-Day Completion Rate</div>
        <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 70 }}>
          {last7.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: "100%", height: `${d.pct * 0.6}px`, minHeight: 3, background: d.pct === 100 ? C.green : d.pct > 60 ? C.accent : C.primary, borderRadius: "3px 3px 0 0", transition: "height .4s" }} />
              <div style={{ fontSize: 9, color: C.muted }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 2 — 🧠 MINDSET
// ═══════════════════════════════════════════════════════════════════════════
const MINDSET_PRINCIPLES = [
  { icon: "🧱", title: "Hard things first", short: "Do the hardest task before 10am every single day.", detail: "The brain has the most prefrontal cortex activity in the morning. Willpower is finite — spend it on what matters most. Write your hardest task the night before. Don't check email or phone first. Attack the hard thing cold." },
  { icon: "🚫", title: "Eliminate excuses", short: "An excuse is the brain choosing comfort over growth.", detail: "Every time you make an excuse, you train your brain to quit. Replace 'I can't' with 'I haven't yet'. Replace 'I don't have time' with 'It's not a priority'. Every excuse is a choice. Own it or change it." },
  { icon: "🔁", title: "Identity-based habits", short: "You don't rise to your goals — you fall to your systems.", detail: "Focus on WHO you are becoming, not WHAT you want. 'I am the kind of person who trains every day.' Vote for your identity with every action. One small win is a vote. 100 votes = unshakeable identity." },
  { icon: "😰", title: "Embrace discomfort", short: "The discomfort you avoid is the growth you miss.", detail: "Cold showers, hard conversations, skipping junk food — these are reps in the gym of discipline. Each time you choose discomfort, you expand your comfort zone. The goal is to become someone who seeks discomfort." },
  { icon: "📵", title: "Kill dopamine leaks", short: "Social media, porn, sugar — all hijack your reward system.", detail: "Every time you get an easy dopamine hit, you reduce your ability to find motivation in harder, more meaningful tasks. Do a 30-day dopamine detox: no social media, no video games, no porn, minimal sugar. Reset your baseline." },
  { icon: "🎯", title: "One thing", short: "What is the ONE thing that if done, makes everything easier?", detail: "From 'The ONE Thing' by Gary Keller. Extraordinary results come from narrowed focus. Ask this question every morning. Write the answer. Execute. Saying no to good things to say yes to the one great thing is discipline." },
  { icon: "⏳", title: "Memento Mori", short: "You will die. So will everyone you love. What are you waiting for?", detail: "The Stoics used death as motivation. If you had 10 years left, would you spend today the same way? Most people live as if they have infinite time. Urgency is a superpower. Act with it." },
  { icon: "🪞", title: "Radical honesty", short: "The person holding you back has your face.", detail: "Stop blaming circumstance, people, the government, your upbringing. The most liberating realization: you are entirely responsible. That also means you have full power to change. No victim, no excuse, full agency." },
];

function MindsetTab() {
  const [expanded, setExpanded] = useState(null);
  const [mood, setMood]         = useLocalStorage("disc_daily_mood", {});
  const [affirmation, setAffirmation] = useLocalStorage("disc_affirmation", "");
  const [savedAffirmations, setSavedAffirmations] = useLocalStorage("disc_saved_affirmations", []);
  const [focusWord, setFocusWord] = useLocalStorage("disc_focus_word", "");
  const [tempFocus, setTempFocus] = useState(focusWord);

  const todayMood   = mood[today()] || 0;
  const MOODS = ["💀", "😤", "😐", "😤", "🔥", "⚡"];
  const MOOD_LABELS = ["Rock bottom", "Struggling", "Neutral", "Focused", "On fire", "Unstoppable"];

  const saveAffirmation = () => {
    if (!affirmation.trim()) return;
    setSavedAffirmations(prev => [{ id: uid(), text: affirmation, date: today() }, ...prev.slice(0, 9)]);
    setAffirmation("");
  };

  return (
    <div>
      <div style={{ ...styles.card, border: `1px solid ${C.primary}44`, marginBottom: 18 }}>
        <div style={styles.h3}>Daily Mental Check-In</div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>HOW IS YOUR MIND TODAY?</div>
          <div style={{ display: "flex", gap: 8 }}>
            {MOODS.map((m, i) => (
              <button key={i} onClick={() => setMood(prev => ({ ...prev, [today()]: i }))}
                style={{ flex: 1, padding: "10px 4px", borderRadius: 8, border: `2px solid ${todayMood === i ? C.primary : C.border}`, background: todayMood === i ? C.primary + "22" : C.surface, cursor: "pointer", fontSize: 18, transition: "all .2s" }}>
                {m}
              </button>
            ))}
          </div>
          {todayMood > 0 && <div style={{ marginTop: 6, fontSize: 12, color: C.accent, textAlign: "center" }}>{MOOD_LABELS[todayMood]}</div>}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={styles.label}>Today's Focus Word (one word)</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ ...styles.input, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 16, fontWeight: 700 }} value={tempFocus} onChange={e => setTempFocus(e.target.value)} placeholder="DISCIPLINE" maxLength={20} />
            <button style={styles.btn} onClick={() => setFocusWord(tempFocus)}>Set</button>
          </div>
          {focusWord && <div style={{ marginTop: 8, fontSize: 22, fontWeight: 700, color: C.primary, textAlign: "center", letterSpacing: "0.15em" }}>{focusWord.toUpperCase()}</div>}
        </div>
      </div>

      <div style={{ ...styles.card, marginBottom: 18 }}>
        <div style={styles.h3}>Power Affirmations</div>
        <textarea style={{ ...styles.input, height: 72, resize: "vertical", marginBottom: 8 }} value={affirmation} onChange={e => setAffirmation(e.target.value)} placeholder="I am disciplined. I do what needs to be done regardless of how I feel..." />
        <button style={styles.btn} onClick={saveAffirmation}>Save Affirmation</button>
        {savedAffirmations.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            {savedAffirmations.slice(0, 5).map(a => (
              <div key={a.id} style={{ background: C.surface, borderLeft: `3px solid ${C.primary}`, padding: "8px 12px", borderRadius: "0 6px 6px 0", fontSize: 12, color: C.muted }}>
                "{a.text}"
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.h2}>Mindset Principles</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {MINDSET_PRINCIPLES.map((p, i) => (
          <div key={i} style={{ ...styles.card, cursor: "pointer" }} onClick={() => setExpanded(expanded === i ? null : i)}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>{p.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{p.title}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{p.short}</div>
              </div>
              <span style={{ color: C.muted, fontSize: 14 }}>{expanded === i ? "▲" : "▼"}</span>
            </div>
            {expanded === i && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
                {p.detail}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 3 — ⏰ SCHEDULE (time blocking)
// ═══════════════════════════════════════════════════════════════════════════
const DEFAULT_BLOCKS = [
  { id: "t1", time: "05:00", label: "Wake up + cold shower", category: "Discipline", duration: 30 },
  { id: "t2", time: "05:30", label: "Exercise / Training", category: "Body", duration: 60 },
  { id: "t3", time: "07:00", label: "Breakfast + supplements", category: "Body", duration: 30 },
  { id: "t4", time: "07:30", label: "Deep work block 1 (hardest task)", category: "Work", duration: 120 },
  { id: "t5", time: "09:30", label: "Email + messages (batch)", category: "Work", duration: 30 },
  { id: "t6", time: "10:00", label: "Deep work block 2", category: "Work", duration: 90 },
  { id: "t7", time: "12:00", label: "Lunch + walk", category: "Body", duration: 45 },
  { id: "t8", time: "13:00", label: "Deep work block 3", category: "Work", duration: 120 },
  { id: "t9", time: "15:00", label: "Admin / calls / meetings", category: "Work", duration: 90 },
  { id: "t10", time: "17:00", label: "Learning / Reading", category: "Mind", duration: 60 },
  { id: "t11", time: "18:30", label: "Dinner", category: "Body", duration: 45 },
  { id: "t12", time: "19:30", label: "Family / relationships", category: "Life", duration: 90 },
  { id: "t13", time: "21:00", label: "Wind down — no screens", category: "Discipline", duration: 60 },
  { id: "t14", time: "22:00", label: "Sleep", category: "Body", duration: 420 },
];

const BLOCK_COLORS = { Discipline: C.primary, Body: C.cyan, Work: C.accent, Mind: C.purple, Life: C.green };

function ScheduleTab() {
  const [blocks, setBlocks]     = useLocalStorage("disc_schedule", DEFAULT_BLOCKS);
  const [completed, setCompleted] = useLocalStorage("disc_schedule_done", {});
  const [showAdd, setShowAdd]   = useState(false);
  const [newBlock, setNewBlock] = useState({ time: "08:00", label: "", category: "Work", duration: 60 });

  const todayKey = today();
  const toggleBlock = (id) => setCompleted(prev => ({ ...prev, [todayKey]: { ...(prev[todayKey] || {}), [id]: !(prev[todayKey]?.[id]) } }));

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const isCurrentBlock = (block) => {
    const [bh, bm] = block.time.split(":").map(Number);
    const blockStart = bh * 60 + bm;
    const blockEnd   = blockStart + block.duration;
    const nowMins    = now.getHours() * 60 + now.getMinutes();
    return nowMins >= blockStart && nowMins < blockEnd;
  };

  const donePct = Math.round((blocks.filter(b => completed[todayKey]?.[b.id]).length / blocks.length) * 100);

  return (
    <div>
      <div style={styles.statRow}>
        <div style={styles.statCard}><div style={{ ...styles.statNum, color: C.primary }}>{blocks.filter(b => completed[todayKey]?.[b.id]).length}</div><div style={styles.statLabel}>Done Today</div></div>
        <div style={styles.statCard}><div style={{ ...styles.statNum, color: C.accent }}>{donePct}%</div><div style={styles.statLabel}>Day Used</div></div>
        <div style={styles.statCard}><div style={{ ...styles.statNum, color: C.cyan }}>{blocks.length}</div><div style={styles.statLabel}>Blocks</div></div>
        <div style={styles.statCard}><div style={{ ...styles.statNum, color: C.green }}>{Math.round(blocks.reduce((s, b) => s + b.duration, 0) / 60)}h</div><div style={styles.statLabel}>Planned</div></div>
      </div>

      <div style={{ ...styles.row, justifyContent: "space-between", marginBottom: 10 }}>
        <div style={styles.h2}>Time Blocks</div>
        <button style={styles.btn} onClick={() => setShowAdd(!showAdd)}>+ Add Block</button>
      </div>

      {showAdd && (
        <div style={{ ...styles.card, border: `1px solid ${C.primary}44`, marginBottom: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><label style={styles.label}>Time</label><input style={styles.input} type="time" value={newBlock.time} onChange={e => setNewBlock(p => ({ ...p, time: e.target.value }))} /></div>
            <div><label style={styles.label}>Duration (min)</label><input style={styles.input} type="number" value={newBlock.duration} onChange={e => setNewBlock(p => ({ ...p, duration: +e.target.value }))} /></div>
            <div style={{ gridColumn: "1/-1" }}><label style={styles.label}>Label</label><input style={styles.input} value={newBlock.label} onChange={e => setNewBlock(p => ({ ...p, label: e.target.value }))} placeholder="Block name" /></div>
            <div><label style={styles.label}>Category</label>
              <select style={styles.input} value={newBlock.category} onChange={e => setNewBlock(p => ({ ...p, category: e.target.value }))}>
                {Object.keys(BLOCK_COLORS).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <button style={styles.btn} onClick={() => { if (!newBlock.label.trim()) return; setBlocks(prev => [...prev, { ...newBlock, id: uid() }].sort((a,b) => a.time.localeCompare(b.time))); setShowAdd(false); }}>Save Block</button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {blocks.sort((a,b) => a.time.localeCompare(b.time)).map(b => {
          const done    = !!completed[todayKey]?.[b.id];
          const current = isCurrentBlock(b);
          const color   = BLOCK_COLORS[b.category] || C.muted;
          return (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: `1px solid ${current ? C.primary : done ? C.green + "44" : C.border}`, background: current ? C.primary + "11" : done ? C.green + "08" : C.card, cursor: "pointer", transition: "all .2s" }} onClick={() => toggleBlock(b.id)}>
              <div style={{ width: 44, fontSize: 11, color: C.muted, flexShrink: 0 }}>{b.time}</div>
              <div style={{ width: 4, height: 32, borderRadius: 2, background: color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: done ? C.muted : C.text, textDecoration: done ? "line-through" : "none" }}>{b.label}</div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{b.duration}min · {b.category}{current ? " · 🔴 NOW" : ""}</div>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${done ? C.green : C.border}`, background: done ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {done && <span style={{ fontSize: 11 }}>✓</span>}
              </div>
              <button onClick={e => { e.stopPropagation(); setBlocks(prev => prev.filter(x => x.id !== b.id)); }} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 12 }}>🗑️</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 4 — 🎯 GOALS
// ═══════════════════════════════════════════════════════════════════════════
const HORIZONS = ["90 Days", "1 Year", "5 Years", "Life"];
const AREAS    = ["Career", "Health", "Finance", "Relationships", "Skills", "Mindset", "Adventure", "Legacy"];

function GoalsTab() {
  const [goals, setGoals] = useLocalStorage("disc_goals", [
    { id: "g1", title: "Run a sub-40min 10K", area: "Health", horizon: "90 Days", why: "To prove I can push my limits", milestones: ["Run 5K in under 25min", "Build to 40km/week", "Race day"], progress: 0, status: "active" },
    { id: "g2", title: "Read 24 books this year", area: "Skills", horizon: "1 Year", why: "Knowledge compounds like interest", milestones: ["Finish 6 by March", "12 by June", "24 by Dec"], progress: 20, status: "active" },
    { id: "g3", title: "Build financial independence", area: "Finance", horizon: "5 Years", why: "Freedom over time > salary", milestones: ["6 months emergency fund", "Invest 20% income", "Build side income to $2K/mo"], progress: 10, status: "active" },
  ]);
  const [showAdd, setShowAdd]  = useState(false);
  const [activeHorizon, setActiveHorizon] = useState("90 Days");
  const [newGoal, setNewGoal]  = useState({ title: "", area: "Career", horizon: "90 Days", why: "", milestones: ["", "", ""], progress: 0 });
  const [expanded, setExpanded] = useState(null);

  const filtered = goals.filter(g => g.horizon === activeHorizon);

  const addGoal = () => {
    if (!newGoal.title.trim()) return;
    setGoals(prev => [...prev, { ...newGoal, id: uid(), milestones: newGoal.milestones.filter(m => m.trim()), status: "active" }]);
    setNewGoal({ title: "", area: "Career", horizon: "90 Days", why: "", milestones: ["", "", ""], progress: 0 });
    setShowAdd(false);
  };

  const updateProgress = (id, val) => setGoals(prev => prev.map(g => g.id === id ? { ...g, progress: Math.max(0, Math.min(100, +val)) } : g));
  const deleteGoal     = (id) => setGoals(prev => prev.filter(g => g.id !== id));
  const completeGoal   = (id) => setGoals(prev => prev.map(g => g.id === id ? { ...g, status: "done", progress: 100 } : g));

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {HORIZONS.map(h => (
          <button key={h} style={activeHorizon === h ? { ...styles.tabActive, padding: "6px 14px" } : { ...styles.tabInactive, padding: "6px 14px" }} onClick={() => setActiveHorizon(h)}>{h}</button>
        ))}
        <button style={{ ...styles.btn, marginLeft: "auto" }} onClick={() => setShowAdd(!showAdd)}>+ New Goal</button>
      </div>

      {showAdd && (
        <div style={{ ...styles.card, border: `1px solid ${C.primary}44`, marginBottom: 14 }}>
          <div style={styles.h3}>New Goal</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div style={{ gridColumn: "1/-1" }}><label style={styles.label}>Goal Title</label><input style={styles.input} value={newGoal.title} onChange={e => setNewGoal(p => ({ ...p, title: e.target.value }))} placeholder="What do you want to achieve?" /></div>
            <div><label style={styles.label}>Area</label>
              <select style={styles.input} value={newGoal.area} onChange={e => setNewGoal(p => ({ ...p, area: e.target.value }))}>
                {AREAS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div><label style={styles.label}>Horizon</label>
              <select style={styles.input} value={newGoal.horizon} onChange={e => setNewGoal(p => ({ ...p, horizon: e.target.value }))}>
                {HORIZONS.map(h => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1/-1" }}><label style={styles.label}>Why does this matter?</label><textarea style={{ ...styles.input, height: 60, resize: "vertical" }} value={newGoal.why} onChange={e => setNewGoal(p => ({ ...p, why: e.target.value }))} placeholder="Your deep reason..." /></div>
            {[0, 1, 2].map(i => (
              <div key={i}><label style={styles.label}>Milestone {i+1}</label><input style={styles.input} value={newGoal.milestones[i]} onChange={e => { const ms = [...newGoal.milestones]; ms[i] = e.target.value; setNewGoal(p => ({ ...p, milestones: ms })); }} placeholder={`Step ${i+1}`} /></div>
            ))}
          </div>
          <button style={styles.btn} onClick={addGoal}>Create Goal</button>
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", color: C.muted, padding: "40px 0", fontSize: 13 }}>No goals set for this horizon yet.<br />Create your first {activeHorizon} goal above.</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(g => (
          <div key={g.id} style={{ ...styles.card, border: `1px solid ${g.status === "done" ? C.green + "55" : C.border}`, cursor: "pointer" }} onClick={() => setExpanded(expanded === g.id ? null : g.id)}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: g.status === "done" ? C.green : C.text }}>{g.title}</span>
                  {g.status === "done" && <span style={styles.badge(C.green)}>DONE ✓</span>}
                  <span style={styles.badge(CAT_COLORS[g.area] || C.muted)}>{g.area}</span>
                </div>
                <div style={styles.progress}><div style={styles.progressFill(g.progress, g.progress === 100 ? C.green : g.progress > 50 ? C.accent : C.primary)} /></div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{g.progress}% complete</div>
              </div>
              <span style={{ color: C.muted, fontSize: 12 }}>{expanded === g.id ? "▲" : "▼"}</span>
            </div>

            {expanded === g.id && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                {g.why && <div style={{ fontSize: 12, color: C.accent, marginBottom: 10, fontStyle: "italic" }}>"{g.why}"</div>}
                {g.milestones?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, textTransform: "uppercase" }}>Milestones</div>
                    {g.milestones.map((m, i) => (
                      <div key={i} style={{ fontSize: 12, color: C.muted, padding: "4px 0", borderBottom: `1px solid ${C.border}33` }}>▸ {m}</div>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <label style={{ ...styles.label, margin: 0 }}>Progress:</label>
                  <input type="range" min={0} max={100} value={g.progress} onChange={e => updateProgress(g.id, e.target.value)} style={{ flex: 1, accentColor: C.primary }} />
                  <span style={{ fontSize: 12, color: C.primary, width: 36 }}>{g.progress}%</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button style={styles.btn} onClick={e => { e.stopPropagation(); completeGoal(g.id); }}>Mark Complete</button>
                  <button style={styles.btnGhost} onClick={e => { e.stopPropagation(); deleteGoal(g.id); }}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 5 — 📓 JOURNAL
// ═══════════════════════════════════════════════════════════════════════════
const JOURNAL_PROMPTS = [
  "What is the hardest thing I avoided today — and why?",
  "What would the best version of me have done differently?",
  "What am I grateful for right now, specifically?",
  "What excuse did I make today that I need to kill?",
  "What is one thing I will do tomorrow that scares me?",
  "Who did I show up for today — including myself?",
  "What habit am I building, and what evidence did I create today?",
  "What negative thought pattern am I running — and what is the counter?",
];

function JournalTab() {
  const [entries, setEntries] = useLocalStorage("disc_journal", []);
  const [draft, setDraft]     = useState({ gratitude: "", wins: "", hard: "", tomorrow: "", mood: 3 });
  const [freeform, setFreeform] = useState("");
  const [mode, setMode]       = useState("structured");
  const [prompt, setPrompt]   = useState(0);
  const [viewEntry, setViewEntry] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");

  const shufflePrompt = () => setPrompt(Math.floor(Math.random() * JOURNAL_PROMPTS.length));

  const saveEntry = () => {
    const text = mode === "structured"
      ? `GRATITUDE: ${draft.gratitude}\n\nWINS: ${draft.wins}\n\nHARD THING: ${draft.hard}\n\nTOMORROW: ${draft.tomorrow}`
      : freeform;
    if (!text.trim()) return;

    const entry = {
      id: uid(),
      date: today(),
      text,
      mood: draft.mood,
      mode,
      prompt: JOURNAL_PROMPTS[prompt],
      timestamp: Date.now(),
    };

    setEntries(prev => [entry, ...prev]);
    setDraft({ gratitude: "", wins: "", hard: "", tomorrow: "", mood: 3 });
    setFreeform("");
    setSaveMessage("Reflection saved.");
    window.setTimeout(() => setSaveMessage(""), 2500);
  };

  const todayEntry = entries.find(e => e.date === today());
  const MOOD_ICONS = ["💀", "😤", "😐", "🔥", "⚡"];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["structured", "freeform"].map(m => (
          <button key={m} style={mode === m ? styles.tabActive : styles.tabInactive} onClick={() => setMode(m)}>
            {m === "structured" ? "📋 Structured" : "✍️ Freeform"}
          </button>
        ))}
      </div>

      {todayEntry && (
        <div style={{ ...styles.card, border: `1px solid ${C.border}`, marginBottom: 14, background: C.surface, borderRadius: 4 }}>
          <div style={{ fontSize: 12, color: C.green }}>✓ Today's journal logged — {new Date(todayEntry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
      )}

      {mode === "structured" ? (
        <div style={{ ...styles.card, borderRadius: 4, background: C.surface, padding: 14 }}>
          <div style={styles.h3}>Daily Reflection</div>
          <div style={{ marginBottom: 8 }}>
            <label style={styles.label}>3 things I'm grateful for today</label>
            <textarea style={{ ...styles.input, height: 60, resize: "vertical" }} value={draft.gratitude} onChange={e => setDraft(p => ({ ...p, gratitude: e.target.value }))} placeholder="Be specific. Not 'health' — 'I can run without pain.'" />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={styles.label}>Today's wins (big or small)</label>
            <textarea style={{ ...styles.input, height: 60, resize: "vertical" }} value={draft.wins} onChange={e => setDraft(p => ({ ...p, wins: e.target.value }))} placeholder="What did you execute well?" />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={styles.label}>What was hard? What did I learn?</label>
            <textarea style={{ ...styles.input, height: 60, resize: "vertical" }} value={draft.hard} onChange={e => setDraft(p => ({ ...p, hard: e.target.value }))} placeholder="Be brutally honest." />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={styles.label}>One commitment for tomorrow</label>
            <input style={styles.input} value={draft.tomorrow} onChange={e => setDraft(p => ({ ...p, tomorrow: e.target.value }))} placeholder="One specific action, no vagueness." />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={styles.label}>Mood</label>
            <div style={{ display: "flex", gap: 8 }}>
              {MOOD_ICONS.map((m, i) => (
                <button key={i} onClick={() => setDraft(p => ({ ...p, mood: i }))}
                  style={{ flex: 1, padding: "8px 4px", borderRadius: 6, border: `2px solid ${draft.mood === i ? C.primary : C.border}`, background: draft.mood === i ? C.primary + "22" : C.surface, cursor: "pointer", fontSize: 18 }}>{m}</button>
              ))}
            </div>
          </div>
          <button style={styles.btn} onClick={saveEntry}>Save Reflection</button>
        </div>
      ) : (
        <div style={{ ...styles.card, borderRadius: 4, background: C.surface, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={styles.h3}>Free Writing</div>
            <button style={styles.btnGhost} onClick={shufflePrompt}>Next prompt</button>
          </div>
          <div style={{ border: `1px solid ${C.border}`, marginBottom: 12, padding: 12, borderRadius: 6, background: C.surface }}>
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>&quot;{JOURNAL_PROMPTS[prompt]}&quot;</div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={styles.label}>Your response</label>
            <textarea style={{ ...styles.input, height: 180, resize: "vertical" }} value={freeform} onChange={e => setFreeform(e.target.value)} placeholder="Write without filtering. Don't edit. Just think on paper." />
          </div>
          <button style={{ ...styles.btn, width: "100%" }} onClick={saveEntry}>Save Reflection</button>
          {saveMessage && <div style={{ marginTop: 10, fontSize: 12, color: C.accent }}>{saveMessage}</div>}
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <div style={styles.h2}>Past Entries ({entries.length})</div>
        {entries.slice(0, 10).map(e => (
          <div key={e.id} style={{ ...styles.card, cursor: "pointer" }} onClick={() => setViewEntry(viewEntry === e.id ? null : e.id)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 12, color: C.muted }}>{fmtDate(e.date)}</span>
                <span style={{ marginLeft: 8, fontSize: 16 }}>{MOOD_ICONS[e.mood] || "📓"}</span>
                <span style={{ ...styles.badge(C.muted), marginLeft: 8 }}>{e.mode}</span>
              </div>
              <span style={{ color: C.muted, fontSize: 11 }}>{viewEntry === e.id ? "▲" : "▼"}</span>
            </div>
            {viewEntry === e.id && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.muted, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                {e.prompt && <div style={{ marginBottom: 8, fontSize: 11, color: C.accent }}>Prompt: "{e.prompt}"</div>}
                {e.text}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 6 — ⚡ DISCIPLINE SCORE
// ═══════════════════════════════════════════════════════════════════════════
function ScoreTab() {
  const [habits, ]          = useLocalStorage("disc_habits", DEFAULT_HABITS);
  const [completions, ]     = useLocalStorage("disc_habit_completions", {});
  const [sched, ]           = useLocalStorage("disc_schedule", DEFAULT_BLOCKS);
  const [schedDone, ]       = useLocalStorage("disc_schedule_done", {});
  const [journalEntries, ]  = useLocalStorage("disc_journal", []);
  const [goals, ]           = useLocalStorage("disc_goals", []);

  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    const k = d.toISOString().slice(0, 10);
    const habitScore   = habits.length ? habits.filter(h => completions[k]?.[h.id]).length / habits.length * 40 : 0;
    const schedScore   = sched.length ? sched.filter(b => schedDone[k]?.[b.id]).length / sched.length * 30 : 0;
    const journalScore = journalEntries.some(e => e.date === k) ? 20 : 0;
    const total = Math.round(habitScore + schedScore + journalScore);
    return { k, day: fmtDay(k), date: fmtDate(k), score: total };
  });

  const todayScore  = last30[last30.length - 1].score;
  const avgScore    = Math.round(last30.reduce((s, d) => s + d.score, 0) / 30);
  const perfectDays = last30.filter(d => d.score >= 80).length;
  const streak      = (() => {
    let s = 0;
    for (let i = last30.length - 1; i >= 0; i--) {
      if (last30[i].score >= 60) s++; else break;
    }
    return s;
  })();

  const levelMap = [
    { min: 0,  max: 19,  label: "UNDISCIPLINED", color: C.danger,  icon: "💀" },
    { min: 20, max: 39,  label: "INCONSISTENT",  color: C.muted,   icon: "😤" },
    { min: 40, max: 59,  label: "BUILDING",      color: C.accent,  icon: "🔨" },
    { min: 60, max: 79,  label: "DISCIPLINED",   color: C.cyan,    icon: "🎯" },
    { min: 80, max: 94,  label: "ELITE",         color: C.green,   icon: "🔥" },
    { min: 95, max: 100, label: "MONK MODE",     color: C.primary, icon: "⚡" },
  ];
  const level    = levelMap.find(l => todayScore >= l.min && todayScore <= l.max) || levelMap[0];
  const avgLevel = levelMap.find(l => avgScore >= l.min && avgScore <= l.max) || levelMap[0];

  const R = 70, cx = 90, cy = 90, strokeW = 10;
  const circumference = 2 * Math.PI * R;
  const dash = (circumference * todayScore) / 100;

  return (
    <div>
      <div style={{ ...styles.card, textAlign: "center", padding: "28px 16px", background: `linear-gradient(135deg, ${C.card} 0%, ${level.color}11 100%)`, border: `1px solid ${level.color}44`, marginBottom: 18 }}>
        <svg width={180} height={180} style={{ display: "block", margin: "0 auto" }}>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.border} strokeWidth={strokeW} />
          <circle cx={cx} cy={cy} r={R} fill="none" stroke={level.color} strokeWidth={strokeW}
            strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: "stroke-dasharray 1s ease" }} />
          <text x={cx} y={cy - 8} textAnchor="middle" fill={level.color} fontSize={36} fontWeight={700} fontFamily="DM Mono, monospace">{todayScore}</text>
          <text x={cx} y={cy + 16} textAnchor="middle" fill={C.muted} fontSize={11} fontFamily="DM Mono, monospace">TODAY</text>
          <text x={cx} y={cy + 34} textAnchor="middle" fill={level.color} fontSize={13} fontWeight={700} fontFamily="DM Mono, monospace">{level.icon} {level.label}</text>
        </svg>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>Score = Habits (40pts) + Schedule (30pts) + Journal (20pts)</div>
      </div>

      <div style={styles.statRow}>
        <div style={styles.statCard}><div style={{ ...styles.statNum, color: avgLevel.color }}>{avgScore}</div><div style={styles.statLabel}>30-Day Avg</div></div>
        <div style={styles.statCard}><div style={{ ...styles.statNum, color: C.primary }}>{streak}</div><div style={styles.statLabel}>Day Streak ≥60</div></div>
        <div style={styles.statCard}><div style={{ ...styles.statNum, color: C.green }}>{perfectDays}</div><div style={styles.statLabel}>Elite Days (≥80)</div></div>
        <div style={styles.statCard}><div style={{ ...styles.statNum, color: C.cyan }}>{goals.filter(g => g.status === "done").length}</div><div style={styles.statLabel}>Goals Done</div></div>
      </div>

      <div style={{ ...styles.card, marginBottom: 18 }}>
        <div style={styles.h3}>30-Day Score History</div>
        <svg width="100%" height={100} viewBox={`0 0 ${last30.length * 14} 100`} preserveAspectRatio="none">
          {last30.map((d, i) => {
            const lv = levelMap.find(l => d.score >= l.min && d.score <= l.max) || levelMap[0];
            const h = d.score;
            return <rect key={i} x={i * 14} y={100 - h} width={11} height={h} fill={lv.color} rx={2} opacity={i === 29 ? 1 : 0.6} />;
          })}
          <line x1={0} y1={40} x2={last30.length * 14} y2={40} stroke={C.cyan} strokeDasharray="3 3" strokeWidth={1} opacity={0.5} />
          <line x1={0} y1={20} x2={last30.length * 14} y2={20} stroke={C.green} strokeDasharray="3 3" strokeWidth={1} opacity={0.5} />
        </svg>
        <div style={{ display: "flex", gap: 16, marginTop: 6, justifyContent: "flex-end" }}>
          <span style={{ fontSize: 10, color: C.cyan }}>— 60 Disciplined</span>
          <span style={{ fontSize: 10, color: C.green }}>— 80 Elite</span>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.h3}>Score Levels</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {levelMap.map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 10px", borderRadius: 6, background: level.label === l.label ? l.color + "15" : "transparent", border: `1px solid ${level.label === l.label ? l.color + "44" : "transparent"}` }}>
              <span style={{ fontSize: 16 }}>{l.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: l.color }}>{l.label}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{l.min}–{l.max} points</div>
              </div>
              {level.label === l.label && <span style={styles.badge(l.color)}>YOU</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN DisciplineSection
// ═══════════════════════════════════════════════════════════════════════════
export default function DisciplineSection() {
  const [activeTab, setActiveTab] = useLocalStorage("disc_active_tab", "habits");

  const tabComponents = {
    habits:   <HabitsTab />,
    mindset:  <MindsetTab />,
    schedule: <ScheduleTab />,
    goals:    <GoalsTab />,
    journal:  <JournalTab />,
    score:    <ScoreTab />,
  };

  return (
    <div style={styles.wrap}>
      <div style={{ marginBottom: 22, borderBottom: `1px solid ${C.border}`, paddingBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⚡</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: C.text }}>DISCIPLINE SYSTEM</div>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Build who you want to become</div>
          </div>
        </div>
      </div>

      <div style={styles.tabs}>
        {TABS.map(t => (
          <button key={t.id} style={activeTab === t.id ? styles.tabActive : styles.tabInactive} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tabComponents[activeTab]}
    </div>
  );
}
