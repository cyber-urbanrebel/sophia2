/* ═══════════════════════════════════════════════════════════
   BODY.JS — Physical Excellence / Workout Page
   ═══════════════════════════════════════════════════════════ */

const Body = (() => {

  function render() {
    const workouts = Storage.getAll(Storage.KEYS.WORKOUTS);
    const metrics = Storage.getAll(Storage.KEYS.METRICS);
    const todayKey = Utils.toDateKey(new Date());
    const todayMetric = metrics.find(m => m.date === todayKey);
    const last7 = metrics.slice(-7);

    return `
      <div class="body-page page-enter">
        <!-- Today's Metrics -->
        <div class="section-header">
          <div><h2>Body Metrics</h2><p class="section-desc">Track weight, sleep, steps &amp; hydration — log workouts and watch your physical transformation over time.</p></div>
          <button class="btn btn-primary btn-sm" id="log-metric-btn">${Icons.getSmall('plus')} Log Today</button>
        </div>

        <div class="stat-row" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:24px;">
          <div class="stat-card">
            <div class="stat-value">${todayMetric ? todayMetric.weight.toFixed(1) + 'kg' : '--'}</div>
            <div class="stat-label">Weight</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${todayMetric ? todayMetric.sleep.toFixed(1) + 'h' : '--'}</div>
            <div class="stat-label">Sleep</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${todayMetric ? todayMetric.energy + '/10' : '--'}</div>
            <div class="stat-label">Energy</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${todayMetric ? todayMetric.restingHR + 'bpm' : '--'}</div>
            <div class="stat-label">Resting HR</div>
          </div>
        </div>

        <!-- Charts -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
          <div class="card">
            <div class="card-header"><h3>Weight Trend</h3></div>
            <div class="card-body" style="height:220px;"><canvas id="weight-chart"></canvas></div>
          </div>
          <div class="card">
            <div class="card-header"><h3>Sleep Trend</h3></div>
            <div class="card-body" style="height:220px;"><canvas id="sleep-chart"></canvas></div>
          </div>
        </div>

        <!-- Workout Plans -->
        <div class="section-header">
          <h2>Workout Plans</h2>
          <button class="btn btn-primary btn-sm" id="add-workout-btn">${Icons.getSmall('plus')} New Plan</button>
        </div>

        <div id="workout-plans">
          ${workouts.length ? workouts.map(renderWorkoutPlan).join('') : `
            <div class="empty-state">
              <div style="color:var(--text-muted);margin-bottom:12px;">${Icons.get('workout', 48)}</div>
              <h4>No workout plans</h4>
              <p>Create a training program to track your physical development.</p>
            </div>
          `}
        </div>

        <!-- Metric Form Modal -->
        <div class="modal-overlay" id="metric-modal" style="display:none;">
          <div class="modal" style="max-width:420px;">
            <div class="modal-header">
              <h3>Log Body Metrics</h3>
              <button class="btn btn-ghost btn-icon" id="metric-modal-close">${Icons.get('close', 20)}</button>
            </div>
            <div class="modal-body">
              <form id="metric-form">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <div class="form-group">
                    <label class="form-label">Weight (kg)</label>
                    <input type="number" id="metric-weight" class="form-input" step="0.1" min="20" max="300" value="${todayMetric?.weight?.toFixed(1) || ''}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Sleep (hours)</label>
                    <input type="number" id="metric-sleep" class="form-input" step="0.5" min="0" max="24" value="${todayMetric?.sleep?.toFixed(1) || ''}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Energy (1-10)</label>
                    <input type="range" id="metric-energy" class="form-input" min="1" max="10" value="${todayMetric?.energy || 5}" style="padding:0;">
                    <div style="text-align:center;font-size:0.8125rem;color:var(--text-secondary);" id="energy-display">${todayMetric?.energy || 5}</div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Resting HR (bpm)</label>
                    <input type="number" id="metric-hr" class="form-input" min="30" max="200" value="${todayMetric?.restingHR || ''}">
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" id="metric-cancel">Cancel</button>
                  <button type="submit" class="btn btn-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Workout Form Modal -->
        <div class="modal-overlay" id="workout-modal" style="display:none;">
          <div class="modal" style="max-width:600px;">
            <div class="modal-header">
              <h3 id="workout-modal-title">New Workout Plan</h3>
              <button class="btn btn-ghost btn-icon" id="workout-modal-close">${Icons.get('close', 20)}</button>
            </div>
            <div class="modal-body">
              <form id="workout-form">
                <input type="hidden" id="workout-id">
                <div class="form-group">
                  <label class="form-label">Plan Name</label>
                  <input type="text" id="workout-name" class="form-input" required maxlength="80" placeholder="e.g., Beginner Strength">
                </div>
                <div class="form-group">
                  <label class="form-label">Difficulty</label>
                  <select id="workout-difficulty" class="form-select">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Sessions</label>
                  <div id="workout-sessions-list"></div>
                  <button type="button" class="btn btn-dashed btn-sm" id="add-session-btn">${Icons.getSmall('plus')} Add Session</button>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" id="workout-cancel">Cancel</button>
                  <button type="submit" class="btn btn-primary">Save Plan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderWorkoutPlan(w) {
    return `
      <div class="card" style="margin-bottom:16px;" data-id="${w.id}">
        <div class="card-header">
          <div>
            <h3>${Utils.escapeHtml(w.name)}</h3>
            <span class="badge" style="font-size:0.65rem;">${Utils.capitalize(w.difficulty)}</span>
          </div>
          <div style="display:flex;gap:4px;">
            <button class="btn btn-ghost btn-sm workout-edit" data-id="${w.id}">Edit</button>
            <button class="btn btn-ghost btn-sm workout-delete" data-id="${w.id}">Delete</button>
          </div>
        </div>
        <div class="card-body">
          ${(w.sessions || []).map((s, si) => `
            <div class="workout-session" style="margin-bottom:16px;">
              <h4 style="font-size:0.875rem;margin-bottom:8px;color:var(--gold);">${Utils.escapeHtml(s.name)}</h4>
              <div class="data-table" style="font-size:0.8125rem;">
                <table>
                  <thead><tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Weight</th><th>Rest</th></tr></thead>
                  <tbody>
                    ${(s.exercises || []).map(ex => `
                      <tr>
                        <td><strong>${Utils.escapeHtml(ex.name)}</strong>${ex.notes ? `<br><span style="color:var(--text-muted);font-size:0.75rem;">${Utils.escapeHtml(ex.notes)}</span>` : ''}</td>
                        <td>${ex.sets}</td>
                        <td>${ex.reps}</td>
                        <td>${ex.weight ? ex.weight + 'kg' : 'BW'}</td>
                        <td>${ex.rest}s</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              <button class="btn btn-primary btn-sm session-log" data-workout="${w.id}" data-session="${s.id}" style="margin-top:8px;">
                ${Icons.getSmall('check')} Log Workout
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function init() {
    const metrics = Storage.getAll(Storage.KEYS.METRICS);
    const last14 = metrics.slice(-14);

    // Weight chart
    Charts.habitTrend('weight-chart', {
      labels: last14.map(m => m.date.slice(5)),
      values: last14.map(m => m.weight),
    });

    // Sleep chart
    Charts.completionBar('sleep-chart', {
      labels: last14.map(m => m.date.slice(5)),
      values: last14.map(m => m.sleep),
      colors: 'var(--violet)',
    });

    // Metric modal
    document.getElementById('log-metric-btn')?.addEventListener('click', () => {
      document.getElementById('metric-modal').style.display = 'flex';
    });
    document.getElementById('metric-modal-close')?.addEventListener('click', () => {
      document.getElementById('metric-modal').style.display = 'none';
    });
    document.getElementById('metric-cancel')?.addEventListener('click', () => {
      document.getElementById('metric-modal').style.display = 'none';
    });
    document.getElementById('metric-energy')?.addEventListener('input', e => {
      document.getElementById('energy-display').textContent = e.target.value;
    });
    document.getElementById('metric-form')?.addEventListener('submit', saveMetric);

    // Workout modal
    document.getElementById('add-workout-btn')?.addEventListener('click', () => openWorkoutForm());
    document.getElementById('workout-modal-close')?.addEventListener('click', () => {
      document.getElementById('workout-modal').style.display = 'none';
    });
    document.getElementById('workout-cancel')?.addEventListener('click', () => {
      document.getElementById('workout-modal').style.display = 'none';
    });
    document.getElementById('add-session-btn')?.addEventListener('click', addSessionBlock);
    document.getElementById('workout-form')?.addEventListener('submit', saveWorkout);

    // Delegated
    document.getElementById('workout-plans')?.addEventListener('click', e => {
      const edit = e.target.closest('.workout-edit');
      const del = e.target.closest('.workout-delete');
      const log = e.target.closest('.session-log');
      if (edit) openWorkoutForm(edit.dataset.id);
      if (del) deleteWorkout(del.dataset.id);
      if (log) logWorkoutSession(log.dataset.workout, log.dataset.session);
    });
  }

  function saveMetric(e) {
    e.preventDefault();
    const metrics = Storage.getAll(Storage.KEYS.METRICS);
    const todayKey = Utils.toDateKey(new Date());
    const existing = metrics.findIndex(m => m.date === todayKey);

    const metric = {
      date: todayKey,
      weight: parseFloat(document.getElementById('metric-weight').value) || 0,
      sleep: parseFloat(document.getElementById('metric-sleep').value) || 0,
      energy: parseInt(document.getElementById('metric-energy').value) || 5,
      restingHR: parseInt(document.getElementById('metric-hr').value) || 0,
    };

    if (existing >= 0) metrics[existing] = metric;
    else metrics.push(metric);

    Storage.set(Storage.KEYS.METRICS, metrics);
    Storage.addXP(5, 'physical');
    document.getElementById('metric-modal').style.display = 'none';
    Utils.toast('Metrics logged! +5 XP', 'success');
    App.route();
  }

  function openWorkoutForm(editId) {
    const modal = document.getElementById('workout-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    const sessionsList = document.getElementById('workout-sessions-list');
    sessionsList.innerHTML = '';

    if (editId) {
      const workouts = Storage.getAll(Storage.KEYS.WORKOUTS);
      const w = workouts.find(x => x.id === editId);
      if (!w) return;
      document.getElementById('workout-modal-title').textContent = 'Edit Workout Plan';
      document.getElementById('workout-id').value = w.id;
      document.getElementById('workout-name').value = w.name;
      document.getElementById('workout-difficulty').value = w.difficulty;
      (w.sessions || []).forEach(s => addSessionBlock(null, s));
    } else {
      document.getElementById('workout-modal-title').textContent = 'New Workout Plan';
      document.getElementById('workout-form').reset();
      document.getElementById('workout-id').value = '';
    }
  }

  function addSessionBlock(e, existing) {
    const list = document.getElementById('workout-sessions-list');
    const block = document.createElement('div');
    block.className = 'card';
    block.style.cssText = 'margin-bottom:12px;padding:12px;background:var(--bg-elevated);';
    block.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <input type="text" class="form-input session-name" value="${existing ? Utils.escapeHtml(existing.name) : ''}" placeholder="Session name (e.g., Day A)" style="max-width:200px;">
        <button type="button" class="btn btn-ghost btn-icon btn-sm session-remove">${Icons.getSmall('close')}</button>
      </div>
      <div class="exercises-list">
        ${existing ? (existing.exercises || []).map(ex => exerciseRowHTML(ex)).join('') : ''}
      </div>
      <button type="button" class="btn btn-dashed btn-sm add-exercise-btn" style="margin-top:4px;">${Icons.getSmall('plus')} Exercise</button>
    `;
    block.querySelector('.session-remove').addEventListener('click', () => block.remove());
    block.querySelector('.add-exercise-btn').addEventListener('click', () => {
      const exList = block.querySelector('.exercises-list');
      exList.insertAdjacentHTML('beforeend', exerciseRowHTML());
      exList.lastElementChild.querySelector('.ex-remove').addEventListener('click', function() { this.closest('.exercise-row').remove(); });
    });
    block.querySelectorAll('.ex-remove').forEach(btn => {
      btn.addEventListener('click', function() { this.closest('.exercise-row').remove(); });
    });
    list.appendChild(block);
  }

  function exerciseRowHTML(ex) {
    return `
      <div class="exercise-row" style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr auto;gap:4px;margin-bottom:4px;align-items:center;">
        <input type="text" class="form-input ex-name" value="${ex ? Utils.escapeHtml(ex.name) : ''}" placeholder="Exercise" style="font-size:0.8125rem;">
        <input type="number" class="form-input ex-sets" value="${ex?.sets || 3}" placeholder="Sets" min="1" style="font-size:0.8125rem;">
        <input type="number" class="form-input ex-reps" value="${ex?.reps || 10}" placeholder="Reps" min="1" style="font-size:0.8125rem;">
        <input type="number" class="form-input ex-weight" value="${ex?.weight || 0}" placeholder="kg" min="0" style="font-size:0.8125rem;">
        <input type="number" class="form-input ex-rest" value="${ex?.rest || 60}" placeholder="Rest(s)" min="0" style="font-size:0.8125rem;">
        <button type="button" class="btn btn-ghost btn-icon btn-sm ex-remove">${Icons.getSmall('close')}</button>
      </div>
    `;
  }

  function saveWorkout(e) {
    e.preventDefault();
    const workouts = Storage.getAll(Storage.KEYS.WORKOUTS);
    const id = document.getElementById('workout-id').value || Storage.uid();
    const isEdit = workouts.some(w => w.id === id);

    const sessions = [];
    document.querySelectorAll('#workout-sessions-list .card').forEach(block => {
      const name = block.querySelector('.session-name').value.trim();
      const exercises = [];
      block.querySelectorAll('.exercise-row').forEach(row => {
        const exName = row.querySelector('.ex-name').value.trim();
        if (exName) {
          exercises.push({
            name: exName,
            sets: parseInt(row.querySelector('.ex-sets').value) || 3,
            reps: parseInt(row.querySelector('.ex-reps').value) || 10,
            weight: parseFloat(row.querySelector('.ex-weight').value) || 0,
            rest: parseInt(row.querySelector('.ex-rest').value) || 60,
            notes: '',
          });
        }
      });
      if (name) sessions.push({ id: Storage.uid(), name, exercises });
    });

    const workout = {
      id,
      name: document.getElementById('workout-name').value.trim(),
      difficulty: document.getElementById('workout-difficulty').value,
      sessions,
    };

    if (isEdit) {
      const idx = workouts.findIndex(w => w.id === id);
      workouts[idx] = workout;
    } else {
      workouts.push(workout);
    }

    Storage.set(Storage.KEYS.WORKOUTS, workouts);
    document.getElementById('workout-modal').style.display = 'none';
    Utils.toast(isEdit ? 'Plan updated' : 'Workout plan created!', 'success');
    App.route();
  }

  function deleteWorkout(id) {
    if (!confirm('Delete this workout plan?')) return;
    const workouts = Storage.getAll(Storage.KEYS.WORKOUTS).filter(w => w.id !== id);
    Storage.set(Storage.KEYS.WORKOUTS, workouts);
    Utils.toast('Workout plan deleted', 'info');
    App.route();
  }

  function logWorkoutSession(workoutId, sessionId) {
    Storage.addXP(25, 'physical');
    Utils.toast('Workout logged! +25 XP', 'success');
    Utils.showConfetti(1500);
  }

  return { render, init };
})();
