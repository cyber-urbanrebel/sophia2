import { createSlice } from '@reduxjs/toolkit';
import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const STORAGE_KEY = 'sophia-projects-v1';

/* ── helpers ── */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(23, 59, 59, 0);
  return d.toISOString();
}

/* ── seed data (only used on first load) ── */
function buildSeedData() {
  return {
    workspaces: [
      {
        id: 'ws-soul-rebels',
        name: 'Soul Rebels',
        initials: 'SR',
        colorKey: 'gold',
        members: [
          { id: 'mem-kemi', name: 'Kemi A.', initials: 'KA', colorKey: 'gold', role: 'owner', status: 'online', joinedAt: '2026-01-15T00:00:00Z' },
          { id: 'mem-tolu', name: 'Tolu M.', initials: 'TM', colorKey: 'teal', role: 'member', status: 'online', joinedAt: '2026-02-01T00:00:00Z' },
          { id: 'mem-raj', name: 'Raj J.', initials: 'RJ', colorKey: 'purple', role: 'member', status: 'away', joinedAt: '2026-02-10T00:00:00Z' },
          { id: 'mem-sara', name: 'Sara L.', initials: 'SL', colorKey: 'gold', role: 'viewer', status: 'offline', joinedAt: '2026-03-01T00:00:00Z' },
        ],
        projects: [
          { id: 'proj-fitness', workspaceId: 'ws-soul-rebels', name: 'Fitness Reset', description: 'Complete fitness transformation program', createdAt: '2026-03-01T00:00:00Z' },
        ],
        createdAt: '2026-01-15T00:00:00Z',
      },
      {
        id: 'ws-growth-gang',
        name: 'Growth Gang',
        initials: 'GG',
        colorKey: 'teal',
        members: [
          { id: 'mem-kemi', name: 'Kemi A.', initials: 'KA', colorKey: 'gold', role: 'owner', status: 'online', joinedAt: '2026-01-15T00:00:00Z' },
          { id: 'mem-ayo', name: 'Ayo D.', initials: 'AD', colorKey: 'teal', role: 'member', status: 'online', joinedAt: '2026-02-20T00:00:00Z' },
        ],
        projects: [
          { id: 'proj-reading', workspaceId: 'ws-growth-gang', name: 'Reading Challenge', description: '', createdAt: '2026-03-10T00:00:00Z' },
        ],
        createdAt: '2026-02-15T00:00:00Z',
      },
      {
        id: 'ws-just-me',
        name: 'Just me',
        initials: 'ME',
        colorKey: 'purple',
        members: [
          { id: 'mem-kemi', name: 'Kemi A.', initials: 'KA', colorKey: 'gold', role: 'owner', status: 'online', joinedAt: '2026-01-15T00:00:00Z' },
        ],
        projects: [],
        createdAt: '2026-03-01T00:00:00Z',
      },
    ],
    activeWorkspaceId: 'ws-soul-rebels',
    activeProjectId: 'proj-fitness',
    tasks: [
      { id: 't1', projectId: 'proj-fitness', workspaceId: 'ws-soul-rebels', title: 'Track sleep quality', status: 'idea', priority: 'low', dueDate: null, labels: ['body'], progressPercent: 0, assigneeIds: ['mem-kemi'], comments: [], createdAt: '2026-03-15T00:00:00Z', updatedAt: '2026-03-15T00:00:00Z' },
      { id: 't2', projectId: 'proj-fitness', workspaceId: 'ws-soul-rebels', title: 'Research cold exposure routine', status: 'idea', priority: 'medium', dueDate: null, labels: ['habits'], progressPercent: 0, assigneeIds: ['mem-tolu', 'mem-raj'], comments: [], createdAt: '2026-03-16T00:00:00Z', updatedAt: '2026-03-16T00:00:00Z' },
      { id: 't3', projectId: 'proj-fitness', workspaceId: 'ws-soul-rebels', title: 'Complete 30-day workout plan', status: 'active', priority: 'high', dueDate: daysFromNow(3), labels: ['body'], progressPercent: 60, assigneeIds: ['mem-kemi', 'mem-sara'], comments: [], createdAt: '2026-03-10T00:00:00Z', updatedAt: '2026-03-23T00:00:00Z' },
      { id: 't4', projectId: 'proj-fitness', workspaceId: 'ws-soul-rebels', title: 'Reduce sugar intake \u2014 log daily', status: 'active', priority: 'medium', dueDate: daysFromNow(-1), labels: ['discipline'], progressPercent: 35, assigneeIds: ['mem-tolu'], comments: [], createdAt: '2026-03-12T00:00:00Z', updatedAt: '2026-03-24T00:00:00Z' },
      { id: 't5', projectId: 'proj-fitness', workspaceId: 'ws-soul-rebels', title: 'Meal prep Sundays', status: 'active', priority: 'low', dueDate: daysFromNow(5), labels: ['habits'], progressPercent: 50, assigneeIds: ['mem-raj', 'mem-kemi'], comments: [], createdAt: '2026-03-14T00:00:00Z', updatedAt: '2026-03-22T00:00:00Z' },
      { id: 't6', projectId: 'proj-fitness', workspaceId: 'ws-soul-rebels', title: 'Set up calorie tracker', status: 'done', priority: 'low', dueDate: null, labels: [], progressPercent: 100, assigneeIds: ['mem-kemi'], comments: [], createdAt: '2026-03-05T00:00:00Z', updatedAt: '2026-03-20T00:00:00Z' },
      { id: 't7', projectId: 'proj-fitness', workspaceId: 'ws-soul-rebels', title: 'Buy resistance bands', status: 'done', priority: 'low', dueDate: null, labels: [], progressPercent: 100, assigneeIds: ['mem-tolu', 'mem-sara'], comments: [], createdAt: '2026-03-06T00:00:00Z', updatedAt: '2026-03-21T00:00:00Z' },
    ],
    activity: [
      { id: 'act1', workspaceId: 'ws-soul-rebels', authorId: 'mem-kemi', authorName: 'Kemi A.', action: 'created project', targetTitle: 'Fitness Reset', timestamp: '2026-03-01T10:00:00Z' },
      { id: 'act2', workspaceId: 'ws-soul-rebels', authorId: 'mem-tolu', authorName: 'Tolu M.', action: 'added task', targetTitle: 'Complete 30-day workout plan', timestamp: '2026-03-10T14:30:00Z' },
      { id: 'act3', workspaceId: 'ws-soul-rebels', authorId: 'mem-kemi', authorName: 'Kemi A.', action: 'completed', targetTitle: 'Set up calorie tracker', timestamp: '2026-03-20T09:15:00Z' },
      { id: 'act4', workspaceId: 'ws-soul-rebels', authorId: 'mem-sara', authorName: 'Sara L.', action: 'completed', targetTitle: 'Buy resistance bands', timestamp: '2026-03-21T16:45:00Z' },
    ],
    permissions: {
      'ws-soul-rebels': { membersCanInvite: true, viewersCanComment: false, publicWorkspace: false, showPersonalDataToTeam: false },
      'ws-growth-gang': { membersCanInvite: false, viewersCanComment: false, publicWorkspace: false, showPersonalDataToTeam: false },
      'ws-just-me': { membersCanInvite: false, viewersCanComment: false, publicWorkspace: false, showPersonalDataToTeam: false },
    },
    currentUserId: 'mem-kemi',
  };
}

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return buildSeedData();
}

/* ── slice ── */
const projectsSlice = createSlice({
  name: 'projects',
  initialState: loadInitialState(),
  reducers: {
    /* workspaces */
    addWorkspace(state, { payload }) {
      const ws = {
        id: 'ws-' + uid(),
        name: payload.name,
        initials: payload.initials || payload.name.slice(0, 2).toUpperCase(),
        colorKey: payload.colorKey || 'gold',
        members: [state.workspaces.find((w) => w.id === state.activeWorkspaceId)?.members.find((m) => m.id === state.currentUserId) || { id: state.currentUserId, name: 'You', initials: 'ME', colorKey: 'gold', role: 'owner', status: 'online', joinedAt: new Date().toISOString() }],
        projects: [],
        createdAt: new Date().toISOString(),
      };
      // ensure the copied member is owner in new workspace
      ws.members[0] = { ...ws.members[0], role: 'owner' };
      state.workspaces.push(ws);
      state.permissions[ws.id] = { membersCanInvite: false, viewersCanComment: false, publicWorkspace: false, showPersonalDataToTeam: false };
    },
    updateWorkspace(state, { payload }) {
      const ws = state.workspaces.find((w) => w.id === payload.id);
      if (ws) Object.assign(ws, payload);
    },
    deleteWorkspace(state, { payload: id }) {
      state.workspaces = state.workspaces.filter((w) => w.id !== id);
      state.tasks = state.tasks.filter((t) => t.workspaceId !== id);
      state.activity = state.activity.filter((a) => a.workspaceId !== id);
      delete state.permissions[id];
      if (state.activeWorkspaceId === id && state.workspaces.length) {
        state.activeWorkspaceId = state.workspaces[0].id;
        const p = state.workspaces[0].projects[0];
        state.activeProjectId = p ? p.id : null;
      }
    },
    setActiveWorkspace(state, { payload: id }) {
      state.activeWorkspaceId = id;
      const ws = state.workspaces.find((w) => w.id === id);
      state.activeProjectId = ws?.projects[0]?.id || null;
    },

    /* members */
    addMember(state, { payload }) {
      const ws = state.workspaces.find((w) => w.id === payload.workspaceId);
      if (ws) {
        ws.members.push({
          id: 'mem-' + uid(),
          name: payload.name || payload.email || 'New member',
          initials: (payload.name || payload.email || 'NM').slice(0, 2).toUpperCase(),
          colorKey: payload.colorKey || 'teal',
          role: payload.role || 'member',
          status: 'offline',
          joinedAt: new Date().toISOString(),
        });
      }
    },
    updateMemberRole(state, { payload }) {
      const ws = state.workspaces.find((w) => w.id === payload.workspaceId);
      const mem = ws?.members.find((m) => m.id === payload.memberId);
      if (mem) mem.role = payload.role;
    },
    removeMember(state, { payload }) {
      const ws = state.workspaces.find((w) => w.id === payload.workspaceId);
      if (ws) ws.members = ws.members.filter((m) => m.id !== payload.memberId);
    },
    updateMemberStatus(state, { payload }) {
      const ws = state.workspaces.find((w) => w.id === payload.workspaceId);
      const mem = ws?.members.find((m) => m.id === payload.memberId);
      if (mem) mem.status = payload.status;
    },

    /* projects */
    addProject(state, { payload }) {
      const ws = state.workspaces.find((w) => w.id === (payload.workspaceId || state.activeWorkspaceId));
      if (ws) {
        const p = {
          id: 'proj-' + uid(),
          workspaceId: ws.id,
          name: payload.name || 'New project',
          description: payload.description || '',
          createdAt: new Date().toISOString(),
        };
        ws.projects.push(p);
        state.activeProjectId = p.id;
      }
    },
    updateProject(state, { payload }) {
      for (const ws of state.workspaces) {
        const p = ws.projects.find((pr) => pr.id === payload.id);
        if (p) { Object.assign(p, payload); break; }
      }
    },
    deleteProject(state, { payload: id }) {
      for (const ws of state.workspaces) {
        ws.projects = ws.projects.filter((p) => p.id !== id);
      }
      state.tasks = state.tasks.filter((t) => t.projectId !== id);
      if (state.activeProjectId === id) {
        const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
        state.activeProjectId = ws?.projects[0]?.id || null;
      }
    },
    setActiveProject(state, { payload: id }) {
      state.activeProjectId = id;
    },

    /* tasks */
    addTask(state, { payload }) {
      state.tasks.push({
        id: 't-' + uid(),
        projectId: payload.projectId || state.activeProjectId,
        workspaceId: payload.workspaceId || state.activeWorkspaceId,
        title: payload.title,
        status: payload.status || 'idea',
        priority: payload.priority || 'low',
        dueDate: payload.dueDate || null,
        labels: payload.labels || [],
        progressPercent: payload.progressPercent || 0,
        assigneeIds: payload.assigneeIds || [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },
    updateTask(state, { payload }) {
      const t = state.tasks.find((tk) => tk.id === payload.id);
      if (t) {
        Object.assign(t, payload);
        t.updatedAt = new Date().toISOString();
      }
    },
    deleteTask(state, { payload: id }) {
      state.tasks = state.tasks.filter((t) => t.id !== id);
    },
    moveTask(state, { payload }) {
      const t = state.tasks.find((tk) => tk.id === payload.taskId);
      if (t) {
        t.status = payload.status;
        t.updatedAt = new Date().toISOString();
        if (payload.status === 'done') t.progressPercent = 100;
      }
    },

    /* comments */
    addComment(state, { payload }) {
      const t = state.tasks.find((tk) => tk.id === payload.taskId);
      if (t) {
        t.comments.push({
          id: 'c-' + uid(),
          taskId: payload.taskId,
          authorId: payload.authorId || state.currentUserId,
          text: payload.text,
          createdAt: new Date().toISOString(),
        });
        t.updatedAt = new Date().toISOString();
      }
    },
    deleteComment(state, { payload }) {
      const t = state.tasks.find((tk) => tk.id === payload.taskId);
      if (t) t.comments = t.comments.filter((c) => c.id !== payload.commentId);
    },

    /* activity */
    addActivityEvent(state, { payload }) {
      state.activity.push({
        id: 'act-' + uid(),
        workspaceId: payload.workspaceId || state.activeWorkspaceId,
        authorId: payload.authorId || state.currentUserId,
        authorName: payload.authorName || 'You',
        action: payload.action,
        targetTitle: payload.targetTitle,
        timestamp: new Date().toISOString(),
      });
    },

    /* permissions */
    updatePermissions(state, { payload }) {
      const wsId = payload.workspaceId || state.activeWorkspaceId;
      if (!state.permissions[wsId]) state.permissions[wsId] = {};
      Object.assign(state.permissions[wsId], payload.perms);
    },
  },
});

/* ── context ── */
const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [state, dispatch] = useReducer(projectsSlice.reducer, undefined, loadInitialState);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* full */ }
  }, [state]);

  const actions = useMemo(() => {
    const bound = {};
    for (const [key, creator] of Object.entries(projectsSlice.actions)) {
      bound[key] = (payload) => dispatch(creator(payload));
    }
    return bound;
  }, [dispatch]);

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions]);

  return React.createElement(ProjectContext.Provider, { value }, children);
}

export function useProjectStore() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjectStore must be used within ProjectProvider');
  return ctx;
}
