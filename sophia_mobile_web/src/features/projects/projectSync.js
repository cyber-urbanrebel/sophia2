/**
 * Project Sync Layer
 * Bridges the Projects feature with the rest of SOPHIA's data stores.
 */

/**
 * Reads incomplete habits from Sophia's habits store and creates matching
 * "idea" tasks in the active project if they don't already exist.
 */
export function syncTasksFromHabits(habitsData, projectStore) {
  if (!habitsData || !Array.isArray(habitsData)) return;
  const activeProjId = projectStore.activeProjectId;
  const activeWsId = projectStore.activeWorkspaceId;
  if (!activeProjId || !activeWsId) return;

  const existingTitles = new Set(
    projectStore.tasks
      .filter((t) => t.projectId === activeProjId)
      .map((t) => t.title.toLowerCase())
  );

  habitsData.forEach((habit) => {
    const title = habit.name || habit.title;
    if (!title) return;
    if (habit.completed || habit.done) return;
    if (existingTitles.has(title.toLowerCase())) return;

    projectStore.addTask({
      title,
      status: 'idea',
      priority: 'low',
      dueDate: null,
      assigneeIds: [],
      projectId: activeProjId,
      workspaceId: activeWsId,
    });
  });
}

/**
 * Returns 0-100 representing (done tasks / total tasks) * 100 for a project.
 */
export function computeProjectProgress(projectId, projectStore) {
  const tasks = projectStore.tasks.filter((t) => t.projectId === projectId);
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === 'done').length;
  return Math.round((done / tasks.length) * 100);
}

/**
 * Returns all tasks in the active workspace due within 48 hours
 * that are not done or archived.
 */
export function getDueSoonTasks(projectStore) {
  const now = new Date();
  const cutoff = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const wsId = projectStore.activeWorkspaceId;

  return projectStore.tasks.filter((t) => {
    if (t.workspaceId !== wsId) return false;
    if (t.status === 'done' || t.status === 'archived') return false;
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    return due <= cutoff;
  });
}

/**
 * Returns a summary object for the dashboard widget.
 */
export function getProjectsSummaryForDashboard(projectStore) {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const allTasks = projectStore.tasks;
  let totalProjects = 0;
  for (const ws of projectStore.workspaces) {
    totalProjects += ws.projects.length;
  }

  return {
    totalProjects,
    activeTasks: allTasks.filter((t) => t.status === 'active').length,
    completedThisWeek: allTasks.filter((t) => t.status === 'done' && new Date(t.updatedAt) >= weekAgo).length,
    overdueCount: allTasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done' && t.status !== 'archived').length,
  };
}
