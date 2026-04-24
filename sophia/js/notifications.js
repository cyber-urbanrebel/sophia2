/* ═══════════════════════════════════════════════════════════
   NOTIFICATIONS.JS — Notification System & Topbar Dropdowns
   ═══════════════════════════════════════════════════════════ */

const Notifications = (() => {
  const STORAGE_KEY = 'sophia_notifications';
  let isDropdownOpen = false;
  let isProfileOpen = false;

  // ── Generate notifications from user activity ──
  function generate() {
    const existing = getAll();
    if (existing.length > 0) return existing;

    const notifications = [];
    const now = Date.now();
    const user = Storage.getUser();
    const progress = Storage.getProgress();
    const habits = Storage.getAll(Storage.KEYS.HABITS);
    const tasks = Storage.getAll(Storage.KEYS.TASKS);
    const goals = Storage.getAll(Storage.KEYS.GOALS);
    const todayKey = Utils.toDateKey(new Date());

    // Welcome
    notifications.push({
      id: 'n_welcome',
      icon: 'star',
      title: 'Welcome to SOPHIA',
      body: 'Your self-development engine is ready. Explore each section to unlock your full potential.',
      time: now - 86400000 * 2,
      read: false,
      action: '#dashboard',
      type: 'system'
    });

    // Streak celebration
    const streak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
    if (streak >= 7) {
      notifications.push({
        id: 'n_streak',
        icon: 'flame',
        title: `${streak}-Day Streak!`,
        body: `You\'re on fire! ${streak} consecutive days of discipline. Keep the momentum going.`,
        time: now - 3600000 * 4,
        read: false,
        action: '#discipline',
        type: 'achievement'
      });
    }

    // Level / XP
    const level = progress ? Utils.levelFromXP(progress.xp || 0) : 1;
    if (level >= 2) {
      notifications.push({
        id: 'n_level',
        icon: 'trophy',
        title: `Level ${level} Reached`,
        body: `You\'ve earned ${progress.xp || 0} XP. Each action compounds — keep climbing.`,
        time: now - 3600000 * 8,
        read: false,
        action: '#progress',
        type: 'achievement'
      });
    }

    // Habits due today
    const undoneHabits = habits.filter(h => {
      const done = h.logs && h.logs.some(l => l.date === todayKey && l.status === 'complete');
      return !done;
    });
    if (undoneHabits.length > 0) {
      notifications.push({
        id: 'n_habits_due',
        icon: 'discipline',
        title: 'Habits Awaiting',
        body: `${undoneHabits.length} habit${undoneHabits.length > 1 ? 's' : ''} still pending today. Don\'t break the chain.`,
        time: now - 3600000,
        read: false,
        action: '#discipline',
        type: 'reminder'
      });
    }

    // Tasks due
    const tasksDue = tasks.filter(t => t.status !== 'done' && t.dueDate === todayKey);
    if (tasksDue.length > 0) {
      notifications.push({
        id: 'n_tasks_due',
        icon: 'tasks',
        title: 'Tasks Due Today',
        body: `${tasksDue.length} task${tasksDue.length > 1 ? 's' : ''} need attention: "${Utils.escapeHtml(tasksDue[0].title)}"${tasksDue.length > 1 ? ' and more' : ''}.`,
        time: now - 1800000,
        read: false,
        action: '#tasks',
        type: 'reminder'
      });
    }

    // Goals progress
    const activeGoals = goals.filter(g => g.status === 'active');
    if (activeGoals.length > 0) {
      const topGoal = activeGoals.reduce((a, b) => (a.progress > b.progress ? a : b));
      notifications.push({
        id: 'n_goal',
        icon: 'path',
        title: 'Goal Update',
        body: `"${Utils.escapeHtml(topGoal.title)}" is at ${topGoal.progress}%. You\'re making real progress.`,
        time: now - 7200000,
        read: false,
        action: '#path',
        type: 'progress'
      });
    }

    // Journal reminder
    const journalToday = Storage.getAll(Storage.KEYS.JOURNAL).some(j => j.date === todayKey);
    if (!journalToday) {
      notifications.push({
        id: 'n_journal',
        icon: 'journal',
        title: 'Daily Reflection',
        body: 'Take a moment to reflect. Writing clarifies thinking and deepens self-awareness.',
        time: now - 600000,
        read: false,
        action: '#journal',
        type: 'reminder'
      });
    }

    // Wisdom tip
    notifications.push({
      id: 'n_wisdom',
      icon: 'mind',
      title: 'Daily Wisdom',
      body: '"The obstacle is the way." — Marcus Aurelius. Check the Wisdom Feed for today\'s insight.',
      time: now - 300000,
      read: false,
      action: '#mind',
      type: 'wisdom'
    });

    // Sort newest first
    notifications.sort((a, b) => b.time - a.time);
    save(notifications);
    return notifications;
  }

  function getAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function save(notifications) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }

  function getUnreadCount() {
    return getAll().filter(n => !n.read).length;
  }

  function markRead(id) {
    const all = getAll();
    const n = all.find(x => x.id === id);
    if (n) { n.read = true; save(all); }
    updateBadge();
  }

  function markAllRead() {
    const all = getAll();
    all.forEach(n => n.read = true);
    save(all);
    updateBadge();
  }

  function clearAll() {
    save([]);
    updateBadge();
  }

  // ── Badge ──
  function updateBadge() {
    const badge = document.querySelector('.notification-badge');
    const count = getUnreadCount();
    if (badge) {
      badge.textContent = count > 0 ? (count > 9 ? '9+' : count) : '';
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  // ── Time formatting ──
  function timeAgo(ts) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  // ── Render dropdown ──
  function renderDropdown() {
    const all = getAll();
    const typeColors = {
      system: 'var(--cyan)',
      achievement: 'var(--gold)',
      reminder: 'var(--rose)',
      progress: 'var(--emerald)',
      wisdom: 'var(--violet)',
    };

    if (!all.length) {
      return `
        <div class="notification-dropdown-header">
          <span>Notifications</span>
        </div>
        <div class="notification-empty">
          ${Icons.get('bell', 32)}
          <p style="margin-top:8px;">All caught up! No notifications.</p>
        </div>`;
    }

    return `
      <div class="notification-dropdown-header">
        <span>Notifications (${getUnreadCount()} new)</span>
        <button class="btn-text-sm" id="notif-mark-all">Mark all read</button>
      </div>
      <div class="notification-list">
        ${all.slice(0, 10).map(n => `
          <div class="notification-item ${n.read ? 'read' : 'unread'}" data-id="${n.id}" data-action="${n.action || ''}">
            <div class="notif-icon" style="color:${typeColors[n.type] || 'var(--text-muted)'}">
              ${Icons.get(n.icon || 'info', 18)}
            </div>
            <div class="notif-content">
              <div class="notif-title">${Utils.escapeHtml(n.title)}</div>
              <div class="notif-body">${Utils.escapeHtml(n.body)}</div>
              <div class="notif-time">${timeAgo(n.time)}</div>
            </div>
            ${!n.read ? '<div class="notif-dot"></div>' : ''}
          </div>
        `).join('')}
      </div>
      ${all.length > 10 ? `<div class="notification-footer">And ${all.length - 10} more...</div>` : ''}
    `;
  }

  // ── Profile dropdown ──
  function renderProfileDropdown() {
    const user = Storage.getUser();
    const progress = Storage.getProgress();
    const level = progress ? Utils.levelFromXP(progress.xp || 0) : 1;
    const xpProg = progress ? Utils.xpProgress(progress.xp || 0) : { current: 0, needed: 100, pct: 0 };
    const habits = Storage.getAll(Storage.KEYS.HABITS);
    const streak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
    const goals = Storage.getAll(Storage.KEYS.GOALS).filter(g => g.status === 'active');
    const tasks = Storage.getAll(Storage.KEYS.TASKS);
    const done = tasks.filter(t => t.status === 'done').length;

    return `
      <div class="profile-dropdown-header">
        <div class="profile-dd-avatar" style="background:${Utils.avatarGradient(user.name)}">${Utils.initials(user.name)}</div>
        <div class="profile-dd-info">
          <div class="profile-dd-name">${Utils.escapeHtml(user.name)}</div>
          <div class="profile-dd-email">${Utils.escapeHtml(user.email)}</div>
        </div>
      </div>
      <div class="profile-dd-badges">
        <span class="badge badge-gold">${user.plan || 'Free'}</span>
        <span class="badge" style="background:var(--cyan-dim);color:var(--cyan);">Level ${level}</span>
      </div>
      <div class="profile-dd-stats">
        <div class="pds-item">
          ${Icons.getSmall('flame')}
          <span>${streak}-day streak</span>
        </div>
        <div class="pds-item">
          ${Icons.getSmall('path')}
          <span>${goals.length} active goals</span>
        </div>
        <div class="pds-item">
          ${Icons.getSmall('tasks')}
          <span>${done}/${tasks.length} tasks done</span>
        </div>
        <div class="pds-item">
          ${Icons.getSmall('star')}
          <span>${progress.xp || 0} XP earned</span>
        </div>
      </div>
      <div class="xp-bar" style="margin:0 16px 12px;">
        <div class="xp-fill" style="width:${xpProg.pct}%"></div>
      </div>
      <div class="profile-dd-links">
        <a class="profile-dd-link" data-action="#progress">${Icons.getSmall('progress')} Analytics &amp; Progress</a>
        <a class="profile-dd-link" data-action="#payment">${Icons.getSmall('payment')} Plans &amp; Billing</a>
        <a class="profile-dd-link" data-action="about">${Icons.getSmall('info')} About SOPHIA</a>
      </div>
      <div class="profile-dd-footer">
        <button class="btn btn-ghost btn-sm" id="profile-logout-btn" style="width:100%;">${Icons.getSmall('logout')} Sign Out</button>
      </div>
    `;
  }

  // ── About SOPHIA Modal ──
  function showAboutModal() {
    closeAll();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay about-modal-overlay';
    overlay.innerHTML = `
      <div class="about-modal">
        <button class="modal-close" id="about-close">${Icons.get('close', 20)}</button>
        <div class="about-header">
          <div class="about-logo">SOPHIA</div>
          <div class="about-sub">Self-Development Engine</div>
          <div class="about-ver">Version 1.0.0</div>
        </div>
        <div class="about-body">
          <div class="about-section">
            <h4>${Icons.getSmall('path')} What is SOPHIA?</h4>
            <p>SOPHIA is a comprehensive self-development platform inspired by classical philosophy. It integrates habit tracking, journaling, goal management, wisdom teachings, and body training into one unified system built for disciplined growth.</p>
          </div>
          <div class="about-section">
            <h4>${Icons.getSmall('dashboard')} Platform Features</h4>
            <ul>
              <li><strong>Dashboard</strong> — Unified command center with life-balance radar, streaks, XP tracking, and a 90-day consistency heatmap</li>
              <li><strong>Path (Goals)</strong> — Set SMART goals across 8 life domains with milestones, success criteria, and progress tracking</li>
              <li><strong>Tasks</strong> — Kanban-style task board with priority levels, time tracking, and a built-in Pomodoro timer</li>
              <li><strong>Mind (Wisdom)</strong> — Curated library of Stoic, Buddhist, Existentialist, and modern psychology teachings with daily reflections</li>
              <li><strong>Body</strong> — Workout plans, health metrics (weight, sleep, steps, water), and physical performance analytics</li>
              <li><strong>Discipline (Habits)</strong> — Habit stacking with streaks, completion rates, cue-reward cycles, and behavioral science insights</li>
              <li><strong>Journal</strong> — Prompted and freewrite entries with mood scoring, word analytics, and philosophical prompts</li>
              <li><strong>Progress</strong> — Advanced analytics with domain radar charts, XP timelines, level progression, and trend visualization</li>
              <li><strong>AI Coach</strong> — Contextual coaching assistant that adapts advice based on your activity, streaks, and goals</li>
              <li><strong>M-Pesa Payments</strong> — Seamless mobile money integration for premium plan upgrades</li>
            </ul>
          </div>
          <div class="about-section">
            <h4>${Icons.getSmall('mind')} Philosophy</h4>
            <p>"The unexamined life is not worth living." — Socrates. SOPHIA embodies the Greek pursuit of wisdom (σοφία). Every feature is designed to make daily self-reflection a habit, not an afterthought.</p>
          </div>
          <div class="about-section">
            <h4>${Icons.getSmall('discipline')} The 8 Domains of Growth</h4>
            <p>Physical · Mental · Emotional · Spiritual · Professional · Financial · Relationships · Creative — SOPHIA tracks all eight dimensions of a balanced life.</p>
          </div>
        </div>
        <div class="about-footer">
          <button class="btn btn-primary" id="about-explore-btn">Start Exploring</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));

    overlay.querySelector('#about-close').addEventListener('click', () => removeModal(overlay));
    overlay.querySelector('#about-explore-btn').addEventListener('click', () => removeModal(overlay));
    overlay.addEventListener('click', e => { if (e.target === overlay) removeModal(overlay); });
  }

  function removeModal(overlay) {
    overlay.classList.remove('open');
    setTimeout(() => overlay.remove(), 200);
  }

  // ── Toggle handlers ──
  function toggleNotifications() {
    const container = document.getElementById('notification-dropdown');
    if (!container) return;

    if (isProfileOpen) closeProfile();

    if (isDropdownOpen) {
      container.classList.remove('open');
      isDropdownOpen = false;
    } else {
      container.innerHTML = renderDropdown();
      container.classList.add('open');
      isDropdownOpen = true;
      bindDropdownEvents(container);
    }
  }

  function toggleProfile() {
    const container = document.getElementById('profile-dropdown');
    if (!container) return;

    if (isDropdownOpen) closeNotifications();

    if (isProfileOpen) {
      container.classList.remove('open');
      isProfileOpen = false;
    } else {
      container.innerHTML = renderProfileDropdown();
      container.classList.add('open');
      isProfileOpen = true;
      bindProfileEvents(container);
    }
  }

  function closeNotifications() {
    const el = document.getElementById('notification-dropdown');
    if (el) el.classList.remove('open');
    isDropdownOpen = false;
  }

  function closeProfile() {
    const el = document.getElementById('profile-dropdown');
    if (el) el.classList.remove('open');
    isProfileOpen = false;
  }

  function closeAll() {
    closeNotifications();
    closeProfile();
  }

  // ── Event binding ──
  function bindDropdownEvents(container) {
    // Mark all read
    container.querySelector('#notif-mark-all')?.addEventListener('click', e => {
      e.stopPropagation();
      markAllRead();
      container.innerHTML = renderDropdown();
      bindDropdownEvents(container);
    });

    // Click notification items
    container.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        const action = item.dataset.action;
        markRead(id);
        closeAll();
        if (action) window.location.hash = action;
      });
    });
  }

  function bindProfileEvents(container) {
    // Navigation links
    container.querySelectorAll('.profile-dd-link').forEach(link => {
      link.addEventListener('click', () => {
        const action = link.dataset.action;
        closeAll();
        if (action === 'about') {
          showAboutModal();
        } else if (action) {
          window.location.hash = action;
        }
      });
    });

    // Logout
    container.querySelector('#profile-logout-btn')?.addEventListener('click', () => {
      closeAll();
      Auth.logout();
    });
  }

  // ── Init (inject dropdown containers + bind topbar buttons) ──
  function init() {
    generate();

    // Inject dropdown containers into topbar
    const notifBtn = document.getElementById('notification-btn');
    const profileBtn = document.getElementById('profile-btn');

    if (notifBtn && !document.getElementById('notification-dropdown')) {
      notifBtn.style.position = 'relative';
      const dd = document.createElement('div');
      dd.id = 'notification-dropdown';
      dd.className = 'notification-dropdown';
      notifBtn.appendChild(dd);
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleNotifications();
      });
    }

    if (profileBtn && !document.getElementById('profile-dropdown')) {
      profileBtn.style.position = 'relative';
      const pd = document.createElement('div');
      pd.id = 'profile-dropdown';
      pd.className = 'profile-dropdown';
      profileBtn.appendChild(pd);
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleProfile();
      });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => closeAll());

    // Update badge count
    updateBadge();
  }

  return { init, generate, updateBadge, closeAll, showAboutModal };
})();
