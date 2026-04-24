/* ═══════════════════════════════════════════════════════════
   PATH.JS — Life Planning / Goals Page
   ═══════════════════════════════════════════════════════════ */

const Path = (() => {

  function render() {
    const goals = Storage.getAll(Storage.KEYS.GOALS);
    const active = goals.filter(g => g.status === 'active');
    const completed = goals.filter(g => g.status === 'completed');

    return `
      <div class="path-page page-enter">
        <div class="path-layout">
          <!-- Goals List -->
          <div class="path-main">
            <div class="section-header">
              <div><h2>Life Goals</h2><p class="section-desc">Define SMART goals across 8 life domains — track milestones, set deadlines, and measure progress toward your vision.</p></div>
              <div style="display:flex;gap:8px;">
                <select class="form-select" id="path-filter" style="width:auto;">
                  <option value="all">All Domains</option>
                  ${Utils.DOMAINS.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                </select>
                <button class="btn btn-primary btn-sm" id="add-goal-btn">${Icons.getSmall('plus')} New Goal</button>
              </div>
            </div>

            <!-- Active Goals -->
            <div class="goals-grid" id="goals-grid">
              ${active.length ? active.map(renderGoalCard).join('') : `
                <div class="empty-state">
                  <div style="color:var(--text-muted);margin-bottom:12px;">${Icons.get('path', 48)}</div>
                  <h4>No goals yet</h4>
                  <p>Chart your path. Define what matters most to you.</p>
                  <button class="btn btn-primary btn-sm" id="add-goal-empty">${Icons.getSmall('plus')} Create Your First Goal</button>
                </div>
              `}
            </div>

            ${completed.length ? `
              <div class="section-header" style="margin-top:32px;">
                <h2>Completed</h2>
              </div>
              <div class="goals-grid">${completed.map(renderGoalCard).join('')}</div>
            ` : ''}
          </div>

          <!-- Sidebar Panel -->
          <div class="path-panel" id="path-panel">
            <div class="card">
              <div class="card-header"><h3>Goal Progress</h3></div>
              <div class="card-body" style="height:250px;">
                <canvas id="goal-progress-chart"></canvas>
              </div>
            </div>
            <div class="card" style="margin-top:16px;">
              <div class="card-header"><h3>Domain Focus</h3></div>
              <div class="card-body" style="height:220px;">
                <canvas id="goal-domain-chart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Goal Form Modal -->
        <div class="modal-overlay" id="goal-modal" style="display:none;">
          <div class="modal" style="max-width:560px;">
            <div class="modal-header">
              <h3 id="goal-modal-title">New Goal</h3>
              <button class="btn btn-ghost btn-icon" id="goal-modal-close">${Icons.get('close', 20)}</button>
            </div>
            <div class="modal-body">
              <form id="goal-form">
                <input type="hidden" id="goal-id">
                <div class="form-group">
                  <label class="form-label">Goal Title</label>
                  <input type="text" id="goal-title" class="form-input" placeholder="What do you want to achieve?" required maxlength="100">
                </div>
                <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <div class="form-group">
                    <label class="form-label">Domain</label>
                    <select id="goal-domain" class="form-select" required>
                      ${Utils.DOMAINS.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Priority (1-5)</label>
                    <input type="number" id="goal-priority" class="form-input" min="1" max="5" value="3">
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Description</label>
                  <textarea id="goal-desc" class="form-textarea" rows="3" placeholder="Why is this important? What does success look like?"></textarea>
                </div>
                <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <div class="form-group">
                    <label class="form-label">Target Date</label>
                    <input type="date" id="goal-date" class="form-input">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Success Criteria</label>
                    <input type="text" id="goal-criteria" class="form-input" placeholder="How will you know?">
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Obstacles</label>
                  <input type="text" id="goal-obstacles" class="form-input" placeholder="What might get in the way?">
                </div>
                <div class="form-group">
                  <label class="form-label">Milestones</label>
                  <div id="milestones-list"></div>
                  <button type="button" class="btn btn-dashed btn-sm" id="add-milestone">${Icons.getSmall('plus')} Add Milestone</button>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" id="goal-cancel">Cancel</button>
                  <button type="submit" class="btn btn-primary">Save Goal</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderGoalCard(g) {
    const daysLeft = g.targetDate ? Utils.daysUntil(new Date(g.targetDate)) : null;
    const milestonesDone = g.milestones ? g.milestones.filter(m => m.done).length : 0;
    const milestonesTotal = g.milestones ? g.milestones.length : 0;
    return `
      <div class="card goal-card" data-id="${g.id}" style="border-left:3px solid ${Utils.getDomainColor(g.domain)};">
        <div class="card-body">
          <div style="display:flex;justify-content:space-between;align-items:start;">
            <div>
              <span class="badge" style="background:${Utils.getDomainColor(g.domain)}20;color:${Utils.getDomainColor(g.domain)};font-size:0.7rem;">${Utils.getDomainName(g.domain)}</span>
              ${g.status === 'completed' ? '<span class="badge badge-emerald" style="font-size:0.7rem;margin-left:4px;">Completed</span>' : ''}
            </div>
            <div style="display:flex;gap:4px;">
              <button class="btn btn-ghost btn-icon btn-sm goal-edit" data-id="${g.id}" title="Edit">${Icons.getSmall('journal')}</button>
              <button class="btn btn-ghost btn-icon btn-sm goal-delete" data-id="${g.id}" title="Delete">${Icons.getSmall('close')}</button>
            </div>
          </div>
          <h3 style="margin:10px 0 6px;">${Utils.escapeHtml(g.title)}</h3>
          <p style="color:var(--text-secondary);font-size:0.8125rem;margin-bottom:12px;">${Utils.escapeHtml(g.description || '').substring(0, 120)}</p>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${g.progress}%;background:${Utils.getDomainColor(g.domain)}"></div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:0.75rem;color:var(--text-muted);">
            <span>${g.progress}% complete</span>
            ${daysLeft !== null ? `<span>${daysLeft > 0 ? daysLeft + ' days left' : 'Overdue'}</span>` : ''}
          </div>
          ${milestonesTotal > 0 ? `
            <div style="margin-top:12px;">
              <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:6px;">${milestonesDone}/${milestonesTotal} milestones</div>
              ${g.milestones.map(m => `
                <div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:0.8125rem;">
                  <input type="checkbox" class="milestone-check" data-goal="${g.id}" data-ms="${m.id}" ${m.done ? 'checked' : ''}>
                  <span style="${m.done ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">${Utils.escapeHtml(m.text)}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  function init() {
    const goals = Storage.getAll(Storage.KEYS.GOALS);

    // Charts
    const active = goals.filter(g => g.status === 'active');
    if (active.length) {
      Charts.goalProgress('goal-progress-chart', active.map(g => ({
        name: g.title.substring(0, 20),
        data: [{ label: 'Start', value: 0 }, { label: 'Now', value: g.progress }, { label: 'Target', value: 100 }],
      })));
    }

    const domainCounts = {};
    goals.forEach(g => { domainCounts[g.domain] = (domainCounts[g.domain] || 0) + 1; });
    Charts.completionBar('goal-domain-chart', {
      labels: Object.keys(domainCounts).map(Utils.getDomainName),
      values: Object.values(domainCounts),
      colors: Object.keys(domainCounts).map(Utils.getDomainColor),
    });

    // Event bindings
    document.getElementById('add-goal-btn')?.addEventListener('click', () => openGoalForm());
    document.getElementById('add-goal-empty')?.addEventListener('click', () => openGoalForm());
    document.getElementById('goal-modal-close')?.addEventListener('click', closeGoalForm);
    document.getElementById('goal-cancel')?.addEventListener('click', closeGoalForm);
    document.getElementById('goal-form')?.addEventListener('submit', saveGoal);
    document.getElementById('add-milestone')?.addEventListener('click', addMilestoneRow);

    // Filter
    document.getElementById('path-filter')?.addEventListener('change', e => {
      const val = e.target.value;
      document.querySelectorAll('.goal-card').forEach(card => {
        const gId = card.dataset.id;
        const g = goals.find(x => x.id === gId);
        card.style.display = (val === 'all' || g?.domain === val) ? '' : 'none';
      });
    });

    // Delegated click handlers
    document.getElementById('goals-grid')?.addEventListener('click', e => {
      const editBtn = e.target.closest('.goal-edit');
      const deleteBtn = e.target.closest('.goal-delete');
      if (editBtn) openGoalForm(editBtn.dataset.id);
      if (deleteBtn) deleteGoal(deleteBtn.dataset.id);
    });

    // Milestone toggles
    document.querySelectorAll('.milestone-check').forEach(cb => {
      cb.addEventListener('change', e => {
        const goalId = e.target.dataset.goal;
        const msId = e.target.dataset.ms;
        const allGoals = Storage.getAll(Storage.KEYS.GOALS);
        const goal = allGoals.find(g => g.id === goalId);
        if (goal && goal.milestones) {
          const ms = goal.milestones.find(m => m.id === msId);
          if (ms) ms.done = e.target.checked;
          const done = goal.milestones.filter(m => m.done).length;
          goal.progress = Math.round((done / goal.milestones.length) * 100);
          Storage.set(Storage.KEYS.GOALS, allGoals);
        }
      });
    });
  }

  function openGoalForm(editId) {
    const modal = document.getElementById('goal-modal');
    if (!modal) return;
    modal.style.display = 'flex';

    const title = document.getElementById('goal-modal-title');
    const form = document.getElementById('goal-form');
    const msList = document.getElementById('milestones-list');

    if (editId) {
      const goals = Storage.getAll(Storage.KEYS.GOALS);
      const g = goals.find(x => x.id === editId);
      if (!g) return;
      title.textContent = 'Edit Goal';
      document.getElementById('goal-id').value = g.id;
      document.getElementById('goal-title').value = g.title;
      document.getElementById('goal-domain').value = g.domain;
      document.getElementById('goal-priority').value = g.priority || 3;
      document.getElementById('goal-desc').value = g.description || '';
      document.getElementById('goal-date').value = g.targetDate || '';
      document.getElementById('goal-criteria').value = g.successCriteria || '';
      document.getElementById('goal-obstacles').value = g.obstacles || '';
      msList.innerHTML = '';
      (g.milestones || []).forEach(m => addMilestoneRow(null, m));
    } else {
      title.textContent = 'New Goal';
      form.reset();
      document.getElementById('goal-id').value = '';
      msList.innerHTML = '';
    }
  }

  function closeGoalForm() {
    const modal = document.getElementById('goal-modal');
    if (modal) modal.style.display = 'none';
  }

  function addMilestoneRow(e, existing) {
    const list = document.getElementById('milestones-list');
    if (!list) return;
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;margin-bottom:6px;align-items:center;';
    const val = existing ? existing.text : '';
    row.innerHTML = `
      <input type="text" class="form-input ms-input" value="${Utils.escapeHtml(val)}" placeholder="Milestone description" style="flex:1;">
      <button type="button" class="btn btn-ghost btn-icon btn-sm ms-remove">${Icons.getSmall('close')}</button>
    `;
    row.querySelector('.ms-remove').addEventListener('click', () => row.remove());
    list.appendChild(row);
  }

  function saveGoal(e) {
    e.preventDefault();
    const goals = Storage.getAll(Storage.KEYS.GOALS);
    const id = document.getElementById('goal-id').value || Storage.uid();
    const isEdit = goals.some(g => g.id === id);

    const milestones = [];
    document.querySelectorAll('#milestones-list .ms-input').forEach(input => {
      const t = input.value.trim();
      if (t) milestones.push({ id: Storage.uid(), text: t, done: false });
    });

    const goal = {
      id,
      title: document.getElementById('goal-title').value.trim(),
      domain: document.getElementById('goal-domain').value,
      priority: parseInt(document.getElementById('goal-priority').value) || 3,
      description: document.getElementById('goal-desc').value.trim(),
      targetDate: document.getElementById('goal-date').value,
      successCriteria: document.getElementById('goal-criteria').value.trim(),
      obstacles: document.getElementById('goal-obstacles').value.trim(),
      milestones,
      progress: 0,
      status: 'active',
    };

    if (isEdit) {
      const existing = goals.find(g => g.id === id);
      goal.progress = existing?.progress || 0;
      goal.status = existing?.status || 'active';
      // Preserve milestone done states
      milestones.forEach(m => {
        const old = (existing?.milestones || []).find(om => om.text === m.text);
        if (old) m.done = old.done;
      });
      const done = milestones.filter(m => m.done).length;
      if (milestones.length) goal.progress = Math.round((done / milestones.length) * 100);
      const idx = goals.findIndex(g => g.id === id);
      goals[idx] = goal;
    } else {
      goals.push(goal);
    }

    Storage.set(Storage.KEYS.GOALS, goals);
    closeGoalForm();
    Utils.toast(isEdit ? 'Goal updated' : 'Goal created!', 'success');
    App.route();
  }

  function deleteGoal(id) {
    if (!confirm('Delete this goal? This cannot be undone.')) return;
    const goals = Storage.getAll(Storage.KEYS.GOALS).filter(g => g.id !== id);
    Storage.set(Storage.KEYS.GOALS, goals);
    Utils.toast('Goal deleted', 'info');
    App.route();
  }

  return { render, init };
})();
