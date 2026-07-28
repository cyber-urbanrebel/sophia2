/* ═══════════════════════════════════════════════════════════
   APP.JS — Router, State Management, Init, Icons, Seed Data
   ═══════════════════════════════════════════════════════════ */

// ═══ SVG ICONS ═══
const Icons = (() => {
  const svgs = {
    // Navigation
    path: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 12l4 4 6-6 6 6 4-4L12 2z"/><path d="M12 22V12"/><circle cx="12" cy="5" r="1" fill="currentColor"/></svg>`,
    mind: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.5 4.5-3 6s-2 3-2 5h-4c0-2-0.5-3.5-2-5s-3-3.5-3-6a7 7 0 0 1 7-7z"/><path d="M9 22h6" class="svg-brain-highlight"/><path d="M10 18h4"/></svg>`,
    body: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="2 12 5 12 7 4 10 20 13 8 15 14 17 12 22 12"/></svg>`,
    discipline: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svg-lightning"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
    growth: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V8" class="svg-seedling"/><path d="M5 12c0-5 7-10 7-10s7 5 7 10"/><path d="M12 8c-3 0-5-2.5-5-5"/><path d="M12 8c3 0 5-2.5 5-5"/></svg>`,
    habits: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/><path d="M9 12h6"/><circle cx="12" cy="6" r="3"/><circle cx="12" cy="18" r="3"/><path d="M12 9v6"/></svg>`,
    journal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svg-quill"><path d="M17 3a2.82 2.82 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`,
    progress: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
    admin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
    payment: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
    dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>`,
    tasks: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
    // Utility
    flame: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="svg-flame"><path d="M12 22c-4.97 0-8-3.58-8-7.5 0-4 3-7.5 4-9 .67 2.5 2 3 3 3-1-3 1.5-7 4-8.5.5 3 2.5 5 4 6 1.5 1 3 3.5 3 5.5 0 5-4 10.5-10 10.5z" fill="var(--gold)" stroke="var(--gold)"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svg-bell"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" stroke-opacity="0.3"/><polyline points="9 12 11.5 14.5 15.5 9.5" class="svg-check-animated"/></svg>`,
    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--rose)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>`,
    logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H2V5h4"/><path d="M18 9h4V5h-4"/><path d="M6 5a6 6 0 0 0 12 0"/><path d="M12 11v5"/><path d="M8 20h8"/><path d="M10 16h4"/></svg>`,
    hamburger: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
    star: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    // Animated habit icons
    meditation: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7" opacity="0.5"><animate attributeName="r" values="7;10;7" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.5;0.1;0.5" dur="3s" repeatCount="indefinite"/></circle><circle cx="12" cy="12" r="10" opacity="0.2"><animate attributeName="r" values="10;14;10" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.2;0;0.2" dur="3s" repeatCount="indefinite"/></circle></svg>`,
    workout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="svg-dumbbell"><rect x="2" y="9" width="4" height="6" rx="1"/><rect x="18" y="9" width="4" height="6" rx="1"/><line x1="6" y1="12" x2="18" y2="12"/><rect x="6" y="7" width="3" height="10" rx="1"/><rect x="15" y="7" width="3" height="10" rx="1"/></svg>`,
    reading: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  };

  function get(name, size = 24) {
    const svg = svgs[name] || svgs.info;
    return `<span class="icon" style="width:${size}px;height:${size}px;display:inline-flex;">${svg}</span>`;
  }
  function getSmall(name) { return get(name, 16); }
  function getRaw(name) { return svgs[name] || ''; }

  return { get, getSmall, getRaw, svgs };
})();


// ═══ SEED DATA ═══
const SeedData = (() => {
  function seedForNewUser() {
    seedHabits();
    seedGoals();
    seedTasks();
    seedJournal();
    seedProgress();
    seedContent();
    seedWorkouts();
  }

  function seedHabits() {
    if (Storage.getAll(Storage.KEYS.HABITS).length > 0) return;
    const habits = [
      { id: 'h1', name: 'Morning Meditation', type: 'daily', domain: 'spiritual', streak: 30, bestStreak: 30, cue: 'After waking up', reward: 'Calm start to day', difficulty: 3, activeDays: [0,1,2,3,4,5,6], logs: genLogs(30) },
      { id: 'h2', name: 'Read 20 Pages', type: 'daily', domain: 'mental', streak: 7, bestStreak: 14, cue: 'Before bed', reward: 'New knowledge', difficulty: 2, activeDays: [0,1,2,3,4,5,6], logs: genLogs(7) },
      { id: 'h3', name: 'Exercise', type: 'daily', domain: 'physical', streak: 7, bestStreak: 21, cue: 'After work', reward: 'Endorphins', difficulty: 4, activeDays: [1,2,3,4,5], logs: genLogs(7) },
      { id: 'h4', name: 'Journal before bed', type: 'daily', domain: 'emotional', streak: 3, bestStreak: 10, cue: 'After dinner', reward: 'Self-clarity', difficulty: 2, activeDays: [0,1,2,3,4,5,6], logs: genLogs(3) },
      { id: 'h5', name: 'No social media until noon', type: 'avoidance', domain: 'mental', streak: 5, bestStreak: 12, cue: 'Morning routine', reward: 'Focus', difficulty: 3, activeDays: [1,2,3,4,5], logs: genLogs(5) },
    ];
    Storage.set(Storage.KEYS.HABITS, habits);
  }

  function genLogs(days) {
    const logs = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      logs.push({ date: Utils.toDateKey(d), status: 'complete', note: '' });
    }
    return logs;
  }

  function seedGoals() {
    if (Storage.getAll(Storage.KEYS.GOALS).length > 0) return;
    const goals = [
      { id: 'g1', domain: 'physical', title: 'Run a half marathon', description: 'Build endurance to complete a half marathon in under 2 hours', targetDate: '2026-09-01', priority: 4, progress: 35, status: 'active', milestones: [
        { id: 'm1', text: 'Run 5km without stopping', done: true },
        { id: 'm2', text: 'Complete 10km race', done: true },
        { id: 'm3', text: 'Reach 15km long run', done: false },
        { id: 'm4', text: 'Run half marathon', done: false },
      ], linkedHabits: ['h3'], successCriteria: 'Finish under 2 hours', obstacles: 'Weather, injury risk' },
      { id: 'g2', domain: 'professional', title: 'Learn system design', description: 'Master distributed system design patterns for senior engineering', targetDate: '2026-06-30', priority: 5, progress: 60, status: 'active', milestones: [
        { id: 'm5', text: 'Complete design patterns course', done: true },
        { id: 'm6', text: 'Build 3 practice systems', done: true },
        { id: 'm7', text: 'Mock interviews', done: false },
      ], linkedHabits: ['h2'], successCriteria: 'Pass system design interview', obstacles: 'Time management' },
      { id: 'g3', domain: 'spiritual', title: 'Establish daily meditation practice', description: 'Build a consistent 20-min daily meditation habit', targetDate: '2026-12-31', priority: 3, progress: 75, status: 'active', milestones: [
        { id: 'm8', text: '7-day streak', done: true },
        { id: 'm9', text: '30-day streak', done: true },
        { id: 'm10', text: '90-day streak', done: false },
      ], linkedHabits: ['h1'], successCriteria: '90 consecutive days', obstacles: 'Restlessness' },
    ];
    Storage.set(Storage.KEYS.GOALS, goals);
  }

  function seedTasks() {
    if (Storage.getAll(Storage.KEYS.TASKS).length > 0) return;
    const tasks = [
      { id: 't1', title: 'Review training plan', description: 'Update weekly running schedule', priority: 'high', domain: 'physical', status: 'done', dueDate: Utils.daysAgo(2), subtasks: [{id:'s1',text:'Check mileage',done:true},{id:'s2',text:'Plan routes',done:true}], goalId: 'g1', timeEstimate: 1, timeLogged: 0.5 },
      { id: 't2', title: 'Read chapter on CAP theorem', description: '', priority: 'medium', domain: 'professional', status: 'in-progress', dueDate: Utils.today(), subtasks: [{id:'s3',text:'Read chapter',done:true},{id:'s4',text:'Take notes',done:false},{id:'s5',text:'Practice problems',done:false}], goalId: 'g2', timeEstimate: 2, timeLogged: 1 },
      { id: 't3', title: 'Sign up for 10K race', description: 'Find local race in next 2 months', priority: 'medium', domain: 'physical', status: 'backlog', dueDate: Utils.today(), subtasks: [], goalId: 'g1', timeEstimate: 0.5, timeLogged: 0 },
      { id: 't4', title: 'Write meditation journal reflection', description: 'Document insights from 30-day streak', priority: 'low', domain: 'spiritual', status: 'backlog', dueDate: Utils.today(), subtasks: [], goalId: 'g3', timeEstimate: 0.5, timeLogged: 0 },
      { id: 't5', title: 'Design microservices project', description: 'Architecture for practice project #3', priority: 'high', domain: 'professional', status: 'in-progress', dueDate: Utils.today(), subtasks: [{id:'s6',text:'Define services',done:true},{id:'s7',text:'API contracts',done:false},{id:'s8',text:'Database schema',done:false},{id:'s9',text:'Deploy plan',done:false},{id:'s10',text:'Documentation',done:false}], goalId: 'g2', timeEstimate: 4, timeLogged: 2 },
      { id: 't6', title: 'Prepare healthy meal plan', description: 'Plan meals for the coming week', priority: 'medium', domain: 'physical', status: 'backlog', dueDate: Utils.today(), subtasks: [], goalId: null, timeEstimate: 1, timeLogged: 0 },
      { id: 't7', title: 'Complete system design mock', description: 'Do timed mock interview', priority: 'critical', domain: 'professional', status: 'review', dueDate: Utils.today(), subtasks: [{id:'s11',text:'Pick topic',done:true},{id:'s12',text:'40min design',done:true}], goalId: 'g2', timeEstimate: 1.5, timeLogged: 1.5 },
      { id: 't8', title: 'Buy new running shoes', description: '', priority: 'low', domain: 'physical', status: 'done', dueDate: Utils.daysAgo(5), subtasks: [], goalId: 'g1', timeEstimate: 0.5, timeLogged: 0.5 },
    ];
    Storage.set(Storage.KEYS.TASKS, tasks);
  }

  function seedJournal() {
    if (Storage.getAll(Storage.KEYS.JOURNAL).length > 0) return;
    const entries = [];
    const prompts = ['What challenged me today?', 'What am I grateful for?', 'What did I learn?', 'How did I grow?', 'What would I change?'];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      entries.push({
        id: 'j' + (5 - i),
        date: Utils.toDateKey(d),
        prompt: prompts[i],
        content: `Today was a day of reflection and focus. I worked on my goals and maintained my streaks. The key insight was about consistency — showing up matters more than perfection. Entry ${5-i} of my journey.`,
        mood: 5 + Math.floor(Math.random() * 4),
        tags: ['reflection', Utils.DOMAINS[i % 8].id],
        type: i % 2 === 0 ? 'prompted' : 'freewrite',
        wordCount: 30 + Math.floor(Math.random() * 20),
      });
    }
    Storage.set(Storage.KEYS.JOURNAL, entries);
  }

  function seedProgress() {
    if (Storage.get(Storage.KEYS.PROGRESS)) return;
    const progress = {
      xp: 2450,
      level: 5,
      domainScores: { physical: 45, mental: 62, emotional: 38, spiritual: 55, professional: 71, financial: 28, relationships: 42, creative: 35 },
      weeklyData: [],
    };
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      progress.weeklyData.push({
        date: Utils.toDateKey(d),
        habitsCompleted: Math.floor(Math.random() * 5) + 1,
        xpEarned: Math.floor(Math.random() * 100) + 30,
      });
    }
    Storage.set(Storage.KEYS.PROGRESS, progress);
  }

  function seedContent() {
    if (Storage.getAll(Storage.KEYS.CONTENT_DB).length > 0) return;
    const content = [
      { id: 'c1', title: 'The Obstacle Is the Way', tradition: 'Stoicism', format: 'article', duration: 8, difficulty: 'introductory', body: 'Marcus Aurelius taught that every obstacle contains within it an opportunity for growth. When we reframe difficulties as training grounds for virtue, we transform suffering into strength.', source: 'Meditations, Book V', reflection: 'What obstacle in your life could be reframed as an opportunity?', applyToday: 'Choose one difficulty today and consciously practice viewing it as training.', saved: false, applied: false, read: false },
      { id: 'c2', title: 'The Middle Way', tradition: 'Buddhism', format: 'article', duration: 6, difficulty: 'introductory', body: 'The Buddha discovered that neither extreme asceticism nor indulgence leads to enlightenment. The middle path of moderation brings clarity and peace.', source: 'Dhammacakkappavattana Sutta', reflection: 'Where in your life are you operating in extremes?', applyToday: 'Identify one area where you can find better balance.', saved: false, applied: false, read: false },
      { id: 'c3', title: 'Radical Responsibility', tradition: 'Existentialism', format: 'article', duration: 10, difficulty: 'intermediate', body: 'Sartre argued that we are condemned to be free. Every moment requires a choice, and in choosing, we define ourselves. There are no excuses.', source: 'Being and Nothingness', reflection: 'What choice have you been avoiding?', applyToday: 'Make one decision you have been postponing.', saved: false, applied: false, read: false },
      { id: 'c4', title: 'Flow States & Peak Performance', tradition: 'Positive Psychology', format: 'article', duration: 12, difficulty: 'intermediate', body: 'Csikszentmihalyi discovered that optimal experience occurs when challenge meets skill. Flow is the state where we perform at our best.', source: 'Flow: The Psychology of Optimal Experience', reflection: 'When did you last experience flow?', applyToday: 'Set up conditions for flow: clear goals, immediate feedback, challenge-skill balance.', saved: false, applied: false, read: false },
      { id: 'c5', title: 'Memento Mori', tradition: 'Stoicism', format: 'exercise', duration: 5, difficulty: 'introductory', body: 'The Stoics practiced remembering death — not as morbidity, but as motivation. When we remember our time is limited, we use it wisely.', source: 'Seneca, Letters', reflection: 'If this were your last day, what would you prioritize?', applyToday: 'Spend 5 minutes in quiet reflection on the preciousness of time.', saved: false, applied: false, read: false },
      { id: 'c6', title: 'Mindful Breathing', tradition: 'Mindfulness', format: 'exercise', duration: 10, difficulty: 'introductory', body: 'Anchor your awareness to the breath. Notice each inhale and exhale without judgment. When the mind wanders, gently return.', source: 'Anapanasati Sutta', reflection: 'How did your mind respond to stillness?', applyToday: 'Practice 3 cycles of mindful breathing before a meeting.', saved: false, applied: false, read: false },
      { id: 'c7', title: 'The 7 Habits Framework', tradition: 'Leadership', format: 'article', duration: 15, difficulty: 'intermediate', body: 'Covey identified 7 habits of effective people: Be proactive, begin with the end in mind, put first things first, think win-win, seek first to understand, synergize, and sharpen the saw.', source: 'Stephen Covey', reflection: 'Which habit needs most attention in your life?', applyToday: 'Practice one habit consciously throughout the day.', saved: false, applied: false, read: false },
      { id: 'c8', title: 'Compound Interest of Self-Improvement', tradition: 'Finance', format: 'article', duration: 7, difficulty: 'introductory', body: 'Just as money compounds, so do habits. A 1% improvement daily leads to 37x improvement in a year. Small actions create extraordinary results.', source: 'James Clear, Atomic Habits', reflection: 'What 1% improvement can you make today?', applyToday: 'Choose one micro-habit to improve by 1%.', saved: false, applied: false, read: false },
      { id: 'c9', title: 'The Dichotomy of Control', tradition: 'Stoicism', format: 'article', duration: 8, difficulty: 'introductory', body: 'Epictetus taught the most fundamental Stoic principle: some things are within our control (opinions, desires, actions) and some are not (body, reputation, others). Freedom comes from focusing only on what we control.', source: 'Enchiridion', reflection: 'What are you trying to control that is not within your power?', applyToday: 'Write down 3 things in your control and 3 outside it.', saved: false, applied: false, read: false },
      { id: 'c10', title: 'Loving-Kindness Practice', tradition: 'Buddhism', format: 'exercise', duration: 15, difficulty: 'introductory', body: 'Metta meditation cultivates unconditional goodwill toward yourself and all beings. Begin with self, extend to loved ones, neutral people, difficult people, then all beings.', source: 'Karaniya Metta Sutta', reflection: 'How did extending kindness feel?', applyToday: 'Silently wish well to three people you encounter.', saved: false, applied: false, read: false },
      { id: 'c11', title: 'Mans Search for Meaning', tradition: 'Existentialism', format: 'article', duration: 12, difficulty: 'advanced', body: 'Viktor Frankl survived the Holocaust and concluded that meaning—not pleasure or power—is the primary human drive. We find meaning through work, love, and suffering.', source: 'Viktor Frankl', reflection: 'What gives your life meaning right now?', applyToday: 'Identify one meaningful task and give it your full attention.', saved: false, applied: false, read: false },
      { id: 'c12', title: 'Negative Visualization', tradition: 'Stoicism', format: 'exercise', duration: 8, difficulty: 'intermediate', body: 'The Stoics practiced premeditatio malorum — imagining worst-case scenarios not to panic, but to prepare and appreciate what we have.', source: 'Seneca, De Tranquillitate Animi', reflection: 'What negative event are you most afraid of? How would you handle it?', applyToday: 'Spend 5 minutes imagining losing something you value. Notice the gratitude.', saved: false, applied: false, read: false },
      { id: 'c13', title: 'Deep Work Protocols', tradition: 'Leadership', format: 'article', duration: 10, difficulty: 'intermediate', body: 'Cal Newport argues that the ability to perform deep, focused work is becoming rare and valuable. Schedule blocks, eliminate distractions, embrace boredom.', source: 'Deep Work', reflection: 'How much deep work did you do this week?', applyToday: 'Block 90 minutes for uninterrupted deep work.', saved: false, applied: false, read: false },
      { id: 'c14', title: 'Body Scan Meditation', tradition: 'Mindfulness', format: 'exercise', duration: 20, difficulty: 'introductory', body: 'Systematically bring awareness to each part of your body, from feet to crown. Notice sensations without judgment. Release tension as you go.', source: 'Jon Kabat-Zinn', reflection: 'Where do you hold tension in your body?', applyToday: 'Do a 5-minute body scan before sleep tonight.', saved: false, applied: false, read: false },
      { id: 'c15', title: 'The Four Agreements', tradition: 'Positive Psychology', format: 'article', duration: 8, difficulty: 'introductory', body: 'Be impeccable with your word. Dont take anything personally. Dont make assumptions. Always do your best.', source: 'Don Miguel Ruiz', reflection: 'Which agreement do you most struggle with?', applyToday: 'Pick one agreement and practice it all day.', saved: false, applied: false, read: false },
    ];
    Storage.set(Storage.KEYS.CONTENT_DB, content);
    Storage.set(Storage.KEYS.CONTENT, content.slice(0, 5).map(c => ({ ...c })));
  }

  function seedWorkouts() {
    if (Storage.getAll(Storage.KEYS.WORKOUTS).length > 0) return;
    Storage.set(Storage.KEYS.WORKOUTS, [{
      id: 'w1', name: 'Beginner Strength', difficulty: 'beginner', goalId: 'g1',
      sessions: [
        { id: 'ws1', name: 'Day A — Upper Body', exercises: [
          { name: 'Push-ups', sets: 3, reps: 10, weight: 0, rest: 60, notes: 'Keep core tight' },
          { name: 'Dumbbell Rows', sets: 3, reps: 10, weight: 15, rest: 60, notes: 'Squeeze at top' },
          { name: 'Shoulder Press', sets: 3, reps: 8, weight: 12, rest: 90, notes: 'Control the negative' },
        ]},
        { id: 'ws2', name: 'Day B — Lower Body', exercises: [
          { name: 'Squats', sets: 4, reps: 12, weight: 0, rest: 60, notes: 'Below parallel' },
          { name: 'Lunges', sets: 3, reps: 10, weight: 0, rest: 60, notes: 'Each leg' },
          { name: 'Calf Raises', sets: 3, reps: 15, weight: 0, rest: 45, notes: 'Slow eccentric' },
        ]},
        { id: 'ws3', name: 'Day C — Full Body', exercises: [
          { name: 'Burpees', sets: 3, reps: 8, weight: 0, rest: 90, notes: 'Full range' },
          { name: 'Plank', sets: 3, reps: 1, weight: 0, rest: 60, notes: '45 seconds each' },
          { name: 'Jumping Jacks', sets: 3, reps: 20, weight: 0, rest: 45, notes: 'Keep pace' },
        ]},
      ],
    }]);
  }

  function seedMetrics() {
    if (Storage.getAll(Storage.KEYS.METRICS).length > 0) return;
    const metrics = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      metrics.push({
        date: Utils.toDateKey(d),
        weight: 75 + Math.random() * 2 - 1,
        sleep: 6 + Math.random() * 2,
        energy: Math.floor(Math.random() * 4) + 6,
        restingHR: 58 + Math.floor(Math.random() * 8),
      });
    }
    Storage.set(Storage.KEYS.METRICS, metrics);
  }

  function ensureSeeded() {
    if (!Storage.hasData()) return;
    seedContent();
    seedMetrics();
  }

  return { seedForNewUser, ensureSeeded };
})();


// ═══ APP / ROUTER ═══
const App = (() => {
  let currentPage = null;
  let cleanupFn = null;

  const routes = {
    '#dashboard':  { load: () => Dashboard, title: 'Dashboard' },
    '#path':       { load: () => Path, title: 'Life Planning' },
    '#tasks':      { load: () => Tasks, title: 'Task Manager' },
    '#mind':       { load: () => Mind, title: 'Mental Mastery' },
    '#body':       { load: () => Body, title: 'Physical Excellence' },
    '#discipline': { load: () => Discipline, title: 'Willpower Training' },
    '#journal':    { load: () => Journal, title: 'Reflection Studio' },
    '#progress':   { load: () => Progress, title: 'Analytics' },
    '#payment':    { load: () => Payment, title: 'Plans & Pricing' },
    '#admin':      { load: () => Admin, title: 'Admin Panel' },
  };

  function init() {
    // Start particle background (runs behind auth overlay too)
    if (typeof ParticleEngine !== 'undefined') ParticleEngine.start('pcanvas');

    if (!Storage.isLoggedIn()) { Auth.init(); return; }

    SeedData.ensureSeeded();
    Charts.setDefaults();
    renderShell();
    bindGlobalEvents();
    Notifications.init();

    if (!window.location.hash || window.location.hash === '#') {
      window.location.hash = '#dashboard';
    }
    route();
  }

  function renderShell() {
    const user = Storage.getUser();
    const progress = Storage.getProgress();
    const habits = Storage.getAll(Storage.KEYS.HABITS);
    const streak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
    const dayCount = Math.floor((Date.now() - new Date(user.joinDate).getTime()) / 86400000) + 1;
    const isAdmin = user.role === 'admin';

    // Sidebar
    document.getElementById('sidebar').innerHTML = `
      <div class="sidebar-brand">
        <div class="sidebar-brand-name">SOPHIA</div>
        <div class="sidebar-brand-sub">SELF-DEVELOPMENT ENGINE</div>
      </div>
      <div class="sidebar-user">
        <div class="sidebar-avatar" style="background:${Utils.avatarGradient(user.name)}">${Utils.initials(user.name)}</div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">${Utils.escapeHtml(user.name)}</div>
          <div class="sidebar-user-plan"><span class="badge badge-gold" style="font-size:0.6rem;">${user.plan}</span></div>
        </div>
      </div>
      <div class="sidebar-counters">
        <div class="sidebar-counter">
          ${Icons.get('flame', 18)}
          <span class="counter-value">${streak}</span> streak
        </div>
        <div class="sidebar-counter">
          ${Icons.get('calendar', 18)}
          Day <span class="counter-value">${dayCount}</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        <a class="nav-item" data-page="#dashboard">${Icons.get('dashboard', 20)}<span class="nav-label">Dashboard</span></a>
        <a class="nav-item" data-page="#path">${Icons.get('path', 20)}<span class="nav-label">Path</span></a>
        <a class="nav-item" data-page="#tasks">${Icons.get('tasks', 20)}<span class="nav-label">Tasks</span></a>
        <a class="nav-item" data-page="#mind">${Icons.get('mind', 20)}<span class="nav-label">Mind</span></a>
        <a class="nav-item" data-page="#body">${Icons.get('body', 20)}<span class="nav-label">Body</span></a>
        <a class="nav-item" data-page="#discipline">${Icons.get('discipline', 20)}<span class="nav-label">Discipline</span></a>
        <a class="nav-item" data-page="#growth">${Icons.get('growth', 20)}<span class="nav-label">Inner Growth</span></a>
        <a class="nav-item" data-page="#habits">${Icons.get('habits', 20)}<span class="nav-label">Habits</span></a>
        <a class="nav-item" data-page="#journal">${Icons.get('journal', 20)}<span class="nav-label">Journal</span></a>
        <a class="nav-item" data-page="#progress">${Icons.get('progress', 20)}<span class="nav-label">Progress</span></a>
        ${isAdmin ? `<a class="nav-item admin-only" data-page="#admin">${Icons.get('admin', 20)}<span class="nav-label">Admin</span></a>` : ''}
        <a class="nav-item" style="margin-top:auto;" id="logout-btn">${Icons.get('logout', 20)}<span class="nav-label">Sign Out</span></a>
      </nav>
    `;

    // Topbar
    const topbar = document.getElementById('topbar');
    topbar.innerHTML = `
      <div class="topbar-left">
        <button class="hamburger-btn" id="hamburger-btn">${Icons.get('hamburger', 24)}</button>
        <h1 class="topbar-title" id="topbar-title">Dashboard</h1>
      </div>
      <div class="topbar-right">
        <div class="topbar-meta">
          <span>${Utils.formatDate(new Date(), 'long')}</span>
          <span class="streak-badge">${Icons.getSmall('flame')} ${streak}</span>
          <span>Day ${dayCount}</span>
        </div>
        <button class="topbar-notification" id="notification-btn">
          ${Icons.get('bell', 20)}
          <span class="notification-badge"></span>
        </button>
        <button class="topbar-avatar-btn" style="background:${Utils.avatarGradient(user.name)}" id="profile-btn">${Utils.initials(user.name)}</button>
      </div>
    `;
  }

  function bindGlobalEvents() {
    window.addEventListener('hashchange', route);

    // Sidebar nav clicks
    document.getElementById('sidebar').addEventListener('click', e => {
      const item = e.target.closest('.nav-item[data-page]');
      if (item) {
        e.preventDefault();
        const page = item.dataset.page;
        // Map aliases
        if (page === '#growth') window.location.hash = '#mind';
        else if (page === '#habits') window.location.hash = '#discipline';
        else window.location.hash = page;
      }
    });

    document.getElementById('logout-btn')?.addEventListener('click', e => {
      e.preventDefault();
      Auth.logout();
    });

    // Hamburger
    document.getElementById('hamburger-btn')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
      const overlay = document.getElementById('sidebar-overlay');
      if (overlay) overlay.classList.toggle('active');
    });

    // Sidebar overlay close
    document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebar-overlay').classList.remove('active');
    });
  }

  function route() {
    const hash = window.location.hash || '#dashboard';
    const routeConfig = routes[hash];

    if (!routeConfig) {
      window.location.hash = '#dashboard';
      return;
    }

    // Admin guard
    if (hash === '#admin' && !Storage.isAdmin()) {
      window.location.hash = '#dashboard';
      Utils.toast('Access denied', 'error');
      return;
    }

    // Clean up previous page
    if (cleanupFn) { cleanupFn(); cleanupFn = null; }
    Charts.destroyAll();

    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === hash ||
        (hash === '#mind' && el.dataset.page === '#growth') ||
        (hash === '#discipline' && el.dataset.page === '#habits'));
    });

    // Update topbar title
    document.getElementById('topbar-title').textContent = routeConfig.title;

    // Render page
    const content = document.getElementById('main-content');
    content.style.animation = 'none';
    content.offsetHeight; // trigger reflow
    content.style.animation = '';

    try {
      const mod = routeConfig.load();
      if (mod && typeof mod.render === 'function') {
        content.innerHTML = mod.render();
        if (typeof mod.init === 'function') {
          cleanupFn = mod.init() || null;
        }
      }
    } catch (err) {
      console.error(`Error loading ${hash}:`, err);
      content.innerHTML = `<div class="empty-state"><h4>Page Error</h4><p>${Utils.escapeHtml(err.message)}</p></div>`;
    }

    currentPage = hash;
  }

  return { init, route, renderShell };
})();


// ═══ BOOT ═══
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
  if (Storage.isLoggedIn()) {
    // Show AI FAB for returning users
    const fab = document.getElementById('ai-fab');
    if (fab) fab.style.display = 'flex';
    App.init();
    AIAgent.init();
  }
});
