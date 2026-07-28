/* ═══════════════════════════════════════════════════════════
   ADMIN.JS — Admin Panel
   ═══════════════════════════════════════════════════════════ */

const Admin = (() => {

  function render() {
    if (!Storage.isAdmin()) {
      return `<div class="empty-state"><h4>Access Denied</h4><p>You need admin privileges to view this page.</p></div>`;
    }

    const users = Storage.getAll(Storage.KEYS.USERS_DB);
    const habits = Storage.getAll(Storage.KEYS.HABITS);
    const goals = Storage.getAll(Storage.KEYS.GOALS);
    const tasks = Storage.getAll(Storage.KEYS.TASKS);
    const journal = Storage.getAll(Storage.KEYS.JOURNAL);
    const content = Storage.getAll(Storage.KEYS.CONTENT_DB);

    const totalXP = (Storage.getProgress()?.xp || 0);
    const entries = journal.length;

    return `
      <div class="admin-page page-enter">
        <div class="section-header">
          <h2>Admin Dashboard</h2>
          <span class="badge badge-gold">Admin</span>
        </div>

        <!-- KPI Grid -->
        <div class="stat-row" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:24px;">
          <div class="stat-card">
            <div class="stat-value" style="color:var(--cyan);">${users.length + 2}</div>
            <div class="stat-label">Total Users</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color:var(--emerald);">${habits.length}</div>
            <div class="stat-label">Active Habits</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color:var(--violet);">${goals.length}</div>
            <div class="stat-label">Goals Created</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color:var(--gold);">${tasks.length}</div>
            <div class="stat-label">Total Tasks</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${entries}</div>
            <div class="stat-label">Journal Entries</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${content.length}</div>
            <div class="stat-label">Content Items</div>
          </div>
        </div>

        <!-- Charts -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
          <div class="card">
            <div class="card-header"><h3>Daily Active Usage</h3></div>
            <div class="card-body" style="height:250px;"><canvas id="admin-dau"></canvas></div>
          </div>
          <div class="card">
            <div class="card-header"><h3>XP Distribution</h3></div>
            <div class="card-body" style="height:250px;"><canvas id="admin-xp"></canvas></div>
          </div>
        </div>

        <!-- Users Table -->
        <div class="card" style="margin-bottom:24px;">
          <div class="card-header">
            <h3>Registered Users</h3>
          </div>
          <div class="card-body">
            <div class="data-table">
              <table>
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Plan</th><th>Joined</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Alex Morgan</td>
                    <td>user@sophia.app</td>
                    <td><span class="badge badge-cyan">user</span></td>
                    <td><span class="badge badge-gold">premium</span></td>
                    <td>Demo Account</td>
                  </tr>
                  <tr>
                    <td>Sophia Admin</td>
                    <td>admin@sophia.app</td>
                    <td><span class="badge badge-rose">admin</span></td>
                    <td><span class="badge badge-gold">lifetime</span></td>
                    <td>Demo Account</td>
                  </tr>
                  ${users.map(u => `
                    <tr>
                      <td>${Utils.escapeHtml(u.name)}</td>
                      <td>${Utils.escapeHtml(u.email)}</td>
                      <td><span class="badge">${u.role}</span></td>
                      <td><span class="badge">${u.plan}</span></td>
                      <td>${u.joinDate ? Utils.formatDate(new Date(u.joinDate), 'short') : '—'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Content Management -->
        <div class="card" style="margin-bottom:24px;">
          <div class="card-header">
            <h3>Content Library</h3>
            <button class="btn btn-primary btn-sm" id="add-content-btn">${Icons.getSmall('plus')} Add Content</button>
          </div>
          <div class="card-body">
            <div class="data-table" style="max-height:400px;overflow-y:auto;">
              <table>
                <thead>
                  <tr><th>Title</th><th>Tradition</th><th>Format</th><th>Duration</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  ${content.map(c => `
                    <tr>
                      <td>${Utils.escapeHtml(c.title)}</td>
                      <td><span class="badge badge-cyan" style="font-size:0.65rem;">${Utils.escapeHtml(c.tradition)}</span></td>
                      <td>${c.format}</td>
                      <td>${c.duration}min</td>
                      <td>
                        <button class="btn btn-ghost btn-sm content-edit-admin" data-id="${c.id}">Edit</button>
                        <button class="btn btn-ghost btn-sm content-delete-admin" data-id="${c.id}">Delete</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Activity Feed -->
        <div class="card">
          <div class="card-header"><h3>Recent Activity</h3></div>
          <div class="card-body">
            ${renderActivityFeed(habits, tasks, journal)}
          </div>
        </div>

        <!-- Content Form Modal -->
        <div class="modal-overlay" id="content-modal" style="display:none;">
          <div class="modal" style="max-width:560px;">
            <div class="modal-header">
              <h3 id="content-modal-title">Add Content</h3>
              <button class="btn btn-ghost btn-icon" id="content-modal-close">${Icons.get('close', 20)}</button>
            </div>
            <div class="modal-body">
              <form id="content-form">
                <input type="hidden" id="content-id">
                <div class="form-group">
                  <label class="form-label">Title</label>
                  <input type="text" id="content-title" class="form-input" required maxlength="150">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
                  <div class="form-group">
                    <label class="form-label">Tradition</label>
                    <input type="text" id="content-tradition" class="form-input" placeholder="Stoicism">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Format</label>
                    <select id="content-format" class="form-select">
                      <option value="article">Article</option>
                      <option value="exercise">Exercise</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Duration (min)</label>
                    <input type="number" id="content-duration" class="form-input" min="1" value="10">
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Body</label>
                  <textarea id="content-body" class="form-textarea" rows="4"></textarea>
                </div>
                <div class="form-group">
                  <label class="form-label">Source</label>
                  <input type="text" id="content-source" class="form-input">
                </div>
                <div class="form-group">
                  <label class="form-label">Reflection Prompt</label>
                  <input type="text" id="content-reflection" class="form-input">
                </div>
                <div class="form-group">
                  <label class="form-label">Apply Today</label>
                  <input type="text" id="content-apply" class="form-input">
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" id="content-cancel">Cancel</button>
                  <button type="submit" class="btn btn-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderActivityFeed(habits, tasks, journal) {
    const items = [];
    const todayKey = Utils.toDateKey(new Date());
    habits.forEach(h => {
      if (h.logs?.some(l => l.date === todayKey)) {
        items.push({ text: `Habit "${h.name}" logged`, time: 'Today', icon: 'discipline' });
      }
    });
    tasks.filter(t => t.status === 'done').slice(-3).forEach(t => {
      items.push({ text: `Task "${t.title}" completed`, time: 'Recent', icon: 'tasks' });
    });
    journal.slice(-3).forEach(j => {
      items.push({ text: `Journal entry on ${j.date}`, time: j.date, icon: 'journal' });
    });

    if (!items.length) return '<p style="color:var(--text-muted);">No recent activity</p>';

    return items.map(i => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">
        <span style="color:var(--gold);">${Icons.getSmall(i.icon)}</span>
        <span style="flex:1;font-size:0.8125rem;">${Utils.escapeHtml(i.text)}</span>
        <span style="font-size:0.75rem;color:var(--text-muted);">${i.time}</span>
      </div>
    `).join('');
  }

  function init() {
    if (!Storage.isAdmin()) return;

    const progress = Storage.getProgress();
    const weekly = progress?.weeklyData || [];
    const scores = progress?.domainScores || {};

    // DAU chart
    Charts.dauLine('admin-dau', {
      labels: weekly.slice(-14).map(d => d.date.slice(5)),
      values: weekly.slice(-14).map(() => Math.floor(Math.random() * 50) + 10),
    });

    // XP distribution
    Charts.domainDoughnut('admin-xp', scores);

    // Content management
    document.getElementById('add-content-btn')?.addEventListener('click', () => openContentForm());
    document.getElementById('content-modal-close')?.addEventListener('click', closeContentForm);
    document.getElementById('content-cancel')?.addEventListener('click', closeContentForm);
    document.getElementById('content-form')?.addEventListener('submit', saveContent);

    // Delegated
    document.querySelector('.admin-page')?.addEventListener('click', e => {
      const edit = e.target.closest('.content-edit-admin');
      const del = e.target.closest('.content-delete-admin');
      if (edit) openContentForm(edit.dataset.id);
      if (del) deleteContent(del.dataset.id);
    });
  }

  function openContentForm(editId) {
    const modal = document.getElementById('content-modal');
    if (!modal) return;
    modal.style.display = 'flex';

    if (editId) {
      const content = Storage.getAll(Storage.KEYS.CONTENT_DB);
      const c = content.find(x => x.id === editId);
      if (!c) return;
      document.getElementById('content-modal-title').textContent = 'Edit Content';
      document.getElementById('content-id').value = c.id;
      document.getElementById('content-title').value = c.title;
      document.getElementById('content-tradition').value = c.tradition || '';
      document.getElementById('content-format').value = c.format || 'article';
      document.getElementById('content-duration').value = c.duration || 10;
      document.getElementById('content-body').value = c.body || '';
      document.getElementById('content-source').value = c.source || '';
      document.getElementById('content-reflection').value = c.reflection || '';
      document.getElementById('content-apply').value = c.applyToday || '';
    } else {
      document.getElementById('content-modal-title').textContent = 'Add Content';
      document.getElementById('content-form').reset();
      document.getElementById('content-id').value = '';
    }
  }

  function closeContentForm() {
    document.getElementById('content-modal').style.display = 'none';
  }

  function saveContent(e) {
    e.preventDefault();
    const content = Storage.getAll(Storage.KEYS.CONTENT_DB);
    const id = document.getElementById('content-id').value || Storage.uid();
    const isEdit = content.some(c => c.id === id);

    const item = {
      id,
      title: document.getElementById('content-title').value.trim(),
      tradition: document.getElementById('content-tradition').value.trim(),
      format: document.getElementById('content-format').value,
      duration: parseInt(document.getElementById('content-duration').value) || 10,
      difficulty: 'introductory',
      body: document.getElementById('content-body').value.trim(),
      source: document.getElementById('content-source').value.trim(),
      reflection: document.getElementById('content-reflection').value.trim(),
      applyToday: document.getElementById('content-apply').value.trim(),
      saved: false, applied: false, read: false,
    };

    if (isEdit) {
      const idx = content.findIndex(c => c.id === id);
      const old = content[idx];
      item.saved = old.saved || false;
      item.applied = old.applied || false;
      item.read = old.read || false;
      content[idx] = item;
    } else {
      content.push(item);
    }

    Storage.set(Storage.KEYS.CONTENT_DB, content);
    closeContentForm();
    Utils.toast(isEdit ? 'Content updated' : 'Content added!', 'success');
    App.route();
  }

  function deleteContent(id) {
    if (!confirm('Delete this content item?')) return;
    const content = Storage.getAll(Storage.KEYS.CONTENT_DB).filter(c => c.id !== id);
    Storage.set(Storage.KEYS.CONTENT_DB, content);
    Utils.toast('Content deleted', 'info');
    App.route();
  }

  return { render, init };
})();
