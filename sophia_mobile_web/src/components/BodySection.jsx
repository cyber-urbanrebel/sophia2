import React, { useState, useEffect, useCallback } from 'react';
import { renderIcon } from './SophiaIcons.jsx';

// ═══════════════════════════════════════════════════════════════
// CUSTOM useLocalStorage HOOK
// ═══════════════════════════════════════════════════════════════
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
// INLINE STYLES OBJECT
// ═══════════════════════════════════════════════════════════════
const styles = {
  container: {
    padding: '0',
    width: '100%',
    paddingBottom: '40px',
    color: '#000',
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
    color: '#000',
    padding: '8px 12px',
    fontSize: '13px',
    marginBottom: '8px',
    fontFamily: 'inherit',
  },
  textarea: {
    backgroundColor: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '4px',
    color: '#000',
    padding: '8px',
    fontFamily: 'inherit',
    fontSize: '13px',
    resize: 'vertical',
    minHeight: '60px',
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: '#333',
    outline: 'none',
    accentColor: '#00FFFF',
  },
  pillButton: {
    border: '1px solid',
    borderRadius: '20px',
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'none',
  },
  statCard: {
    backgroundColor: 'rgba(0,255,255,0.05)',
    border: '1px solid rgba(0,255,255,0.2)',
    borderRadius: '6px',
    padding: '12px',
    textAlign: 'center',
  },
  toolSection: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '16px',
  },
  expandedContent: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
};

// ═══════════════════════════════════════════════════════════════
// DEFAULT DATA STRUCTURES
// ═══════════════════════════════════════════════════════════════
const DEFAULT_TRAINING_PLAN = [
  { day: 'Monday', type: 'Push', exercises: 'Bench press, Shoulder press, Tricep dips' },
  { day: 'Tuesday', type: 'Pull', exercises: 'Deadlift, Barbell rows, Bicep curls' },
  { day: 'Wednesday', type: 'Rest', exercises: 'Active recovery, Walk, Stretch' },
  { day: 'Thursday', type: 'Legs', exercises: 'Squat, Lunges, Calf raises' },
  { day: 'Friday', type: 'Push', exercises: 'Overhead press, Dips, Lateral raises' },
  { day: 'Saturday', type: 'Pull', exercises: 'Pull-ups, Face pulls, Hammer curls' },
  { day: 'Sunday', type: 'Rest', exercises: 'Foam roll, Sauna, Mobility work' },
];

const NUTRITION_PRINCIPLES = [
  {
    emoji: '🥩',
    title: 'Protein first',
    short: 'Aim for 1g per lb of bodyweight. Protein preserves muscle.',
    long: 'Best sources: chicken breast, eggs, Greek yogurt, lentils, tuna. Spread intake across 4 meals for maximum muscle protein synthesis.',
  },
  {
    emoji: '💧',
    title: 'Hydration',
    short: 'Drink minimum 3L water daily. Performance drops at 2% dehydration.',
    long: 'Drink 500ml on waking. Add 500ml per hour of exercise. Track with the Hydration tab. Signs of dehydration: dark urine, headache, poor focus.',
  },
  {
    emoji: '🚫',
    title: 'Eliminate processed sugar',
    short: 'Sugar spikes insulin, drives fat storage, impairs focus.',
    long: 'Replace with: fruit, dark chocolate, dates. Read labels — sugar hides as fructose, dextrose, maltose. Give yourself 21 days to reset cravings.',
  },
  {
    emoji: '⏱️',
    title: 'Intermittent fasting',
    short: '16:8 protocol reduces insulin resistance and improves focus.',
    long: 'Eat between 12pm-8pm. Black coffee and water are fine in the fasting window. Start with 12 hours if 16 is too hard. It gets easier after 2 weeks.',
  },
  {
    emoji: '🌿',
    title: 'Whole foods only',
    short: 'If it has more than 5 ingredients, think twice.',
    long: '80% of your diet from: vegetables, fruit, meat, fish, eggs, nuts, legumes, whole grains. Meal prep Sunday to make the week easy.',
  },
  {
    emoji: '💊',
    title: 'Creatine',
    short: '5g/day. Most researched supplement. Improves strength and brain function.',
    long: 'No loading phase needed. Take any time of day. Safe for long-term use. Expect slight water retention in first 2 weeks — this is normal.',
  },
  {
    emoji: '🥦',
    title: 'Micronutrients',
    short: 'Eat the rainbow. Different vegetable colors = different nutrients.',
    long: 'Aim for 5+ colors of vegetables per week. Magnesium (dark leafy greens) improves sleep. Zinc (pumpkin seeds) supports testosterone. Omega-3 (salmon, walnuts) reduces inflammation.',
  },
  {
    emoji: '🍽️',
    title: 'Meal timing',
    short: 'Eat before training. Prioritize post-workout protein within 2 hours.',
    long: 'Pre-workout: carbs + protein 1-2 hours before. Post-workout: 30-40g protein within 2 hours. Avoid heavy meals 3 hours before sleep.',
  },
];

const SLEEP_TIPS = [
  {
    emoji: '🌙',
    title: 'No screens 1 hour before bed',
    text: 'Blue light suppresses melatonin by up to 50%. Use night mode or blue-light glasses from 8pm. Replace with: reading, journaling, stretching.',
  },
  {
    emoji: '🌡️',
    title: 'Keep bedroom cool (16-19°C)',
    text: 'Core body temperature must drop 1-2°C to initiate sleep. Cool room = faster sleep onset. Use a fan, open windows, or set AC to 18°C.',
  },
  {
    emoji: '☀️',
    title: 'Morning sunlight within 30 minutes of waking',
    text: '10 minutes of outdoor light resets your circadian rhythm. This also makes you fall asleep faster the following night.',
  },
  {
    emoji: '☕',
    title: 'No caffeine after 2pm',
    text: 'Caffeine has a 6-hour half-life. A coffee at 3pm = half a coffee at 9pm. Switch to herbal tea after lunch.',
  },
  {
    emoji: '📋',
    title: 'Same wake time every day',
    text: 'Consistency of wake time matters more than bedtime. Even on weekends. This anchors your circadian rhythm and improves sleep quality within 2 weeks.',
  },
  {
    emoji: '🧘',
    title: '10-minute wind-down routine',
    text: 'Signal to your brain that sleep is coming. Try: 5 minutes of journaling, 4-7-8 breathing (inhale 4s, hold 7s, exhale 8s), progressive muscle relaxation.',
  },
];

const HYDRATION_FACTS = [
  'Even 2% dehydration reduces cognitive performance by 20%.',
  'Drinking 500ml on waking boosts metabolism by 24% for 90 minutes.',
  'Thirst is a late signal — you are already 1-2% dehydrated when you feel it.',
  'Cold water burns slightly more calories as body warms it to core temperature.',
  'Coffee and tea count toward hydration — the diuretic effect is minimal.',
];

const DEFAULT_CHALLENGES = [
  {
    id: 1,
    name: '30-Day Running Streak',
    emoji: '🏃',
    description: 'Run or walk at least 20 minutes every day for 30 days.',
    duration: 30,
    type: 'daily',
  },
  {
    id: 2,
    name: '100 Push-Up Challenge',
    emoji: '💪',
    description: 'Complete 100 push-ups total. Track your sets.',
    duration: 30,
    type: 'number',
  },
  {
    id: 3,
    name: '21-Day Hydration Challenge',
    emoji: '💧',
    description: 'Hit your water target every day for 21 days.',
    duration: 21,
    type: 'auto',
  },
  {
    id: 4,
    name: 'Sleep Optimization Week',
    emoji: '😴',
    description: 'Average 7+ hours of sleep for 7 consecutive days.',
    duration: 7,
    type: 'auto',
  },
  {
    id: 5,
    name: 'Clean Eating 14 Days',
    emoji: '🥗',
    description: 'Log all meals with 150g+ protein daily for 14 days.',
    duration: 14,
    type: 'auto',
  },
  {
    id: 6,
    name: '30-Day Morning Routine',
    emoji: '🧘',
    description: 'Complete your morning routine every day for 30 days.',
    duration: 30,
    type: 'daily',
  },
];

// ═══════════════════════════════════════════════════════════════
// MAIN BODYSECTION COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function BodySection() {
  const [activeTab, setActiveTab] = useState('training');

  // ═══════════════════════════════════════════════════════════════
  // TAB 1 — TRAINING
  // ═══════════════════════════════════════════════════════════════
  const [workouts, setWorkouts] = useLocalStorage('sophia_workouts', []);
  const [trainingPlan, setTrainingPlan] = useLocalStorage('sophia_training_plan', DEFAULT_TRAINING_PLAN);
  const [completedDays, setCompletedDays] = useLocalStorage('sophia_completed_days', {});
  const [newWorkout, setNewWorkout] = useState({
    type: 'Push',
    duration: 45,
    intensity: 'Moderate',
    notes: '',
  });

  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getDayOfWeek = () => new Date().getDay();

  const getTodaysDayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[getDayOfWeek()];
  };

  const logWorkout = () => {
    if (newWorkout.type && newWorkout.duration > 0) {
      setWorkouts(prev => [...prev, {
        id: Date.now(),
        date: getTodayDate(),
        type: newWorkout.type,
        duration: newWorkout.duration,
        intensity: newWorkout.intensity,
        notes: newWorkout.notes,
      }]);
      setCompletedDays(prev => ({ ...prev, [getTodayDate()]: true }));
      setNewWorkout({ type: 'Push', duration: 45, intensity: 'Moderate', notes: '' });
    }
  };

  const getWorkoutStats = () => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekStart_str = weekStart.toISOString().split('T')[0];
    
    const thisWeek = workouts.filter(w => w.date >= weekStart_str);
    const totalMinutes = thisWeek.reduce((sum, w) => sum + w.duration, 0);
    
    let streak = 0;
    let checkDate = new Date();
    while (completedDays[checkDate.toISOString().split('T')[0]]) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    return {
      thisWeek: thisWeek.length,
      totalMinutes,
      streak,
      restDays: 7 - thisWeek.length,
    };
  };

  const stats = getWorkoutStats();

  // ═══════════════════════════════════════════════════════════════
  // TAB 2 — NUTRITION
  // ═══════════════════════════════════════════════════════════════
  const [meals, setMeals] = useLocalStorage('sophia_meals', []);
  const [macroTargets, setMacroTargets] = useLocalStorage('sophia_macro_targets', {
    calories: 2500,
    protein: 180,
    carbs: 250,
    fat: 70,
  });
  const [newMeal, setNewMeal] = useState({
    type: 'Breakfast',
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [expandedPrinciples, setExpandedPrinciples] = useState({});

  const addMeal = () => {
    if (newMeal.name && newMeal.calories > 0) {
      setMeals(prev => [...prev, {
        id: Date.now(),
        date: getTodayDate(),
        ...newMeal,
      }]);
      setNewMeal({ type: 'Breakfast', name: '', calories: 0, protein: 0, carbs: 0, fat: 0 });
    }
  };

  const getTodaysMeals = () => meals.filter(m => m.date === getTodayDate());
  const getTodaysMacros = () => {
    const today = getTodaysMeals();
    return {
      calories: today.reduce((sum, m) => sum + m.calories, 0),
      protein: today.reduce((sum, m) => sum + m.protein, 0),
      carbs: today.reduce((sum, m) => sum + m.carbs, 0),
      fat: today.reduce((sum, m) => sum + m.fat, 0),
    };
  };

  const macros = getTodaysMacros();

  const MacroRing = ({ label, current, target, color }) => {
    const percentage = Math.min((current / target) * 100, 100);
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div style={{ textAlign: 'center', flex: 1 }}>
        <svg width="120" height="120" style={{ margin: '0 auto' }}>
          <circle cx="60" cy="60" r="45" fill="none" stroke="#333" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
          <text x="60" y="60" textAnchor="middle" dominantBaseline="middle" fill="#00FFFF" fontSize="18" fontWeight="bold">
            {Math.round(current)}
          </text>
        </svg>
        <div style={{ fontSize: '12px', color: '#000', marginTop: '4px' }}>{label}</div>
        <div style={{ fontSize: '11px', color: '#000' }}>/ {target}</div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // TAB 3 — SLEEP
  // ═══════════════════════════════════════════════════════════════
  const [sleepLog, setSleepLog] = useLocalStorage('sophia_sleep', []);
  const [newSleep, setNewSleep] = useState({
    bedtime: '23:00',
    waketime: '07:00',
    quality: 3,
    rested: 'Somewhat',
    disruptors: [],
  });
  const [expandedTips, setExpandedTips] = useState({});

  const calculateSleepDuration = () => {
    const [bedHour, bedMin] = newSleep.bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = newSleep.waketime.split(':').map(Number);
    let hours = wakeHour - bedHour;
    let minutes = wakeMin - bedMin;
    
    if (minutes < 0) {
      hours--;
      minutes += 60;
    }
    if (hours < 0) hours += 24;
    
    return { hours, minutes };
  };

  const logSleep = () => {
    const duration = calculateSleepDuration();
    setSleepLog(prev => [...prev, {
      id: Date.now(),
      date: getTodayDate(),
      bedtime: newSleep.bedtime,
      waketime: newSleep.waketime,
      duration: duration.hours + duration.minutes / 60,
      quality: newSleep.quality,
      rested: newSleep.rested,
      disruptors: newSleep.disruptors,
    }]);
    setNewSleep({ bedtime: '23:00', waketime: '07:00', quality: 3, rested: 'Somewhat', disruptors: [] });
  };

  const getSleepStats = () => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekStart_str = weekStart.toISOString().split('T')[0];
    
    const thisWeek = sleepLog.filter(s => s.date >= weekStart_str);
    const avgDuration = thisWeek.length > 0 ? thisWeek.reduce((sum, s) => sum + s.duration, 0) / thisWeek.length : 0;
    const avgQuality = thisWeek.length > 0 ? thisWeek.reduce((sum, s) => sum + s.quality, 0) / thisWeek.length : 0;
    const bestNight = thisWeek.length > 0 ? Math.max(...thisWeek.map(s => s.duration)).toFixed(1) : 0;
    const sleepDebt = Math.max(0, (8 * thisWeek.length) - thisWeek.reduce((sum, s) => sum + s.duration, 0));

    return { avgDuration: avgDuration.toFixed(1), avgQuality: avgQuality.toFixed(1), bestNight, sleepDebt: sleepDebt.toFixed(1) };
  };

  const sleepStats = getSleepStats();

  const SleepChart = () => {
    const last14 = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const entry = sleepLog.find(s => s.date === dateStr);
      last14.push({ date: dateStr, duration: entry?.duration || 0 });
    }

    const maxSleep = Math.max(...last14.map(s => s.duration), 10);
    const chartHeight = 150;

    return (
      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: chartHeight, justifyContent: 'center' }}>
          {last14.map((s, idx) => {
            const barHeight = (s.duration / maxSleep) * chartHeight;
            let color = '#FF4444';
            if (s.duration >= 7) color = '#00FF88';
            else if (s.duration >= 6) color = '#FFAA00';
            
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '25px',
                  height: barHeight,
                  backgroundColor: color,
                  borderRadius: '3px',
                  opacity: idx === last14.length - 1 ? 1 : 0.8,
                }} />
                <div style={{ fontSize: '9px', color: '#000' }}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(s.date).getDay()]}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px', fontSize: '11px', color: '#000' }}>
          <div>Recommended: 7-8h</div>
          <div>Optimal: 8h</div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // TAB 4 — BODY STATS
  // ═══════════════════════════════════════════════════════════════
  const [bodyStats, setBodyStats] = useLocalStorage('sophia_body_stats', []);
  const [newStats, setNewStats] = useState({
    weight: 75,
    height: 180,
    bodyFat: 0,
    chest: 0,
    waist: 0,
    hips: 0,
    armLeft: 0,
    armRight: 0,
    thighLeft: 0,
    thighRight: 0,
  });
  const [goal, setGoal] = useLocalStorage('sophia_body_goal', 'Maintain');

  const calculateBMI = (weight, height) => {
    return (weight / ((height / 100) ** 2)).toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: '#4488FF' };
    if (bmi < 25) return { label: 'Healthy', color: '#000' };
    if (bmi < 30) return { label: 'Overweight', color: '#FFAA00' };
    return { label: 'Obese', color: '#FF4444' };
  };

  const calculateFFMI = (weight, height, bodyFat) => {
    if (bodyFat === 0) return null;
    const ffm = weight * (1 - bodyFat / 100);
    return (ffm / ((height / 100) ** 2)).toFixed(1);
  };

  const getFFMICategory = (ffmi) => {
    if (!ffmi) return null;
    if (ffmi < 17) return 'Beginner';
    if (ffmi < 20) return 'Intermediate';
    if (ffmi < 22) return 'Advanced';
    return 'Elite';
  };

  const calculateWaistToHeight = (waist, height) => {
    if (waist === 0) return null;
    return (waist / height).toFixed(2);
  };

  const getWaistCategory = (ratio) => {
    if (!ratio) return null;
    if (ratio < 0.4) return 'Slim';
    if (ratio < 0.5) return 'Healthy';
    if (ratio < 0.6) return 'Overweight';
    return 'High risk';
  };

  const calculateIdealWeight = (height, isMale = true) => {
    const inches = height / 2.54;
    const feetInches = inches - 60;
    let ideal;
    if (isMale) {
      ideal = 48 + feetInches * 2.7;
    } else {
      ideal = 45.5 + feetInches * 2.2;
    }
    return { min: (ideal * 0.9).toFixed(1), max: (ideal * 1.1).toFixed(1) };
  };

  const saveBodyStats = () => {
    setBodyStats(prev => [...prev, {
      id: Date.now(),
      date: getTodayDate(),
      ...newStats,
    }]);
    setNewStats({ weight: 75, height: 180, bodyFat: 0, chest: 0, waist: 0, hips: 0, armLeft: 0, armRight: 0, thighLeft: 0, thighRight: 0 });
  };

  const latestStats = bodyStats.length > 0 ? bodyStats[bodyStats.length - 1] : null;
  const bmi = latestStats ? calculateBMI(latestStats.weight, latestStats.height) : null;
  const bmiCat = bmi ? getBMICategory(bmi) : null;
  const ffmi = latestStats ? calculateFFMI(latestStats.weight, latestStats.height, latestStats.bodyFat) : null;
  const ffmiCat = ffmi ? getFFMICategory(ffmi) : null;
  const wth = latestStats ? calculateWaistToHeight(latestStats.waist, latestStats.height) : null;
  const wthCat = wth ? getWaistCategory(wth) : null;
  const idealWeight = latestStats ? calculateIdealWeight(latestStats.height) : null;

  // ═══════════════════════════════════════════════════════════════
  // TAB 5 — HYDRATION
  // ═══════════════════════════════════════════════════════════════
  const [hydrationLog, setHydrationLog] = useLocalStorage('sophia_hydration', []);
  const [hydrationTarget, setHydrationTarget] = useLocalStorage('sophia_hydration_target', 3000);
  const [customAmount, setCustomAmount] = useState('');

  const getTodaysHydration = () => {
    const today = getTodayDate();
    return hydrationLog.filter(h => h.date === today).reduce((sum, h) => sum + h.amount, 0);
  };

  const addWater = (amount) => {
    setHydrationLog(prev => [...prev, {
      id: Date.now(),
      date: getTodayDate(),
      amount,
      time: new Date().toLocaleTimeString(),
    }]);
  };

  const getTodayHydrationStreak = () => {
    let streak = 0;
    let checkDate = new Date();
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const dayTotal = hydrationLog.filter(h => h.date === dateStr).reduce((sum, h) => sum + h.amount, 0);
      if (dayTotal >= hydrationTarget) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const todayHydration = getTodaysHydration();
  const hydrationStreak = getTodayHydrationStreak();

  const HydrationChart = () => {
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayTotal = hydrationLog.filter(h => h.date === dateStr).reduce((sum, h) => sum + h.amount, 0);
      last7.push({ date: dateStr, amount: dayTotal });
    }

    const maxAmount = Math.max(...last7.map(h => h.amount), hydrationTarget);
    const chartHeight = 120;

    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: chartHeight, justifyContent: 'center', marginTop: '12px' }}>
        {last7.map((h, idx) => {
          const barHeight = (h.amount / maxAmount) * chartHeight;
          const color = h.amount >= hydrationTarget ? '#00FF88' : h.amount >= (hydrationTarget * 0.7) ? '#FFAA00' : '#FF4444';
          
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '20px',
                height: barHeight,
                backgroundColor: color,
                borderRadius: '2px',
              }} />
              <div style={{ fontSize: '9px', color: '#000' }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(h.date).getDay()]}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const WaterBottle = () => {
    const fillPercentage = Math.min((todayHydration / hydrationTarget) * 100, 100);

    return (
      <svg width="100" height="200" style={{ margin: '0 auto', display: 'block' }}>
        {/* Bottle outline */}
        <rect x="20" y="10" width="60" height="140" rx="8" fill="none" stroke="#00FFFF" strokeWidth="2" />
        {/* Cap */}
        <rect x="30" y="5" width="40" height="8" rx="2" fill="#00FFFF" />
        {/* Fill */}
        <rect x="20" y={10 + (140 * (1 - fillPercentage / 100))} width="60" height={140 * (fillPercentage / 100)} rx="8" fill="#00FFFF" opacity="0.5" />
        {/* Water amount text */}
        <text x="50" y="100" textAnchor="middle" dominantBaseline="middle" fill="#00FFFF" fontSize="16" fontWeight="bold">
          {Math.round(todayHydration)}
        </text>
      </svg>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // TAB 6 — CHALLENGES
  // ═══════════════════════════════════════════════════════════════
  const [challenges, setChallenges] = useLocalStorage('sophia_challenges', DEFAULT_CHALLENGES);
  const [userChallenges, setUserChallenges] = useLocalStorage('sophia_user_challenges', {});
  const [newChallenge, setNewChallenge] = useState({
    name: '',
    description: '',
    duration: 30,
    trackingType: 'daily',
  });

  const joinChallenge = (challengeId) => {
    setUserChallenges(prev => ({
      ...prev,
      [challengeId]: {
        joined: getTodayDate(),
        progress: 0,
        completed: false,
      },
    }));
  };

  const updateChallengeProgress = (challengeId, value) => {
    setUserChallenges(prev => ({
      ...prev,
      [challengeId]: {
        ...prev[challengeId],
        progress: (prev[challengeId]?.progress || 0) + (typeof value === 'number' ? value : 1),
      },
    }));
  };

  // ═══════════════════════════════════════════════════════════════
  // TAB BUTTON HELPER
  // ═══════════════════════════════════════════════════════════════
  const tabButtonClass = (tab) => `
    text-sm px-4 py-2 rounded-lg transition-all
    ${activeTab === tab 
      ? 'bg-primary text-black font-semibold' 
      : 'text-black hover:text-black'}
  `;

  return (
    <div style={styles.container}>
      {/* TAB NAVIGATION */}
      <div style={styles.tabNav}>
        <button onClick={() => setActiveTab('training')} className={tabButtonClass('training')}>{renderIcon('💪', 16)} Training</button>
        <button onClick={() => setActiveTab('nutrition')} className={tabButtonClass('nutrition')}>{renderIcon('🥗', 16)} Nutrition</button>
        <button onClick={() => setActiveTab('sleep')} className={tabButtonClass('sleep')}>{renderIcon('🌙', 16)} Sleep</button>
        <button onClick={() => setActiveTab('stats')} className={tabButtonClass('stats')}>{renderIcon('📊', 16)} Body Stats</button>
        <button onClick={() => setActiveTab('hydration')} className={tabButtonClass('hydration')}>{renderIcon('💧', 16)} Hydration</button>
        <button onClick={() => setActiveTab('challenges')} className={tabButtonClass('challenges')}>{renderIcon('🎯', 16)} Challenges</button>
      </div>

      {/* TAB CONTENT */}
      <div style={styles.tabContent}>

        {/* TAB 1 — TRAINING */}
        {activeTab === 'training' && (
          <div>
            {/* WORKOUT STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
              <div style={styles.statCard}>
                <div style={{ fontSize: '12px', color: '#000' }}>Workouts this week</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#000' }}>{stats.thisWeek}</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: '12px', color: '#000' }}>Total minutes</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#000' }}>{stats.totalMinutes}</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: '12px', color: '#000' }}>Current streak</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFAA00' }}>{stats.streak}</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: '12px', color: '#000' }}>Rest days</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#000' }}>{stats.restDays}</div>
              </div>
            </div>

            {/* WEEKLY PLAN */}
            <div style={styles.toolSection}>
              <h3>Weekly Training Plan</h3>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                {trainingPlan.map((day, idx) => {
                  const dayDate = new Date();
                  dayDate.setDate(dayDate.getDate() - dayDate.getDay() + idx);
                  const dateStr = dayDate.toISOString().split('T')[0];
                  const isToday = dateStr === getTodayDate();
                  const isCompleted = completedDays[dateStr];

                  return (
                    <div
                      key={idx}
                      style={{
                        ...styles.card,
                        borderColor: isToday ? '#00FFFF' : 'rgba(255,255,255,0.1)',
                        borderWidth: isToday ? '2px' : '1px',
                        minWidth: '140px',
                        backgroundColor: isCompleted ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                        {isToday && '📍'} {day.day}
                      </div>
                      <div style={{ fontSize: '11px', backgroundColor: '#333', padding: '3px 6px', borderRadius: '3px', display: 'inline-block', marginBottom: '6px' }}>
                        {day.type}
                      </div>
                      {isCompleted && <div style={{ color: '#000', fontSize: '12px' }}>✓ Done</div>}
                      <div style={{ fontSize: '10px', color: '#000', marginTop: '4px' }}>
                        {day.exercises}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LOG WORKOUT */}
            <div style={styles.toolSection}>
              <h3>Log a Workout</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <select
                  value={newWorkout.type}
                  onChange={(e) => setNewWorkout(prev => ({ ...prev, type: e.target.value }))}
                  style={styles.input}
                >
                  <option>Push</option>
                  <option>Pull</option>
                  <option>Legs</option>
                  <option>Cardio</option>
                  <option>Mobility</option>
                  <option>Other</option>
                </select>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Duration: {newWorkout.duration}m</label>
                  <input
                    type="range"
                    min="15"
                    max="120"
                    value={newWorkout.duration}
                    onChange={(e) => setNewWorkout(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    style={styles.slider}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                {['Easy', 'Moderate', 'Intense'].map(intensity => (
                  <button
                    key={intensity}
                    onClick={() => setNewWorkout(prev => ({ ...prev, intensity }))}
                    style={{
                      ...styles.pillButton,
                      backgroundColor: newWorkout.intensity === intensity ? '#00FFFF' : 'transparent',
                      color: newWorkout.intensity === intensity ? '#000' : '#000',
                      borderColor: newWorkout.intensity === intensity ? '#00FFFF' : '#666',
                    }}
                  >
                    {intensity}
                  </button>
                ))}
              </div>

              <textarea
                placeholder="Notes (optional)"
                value={newWorkout.notes}
                onChange={(e) => setNewWorkout(prev => ({ ...prev, notes: e.target.value }))}
                style={{ ...styles.textarea, marginBottom: '8px' }}
              />

              <button onClick={logWorkout} style={styles.button}>Save workout</button>
            </div>

            {/* RECENT WORKOUTS */}
            {workouts.length > 0 && (
              <div style={styles.toolSection}>
                <h3>Recent Workouts</h3>
                {workouts.slice(-5).reverse().map(workout => (
                  <div key={workout.id} style={{ ...styles.card, marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                          {workout.type} · {workout.duration}m · {workout.intensity}
                        </div>
                        <div style={{ fontSize: '11px', color: '#000' }}>{workout.date}</div>
                        {workout.notes && <div style={{ fontSize: '11px', color: '#000', marginTop: '4px' }}>{workout.notes}</div>}
                      </div>
                      <button
                        onClick={() => setWorkouts(prev => prev.filter(w => w.id !== workout.id))}
                        style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer', fontSize: '16px' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* EXERCISE GUIDE */}
            <div style={styles.toolSection}>
              <h3>Exercise Guide</h3>
              {['Push', 'Pull', 'Legs', 'Core'].map(category => (
                <details key={category} style={{ marginBottom: '8px' }}>
                  <summary style={{ cursor: 'pointer', padding: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                    {category}
                  </summary>
                  <div style={{ paddingTop: '8px', paddingLeft: '16px', fontSize: '12px', color: '#000' }}>
                    {category === 'Push' && '• Bench press — 4x6 | • Shoulder press — 4x8 | • Tricep dips — 3x8'}
                    {category === 'Pull' && '• Deadlift — 3x5 | • Barbell rows — 4x6 | • Bicep curls — 3x8'}
                    {category === 'Legs' && '• Squat — 4x6 | • Lunges — 3x8 | • Calf raises — 3x12'}
                    {category === 'Core' && '• Plank — 3x60s | • Dead bug — 3x10 | • Ab wheel — 3x5'}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2 — NUTRITION */}
        {activeTab === 'nutrition' && (
          <div>
            {/* MACRO RINGS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <MacroRing label="Calories" current={macros.calories} target={macroTargets.calories} color="#00FFFF" />
              <MacroRing label="Protein" current={macros.protein} target={macroTargets.protein} color="#00FF88" />
              <MacroRing label="Carbs" current={macros.carbs} target={macroTargets.carbs} color="#FFAA00" />
              <MacroRing label="Fat" current={macros.fat} target={macroTargets.fat} color="#BB88FF" />
            </div>

            {/* LOG MEAL */}
            <div style={styles.toolSection}>
              <h3>Log a Meal</h3>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(type => (
                  <button
                    key={type}
                    onClick={() => setNewMeal(prev => ({ ...prev, type }))}
                    style={{
                      ...styles.pillButton,
                      backgroundColor: newMeal.type === type ? '#00FFFF' : 'transparent',
                      color: newMeal.type === type ? '#000' : '#000',
                      borderColor: newMeal.type === type ? '#00FFFF' : '#666',
                      flex: 1,
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Food name"
                value={newMeal.name}
                onChange={(e) => setNewMeal(prev => ({ ...prev, name: e.target.value }))}
                style={styles.input}
              />

              <input
                type="number"
                placeholder="Calories"
                value={newMeal.calories || ''}
                onChange={(e) => setNewMeal(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                style={styles.input}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                <input
                  type="number"
                  placeholder="Protein g"
                  value={newMeal.protein || ''}
                  onChange={(e) => setNewMeal(prev => ({ ...prev, protein: parseInt(e.target.value) || 0 }))}
                  style={styles.input}
                />
                <input
                  type="number"
                  placeholder="Carbs g"
                  value={newMeal.carbs || ''}
                  onChange={(e) => setNewMeal(prev => ({ ...prev, carbs: parseInt(e.target.value) || 0 }))}
                  style={styles.input}
                />
                <input
                  type="number"
                  placeholder="Fat g"
                  value={newMeal.fat || ''}
                  onChange={(e) => setNewMeal(prev => ({ ...prev, fat: parseInt(e.target.value) || 0 }))}
                  style={styles.input}
                />
              </div>

              <button onClick={addMeal} style={styles.button}>Add meal</button>
            </div>

            {/* TODAY'S MEALS */}
            {getTodaysMeals().length > 0 && (
              <div style={styles.toolSection}>
                <h3>Today's Meals</h3>
                {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(type => {
                  const typeMeals = getTodaysMeals().filter(m => m.type === type);
                  if (typeMeals.length === 0) return null;
                  return (
                    <div key={type} style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>{type}</div>
                      {typeMeals.map(meal => (
                        <div key={meal.id} style={{ ...styles.card, marginBottom: '6px', padding: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: '500' }}>{meal.name}</div>
                              <div style={{ fontSize: '11px', color: '#000', marginTop: '2px' }}>
                                {meal.calories}cal · {meal.protein}p · {meal.carbs}c · {meal.fat}f
                              </div>
                            </div>
                            <button
                              onClick={() => setMeals(prev => prev.filter(m => m.id !== meal.id))}
                              style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer' }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {/* NUTRITION PRINCIPLES */}
            <div style={styles.toolSection}>
              <h3>Nutrition Principles</h3>
              {NUTRITION_PRINCIPLES.map((principle, idx) => (
                <div key={idx} style={{ marginBottom: '8px' }}>
                  <div
                    onClick={() => setExpandedPrinciples(prev => ({ ...prev, [idx]: !prev[idx] }))}
                    style={{
                      cursor: 'pointer',
                      padding: '8px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{renderIcon(principle.emoji, 20)}</span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600' }}>{principle.title}</div>
                      <div style={{ fontSize: '11px', color: '#000' }}>{principle.short}</div>
                    </div>
                  </div>
                  {expandedPrinciples[idx] && (
                    <div style={{ ...styles.expandedContent, backgroundColor: 'rgba(255,255,255,0.02)', padding: '8px' }}>
                      <p style={{ fontSize: '11px', color: '#000', margin: 0, lineHeight: '1.5' }}>{principle.long}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3 — SLEEP */}
        {activeTab === 'sleep' && (
          <div>
            {/* SLEEP STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
              <div style={styles.statCard}>
                <div style={{ fontSize: '12px', color: '#000' }}>Avg duration</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: sleepStats.avgDuration >= 7 ? '#00FF88' : sleepStats.avgDuration >= 6 ? '#FFAA00' : '#FF4444' }}>
                  {sleepStats.avgDuration}h
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: '12px', color: '#000' }}>Avg quality</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#000' }}>
                  {sleepStats.avgQuality} ★
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: '12px', color: '#000' }}>Best night</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#000' }}>
                  {sleepStats.bestNight}h
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: '12px', color: '#000' }}>Sleep debt</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FF4444' }}>
                  {sleepStats.sleepDebt}h
                </div>
              </div>
            </div>

            {/* SLEEP LOG */}
            <div style={styles.toolSection}>
              <h3>Log Last Night's Sleep</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Bedtime</label>
                  <input
                    type="time"
                    value={newSleep.bedtime}
                    onChange={(e) => setNewSleep(prev => ({ ...prev, bedtime: e.target.value }))}
                    style={styles.input}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Wake time</label>
                  <input
                    type="time"
                    value={newSleep.waketime}
                    onChange={(e) => setNewSleep(prev => ({ ...prev, waketime: e.target.value }))}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={{ fontSize: '16px', fontFamily: "var(--font-plain)", fontWeight: 'bold', color: '#000', marginBottom: '12px' }}>
                Duration: {calculateSleepDuration().hours}h {calculateSleepDuration().minutes}m
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Quality: {newSleep.quality} ★</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newSleep.quality}
                  onChange={(e) => setNewSleep(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                  style={styles.slider}
                />
              </div>

              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                {['No', 'Somewhat', 'Yes'].map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setNewSleep(prev => ({ ...prev, rested: opt.split(' ')[1] }))}
                    style={{
                      ...styles.pillButton,
                      backgroundColor: newSleep.rested === opt.split(' ')[1] ? '#00FFFF' : 'transparent',
                      color: newSleep.rested === opt.split(' ')[1] ? '#000' : '#000',
                      borderColor: newSleep.rested === opt.split(' ')[1] ? '#00FFFF' : '#666',
                      flex: 1,
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Sleep disruptors (if any):</label>
                {['📱 Phone', '☕ Caffeine', '🍺 Alcohol', '😰 Stress', '🌡️ Temperature', '🔊 Noise'].map(disruptor => (
                  <button
                    key={disruptor}
                    onClick={() => {
                      const label = disruptor.split(' ')[1];
                      setNewSleep(prev => ({
                        ...prev,
                        disruptors: prev.disruptors.includes(label)
                          ? prev.disruptors.filter(d => d !== label)
                          : [...prev.disruptors, label],
                      }));
                    }}
                    style={{
                      ...styles.pillButton,
                      backgroundColor: newSleep.disruptors.includes(disruptor.split(' ')[1]) ? '#00FFFF' : 'transparent',
                      color: newSleep.disruptors.includes(disruptor.split(' ')[1]) ? '#000' : '#000',
                      borderColor: newSleep.disruptors.includes(disruptor.split(' ')[1]) ? '#00FFFF' : '#666',
                      marginRight: '6px',
                      marginBottom: '6px',
                    }}
                  >
                    {disruptor}
                  </button>
                ))}
              </div>

              <button onClick={logSleep} style={styles.button}>Log sleep</button>
            </div>

            {/* SLEEP CHART */}
            {sleepLog.length > 0 && (
              <div style={styles.toolSection}>
                <h3>Last 14 Nights</h3>
                <SleepChart />
              </div>
            )}

            {/* SLEEP TIPS */}
            <div style={styles.toolSection}>
              <h3>Sleep Optimization</h3>
              {SLEEP_TIPS.map((tip, idx) => (
                <div key={idx} style={{ marginBottom: '8px' }}>
                  <div
                    onClick={() => setExpandedTips(prev => ({ ...prev, [idx]: !prev[idx] }))}
                    style={{
                      cursor: 'pointer',
                      padding: '8px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{renderIcon(tip.emoji, 20)}</span>
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>{tip.title}</span>
                  </div>
                  {expandedTips[idx] && (
                    <div style={{ ...styles.expandedContent, backgroundColor: 'rgba(255,255,255,0.02)', padding: '8px' }}>
                      <p style={{ fontSize: '11px', color: '#000', margin: 0, lineHeight: '1.5' }}>{tip.text}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4 — BODY STATS */}
        {activeTab === 'stats' && (
          <div>
            {/* GOAL SELECTOR */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              {['Cut', 'Maintain', 'Bulk'].map(g => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  style={{
                    ...styles.pillButton,
                    backgroundColor: goal === g ? '#00FFFF' : 'transparent',
                    color: goal === g ? '#000' : '#000',
                    borderColor: goal === g ? '#00FFFF' : '#666',
                    flex: 1,
                  }}
                >
                  Goal: {g}
                </button>
              ))}
            </div>

            {/* MEASUREMENTS FORM */}
            <div style={styles.toolSection}>
              <h3>Log Measurements</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                <input
                  type="number"
                  placeholder="Weight (kg)"
                  value={newStats.weight || ''}
                  onChange={(e) => setNewStats(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                  style={styles.input}
                />
                <input
                  type="number"
                  placeholder="Height (cm)"
                  value={newStats.height || ''}
                  onChange={(e) => setNewStats(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                  style={styles.input}
                />
                <input
                  type="number"
                  placeholder="Body fat %"
                  value={newStats.bodyFat || ''}
                  onChange={(e) => setNewStats(prev => ({ ...prev, bodyFat: parseFloat(e.target.value) || 0 }))}
                  style={styles.input}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                <input
                  type="number"
                  placeholder="Chest (cm)"
                  value={newStats.chest || ''}
                  onChange={(e) => setNewStats(prev => ({ ...prev, chest: parseFloat(e.target.value) || 0 }))}
                  style={styles.input}
                />
                <input
                  type="number"
                  placeholder="Waist (cm)"
                  value={newStats.waist || ''}
                  onChange={(e) => setNewStats(prev => ({ ...prev, waist: parseFloat(e.target.value) || 0 }))}
                  style={styles.input}
                />
                <input
                  type="number"
                  placeholder="Hips (cm)"
                  value={newStats.hips || ''}
                  onChange={(e) => setNewStats(prev => ({ ...prev, hips: parseFloat(e.target.value) || 0 }))}
                  style={styles.input}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                <input
                  type="number"
                  placeholder="Left arm (cm)"
                  value={newStats.armLeft || ''}
                  onChange={(e) => setNewStats(prev => ({ ...prev, armLeft: parseFloat(e.target.value) || 0 }))}
                  style={styles.input}
                />
                <input
                  type="number"
                  placeholder="Right arm (cm)"
                  value={newStats.armRight || ''}
                  onChange={(e) => setNewStats(prev => ({ ...prev, armRight: parseFloat(e.target.value) || 0 }))}
                  style={styles.input}
                />
                <input
                  type="number"
                  placeholder="Left thigh (cm)"
                  value={newStats.thighLeft || ''}
                  onChange={(e) => setNewStats(prev => ({ ...prev, thighLeft: parseFloat(e.target.value) || 0 }))}
                  style={styles.input}
                />
                <input
                  type="number"
                  placeholder="Right thigh (cm)"
                  value={newStats.thighRight || ''}
                  onChange={(e) => setNewStats(prev => ({ ...prev, thighRight: parseFloat(e.target.value) || 0 }))}
                  style={styles.input}
                />
              </div>

              <button onClick={saveBodyStats} style={styles.button}>Save measurements</button>
            </div>

            {/* METRICS */}
            {latestStats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
                <div style={styles.statCard}>
                  <div style={{ fontSize: '12px', color: '#000' }}>BMI</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: bmiCat?.color }}>{bmi}</div>
                  <div style={{ fontSize: '10px', color: '#000', marginTop: '2px' }}>{bmiCat?.label}</div>
                </div>
                {ffmi && (
                  <div style={styles.statCard}>
                    <div style={{ fontSize: '12px', color: '#000' }}>FFMI</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#000' }}>{ffmi}</div>
                    <div style={{ fontSize: '10px', color: '#000', marginTop: '2px' }}>{ffmiCat}</div>
                  </div>
                )}
                {wth && (
                  <div style={styles.statCard}>
                    <div style={{ fontSize: '12px', color: '#000' }}>Waist to Height</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#000' }}>{wth}</div>
                    <div style={{ fontSize: '10px', color: '#000', marginTop: '2px' }}>{wthCat}</div>
                  </div>
                )}
                {idealWeight && (
                  <div style={styles.statCard}>
                    <div style={{ fontSize: '12px', color: '#000' }}>Ideal Weight</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#000' }}>
                      {idealWeight.min} - {idealWeight.max}kg
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* HISTORY */}
            {bodyStats.length > 0 && (
              <div style={styles.toolSection}>
                <h3>Measurement History</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ textAlign: 'left', padding: '6px', color: '#000' }}>Date</th>
                      <th style={{ textAlign: 'left', padding: '6px', color: '#000' }}>Weight</th>
                      <th style={{ textAlign: 'left', padding: '6px', color: '#000' }}>BMI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bodyStats.slice(-5).reverse().map((stat, idx) => {
                      const statBmi = calculateBMI(stat.weight, stat.height);
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '6px', color: '#000' }}>{stat.date}</td>
                          <td style={{ padding: '6px', color: '#000', fontWeight: 'bold' }}>{stat.weight}kg</td>
                          <td style={{ padding: '6px', color: '#000' }}>{statBmi}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5 — HYDRATION */}
        {activeTab === 'hydration' && (
          <div>
            {/* WATER BOTTLE */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <WaterBottle />
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#000' }}>/ {hydrationTarget}ml</div>
            </div>

            {/* QUICK ADD BUTTONS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '12px' }}>
              {[250, 500, 750, 1000].map(amount => (
                <button
                  key={amount}
                  onClick={() => addWater(amount)}
                  style={{
                    ...styles.pillButton,
                    backgroundColor: '#00FFFF',
                    color: '#000',
                    borderColor: '#00FFFF',
                    fontWeight: '600',
                  }}
                >
                  +{amount / 250}💧
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              <input
                type="number"
                placeholder="Custom (ml)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                style={{ ...styles.input, flex: 1, marginBottom: '0' }}
              />
              <button
                onClick={() => { if (customAmount) { addWater(parseInt(customAmount)); setCustomAmount(''); } }}
                style={styles.button}
              >
                Add
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '20px', color: '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>{renderIcon('💧', 22)} {hydrationStreak} day streak</div>
              <button
                onClick={() => {
                  setHydrationLog(prev => prev.filter(h => h.date !== getTodayDate()));
                }}
                style={{ ...styles.pillButton, color: '#000', borderColor: '#666', marginTop: '6px', fontSize: '11px' }}
              >
                Reset today
              </button>
            </div>

            {/* HYDRATION CHART */}
            <div style={styles.toolSection}>
              <h3>Last 7 Days</h3>
              <HydrationChart />
            </div>

            {/* HYDRATION FACTS */}
            <div style={styles.toolSection}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{renderIcon('💡', 18)} Hydration Science</h3>
              {HYDRATION_FACTS.map((fact, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.card,
                    backgroundColor: 'rgba(0,255,255,0.05)',
                    border: '1px solid rgba(0,255,255,0.2)',
                    marginBottom: '6px',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#000', lineHeight: '1.4' }}>{fact}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6 — CHALLENGES */}
        {activeTab === 'challenges' && (
          <div>
            {/* ACTIVE CHALLENGES */}
            <div style={styles.toolSection}>
              <h3>Fitness Challenges</h3>
              {challenges.map(challenge => {
                const userChallenge = userChallenges[challenge.id];
                const isJoined = userChallenge?.joined;

                return (
                  <div key={challenge.id} style={styles.card}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '20px' }}>{renderIcon(challenge.emoji, 22)}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '3px' }}>{challenge.name}</div>
                        <div style={{ fontSize: '11px', color: '#000', marginBottom: '8px' }}>{challenge.description}</div>
                        {isJoined ? (
                          <div>
                            <div style={{ fontSize: '11px', color: '#000', fontWeight: 'bold', marginBottom: '4px' }}>
                              {userChallenge.progress} / {challenge.duration} days
                            </div>
                            <div style={{ backgroundColor: '#333', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                              <div
                                style={{
                                  backgroundColor: '#00FFFF',
                                  height: '100%',
                                  width: `${(userChallenge.progress / challenge.duration) * 100}%`,
                                }}
                              />
                            </div>
                            <button
                              onClick={() => updateChallengeProgress(challenge.id, 1)}
                              style={{...styles.button, padding: '6px 12px', fontSize: '12px'}}
                            >
                              Check In Today
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => joinChallenge(challenge.id)}
                            style={{...styles.button, padding: '6px 12px', fontSize: '12px'}}
                          >
                            Join Challenge
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* COMMUNITY LEADERBOARD */}
            <div style={styles.toolSection}>
              <h3>🌐 Community Leaderboard</h3>
              <div style={{ fontSize: '12px', color: '#000', marginBottom: '12px' }}>
                Connect with the community to see how you rank.
              </div>
              {[
                { name: 'Alex Chen', streak: 47, score: 1250 },
                { name: 'Jordan Kim', streak: 42, score: 1180 },
                { name: 'Casey Rivera', streak: 38, score: 1045 },
              ].map((entry, idx) => (
                <div key={idx} style={{ ...styles.card, marginBottom: '6px', padding: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 'bold' }}>#{idx + 1}</div>
                      <div style={{ fontSize: '11px', color: '#000' }}>{entry.name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: '#000', fontWeight: 'bold' }}>{entry.streak} day streak</div>
                      <div style={{ fontSize: '11px', color: '#000' }}>{entry.score} pts</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
