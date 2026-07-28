import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api.js';

const C = {
  card: "#150e22",
  surface: "#0f0a17",
  border: "#2a1f3d",
  gold: "#c9a44c",
  goldSoft: "#e8cf8a",
  violet: "#7b2fff",
  violetSoft: "#a855f7",
  cyan: "#00d4ff",
  text: "#e9e2f5",
  muted: "#8f80a8",
};

const styles = {
  wrap: { color: C.text, fontFamily: "'DM Mono', 'Fira Code', monospace", paddingBottom: 40 },
  header: { display: "flex", alignItems: "center", gap: 14, marginBottom: 22, paddingBottom: 18, borderBottom: `1px solid ${C.border}` },
  icon: { width: 42, height: 42, borderRadius: 10, background: `linear-gradient(135deg, ${C.gold}, ${C.violet})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 },
  title: { fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: C.goldSoft },
  subtitle: { fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.14em", marginTop: 2 },
  dailyCard: { background: `linear-gradient(135deg, ${C.violet}18, ${C.gold}12)`, border: `1px solid ${C.gold}44`, borderRadius: 16, padding: 24, marginBottom: 22 },
  pill: (color) => ({ display: "inline-block", padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: color + "22", color, border: `1px solid ${color}44` }),
  quote: { fontSize: 19, fontStyle: "italic", color: C.text, lineHeight: 1.6, margin: "14px 0 10px" },
  cite: { fontSize: 12, color: C.muted },
  controls: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 },
  input: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, padding: "11px 16px", fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" },
  filterRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  filterBtn: (active) => ({
    padding: "7px 14px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.02em",
    cursor: "pointer", fontFamily: "inherit", border: `1px solid ${active ? C.gold : C.border}`,
    background: active ? `${C.gold}22` : "transparent", color: active ? C.goldSoft : C.muted,
  }),
  tabs: { display: "flex", gap: 8, marginBottom: 18 },
  tabBtn: (active) => ({
    padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
    fontFamily: "inherit", border: "none",
    background: active ? `linear-gradient(135deg, ${C.violet}, ${C.violetSoft})` : "transparent",
    color: active ? "#fff" : C.muted,
  }),
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, display: "flex", flexDirection: "column" },
  cardHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, gap: 8 },
  star: { background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.gold, flexShrink: 0 },
  reflectionText: { fontSize: 12, color: C.muted, fontStyle: "italic", marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` },
  reflectBtn: { background: "none", border: "none", color: C.cyan, fontSize: 11, cursor: "pointer", marginTop: 10, padding: 0, textAlign: "left", fontFamily: "inherit" },
  empty: { textAlign: "center", color: C.muted, padding: "40px 0", fontSize: 13 },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(5,3,10,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 500 },
  modal: { background: C.card, border: `1px solid ${C.gold}44`, borderRadius: 16, padding: 24, maxWidth: 520, width: "100%" },
  textarea: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, padding: "12px 14px", fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%", height: 100, resize: "vertical", boxSizing: "border-box", marginBottom: 14 },
  btn: { background: `linear-gradient(135deg, ${C.violet}, ${C.violetSoft})`, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  btnGhost: { background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 16px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
};

// Sophia's original secular quote set, kept as its own pseudo-tradition so
// nothing already built here gets lost when the interfaith library merges in.
const LEGACY_THEMES = {
  stoicism: '#00FFFF', habits: '#00FF88', growth: '#FFD23F', purpose: '#FF6B35',
  motivation: '#BB88FF', relationships: '#FF88AA', health: '#44AAFF',
};

const LEGACY_QUOTES = [
  { id: 'legacy-1', tradition: 'modern-quotes', theme: 'stoicism', teaching: 'The happiness of your life depends upon the quality of your thoughts.', source: 'Marcus Aurelius, Meditations' },
  { id: 'legacy-2', tradition: 'modern-quotes', theme: 'stoicism', teaching: 'It is not the man who has too little, but the man who craves more, that is poor.', source: 'Seneca, Letters from a Stoic' },
  { id: 'legacy-3', tradition: 'modern-quotes', theme: 'stoicism', teaching: 'Man is disturbed not by things, but by the views he takes of them.', source: 'Epictetus, Enchiridion' },
  { id: 'legacy-6', tradition: 'modern-quotes', theme: 'habits', teaching: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', source: 'Aristotle, Nicomachean Ethics' },
  { id: 'legacy-8', tradition: 'modern-quotes', theme: 'habits', teaching: 'The chains of habit are too weak to be felt until they are too strong to be broken.', source: 'Samuel Johnson, The Rambler' },
  { id: 'legacy-11', tradition: 'modern-quotes', theme: 'growth', teaching: 'Be not afraid of growing slowly; be afraid only of standing still.', source: 'Chinese Proverb' },
  { id: 'legacy-13', tradition: 'modern-quotes', theme: 'growth', teaching: 'What lies behind us and what lies before us are tiny matters compared to what lies within us.', source: 'Ralph Waldo Emerson, Essays' },
  { id: 'legacy-16', tradition: 'modern-quotes', theme: 'purpose', teaching: 'The two most important days in your life are the day you are born and the day you find out why.', source: 'Mark Twain' },
  { id: 'legacy-19', tradition: 'modern-quotes', theme: 'purpose', teaching: 'He who has a why to live can bear almost any how.', source: 'Friedrich Nietzsche, Twilight of the Idols' },
  { id: 'legacy-21', tradition: 'modern-quotes', theme: 'motivation', teaching: 'The only way to do great work is to love what you do.', source: 'Steve Jobs, Stanford Commencement' },
  { id: 'legacy-30', tradition: 'modern-quotes', theme: 'relationships', teaching: "Friendship is born at that moment when one person says to another, 'What! You too? I thought I was the only one.'", source: 'C.S. Lewis, The Four Loves' },
  { id: 'legacy-31', tradition: 'modern-quotes', theme: 'health', teaching: "Take care of your body. It's the only place you have to live.", source: 'Jim Rohn' },
];

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

export default function WisdomLibrary({ favourites, setFavourites }) {
  const [remote, setRemote] = useState({ traditions: {}, themes: [], entries: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTradition, setSelectedTradition] = useState('All');
  const [activeTab, setActiveTab] = useState('Library');
  const [reflectionModal, setReflectionModal] = useState(null);
  const [reflectionText, setReflectionText] = useState('');
  const [reflections, setReflections] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sophia_reflections') || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetch(`${api.baseURL}/api/wisdom`).then((r) => (r.ok ? r.json() : null));
        if (!cancelled && data) setRemote(data);
      } catch {
        // Backend unavailable — the legacy quote set below still renders fine.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const allEntries = useMemo(() => {
    const backendEntries = (remote.entries || []).map((e) => ({
      id: e.id, tradition: e.tradition, theme: e.theme, teaching: e.teaching, source: e.source, reflectionPrompt: e.reflection,
    }));
    return [...backendEntries, ...LEGACY_QUOTES];
  }, [remote.entries]);

  const traditions = useMemo(() => ({
    ...(remote.traditions || {}),
    'modern-quotes': 'Modern Quotes',
  }), [remote.traditions]);

  const dailyWisdom = useMemo(() => allEntries[getDayOfYear() % Math.max(allEntries.length, 1)], [allEntries]);

  const filtered = useMemo(() => allEntries.filter((e) => {
    const matchesSearch = !searchTerm
      || e.teaching.toLowerCase().includes(searchTerm.toLowerCase())
      || e.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTradition = selectedTradition === 'All' || e.tradition === selectedTradition;
    return matchesSearch && matchesTradition;
  }), [allEntries, searchTerm, selectedTradition]);

  const displayed = activeTab === 'Library' ? filtered : allEntries.filter((e) => favourites.includes(e.id));

  const toggleFavourite = useCallback((id) => {
    setFavourites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  }, [setFavourites]);

  const openReflection = (entry) => {
    setReflectionText(reflections[entry.id] || '');
    setReflectionModal(entry);
  };

  const saveReflection = () => {
    const next = { ...reflections, [reflectionModal.id]: reflectionText };
    setReflections(next);
    localStorage.setItem('sophia_reflections', JSON.stringify(next));
    setReflectionModal(null);
    setReflectionText('');
  };

  const themeColor = (entry) => (
    entry.tradition === 'modern-quotes' ? (LEGACY_THEMES[entry.theme] || C.cyan) : C.gold
  );

  if (!dailyWisdom) return null;

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.icon}>📜</div>
        <div>
          <div style={styles.title}>Wisdom Library</div>
          <div style={styles.subtitle}>{loading ? 'Loading interfaith teachings…' : 'Every path, one library — Christianity, Islam, Judaism, Buddhism, Hinduism, Taoism, Stoicism & modern thought'}</div>
        </div>
      </div>

      <div style={styles.dailyCard}>
        <span style={styles.pill(themeColor(dailyWisdom))}>
          {traditions[dailyWisdom.tradition] || dailyWisdom.tradition} · {dailyWisdom.theme}
        </span>
        <div style={styles.quote}>"{dailyWisdom.teaching}"</div>
        <div style={styles.cite}>— {dailyWisdom.source}</div>
        {dailyWisdom.reflectionPrompt && (
          <div style={{ ...styles.reflectionText, borderTop: 'none', paddingTop: 10, color: C.violetSoft }}>
            Reflect: {dailyWisdom.reflectionPrompt}
          </div>
        )}
      </div>

      <div style={styles.controls}>
        <input
          style={styles.input}
          type="text"
          placeholder="Search teachings or sources…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div style={styles.filterRow}>
          <button style={styles.filterBtn(selectedTradition === 'All')} onClick={() => setSelectedTradition('All')}>All</button>
          {Object.entries(traditions).map(([key, label]) => (
            <button key={key} style={styles.filterBtn(selectedTradition === key)} onClick={() => setSelectedTradition(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.tabs}>
        <button style={styles.tabBtn(activeTab === 'Library')} onClick={() => setActiveTab('Library')}>Library ({filtered.length})</button>
        <button style={styles.tabBtn(activeTab === 'Favourites')} onClick={() => setActiveTab('Favourites')}>Favourites ({favourites.length})</button>
      </div>

      {displayed.length === 0 ? (
        <div style={styles.empty}>
          {activeTab === 'Favourites' ? 'Star some teachings to see them here.' : 'Nothing matches that search.'}
        </div>
      ) : (
        <div style={styles.grid}>
          {displayed.map((entry) => (
            <div key={entry.id} style={styles.card}>
              <div style={styles.cardHead}>
                <span style={styles.pill(themeColor(entry))}>
                  {(traditions[entry.tradition] || entry.tradition)} · {entry.theme}
                </span>
                <button style={styles.star} onClick={() => toggleFavourite(entry.id)} aria-label="Toggle favourite">
                  {favourites.includes(entry.id) ? '★' : '☆'}
                </button>
              </div>
              <div style={{ fontSize: 14, fontStyle: 'italic', color: C.text, lineHeight: 1.6, flex: 1 }}>
                "{entry.teaching}"
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 10 }}>— {entry.source}</div>
              {reflections[entry.id] && (
                <div style={styles.reflectionText}>My reflection: {reflections[entry.id]}</div>
              )}
              <button style={styles.reflectBtn} onClick={() => openReflection(entry)}>
                {reflections[entry.id] ? '✏️ Edit reflection' : '💭 Add reflection'}
              </button>
            </div>
          ))}
        </div>
      )}

      {reflectionModal && (
        <div style={styles.modalOverlay} onClick={() => setReflectionModal(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.goldSoft, marginBottom: 12 }}>Reflect on this teaching</div>
            <div style={{ fontSize: 13, fontStyle: 'italic', color: C.text, marginBottom: 6, lineHeight: 1.6 }}>"{reflectionModal.teaching}"</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>— {reflectionModal.source}</div>
            <textarea
              style={styles.textarea}
              placeholder="What does this mean to you? How can you apply it today?"
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={styles.btn} onClick={saveReflection}>Save Reflection</button>
              <button style={styles.btnGhost} onClick={() => setReflectionModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
