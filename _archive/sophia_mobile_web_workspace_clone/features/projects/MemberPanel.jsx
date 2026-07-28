import React, { useState } from 'react';
import { useProjectStore } from './projectStore.js';

/* ── color helpers ── */
const avColors = {
  gold:    { bg: '#2a2210', text: '#c9a84c' },
  teal:    { bg: '#0a1e18', text: '#3d9e75' },
  purple:  { bg: '#1a1228', text: '#8b7dd8' },
  default: { bg: '#2a1e14', text: '#c9844c' },
};

function getAvColor(colorKey) {
  return avColors[colorKey] || avColors.default;
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  const now = Date.now();
  const t = new Date(timestamp).getTime();
  const diffSec = Math.floor((now - t) / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return 'yesterday';
  const d = new Date(timestamp);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

const roleCls = { owner: 'role-owner', member: 'role-member', viewer: 'role-viewer' };
const statusCls = { online: 'status-online', away: 'status-away', offline: 'status-offline' };

export default function MemberPanel({ workspaceId, activeTab, onTabChange }) {
  const store = useProjectStore();
  const ws = store.workspaces.find((w) => w.id === workspaceId);
  const members = ws?.members || [];
  const permissions = store.permissions[workspaceId] || {};
  const currentMember = members.find((m) => m.id === store.currentUserId);
  const isOwner = currentMember?.role === 'owner';

  const wsActivity = store.activity
    .filter((a) => a.workspaceId === workspaceId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  function handleInvite() {
    if (!inviteEmail.trim()) return;
    store.addMember({
      workspaceId,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
    });
    store.addActivityEvent({
      action: 'invited',
      targetTitle: inviteEmail,
      authorName: currentMember?.name || 'You',
    });
    setInviteEmail('');
    setShowInvite(false);
  }

  function handleTogglePerm(key) {
    if (!isOwner) return;
    store.updatePermissions({
      workspaceId,
      perms: { [key]: !permissions[key] },
    });
  }

  const tabs = ['team', 'activity', 'perms'];
  const tabLabels = { team: 'Team', activity: 'Activity', perms: 'Perms' };

  return (
    <div className="panel-container">
      <div className="panel-tab-bar">
        {tabs.map((t) => (
          <button
            key={t}
            className={`panel-tab${activeTab === t ? ' active' : ''}`}
            onClick={() => onTabChange(t)}
          >
            {tabLabels[t]}
          </button>
        ))}
      </div>

      <div className="panel-body">
        {/* ── Team Tab ── */}
        {activeTab === 'team' && (
          <>
            <div className="panel-section-label">Members — {ws?.name || ''}</div>
            {members.map((m) => {
              const c = getAvColor(m.colorKey);
              return (
                <div key={m.id} className="member-row">
                  <div className="member-avatar" style={{ background: c.bg, color: c.text }}>{m.initials}</div>
                  <div className="member-info">
                    <span className="member-name">{m.name}</span>
                    <span className={`member-role-badge ${roleCls[m.role] || 'role-member'}`}>{m.role}</span>
                  </div>
                  <div className={`status-dot ${statusCls[m.status] || 'status-offline'}`} />
                </div>
              );
            })}

            {showInvite ? (
              <div className="invite-form">
                <input
                  className="inline-form-input"
                  placeholder="Email…"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                  autoFocus
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button className="inline-form-submit" onClick={handleInvite}>Send invite</button>
              </div>
            ) : (
              <button className="invite-btn" onClick={() => setShowInvite(true)}>+ Invite someone</button>
            )}
          </>
        )}

        {/* ── Activity Tab ── */}
        {activeTab === 'activity' && (
          <>
            {wsActivity.map((ev) => {
              const author = members.find((m) => m.id === ev.authorId);
              const c = getAvColor(author?.colorKey || 'default');
              return (
                <div key={ev.id} className="activity-item">
                  <div className="act-avatar" style={{ background: c.bg, color: c.text }}>{author?.initials || '??'}</div>
                  <div className="act-text">
                    <strong>{ev.authorName}</strong> {ev.action} <strong>{ev.targetTitle}</strong>
                    <span className="act-time">{formatRelativeTime(ev.timestamp)}</span>
                  </div>
                </div>
              );
            })}
            {wsActivity.length === 0 && (
              <div className="empty-col-placeholder">No activity yet</div>
            )}
          </>
        )}

        {/* ── Perms Tab ── */}
        {activeTab === 'perms' && (
          <>
            <div className="panel-section-label">Workspace permissions</div>
            {[
              { key: 'membersCanInvite', label: 'Members can invite' },
              { key: 'viewersCanComment', label: 'Viewers can comment' },
              { key: 'publicWorkspace', label: 'Public workspace' },
              { key: 'showPersonalDataToTeam', label: 'Show personal data to team' },
            ].map((perm) => (
              <div key={perm.key} className="perm-row">
                <span className="perm-label">{perm.label}</span>
                <button
                  className={`toggle-switch${permissions[perm.key] ? ' on' : ''}${!isOwner ? ' disabled' : ''}`}
                  onClick={() => handleTogglePerm(perm.key)}
                  disabled={!isOwner}
                >
                  <span className="toggle-knob" />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
