/* ═══════════════════════════════════════════════════════════
   DASHBOARD.JS — Main Dashboard Page
   ═══════════════════════════════════════════════════════════ */

const Dashboard = (() => {

  function render() {
    const user = Storage.getUser();
    const progress = Storage.getProgress();
    const habits = Storage.getAll(Storage.KEYS.HABITS);
    const tasks = Storage.getAll(Storage.KEYS.TASKS);
    const goals = Storage.getAll(Storage.KEYS.GOALS);
    const journal = Storage.getAll(Storage.KEYS.JOURNAL);
    const streak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
    const level = progress ? Utils.levelFromXP(progress.xp || 0) : 1;
    const xpProg = progress ? Utils.xpProgress(progress.xp || 0) : { current: 0, needed: 100, pct: 0 };
    const quote = Utils.getDailyQuote();
    const greeting = Utils.timeOfDay();
    const todayKey = Utils.toDateKey(new Date());

    // Habit completion today
    let habitsToday = 0, habitsTotal = habits.length;
    habits.forEach(h => {
      if (h.logs && h.logs.some(l => l.date === todayKey && l.status === 'complete')) habitsToday++;
    });

    // Tasks due today
    const tasksDue = tasks.filter(t => t.status !== 'done' && t.dueDate === todayKey).length;
    const tasksDone = tasks.filter(t => t.status === 'done').length;

    // Active goals
    const activeGoals = goals.filter(g => g.status === 'active');

    // Domain scores
    const scores = progress?.domainScores || {};

    return `
      <div class="dashboard-page page-enter">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="hero-orb">
            <div class="orb"></div>
          </div>
          <div class="hero-text">
            <h1 class="greeting">Good ${greeting}, ${Utils.escapeHtml(user.name?.split(' ')[0] || 'Seeker')}</h1>
            <p class="hero-date">${Utils.formatDate(new Date(), 'long')}</p>
            <p class="hero-quote">"${Utils.escapeHtml(quote.text)}"<br><span style="color:var(--text-muted);font-size:0.8125rem;">— ${Utils.escapeHtml(quote.author)}</span></p>
            <div class="hero-level">
              <span class="level-badge">Level ${level}</span>
              <div class="xp-bar"><div class="xp-fill" style="width:${xpProg.pct}%"></div></div>
              <span class="xp-text">${xpProg.current} / ${xpProg.needed} XP</span>
            </div>
          </div>
        </div>

        <!-- Gauge Grid -->
        <div class="gauge-grid">
          <div class="gauge-card" id="gauge-habits">
            <div class="gauge-visual" id="gauge-visual-habits"></div>
            <div class="gauge-info">
              <h4>Habits Today</h4>
              <p>${habitsToday}/${habitsTotal} completed</p>
            </div>
          </div>
          <div class="gauge-card" id="gauge-tasks">
            <div class="gauge-visual" id="gauge-visual-tasks"></div>
            <div class="gauge-info">
              <h4>Tasks Due</h4>
              <p>${tasksDue} pending today</p>
            </div>
          </div>
          <div class="gauge-card" id="gauge-goals">
            <div class="gauge-visual" id="gauge-visual-goals"></div>
            <div class="gauge-info">
              <h4>Active Goals</h4>
              <p>${activeGoals.length} in progress</p>
            </div>
          </div>
          <div class="gauge-card" id="gauge-streak">
            <div class="gauge-visual" id="gauge-visual-streak"></div>
            <div class="gauge-info">
              <h4>Streak</h4>
              <p>${streak} days ${Icons.getSmall('flame')}</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="section-header">
          <h2>Quick Actions</h2>
        </div>
        <div class="quick-actions">
          <button class="action-card" onclick="window.location.hash='#discipline'">
            <span class="action-tooltip">Track daily habits, build streaks &amp; maintain discipline chains</span>
            ${Icons.get('discipline', 28)}
            <span>Log Habit</span>
          </button>
          <button class="action-card" onclick="window.location.hash='#tasks'">
            <span class="action-tooltip">Kanban board with priorities, Pomodoro timer &amp; time tracking</span>
            ${Icons.get('tasks', 28)}
            <span>Add Task</span>
          </button>
          <button class="action-card" onclick="window.location.hash='#journal'">
            <span class="action-tooltip">Prompted &amp; freewrite entries with mood scoring &amp; word analytics</span>
            ${Icons.get('journal', 28)}
            <span>Write Journal</span>
          </button>
          <button class="action-card" onclick="window.location.hash='#mind'">
            <span class="action-tooltip">Stoic, Buddhist &amp; psychology wisdom with daily reflections</span>
            ${Icons.get('mind', 28)}
            <span>Wisdom Feed</span>
          </button>
        </div>

        <!-- Two Column Layout -->
        <div class="dashboard-grid">
          <!-- Domain Radar -->
          <div class="card">
            <div class="card-header">
              <h3>Life Balance</h3>
              <a href="#progress" class="btn btn-ghost btn-sm">Details</a>
            </div>
            <div class="card-body" style="height:300px;">
              <canvas id="dashboard-radar"></canvas>
            </div>
          </div>

          <!-- Completion Trend -->
          <div class="card">
            <div class="card-header">
              <h3>Weekly Trend</h3>
            </div>
            <div class="card-body" style="height:300px;">
              <canvas id="dashboard-trend"></canvas>
            </div>
          </div>
        </div>

        <!-- Active Goals -->
        <div class="section-header" style="margin-top:24px;">
          <h2>Active Goals</h2>
          <a href="#path" class="btn btn-ghost btn-sm">View All</a>
        </div>
        <div class="goals-row">
          ${activeGoals.length ? activeGoals.slice(0, 3).map(g => `
            <div class="card goal-mini-card" style="border-left:3px solid ${Utils.getDomainColor(g.domain)};">
              <div class="card-body">
                <h4>${Utils.escapeHtml(g.title)}</h4>
                <p style="color:var(--text-secondary);font-size:0.8125rem;margin:6px 0;">${Utils.escapeHtml(g.description || '').substring(0, 80)}</p>
                <div class="progress-bar" style="margin-top:8px;">
                  <div class="progress-fill" style="width:${g.progress}%;background:${Utils.getDomainColor(g.domain)}"></div>
                </div>
                <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:0.75rem;color:var(--text-muted);">
                  <span>${g.progress}%</span>
                  <span>${g.targetDate ? Utils.daysUntil(new Date(g.targetDate)) + ' days left' : ''}</span>
                </div>
              </div>
            </div>
          `).join('') : '<div class="empty-state"><p>No active goals. Set your first goal!</p><a href="#path" class="btn btn-primary btn-sm">Create Goal</a></div>'}
        </div>

        <!-- Recent Activity -->
        <div class="section-header" style="margin-top:24px;">
          <h2>Today's Activity</h2>
        </div>
        <div class="card">
          <div class="card-body" id="today-activity">
            ${renderTodayActivity(habits, tasks, journal, todayKey)}
          </div>
        </div>

        <!-- Heatmap -->
        <div class="section-header" style="margin-top:24px;">
          <h2>Consistency Heatmap</h2>
        </div>
        <div class="card">
          <div class="card-body">
            <div class="heatmap" id="heatmap"></div>
          </div>
        </div>
      </div>
    `;
  }

  function renderTodayActivity(habits, tasks, journal, todayKey) {
    const items = [];

    habits.forEach(h => {
      if (h.logs && h.logs.some(l => l.date === todayKey && l.status === 'complete')) {
        items.push(`<div class="activity-item">${Icons.getSmall('check')} Completed habit: <strong>${Utils.escapeHtml(h.name)}</strong></div>`);
      }
    });
    tasks.filter(t => t.status === 'done').forEach(t => {
      items.push(`<div class="activity-item">${Icons.getSmall('tasks')} Finished task: <strong>${Utils.escapeHtml(t.title)}</strong></div>`);
    });
    journal.filter(j => j.date === todayKey).forEach(j => {
      items.push(`<div class="activity-item">${Icons.getSmall('journal')} Journal entry: <strong>${Utils.escapeHtml(j.prompt || 'Freewrite')}</strong></div>`);
    });

    if (!items.length) {
      return `<div class="empty-state" style="padding:20px 0;"><p>No activity yet today. Start your routines!</p></div>`;
    }
    return items.join('');
  }

  function init() {
    const progress = Storage.getProgress();
    const habits = Storage.getAll(Storage.KEYS.HABITS);
    const todayKey = Utils.toDateKey(new Date());
    let habitsToday = 0;
    habits.forEach(h => {
      if (h.logs && h.logs.some(l => l.date === todayKey && l.status === 'complete')) habitsToday++;
    });

    // Circular gauges
    const scores = progress?.domainScores || {};
    const avgScore = Object.values(scores).length
      ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length) : 0;

    const g1 = document.getElementById('gauge-visual-habits');
    const g2 = document.getElementById('gauge-visual-tasks');
    const g3 = document.getElementById('gauge-visual-goals');
    const g4 = document.getElementById('gauge-visual-streak');
    if (g1) Charts.circularGauge(g1, habits.length ? (habitsToday / habits.length * 100) : 0, 'var(--emerald)', null, 70);
    if (g2) Charts.circularGauge(g2, avgScore, 'var(--cyan)', null, 70);
    if (g3) Charts.circularGauge(g3, avgScore, 'var(--violet)', null, 70);
    if (g4) Charts.circularGauge(g4, Math.min(100, (habits.reduce((max, h) => Math.max(max, h.streak || 0), 0) / 30) * 100), 'var(--gold)', null, 70);

    // Domain radar chart
    Charts.domainRadar('dashboard-radar', scores);

    // Weekly trend
    const weekly = progress?.weeklyData || [];
    const last7 = weekly.slice(-7);
    Charts.habitTrend('dashboard-trend', {
      labels: last7.map(d => d.date.slice(5)),
      values: last7.map(d => d.habitsCompleted),
    });

    // Heatmap
    renderHeatmap(habits);

    // Make gauge cards clickable for navigation
    const gaugeRoutes = { 'gauge-habits': '#discipline', 'gauge-tasks': '#tasks', 'gauge-goals': '#path', 'gauge-streak': '#discipline' };
    const gaugeTips = { 'gauge-habits': 'View & log your daily habits', 'gauge-tasks': 'Manage your task board', 'gauge-goals': 'Track your goal progress', 'gauge-streak': 'Maintain your streak' };
    Object.entries(gaugeRoutes).forEach(([id, hash]) => {
      const el = document.getElementById(id);
      if (el) {
        el.title = gaugeTips[id];
        el.addEventListener('click', () => { window.location.hash = hash; });
      }
    });
  }

  function renderHeatmap(habits) {
    const container = document.getElementById('heatmap');
    if (!container) return;

    const cells = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dk = Utils.toDateKey(d);
      let count = 0;
      habits.forEach(h => {
        if (h.logs && h.logs.some(l => l.date === dk && l.status === 'complete')) count++;
      });
      const opacity = count === 0 ? 0.1 : Math.min(1, 0.2 + (count / Math.max(habits.length, 1)) * 0.8);
      cells.push(`<div class="heatmap-cell" style="background:rgba(196,169,98,${opacity});" title="${dk}: ${count} habits"></div>`);
    }
    container.innerHTML = cells.join('');
  }

  return { render, init };
})();
