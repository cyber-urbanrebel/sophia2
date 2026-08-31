import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api.js';

// ---------- Onboarding data helpers ----------
const ONBOARDING_DATA_KEY = 'sophia_onboarding_data';
const AI_WELCOMED_KEY = 'sophia_ai_welcomed';
const CONVERSATION_ID_KEY = 'sophia_floating_ai_conversation_id';
const uid = () => Math.random().toString(36).slice(2, 9);

function getOnboardingData() {
  try {
    const raw = localStorage.getItem(ONBOARDING_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// Build personalised welcome messages from onboarding answers
function buildWelcomeSequence(ob) {
  if (!ob) return null;
  const name = ob.name || 'Friend';
  const goals = ob.goals || [];
  const focusAreas = ob.focusAreas || [];

  const focusMap = {
    body: '💪 Build my body',
    mind: '🧠 Master my mind',
    discipline: '⭐ Build discipline',
    habits: '📋 Build daily habits',
    career: '💼 Grow my career',
    transform: '🚀 Transform everything',
  };

  const focusLabels = focusAreas.map(f => focusMap[f] || f);

  const welcomeMsg = `Welcome to SOPHIA, ${name}! 🎉\n\nI've noted your onboarding answers and I'm ready to guide you.\n\n` +
    (goals.length ? `🎯 Your goals: ${goals.join(', ')}\n` : '') +
    (focusLabels.length ? `🔥 Focus areas: ${focusLabels.join(', ')}\n` : '') +
    `\nLet's turn these into action. Here's what I suggest we start with:`;

  // Build personalised tips from goals and focus
  const tips = [];
  if (goals.includes('Strengthen focus & concentration') || focusAreas.includes('mind'))
    tips.push("Let's build a deep-focus routine to sharpen your concentration");
  if (goals.includes('Build emotional resilience'))
    tips.push("Let's practise a resilience exercise to handle stress better");
  if (goals.includes('Improve time management') || focusAreas.includes('discipline'))
    tips.push("Help me build a daily schedule I'll actually stick to");
  if (goals.includes('Enhance communication skills') || goals.includes('Enhance social connections'))
    tips.push("Suggest a communication exercise to try today");
  if (goals.includes('Develop leadership qualities'))
    tips.push("What leadership habit should I practise this week?");
  if (goals.includes('Cultivate mindfulness'))
    tips.push("Suggest a mindfulness exercise to start my day");
  if (goals.includes('Boost creativity & innovation'))
    tips.push("Give me a creative challenge to spark new ideas");
  if (goals.includes('Expand financial literacy') || focusAreas.includes('career'))
    tips.push("Help me plan my next financial growth step");
  if (goals.includes('Improve physical fitness') || focusAreas.includes('body'))
    tips.push("Let's design a fitness plan based on your goals");
  if (goals.includes('Strengthen spiritual grounding'))
    tips.push("Suggest a grounding or reflection practice for today");
  if (goals.includes('Build consistent study habits') || focusAreas.includes('habits'))
    tips.push("Help me pick 3 daily study habits to start tracking");
  if (goals.includes('Reduce procrastination'))
    tips.push("What's one technique to beat procrastination today?");
  if (goals.includes('Improve decision-making skills'))
    tips.push("Walk me through a decision-making framework");
  if (goals.includes('Develop problem-solving ability'))
    tips.push("Give me a problem-solving scenario to sharpen my thinking");
  if (focusAreas.includes('transform'))
    tips.push("Create a 30-day total transformation challenge for me");

  // Ensure at least 3 tips
  const fallbacks = [
    "What should I focus on today?",
    "How do I get the most out of SOPHIA?",
    "Give me a quick win to start with",
  ];
  while (tips.length < 3) tips.push(fallbacks[tips.length]);

  return { welcomeMsg, tips: tips.slice(0, 4) };
}

// ---------- Context-aware guidance per section ----------
const pathGuidance = {
  '/dashboard': {
    label: 'Dashboard',
    greeting: "Welcome to your command centre. I can see your daily score, habits, and goals from here.",
    tips: [
      "How's my day looking so far?",
      "What should I focus on today?",
      "Summarise my progress this week",
    ],
  },
  '/body': {
    label: 'Body',
    greeting: "You're in the Body section — training, nutrition, sleep, and hydration live here.",
    tips: [
      "Create a workout plan for me",
      "How can I improve my sleep quality?",
      "What should I eat today to hit my protein goal?",
    ],
  },
  '/mind': {
    label: 'Mind',
    greeting: "You're in the Mind section — meditation, reading, journaling, and mental clarity.",
    tips: [
      "Suggest a 5-minute mindfulness exercise",
      "What patterns do you see in my journal?",
      "Help me reflect on my week",
    ],
  },
  '/discipline': {
    label: 'Discipline',
    greeting: "You're in Discipline — habits, schedules, and daily accountability.",
    tips: [
      "Which habits am I most consistent with?",
      "Help me plan tomorrow's schedule",
      "What's my biggest consistency gap?",
    ],
  },
  '/progress': {
    label: 'Progress',
    greeting: "You're viewing your Progress — trends, activities, and goal tracking.",
    tips: [
      "Analyse my trends this month",
      "Which area improved the most?",
      "Am I on track for my goals?",
    ],
  },
  '/growth': {
    label: 'Inner Growth',
    greeting: "You're in Inner Growth — personal development, learning, and transformation.",
    tips: [
      "Suggest a 30-day growth challenge",
      "What skill should I develop next?",
      "Help me set a meaningful goal",
    ],
  },
  '/projects': {
    label: 'Projects',
    greeting: "You're in Projects — task boards, sprints, and project tracking.",
    tips: [
      "Help me break down my current project",
      "What's overdue on my board?",
      "Suggest a productivity workflow",
    ],
  },
};

function getGuidance(pathname) {
  for (const [key, val] of Object.entries(pathGuidance)) {
    if (pathname.startsWith(key)) return val;
  }
  return {
    label: 'Sophia',
    greeting: "I'm your Sophia guide. Ask me anything about your journey — I know every section of your path.",
    tips: [
      "What should I work on today?",
      "How's my overall progress?",
      "Give me a motivational push",
    ],
  };
}

// AI response logic — context-aware replies, now also personalised from onboarding
function generateReply(userMsg, section) {
  const lower = userMsg.toLowerCase();
  const ob = getOnboardingData();
  const name = ob?.name || 'there';
  const goals = ob?.goals || [];
  const focusAreas = ob?.focusAreas || [];

  // Onboarding-specific replies
  if (lower.includes('training plan') || lower.includes('first training'))
    return `Great, ${name}! Since your goals include ${goals.filter(g => g.match(/body|muscle|fat/i)).join(' and ') || 'fitness'}, here's a solid starter plan:\n\n• Mon/Wed/Fri – Compound lifts (squats, bench, deadlift) – 45 min\n• Tue/Thu – Cardio + mobility – 30 min\n• Weekends – Active recovery (walk, stretch)\n\nStart at a comfortable weight and add 2.5 kg/week. Want me to break down the sets and reps?`;
  if (lower.includes('sleep routine'))
    return `Sleep is your superpower, ${name}. Here's a proven routine:\n\n🌙 10:00 PM – Screens off, dim lights\n🌙 10:15 PM – Journal or read (physical book)\n🌙 10:30 PM – Lights out\n☀️ 6:00 AM – Wake naturally or with a sunrise alarm\n\nConsistency matters more than duration. I'll remind you nightly if you've turned on notifications!`;
  if (lower.includes('daily schedule') || lower.includes('stick to'))
    return `Building discipline is about removing decisions, ${name}. Here's a template:\n\n⏰ 6:00 – Wake + hydrate\n⏰ 6:15 – Movement (workout or walk)\n⏰ 7:00 – Focused deep work (top priority)\n⏰ 12:00 – Lunch + rest\n⏰ 13:00 – Second work block\n⏰ 17:00 – Exercise or skill development\n⏰ 21:00 – Wind down + journal\n\nStart with just the morning block tomorrow. Small wins build momentum.`;
  if (lower.includes('nutrition target') || lower.includes('eat today'))
    return `Based on your goals, ${name}, here's a simple nutrition framework:\n\n🥩 Protein: Aim for 1.6g per kg bodyweight\n🥗 Vegetables: Fill half your plate every meal\n💧 Water: 3+ litres throughout the day\n🍽️ Meals: 3 main + 1 snack\n\nToday try: eggs + spinach for breakfast, chicken salad for lunch, salmon + rice for dinner. Want me to generate a full meal plan?`;
  if (lower.includes('mindfulness') || lower.includes('meditation') && lower.includes('start'))
    return `Here's a 5-minute mindfulness exercise for you, ${name}:\n\n1. Sit comfortably, close your eyes\n2. Take 3 deep breaths (4s in, 7s hold, 8s out)\n3. Focus on body sensations from head to toes\n4. When thoughts come, acknowledge them and return to breath\n5. After 5 min, slowly open your eyes\n\nDo this every morning in the Mind section for 7 days — you'll notice a clear difference. Ready to start?`;
  if (lower.includes('career growth') || lower.includes('next career'))
    return `Let's map your career growth, ${name}:\n\n1. **This week**: Identify one skill gap that's holding you back\n2. **This month**: Dedicate 30 min/day to learning it\n3. **This quarter**: Ship one visible project using that skill\n\nThe Projects section is perfect for tracking this. Want me to create a career growth project board for you?`;
  if (lower.includes('daily habit') || lower.includes('3 habits') || lower.includes('start tracking'))
    return `Here are 3 high-impact habits to start with, ${name}:\n\n1. ☀️ **Morning hydration** – Drink 500ml water within 10 min of waking\n2. 📝 **Evening journal** – Write 3 things you're grateful for before bed\n3. 🏃 **Movement minimum** – At least 20 min of exercise daily\n\nHead to the Discipline section to add these to your tracker. Consistency over intensity!`;
  if (lower.includes('transformation') || lower.includes('30-day') || lower.includes('challenge'))
    return `Let's build your 30-Day Transformation Challenge, ${name}! 🚀\n\n**Week 1-2: Foundation**\n• Set sleep schedule + morning routine\n• Track all 3 core habits daily\n\n**Week 3: Intensity**\n• Add workout sessions (3x/week)\n• Start journaling daily\n\n**Week 4: Mastery**\n• Review progress in the Progress section\n• Set 3 new goals for the next month\n\nI'll check in with you throughout. Let's start tomorrow — what time do you wake up?`;
  if (lower.includes('quick win') || lower.includes('start with'))
    return `Here's your quick win for today, ${name}: 🏆\n\nDrink a full glass of water right now, then do 10 push-ups. That's it.\n\nYou just completed something. Log it in the Dashboard and watch your Master Score tick up. Small wins create momentum — and momentum is unstoppable.`;
  if (lower.includes('most out of sophia') || lower.includes('how do i'))
    return `Great question, ${name}! Here's how SOPHIA works best:\n\n📊 **Dashboard** – Check your Master Score daily\n💪 **Body** – Log workouts, sleep, and nutrition\n🧠 **Mind** – Journal and meditate\n⭐ **Discipline** – Track habits and streaks\n📈 **Progress** – Review trends weekly\n\nI'm always here (this floating button) to guide you. Just ask about any section!`;

  // Original keyword responses
  if (lower.includes('workout') || lower.includes('exercise') || lower.includes('training'))
    return `Based on your Body data, I'd suggest a compound-movement session today — squats, deadlift, bench press. Aim for 45 minutes with progressive overload. Want me to break that down set by set?`;
  if (lower.includes('sleep'))
    return "Sleep is the foundation. From your logs, your best days follow 7+ hours of sleep. Try setting a strict 10:30 PM wind-down alarm — no screens, dim lights. I'll remind you if you'd like.";
  if (lower.includes('habit') || lower.includes('consistent'))
    return "Looking at your Discipline data, your strongest habit streak is meditation (12 days). Your weakest link is hydration — you miss it 40% of the time. Try pairing water intake with an existing habit like meals.";
  if (lower.includes('journal') || lower.includes('reflect'))
    return "Journaling compounds over time. Your recent entries show a positive shift in mood when you write before bed. Tonight, try answering: 'What did I do today that my future self will thank me for?'";
  if (lower.includes('goal') || lower.includes('track'))
    return "You have 3 active goals. 'Run 5K under 25 min' is 75% complete and ahead of schedule — keep the momentum. 'Build morning routine' is at 45% and needs attention. Want me to create an action plan?";
  if (lower.includes('focus') || lower.includes('today') || lower.includes('should'))
    return `You're on the ${section} path right now. Based on your data, today's top 3 priorities: 1) Complete your morning habits, 2) Log a 30-min focused session, 3) Write tonight's journal entry. Small wins compound.`;
  if (lower.includes('motivat') || lower.includes('push') || lower.includes('inspire'))
    return "You didn't come this far to only come this far. Your consistency score is climbing — 3 weeks ago you were at 40%, now you're above 65%. Every day you show up, you're building a version of yourself that can't be stopped.";
  if (lower.includes('progress') || lower.includes('week') || lower.includes('trend'))
    return "This week: 5/7 days with completed habits, 3 workouts logged, 2 journal entries. Your Master Score averaged 62 — up 8 points from last week. The gap? Hydration and sleep consistency. Fix those and you'll break 75.";

  const responses = [
    `Great question, ${name}! In the ${section} section, I can see your recent activity. Let me know what specific area you'd like to dive deeper into — habits, body metrics, mind exercises, or goal tracking.`,
    `I'm here to help you navigate your ${section} path, ${name}. Based on what I see, you're making solid progress. Would you like personalised tips or want me to analyse a specific trend?`,
    `From your data, your strongest area is consistency in showing up. The biggest opportunity for growth is in ${section === 'Body' ? 'nutrition tracking' : section === 'Mind' ? 'meditation frequency' : 'schedule adherence'}. Want me to create a plan, ${name}?`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

const s = {
  fab: {
    position: 'fixed', bottom: 28, right: 28, width: 56, height: 56,
    borderRadius: '50%', border: 'none', cursor: 'pointer', zIndex: 9999,
    background: 'linear-gradient(135deg, #c9a84c, #a88a30)',
    boxShadow: '0 4px 20px rgba(201,168,76,0.35), 0 0 40px rgba(201,168,76,0.12)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'transform 0.25s, box-shadow 0.25s',
  },
  panel: {
    position: 'fixed', bottom: 96, right: 28, width: 380, maxHeight: 520,
    background: '#13131f', border: '0.5px solid #1e1e2e', borderRadius: 16,
    boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 0 60px rgba(201,168,76,0.06)',
    zIndex: 9998, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    fontFamily: "'Dark Castle'",
    animation: 'floatAI-slideUp 0.3s cubic-bezier(0.22,1,0.36,1)',
  },
  header: {
    padding: '16px 20px', borderBottom: '0.5px solid #1e1e2e',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 15, fontWeight: 600, color: '#c9a84c' },
  headerBadge: {
    fontSize: 11, padding: '2px 8px', borderRadius: 10,
    background: '#1e1c14', color: '#c9a84c', border: '0.5px solid #c9a84c30',
  },
  chatArea: { flex: 1, overflowY: 'auto', padding: '12px 16px', maxHeight: 300 },
  msgRow: (isUser) => ({
    display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
    marginBottom: 10,
  }),
  bubble: (isUser) => ({
    maxWidth: '80%', padding: '10px 14px', borderRadius: 12,
    fontSize: 13, lineHeight: 1.55, wordBreak: 'break-word',
    background: isUser ? '#c9a84c' : '#0f0f1a',
    color: isUser ? '#1a1200' : '#c8c5bc',
    border: isUser ? 'none' : '0.5px solid #1e1e2e',
  }),
  tipsArea: { padding: '8px 16px 12px' },
  tipLabel: { fontSize: 11, color: '#4a4a62', marginBottom: 6 },
  tipBtn: {
    display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px',
    marginBottom: 4, borderRadius: 8, border: '0.5px solid #1e1e2e',
    background: 'transparent', color: '#8a8a9a', fontSize: 12,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
  },
  inputRow: {
    display: 'flex', gap: 8, padding: '12px 16px', borderTop: '0.5px solid #1e1e2e',
  },
  input: {
    flex: 1, background: '#0f0f1a', border: '0.5px solid #1e1e2e', borderRadius: 8,
    padding: '9px 12px', color: '#e0ddd6', fontSize: 13, outline: 'none',
    fontFamily: 'inherit',
  },
  sendBtn: {
    background: '#c9a84c', color: '#1a1200', border: 'none', borderRadius: 8,
    padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'inherit',
  },
};

export default function FloatingAI() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const guidance = getGuidance(location.pathname);
  const chatEndRef = useRef(null);

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('sophia_floating_ai_msgs');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Onboarding welcome state
  const [welcomeData, setWelcomeData] = useState(null);
  const [hasWelcomed, setHasWelcomed] = useState(() => localStorage.getItem(AI_WELCOMED_KEY) === 'true');

  // Auto-open with welcome sequence after onboarding (first dashboard visit)
  useEffect(() => {
    if (hasWelcomed) return;
    if (!location.pathname.startsWith('/dashboard')) return;

    const ob = getOnboardingData();
    if (!ob) return;

    const seq = buildWelcomeSequence(ob);
    if (!seq) return;

    setWelcomeData(seq);
    // Small delay so the dashboard renders first, then the AI panel slides in
    const timer = setTimeout(() => {
      setOpen(true);
      localStorage.setItem(AI_WELCOMED_KEY, 'true');
      setHasWelcomed(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, [location.pathname, hasWelcomed]);

  // Determine the greeting & tips to show
  const isWelcomeMode = welcomeData && messages.length === 0;
  const activeGreeting = isWelcomeMode ? welcomeData.welcomeMsg : guidance.greeting;
  const activeTips = isWelcomeMode ? welcomeData.tips : guidance.tips;

  // Reset greeting when section changes
  const [lastSection, setLastSection] = useState(guidance.label);
  useEffect(() => {
    if (guidance.label !== lastSection) {
      setLastSection(guidance.label);
      // Clear welcome mode when navigating away from dashboard
      if (!location.pathname.startsWith('/dashboard')) {
        setWelcomeData(null);
      }
    }
  }, [guidance.label, lastSection, location.pathname]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const [conversationId] = useState(() => {
    const existing = localStorage.getItem(CONVERSATION_ID_KEY);
    if (existing) return existing;
    const next = uid();
    localStorage.setItem(CONVERSATION_ID_KEY, next);
    return next;
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.getCoachHistory(conversationId);
        const rows = Array.isArray(res?.messages) ? res.messages : [];
        if (!cancelled && rows.length) {
          const mapped = rows.map((row, index) => ({
            id: row.id || index,
            role: row.role,
            content: row.content,
            ts: Date.parse(row.created_at) || Date.now(),
          }));
          setMessages(mapped);
          localStorage.setItem('sophia_floating_ai_msgs', JSON.stringify(mapped));
        }
      } catch {
        /* keep local cache */
      }
    })();
    return () => { cancelled = true; };
  }, [conversationId]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), role: 'user', content: text, ts: Date.now() };
    setMessages(prev => {
      const next = [...prev, userMsg];
      localStorage.setItem('sophia_floating_ai_msgs', JSON.stringify(next));
      return next;
    });
    setInput('');
    setLoading(true);

    let reply;
    try {
      const res = await api.getCoachReply(text, conversationId);
      reply = res?.assistant_text;
    } catch {
      reply = null;
    }
    // Fall back to the local contextual guidance if the backend is unreachable.
    if (!reply) reply = generateReply(text, guidance.label);

    const aiMsg = { id: Date.now() + 1, role: 'assistant', content: reply, ts: Date.now() };
    setMessages(prev => {
      const next = [...prev, aiMsg];
      localStorage.setItem('sophia_floating_ai_msgs', JSON.stringify(next));
      return next;
    });
    setLoading(false);
  }, [guidance.label, conversationId]);

  return (
    <>
      <style>{`
        @keyframes floatAI-slideUp { from { opacity:0; transform:translateY(16px) scale(0.95) } to { opacity:1; transform:translateY(0) scale(1) } }
        .floatAI-fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(201,168,76,0.45), 0 0 50px rgba(201,168,76,0.15) !important; }
        .floatAI-tip:hover { background: #1e1c14 !important; color: #c9a84c !important; border-color: #c9a84c40 !important; }
      `}</style>

      {/* Floating button */}
      <button
        className="floatAI-fab"
        style={s.fab}
        onClick={() => setOpen(!open)}
        title="Sophia Guide"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1200" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1200" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a7 7 0 017 7c0 3-2 5.5-4 7l-1 4h-4l-1-4c-2-1.5-4-4-4-7a7 7 0 017-7z"/>
            <circle cx="12" cy="9" r="2"/>
            <line x1="10" y1="20" x2="14" y2="20"/>
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={s.panel}>
          {/* Header */}
          <div style={s.header}>
            <span style={s.headerTitle}>Sophia Guide</span>
            <span style={s.headerBadge}>{isWelcomeMode ? '✨ Welcome' : guidance.label}</span>
          </div>

          {/* Chat messages */}
          <div style={s.chatArea}>
            {/* Section / welcome greeting */}
            <div style={s.msgRow(false)}>
              <div style={{ ...s.bubble(false), whiteSpace: 'pre-line' }}>{activeGreeting}</div>
            </div>

            {messages.map(msg => (
              <div key={msg.id} style={s.msgRow(msg.role === 'user')}>
                <div style={s.bubble(msg.role === 'user')}>{msg.content}</div>
              </div>
            ))}

            {loading && (
              <div style={s.msgRow(false)}>
                <div style={{ ...s.bubble(false), color: '#4a4a62' }}>typing...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggested tips — personalised from onboarding or section context */}
          {messages.length === 0 && (
            <div style={s.tipsArea}>
              <div style={s.tipLabel}>{isWelcomeMode ? "Let's get started:" : 'Try asking:'}</div>
              {activeTips.map((tip, i) => (
                <button key={i} className="floatAI-tip" style={s.tipBtn}
                  onClick={() => sendMessage(tip)}>
                  → {tip}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={s.inputRow}>
            <input
              style={s.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask me anything..."
            />
            <button style={{ ...s.sendBtn, opacity: !input.trim() ? 0.5 : 1 }}
              onClick={() => sendMessage(input)} disabled={!input.trim() || loading}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
