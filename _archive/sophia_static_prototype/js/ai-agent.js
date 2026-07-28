/* ═══════════════════════════════════════════════════════════
   AI-AGENT.JS — Floating AI Coach / Chat Panel
   ═══════════════════════════════════════════════════════════ */

const AIAgent = (() => {
  let isOpen = false;
  let history = [];

  // Contextual coaching responses
  const RESPONSES = {
    greet: [
      "Welcome back, {name}. What are you working on today?",
      "Good {timeOfDay}, {name}. How can I help you grow?",
      "Hello, {name}. Ready to push your limits today?",
    ],
    habit: [
      "Consistency is the mother of mastery. Have you logged your habits today?",
      "Small daily improvements over time lead to stunning results. Keep your streak alive.",
      "Remember: you're not building habits — you're building identity. Each log is a vote for the person you want to become.",
      "Your best streak is {streak} days. Let's keep that momentum going.",
    ],
    motivation: [
      "\"We suffer more in imagination than in reality.\" — Seneca. What's holding you back right now?",
      "The obstacle is the way. What challenge can you reframe as an opportunity today?",
      "Progress, not perfection. You're already ahead of yesterday's version of yourself.",
      "\"He who has a why to live can bear almost any how.\" — Nietzsche. Reconnect with your purpose.",
      "Discipline is choosing between what you want now and what you want most.",
    ],
    journal: [
      "Reflection is the bridge between experience and wisdom. Have you written in your journal today?",
      "A few minutes of writing can untangle hours of overthinking. Try the Reflection Studio.",
      "\"The unexamined life is not worth living.\" — Socrates. Your journal is your mirror.",
    ],
    goals: [
      "You have {activeGoals} active goals. Breaking them into milestones makes the path clearer.",
      "Review your goals weekly. Are they still aligned with your deepest values?",
      "Vision without execution is hallucination. What's one concrete step you can take right now?",
    ],
    tasks: [
      "Focus on your highest-leverage task first. What's in your 'In Progress' column?",
      "Try a Pomodoro session for deep work. Even 25 minutes of focused effort moves the needle.",
      "Done is better than perfect. Ship it, learn, iterate.",
    ],
    mind: [
      "Have you explored the Wisdom Library today? Ancient philosophy has modern applications.",
      "Reading without reflection is entertainment. Reading with reflection is transformation.",
      "Try applying one Stoic principle today: focus only on what you can control.",
    ],
    body: [
      "Your body is the vehicle for your ambitions. Have you moved today?",
      "Even a 20-minute walk can reset your mental state. Don't skip recovery.",
      "Track your sleep — it's the foundation of everything else.",
    ],
    fallback: [
      "That's an interesting question. Let me think about it from a Stoic perspective...",
      "I'd recommend exploring the {page} section for that. Would you like me to take you there?",
      "Every question is a seed of growth. What specific area would you like to improve?",
      "Let's break that down. What matters most to you about this?",
    ],
  };

  const KEYWORDS = {
    habit: ['habit', 'streak', 'daily', 'routine', 'discipline', 'consistent'],
    motivation: ['motivat', 'inspire', 'stuck', 'struggling', 'hard', 'give up', 'tired', 'can\'t', 'help me', 'lazy'],
    journal: ['journal', 'reflect', 'write', 'writing', 'thought', 'feeling', 'mood'],
    goals: ['goal', 'plan', 'vision', 'milestone', 'future', 'achieve', 'dream'],
    tasks: ['task', 'todo', 'focus', 'pomodoro', 'productive', 'work', 'priorit'],
    mind: ['wisdom', 'read', 'stoic', 'philosophy', 'meditat', 'mindful', 'learn', 'book'],
    body: ['exercise', 'workout', 'body', 'sleep', 'health', 'fitness', 'run', 'gym', 'weight'],
  };

  function categorize(msg) {
    const lower = msg.toLowerCase();
    for (const [cat, words] of Object.entries(KEYWORDS)) {
      if (words.some(w => lower.includes(w))) return cat;
    }
    return 'fallback';
  }

  function fillTemplate(text) {
    const user = Storage.getUser?.() || {};
    const habits = Storage.getAll?.(Storage.KEYS.HABITS) || [];
    const goals = Storage.getAll?.(Storage.KEYS.GOALS) || [];
    const streak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
    const activeGoals = goals.filter(g => g.status === 'active').length;
    const page = location.hash.replace('#', '') || 'dashboard';

    return text
      .replace(/{name}/g, user.name?.split(' ')[0] || 'friend')
      .replace(/{timeOfDay}/g, Utils.timeOfDay?.() || 'day')
      .replace(/{streak}/g, streak)
      .replace(/{activeGoals}/g, activeGoals)
      .replace(/{page}/g, page);
  }

  function getResponse(msg) {
    const cat = categorize(msg);
    const pool = RESPONSES[cat];
    const text = pool[Math.floor(Math.random() * pool.length)];
    return fillTemplate(text);
  }

  function addMessage(text, sender) {
    const container = document.getElementById('ai-messages');
    if (!container) return;

    const div = document.createElement('div');
    div.className = `ai-msg ai-msg-${sender}`;
    div.innerHTML = `<div class="ai-msg-bubble">${Utils.escapeHtml(text)}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    history.push({ sender, text });
  }

  function showTyping() {
    const container = document.getElementById('ai-messages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'ai-msg ai-msg-bot ai-typing';
    div.innerHTML = `<div class="ai-msg-bubble"><span class="typing-dots"><span></span><span></span><span></span></span></div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function removeTyping() {
    document.querySelector('.ai-typing')?.remove();
  }

  function toggle() {
    isOpen = !isOpen;
    const panel = document.getElementById('ai-panel');
    const fab = document.getElementById('ai-fab');
    if (!panel) return;
    panel.classList.toggle('open', isOpen);
    fab?.classList.toggle('active', isOpen);

    if (isOpen && history.length === 0) {
      // Send greeting
      const greet = RESPONSES.greet[Math.floor(Math.random() * RESPONSES.greet.length)];
      addMessage(fillTemplate(greet), 'bot');
    }
    if (isOpen) {
      setTimeout(() => document.getElementById('ai-input')?.focus(), 200);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('ai-input');
    const text = input?.value?.trim();
    if (!text) return;

    addMessage(text, 'user');
    input.value = '';

    showTyping();
    const delay = 600 + Math.random() * 800;
    setTimeout(() => {
      removeTyping();
      addMessage(getResponse(text), 'bot');
    }, delay);
  }

  function init() {
    document.getElementById('ai-fab')?.addEventListener('click', toggle);
    document.getElementById('ai-panel-close')?.addEventListener('click', toggle);
    document.getElementById('ai-input-form')?.addEventListener('submit', handleSubmit);
  }

  return { init, toggle };
})();
