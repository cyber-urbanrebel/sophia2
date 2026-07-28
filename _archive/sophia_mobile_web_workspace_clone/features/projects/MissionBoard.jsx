import React, { useState } from 'react';
import { useProjectStore } from './projectStore.js';
import ProjectCard from './ProjectCard.jsx';

const COLUMNS = [
  { key: 'idea', label: 'Idea', emptyText: 'drop tasks here' },
  { key: 'active', label: 'Active', emptyText: 'drop tasks here' },
  { key: 'done', label: 'Done', emptyText: 'drop tasks here' },
  { key: 'archived', label: 'Archived', emptyText: 'nothing here yet' },
];

export default function MissionBoard({ projectId, workspaceId, onCardClick }) {
  const store = useProjectStore();
  const ws = store.workspaces.find((w) => w.id === workspaceId);
  const members = ws?.members || [];
  const tasks = store.tasks.filter((t) => t.projectId === projectId);

  const [dragOverCol, setDragOverCol] = useState(null);
  const [addingInCol, setAddingInCol] = useState(null); // which column has the inline form open
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('low');
  const [newDue, setNewDue] = useState('');

  function handleDragOver(e, colKey) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colKey);
  }

  function handleDragLeave() {
    setDragOverCol(null);
  }

  function handleDrop(e, colKey) {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === colKey) return;

    store.moveTask({ taskId, status: colKey });

    const author = members.find((m) => m.id === store.currentUserId);
    store.addActivityEvent({
      action: `moved to ${colKey}`,
      targetTitle: task.title,
      authorName: author?.name || 'You',
      authorId: store.currentUserId,
    });
  }

  function handleAddTask(colKey) {
    if (!newTitle.trim()) return;
    store.addTask({
      title: newTitle.trim(),
      priority: newPriority,
      dueDate: newDue || null,
      status: colKey,
      projectId,
      workspaceId,
    });

    const author = members.find((m) => m.id === store.currentUserId);
    store.addActivityEvent({
      action: 'added task',
      targetTitle: newTitle.trim(),
      authorName: author?.name || 'You',
      authorId: store.currentUserId,
    });

    setNewTitle('');
    setNewPriority('low');
    setNewDue('');
    setAddingInCol(null);
  }

  return (
    <div className="board-content">
      <div className="board-columns">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div
              key={col.key}
              className={`board-column${dragOverCol === col.key ? ' drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              <div className="col-header">
                <span className={`col-title ${col.key}`}>{col.label}</span>
                <span className="col-count-badge">{colTasks.length}</span>
              </div>

              {colTasks.map((task) => (
                <ProjectCard
                  key={task.id}
                  task={task}
                  members={members}
                  onClick={onCardClick}
                />
              ))}

              {colTasks.length === 0 && (
                <div className="empty-col-placeholder">{col.emptyText}</div>
              )}

              {addingInCol === col.key ? (
                <div className="add-task-form">
                  <input
                    className="inline-form-input"
                    placeholder="Task title…"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(col.key); if (e.key === 'Escape') setAddingInCol(null); }}
                    autoFocus
                  />
                  <select
                    className="inline-form-select"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <input
                    type="date"
                    className="inline-form-input"
                    value={newDue}
                    onChange={(e) => setNewDue(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="inline-form-submit" style={{ flex: 1 }} onClick={() => handleAddTask(col.key)}>Add</button>
                    <button className="inline-form-cancel" onClick={() => setAddingInCol(null)}>✕</button>
                  </div>
                </div>
              ) : (
                <button className="add-task-btn" onClick={() => setAddingInCol(col.key)}>+ add task</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
