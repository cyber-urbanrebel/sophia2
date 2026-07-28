/* ═══════════════════════════════════════════════════════════
   JOURNAL.JS — Reflection Studio Page
   ═══════════════════════════════════════════════════════════ */

const Journal = (() => {
  const PROMPTS = [
    'What challenged me today and how did I respond?',
    'What am I most grateful for right now?',
    'What did I learn about myself recently?',
    'Where am I avoiding growth? Why?',
    'What would my ideal self do today?',
    'What fear is holding me back?',
    'What virtue did I practice today?',
    'When did I feel most alive this week?',
    'What habit is serving me best right now?',
    'What do I need to let go of?',
    'What would Seneca advise me about my current situation?',
    'How did I handle adversity today?',
    'What assumption should I question today?',
    'What is one thing I can do tomorrow to improve 1%?',
    'If today were my last day, what would I prioritize?',
  ];

  function render() {
    const entries = Storage.getAll(Storage.KEYS.JOURNAL);
    const todayKey = Utils.toDateKey(new Date());
    const todayEntry = entries.find(e => e.date === todayKey);
    const randomPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

    return `
      <div class="journal-page page-enter">
        <div class="journal-layout">
          <!-- Editor Panel -->
          <div class="journal-editor">
            <div class="section-header">
              <div><h2>${todayEntry ? 'Edit Today\'s Entry' : 'New Entry'}</h2><p class="section-desc">Prompted and freewrite reflections with mood scoring — the examined life, one entry at a time.</p></div>
              <span style="color:var(--text-muted);font-size:0.8125rem;">${Utils.formatDate(new Date(), 'long')}</span>
            </div>

            <!-- Prompt -->
            <div class="card" style="margin-bottom:16px;border-left:3px solid var(--gold);">
              <div class="card-body" style="display:flex;align-items:center;gap:12px;">
                <div style="color:var(--gold);">${Icons.get('mind', 24)}</div>
                <div style="flex:1;">
                  <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:4px;">Today's Prompt</div>
                  <p id="journal-prompt" style="font-family:var(--font-serif);font-size:1.0625rem;font-style:italic;">${Utils.escapeHtml(randomPrompt)}</p>
                </div>
                <button class="btn btn-ghost btn-sm" id="shuffle-prompt" title="New prompt">
                  ${Icons.getSmall('discipline')}
                </button>
              </div>
            </div>

            <!-- Type Selector -->
            <div class="tabs" style="margin-bottom:16px;">
              <button class="tab active" data-type="prompted">Prompted</button>
              <button class="tab" data-type="freewrite">Freewrite</button>
              <button class="tab" data-type="gratitude">Gratitude</button>
              <button class="tab" data-type="review">Day Review</button>
            </div>

            <!-- Mood Slider -->
            <div class="card" style="margin-bottom:16px;">
              <div class="card-body" style="display:flex;align-items:center;gap:16px;">
                <span style="font-size:0.8125rem;color:var(--text-muted);min-width:50px;">Mood</span>
                <input type="range" id="journal-mood" min="1" max="10" value="${todayEntry?.mood || 5}" style="flex:1;padding:0;">
                <span id="mood-display" style="font-size:1.25rem;min-width:40px;text-align:center;">${moodEmoji(todayEntry?.mood || 5)}</span>
              </div>
            </div>

            <!-- Editor -->
            <div class="form-group">
              <textarea id="journal-textarea" class="form-textarea" rows="12" placeholder="Begin writing..."
                style="font-size:1rem;line-height:1.8;min-height:300px;resize:vertical;">${todayEntry?.content || ''}</textarea>
              <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:0.75rem;color:var(--text-muted);">
                <span id="word-count">0 words</span>
                <span id="save-indicator"></span>
              </div>
            </div>

            <!-- Tags -->
            <div class="form-group" style="margin-top:12px;">
              <label class="form-label">Tags</label>
              <input type="text" id="journal-tags" class="form-input" placeholder="reflection, growth, stoicism..." value="${todayEntry?.tags?.join(', ') || ''}">
            </div>

            <!-- Socratic Prompts -->
            <div class="card" style="margin-top:16px;background:var(--bg-elevated);">
              <div class="card-body">
                <h4 style="color:var(--gold);margin-bottom:8px;">Deepen Your Thinking</h4>
                <div id="socratic-prompts">
                  ${generateSocraticPrompts()}
                </div>
              </div>
            </div>

            <div style="margin-top:16px;display:flex;gap:8px;">
              <button class="btn btn-primary btn-lg" id="save-entry-btn">Save Entry</button>
            </div>
          </div>

          <!-- History Panel -->
          <div class="journal-history">
            <h3 style="margin-bottom:16px;">Past Entries</h3>
            <div id="journal-timeline">
              ${entries.length ? entries.slice().reverse().slice(0, 20).map(renderTimelineEntry).join('') : `
                <div class="empty-state">
                  <p>No entries yet. Start your reflection journey.</p>
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function moodEmoji(val) {
    const icons = ['', '\u{1F614}', '\u{1F615}', '\u{1F610}', '\u{1F611}', '\u{1F642}', '\u{1F60A}', '\u{1F600}', '\u{1F604}', '\u{1F601}', '\u{1F929}'];
    // Use text labels instead of emojis per the spec (zero emojis)
    const labels = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    return `<span style="font-weight:700;color:${val <= 3 ? 'var(--rose)' : val <= 6 ? 'var(--amber)' : 'var(--emerald)'};">${val}/10</span>`;
  }

  function generateSocraticPrompts() {
    const items = [
      'What assumptions am I making here?',
      'What would I tell a friend in this situation?',
      'Is this within my control?',
      'What is the most generous interpretation?',
    ];
    return items.map(p => `
      <div class="socratic-prompt" style="padding:6px 0;cursor:pointer;color:var(--text-secondary);font-size:0.8125rem;border-bottom:1px solid var(--border);" data-prompt="${Utils.escapeHtml(p)}">
        ${Icons.getSmall('chevronDown')} ${Utils.escapeHtml(p)}
      </div>
    `).join('');
  }

  function renderTimelineEntry(e) {
    const date = new Date(e.date + 'T00:00:00');
    const isToday = e.date === Utils.toDateKey(new Date());
    return `
      <div class="timeline-entry ${isToday ? 'active' : ''}" data-id="${e.id}" style="padding:12px;border-left:2px solid ${isToday ? 'var(--gold)' : 'var(--border)'};margin-bottom:8px;cursor:pointer;border-radius:0 var(--radius-sm) var(--radius-sm) 0;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <span style="font-size:0.8125rem;font-weight:500;">${Utils.formatDate(date, 'short')}</span>
          <span style="font-size:0.75rem;color:${e.mood <= 3 ? 'var(--rose)' : e.mood <= 6 ? 'var(--amber)' : 'var(--emerald)'};">${e.mood}/10</span>
        </div>
        <p style="font-size:0.8125rem;color:var(--text-secondary);">${Utils.escapeHtml(e.content || '').substring(0, 80)}...</p>
        ${e.tags?.length ? `<div style="margin-top:4px;">${e.tags.map(t => `<span class="tag" style="font-size:0.65rem;">${Utils.escapeHtml(t)}</span>`).join(' ')}</div>` : ''}
      </div>
    `;
  }

  function init() {
    const textarea = document.getElementById('journal-textarea');

    // Word count
    function updateWordCount() {
      const text = textarea?.value || '';
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const el = document.getElementById('word-count');
      if (el) el.textContent = `${words} ${Utils.pluralize(words, 'word', 'words')}`;
    }
    textarea?.addEventListener('input', Utils.debounce(updateWordCount, 200));
    updateWordCount();

    // Mood slider
    document.getElementById('journal-mood')?.addEventListener('input', e => {
      document.getElementById('mood-display').innerHTML = moodEmoji(parseInt(e.target.value));
    });

    // Shuffle prompt
    document.getElementById('shuffle-prompt')?.addEventListener('click', () => {
      const promptEl = document.getElementById('journal-prompt');
      if (promptEl) promptEl.textContent = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    });

    // Tab type switching
    document.querySelectorAll('.journal-page .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.journal-page .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });

    // Save entry
    document.getElementById('save-entry-btn')?.addEventListener('click', saveEntry);

    // Socratic prompt click → insert into textarea
    document.querySelectorAll('.socratic-prompt').forEach(el => {
      el.addEventListener('click', () => {
        if (textarea) {
          textarea.value += '\n\n' + el.dataset.prompt + '\n';
          textarea.focus();
          updateWordCount();
        }
      });
    });

    // Timeline entry click → load into editor
    document.getElementById('journal-timeline')?.addEventListener('click', e => {
      const entry = e.target.closest('.timeline-entry');
      if (!entry) return;
      const entries = Storage.getAll(Storage.KEYS.JOURNAL);
      const found = entries.find(x => x.id === entry.dataset.id);
      if (found && textarea) {
        textarea.value = found.content || '';
        document.getElementById('journal-mood').value = found.mood || 5;
        document.getElementById('mood-display').innerHTML = moodEmoji(found.mood || 5);
        document.getElementById('journal-tags').value = (found.tags || []).join(', ');
        updateWordCount();
        // Scroll to top
        document.querySelector('.journal-editor')?.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  function saveEntry() {
    const textarea = document.getElementById('journal-textarea');
    const content = textarea?.value?.trim();
    if (!content) { Utils.toast('Write something first!', 'warning'); return; }

    const entries = Storage.getAll(Storage.KEYS.JOURNAL);
    const todayKey = Utils.toDateKey(new Date());
    const mood = parseInt(document.getElementById('journal-mood')?.value) || 5;
    const tagsStr = document.getElementById('journal-tags')?.value || '';
    const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
    const type = document.querySelector('.journal-page .tab.active')?.dataset.type || 'freewrite';
    const wordCount = content.split(/\s+/).length;

    const existingIdx = entries.findIndex(e => e.date === todayKey);

    const entry = {
      id: existingIdx >= 0 ? entries[existingIdx].id : Storage.uid(),
      date: todayKey,
      prompt: document.getElementById('journal-prompt')?.textContent || '',
      content,
      mood,
      tags,
      type,
      wordCount,
    };

    if (existingIdx >= 0) {
      entries[existingIdx] = entry;
    } else {
      entries.push(entry);
    }

    Storage.set(Storage.KEYS.JOURNAL, entries);
    Storage.addXP(15, 'emotional');

    const indicator = document.getElementById('save-indicator');
    if (indicator) {
      indicator.textContent = 'Saved!';
      indicator.style.color = 'var(--emerald)';
      setTimeout(() => { indicator.textContent = ''; }, 2000);
    }
    Utils.toast('Journal entry saved! +15 XP', 'success');

    // Refresh timeline
    const timeline = document.getElementById('journal-timeline');
    if (timeline) {
      const updated = Storage.getAll(Storage.KEYS.JOURNAL);
      timeline.innerHTML = updated.slice().reverse().slice(0, 20).map(renderTimelineEntry).join('');
    }
  }

  return { render, init };
})();
