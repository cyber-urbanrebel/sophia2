import React from 'react';

/* ── color helpers ── */
const avColors = {
  gold:    { bg: '#1e2a3a', text: '#5d9dd8' },
  teal:    { bg: '#1e2a1e', text: '#5d9e6a' },
  purple:  { bg: '#2a1e2a', text: '#9d6ab8' },
  default: { bg: '#2a1e14', text: '#c9844c' },
};

function getAvColor(colorKey) {
  return avColors[colorKey] || avColors.default;
}

function getDueInfo(dueDate) {
  if (!dueDate) return null;
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: 'overdue', cls: 'overdue' };
  if (diffDays === 0) return { text: 'today', cls: 'soon' };
  if (diffDays <= 3) return { text: `in ${diffDays} day${diffDays === 1 ? '' : 's'}`, cls: 'soon' };
  return { text: `in ${diffDays} days`, cls: '' };
}

const priorityCls = { low: 'priority-low', medium: 'priority-medium', high: 'priority-high', critical: 'priority-critical' };

export default function ProjectCard({ task, members, onDragStart, onClick }) {
  const assignees = (task.assigneeIds || []).map((id) => members.find((m) => m.id === id)).filter(Boolean);
  const dueInfo = getDueInfo(task.dueDate);
  const isDone = task.status === 'done';

  function handleDragStart(e) {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) onDragStart(e, task);
  }

  return (
    <div
      className={`project-card${isDone ? ' is-done' : ''}`}
      draggable="true"
      onDragStart={handleDragStart}
      onClick={() => onClick && onClick(task)}
    >
      {/* top row: title + assignees */}
      <div className="card-top-row">
        <span className="card-title">{task.title}</span>
        {assignees.length > 0 && (
          <div className="card-assignees">
            {assignees.map((m) => {
              const c = getAvColor(m.colorKey);
              return (
                <div key={m.id} className="assignee-av" style={{ background: c.bg, color: c.text }}>{m.initials}</div>
              );
            })}
          </div>
        )}
      </div>

      {/* meta row */}
      <div className="card-meta-row">
        <span className={`priority-badge ${priorityCls[task.priority] || 'priority-low'}`}>{task.priority}</span>
        {(task.labels || []).map((l) => (
          <span key={l} className="label-tag">{l}</span>
        ))}
        {dueInfo && (
          <span className={`due-date ${dueInfo.cls}`}>{dueInfo.text}</span>
        )}
      </div>

      {/* progress */}
      <div className="progress-track">
        <div
          className={`progress-fill${isDone ? ' done-fill' : ''}`}
          style={{ width: `${task.progressPercent}%` }}
        />
      </div>

      {/* comments */}
      {task.comments && task.comments.length > 0 && (
        <div className="comment-count-row">
          <svg viewBox="0 0 10 10" fill="none">
            <path d="M1 1h8v6H4L2 9V7H1z" stroke="#3a3a52" strokeWidth="0.8" />
          </svg>
          <span>{task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
}
