import React, { useState, useMemo } from 'react';
import { useProjectStore } from './projectStore.js';
import MissionBoard from './MissionBoard.jsx';
import MemberPanel from './MemberPanel.jsx';
import TaskDetailModal from './TaskDetailModal.jsx';
import { InviteIcon } from '../../components/SophiaIcons.jsx';
import './projects.css';

/* ── avatar color helpers ── */
const avColors = {
  gold:    { bg: '#2a2210', text: '#c9a84c' },
  teal:    { bg: '#0a1e18', text: '#3d9e75' },
  purple:  { bg: '#1a1228', text: '#8b7dd8' },
  default: { bg: '#2a1e14', text: '#c9844c' },
};
function getAvColor(k) { return avColors[k] || avColors.default; }

const SUB_TABS = ['Board', 'List', 'Timeline', 'Goals'];

export default function ProjectsPage() {
  const store = useProjectStore();
  const [activeSubTab, setActiveSubTab] = useState('Board');
  const [selectedTask, setSelectedTask] = useState(null);
  const [memberPanelTab, setMemberPanelTab] = useState('team');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const activeWs = store.workspaces.find((w) => w.id === store.activeWorkspaceId);
  const activeProj = activeWs?.projects.find((p) => p.id === store.activeProjectId);
  const members = activeWs?.members || [];
  const wsTasks = store.tasks.filter((t) => t.workspaceId === store.activeWorkspaceId);

  /* ── Computed stats ── */
  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const activeTasks = wsTasks.filter((t) => t.status === 'active').length;
    const doneThisWeek = wsTasks.filter((t) => t.status === 'done' && new Date(t.updatedAt) >= weekAgo).length;
    const unassigned = wsTasks.filter((t) => !t.assigneeIds || t.assigneeIds.length === 0).length;
    const overdue = wsTasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done' && t.status !== 'archived').length;

    return { activeTasks, doneThisWeek, unassigned, overdue };
  }, [wsTasks]);

  function handleNewProject() {
    store.addProject({ name: 'New project' });
    const author = members.find((m) => m.id === store.currentUserId);
    store.addActivityEvent({
      action: 'created project',
      targetTitle: 'New project',
      authorName: author?.name || 'You',
    });
  }

  function handleInviteSubmit() {
    if (!inviteEmail.trim()) return;
    store.addMember({
      workspaceId: store.activeWorkspaceId,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
    });
    const author = members.find((m) => m.id === store.currentUserId);
    store.addActivityEvent({
      action: 'invited',
      targetTitle: inviteEmail,
      authorName: author?.name || 'You',
    });
    setInviteEmail('');
    setInviteRole('member');
    setInviteSuccess(true);
    setTimeout(() => { setInviteSuccess(false); setShowInviteModal(false); }, 1400);
  }

  function getDueLabel(d) {
    if (!d) return '—';
    const due = new Date(d);
    return `${due.getMonth() + 1}/${due.getDate()}`;
  }

  const MAX_AVATARS = 4;
  const visibleMembers = members.slice(0, MAX_AVATARS);
  const overflowCount = members.length - MAX_AVATARS;

  return (
    <div className="projects-page" style={{ '--content-max-width': '1680px' }}>
      {/* ── TOPBAR ── */}
      <div className="projects-topbar">
        <div>
          <h1>Projects</h1>
          <p className="projects-subheading">
            {activeWs?.name || 'No workspace'} — {activeProj?.name || 'No project'}
          </p>
        </div>
        <div className="topbar-right">
          <div className="avatar-cluster">
            {visibleMembers.map((m) => {
              const c = getAvColor(m.colorKey);
              return <div key={m.id} className="av-circle" style={{ background: c.bg, color: c.text }}>{m.initials}</div>;
            })}
            {overflowCount > 0 && <div className="av-more">+{overflowCount}</div>}
          </div>
          <button className="btn-ghost-gold invite-topbar-btn" onClick={() => setShowInviteModal(true)}>
            <InviteIcon size={16} /> Invite
          </button>
          <button className="btn-primary-gold" onClick={handleNewProject}>+ New mission</button>
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="projects-content">
        {/* ── LEFT/MAIN ── */}
        <div className="projects-main">
          {/* sub-tabs */}
          <div className="sub-tabs">
            {SUB_TABS.map((tab) => (
              <button
                key={tab}
                className={`sub-tab${activeSubTab === tab ? ' active' : ''}`}
                onClick={() => setActiveSubTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* stats */}
          <div className="stats-row">
            <div className="stat-card gold">
              <div className="stat-label">Team tasks active</div>
              <div className="stat-value">{stats.activeTasks}</div>
              <div className="stat-sub">across all projects</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Done this week</div>
              <div className="stat-value">{stats.doneThisWeek}</div>
              <div className="stat-sub">completed recently</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Unassigned</div>
              <div className="stat-value">{stats.unassigned}</div>
              <div className="stat-sub">need owners</div>
            </div>
            <div className="stat-card danger">
              <div className="stat-label">Blocked / Overdue</div>
              <div className="stat-value">{stats.overdue}</div>
              <div className="stat-sub">needs attention</div>
            </div>
          </div>

          {/* project tabs */}
          <div className="project-tabs-row">
            {(activeWs?.projects || []).map((proj) => (
              <button
                key={proj.id}
                className={`proj-tab${store.activeProjectId === proj.id ? ' active' : ''}`}
                onClick={() => store.setActiveProject(proj.id)}
              >
                {proj.name}
              </button>
            ))}
            <button className="proj-tab" onClick={handleNewProject}>+ New</button>
          </div>

          {/* board or other views */}
          {activeSubTab === 'Board' && activeProj ? (
            <MissionBoard
              projectId={activeProj.id}
              workspaceId={activeWs.id}
              onCardClick={(task) => setSelectedTask(task)}
            />
          ) : activeSubTab === 'List' ? (
            /* ── LIST VIEW ── */
            <div className="list-view">
              <div className="list-header">
                <span className="list-col lc-status">Status</span>
                <span className="list-col lc-title">Title</span>
                <span className="list-col lc-priority">Priority</span>
                <span className="list-col lc-assignee">Assignee</span>
                <span className="list-col lc-due">Due</span>
                <span className="list-col lc-progress">Progress</span>
              </div>
              {wsTasks.length === 0 && <div className="empty-col-placeholder" style={{padding:'40px 0'}}>No tasks yet</div>}
              {wsTasks.map((task) => (
                <div key={task.id} className={`list-row${task.status === 'done' ? ' is-done' : ''}`} onClick={() => setSelectedTask(task)}>
                  <span className="list-col lc-status">
                    <span className={`status-dot-lg ${task.status}`} />
                    {task.status}
                  </span>
                  <span className="list-col lc-title">{task.title}</span>
                  <span className={`list-col lc-priority priority-badge ${task.priority}`}>{task.priority}</span>
                  <span className="list-col lc-assignee">
                    {(task.assigneeIds || []).map((id) => {
                      const m = members.find((mm) => mm.id === id);
                      if (!m) return null;
                      const c = getAvColor(m.colorKey);
                      return <span key={id} className="mini-av" style={{ background: c.bg, color: c.text }}>{m.initials}</span>;
                    })}
                  </span>
                  <span className="list-col lc-due">{getDueLabel(task.dueDate)}</span>
                  <span className="list-col lc-progress">
                    <span className="mini-progress-track"><span className="mini-progress-fill" style={{ width: `${task.progressPercent}%` }} /></span>
                    <span className="mini-progress-val">{task.progressPercent}%</span>
                  </span>
                </div>
              ))}
            </div>
          ) : activeSubTab === 'Timeline' ? (
            /* ── TIMELINE VIEW ── */
            <div className="timeline-view">
              <div className="timeline-track">
                {(() => {
                  const now = new Date();
                  const groups = [
                    { label: 'Overdue', tasks: wsTasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done' && t.status !== 'archived') },
                    { label: 'This Week', tasks: wsTasks.filter((t) => { if (!t.dueDate) return false; const d = new Date(t.dueDate); const end = new Date(now); end.setDate(end.getDate() + 7); return d >= now && d <= end && t.status !== 'done'; }) },
                    { label: 'Later', tasks: wsTasks.filter((t) => { if (!t.dueDate) return false; const d = new Date(t.dueDate); const end = new Date(now); end.setDate(end.getDate() + 7); return d > end && t.status !== 'done'; }) },
                    { label: 'No Date', tasks: wsTasks.filter((t) => !t.dueDate && t.status !== 'done' && t.status !== 'archived') },
                    { label: 'Completed', tasks: wsTasks.filter((t) => t.status === 'done') },
                  ];
                  return groups.map((g) => (
                    <div key={g.label} className="timeline-group">
                      <div className="timeline-group-label">
                        <span className="timeline-dot" />
                        {g.label}
                        <span className="timeline-badge">{g.tasks.length}</span>
                      </div>
                      <div className="timeline-items">
                        {g.tasks.map((t) => (
                          <div key={t.id} className={`timeline-card ${t.status}`} onClick={() => setSelectedTask(t)}>
                            <span className="timeline-card-title">{t.title}</span>
                            <span className={`priority-badge priority-${t.priority}`}>{t.priority}</span>
                            {t.dueDate && <span className="timeline-card-date">{getDueLabel(t.dueDate)}</span>}
                          </div>
                        ))}
                        {g.tasks.length === 0 && <div className="empty-col-placeholder">—</div>}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          ) : activeSubTab === 'Goals' ? (
            /* ── GOALS VIEW ── */
            <div className="goals-view">
              <div className="goals-grid">
                <div className="goal-card-big">
                  <div className="goal-ring">
                    <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="60" cy="60" r="52" fill="none" stroke="#1e1e2e" strokeWidth="8" />
                      <circle cx="60" cy="60" r="52" fill="none" stroke="#c9a84c" strokeWidth="8" strokeDasharray={`${(wsTasks.filter((t) => t.status === 'done').length / Math.max(wsTasks.length, 1)) * 327} 327`} strokeLinecap="round" />
                    </svg>
                    <div className="goal-ring-label">
                      <span className="goal-ring-percent">{wsTasks.length ? Math.round((wsTasks.filter((t) => t.status === 'done').length / wsTasks.length) * 100) : 0}%</span>
                      <span className="goal-ring-sub">Complete</span>
                    </div>
                  </div>
                  <div className="goal-stats-list">
                    <div className="goal-stat"><span className="goal-stat-n">{wsTasks.filter((t) => t.status === 'idea').length}</span> Ideas</div>
                    <div className="goal-stat"><span className="goal-stat-n gold">{wsTasks.filter((t) => t.status === 'active').length}</span> Active</div>
                    <div className="goal-stat"><span className="goal-stat-n green">{wsTasks.filter((t) => t.status === 'done').length}</span> Done</div>
                    <div className="goal-stat"><span className="goal-stat-n dim">{wsTasks.filter((t) => t.status === 'archived').length}</span> Archived</div>
                  </div>
                </div>
                <div className="goal-card">
                  <div className="goal-card-title">Team Performance</div>
                  {members.map((m) => {
                    const assigned = wsTasks.filter((t) => (t.assigneeIds || []).includes(m.id));
                    const done = assigned.filter((t) => t.status === 'done').length;
                    const c = getAvColor(m.colorKey);
                    return (
                      <div key={m.id} className="team-perf-row">
                        <div className="mini-av" style={{ background: c.bg, color: c.text }}>{m.initials}</div>
                        <span className="team-perf-name">{m.name}</span>
                        <span className="mini-progress-track" style={{ flex: 1 }}>
                          <span className="mini-progress-fill" style={{ width: assigned.length ? `${(done / assigned.length) * 100}%` : '0' }} />
                        </span>
                        <span className="team-perf-stat">{done}/{assigned.length}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="goal-card">
                  <div className="goal-card-title">Priority Breakdown</div>
                  {['critical', 'high', 'medium', 'low'].map((p) => {
                    const n = wsTasks.filter((t) => t.priority === p).length;
                    return (
                      <div key={p} className="priority-dist-row">
                        <span className={`priority-badge priority-${p}`}>{p}</span>
                        <span className="mini-progress-track" style={{ flex: 1 }}>
                          <span className="mini-progress-fill" style={{ width: wsTasks.length ? `${(n / wsTasks.length) * 100}%` : '0' }} />
                        </span>
                        <span className="priority-dist-n">{n}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : activeSubTab === 'Board' && !activeProj ? (
            <div className="coming-soon">Create a project to get started</div>
          ) : null}

          {/* task detail modal */}
          {selectedTask && (
            <TaskDetailModal
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
            />
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        {activeWs && (
          <MemberPanel
            workspaceId={activeWs.id}
            activeTab={memberPanelTab}
            onTabChange={setMemberPanelTab}
          />
        )}
      </div>

      {/* ── INVITE MODAL ── */}
      {showInviteModal && (
        <div className="invite-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowInviteModal(false)}>
          <div className="invite-modal-card">
            <button className="modal-close-btn" onClick={() => setShowInviteModal(false)}>&times;</button>
            <div className="invite-modal-icon"><InviteIcon size={40} /></div>
            <h2 className="invite-modal-title">Invite to {activeWs?.name || 'workspace'}</h2>
            <p className="invite-modal-sub">Add team members to collaborate on projects</p>
            <div className="invite-field">
              <label>Email address</label>
              <input
                className="invite-input"
                placeholder="teammate@example.com"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInviteSubmit()}
                autoFocus
              />
            </div>
            <div className="invite-field">
              <label>Role</label>
              <select className="invite-select" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                <option value="member">Member — can create &amp; edit</option>
                <option value="viewer">Viewer — read only</option>
              </select>
            </div>
            <div className="invite-modal-actions">
              <button className="btn-ghost-dark" onClick={() => setShowInviteModal(false)}>Cancel</button>
              <button className="btn-primary-gold" onClick={handleInviteSubmit}>Send Invite</button>
            </div>
            {inviteSuccess && (
              <div className="invite-success-msg">
                <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#3d9e75" opacity="0.2"/><path d="M5 8l2 2 4-4" stroke="#3d9e75" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                Invite sent successfully!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
