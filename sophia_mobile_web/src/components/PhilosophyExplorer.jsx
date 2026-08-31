import React, { useState } from 'react';

const C = {
  card: "#150e22",
  surface: "#0f0a17",
  border: "#2a1f3d",
  gold: "#c9a44c",
  goldSoft: "#e8cf8a",
  violet: "var(--color-violet)",
  violetSoft: "#a855f7",
  cyan: "var(--color-primary)",
  text: "#e9e2f5",
  muted: "#8f80a8",
  danger: "#e0664f",
};

const styles = {
  wrap: { color: C.text, fontFamily: "var(--font-plain)", paddingBottom: 40 },
  header: { display: "flex", alignItems: "center", gap: 14, marginBottom: 22, paddingBottom: 18, borderBottom: `1px solid ${C.border}` },
  icon: { width: 42, height: 42, borderRadius: 10, background: `linear-gradient(135deg, ${C.violet}, ${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 },
  title: { fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: C.goldSoft },
  subtitle: { fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.14em", marginTop: 2 },
  tabs: { display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" },
  tabBtn: (active) => ({
    padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
    fontFamily: "inherit", border: "none",
    background: active ? `linear-gradient(135deg, ${C.violet}, ${C.violetSoft})` : "transparent",
    color: active ? "#fff" : C.muted,
  }),
  h2: { fontSize: 18, fontWeight: 700, color: C.goldSoft, marginBottom: 18 },
  h3: { fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 20 },
  valueGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10, marginBottom: 24 },
  valueBtn: (active) => ({
    padding: "10px 8px", borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: "pointer",
    fontFamily: "inherit", border: `1px solid ${active ? C.gold : C.border}`,
    background: active ? `${C.gold}22` : "transparent", color: active ? C.goldSoft : C.muted,
    transition: "all 0.15s",
  }),
  warn: { background: `${C.danger}18`, border: `1px solid ${C.danger}44`, borderRadius: 10, padding: 12, marginBottom: 18, fontSize: 12, color: C.text },
  chip: { background: `linear-gradient(135deg, ${C.gold}, ${C.goldSoft})`, color: "#1a1208", padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700 },
  para: { color: C.muted, fontSize: 13, lineHeight: 1.7 },
  ikigaiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 20 },
  ikigaiIcon: { fontSize: 22, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 },
  hint: { fontSize: 11, color: C.muted, marginBottom: 10 },
  textarea: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, padding: "12px 14px", fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%", height: 90, resize: "vertical", boxSizing: "border-box" },
  statement: { fontSize: 16, fontStyle: "italic", color: C.text, lineHeight: 1.7 },
  questionCard: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 10, overflow: "hidden" },
  questionBtn: { width: "100%", textAlign: "left", padding: "14px 16px", background: "transparent", border: "none", color: C.text, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  questionBody: { padding: "0 16px 16px", fontSize: 12, color: C.muted, lineHeight: 1.7 },
  btn: { background: `linear-gradient(135deg, ${C.violet}, ${C.violetSoft})`, color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  btnDisabled: { opacity: 0.4, cursor: "not-allowed" },
  pre: { color: C.muted, fontSize: 12, whiteSpace: "pre-wrap", fontFamily: "var(--font-plain)", lineHeight: 1.7, padding: "0 16px 16px" },
  summary: { padding: "14px 16px", fontWeight: 700, color: C.text, fontSize: 13, cursor: "pointer" },
};

const PhilosophyExplorer = ({ profile, setProfile }) => {
  const [activeTab, setActiveTab] = useState('values');
  const [ikigaiAnswers, setIkigaiAnswers] = useState(profile.ikigaiAnswers || {});
  const [dilemmaText, setDilemmaText] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const values = [
    'Integrity', 'Freedom', 'Growth', 'Courage', 'Discipline', 'Wisdom',
    'Compassion', 'Excellence', 'Authenticity', 'Resilience', 'Service',
    'Creativity', 'Family', 'Solitude', 'Adventure', 'Mastery', 'Justice',
    'Presence', 'Gratitude', 'Loyalty', 'Curiosity', 'Humility', 'Ambition', 'Balance'
  ];

  const selectedValues = profile.values || [];

  const toggleValue = (value) => {
    if (selectedValues.includes(value)) {
      setProfile(prev => ({ ...prev, values: prev.values.filter(v => v !== value) }));
    } else if (selectedValues.length < 7) {
      setProfile(prev => ({ ...prev, values: [...(prev.values || []), value] }));
    }
  };

  const updateIkigaiAnswer = (key, value) => {
    const newAnswers = { ...ikigaiAnswers, [key]: value };
    setIkigaiAnswers(newAnswers);
    setProfile(prev => ({ ...prev, ikigaiAnswers: newAnswers }));
  };

  const getIkigaiStatement = () => {
    const { love, goodAt, worldNeeds, paidFor } = ikigaiAnswers;
    if (love && goodAt && worldNeeds && paidFor) {
      return `I am someone who ${love}, equipped with ${goodAt}, driven to ${worldNeeds}, and able to ${paidFor}. This is my reason for being.`;
    }
    return null;
  };

  const analyzeDilemma = () => {
    if (!dilemmaText.trim()) return;

    const analysis = `â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
STOIC ANALYSIS: "${dilemmaText}"
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
1. CONTROL CHECK
   What you control: Your response, preparation, and attitude toward this situation.
   What you don't: The outcome, others' reactions, and external circumstances.
   â†’ Focus your energy only on the first column.

2. WORST CASE
   Realistic worst outcome: Consider what could actually go wrong, not what might.
   Could you recover? Yes â€” human resilience is remarkable.
   â†’ Fear loses power when you name it clearly.

3. WISEST SELF
   What would the most disciplined, clear-headed version of you choose?
   â†’ Choose the path that aligns with your core values and long-term growth.

4. VIRTUE CHECK
   The virtue being tested here: Courage (acting despite fear) or Wisdom (right judgment).
   â†’ Apply this virtue to guide your decision.

5. LONG-TERM VIEW
   In 5 years, what will matter most about this decision?
   â†’ The character you build and the person you become.

SUMMARY: Trust your judgment. You know what aligns with your values. Take the step.
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€`;

    const newAnalysis = {
      dilemma: dilemmaText,
      analysis,
      date: new Date().toISOString()
    };

    setProfile(prev => ({
      ...prev,
      dilemmaHistory: [newAnalysis, ...(prev.dilemmaHistory || [])]
    }));

    setDilemmaText('');
  };

  const stoicQuestions = [
    {
      id: 1,
      question: 'Is this within my control?',
      expanded: 'Epictetus taught that we only control our judgments, intentions, desires, and aversions. External outcomes, other people, reputation, and possessions are NOT in our control. Ask: am I agonizing over something I cannot change? If yes â€” release it.'
    },
    {
      id: 2,
      question: 'What is the worst realistic case?',
      expanded: "This is premeditatio malorum â€” negative visualization. Seneca wrote: 'Let us prepare our minds as if we had come to the very end of life.' Imagining the worst removes its power. Now ask: could I survive it? Could I recover? Almost always â€” yes."
    },
    {
      id: 3,
      question: 'What would my wisest self do?',
      expanded: 'Picture the person you are working to become. Not who you are today â€” who you are becoming. What would that version of you choose? Act from that identity, not from fear or impulse.'
    },
    {
      id: 4,
      question: 'What does virtue require here?',
      expanded: 'The Stoics believed the four cardinal virtues are the only true goods: Wisdom (right judgment), Justice (treating others well), Courage (doing what is right despite fear), Temperance (self-control and balance). Which virtue is being tested in this moment?'
    },
    {
      id: 5,
      question: 'Will this matter in 5 years?',
      expanded: "Marcus Aurelius wrote: 'How soon will you be ashes or bare bones, and either a name or not even a name.' This is not pessimism â€” it is perspective. Most urgent-feeling problems dissolve under long-term view."
    }
  ];

  const ikigaiFields = [
    { key: 'love', icon: 'ðŸ’š', label: 'What do you love doing?', hint: 'things that make you lose track of time', placeholder: 'e.g. helping others learn, creating art, solving complex problems...' },
    { key: 'goodAt', icon: 'ðŸ’›', label: 'What are you good at?', hint: 'your natural talents and trained skills', placeholder: 'e.g. teaching, writing, coding, leadership...' },
    { key: 'worldNeeds', icon: 'ðŸ§¡', label: 'What does the world need?', hint: 'problems you care about solving', placeholder: 'e.g. education access, mental health support, environmental protection...' },
    { key: 'paidFor', icon: 'ðŸ’™', label: 'What can you be paid for?', hint: 'skills others value and will compensate', placeholder: 'e.g. consulting, content creation, software development...' },
  ];

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.icon}>ðŸ§­</div>
        <div>
          <div style={styles.title}>Philosophy</div>
          <div style={styles.subtitle}>Values, purpose, and a Stoic lens on hard decisions</div>
        </div>
      </div>

      <div style={styles.tabs}>
        <button style={styles.tabBtn(activeTab === 'values')} onClick={() => setActiveTab('values')}>âš–ï¸ Values</button>
        <button style={styles.tabBtn(activeTab === 'purpose')} onClick={() => setActiveTab('purpose')}>ðŸŒŸ Purpose</button>
        <button style={styles.tabBtn(activeTab === 'decisions')} onClick={() => setActiveTab('decisions')}>ðŸ§­ Decisions</button>
      </div>

      {activeTab === 'values' && (
        <div>
          <div style={styles.h2}>Core Values Assessment</div>
          <div style={styles.valueGrid}>
            {values.map(value => (
              <button key={value} style={styles.valueBtn(selectedValues.includes(value))} onClick={() => toggleValue(value)}>
                {value}
              </button>
            ))}
          </div>

          {selectedValues.length >= 7 && (
            <div style={styles.warn}>Choose your top 7. More values = less clarity.</div>
          )}

          <div style={styles.card}>
            <div style={styles.h3}>Your Core Identity</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {selectedValues.map(value => <span key={value} style={styles.chip}>{value}</span>)}
            </div>
            <div style={styles.para}>These values are your compass. Every major decision should align with at least one.</div>
          </div>
        </div>
      )}

      {activeTab === 'purpose' && (
        <div>
          <div style={styles.h2}>Purpose Builder</div>
          <div style={{ ...styles.para, marginBottom: 20 }}>
            Ikigai is the Japanese concept of your 'reason for being'. It sits at the intersection of four questions.
          </div>

          <div style={styles.ikigaiGrid}>
            {ikigaiFields.map((f) => (
              <div key={f.key} style={styles.card}>
                <div style={styles.ikigaiIcon}>{f.icon}</div>
                <div style={styles.label}>{f.label}</div>
                <div style={styles.hint}>{f.hint}</div>
                <textarea
                  style={styles.textarea}
                  value={ikigaiAnswers[f.key] || ''}
                  onChange={(e) => updateIkigaiAnswer(f.key, e.target.value)}
                  placeholder={f.placeholder}
                />
              </div>
            ))}
          </div>

          <div style={styles.card}>
            <div style={styles.h3}>Your Ikigai Statement</div>
            {getIkigaiStatement() ? (
              <div style={styles.statement}>{getIkigaiStatement()}</div>
            ) : (
              <div style={styles.para}>Answer all four questions to reveal your purpose statement.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'decisions' && (
        <div>
          <div style={styles.h2}>Stoic Decision Framework</div>

          <div style={{ marginBottom: 24 }}>
            <div style={styles.h3}>The 5 Stoic Questions</div>
            {stoicQuestions.map((q) => (
              <div key={q.id} style={styles.questionCard}>
                <button
                  style={styles.questionBtn}
                  onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                >
                  {q.question}
                </button>
                {expandedQuestion === q.id && <div style={styles.questionBody}>{q.expanded}</div>}
              </div>
            ))}
          </div>

          <div style={styles.card}>
            <div style={styles.h3}>Personal Dilemma Tool</div>
            <div style={{ ...styles.para, marginBottom: 12 }}>Describe a decision you're facing right now</div>
            <textarea
              style={{ ...styles.textarea, height: 90, marginBottom: 14 }}
              value={dilemmaText}
              onChange={(e) => setDilemmaText(e.target.value)}
              placeholder="e.g. Should I drop out to start my business? Should I confront my friend? Should I take this job offer?"
            />
            <button
              style={{ ...styles.btn, ...(dilemmaText.trim() ? {} : styles.btnDisabled) }}
              onClick={analyzeDilemma}
              disabled={!dilemmaText.trim()}
            >
              Analyse with Stoic Filter
            </button>
          </div>

          {(profile.dilemmaHistory || []).length > 0 && (
            <div>
              <div style={styles.h3}>Recent Analyses</div>
              {(profile.dilemmaHistory || []).slice(0, 3).map((item, index) => (
                <details key={index} style={styles.questionCard}>
                  <summary style={styles.summary}>
                    {item.dilemma.length > 50 ? `${item.dilemma.substring(0, 50)}...` : item.dilemma}
                  </summary>
                  <pre style={styles.pre}>{item.analysis}</pre>
                </details>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhilosophyExplorer;
