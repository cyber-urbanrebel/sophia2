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

const STATUSES = ['idea', 'active', 'done', 'archived'];

export default function TaskDetailModal({ task, onClose }) {
  const store = useProjectStore();
  const ws = store.workspaces.find((w) => w.id === task.workspaceId);
  const members = ws?.members || [];

  const [title, setTitle] = useState(task.title);
  const [progress, setProgress] = useState(task.progressPercent);
  const [newLabel, setNewLabel] = useState('');
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);

  function handleTitleBlur() {
    if (title !== task.title) {
      store.updateTask({ id: task.id, title });
    }
  }

  function handleProgressChange(e) {
    const val = Number(e.target.value);
    setProgress(val);
    store.updateTask({ id: task.id, progressPercent: val });
  }

  function handlePriorityChange(e) {
    store.updateTask({ id: task.id, priority: e.target.value });
  }

  function handleDueDateChange(e) {
    store.updateTask({ id: task.id, dueDate: e.target.value ? new Date(e.target.value).toISOString() : null });
  }

  function handleStatusChange(status) {
    store.moveTask({ taskId: task.id, status });
    const author = members.find((m) => m.id === store.currentUserId);
    store.addActivityEvent({
      action: `moved to ${status}`,
      targetTitle: task.title,
      authorName: author?.name || 'You',
    });
  }

  function handleAddLabel() {
    if (!newLabel.trim()) return;
    const labels = [...(task.labels || []), newLabel.trim()];
    store.updateTask({ id: task.id, labels });
    setNewLabel('');
    setShowLabelInput(false);
  }

  function handleRemoveLabel(label) {
    store.updateTask({ id: task.id, labels: (task.labels || []).filter((l) => l !== label) });
  }

  function toggleAssignee(memberId) {
    const current = task.assigneeIds || [];
    const next = current.includes(memberId) ? current.filter((id) => id !== memberId) : [...current, memberId];
    store.updateTask({ id: task.id, assigneeIds: next });
  }

  function handlePostComment() {
    if (!commentText.trim()) return;
    store.addComment({ taskId: task.id, text: commentText.trim() });
    const author = members.find((m) => m.id === store.currentUserId);
    store.addActivityEvent({
      action: 'commented on',
      targetTitle: task.title,
      authorName: author?.name || 'You',
    });
    setCommentText('');
  }

  // Re-read task from store for live updates
  const liveTask = store.tasks.find((t) => t.id === task.id) || task;

  const assignees = (liveTask.assigneeIds || []).map((id) => members.find((m) => m.id === id)).filter(Boolean);

  function getDueValue() {
    if (!liveTask.dueDate) return '';
    try { return new Date(liveTask.dueDate).toISOString().split('T')[0]; } catch { return ''; }
  }

  return (
    <div className="task-modal-overlay">
      <div className="task-modal-box">
        <button className="modal-close-btn" onClick={onClose}>&times;</button>

        {/* Title */}
        <input
          className="task-modal-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
        />

        {/* Meta row: priority, due, assignees */}
        <div className="task-modal-meta-row">
          <select
            className="inline-form-select"
            value={liveTask.priority}
            onChange={handlePriorityChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <input
            type="date"
            className="inline-form-input"
            value={getDueValue()}
            onChange={handleDueDateChange}
          />
          <div className="assignee-picker">
            <div className="card-assignees" style={{ cursor: 'pointer' }} onClick={() => setShowAssigneePicker(!showAssigneePicker)}>
              {assignees.length > 0 ? assignees.map((m) => {
                const c = getAvColor(m.colorKey);
                return <div key={m.id} className="assignee-av" style={{ background: c.bg, color: c.text }}>{m.initials}</div>;
              }) : <span style={{ fontSize: 11, color: '#4a4a62' }}>+ assign</span>}
            </div>
            {showAssigneePicker && (
              <div className="assignee-dropdown">
                {members.map((m) => {
                  const c = getAvColor(m.colorKey);
                  const sel = (liveTask.assigneeIds || []).includes(m.id);
                  return (
                    <div key={m.id} className={`member-row${sel ? ' selected' : ''}`} onClick={() => toggleAssignee(m.id)}>
                      <div className="member-avatar" style={{ background: c.bg, color: c.text, width: 22, height: 22, fontSize: 8 }}>{m.initials}</div>
                      <span className="member-name">{m.name}</span>
                      {sel && <span style={{ marginLeft: 'auto', color: '#c9a84c', fontSize: 12 }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="task-modal-progress-row">
          <label>Progress</label>
          <input type="range" min="0" max="100" step="1" value={progress} onChange={handleProgressChange} />
          <span className="progress-readout">{progress}%</span>
        </div>

        {/* Labels */}
        <div className="task-modal-labels-row">
          {(liveTask.labels || []).map((l) => (
            <span key={l} className="label-tag">
              {l}<span className="label-remove" onClick={() => handleRemoveLabel(l)}>&times;</span>
            </span>
          ))}
          {showLabelInput ? (
            <input
              className="inline-form-input"
              style={{ width: 80, padding: '2px 6px', fontSize: 10 }}
              placeholder="label"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddLabel(); if (e.key === 'Escape') setShowLabelInput(false); }}
              autoFocus
            />
          ) : (
            <span style={{ fontSize: 10, color: '#4a4a62', cursor: 'pointer' }} onClick={() => setShowLabelInput(true)}>+ add label</span>
          )}
        </div>

        {/* Status */}
        <div className="task-modal-status-row">
          {STATUSES.map((s) => (
            <button
              key={s}
              className={liveTask.status === s ? 'active-status' : ''}
              onClick={() => handleStatusChange(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Comments */}
        <div className="task-modal-comments">
          {(liveTask.comments || []).map((c) => {
            const author = members.find((m) => m.id === c.authorId);
            const ac = getAvColor(author?.colorKey || 'default');
            return (
              <div key={c.id} className="comment-item">
                <div className="act-avatar" style={{ background: ac.bg, color: ac.text }}>{author?.initials || '??'}</div>
                <div className="comment-body">
                  <span className="comment-author">{author?.name || 'Unknown'}</span>
                  <div className="comment-text">{c.text}</div>
                  <span className="comment-time">{formatRelativeTime(c.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="comment-input-row">
          <input
            placeholder="Add a comment…"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
          />
          <button onClick={handlePostComment}>Post</button>
        </div>
      </div>
    </div>
  );
}
