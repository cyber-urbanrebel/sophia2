/* ═══════════════════════════════════════════════════════════
   UTILS.JS — Helpers, Date Formatting, XP, SVG Icons
   ═══════════════════════════════════════════════════════════ */

const Utils = (() => {

  // ── Date Helpers ──
  function formatDate(date, style = 'long') {
    const d = date instanceof Date ? date : new Date(date);
    if (style === 'long') return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (style === 'short') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (style === 'iso') return d.toISOString().slice(0, 10);
    if (style === 'time') return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString();
  }

  function toDateKey(d) {
    const dt = d instanceof Date ? d : new Date(d);
    return dt.toISOString().slice(0, 10);
  }

  function today() { return toDateKey(new Date()); }

  function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return toDateKey(d);
  }

  function daysUntil(dateStr) {
    const target = new Date(dateStr);
    const now = new Date();
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  }

  function timeOfDay() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  function dayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  }

  // ── Number/String Helpers ──
  function clamp(val, min, max) { return Math.min(max, Math.max(min, val)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 9); }
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function truncate(s, n) { return s.length > n ? s.slice(0, n) + '...' : s; }
  function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function pluralize(n, w) { return `${n} ${w}${n === 1 ? '' : 's'}`; }

  // ── XP Calculation ──
  function xpForLevel(level) { return level * 500; }
  function levelFromXP(xp) { return Math.floor(xp / 500) + 1; }
  function xpProgress(xp) {
    const level = levelFromXP(xp);
    const base = (level - 1) * 500;
    return ((xp - base) / 500) * 100;
  }

  // ── Debounce ──
  function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  // ── Count-up Animation ──
  function animateCount(element, target, duration = 1200) {
    const start = 0;
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      element.textContent = Math.round(lerp(start, target, eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ── Gradient from Initials ──
  function avatarGradient(name) {
    const colors = [
      ['#C4A962', '#D4C078'], ['#00CED1', '#14B8A6'], ['#8B5CF6', '#A78BFA'],
      ['#F43F5E', '#FB7185'], ['#10B981', '#34D399'], ['#3B82F6', '#60A5FA'],
      ['#F59E0B', '#FBBF24'], ['#EC4899', '#F472B6'],
    ];
    const idx = (name || '').charCodeAt(0) % colors.length;
    return `linear-gradient(135deg, ${colors[idx][0]}, ${colors[idx][1]})`;
  }

  function initials(name) {
    return (name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  // ── Confetti ──
  function showConfetti(duration = 3000) {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    const colors = ['var(--gold)', 'var(--cyan)', 'var(--violet)', 'var(--emerald)', 'var(--rose)'];
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[i % colors.length];
      piece.style.animationDuration = (1.5 + Math.random() * 2) + 's';
      piece.style.animationDelay = Math.random() * 0.5 + 's';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      piece.style.width = (6 + Math.random() * 8) + 'px';
      piece.style.height = (6 + Math.random() * 8) + 'px';
      container.appendChild(piece);
    }
    document.body.appendChild(container);
    setTimeout(() => container.remove(), duration);
  }

  // ── Toast Notification ──
  function toast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `${Icons.getSmall(type === 'success' ? 'check' : type === 'error' ? 'warning' : 'info')} ${escapeHtml(message)}`;
    container.appendChild(el);
    setTimeout(() => { el.style.animation = 'slideOutRight 0.3s ease forwards'; setTimeout(() => el.remove(), 300); }, 3500);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Validation ──
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePassword(pw) {
    const checks = {
      length: pw.length >= 8,
      upper: /[A-Z]/.test(pw),
      lower: /[a-z]/.test(pw),
      digit: /[0-9]/.test(pw),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pw),
    };
    const passed = Object.values(checks).filter(Boolean).length;
    let strength = 'weak';
    if (passed >= 4) strength = 'fair';
    if (passed >= 5 && pw.length >= 10) strength = 'strong';
    if (passed === 5 && pw.length >= 12) strength = 'excellent';
    return { checks, strength, passed };
  }

  // ── Quotes of the day ──
  const QUOTES = [
    { text: "The impediment to action advances action. What stands in the way becomes the way.", source: "Marcus Aurelius", tradition: "Stoicism" },
    { text: "We suffer more in imagination than in reality.", source: "Seneca", tradition: "Stoicism" },
    { text: "No man is free who is not master of himself.", source: "Epictetus", tradition: "Stoicism" },
    { text: "The mind is everything. What you think you become.", source: "Buddha", tradition: "Buddhism" },
    { text: "Peace comes from within. Do not seek it without.", source: "Buddha", tradition: "Buddhism" },
    { text: "In the middle of difficulty lies opportunity.", source: "Albert Einstein", tradition: "Philosophy" },
    { text: "He who has a why to live can bear almost any how.", source: "Friedrich Nietzsche", tradition: "Existentialism" },
    { text: "Man is condemned to be free.", source: "Jean-Paul Sartre", tradition: "Existentialism" },
    { text: "The only way to do great work is to love what you do.", source: "Steve Jobs", tradition: "Leadership" },
    { text: "Knowing yourself is the beginning of all wisdom.", source: "Aristotle", tradition: "Philosophy" },
    { text: "The unexamined life is not worth living.", source: "Socrates", tradition: "Philosophy" },
    { text: "Happiness depends upon ourselves.", source: "Aristotle", tradition: "Philosophy" },
    { text: "What we achieve inwardly will change outer reality.", source: "Plutarch", tradition: "Stoicism" },
    { text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", source: "Buddha", tradition: "Buddhism" },
    { text: "It is not death that a man should fear, but he should fear never beginning to live.", source: "Marcus Aurelius", tradition: "Stoicism" },
    { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", source: "Nelson Mandela", tradition: "Leadership" },
    { text: "Waste no more time arguing about what a good man should be. Be one.", source: "Marcus Aurelius", tradition: "Stoicism" },
    { text: "Three things cannot be long hidden: the sun, the moon, and the truth.", source: "Buddha", tradition: "Buddhism" },
    { text: "Life can only be understood backwards; but it must be lived forwards.", source: "Kierkegaard", tradition: "Existentialism" },
    { text: "The only person you are destined to become is the person you decide to be.", source: "Ralph Waldo Emerson", tradition: "Philosophy" },
    { text: "An unexamined life is not worth living.", source: "Socrates", tradition: "Philosophy" },
    { text: "First say to yourself what you would be; and then do what you have to do.", source: "Epictetus", tradition: "Stoicism" },
    { text: "The mind that is anxious about future events is miserable.", source: "Seneca", tradition: "Stoicism" },
    { text: "You have power over your mind — not outside events. Realize this, and you will find strength.", source: "Marcus Aurelius", tradition: "Stoicism" },
    { text: "Discipline is the bridge between goals and accomplishment.", source: "Jim Rohn", tradition: "Leadership" },
    { text: "Energy and persistence conquer all things.", source: "Benjamin Franklin", tradition: "Philosophy" },
    { text: "Between stimulus and response there is a space. In that space is our power to choose our response.", source: "Viktor Frankl", tradition: "Existentialism" },
    { text: "Attachment is the root of suffering.", source: "Buddha", tradition: "Buddhism" },
    { text: "Make the best use of what is in your power, and take the rest as it happens.", source: "Epictetus", tradition: "Stoicism" },
    { text: "The privilege of a lifetime is to become who you truly are.", source: "Carl Jung", tradition: "Psychology" },
  ];

  function getDailyQuote() {
    const idx = dayOfYear() % QUOTES.length;
    return QUOTES[idx];
  }

  // ── Domain helpers ──
  const DOMAINS = [
    { id: 'physical', name: 'Physical Health', color: 'var(--cyan)', abbr: 'PHY' },
    { id: 'mental', name: 'Mental Wellness', color: 'var(--violet)', abbr: 'MEN' },
    { id: 'emotional', name: 'Emotional Intelligence', color: 'var(--rose)', abbr: 'EMO' },
    { id: 'spiritual', name: 'Spiritual Development', color: 'var(--emerald)', abbr: 'SPI' },
    { id: 'professional', name: 'Professional Growth', color: 'var(--blue)', abbr: 'PRO' },
    { id: 'financial', name: 'Financial Security', color: 'var(--amber)', abbr: 'FIN' },
    { id: 'relationships', name: 'Relationships', color: 'var(--teal)', abbr: 'REL' },
    { id: 'creative', name: 'Creative Expression', color: '#EC4899', abbr: 'CRE' },
  ];

  function getDomainColor(domainId) {
    return DOMAINS.find(d => d.id === domainId)?.color || 'var(--text-muted)';
  }

  function getDomainName(domainId) {
    return DOMAINS.find(d => d.id === domainId)?.name || domainId;
  }

  // ── Streak calculation ──
  function calcStreak(logs, dateField = 'date') {
    if (!logs || !logs.length) return 0;
    const dates = [...new Set(logs.map(l => toDateKey(l[dateField])))].sort().reverse();
    let streak = 0;
    const d = new Date();
    for (let i = 0; i < 366; i++) {
      const key = toDateKey(d);
      if (dates.includes(key)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else if (i === 0) {
        d.setDate(d.getDate() - 1);
        continue;
      } else {
        break;
      }
    }
    return streak;
  }

  // ── Premium gating ──
  function requirePremium(featureName, callback) {
    const user = Storage.getUser();
    if (user && (user.plan === 'premium' || user.plan === 'lifetime')) {
      callback();
    } else {
      showUpgradeModal(featureName);
    }
  }

  function showUpgradeModal(featureName) {
    const overlay = document.getElementById('upgrade-modal');
    if (overlay) {
      overlay.querySelector('.upgrade-feature-name').textContent = featureName || 'this feature';
      overlay.classList.remove('hidden');
    }
  }

  function hideUpgradeModal() {
    const overlay = document.getElementById('upgrade-modal');
    if (overlay) overlay.classList.add('hidden');
  }

  return {
    formatDate, toDateKey, today, daysAgo, daysUntil, timeOfDay, dayOfYear,
    clamp, lerp, uid, capitalize, truncate, slugify, pluralize,
    xpForLevel, levelFromXP, xpProgress,
    debounce, animateCount, avatarGradient, initials,
    showConfetti, toast, escapeHtml,
    validateEmail, validatePassword,
    QUOTES, getDailyQuote,
    DOMAINS, getDomainColor, getDomainName,
    calcStreak,
    requirePremium, showUpgradeModal, hideUpgradeModal,
  };
})();
