/* ═══════════════════════════════════════════════════════════
   MIND.JS — Mental Mastery / Wisdom Feed Page
   ═══════════════════════════════════════════════════════════ */

const Mind = (() => {
  let activeSession = null;

  function render() {
    const content = Storage.getAll(Storage.KEYS.CONTENT_DB);
    const saved = content.filter(c => c.saved);
    const applied = content.filter(c => c.applied);
    const traditions = [...new Set(content.map(c => c.tradition))];

    return `
      <div class="mind-page page-enter">
        <div class="section-header">
          <div><h2>Wisdom Library</h2><p class="section-desc">Curated teachings from Stoicism, Buddhism, Existentialism, and positive psychology — read, reflect, and apply daily.</p></div>
          <div style="display:flex;gap:8px;align-items:center;">
            <select class="form-select" id="mind-filter-tradition" style="width:auto;">
              <option value="all">All Traditions</option>
              ${traditions.map(t => `<option value="${t}">${Utils.escapeHtml(t)}</option>`).join('')}
            </select>
            <select class="form-select" id="mind-filter-format" style="width:auto;">
              <option value="all">All Formats</option>
              <option value="article">Articles</option>
              <option value="exercise">Exercises</option>
            </select>
          </div>
        </div>

        <!-- Stats -->
        <div class="stat-row" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:24px;">
          <div class="stat-card">
            <div class="stat-value">${content.length}</div>
            <div class="stat-label">Total Items</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${content.filter(c => c.read).length}</div>
            <div class="stat-label">Read</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${saved.length}</div>
            <div class="stat-label">Saved</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${applied.length}</div>
            <div class="stat-label">Applied</div>
          </div>
        </div>

        <!-- Content Feed -->
        <div class="content-feed" id="content-feed">
          ${content.map(renderContentCard).join('')}
        </div>

        <!-- Session Overlay -->
        <div class="session-overlay" id="session-overlay" style="display:none;">
          <div class="session-card" id="session-card">
            <button class="btn btn-ghost btn-icon" style="position:absolute;top:12px;right:12px;" id="session-close">${Icons.get('close', 20)}</button>
            <div id="session-content"></div>
          </div>
        </div>
      </div>
    `;
  }

  function renderContentCard(c) {
    return `
      <div class="card content-card" data-id="${c.id}" data-tradition="${c.tradition}" data-format="${c.format}">
        <div class="card-body">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <span class="badge badge-cyan" style="font-size:0.65rem;">${Utils.escapeHtml(c.tradition)}</span>
              <span class="badge" style="font-size:0.65rem;">${c.format === 'exercise' ? 'Exercise' : 'Article'}</span>
              <span class="badge" style="font-size:0.65rem;">${c.duration}min</span>
              ${c.read ? '<span class="badge badge-emerald" style="font-size:0.65rem;">Read</span>' : ''}
            </div>
            <button class="btn btn-ghost btn-icon btn-sm content-save" data-id="${c.id}" title="${c.saved ? 'Unsave' : 'Save'}">
              <span style="color:${c.saved ? 'var(--gold)' : 'var(--text-muted)'};">${Icons.getSmall('star')}</span>
            </button>
          </div>
          <h3 style="font-size:1.0625rem;margin-bottom:6px;">${Utils.escapeHtml(c.title)}</h3>
          <p style="color:var(--text-secondary);font-size:0.8125rem;margin-bottom:12px;">${Utils.escapeHtml(c.body).substring(0, 150)}...</p>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary btn-sm content-read" data-id="${c.id}">${c.read ? 'Revisit' : 'Read'}</button>
            ${c.read && !c.applied ? `<button class="btn btn-secondary btn-sm content-apply" data-id="${c.id}">Apply Today</button>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function init() {
    // Filters
    document.getElementById('mind-filter-tradition')?.addEventListener('change', applyFilters);
    document.getElementById('mind-filter-format')?.addEventListener('change', applyFilters);

    // Delegated events
    document.getElementById('content-feed')?.addEventListener('click', e => {
      const readBtn = e.target.closest('.content-read');
      const saveBtn = e.target.closest('.content-save');
      const applyBtn = e.target.closest('.content-apply');
      if (readBtn) openSession(readBtn.dataset.id);
      if (saveBtn) toggleSave(saveBtn.dataset.id);
      if (applyBtn) markApplied(applyBtn.dataset.id);
    });

    // Session close
    document.getElementById('session-close')?.addEventListener('click', closeSession);
  }

  function applyFilters() {
    const tradition = document.getElementById('mind-filter-tradition')?.value || 'all';
    const format = document.getElementById('mind-filter-format')?.value || 'all';

    document.querySelectorAll('.content-card').forEach(card => {
      const matchT = tradition === 'all' || card.dataset.tradition === tradition;
      const matchF = format === 'all' || card.dataset.format === format;
      card.style.display = (matchT && matchF) ? '' : 'none';
    });
  }

  function openSession(id) {
    const content = Storage.getAll(Storage.KEYS.CONTENT_DB);
    const c = content.find(x => x.id === id);
    if (!c) return;

    // Mark as read
    c.read = true;
    Storage.set(Storage.KEYS.CONTENT_DB, content);
    Storage.addXP(10, 'mental');

    activeSession = c;
    const overlay = document.getElementById('session-overlay');
    const sessionContent = document.getElementById('session-content');
    if (!overlay || !sessionContent) return;

    sessionContent.innerHTML = `
      <div style="margin-bottom:20px;">
        <span class="badge badge-cyan">${Utils.escapeHtml(c.tradition)}</span>
        <span class="badge" style="margin-left:4px;">${c.duration}min ${c.format}</span>
      </div>
      <h2 style="font-family:var(--font-serif);font-size:1.75rem;margin-bottom:16px;">${Utils.escapeHtml(c.title)}</h2>
      <div style="color:var(--text-secondary);line-height:1.8;margin-bottom:24px;font-size:0.9375rem;">
        ${Utils.escapeHtml(c.body)}
      </div>
      ${c.source ? `<div style="color:var(--text-muted);font-size:0.8125rem;font-style:italic;margin-bottom:20px;">Source: ${Utils.escapeHtml(c.source)}</div>` : ''}
      <div class="card" style="background:var(--bg-elevated);margin-bottom:16px;">
        <div class="card-body">
          <h4 style="color:var(--gold);margin-bottom:8px;">Reflection</h4>
          <p style="color:var(--text-secondary);font-size:0.9375rem;font-style:italic;">${Utils.escapeHtml(c.reflection || '')}</p>
        </div>
      </div>
      <div class="card" style="background:var(--bg-elevated);margin-bottom:24px;">
        <div class="card-body">
          <h4 style="color:var(--cyan);margin-bottom:8px;">Apply Today</h4>
          <p style="color:var(--text-secondary);font-size:0.9375rem;">${Utils.escapeHtml(c.applyToday || '')}</p>
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary" id="session-apply-btn">Mark as Applied</button>
        <button class="btn btn-secondary" id="session-journal-btn">${Icons.getSmall('journal')} Journal About This</button>
      </div>
    `;

    document.getElementById('session-apply-btn')?.addEventListener('click', () => {
      markApplied(c.id);
      closeSession();
    });

    document.getElementById('session-journal-btn')?.addEventListener('click', () => {
      closeSession();
      window.location.hash = '#journal';
    });

    overlay.style.display = 'flex';
  }

  function closeSession() {
    const overlay = document.getElementById('session-overlay');
    if (overlay) overlay.style.display = 'none';
    activeSession = null;
    App.route();
  }

  function toggleSave(id) {
    const content = Storage.getAll(Storage.KEYS.CONTENT_DB);
    const c = content.find(x => x.id === id);
    if (c) {
      c.saved = !c.saved;
      Storage.set(Storage.KEYS.CONTENT_DB, content);
      Utils.toast(c.saved ? 'Saved to bookmarks' : 'Removed from bookmarks', 'info');
      App.route();
    }
  }

  function markApplied(id) {
    const content = Storage.getAll(Storage.KEYS.CONTENT_DB);
    const c = content.find(x => x.id === id);
    if (c) {
      c.applied = true;
      Storage.set(Storage.KEYS.CONTENT_DB, content);
      Storage.addXP(15, 'mental');
      Utils.toast('Wisdom applied! +15 XP', 'success');
      App.route();
    }
  }

  return { render, init };
})();
