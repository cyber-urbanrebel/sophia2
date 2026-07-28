import React, { useState } from 'react';
import { useProjectStore } from './projectStore.js';

const colorMap = {
  gold:   { bg: '#2a2210', text: '#c9a84c', border: '#3a3010' },
  teal:   { bg: '#0a1e18', text: '#3d9e75', border: '#0f2e22' },
  purple: { bg: '#1a1228', text: '#8b7dd8', border: '#2a1e3a' },
};

export default function WorkspaceSwitcher() {
  const store = useProjectStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [initials, setInitials] = useState('');
  const [colorKey, setColorKey] = useState('gold');

  function handleCreate() {
    if (!name.trim()) return;
    store.addWorkspace({
      name: name.trim(),
      initials: (initials || name.slice(0, 2)).toUpperCase().slice(0, 2),
      colorKey,
    });
    setName('');
    setInitials('');
    setColorKey('gold');
    setShowForm(false);
  }

  return (
    <div className="workspace-switcher">
      <div className="ws-section-label">Workspaces</div>
      {store.workspaces.map((ws) => {
        const c = colorMap[ws.colorKey] || colorMap.gold;
        const isActive = ws.id === store.activeWorkspaceId;
        return (
          <div
            key={ws.id}
            className={`ws-item${isActive ? ' active' : ''}`}
            onClick={() => store.setActiveWorkspace(ws.id)}
          >
            <div className={`ws-avatar ${ws.colorKey}`} style={{ background: c.bg, color: c.text, borderColor: c.border }}>
              {ws.initials}
            </div>
            <div className="ws-info">
              <div className="ws-name">{ws.name}</div>
              <div className="ws-count">{ws.members.length} member{ws.members.length !== 1 ? 's' : ''} · {ws.projects.length} project{ws.projects.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
        );
      })}

      {showForm ? (
        <div className="ws-new-form">
          <input
            className="inline-form-input"
            placeholder="Workspace name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <input
            className="inline-form-input"
            placeholder="Initials (2 chars)"
            value={initials}
            onChange={(e) => setInitials(e.target.value.slice(0, 2))}
            maxLength={2}
          />
          <div className="color-dots">
            {['gold', 'teal', 'purple'].map((ck) => (
              <button
                key={ck}
                type="button"
                className={`color-dot ${ck}-dot${colorKey === ck ? ' selected' : ''}`}
                onClick={() => setColorKey(ck)}
              />
            ))}
          </div>
          <button className="inline-form-submit" onClick={handleCreate}>Create</button>
        </div>
      ) : (
        <div className="ws-add-row" onClick={() => setShowForm(true)}>
          <svg viewBox="0 0 14 14" fill="none">
            <line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span>+ New workspace</span>
        </div>
      )}
    </div>
  );
}
