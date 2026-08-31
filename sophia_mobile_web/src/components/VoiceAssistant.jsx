import { useState, useRef, useEffect, useCallback } from "react";
import api from '../services/api.js';

const uid = () => Math.random().toString(36).slice(2, 9);

const C = {
  surface: "#0f0a17",
  card: "#150e22",
  border: "#2a1f3d",
  gold: "#c9a44c",
  goldSoft: "#e8cf8a",
  violet: "var(--color-violet)",
  cyan: "var(--color-primary)",
  text: "#e9e2f5",
  muted: "#8f80a8",
};

const styles = {
  wrap: { display: "flex", flexDirection: "column", alignItems: "center", color: C.text, fontFamily: "var(--font-plain)", minHeight: "calc(100vh - 64px)", padding: "0 0 40px" },
  header: { textAlign: "center", marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 700, letterSpacing: "0.04em", color: C.goldSoft, textTransform: "uppercase" },
  subtitle: { fontSize: 12, color: C.muted, marginTop: 6 },
  stage: { position: "relative", width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center", margin: "12px 0 28px" },
  ring: (delay, active) => ({
    position: "absolute", inset: 0, borderRadius: "50%",
    border: `1px solid ${C.violet}55`,
    animation: active ? `sophiaVoicePulse 2.2s ease-out ${delay}s infinite` : "none",
    opacity: active ? 1 : 0.25,
  }),
  core: (listening, speaking) => ({
    width: 96, height: 96, borderRadius: "50%",
    background: `radial-gradient(circle at 35% 30%, ${C.goldSoft}, ${C.violet} 60%, #10061f 100%)`,
    boxShadow: listening
      ? `0 0 60px 10px ${C.cyan}55`
      : speaking
        ? `0 0 60px 10px ${C.gold}55`
        : `0 0 40px 4px ${C.violet}33`,
    transition: "box-shadow 0.3s ease",
  }),
  micBtn: (listening) => ({
    width: 72, height: 72, borderRadius: "50%",
    border: `2px solid ${listening ? C.cyan : C.violet}`,
    background: listening ? `${C.cyan}22` : `${C.violet}18`,
    color: listening ? C.cyan : C.goldSoft,
    fontSize: 26, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.2s ease",
  }),
  transcriptCard: { width: "100%", maxWidth: 560, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, marginTop: 10 },
  line: { fontSize: 13, lineHeight: 1.7, marginBottom: 10 },
  you: { color: C.cyan },
  sophia: { color: C.goldSoft },
  textRow: { display: "flex", gap: 10, width: "100%", maxWidth: 560, marginTop: 18 },
  input: { flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, padding: "12px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" },
  sendBtn: { background: `linear-gradient(135deg, ${C.violet}, ${C.cyan})`, color: "#03101d", border: "none", borderRadius: 10, padding: "0 20px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  hint: { fontSize: 11, color: C.muted, marginTop: 14, textAlign: "center" },
};

function loadJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

// Zero-key local fallback: reasons from real localStorage habit/growth data
// instead of the network, mirroring the backend's templated coach so the
// assistant still says something grounded when the API is unreachable.
function localBriefing() {
  const stats = loadJSON('sophia_today_stats', {});
  const habits = loadJSON('sophia_habits', []);
  const doneToday = Array.isArray(habits)
    ? habits.filter((h) => (h.completedDates || []).includes(new Date().toISOString().slice(0, 10))).length
    : 0;
  const total = Array.isArray(habits) ? habits.length : 0;
  if (!total) {
    return "Systems nominal. No habits tracked yet — head to Discipline, Body, or Mind to set your first one, and I'll start giving you real status reports.";
  }
  const behind = total - doneToday;
  return behind === 0
    ? `Systems nominal. All ${total} habits are complete today — that's a clean sweep.`
    : `Status: ${doneToday} of ${total} habits done today. ${behind} still open — nothing urgent, just naming it.`;
}

function localReply(message) {
  const trimmed = message.trim().toLowerCase();
  if (!trimmed) return "I didn't catch that — try again?";
  if (trimmed.includes("shadow")) {
    return "Shadow work is under the Shadow tab. It's unguarded space — no streaks, no scoring, just honesty.";
  }
  if (trimmed.includes("progress") || trimmed.includes("how am i doing")) {
    return `${localBriefing()} Check the Progress tab for the full breakdown.`;
  }
  return "I'm running in offline mode right now (no live AI key configured), so I can only reason from your local data. Ask me about your progress, or add a real ANTHROPIC_API_KEY on the backend to unlock full conversation.";
}

export default function VoiceAssistant() {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [conversationId] = useState(() => uid());
  const [briefed, setBriefed] = useState(false);
  const recognitionRef = useRef(null);

  const speak = useCallback((text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.02;
    utter.pitch = 0.95;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }, []);

  const pushLine = useCallback((role, text) => {
    setTranscript((prev) => [...prev, { id: uid(), role, text }]);
  }, []);

  // Proactive briefing on open — the Jarvis-style "systems nominal" moment,
  // grounded in real habit data whether the backend is reachable or not.
  useEffect(() => {
    if (briefed) return;
    setBriefed(true);
    (async () => {
      let text;
      try {
        const res = await api.getCoachBriefing(conversationId);
        text = res?.assistant_text || res?.reply;
      } catch {
        text = null;
      }
      const finalText = text || localBriefing();
      pushLine("sophia", finalText);
      speak(finalText);
    })();
  }, [briefed, conversationId, pushLine, speak]);

  useEffect(() => {
    const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const said = event.results[0][0].transcript;
      handleUserMessage(said);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUserMessage = useCallback(async (message) => {
    if (!message.trim()) return;
    pushLine("you", message);
    let reply;
    try {
      const res = await api.getCoachReply(message, conversationId);
      reply = res?.assistant_text || res?.reply;
    } catch {
      reply = null;
    }
    const finalReply = reply || localReply(message);
    pushLine("sophia", finalReply);
    speak(finalReply);
  }, [conversationId, pushLine, speak]);

  const togglePushToTalk = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      window.speechSynthesis?.cancel();
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const submitText = () => {
    if (!textInput.trim()) return;
    handleUserMessage(textInput.trim());
    setTextInput("");
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.title}>Voice</div>
        <div style={styles.subtitle}>Sophia listens, reasons from your real data, and speaks back</div>
      </div>

      <div style={styles.stage}>
        <div style={styles.ring(0, listening || speaking)} />
        <div style={styles.ring(0.7, listening || speaking)} />
        <div style={styles.ring(1.4, listening || speaking)} />
        <div style={styles.core(listening, speaking)} />
      </div>

      {supported ? (
        <button style={styles.micBtn(listening)} onClick={togglePushToTalk} aria-label={listening ? "Stop listening" : "Push to talk"}>
          {listening ? "■" : "🎙"}
        </button>
      ) : (
        <div style={{ fontSize: 12, color: C.muted }}>Voice input isn't supported in this browser — use text below.</div>
      )}

      <div style={styles.hint}>
        {supported
          ? (listening ? "Listening…" : "Tap to speak, or type below")
          : "Browser speech recognition unavailable — Chrome/Edge recommended"}
      </div>

      <div style={styles.textRow}>
        <input
          style={styles.input}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitText()}
          placeholder="Or type a message…"
        />
        <button style={styles.sendBtn} onClick={submitText}>Send</button>
      </div>

      {transcript.length > 0 && (
        <div style={styles.transcriptCard}>
          {transcript.map((line) => (
            <div key={line.id} style={styles.line}>
              <span style={line.role === "you" ? styles.you : styles.sophia}>
                {line.role === "you" ? "You: " : "Sophia: "}
              </span>
              {line.text}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes sophiaVoicePulse {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
