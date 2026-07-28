/* ═══════════════════════════════════════════════════════════
   TASKS.JS — Task Manager with Kanban Board + Focus Mode
   ═══════════════════════════════════════════════════════════ */

const Tasks = (() => {
  let focusTimer = null;
  let focusSeconds = 0;
  let focusTarget = 25 * 60;

  const STATUSES = ['backlog', 'in-progress', 'review', 'done'];
  const STATUS_LABELS = { backlog: 'Backlog', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };
  const PRIORITIES = ['critical', 'high', 'medium', 'low'];

  function render() {
    const tasks = Storage.getAll(Storage.KEYS.TASKS);
    const goals = Storage.getAll(Storage.KEYS.GOALS);

    return `
      <div class="tasks-page page-enter">
        <div class="section-header">
          <div><h2>Task Board</h2><p class="section-desc">Kanban-style workflow with priorities, subtasks, time tracking, and a built-in Pomodoro focus timer.</p></div>
          <div style="display:flex;gap:8px;align-items:center;">
            <select class="form-select" id="task-filter-domain" style="width:auto;">
              <option value="all">All Domains</option>
              ${Utils.DOMAINS.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
            </select>
            <button class="btn btn-primary btn-sm" id="add-task-btn">${Icons.getSmall('plus')} New Task</button>
          </div>
        </div>

        <!-- Kanban Board -->
        <div class="kanban-board" id="kanban-board">
          ${STATUSES.map(status => `
            <div class="kanban-column" data-status="${status}">
              <div class="kanban-column-header">
                <span class="kanban-column-title">${STATUS_LABELS[status]}</span>
                <span class="kanban-column-count">${tasks.filter(t => t.status === status).length}</span>
              </div>
              <div class="kanban-cards" data-status="${status}" id="kanban-${status}">
                ${tasks.filter(t => t.status === status).map(renderTaskCard).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Task Form Modal -->
        <div class="modal-overlay" id="task-modal" style="display:none;">
          <div class="modal" style="max-width:520px;">
            <div class="modal-header">
              <h3 id="task-modal-title">New Task</h3>
              <button class="btn btn-ghost btn-icon" id="task-modal-close">${Icons.get('close', 20)}</button>
            </div>
            <div class="modal-body">
              <form id="task-form">
                <input type="hidden" id="task-id">
                <div class="form-group">
                  <label class="form-label">Title</label>
                  <input type="text" id="task-title" class="form-input" required maxlength="120" placeholder="What needs to be done?">
                </div>
                <div class="form-group">
                  <label class="form-label">Description</label>
                  <textarea id="task-desc" class="form-textarea" rows="2" placeholder="Details..."></textarea>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <div class="form-group">
                    <label class="form-label">Priority</label>
                    <select id="task-priority" class="form-select">
                      ${PRIORITIES.map(p => `<option value="${p}">${Utils.capitalize(p)}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Domain</label>
                    <select id="task-domain" class="form-select">
                      ${Utils.DOMAINS.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                    </select>
                  </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <div class="form-group">
                    <label class="form-label">Due Date</label>
                    <input type="date" id="task-due" class="form-input">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Goal</label>
                    <select id="task-goal" class="form-select">
                      <option value="">No linked goal</option>
                      ${goals.map(g => `<option value="${g.id}">${Utils.escapeHtml(g.title)}</option>`).join('')}
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Subtasks</label>
                  <div id="subtasks-list"></div>
                  <button type="button" class="btn btn-dashed btn-sm" id="add-subtask">${Icons.getSmall('plus')} Add Subtask</button>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" id="task-cancel">Cancel</button>
                  <button type="submit" class="btn btn-primary">Save Task</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Focus Mode Overlay -->
        <div class="focus-overlay" id="focus-overlay" style="display:none;">
          <div class="focus-card">
            <button class="btn btn-ghost btn-icon" style="position:absolute;top:12px;right:12px;" id="focus-close">${Icons.get('close', 20)}</button>
            <h2 style="font-family:var(--font-serif);margin-bottom:8px;" id="focus-task-title">Task Title</h2>
            <p style="color:var(--text-secondary);margin-bottom:24px;">Deep work session</p>
            <div class="focus-timer" id="focus-timer-display">25:00</div>
            <div class="focus-controls">
              <button class="btn btn-secondary" id="focus-reset">Reset</button>
              <button class="btn btn-primary btn-lg" id="focus-toggle">Start</button>
              <button class="btn btn-secondary" id="focus-done">Done</button>
            </div>
            <div style="margin-top:16px;display:flex;gap:8px;justify-content:center;">
              <button class="btn btn-ghost btn-sm focus-preset" data-minutes="15">15m</button>
              <button class="btn btn-ghost btn-sm focus-preset active" data-minutes="25">25m</button>
              <button class="btn btn-ghost btn-sm focus-preset" data-minutes="45">45m</button>
              <button class="btn btn-ghost btn-sm focus-preset" data-minutes="60">60m</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderTaskCard(t) {
    const doneSubtasks = t.subtasks ? t.subtasks.filter(s => s.done).length : 0;
    const totalSubtasks = t.subtasks ? t.subtasks.length : 0;
    return `
      <div class="kanban-card" draggable="true" data-id="${t.id}" data-status="${t.status}">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px;">
          <span class="priority-badge priority-${t.priority}">${Utils.capitalize(t.priority)}</span>
          <div style="display:flex;gap:2px;">
            <button class="btn btn-ghost btn-icon btn-sm task-focus" data-id="${t.id}" title="Focus mode">${Icons.getSmall('discipline')}</button>
            <button class="btn btn-ghost btn-icon btn-sm task-edit" data-id="${t.id}" title="Edit">${Icons.getSmall('journal')}</button>
            <button class="btn btn-ghost btn-icon btn-sm task-delete" data-id="${t.id}" title="Delete">${Icons.getSmall('close')}</button>
          </div>
        </div>
        <h4 style="font-size:0.875rem;margin-bottom:4px;">${Utils.escapeHtml(t.title)}</h4>
        ${t.description ? `<p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:8px;">${Utils.escapeHtml(t.description).substring(0, 60)}</p>` : ''}
        <div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center;font-size:0.7rem;color:var(--text-muted);">
          <span class="badge" style="background:${Utils.getDomainColor(t.domain)}20;color:${Utils.getDomainColor(t.domain)};font-size:0.65rem;">${Utils.getDomainName(t.domain)}</span>
          ${t.dueDate ? `<span>${t.dueDate}</span>` : ''}
          ${totalSubtasks ? `<span>${doneSubtasks}/${totalSubtasks} subtasks</span>` : ''}
        </div>
      </div>
    `;
  }

  function init() {
    // Add task
    document.getElementById('add-task-btn')?.addEventListener('click', () => openTaskForm());
    document.getElementById('task-modal-close')?.addEventListener('click', closeTaskForm);
    document.getElementById('task-cancel')?.addEventListener('click', closeTaskForm);
    document.getElementById('task-form')?.addEventListener('submit', saveTask);
    document.getElementById('add-subtask')?.addEventListener('click', addSubtaskRow);

    // Filter
    document.getElementById('task-filter-domain')?.addEventListener('change', e => {
      const val = e.target.value;
      document.querySelectorAll('.kanban-card').forEach(card => {
        const tasks = Storage.getAll(Storage.KEYS.TASKS);
        const t = tasks.find(x => x.id === card.dataset.id);
        card.style.display = (val === 'all' || t?.domain === val) ? '' : 'none';
      });
      updateColumnCounts();
    });

    // Drag and drop
    initDragDrop();

    // Delegated card actions
    document.getElementById('kanban-board')?.addEventListener('click', e => {
      const edit = e.target.closest('.task-edit');
      const del = e.target.closest('.task-delete');
      const focus = e.target.closest('.task-focus');
      if (edit) openTaskForm(edit.dataset.id);
      if (del) deleteTask(del.dataset.id);
      if (focus) openFocusMode(focus.dataset.id);
    });

    // Focus mode
    document.getElementById('focus-close')?.addEventListener('click', closeFocusMode);
    document.getElementById('focus-toggle')?.addEventListener('click', toggleFocusTimer);
    document.getElementById('focus-reset')?.addEventListener('click', resetFocusTimer);
    document.getElementById('focus-done')?.addEventListener('click', completeFocusSession);
    document.querySelectorAll('.focus-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.focus-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        focusTarget = parseInt(btn.dataset.minutes) * 60;
        resetFocusTimer();
      });
    });

    return () => { if (focusTimer) clearInterval(focusTimer); };
  }

  function initDragDrop() {
    document.querySelectorAll('.kanban-card').forEach(card => {
      card.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', card.dataset.id);
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', () => card.classList.remove('dragging'));
    });

    document.querySelectorAll('.kanban-cards').forEach(col => {
      col.addEventListener('dragover', e => {
        e.preventDefault();
        col.classList.add('drag-over');
      });
      col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
      col.addEventListener('drop', e => {
        e.preventDefault();
        col.classList.remove('drag-over');
        const taskId = e.dataTransfer.getData('text/plain');
        const newStatus = col.dataset.status;
        moveTask(taskId, newStatus);
      });
    });
  }

  function moveTask(id, newStatus) {
    const tasks = Storage.getAll(Storage.KEYS.TASKS);
    const task = tasks.find(t => t.id === id);
    if (!task || task.status === newStatus) return;
    task.status = newStatus;
    Storage.set(Storage.KEYS.TASKS, tasks);

    if (newStatus === 'done') {
      Storage.addXP(20, task.domain);
      Utils.toast('Task completed! +20 XP', 'success');
    }
    App.route();
  }

  function openTaskForm(editId) {
    const modal = document.getElementById('task-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    const sub = document.getElementById('subtasks-list');

    if (editId) {
      const tasks = Storage.getAll(Storage.KEYS.TASKS);
      const t = tasks.find(x => x.id === editId);
      if (!t) return;
      document.getElementById('task-modal-title').textContent = 'Edit Task';
      document.getElementById('task-id').value = t.id;
      document.getElementById('task-title').value = t.title;
      document.getElementById('task-desc').value = t.description || '';
      document.getElementById('task-priority').value = t.priority;
      document.getElementById('task-domain').value = t.domain;
      document.getElementById('task-due').value = t.dueDate || '';
      document.getElementById('task-goal').value = t.goalId || '';
      sub.innerHTML = '';
      (t.subtasks || []).forEach(s => addSubtaskRow(null, s));
    } else {
      document.getElementById('task-modal-title').textContent = 'New Task';
      document.getElementById('task-form').reset();
      document.getElementById('task-id').value = '';
      sub.innerHTML = '';
    }
  }

  function closeTaskForm() {
    const modal = document.getElementById('task-modal');
    if (modal) modal.style.display = 'none';
  }

  function addSubtaskRow(e, existing) {
    const list = document.getElementById('subtasks-list');
    if (!list) return;
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;margin-bottom:6px;align-items:center;';
    row.innerHTML = `
      <input type="text" class="form-input st-input" value="${existing ? Utils.escapeHtml(existing.text) : ''}" placeholder="Subtask..." style="flex:1;">
      <button type="button" class="btn btn-ghost btn-icon btn-sm st-remove">${Icons.getSmall('close')}</button>
    `;
    row.querySelector('.st-remove').addEventListener('click', () => row.remove());
    list.appendChild(row);
  }

  function saveTask(e) {
    e.preventDefault();
    const tasks = Storage.getAll(Storage.KEYS.TASKS);
    const id = document.getElementById('task-id').value || Storage.uid();
    const isEdit = tasks.some(t => t.id === id);

    const subtasks = [];
    document.querySelectorAll('#subtasks-list .st-input').forEach(input => {
      const t = input.value.trim();
      if (t) subtasks.push({ id: Storage.uid(), text: t, done: false });
    });

    const task = {
      id,
      title: document.getElementById('task-title').value.trim(),
      description: document.getElementById('task-desc').value.trim(),
      priority: document.getElementById('task-priority').value,
      domain: document.getElementById('task-domain').value,
      dueDate: document.getElementById('task-due').value,
      goalId: document.getElementById('task-goal').value || null,
      subtasks,
      status: isEdit ? (tasks.find(t => t.id === id)?.status || 'backlog') : 'backlog',
      timeEstimate: 0,
      timeLogged: 0,
    };

    if (isEdit) {
      const idx = tasks.findIndex(t => t.id === id);
      task.status = tasks[idx].status;
      task.timeLogged = tasks[idx].timeLogged || 0;
      tasks[idx] = task;
    } else {
      tasks.push(task);
    }

    Storage.set(Storage.KEYS.TASKS, tasks);
    closeTaskForm();
    Utils.toast(isEdit ? 'Task updated' : 'Task created!', 'success');
    App.route();
  }

  function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    const tasks = Storage.getAll(Storage.KEYS.TASKS).filter(t => t.id !== id);
    Storage.set(Storage.KEYS.TASKS, tasks);
    Utils.toast('Task deleted', 'info');
    App.route();
  }

  function updateColumnCounts() {
    STATUSES.forEach(s => {
      const col = document.querySelector(`.kanban-column[data-status="${s}"]`);
      if (col) {
        const visible = col.querySelectorAll('.kanban-card:not([style*="display: none"])').length;
        const count = col.querySelector('.kanban-column-count');
        if (count) count.textContent = visible;
      }
    });
  }

  // Focus mode
  function openFocusMode(taskId) {
    const tasks = Storage.getAll(Storage.KEYS.TASKS);
    const t = tasks.find(x => x.id === taskId);
    if (!t) return;

    const overlay = document.getElementById('focus-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    overlay.dataset.taskId = taskId;
    document.getElementById('focus-task-title').textContent = t.title;
    focusSeconds = 0;
    updateTimerDisplay();
  }

  function closeFocusMode() {
    if (focusTimer) clearInterval(focusTimer);
    focusTimer = null;
    const overlay = document.getElementById('focus-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  function toggleFocusTimer() {
    const btn = document.getElementById('focus-toggle');
    if (focusTimer) {
      clearInterval(focusTimer);
      focusTimer = null;
      if (btn) btn.textContent = 'Resume';
    } else {
      focusTimer = setInterval(() => {
        focusSeconds++;
        updateTimerDisplay();
        if (focusSeconds >= focusTarget) {
          clearInterval(focusTimer);
          focusTimer = null;
          Utils.toast('Focus session complete!', 'success');
          Utils.showConfetti(2000);
          if (btn) btn.textContent = 'Start';
        }
      }, 1000);
      if (btn) btn.textContent = 'Pause';
    }
  }

  function resetFocusTimer() {
    if (focusTimer) clearInterval(focusTimer);
    focusTimer = null;
    focusSeconds = 0;
    updateTimerDisplay();
    const btn = document.getElementById('focus-toggle');
    if (btn) btn.textContent = 'Start';
  }

  function updateTimerDisplay() {
    const remaining = focusTarget - focusSeconds;
    const mins = Math.floor(Math.max(0, remaining) / 60);
    const secs = Math.max(0, remaining) % 60;
    const el = document.getElementById('focus-timer-display');
    if (el) el.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function completeFocusSession() {
    const overlay = document.getElementById('focus-overlay');
    const taskId = overlay?.dataset.taskId;
    if (taskId) {
      const tasks = Storage.getAll(Storage.KEYS.TASKS);
      const t = tasks.find(x => x.id === taskId);
      if (t) {
        t.timeLogged = (t.timeLogged || 0) + focusSeconds / 3600;
        Storage.set(Storage.KEYS.TASKS, tasks);
      }
      Storage.addXP(10, t?.domain);
    }
    Utils.toast('Session logged! +10 XP', 'success');
    closeFocusMode();
  }

  return { render, init };
})();
