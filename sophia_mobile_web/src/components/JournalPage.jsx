import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { renderIcon, FlameIcon, LightbulbIcon } from './SophiaIcons.jsx';
import api from '../services/api.js';

// ── useLocalStorage hook ──
function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; }
    catch { return initial; }
  });
  const set = useCallback((v) => {
    const next = typeof v === 'function' ? v(val) : v;
    setVal(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
  }, [key, val]);
  return [val, set];
}

const uid = () => Math.random().toString(36).slice(2, 9);
const toDateKey = (d) => d.toISOString().slice(0, 10);
const today = () => toDateKey(new Date());

const MOODS = [
  { emoji: '😊', label: 'Great',   value: 5 },
  { emoji: '🙂', label: 'Good',    value: 4 },
  { emoji: '😐', label: 'Okay',    value: 3 },
  { emoji: '😔', label: 'Low',     value: 2 },
  { emoji: '😢', label: 'Rough',   value: 1 },
];

const PROMPTS = [
  'What are you grateful for today?',
  'What challenged you today and how did you handle it?',
  'What is one thing you learned today?',
  'Describe a moment today that made you smile.',
  'What would you do differently if you could redo today?',
  'What is weighing on your mind right now?',
  'Write about a goal you are working towards.',
  'What drained your energy today? What restored it?',
  'Who made a positive impact on your day?',
  'If today had a title, what would it be?',
  'What are three things you accomplished today?',
  'What intentions do you want to set for tomorrow?',
];

const TAGS = ['Gratitude', 'Goals', 'Reflection', 'Growth', 'Health', 'Relationships', 'Work', 'Creativity'];

const C = {
  bg: '#0d1117', surface: '#161b22', card: '#1c2129',
  border: '#30363d', borderSubtle: '#21262d',
  accent: '#7b68ee', accentDim: 'rgba(123,104,238,0.12)',
  green: '#3fb950', yellow: '#d29922', red: '#f85149',
  text: '#c9d1d9', muted: '#8b949e',
};

const S = {
  page: { color: C.text, fontFamily: "'Inter', system-ui, sans-serif", paddingBottom: 40 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  h1: { fontSize: 22, fontWeight: 600, margin: 0, color: C.text },
  streakBadge: { display: 'inline-flex', alignItems: 'center', gap: 6, background: C.accentDim, color: C.accent, borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 600 },
  statusBar: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 },
  statCard: { background: C.surface, border: `1px solid ${C.borderSubtle}`, borderRadius: 10, padding: '14px 16px', textAlign: 'center' },
  statNum: { fontSize: 22, fontWeight: 700, lineHeight: 1 },
  statLabel: { fontSize: 11, color: C.muted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' },
  todayCard: { background: C.surface, border: `1px solid ${C.borderSubtle}`, borderRadius: 12, padding: 20, marginBottom: 20 },
  todayHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: 600, margin: 0 },
  checkMark: (done) => ({ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: done ? C.green : C.borderSubtle, color: done ? '#000' : C.muted, fontWeight: 700, transition: 'all .2s' }),
  promptBox: { background: C.card, border: `1px solid ${C.borderSubtle}`, borderRadius: 8, padding: 14, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  promptText: { fontSize: 14, color: C.muted, fontStyle: 'italic', flex: 1 },
  refreshBtn: { background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 16, padding: 4 },
  moodRow: { display: 'flex', gap: 8, marginBottom: 16 },
  moodBtn: (active) => ({ flex: 1, padding: '10px 0', borderRadius: 8, border: `1px solid ${active ? C.accent : C.borderSubtle}`, background: active ? C.accentDim : 'transparent', cursor: 'pointer', textAlign: 'center', transition: 'all .12s' }),
  moodEmoji: { fontSize: 22, display: 'block' },
  moodLabel: { fontSize: 10, color: active => active ? C.accent : C.muted, marginTop: 4 },
  textarea: { width: '100%', minHeight: 140, background: C.card, border: `1px solid ${C.borderSubtle}`, borderRadius: 8, color: C.text, padding: 14, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box' },
  tagsRow: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12, marginBottom: 14 },
  tag: (active) => ({ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: `1px solid ${active ? C.accent : C.borderSubtle}`, background: active ? C.accentDim : 'transparent', color: active ? C.accent : C.muted, transition: 'all .12s' }),
  saveBtn: { width: '100%', padding: '12px 0', borderRadius: 8, border: 'none', background: C.accent, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8, transition: 'all .12s' },
  saveBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 20 },
  calDay: (filled, isToday) => ({ width: '100%', aspectRatio: '1', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: isToday ? 700 : 400, background: filled ? C.accentDim : C.card, border: `1px solid ${isToday ? C.accent : C.borderSubtle}`, color: filled ? C.accent : C.muted, cursor: 'pointer', transition: 'all .12s' }),
  entryCard: { background: C.surface, border: `1px solid ${C.borderSubtle}`, borderRadius: 10, padding: 16, marginBottom: 10, cursor: 'pointer', transition: 'all .12s' },
  entryDate: { fontSize: 12, color: C.muted, marginBottom: 4 },
  entryPreview: { fontSize: 14, color: C.text, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
  entryTags: { display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' },
  miniTag: { fontSize: 10, padding: '2px 8px', borderRadius: 10, background: C.accentDim, color: C.accent },
  emptyState: { textAlign: 'center', padding: '40px 20px', color: C.muted },
  viewToggle: { display: 'flex', gap: 4, background: C.card, borderRadius: 8, padding: 3 },
  viewBtn: (active) => ({ padding: '6px 14px', borderRadius: 6, border: 'none', background: active ? C.accent : 'transparent', color: active ? '#fff' : C.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .12s' }),
};

export default function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('write');          // write | history | calendar
  const [selectedMood, setSelectedMood] = useState(null);
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [promptIdx, setPromptIdx] = useState(() => new Date().getDate() % PROMPTS.length);
  const [expandedEntry, setExpandedEntry] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load journal entries from database
  useEffect(() => {
    const loadEntries = async () => {
      try {
        setLoading(true);
        const data = await api.getJournalEntries();
        setEntries(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load journal entries:', error);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };
    loadEntries();
  }, []);

  // ── Derived data ──
  const todayKey = today();

  const todayEntry = useMemo(
    () => entries.find((e) => e.date === todayKey),
    [entries, todayKey]
  );

  const isTodayFilled = !!todayEntry;

  const streak = useMemo(() => {
    let count = 0;
    const d = new Date();
    while (true) {
      const key = toDateKey(d);
      if (entries.some((e) => e.date === key)) { count++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return count;
  }, [entries]);

  const totalWords = useMemo(
    () => entries.reduce((sum, e) => sum + (e.content || '').split(/\s+/).filter(Boolean).length, 0),
    [entries]
  );

  const avgMood = useMemo(() => {
    const mooded = entries.filter((e) => e.mood);
    if (!mooded.length) return null;
    return (mooded.reduce((s, e) => s + e.mood, 0) / mooded.length).toFixed(1);
  }, [entries]);

  // ── Calendar data ──
  const calendarDays = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, key, filled: entries.some((e) => e.date === key), isToday: key === todayKey });
    }
    return days;
  }, [entries, todayKey]);

  const filteredEntries = useMemo(() => {
    let list = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e) =>
        (e.content || '').toLowerCase().includes(q)
        || (e.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [entries, searchQuery]);

  // ── Actions ──
  const shufflePrompt = () => setPromptIdx((i) => (i + 1) % PROMPTS.length);

  const toggleTag = (tag) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const saveEntry = async () => {
    if (!content.trim() || saving) return;

    try {
      setSaving(true);
      const entryData = {
        content: content.trim(),
        mood: selectedMood,
        tags: selectedTags,
        wordCount: content.trim().split(/\s+/).filter(Boolean).length,
        date: todayKey,
      };

      await api.createJournalEntry(entryData);

      // Reload entries from database
      const updatedEntries = await api.getJournalEntries();
      setEntries(Array.isArray(updatedEntries) ? updatedEntries : []);

      setContent('');
      setSelectedMood(null);
      setSelectedTags([]);
      setView('history');
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      // Could show an error message to user here
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id) => {
    try {
      await api.deleteJournalEntry(id);
      // Reload entries from database
      const updatedEntries = await api.getJournalEntries();
      setEntries(Array.isArray(updatedEntries) ? updatedEntries : []);
      setExpandedEntry(null);
    } catch (error) {
      console.error('Failed to delete journal entry:', error);
    }
  };

  const canSave = content.trim().length > 0;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <h1 style={{...S.h1, display:'flex', alignItems:'center', gap:'8px'}}>{renderIcon('📊', 22)} Journal</h1>
        <div style={{...S.streakBadge, display:'flex', alignItems:'center', gap:'4px'}}><FlameIcon size={16} /> {streak} day streak</div>
      </div>

      {/* Stats */}
      <div style={S.statusBar}>
        <div style={S.statCard}>
          <div style={{ ...S.statNum, color: isTodayFilled ? C.green : C.yellow }}>
            {isTodayFilled ? '✓' : '○'}
          </div>
          <div style={S.statLabel}>Today</div>
        </div>
        <div style={S.statCard}>
          <div style={{ ...S.statNum, color: C.accent }}>{entries.length}</div>
          <div style={S.statLabel}>Entries</div>
        </div>
        <div style={S.statCard}>
          <div style={{ ...S.statNum, color: C.accent }}>{totalWords.toLocaleString()}</div>
          <div style={S.statLabel}>Words</div>
        </div>
        <div style={S.statCard}>
          <div style={{ ...S.statNum, color: C.accent }}>{avgMood || '—'}</div>
          <div style={S.statLabel}>Avg Mood</div>
        </div>
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={S.viewToggle}>
          <button style={S.viewBtn(view === 'write')} onClick={() => setView('write')}>✏️ Write</button>
          <button style={S.viewBtn(view === 'history')} onClick={() => setView('history')}>📖 History</button>
          <button style={S.viewBtn(view === 'calendar')} onClick={() => setView('calendar')}>📅 Calendar</button>
        </div>
        {isTodayFilled && view === 'write' && (
          <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>✓ Today's entry saved</span>
        )}
      </div>

      {/* ═══ WRITE VIEW ═══ */}
      {view === 'write' && (
        <div style={S.todayCard}>
          <div style={S.todayHeader}>
            <h2 style={S.sectionTitle}>
              {isTodayFilled ? 'Update Today\'s Entry' : 'Write Today\'s Entry'}
            </h2>
            <div style={S.checkMark(isTodayFilled)}>
              {isTodayFilled ? '✓' : '?'}
            </div>
          </div>

          {/* Daily prompt */}
          <div style={S.promptBox}>
            <span style={{...S.promptText, display:'flex', alignItems:'center', gap:'6px'}}><LightbulbIcon size={16} /> {PROMPTS[promptIdx]}</span>
            <button style={S.refreshBtn} onClick={shufflePrompt} title="New prompt">🔄</button>
          </div>

          {/* Mood selector */}
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            How are you feeling?
          </div>
          <div style={S.moodRow}>
            {MOODS.map((m) => (
              <button
                key={m.value}
                style={S.moodBtn(selectedMood === m.value)}
                onClick={() => setSelectedMood(selectedMood === m.value ? null : m.value)}
              >
                <span style={S.moodEmoji}>{m.emoji}</span>
                <div style={{ fontSize: 10, color: selectedMood === m.value ? C.accent : C.muted, marginTop: 4 }}>{m.label}</div>
              </button>
            ))}
          </div>

          {/* Text area */}
          <textarea
            style={S.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write about your day..."
          />

          {/* Word count */}
          <div style={{ fontSize: 11, color: C.muted, marginTop: 6, textAlign: 'right' }}>
            {content.trim().split(/\s+/).filter(Boolean).length} words
          </div>

          {/* Tags */}
          <div style={{ fontSize: 12, color: C.muted, marginTop: 12, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Tags
          </div>
          <div style={S.tagsRow}>
            {TAGS.map((tag) => (
              <button key={tag} style={S.tag(selectedTags.includes(tag))} onClick={() => toggleTag(tag)}>
                {tag}
              </button>
            ))}
          </div>

          {/* Save */}
          <button
            style={{ ...S.saveBtn, ...(canSave && !saving ? {} : S.saveBtnDisabled) }}
            onClick={saveEntry}
            disabled={!canSave || saving}
          >
            {saving ? 'Saving...' : (isTodayFilled ? 'Update Entry' : 'Save Entry')}
          </button>
        </div>
      )}

      {/* ═══ HISTORY VIEW ═══ */}
      {view === 'history' && (
        <div>
          {/* Search */}
          <input
            style={{ ...S.textarea, minHeight: 38, padding: '8px 14px', marginBottom: 16 }}
            placeholder="🔍 Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {filteredEntries.length === 0 ? (
            <div style={S.emptyState}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>No journal entries yet</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Start writing to build your reflection habit</div>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div
                key={entry.id}
                style={{ ...S.entryCard, ...(expandedEntry === entry.id ? { borderColor: C.accent } : {}) }}
                onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={S.entryDate}>
                    {formatDate(entry.date)}
                    {entry.mood && ` · ${MOODS.find((m) => m.value === entry.mood)?.emoji || ''}`}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>{entry.wordCount} words</div>
                </div>

                {expandedEntry === entry.id ? (
                  <div>
                    <div style={{ fontSize: 14, color: C.text, lineHeight: 1.7, whiteSpace: 'pre-wrap', marginTop: 8 }}>
                      {entry.content}
                    </div>
                    {entry.tags?.length > 0 && (
                      <div style={S.entryTags}>
                        {entry.tags.map((t) => <span key={t} style={S.miniTag}>{t}</span>)}
                      </div>
                    )}
                    <button
                      style={{ ...S.saveBtn, background: C.red, marginTop: 12 }}
                      onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                    >
                      Delete Entry
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={S.entryPreview}>{entry.content}</div>
                    {entry.tags?.length > 0 && (
                      <div style={S.entryTags}>
                        {entry.tags.map((t) => <span key={t} style={S.miniTag}>{t}</span>)}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ═══ CALENDAR VIEW ═══ */}
      {view === 'calendar' && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>

          {/* Day headers */}
          <div style={S.calGrid}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 10, color: C.muted, fontWeight: 700, padding: 4 }}>{d}</div>
            ))}
          </div>

          {/* Calendar cells */}
          <div style={S.calGrid}>
            {calendarDays.map((d, i) =>
              d ? (
                <button
                  key={i}
                  style={S.calDay(d.filled, d.isToday)}
                  onClick={() => {
                    const entry = entries.find((e) => e.date === d.key);
                    if (entry) { setExpandedEntry(entry.id); setView('history'); }
                    else if (d.isToday) setView('write');
                  }}
                  title={d.filled ? 'Entry written' : d.isToday ? 'Write today\'s entry' : 'No entry'}
                >
                  {d.filled ? '✓' : d.day}
                </button>
              ) : <div key={i} />
            )}
          </div>

          {/* Month summary */}
          <div style={{ ...S.todayCard, marginTop: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Month Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={S.statCard}>
                <div style={{ ...S.statNum, fontSize: 18, color: C.green }}>
                  {calendarDays.filter((d) => d?.filled).length}
                </div>
                <div style={S.statLabel}>Days Written</div>
              </div>
              <div style={S.statCard}>
                <div style={{ ...S.statNum, fontSize: 18, color: C.yellow }}>
                  {calendarDays.filter((d) => d && !d.filled && new Date(d.key) <= new Date()).length}
                </div>
                <div style={S.statLabel}>Days Missed</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
