import { useState, useEffect, useCallback, useMemo } from "react";
import api from '../services/api.js';

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

const uid = () => Math.random().toString(36).slice(2, 9);
const today = () => new Date().toISOString().slice(0, 10);

const C = {
  obsidian: "#050308",
  surface: "#0f0a17",
  card: "#150e22",
  border: "#2a1f3d",
  gold: "#c9a44c",
  goldSoft: "#e8cf8a",
  violet: "#7b2fff",
  violetSoft: "#a855f7",
  text: "#e9e2f5",
  muted: "#8f80a8",
  danger: "#e0664f",
};

const styles = {
  wrap: { background: "transparent", color: C.text, fontFamily: "'DM Mono', 'Fira Code', monospace", padding: 0, paddingBottom: 40 },
  header: { display: "flex", alignItems: "center", gap: 14, marginBottom: 22, paddingBottom: 18, borderBottom: `1px solid ${C.border}` },
  icon: { width: 42, height: 42, borderRadius: 10, background: `linear-gradient(135deg, ${C.violet}, ${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 },
  title: { fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: C.goldSoft },
  subtitle: { fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.14em", marginTop: 2 },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 14 },
  input: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: "10px 14px", fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" },
  btn: { background: `linear-gradient(135deg, ${C.violet}, ${C.violetSoft})`, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.03em" },
  btnGhost: { background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 16px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  btnGold: { background: `linear-gradient(135deg, ${C.gold}, ${C.goldSoft})`, color: "#1a1208", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.04em" },
  label: { fontSize: 11, color: C.muted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" },
  h3: { fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 },
  tag: (color) => ({ background: color + "20", color, border: `1px solid ${color}44`, borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.04em" }),
};

const PROMPTS = [
  "What did I avoid today, and what did avoiding it cost me?",
  "What belief about myself, if I said it out loud, would embarrass me?",
  "Who or what triggered a disproportionate reaction from me recently — what old wound did it touch?",
  "What part of myself have I disowned because it once wasn't safe to show it?",
  "Where am I performing strength instead of admitting I need help?",
  "What pattern keeps repeating in my relationships that I haven't named yet?",
  "What am I most afraid people would think if they truly saw me?",
  "What did younger me need to hear that I still haven't said to myself?",
];

const THEMES = [
  { id: "fear", label: "Fear", color: C.danger },
  { id: "shame", label: "Shame", color: "#c46bd6" },
  { id: "anger", label: "Anger", color: "#ff6b6b" },
  { id: "grief", label: "Grief", color: "#6b93ff" },
  { id: "envy", label: "Envy", color: "#5fbf7a" },
  { id: "limiting-belief", label: "Limiting Belief", color: C.gold },
];

function UnlockGate({ onUnlock }) {
  const [checks, setChecks] = useState({ a: false, b: false, c: false });
  const allChecked = checks.a && checks.b && checks.c;

  return (
    <div style={{ ...styles.card, textAlign: "center", padding: "40px 28px", position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle at 50% 0%, ${C.violet}22, transparent 60%)`,
        pointerEvents: "none",
      }} />
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 34, marginBottom: 10 }}>🔒</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.goldSoft, letterSpacing: "0.02em", marginBottom: 8 }}>
          SHADOW WORK — LOCKED
        </div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, maxWidth: 460, margin: "0 auto 24px" }}>
          What you avoid looking at runs your life from the dark. This room is for looking anyway —
          at the fears, shame, anger, and limiting beliefs you've disowned. It's private, unfiltered,
          and only for you. Nothing here is graded or streaked.
        </div>
        <div style={{ textAlign: "left", maxWidth: 420, margin: "0 auto 24px", display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            ["a", "I understand this space is for honest self-reflection, not diagnosis or crisis support."],
            ["b", "I'm in a safe place right now, and I'll pause and reach out to someone if this brings up more than I can hold alone."],
            ["c", "I'm ready to look at what I usually look away from."],
          ].map(([key, label]) => (
            <label key={key} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 12, color: C.text, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={checks[key]}
                onChange={(e) => setChecks((p) => ({ ...p, [key]: e.target.checked }))}
                style={{ marginTop: 2, accentColor: C.violet }}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <button
          style={{ ...styles.btnGold, opacity: allChecked ? 1 : 0.4, cursor: allChecked ? "pointer" : "not-allowed" }}
          disabled={!allChecked}
          onClick={onUnlock}
        >
          Enter the Work
        </button>
      </div>
    </div>
  );
}

function TheWorkTab({ entries, addEntry }) {
  const [promptIdx, setPromptIdx] = useState(() => Math.floor(Math.random() * PROMPTS.length));
  const [text, setText] = useState("");
  const [activeThemes, setActiveThemes] = useState([]);
  const [saving, setSaving] = useState(false);

  const toggleTheme = (id) => {
    setActiveThemes((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const save = async () => {
    if (!text.trim()) return;
    setSaving(true);
    await addEntry({
      id: uid(),
      date: today(),
      prompt: PROMPTS[promptIdx],
      text: text.trim(),
      themes: activeThemes,
      integrated: false,
      timestamp: Date.now(),
    });
    setText("");
    setActiveThemes([]);
    setPromptIdx(Math.floor(Math.random() * PROMPTS.length));
    setSaving(false);
  };

  return (
    <div>
      <div style={{ ...styles.card, border: `1px solid ${C.violet}44` }}>
        <div style={styles.h3}>Sit With This</div>
        <div style={{ fontSize: 14, color: C.goldSoft, lineHeight: 1.6, fontStyle: "italic", marginBottom: 16 }}>
          "{PROMPTS[promptIdx]}"
        </div>
        <textarea
          style={{ ...styles.input, height: 160, resize: "vertical", marginBottom: 12 }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write without editing yourself. No one is grading this."
        />
        <div style={{ marginBottom: 14 }}>
          <label style={styles.label}>What is this touching?</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => toggleTheme(t.id)}
                style={{
                  ...styles.tag(t.color),
                  cursor: "pointer",
                  opacity: activeThemes.includes(t.id) ? 1 : 0.45,
                  border: `1px solid ${t.color}${activeThemes.includes(t.id) ? "" : "22"}`,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...styles.btn, opacity: saving ? 0.6 : 1 }} onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save & Sit With It"}
          </button>
          <button style={styles.btnGhost} onClick={() => setPromptIdx(Math.floor(Math.random() * PROMPTS.length))}>
            Different prompt
          </button>
        </div>
      </div>

      <div style={styles.h3}>Recent Entries ({entries.length})</div>
      {entries.length === 0 && (
        <div style={{ textAlign: "center", color: C.muted, padding: "30px 0", fontSize: 13 }}>
          Nothing written yet. The first entry is usually the hardest.
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {entries.slice(0, 8).map((e) => (
          <div key={e.id} style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: C.muted }}>{new Date(e.timestamp).toLocaleDateString()}</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {(e.themes || []).map((tid) => {
                  const t = THEMES.find((x) => x.id === tid);
                  return t ? <span key={tid} style={styles.tag(t.color)}>{t.label}</span> : null;
                })}
              </div>
            </div>
            <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic", marginBottom: 6 }}>"{e.prompt}"</div>
            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{e.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IntegrationTab({ entries, toggleIntegrated }) {
  const integrated = entries.filter((e) => e.integrated);
  const pending = entries.filter((e) => !e.integrated);

  return (
    <div>
      <div style={{ ...styles.card, border: `1px solid ${C.gold}33` }}>
        <div style={styles.h3}>What Integration Means</div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
          Naming a shadow isn't the end of the work — integration is when you've made peace with it,
          taken responsibility for its effect on others, or turned it into conscious choice instead of
          a blind reaction. Mark an entry integrated when you feel that shift, not before.
        </div>
      </div>

      {pending.length > 0 && (
        <>
          <div style={styles.h3}>Still Sitting With ({pending.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {pending.map((e) => (
              <div key={e.id} style={{ ...styles.card, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 12, color: C.text, flex: 1 }}>{e.prompt}</div>
                <button style={styles.btnGhost} onClick={() => toggleIntegrated(e.id)}>Mark integrated</button>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={styles.h3}>Integrated ({integrated.length})</div>
      {integrated.length === 0 ? (
        <div style={{ textAlign: "center", color: C.muted, padding: "20px 0", fontSize: 13 }}>None yet — and that's honest.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {integrated.map((e) => (
            <div key={e.id} style={{ ...styles.card, borderColor: `${C.gold}44` }}>
              <div style={{ fontSize: 12, color: C.goldSoft }}>✓ {e.prompt}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShadowSection() {
  const [unlocked, setUnlocked] = useLocalStorage("shadow_unlocked", false);
  const [entries, setEntries] = useLocalStorage("shadow_entries", []);
  const [activeTab, setActiveTab] = useLocalStorage("shadow_active_tab", "work");
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (!unlocked || synced) return;
    (async () => {
      try {
        const remote = await api.getShadowEntries();
        if (Array.isArray(remote) && remote.length) setEntries(remote);
      } catch {
        // Backend unavailable — local entries remain the source of truth.
      } finally {
        setSynced(true);
      }
    })();
  }, [unlocked, synced]);

  const addEntry = useCallback(async (entry) => {
    setEntries((prev) => [entry, ...prev]);
    try {
      await api.createShadowEntry(entry);
    } catch {
      // Local-first: entry is already saved to localStorage above.
    }
  }, [setEntries]);

  const toggleIntegrated = useCallback((id) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, integrated: !e.integrated } : e)));
    api.updateShadowEntry(id, { integrated: true }).catch(() => {});
  }, [setEntries]);

  const tabs = useMemo(() => ([
    { id: "work", label: "The Work" },
    { id: "integration", label: `Integration (${entries.filter((e) => e.integrated).length}/${entries.length})` },
  ]), [entries]);

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.icon}>🜏</div>
        <div>
          <div style={styles.title}>Shadow</div>
          <div style={styles.subtitle}>What you don't look at, runs you</div>
        </div>
      </div>

      {!unlocked ? (
        <UnlockGate onUnlock={() => setUnlocked(true)} />
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={activeTab === t.id
                  ? { ...styles.btn, padding: "8px 16px", fontSize: 12 }
                  : { ...styles.btnGhost, padding: "8px 16px", fontSize: 12 }}
              >
                {t.label}
              </button>
            ))}
          </div>
          {activeTab === "work"
            ? <TheWorkTab entries={entries} addEntry={addEntry} />
            : <IntegrationTab entries={entries} toggleIntegrated={toggleIntegrated} />}
        </>
      )}
    </div>
  );
}
