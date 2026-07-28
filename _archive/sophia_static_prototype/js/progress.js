/* ═══════════════════════════════════════════════════════════
   PROGRESS.JS — Analytics / Progress Page
   ═══════════════════════════════════════════════════════════ */

const Progress = (() => {

  function render() {
    const progress = Storage.getProgress();
    const habits = Storage.getAll(Storage.KEYS.HABITS);
    const goals = Storage.getAll(Storage.KEYS.GOALS);
    const tasks = Storage.getAll(Storage.KEYS.TASKS);
    const journal = Storage.getAll(Storage.KEYS.JOURNAL);
    const level = Utils.levelFromXP(progress?.xp || 0);
    const xpProg = Utils.xpProgress(progress?.xp || 0);
    const scores = progress?.domainScores || {};
    const avgScore = Object.values(scores).length
      ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length) : 0;

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'done').length;
    const activeGoals = goals.filter(g => g.status === 'active').length;
    const streak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);

    return `
      <div class="progress-page page-enter">
        <div class="section-header" style="margin-bottom:16px;">
          <div><h2>Analytics &amp; Progress</h2><p class="section-desc">XP timeline, level progression, domain radar, and trend charts — measure what matters to grow what counts.</p></div>
        </div>
        <!-- Overview Stats -->
        <div class="stat-row" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:24px;">
          <div class="stat-card">
            <div class="stat-value" style="color:var(--gold);">Level ${level}</div>
            <div class="stat-label">${progress?.xp || 0} Total XP</div>
            <div class="progress-bar" style="margin-top:8px;">
              <div class="progress-fill" style="width:${xpProg.pct}%;background:var(--gold);"></div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color:var(--emerald);">${avgScore}%</div>
            <div class="stat-label">Life Balance Score</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color:var(--cyan);">${streak}</div>
            <div class="stat-label">Current Streak</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${doneTasks}/${totalTasks}</div>
            <div class="stat-label">Tasks Completed</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${activeGoals}</div>
            <div class="stat-label">Active Goals</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${journal.length}</div>
            <div class="stat-label">Journal Entries</div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="analytics-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <!-- Domain Radar -->
          <div class="card">
            <div class="card-header"><h3>Life Domain Balance</h3></div>
            <div class="card-body" style="height:300px;"><canvas id="prog-radar"></canvas></div>
          </div>

          <!-- XP Over Time -->
          <div class="card">
            <div class="card-header"><h3>XP Growth</h3></div>
            <div class="card-body" style="height:300px;"><canvas id="prog-xp"></canvas></div>
          </div>

          <!-- Habit Completion -->
          <div class="card">
            <div class="card-header"><h3>Habit Completion Rate</h3></div>
            <div class="card-body" style="height:300px;"><canvas id="prog-habits"></canvas></div>
          </div>

          <!-- Domain Breakdown -->
          <div class="card">
            <div class="card-header"><h3>Domain Distribution</h3></div>
            <div class="card-body" style="height:300px;"><canvas id="prog-domains"></canvas></div>
          </div>

          <!-- Journal Frequency -->
          <div class="card">
            <div class="card-header"><h3>Journal Frequency (30 days)</h3></div>
            <div class="card-body" style="height:250px;"><canvas id="prog-journal"></canvas></div>
          </div>

          <!-- Goal Progress -->
          <div class="card">
            <div class="card-header"><h3>Goal Progress</h3></div>
            <div class="card-body" style="height:250px;"><canvas id="prog-goals"></canvas></div>
          </div>
        </div>

        <!-- Domain Details -->
        <div class="section-header" style="margin-top:24px;">
          <h2>Domain Breakdown</h2>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
          ${Utils.DOMAINS.map(d => {
            const score = scores[d.id] || 0;
            return `
              <div class="card" style="border-left:3px solid ${d.color};">
                <div class="card-body" style="display:flex;align-items:center;gap:12px;">
                  <div id="domain-gauge-${d.id}" style="min-width:60px;"></div>
                  <div>
                    <h4 style="font-size:0.875rem;">${d.name}</h4>
                    <p style="font-size:0.75rem;color:var(--text-muted);">${score}% progress</p>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Achievements -->
        <div class="section-header" style="margin-top:24px;">
          <h2>Achievements</h2>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">
          ${renderAchievements(habits, goals, tasks, journal, progress)}
        </div>
      </div>
    `;
  }

  function renderAchievements(habits, goals, tasks, journal, progress) {
    const streak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
    const achievements = [
      { name: 'First Steps', desc: 'Complete your first habit', unlocked: habits.some(h => h.logs?.length > 0), icon: 'check' },
      { name: 'Scholar', desc: 'Write 5 journal entries', unlocked: journal.length >= 5, icon: 'journal' },
      { name: 'Task Master', desc: 'Complete 10 tasks', unlocked: tasks.filter(t => t.status === 'done').length >= 10, icon: 'tasks' },
      { name: 'Goal Setter', desc: 'Create 3 life goals', unlocked: goals.length >= 3, icon: 'path' },
      { name: 'Flame Keeper', desc: '7-day habit streak', unlocked: streak >= 7, icon: 'flame' },
      { name: 'Inferno', desc: '30-day habit streak', unlocked: streak >= 30, icon: 'flame' },
      { name: 'Level 5', desc: 'Reach level 5', unlocked: Utils.levelFromXP(progress?.xp || 0) >= 5, icon: 'trophy' },
      { name: 'Level 10', desc: 'Reach level 10', unlocked: Utils.levelFromXP(progress?.xp || 0) >= 10, icon: 'trophy' },
    ];

    return achievements.map(a => `
      <div class="card" style="opacity:${a.unlocked ? 1 : 0.5};">
        <div class="card-body" style="display:flex;align-items:center;gap:12px;">
          <div style="color:${a.unlocked ? 'var(--gold)' : 'var(--text-muted)'};">${Icons.get(a.icon, 28)}</div>
          <div>
            <h4 style="font-size:0.875rem;">${a.name}</h4>
            <p style="font-size:0.75rem;color:var(--text-muted);">${a.desc}</p>
          </div>
          ${a.unlocked ? '<span class="badge badge-gold" style="margin-left:auto;font-size:0.65rem;">Unlocked</span>' : ''}
        </div>
      </div>
    `).join('');
  }

  function init() {
    const progress = Storage.getProgress();
    const habits = Storage.getAll(Storage.KEYS.HABITS);
    const goals = Storage.getAll(Storage.KEYS.GOALS);
    const journal = Storage.getAll(Storage.KEYS.JOURNAL);
    const scores = progress?.domainScores || {};
    const weekly = progress?.weeklyData || [];

    // Radar
    Charts.domainRadar('prog-radar', scores);

    // XP over time
    Charts.xpOverTime('prog-xp', {
      labels: weekly.slice(-30).map(d => d.date.slice(5)),
      values: weekly.slice(-30).map((d, i, arr) => arr.slice(0, i + 1).reduce((sum, x) => sum + x.xpEarned, 0)),
    });

    // Habit completion rate
    const habitData = { labels: [], values: [] };
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dk = Utils.toDateKey(d);
      habitData.labels.push(dk.slice(5));
      let count = 0;
      habits.forEach(h => { if (h.logs?.some(l => l.date === dk && l.status === 'complete')) count++; });
      habitData.values.push(habits.length ? Math.round(count / habits.length * 100) : 0);
    }
    Charts.habitTrend('prog-habits', habitData);

    // Domain doughnut
    Charts.domainDoughnut('prog-domains', scores);

    // Journal frequency
    const journalData = { labels: [], values: [] };
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dk = Utils.toDateKey(d);
      journalData.labels.push(dk.slice(5));
      journalData.values.push(journal.filter(e => e.date === dk).length);
    }
    Charts.journalFrequency('prog-journal', journalData);

    // Goal progress
    const activeGoals = goals.filter(g => g.status === 'active');
    if (activeGoals.length) {
      Charts.completionBar('prog-goals', {
        labels: activeGoals.map(g => g.title.substring(0, 18)),
        values: activeGoals.map(g => g.progress),
        colors: activeGoals.map(g => Utils.getDomainColor(g.domain)),
      });
    }

    // Domain gauges
    Utils.DOMAINS.forEach(d => {
      const el = document.getElementById(`domain-gauge-${d.id}`);
      if (el) Charts.circularGauge(el, scores[d.id] || 0, d.color, null, 60);
    });
  }

  return { render, init };
})();
