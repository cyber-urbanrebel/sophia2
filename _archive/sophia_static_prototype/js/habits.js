/* ═══════════════════════════════════════════════════════════
   HABITS.JS — Discipline / Habit Tracking Page
   ═══════════════════════════════════════════════════════════ */

const Discipline = (() => {

  function render() {
    const habits = Storage.getAll(Storage.KEYS.HABITS);
    const todayKey = Utils.toDateKey(new Date());
    const totalToday = habits.length;
    let doneToday = 0;
    habits.forEach(h => {
      if (h.logs && h.logs.some(l => l.date === todayKey && l.status === 'complete')) doneToday++;
    });

    return `
      <div class="discipline-page page-enter">
        <div class="section-header">
          <div><h2>Discipline Forge</h2><p class="section-desc">Build unbreakable habits with streak tracking, cue-reward cycles, and behavioral science — don't break the chain.</p></div>
          <button class="btn btn-primary btn-sm" id="add-habit-btn">${Icons.getSmall('plus')} New Habit</button>
        </div>

        <!-- Today's Progress -->
        <div class="card" style="margin-bottom:24px;">
          <div class="card-body" style="display:flex;align-items:center;gap:24px;">
            <div id="habits-gauge" style="min-width:80px;"></div>
            <div style="flex:1;">
              <h3>Today's Habits</h3>
              <p style="color:var(--text-secondary);">${doneToday}/${totalToday} completed</p>
              <div class="progress-bar" style="margin-top:8px;">
                <div class="progress-fill" style="width:${totalToday ? (doneToday/totalToday*100) : 0}%;background:var(--emerald);"></div>
              </div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:2rem;font-weight:700;color:var(--gold);">${habits.reduce((max,h)=>Math.max(max,h.streak||0),0)}</div>
              <div style="font-size:0.75rem;color:var(--text-muted);">Best Streak</div>
            </div>
          </div>
        </div>

        <!-- Habit Grid -->
        <div class="habit-grid" id="habit-grid">
          ${habits.length ? habits.map(h => renderHabitCard(h, todayKey)).join('') : `
            <div class="empty-state" style="grid-column:1/-1;">
              <div style="color:var(--text-muted);margin-bottom:12px;">${Icons.get('discipline', 48)}</div>
              <h4>No habits yet</h4>
              <p>Build the discipline that defines who you become.</p>
              <button class="btn btn-primary btn-sm" id="add-habit-empty">${Icons.getSmall('plus')} Create First Habit</button>
            </div>
          `}
        </div>

        <!-- Habit Trend Chart -->
        <div class="card" style="margin-top:24px;">
          <div class="card-header"><h3>Completion Trend (30 days)</h3></div>
          <div class="card-body" style="height:250px;">
            <canvas id="habit-trend-chart"></canvas>
          </div>
        </div>

        <!-- Habit Form Modal -->
        <div class="modal-overlay" id="habit-modal" style="display:none;">
          <div class="modal" style="max-width:520px;">
            <div class="modal-header">
              <h3 id="habit-modal-title">New Habit</h3>
              <button class="btn btn-ghost btn-icon" id="habit-modal-close">${Icons.get('close', 20)}</button>
            </div>
            <div class="modal-body">
              <form id="habit-form">
                <input type="hidden" id="habit-id">
                <div class="form-group">
                  <label class="form-label">Habit Name</label>
                  <input type="text" id="habit-name" class="form-input" required maxlength="80" placeholder="e.g., Morning Meditation">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <div class="form-group">
                    <label class="form-label">Domain</label>
                    <select id="habit-domain" class="form-select">
                      ${Utils.DOMAINS.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Type</label>
                    <select id="habit-type" class="form-select">
                      <option value="daily">Daily</option>
                      <option value="avoidance">Avoidance</option>
                      <option value="build">Build</option>
                    </select>
                  </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <div class="form-group">
                    <label class="form-label">Cue (Trigger)</label>
                    <input type="text" id="habit-cue" class="form-input" placeholder="After waking up...">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Reward</label>
                    <input type="text" id="habit-reward" class="form-input" placeholder="Calm start to day">
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Difficulty (1-5)</label>
                  <input type="range" id="habit-difficulty" min="1" max="5" value="3" style="width:100%;">
                  <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted);">
                    <span>Easy</span><span>Hard</span>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Active Days</label>
                  <div class="radio-chips" id="habit-days">
                    ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => `
                      <label class="radio-chip">
                        <input type="checkbox" value="${i}" checked>
                        <span>${d}</span>
                      </label>
                    `).join('')}
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" id="habit-cancel">Cancel</button>
                  <button type="submit" class="btn btn-primary">Save Habit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderHabitCard(h, todayKey) {
    const loggedToday = h.logs && h.logs.find(l => l.date === todayKey);
    const status = loggedToday ? loggedToday.status : 'pending';
    const streakPct = Math.min(100, (h.streak || 0) / Math.max(h.bestStreak || 30, 1) * 100);

    // Last 7 days mini-heatmap
    const mini = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dk = Utils.toDateKey(d);
      const log = h.logs ? h.logs.find(l => l.date === dk) : null;
      const color = log?.status === 'complete' ? 'var(--emerald)' : log?.status === 'partial' ? 'var(--amber)' : log?.status === 'skip' ? 'var(--text-muted)' : 'var(--border)';
      mini.push(`<div style="width:10px;height:10px;border-radius:2px;background:${color};" title="${dk}"></div>`);
    }

    return `
      <div class="card habit-card" data-id="${h.id}" style="border-left:3px solid ${Utils.getDomainColor(h.domain)};">
        <div class="card-body">
          <div style="display:flex;justify-content:space-between;align-items:start;">
            <div>
              <h4 style="font-size:0.9375rem;">${Utils.escapeHtml(h.name)}</h4>
              <span class="badge" style="font-size:0.65rem;background:${Utils.getDomainColor(h.domain)}20;color:${Utils.getDomainColor(h.domain)};">${Utils.getDomainName(h.domain)}</span>
              <span class="badge" style="font-size:0.65rem;margin-left:4px;">${Utils.capitalize(h.type)}</span>
            </div>
            <div style="display:flex;gap:2px;">
              <button class="btn btn-ghost btn-icon btn-sm habit-edit" data-id="${h.id}">${Icons.getSmall('journal')}</button>
              <button class="btn btn-ghost btn-icon btn-sm habit-delete" data-id="${h.id}">${Icons.getSmall('close')}</button>
            </div>
          </div>

          <!-- Streak -->
          <div style="display:flex;align-items:center;gap:8px;margin:12px 0 8px;">
            <span style="color:var(--gold);font-weight:700;font-size:1.25rem;">${h.streak || 0}</span>
            <span style="font-size:0.75rem;color:var(--text-muted);">day streak</span>
            <span style="font-size:0.75rem;color:var(--text-muted);margin-left:auto;">Best: ${h.bestStreak || 0}</span>
          </div>
          <div class="progress-bar" style="margin-bottom:12px;">
            <div class="progress-fill" style="width:${streakPct}%;background:var(--gold);"></div>
          </div>

          <!-- Mini heatmap -->
          <div style="display:flex;gap:3px;margin-bottom:12px;">${mini.join('')}</div>

          <!-- Log buttons -->
          <div class="habit-log-buttons" style="display:flex;gap:6px;">
            <button class="btn btn-sm ${status === 'complete' ? 'btn-primary' : 'btn-secondary'} habit-log" data-id="${h.id}" data-status="complete">
              ${Icons.getSmall('check')} Done
            </button>
            <button class="btn btn-sm ${status === 'partial' ? 'btn-primary' : 'btn-ghost'} habit-log" data-id="${h.id}" data-status="partial">
              Partial
            </button>
            <button class="btn btn-sm ${status === 'skip' ? 'btn-primary' : 'btn-ghost'} habit-log" data-id="${h.id}" data-status="skip">
              Skip
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function init() {
    const habits = Storage.getAll(Storage.KEYS.HABITS);

    // Today's gauge
    const todayKey = Utils.toDateKey(new Date());
    let done = 0;
    habits.forEach(h => { if (h.logs?.some(l => l.date === todayKey && l.status === 'complete')) done++; });
    const gaugeEl = document.getElementById('habits-gauge');
    if (gaugeEl) Charts.circularGauge(gaugeEl, habits.length ? (done / habits.length * 100) : 0, 'var(--emerald)', null, 80);

    // Trend chart
    const trendData = { labels: [], values: [] };
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dk = Utils.toDateKey(d);
      trendData.labels.push(dk.slice(5));
      let count = 0;
      habits.forEach(h => { if (h.logs?.some(l => l.date === dk && l.status === 'complete')) count++; });
      trendData.values.push(count);
    }
    Charts.habitTrend('habit-trend-chart', trendData);

    // Event bindings
    document.getElementById('add-habit-btn')?.addEventListener('click', () => openHabitForm());
    document.getElementById('add-habit-empty')?.addEventListener('click', () => openHabitForm());
    document.getElementById('habit-modal-close')?.addEventListener('click', closeHabitForm);
    document.getElementById('habit-cancel')?.addEventListener('click', closeHabitForm);
    document.getElementById('habit-form')?.addEventListener('submit', saveHabit);

    // Delegated
    document.getElementById('habit-grid')?.addEventListener('click', e => {
      const logBtn = e.target.closest('.habit-log');
      const editBtn = e.target.closest('.habit-edit');
      const deleteBtn = e.target.closest('.habit-delete');
      if (logBtn) logHabit(logBtn.dataset.id, logBtn.dataset.status);
      if (editBtn) openHabitForm(editBtn.dataset.id);
      if (deleteBtn) deleteHabit(deleteBtn.dataset.id);
    });
  }

  function logHabit(id, status) {
    const habits = Storage.getAll(Storage.KEYS.HABITS);
    const h = habits.find(x => x.id === id);
    if (!h) return;

    const todayKey = Utils.toDateKey(new Date());
    if (!h.logs) h.logs = [];
    const existing = h.logs.findIndex(l => l.date === todayKey);

    if (existing >= 0) {
      h.logs[existing].status = status;
    } else {
      h.logs.push({ date: todayKey, status, note: '' });
    }

    // Update streak
    if (status === 'complete') {
      h.streak = (h.streak || 0) + 1;
      if (h.streak > (h.bestStreak || 0)) h.bestStreak = h.streak;
      Storage.addXP(10, h.domain);
      Utils.toast(`${h.name} logged! +10 XP`, 'success');
    } else if (status === 'skip' || status === 'failed') {
      h.streak = 0;
    }

    // Recalculate streak properly
    let currentStreak = 0;
    const sortedLogs = [...h.logs].sort((a, b) => b.date.localeCompare(a.date));
    for (const log of sortedLogs) {
      if (log.status === 'complete') currentStreak++;
      else break;
    }
    h.streak = currentStreak;
    if (h.streak > (h.bestStreak || 0)) h.bestStreak = h.streak;

    Storage.set(Storage.KEYS.HABITS, habits);
    App.route();
  }

  function openHabitForm(editId) {
    const modal = document.getElementById('habit-modal');
    if (!modal) return;
    modal.style.display = 'flex';

    if (editId) {
      const habits = Storage.getAll(Storage.KEYS.HABITS);
      const h = habits.find(x => x.id === editId);
      if (!h) return;
      document.getElementById('habit-modal-title').textContent = 'Edit Habit';
      document.getElementById('habit-id').value = h.id;
      document.getElementById('habit-name').value = h.name;
      document.getElementById('habit-domain').value = h.domain;
      document.getElementById('habit-type').value = h.type;
      document.getElementById('habit-cue').value = h.cue || '';
      document.getElementById('habit-reward').value = h.reward || '';
      document.getElementById('habit-difficulty').value = h.difficulty || 3;
      // Set active days
      const dayChecks = document.querySelectorAll('#habit-days input[type="checkbox"]');
      dayChecks.forEach(cb => { cb.checked = (h.activeDays || []).includes(parseInt(cb.value)); });
    } else {
      document.getElementById('habit-modal-title').textContent = 'New Habit';
      document.getElementById('habit-form').reset();
      document.getElementById('habit-id').value = '';
      document.querySelectorAll('#habit-days input[type="checkbox"]').forEach(cb => { cb.checked = true; });
    }
  }

  function closeHabitForm() {
    document.getElementById('habit-modal').style.display = 'none';
  }

  function saveHabit(e) {
    e.preventDefault();
    const habits = Storage.getAll(Storage.KEYS.HABITS);
    const id = document.getElementById('habit-id').value || Storage.uid();
    const isEdit = habits.some(h => h.id === id);

    const activeDays = [];
    document.querySelectorAll('#habit-days input[type="checkbox"]:checked').forEach(cb => {
      activeDays.push(parseInt(cb.value));
    });

    const habit = {
      id,
      name: document.getElementById('habit-name').value.trim(),
      domain: document.getElementById('habit-domain').value,
      type: document.getElementById('habit-type').value,
      cue: document.getElementById('habit-cue').value.trim(),
      reward: document.getElementById('habit-reward').value.trim(),
      difficulty: parseInt(document.getElementById('habit-difficulty').value) || 3,
      activeDays,
      streak: 0,
      bestStreak: 0,
      logs: [],
    };

    if (isEdit) {
      const existing = habits.find(h => h.id === id);
      habit.streak = existing?.streak || 0;
      habit.bestStreak = existing?.bestStreak || 0;
      habit.logs = existing?.logs || [];
      const idx = habits.findIndex(h => h.id === id);
      habits[idx] = habit;
    } else {
      habits.push(habit);
    }

    Storage.set(Storage.KEYS.HABITS, habits);
    closeHabitForm();
    Utils.toast(isEdit ? 'Habit updated' : 'New habit created!', 'success');
    App.route();
  }

  function deleteHabit(id) {
    if (!confirm('Delete this habit and all its logs?')) return;
    const habits = Storage.getAll(Storage.KEYS.HABITS).filter(h => h.id !== id);
    Storage.set(Storage.KEYS.HABITS, habits);
    Utils.toast('Habit deleted', 'info');
    App.route();
  }

  return { render, init };
})();
