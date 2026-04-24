import React, { useState, useEffect, useCallback } from 'react';
import JournalPage from './JournalPage';
import { renderIcon } from './SophiaIcons.jsx';

// Custom useLocalStorage hook
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving to localStorage: ${error}`);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

// ═══════════════════════════════════════════════════════════════
// STYLES OBJECT
// ═══════════════════════════════════════════════════════════════
const styles = {
  container: {
    padding: '0',
    width: '100%',
    paddingBottom: '40px',
  },
  tabNav: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    overflowX: 'auto',
    paddingBottom: '8px',
  },
  tabContent: {
    minHeight: '400px',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '8px',
  },
  modelsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '12px',
    marginTop: '16px',
  },
  modelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  modelDescription: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    color: '#aaa',
  },
  expandedContent: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  tryItSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  contextBanner: {
    backgroundColor: 'rgba(0,255,255,0.1)',
    border: '1px solid #00FFFF',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '16px',
  },
  textarea: {
    backgroundColor: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '4px',
    color: '#fff',
    padding: '8px',
    fontFamily: 'monospace',
    fontSize: '13px',
    resize: 'vertical',
    minHeight: '60px',
  },
  button: {
    backgroundColor: '#00FFFF',
    color: '#000',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '13px',
  },
  input: {
    backgroundColor: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '4px',
    color: '#fff',
    padding: '8px 12px',
    fontSize: '13px',
    marginBottom: '8px',
    fontFamily: 'inherit',
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: '#333',
    outline: 'none',
    accentColor: '#00FFFF',
  },
  readingStats: {
    backgroundColor: 'rgba(0,255,255,0.1)',
    border: '1px solid rgba(0,255,255,0.3)',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '16px',
  },
  addButton: {
    backgroundColor: '#333',
    color: '#00FFFF',
    border: '1px solid #00FFFF',
    borderRadius: '4px',
    padding: '8px 16px',
    cursor: 'pointer',
    marginBottom: '12px',
    fontSize: '13px',
  },
  addBookForm: {
    backgroundColor: 'rgba(0,255,255,0.05)',
    border: '1px solid rgba(0,255,255,0.2)',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  booksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px',
  },
  pillButton: {
    border: '1px solid',
    borderRadius: '20px',
    padding: '4px 12px',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'none',
  },
  progressSection: {
    backgroundColor: 'rgba(0,255,255,0.1)',
    border: '1px solid rgba(0,255,255,0.2)',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '16px',
  },
  practicesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '24px',
  },
  practiceCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    padding: '12px',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  toolSection: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '16px',
  },
  matrix: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '12px',
  },
  quadrant: {
    border: '2px solid',
    borderRadius: '6px',
    padding: '12px',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  details: {
    marginBottom: '8px',
    cursor: 'pointer',
  },
  summary: {
    padding: '8px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  reflectionBanner: {
    backgroundColor: 'rgba(0,255,255,0.1)',
    border: '2px solid #00FFFF',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '16px',
  },
  statCard: {
    backgroundColor: 'rgba(0,255,255,0.05)',
    border: '1px solid rgba(0,255,255,0.2)',
    borderRadius: '6px',
    padding: '12px',
    textAlign: 'center',
  },
  badgeCard: {
    backgroundColor: 'rgba(0,255,255,0.1)',
    border: '1px solid rgba(0,255,255,0.3)',
    borderRadius: '6px',
    padding: '12px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  wellnessTrigger: {
    backgroundColor: 'rgba(255,170,0,0.1)',
    border: '2px solid #FFAA00',
    borderRadius: '6px',
    padding: '16px',
    marginTop: '16px',
    fontSize: '13px',
    lineHeight: '1.6',
  },
};

// ═══════════════════════════════════════════════════════════════
// MENTAL MODELS DATA
// ═══════════════════════════════════════════════════════════════
const MENTAL_MODELS = [
  {
    id: 1,
    emoji: '🔍',
    name: 'First Principles',
    description: 'Break any problem to its fundamental truths.',
    fullDescription: 'First Principles thinking means breaking down a complex problem into its core facts and building solutions from scratch.',
    tryItPrompt: 'What is the real core of a challenge you are facing today?',
    example: 'Instead of "how do I improve my diet?", ask "why do I eat?" (energy, taste, social) then rebuild from there.',
  },
  {
    id: 2,
    emoji: '🔄',
    name: 'Inversion',
    description: 'Think backwards. Ask what would guarantee failure.',
    fullDescription: 'Inversion asks you to reverse a problem to see it from a different angle.',
    tryItPrompt: 'What would make your current goal definitely fail? Now avoid those.',
    example: 'Instead of "how to build a successful startup?", ask "what kills startups?" (poor hiring, wrong market, burnout) then avoid those.',
  },
  {
    id: 3,
    emoji: '🌊',
    name: 'Second Order Thinking',
    description: 'Every action has consequences of consequences.',
    fullDescription: 'Second Order Thinking examines the consequences of consequences of your actions.',
    tryItPrompt: 'What happens after the obvious outcome of your next decision?',
    example: 'Taking on debt gives access to capital today, but creates stress, limits flexibility, and changes your risk tolerance for years.',
  },
  {
    id: 4,
    emoji: '🪒',
    name: "Occam's Razor",
    description: 'The simplest explanation is usually correct.',
    fullDescription: "Occam's Razor states that the simplest explanation requiring the fewest assumptions is typically correct.",
    tryItPrompt: 'What is the simplest explanation for why this problem exists?',
    example: 'Your project failed because the idea was bad, not because you needed better marketing or different timing.',
  },
  {
    id: 5,
    emoji: '🎯',
    name: 'Circle of Competence',
    description: 'Know clearly what you know and what you do not.',
    fullDescription: 'Circle of Competence means understanding your areas of expertise vs. speculation.',
    tryItPrompt: 'List 3 things you are confident in and 1 blind spot you have.',
    example: 'You understand marketing but not deep tech. Stay in your lane. Partner or learn before venturing out.',
  },
  {
    id: 6,
    emoji: '🧩',
    name: 'Mental Subtraction',
    description: 'Imagine if something good had never happened.',
    fullDescription: 'Mental Subtraction improves gratitude and perspective by imagining the absence of good things.',
    tryItPrompt: 'Remove one positive thing from your life. How does that feel? Be grateful.',
    example: 'Imagine you never met your best friend, got that job, or had your family. Realize their presence is a gift.',
  },
  {
    id: 7,
    emoji: '📊',
    name: 'Pareto Principle',
    description: '80% of results come from 20% of effort.',
    fullDescription: 'The Pareto Principle states that a small portion of inputs drive the majority of outputs.',
    tryItPrompt: 'What 20% of your actions drive 80% of your best results?',
    example: '20% of your contacts generate 80% of your opportunities. 20% of products generate 80% of revenue.',
  },
  {
    id: 8,
    emoji: '🎭',
    name: "Hanlon's Razor",
    description: 'Never attribute to malice what can be explained by misunderstanding.',
    fullDescription: "Hanlon's Razor teaches us to assume good intent and look for simpler explanations first.",
    tryItPrompt: 'Reinterpret a recent conflict assuming the other person meant no harm.',
    example: 'Your friend forgot your birthday. Instead of "they don\'t care", consider they forgot. A honest mistake, not malice.',
  },
];

// ═══════════════════════════════════════════════════════════════
// BOOKS DATA
// ═══════════════════════════════════════════════════════════════
const DEFAULT_BOOKS = [
  { id: 1, title: 'Meditations', author: 'Marcus Aurelius', category: 'Stoicism', status: 'to-read' },
  { id: 2, title: 'Atomic Habits', author: 'James Clear', category: 'Habits', status: 'to-read' },
  { id: 3, title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Psychology', status: 'to-read' },
  { id: 4, title: 'The Obstacle Is the Way', author: 'Ryan Holiday', category: 'Stoicism', status: 'to-read' },
  { id: 5, title: 'The 48 Laws of Power', author: 'Robert Greene', category: 'Strategy', status: 'to-read' },
  { id: 6, title: 'Antifragile', author: 'Nassim Taleb', category: 'Strategy', status: 'to-read' },
  { id: 7, title: 'Man\'s Search for Meaning', author: 'Viktor Frankl', category: 'Spirituality', status: 'to-read' },
  { id: 8, title: 'Deep Work', author: 'Cal Newport', category: 'Psychology', status: 'to-read' },
];

// ═══════════════════════════════════════════════════════════════
// QUIZ DATA
// ═══════════════════════════════════════════════════════════════
const QUIZ_QUESTIONS = [
  { q: 'What does First Principles thinking mean?', options: ['Break problems to fundamental truths', 'Copy what works', 'Trust your gut', 'Follow expert advice'], answer: 0, model: 'First Principles' },
  { q: 'Inversion asks you to think about...', options: ['How to succeed', 'What guarantees failure', "Other people's opinions", 'Past mistakes'], answer: 1, model: 'Inversion' },
  { q: 'Second Order Thinking means considering...', options: ['The first result', 'Consequences of consequences', "Other people's choices", 'Quick wins'], answer: 1, model: 'Second Order' },
  { q: "Occam's Razor suggests that...", options: ['Complex problems need complex solutions', 'The simplest explanation is usually correct', 'All options are equal', 'Experts are always right'], answer: 1, model: "Occam's Razor" },
  { q: 'The Pareto Principle states that roughly...', options: ['50% of effort drives 50% of results', '20% of causes drive 80% of results', 'All efforts are equal', 'Hard work always wins'], answer: 1, model: 'Pareto' },
  { q: 'Circle of Competence means...', options: ['Learning everything', 'Knowing what you know and don\'t', 'Pretending to know', 'Copying experts'], answer: 1, model: 'Circle of Competence' },
  { q: 'Atomic Habits author James Clear says habits are built on...', options: ['Willpower alone', 'Cue, Craving, Response, Reward', 'Morning routines only', 'Fear of failure'], answer: 1, model: 'Habits' },
  { q: 'Viktor Frankl believed the last human freedom is...', options: ['Physical freedom', 'Choosing your response to any situation', 'Wealth', 'Avoiding pain'], answer: 1, model: 'Purpose' },
  { q: 'The Stoic Dichotomy of Control says focus only on...', options: ["What others think", 'What is within your control', 'Your past', 'Future outcomes'], answer: 1, model: 'Stoicism' },
  { q: 'Deep Work by Cal Newport defines deep work as...', options: ['Working late at night', 'Distraction-free focused cognitive effort', 'Team collaboration', 'Multitasking'], answer: 1, model: 'Deep Work' },
  { q: 'Antifragile systems...', options: ['Break under stress', 'Get stronger from stress and chaos', 'Stay the same', 'Avoid all risk'], answer: 1, model: 'Antifragile' },
  { q: "Hanlon's Razor advises you never attribute to malice what can be explained by...", options: ['Stupidity', 'Misunderstanding or incompetence', 'Jealousy', 'Bad luck'], answer: 1, model: "Hanlon's Razor" },
  { q: 'The 5-Why method helps you find...', options: ['Quick fixes', 'The root cause of a problem', 'Excuses', 'Short-term solutions'], answer: 1, model: '5-Why' },
  { q: 'Mental Subtraction improves gratitude by...', options: ['Counting blessings', 'Imagining if something good had never happened', 'Comparing to others', 'Setting goals'], answer: 1, model: 'Mental Subtraction' },
  { q: 'The Eisenhower Matrix sorts tasks by...', options: ['Size and cost', 'Urgency and importance', 'Difficulty and time', 'Popularity and trend'], answer: 1, model: 'Eisenhower' },
  { q: 'Self-Determination Theory says intrinsic motivation needs...', options: ['Money and rewards', 'Autonomy, competence, and relatedness', 'Fear and pressure', 'Rules and structure'], answer: 1, model: 'SDT' },
  { q: "Carol Dweck's growth mindset believes abilities are...", options: ['Fixed from birth', 'Developed through effort', 'Inherited from parents', 'Determined by IQ'], answer: 1, model: 'Growth Mindset' },
  { q: 'The PERMA model by Seligman stands for...', options: ['Power, Energy, Resilience, Mastery, Ambition', 'Positive emotions, Engagement, Relationships, Meaning, Accomplishment', 'Performance, Effort, Results, Motivation, Achievement', 'none of these'], answer: 1, model: 'PERMA' },
  { q: 'Thinking Fast and Slow describes System 1 thinking as...', options: ['Slow and deliberate', 'Fast, automatic, and emotional', 'Logical and analytical', 'Creative and open'], answer: 1, model: 'Kahneman' },
  { q: 'The Obstacle Is the Way teaches that obstacles are...', options: ['To be avoided', 'The path forward itself', 'Signs to quit', "Other people's problems"], answer: 1, model: 'Stoicism' },
];

// ═══════════════════════════════════════════════════════════════
// REFLECTION PROMPTS
// ═══════════════════════════════════════════════════════════════
const REFLECTION_PROMPTS = [
  'What if your biggest current fear never actually happens?',
  'What if the obstacle you are facing is preparing you for something greater?',
  'What if you already have everything you need to succeed?',
  'What if the person who hurt you was doing the best they could?',
  'What if failure is just data, not a verdict on your worth?',
  'What if slowing down is actually the fastest path forward?',
  'What if you stopped waiting for permission to start?',
  'What if the life you want is one decision away?',
  'What if your past is a resource, not a prison?',
  'What if discomfort is just growth feeling uncomfortable?',
  'What if you trusted yourself more than you trust your doubts?',
  'What if everything happening right now is exactly right for where you are?',
  'What if the version of you from 5 years ago could see you now?',
  'What if your only competition is who you were yesterday?',
];

// ═══════════════════════════════════════════════════════════════
// DAILY PRACTICES
// ═══════════════════════════════════════════════════════════════
const DEFAULT_PRACTICES = [
  { id: 1, emoji: '🧘', name: 'Meditation', description: 'Sit quietly for 10 minutes, observe your thoughts without judgment.' },
  { id: 2, emoji: '📖', name: 'Read', description: 'Read 20 minutes from a book that challenges your thinking.' },
  { id: 3, emoji: '🤔', name: 'Reflect', description: 'Write one insight about yourself or the world.' },
  { id: 4, emoji: '💪', name: 'Move', description: 'Exercise for 20 minutes. Walk, run, or strength train.' },
  { id: 5, emoji: '🙏', name: 'Gratitude', description: 'Write down 3 things you\'re grateful for today.' },
  { id: 6, emoji: '💤', name: 'Rest', description: 'Get 7-8 hours of quality sleep.' },
];

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function MindSection() {
  const [activeTab, setActiveTab] = useState('models');
  
  // ═══════════════════════════════════════════════════════════════
  // TAB 1 — MENTAL MODELS
  // ═══════════════════════════════════════════════════════════════
  const [expandedModels, setExpandedModels] = useState({});
  const [masteredModels, setMasteredModels] = useLocalStorage('sophia_mastered_models', {});
  const [modelResponses, setModelResponses] = useLocalStorage('sophia_model_responses', {});
  
  const toggleModelExpand = (id) => {
    setExpandedModels(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleMastered = (id) => {
    setMasteredModels(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const [savedFlash, setSavedFlash] = useState({});

  const handleSaveResponse = (modelId) => {
    if (modelResponses[modelId]?.trim()) {
      setSavedFlash(prev => ({ ...prev, [modelId]: true }));
      setTimeout(() => setSavedFlash(prev => ({ ...prev, [modelId]: false })), 2000);
    }
  };

  const getContextBanner = () => {
    const bannerIndex = new Date().getMinutes() % 4;
    const banners = [
      'Did you apply First Principles to a decision today?',
      'Did you catch yourself assuming the worst about someone? Try Hanlon\'s Razor.',
      'What second-order consequence are you ignoring right now?',
      'Which 20% of your habits drive 80% of your growth?',
    ];
    return banners[bannerIndex];
  };

  // ═══════════════════════════════════════════════════════════════
  // TAB 2 — READING LIST
  // ═══════════════════════════════════════════════════════════════
  const [books, setBooks] = useLocalStorage('sophia_reading_list', DEFAULT_BOOKS);
  const [bookNotes, setBookNotes] = useLocalStorage('sophia_book_notes', {});
  const [onShowAddBook, setShowAddBook] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', category: 'Other' });
  const [expandedBooks, setExpandedBooks] = useState({});

  const addBook = () => {
    if (newBook.title && newBook.author) {
      setBooks(prev => [...prev, { id: Date.now(), ...newBook, status: 'to-read' }]);
      setNewBook({ title: '', author: '', category: 'Other' });
      setShowAddBook(false);
    }
  };

  const updateBookStatus = (id, status) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const bookStats = {
    finished: books.filter(b => b.status === 'finished').length,
    reading: books.filter(b => b.status === 'reading').length,
    toRead: books.filter(b => b.status === 'to-read').length,
  };

  const getReflectionPrompt = (category) => {
    const prompts = {
      'Stoicism': 'What is one thing today that is outside your control that you are worrying about?',
      'Habits': 'Describe one automatic behavior you noticed yourself doing today.',
      'Psychology': 'Describe one automatic behavior you noticed yourself doing today.',
      'Strategy': 'Where in your life are you being fragile when you could be antifragile?',
      'Spirituality': 'What spiritual practice resonates most with you right now?',
      'Other': 'What key insight from this book challenged your thinking?',
    };
    return prompts[category] || prompts['Other'];
  };

  // ═══════════════════════════════════════════════════════════════
  // TAB 3 — DAILY PRACTICES
  // ═══════════════════════════════════════════════════════════════
  const [todayCompletions, setTodayCompletions] = useLocalStorage('sophia_today_completions', '');
  const [fiveWhyAnalysis, setFiveWhyAnalysis] = useState('');
  const [fiveWhySteps, setFiveWhySteps] = useState({ why1: '', why2: '', why3: '', why4: '', why5: '' });
  const [savedFiveWhys, setSavedFiveWhys] = useLocalStorage('sophia_five_whys', []);
  const [matrixTasks, setMatrixTasks] = useLocalStorage('sophia_matrix', { q1: [], q2: [], q3: [], q4: [] });
  const [matrixInputs, setMatrixInputs] = useState({ q1: '', q2: '', q3: '', q4: '' });
  const [checkinToday, setCheckinToday] = useState(false);
  const [checkinData, setCheckinData] = useState({ mood: '', grateful: '', learned: '' });
  const [savedCheckins, setSavedCheckins] = useLocalStorage('sophia_checkins', []);

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const getCompletedToday = () => {
    const date = getTodayDate();
    const stored = todayCompletions ? JSON.parse(todayCompletions) : {};
    return stored[date] ? Object.keys(stored[date]).filter(k => stored[date][k]).length : 0;
  };

  const togglePractice = (id) => {
    const date = getTodayDate();
    const stored = todayCompletions ? JSON.parse(todayCompletions) : {};
    if (!stored[date]) stored[date] = {};
    stored[date][id] = !stored[date][id];
    setTodayCompletions(JSON.stringify(stored));
  };

  const isPracticeComplete = (id) => {
    const date = getTodayDate();
    const stored = todayCompletions ? JSON.parse(todayCompletions) : {};
    return stored[date] ? stored[date][id] : false;
  };

  const saveFiveWhy = () => {
    if (fiveWhyAnalysis && fiveWhySteps.why5) {
      setSavedFiveWhys(prev => [...prev, {
        id: Date.now(),
        problem: fiveWhyAnalysis,
        steps: fiveWhySteps,
        date: new Date().toLocaleDateString(),
      }]);
      setFiveWhyAnalysis('');
      setFiveWhySteps({ why1: '', why2: '', why3: '', why4: '', why5: '' });
    }
  };

  const addMatrixTask = (quadrant) => {
    if (matrixInputs[quadrant]) {
      setMatrixTasks(prev => ({
        ...prev,
        [quadrant]: [...prev[quadrant], { id: Date.now(), text: matrixInputs[quadrant] }],
      }));
      setMatrixInputs(prev => ({ ...prev, [quadrant]: '' }));
    }
  };

  const removeMatrixTask = (quadrant, taskId) => {
    setMatrixTasks(prev => ({
      ...prev,
      [quadrant]: prev[quadrant].filter(t => t.id !== taskId),
    }));
  };

  const submitCheckin = () => {
    if (checkinData.mood && checkinData.grateful && checkinData.learned) {
      setSavedCheckins(prev => [...prev, {
        date: getTodayDate(),
        ...checkinData,
      }]);
      setCheckinToday(true);
    }
  };

  const isCheckinDoneToday = () => {
    return savedCheckins.some(c => c.date === getTodayDate());
  };

  // ═══════════════════════════════════════════════════════════════
  // TAB 4 — QUIZ
  // ═══════════════════════════════════════════════════════════════
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizHistory, setQuizHistory] = useLocalStorage('sophia_quiz_history', []);

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setQuizAnswers([]);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  const selectAnswer = (index) => {
    if (selectedAnswer !== null) return; // Prevent changing answer
    setSelectedAnswer(index);
    
    setTimeout(() => {
      const isCorrect = index === QUIZ_QUESTIONS[currentQuestion].answer;
      if (isCorrect) setScore(prev => prev + 1);
      
      if (currentQuestion + 1 < QUIZ_QUESTIONS.length) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
        const weakAreas = QUIZ_QUESTIONS.filter((q, idx) => {
          return !quizAnswers[idx] && quizAnswers[idx] !== QUIZ_QUESTIONS[idx].answer;
        }).map(q => q.model);
        setQuizHistory(prev => [...prev, { date: new Date().toLocaleDateString(), score: score + (isCorrect ? 1 : 0), total: 20, weakAreas }]);
      }
    }, 1200);
  };

  const retakeQuiz = () => {
    startQuiz();
  };

  // ═══════════════════════════════════════════════════════════════
  // TAB 5 — REFLECT
  // ═══════════════════════════════════════════════════════════════
  const [reflectionStep, setReflectionStep] = useState(1);
  const [reflectionResponse, setReflectionResponse] = useLocalStorage('sophia_reflection_response', '');
  const [thoughtRecord, setThoughtRecord] = useState({ situation: '', thought: '', emotion: '', evidence_for: '', evidence_against: '', balanced: '' });
  const [savedThoughtRecords, setSavedThoughtRecords] = useLocalStorage('sophia_thought_records', []);

  const getReflectionPromptForDay = () => {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return REFLECTION_PROMPTS[dayOfYear % REFLECTION_PROMPTS.length];
  };

  const saveThoughtRecord = () => {
    if (thoughtRecord.situation && thoughtRecord.thought && thoughtRecord.emotion && thoughtRecord.evidence_for && thoughtRecord.evidence_against && thoughtRecord.balanced) {
      setSavedThoughtRecords(prev => [...prev, { id: Date.now(), date: new Date().toLocaleDateString(), ...thoughtRecord }]);
      setThoughtRecord({ situation: '', thought: '', emotion: '', evidence_for: '', evidence_against: '', balanced: '' });
      setReflectionStep(1);
    }
  };

  const deleteThoughtRecord = (id) => {
    setSavedThoughtRecords(prev => prev.filter(r => r.id !== id));
  };

  // ═══════════════════════════════════════════════════════════════
  // TAB 6 — MOOD
  // ═══════════════════════════════════════════════════════════════
  const [moodLog, setMoodLog] = useLocalStorage('sophia_mood_log', []);
  const [moodNote, setMoodNote] = useState('');
  const [badges, setBadges] = useLocalStorage('sophia_badges', {});

  const logMood = (mood) => {
    const today = getTodayDate();
    setMoodLog(prev => {
      const filtered = prev.filter(m => m.date !== today);
      return [...filtered, { date: today, mood, note: moodNote }];
    });
    setMoodNote('');
  };

  const getTodayMood = () => {
    const today = getTodayDate();
    return moodLog.find(m => m.date === today)?.mood;
  };

  const getLast14Moods = () => {
    const result = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const mood = moodLog.find(m => m.date === dateStr);
      result.push({ date: dateStr, mood: mood?.mood || null });
    }
    return result;
  };

  const getMoodStats = () => {
    const last7 = moodLog.filter(m => {
      const mDate = new Date(m.date);
      const today = new Date();
      const diff = (today - mDate) / (1000 * 60 * 60 * 24);
      return diff <= 7 && diff >= 0;
    });
    
    const average = last7.length > 0 ? (last7.reduce((a, c) => a + c.mood, 0) / last7.length).toFixed(1) : 0;
    
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const moodByDay = {};
    moodLog.forEach(m => {
      const d = new Date(m.date);
      const day = weekdays[d.getDay()];
      if (!moodByDay[day]) moodByDay[day] = [];
      moodByDay[day].push(m.mood);
    });
    
    let bestDay = '';
    let bestAvg = 0;
    Object.entries(moodByDay).forEach(([day, moods]) => {
      const avg = moods.reduce((a, c) => a + c, 0) / moods.length;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestDay = day;
      }
    });

    let streak = 0;
    for (let i = 0; i < moodLog.length; i++) {
      const m = moodLog[i];
      if (m.mood >= 4) streak++;
      else streak = 0;
    }

    return { average, bestDay: bestDay || 'N/A', streak, total: moodLog.length };
  };

  const MoodChart = ({ moods }) => {
    const maxY = 5;
    const chartHeight = 150;
    const barWidth = 30;
    const moodColors = { 1: '#FF4444', 2: '#FFAA00', 3: '#888888', 4: '#00FFFF', 5: '#00FF88' };
    const moodEmojis = { 1: '😔', 2: '😐', 3: '🙂', 4: '😊', 5: '🔥' };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: chartHeight, justifyContent: 'center' }}>
          {moods.map((m, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ fontSize: '16px' }}>{m.mood ? moodEmojis[m.mood] : '?'}</div>
              <div style={{
                width: barWidth,
                height: m.mood ? (m.mood / maxY) * chartHeight : 10,
                backgroundColor: m.mood ? moodColors[m.mood] : '#ddd',
                borderRadius: '4px',
                opacity: idx === moods.length - 1 ? 1 : 0.8,
                border: idx === moods.length - 1 ? '2px solid rgba(0,255,255,0.5)' : 'none',
              }} />
              <div style={{ fontSize: '10px', color: '#888', width: '100%', textAlign: 'center' }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(m.date).getDay()]}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const stats = getMoodStats();
  const lowMoodDays = moodLog.filter(m => m.mood <= 2).slice(-3).length;
  const showWellnessTrigger = lowMoodDays >= 3;

  // ═══════════════════════════════════════════════════════════════
  // TAB STYLING HELPERS
  // ═══════════════════════════════════════════════════════════════
  const tabButtonClass = (tab) => `
    text-sm px-4 py-2 rounded-lg transition-all
    ${activeTab === tab 
      ? 'bg-primary text-black font-semibold' 
      : 'text-neutral hover:text-primary'}
  `;

  return (
    <div style={styles.container}>
      {/* TAB NAVIGATION */}
      <div style={styles.tabNav}>
        <button onClick={() => setActiveTab('models')} className={tabButtonClass('models')}>{renderIcon('🧠', 16)} Models</button>
        <button onClick={() => setActiveTab('reading')} className={tabButtonClass('reading')}>{renderIcon('📚', 16)} Reading</button>
        <button onClick={() => setActiveTab('practices')} className={tabButtonClass('practices')}>{renderIcon('🎯', 16)} Practices</button>
        <button onClick={() => setActiveTab('quiz')} className={tabButtonClass('quiz')}>{renderIcon('🧠', 16)} Quiz</button>
        <button onClick={() => setActiveTab('reflect')} className={tabButtonClass('reflect')}>{renderIcon('💡', 16)} Reflect</button>
        <button onClick={() => setActiveTab('mood')} className={tabButtonClass('mood')}>{renderIcon('📊', 16)} Mood</button>
        <button onClick={() => setActiveTab('journal')} className={tabButtonClass('journal')}>{renderIcon('📝', 16)} Journal</button>
      </div>

      {/* TAB CONTENT */}
      <div style={styles.tabContent}>

        {/* TAB 1 — MENTAL MODELS */}
        {activeTab === 'models' && (
          <div>
            <div style={styles.contextBanner}>
              <p style={{ fontSize: '15px', fontStyle: 'italic', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>{renderIcon('💡', 16)} {getContextBanner()}</p>
            </div>
            
            <div style={styles.modelsGrid}>
              {MENTAL_MODELS.map(model => (
                <div key={model.id} style={styles.card} onClick={() => toggleModelExpand(model.id)}>
                  <div style={styles.modelHeader}>
                    <span style={{ fontSize: '28px' }}>{renderIcon(model.emoji, 28)}</span>
                    <span style={{ fontSize: '16px', fontWeight: '600' }}>{model.name}</span>
                    {masteredModels[model.id] && <span style={{ color: '#00FFFF', marginLeft: 'auto' }}>✓</span>}
                  </div>
                  <p style={styles.modelDescription}>{model.description}</p>

                  {expandedModels[model.id] && (
                    <div style={styles.expandedContent} onClick={(e) => e.stopPropagation()}>
                      <p style={{ marginBottom: '12px', lineHeight: '1.5' }}>{model.fullDescription}</p>
                      <div style={{
                        ...styles.tryItSection,
                        background: 'rgba(0,212,255,0.06)',
                        border: '1px solid rgba(0,212,255,0.15)',
                        borderRadius: '10px',
                        padding: '16px',
                        transition: 'all 0.3s ease',
                      }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#00d4ff', fontSize: '14px', marginBottom: '4px' }}>
                          {renderIcon('💡', 18)} Try it now
                        </label>
                        <textarea 
                          placeholder={model.tryItPrompt}
                          value={modelResponses[model.id] || ''}
                          onChange={(e) => setModelResponses(prev => ({ ...prev, [model.id]: e.target.value }))}
                          style={{
                            ...styles.textarea,
                            minHeight: '80px',
                            border: '1px solid rgba(0,212,255,0.2)',
                            transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = 'rgba(0,212,255,0.5)';
                            e.target.style.boxShadow = '0 0 12px rgba(0,212,255,0.15)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(0,212,255,0.2)';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                          <button
                            onClick={() => handleSaveResponse(model.id)}
                            style={{
                              ...styles.button,
                              backgroundColor: modelResponses[model.id]?.trim() ? '#00d4ff' : '#333',
                              opacity: modelResponses[model.id]?.trim() ? 1 : 0.5,
                              padding: '8px 20px',
                              borderRadius: '8px',
                              transition: 'all 0.3s ease',
                            }}
                          >
                            {savedFlash[model.id] ? '✓ Saved!' : '💾 Save Response'}
                          </button>
                          {modelResponses[model.id]?.trim() && (
                            <span style={{ fontSize: '11px', color: '#888' }}>
                              {modelResponses[model.id].trim().split(/\s+/).length} words
                            </span>
                          )}
                        </div>
                      </div>
                      <p style={{ fontSize: '13px', margin: '12px 0 12px 0', fontStyle: 'italic', color: '#888' }}>
                        <strong>Example:</strong> {model.example}
                      </p>
                      <button 
                        onClick={() => toggleMastered(model.id)}
                        style={{
                          ...styles.button,
                          backgroundColor: masteredModels[model.id] ? '#00FFFF' : '#333',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          transition: 'all 0.3s ease, transform 0.2s ease',
                        }}
                        onMouseEnter={(e) => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 4px 12px rgba(0,255,255,0.2)'; }}
                        onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
                      >
                        {masteredModels[model.id] ? '✓ Mastered' : 'Mark as mastered'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2 — READING LIST */}
        {activeTab === 'reading' && (
          <div>
            <div style={styles.readingStats}>
              <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                {bookStats.finished} finished · {bookStats.reading} reading · {bookStats.toRead} to read
              </span>
              <div style={{ display: 'flex', gap: '4px', marginTop: '8px', height: '8px' }}>
                <div style={{ flex: bookStats.finished, backgroundColor: '#00FF88' }} />
                <div style={{ flex: bookStats.reading, backgroundColor: '#FFAA00' }} />
                <div style={{ flex: bookStats.toRead, backgroundColor: '#666' }} />
              </div>
            </div>

            <button onClick={() => setShowAddBook(!onShowAddBook)} style={styles.addButton}>+ Add Book</button>

            {onShowAddBook && (
              <div style={styles.addBookForm}>
                <input 
                  type="text" 
                  placeholder="Title" 
                  value={newBook.title} 
                  onChange={(e) => setNewBook(prev => ({ ...prev, title: e.target.value }))}
                  style={styles.input}
                />
                <input 
                  type="text" 
                  placeholder="Author" 
                  value={newBook.author} 
                  onChange={(e) => setNewBook(prev => ({ ...prev, author: e.target.value }))}
                  style={styles.input}
                />
                <select 
                  value={newBook.category} 
                  onChange={(e) => setNewBook(prev => ({ ...prev, category: e.target.value }))}
                  style={styles.input}
                >
                  <option>Stoicism</option>
                  <option>Habits</option>
                  <option>Psychology</option>
                  <option>Strategy</option>
                  <option>Spirituality</option>
                  <option>Other</option>
                </select>
                <button onClick={addBook} style={styles.button}>Add</button>
              </div>
            )}

            <div style={styles.booksGrid}>
              {books.map(book => (
                <div key={book.id} style={styles.card} onClick={() => setExpandedBooks(prev => ({ ...prev, [book.id]: !prev[book.id] }))}>
                  <div style={{ marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>{book.title}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{book.author}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                    {['to-read', 'reading', 'finished'].map(status => (
                      <button 
                        key={status}
                        onClick={(e) => { e.stopPropagation(); updateBookStatus(book.id, status); }}
                        style={{
                          ...styles.pillButton,
                          backgroundColor: book.status === status ? (status === 'to-read' ? 'transparent' : status === 'reading' ? '#FFAA00' : '#00FF88') : 'transparent',
                          borderColor: book.status === status ? (status === 'reading' ? '#FFAA00' : status === 'finished' ? '#00FF88' : '#666') : '#666',
                          color: book.status === status && status !== 'to-read' ? '#000' : '#fff',
                        }}
                      >
                        {status === 'to-read' ? 'To Read' : status === 'reading' ? 'Reading' : 'Finished'}
                      </button>
                    ))}
                  </div>

                  {book.status === 'reading' && (
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '12px', marginBottom: '4px' }}>Progress</div>
                      <input type="range" min="0" max="100" defaultValue="0" style={styles.slider} />
                    </div>
                  )}

                  {book.status === 'finished' && (
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '12px', marginBottom: '4px' }}>Rating</div>
                      <div>{'⭐'.repeat(3)}</div>
                    </div>
                  )}

                  {expandedBooks[book.id] && (
                    <div>
                      <textarea 
                        placeholder="Key insight from this book..."
                        value={bookNotes[book.id] || ''}
                        onChange={(e) => setBookNotes(prev => ({ ...prev, [book.id]: e.target.value }))}
                        style={styles.textarea}
                      />
                      <button 
                        onClick={(e) => { e.stopPropagation(); }}
                        style={styles.button}
                      >
                        Generate reflection prompt
                      </button>
                      {book.category && (
                        <p style={{ fontSize: '12px', marginTop: '8px', fontStyle: 'italic', color: '#00FFFF' }}>
                          💭 {getReflectionPrompt(book.category)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3 — DAILY PRACTICES */}
        {activeTab === 'practices' && (
          <div>
            <div style={styles.progressSection}>
              <p>{getCompletedToday()} of 6 completed</p>
              <div style={{ backgroundColor: '#333', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: '#00FFFF', height: '100%', width: `${(getCompletedToday() / 6) * 100}%` }} />
              </div>
            </div>

            <div style={styles.practicesGrid}>
              {DEFAULT_PRACTICES.map(practice => (
                <div key={practice.id} style={styles.practiceCard}>
                  <button
                    onClick={() => togglePractice(practice.id)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: `2px solid ${isPracticeComplete(practice.id) ? '#00FFFF' : '#666'}`,
                      backgroundColor: isPracticeComplete(practice.id) ? '#00FFFF' : 'transparent',
                      color: isPracticeComplete(practice.id) ? '#000' : '#fff',
                      fontSize: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isPracticeComplete(practice.id) ? '✓' : ''}
                  </button>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontWeight: '600', textDecoration: isPracticeComplete(practice.id) ? 'line-through' : 'none' }}>
                      {renderIcon(practice.emoji, 18)} {practice.name}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{practice.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 5-WHY TOOL */}
            <div style={styles.toolSection}>
              <h3>5-Why Root Cause Analysis</h3>
              <p>Uncover the real reason behind a recurring problem.</p>
              <input 
                type="text"
                placeholder="The problem:"
                value={fiveWhyAnalysis}
                onChange={(e) => setFiveWhyAnalysis(e.target.value)}
                style={styles.input}
              />
              {fiveWhyAnalysis && (
                <div style={{ marginTop: '12px' }}>
                  {['why1', 'why2', 'why3', 'why4', 'why5'].map((step, idx) => (
                    <div key={step} style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Why #{idx + 1}</label>
                      <textarea 
                        placeholder={idx === 0 ? 'Why does this problem exist?' : idx < 4 ? 'Why?' : 'What is the root cause?'}
                        value={fiveWhySteps[step]}
                        onChange={(e) => setFiveWhySteps(prev => ({ ...prev, [step]: e.target.value }))}
                        disabled={idx > 0 && !fiveWhySteps[`why${idx}`]}
                        style={{...styles.textarea, opacity: (idx > 0 && !fiveWhySteps[`why${idx}`]) ? 0.5 : 1}}
                      />
                    </div>
                  ))}
                  <button onClick={saveFiveWhy} style={styles.button}>Save analysis</button>
                </div>
              )}

              {savedFiveWhys.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#888' }}>Last saved: {savedFiveWhys[savedFiveWhys.length - 1].date}</p>
                  <details style={styles.details}>
                    <summary style={styles.summary}>View last analysis</summary>
                    <p>{savedFiveWhys[savedFiveWhys.length - 1].problem}</p>
                  </details>
                </div>
              )}
            </div>

            {/* EISENHOWER MATRIX */}
            <div style={styles.toolSection}>
              <h3>Priority Matrix — What matters most right now?</h3>
              <div style={styles.matrix}>
                {['q1', 'q2', 'q3', 'q4'].map((q, idx) => {
                  const labels = ['Urgent + Important\nDO NOW', 'Not urgent + Important\nSCHEDULE', 'Urgent + Not Important\nDELEGATE', 'Not urgent + Not Important\nDELETE'];
                  const colors = ['#FF4444', '#00FF88', '#FFAA00', '#666'];
                  return (
                    <div key={q} style={{...styles.quadrant, borderColor: colors[idx]}}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', whiteSpace: 'pre' }}>{labels[idx]}</div>
                      <div style={{ minHeight: '60px', marginBottom: '8px' }}>
                        {matrixTasks[q].map(task => (
                          <div key={task.id} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                            <span style={{ padding: '2px 6px', backgroundColor: '#333', borderRadius: '4px', fontSize: '11px' }}>{task.text}</span>
                            <button onClick={() => removeMatrixTask(q, task.id)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>✕</button>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input 
                          type="text"
                          placeholder="Add task"
                          value={matrixInputs[q]}
                          onChange={(e) => setMatrixInputs(prev => ({ ...prev, [q]: e.target.value }))}
                          style={{...styles.input, flex: 1}}
                        />
                        <button onClick={() => addMatrixTask(q)} style={{...styles.button, padding: '6px 12px'}}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* EVENING CHECK-IN */}
            <div style={styles.toolSection}>
              <h3>🌙 Evening Check-in</h3>
              {isCheckinDoneToday() ? (
                <p style={{ color: '#00FFFF' }}>✓ Check-in saved for today</p>
              ) : (
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>How was today overall?</label>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    {['😔', '😐', '🙂', '😊', '🔥'].map((emoji, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setCheckinData(prev => ({ ...prev, mood: emoji }))}
                        style={{
                          fontSize: '28px',
                          background: checkinData.mood === emoji ? '#333' : 'transparent',
                          border: checkinData.mood === emoji ? '2px solid #00FFFF' : 'none',
                          cursor: 'pointer',
                          borderRadius: '6px',
                          padding: '4px',
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <input 
                    type="text"
                    placeholder="One thing I am grateful for today:"
                    value={checkinData.grateful}
                    onChange={(e) => setCheckinData(prev => ({ ...prev, grateful: e.target.value }))}
                    style={styles.input}
                  />
                  <input 
                    type="text"
                    placeholder="One thing I learned today:"
                    value={checkinData.learned}
                    onChange={(e) => setCheckinData(prev => ({ ...prev, learned: e.target.value }))}
                    style={styles.input}
                  />
                  <button onClick={submitCheckin} style={styles.button}>Submit check-in</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4 — QUIZ */}
        {activeTab === 'quiz' && (
          <div>
            {!quizStarted ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <h2>🧠 Active Recall Quiz</h2>
                <p>Test your knowledge of mental models and psychology concepts.</p>
                <button onClick={startQuiz} style={styles.button}>Start Quiz</button>
                {quizHistory.length > 0 && (
                  <div style={{ marginTop: '16px', textAlign: 'left' }}>
                    <h3>Recent Attempts</h3>
                    {quizHistory.slice(-3).map((attempt, idx) => (
                      <p key={idx} style={{ fontSize: '12px', margin: '4px 0' }}>
                        {attempt.date}: {attempt.score}/{attempt.total}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : showResult ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <h1 style={{ fontSize: '48px' }}>{score} / 20</h1>
                <p style={{ color: score >= 16 ? '#00FF88' : score >= 10 ? '#FFAA00' : '#FF4444', fontSize: '18px', marginBottom: '12px' }}>
                  {score >= 16 ? '✓ Excellent' : score >= 10 ? 'Good' : 'Keep studying'}
                </p>
                <button onClick={retakeQuiz} style={styles.button}>Retake Quiz</button>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                    <span>Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}</span>
                    <span style={{ fontFamily: 'monospace' }}>Score: {score}/{QUIZ_QUESTIONS.length}</span>
                  </div>
                  <div style={{ backgroundColor: '#333', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: '#00FFFF', height: '100%', width: `${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%` }} />
                  </div>
                </div>

                <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>{QUIZ_QUESTIONS[currentQuestion].q}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {QUIZ_QUESTIONS[currentQuestion].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectAnswer(idx)}
                      style={{
                        padding: '12px',
                        border: '1px solid #666',
                        borderRadius: '6px',
                        backgroundColor: selectedAnswer === null ? '#222' : 
                          idx === QUIZ_QUESTIONS[currentQuestion].answer ? '#00FF88' :
                          selectedAnswer === idx ? '#FF4444' : '#222',
                        color: selectedAnswer === null ? '#fff' : 
                          idx === QUIZ_QUESTIONS[currentQuestion].answer ? '#000' :
                          selectedAnswer === idx ? '#fff' : '#fff',
                        cursor: selectedAnswer === null ? 'pointer' : 'default',
                        textAlign: 'left',
                      }}
                      disabled={selectedAnswer !== null}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5 — REFLECT */}
        {activeTab === 'reflect' && (
          <div>
            {/* REFLECTION PROMPTS */}
            <div style={styles.toolSection}>
              <h3>✨ Guided Reflection</h3>
              <div style={styles.reflectionBanner}>
                <p style={{ margin: '0 0 12px 0', fontStyle: 'italic', fontSize: '16px' }}>
                  {getReflectionPromptForDay()}
                </p>
              </div>
              <textarea 
                placeholder="Your honest response:"
                value={reflectionResponse}
                onChange={(e) => setReflectionResponse(e.target.value)}
                style={styles.textarea}
              />
              <button style={styles.button}>Next prompt →</button>
            </div>

            {/* THOUGHT RECORD */}
            <div style={styles.toolSection}>
              <h3>💭 Challenge a Negative Thought</h3>
              <p>CBT shows that examining our thoughts reduces their power.</p>

              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {[1, 2, 3, 4, 5].map(step => (
                  <div 
                    key={step}
                    onClick={() => setReflectionStep(step)}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: step <= reflectionStep ? '#00FFFF' : '#333',
                      color: step <= reflectionStep ? '#000' : '#888',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    {step <= reflectionStep ? '✓' : step}
                  </div>
                ))}
              </div>

              {reflectionStep >= 1 && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Step 1: The situation</label>
                  <textarea 
                    placeholder="What happened?"
                    value={thoughtRecord.situation}
                    onChange={(e) => setThoughtRecord(prev => ({ ...prev, situation: e.target.value }))}
                    style={styles.textarea}
                  />
                </div>
              )}

              {thoughtRecord.situation && reflectionStep >= 2 && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Step 2: The automatic thought</label>
                  <textarea 
                    placeholder="What went through your mind?"
                    value={thoughtRecord.thought}
                    onChange={(e) => setThoughtRecord(prev => ({ ...prev, thought: e.target.value }))}
                    style={styles.textarea}
                  />
                </div>
              )}

              {thoughtRecord.thought && reflectionStep >= 3 && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Step 3: The emotion (0-100%)</label>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={thoughtRecord.emotion}
                    onChange={(e) => setThoughtRecord(prev => ({ ...prev, emotion: e.target.value }))}
                    style={styles.slider}
                  />
                  <span style={{ fontSize: '12px' }}>{thoughtRecord.emotion}%</span>
                </div>
              )}

              {thoughtRecord.emotion && reflectionStep >= 4 && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Step 4: The evidence</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <textarea 
                      placeholder="Evidence FOR this thought"
                      value={thoughtRecord.evidence_for}
                      onChange={(e) => setThoughtRecord(prev => ({ ...prev, evidence_for: e.target.value }))}
                      style={{...styles.textarea, height: '80px'}}
                    />
                    <textarea 
                      placeholder="Evidence AGAINST"
                      value={thoughtRecord.evidence_against}
                      onChange={(e) => setThoughtRecord(prev => ({ ...prev, evidence_against: e.target.value }))}
                      style={{...styles.textarea, height: '80px'}}
                    />
                  </div>
                </div>
              )}

              {thoughtRecord.evidence_for && thoughtRecord.evidence_against && reflectionStep >= 5 && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Step 5: The balanced thought</label>
                  <textarea 
                    placeholder="A more realistic perspective"
                    value={thoughtRecord.balanced}
                    onChange={(e) => setThoughtRecord(prev => ({ ...prev, balanced: e.target.value }))}
                    style={styles.textarea}
                  />
                  <button onClick={saveThoughtRecord} style={styles.button}>Save record</button>
                </div>
              )}
            </div>

            {/* SAVED RECORDS */}
            {savedThoughtRecords.length > 0 && (
              <div style={styles.toolSection}>
                <h3>Saved Thought Records</h3>
                {savedThoughtRecords.slice(-3).map(record => (
                  <details key={record.id} style={styles.details}>
                    <summary style={styles.summary}>{record.date} - {record.situation.substring(0, 40)}...</summary>
                    <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                      <p><strong>Situation:</strong> {record.situation}</p>
                      <p><strong>Thought:</strong> {record.thought}</p>
                      <p><strong>Balanced:</strong> {record.balanced}</p>
                      <button onClick={() => deleteThoughtRecord(record.id)} style={{...styles.button, backgroundColor: '#FF4444'}}>Delete</button>
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6 — MOOD */}
        {activeTab === 'mood' && (
          <div>
            {/* MOOD LOG */}
            <div style={styles.toolSection}>
              <h3>How is your mood today?</h3>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                {[1, 2, 3, 4, 5].map(mood => (
                  <button 
                    key={mood}
                    onClick={() => logMood(mood)}
                    style={{
                      fontSize: '28px',
                      background: getTodayMood() === mood ? '#333' : 'transparent',
                      border: getTodayMood() === mood ? '2px solid #00FFFF' : 'none',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      padding: '4px',
                    }}
                  >
                    {['😔', '😐', '🙂', '😊', '🔥'][mood - 1]}
                  </button>
                ))}
              </div>
              {getTodayMood() && (
                <div>
                  <input 
                    type="text"
                    placeholder="What is driving this mood?"
                    value={moodNote}
                    onChange={(e) => setMoodNote(e.target.value)}
                    style={styles.input}
                  />
                </div>
              )}
            </div>

            {/* MOOD CHART */}
            {moodLog.length > 0 && (
              <div style={styles.toolSection}>
                <h3>Last 14 Days</h3>
                <MoodChart moods={getLast14Moods()} />
              </div>
            )}

            {/* MOOD STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '16px 0' }}>
              <div style={styles.statCard}>
                <div style={{ fontSize: '28px', marginBottom: '4px' }}>
                  {['😔', '😐', '🙂', '😊', '🔥'][Math.round(stats.average) - 1] || '❌'}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>Avg this week</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{stats.average}</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: '12px', color: '#888' }}>Best day</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{stats.bestDay}</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: '12px', color: '#888' }}>Positive streak</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{stats.streak} days</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: '12px', color: '#888' }}>Total entries</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{stats.total}</div>
              </div>
            </div>

            {/* BADGES */}
            <div style={styles.toolSection}>
              <h3>🏆 Badges</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { emoji: '🌱', name: 'First Log', unlocked: moodLog.length >= 1 },
                  { emoji: '🔥', name: '3-Day Streak', unlocked: stats.streak >= 3 },
                  { emoji: '💎', name: '7-Day Streak', unlocked: stats.streak >= 7 },
                  { emoji: '⚡', name: 'Mood Master', unlocked: stats.average >= 4 },
                  { emoji: '🏆', name: 'Consistent', unlocked: moodLog.length >= 30 },
                  { emoji: '📚', name: 'Reader', unlocked: bookStats.finished >= 3 },
                  { emoji: '🧠', name: 'Scholar', unlocked: score >= 15 },
                  { emoji: '🪞', name: 'Reflector', unlocked: savedThoughtRecords.length >= 5 },
                ].map((badge, idx) => (
                  <div key={idx} style={{...styles.badgeCard, opacity: badge.unlocked ? 1 : 0.3}}>
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                      {badge.emoji}{!badge.unlocked && ' 🔒'}
                    </div>
                    <div style={{ fontSize: '10px', textAlign: 'center' }}>{badge.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* WELLNESS TRIGGER */}
            {showWellnessTrigger && (
              <div style={styles.wellnessTrigger}>
                <p>We noticed your mood has been lower lately. That's okay — it happens to everyone. Here are 3 things that might help:</p>
                <ul style={{ paddingLeft: '16px' }}>
                  <li>Complete one practice from your daily list</li>
                  <li>Write a thought record to challenge a negative belief</li>
                  <li>Read one entry from your wisdom library</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* TAB 7 — JOURNAL */}
        {activeTab === 'journal' && <JournalPage />}

      </div>
    </div>
  );
}
