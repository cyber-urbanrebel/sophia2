import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import './AdminPage.css';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'activity', label: 'Activity', icon: '📋' },
  { id: 'system', label: 'System', icon: '⚙️' },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const user = useSelector(s => s.auth.user);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [system, setSystem] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const isAdmin = user?.role === 'admin';

  const loadDashboard = useCallback(async () => {
    const data = await api.getAdminDashboard();
    setStats(data);
  }, []);

  const loadUsers = useCallback(async () => {
    const data = await api.getAdminUsers();
    setUsers(Array.isArray(data) ? data : data || []);
  }, []);

  const loadActivity = useCallback(async () => {
    const data = await api.getAdminActivity(100);
    setActivity(Array.isArray(data) ? data : []);
  }, []);

  const loadSystem = useCallback(async () => {
    const data = await api.getSystemHealth();
    setSystem(data);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    const loader =
      activeTab === 'dashboard' ? loadDashboard() :
      activeTab === 'users' ? loadUsers() :
      activeTab === 'activity' ? loadActivity() :
      activeTab === 'system' ? loadSystem() :
      Promise.resolve();
    loader.catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [activeTab, isAdmin, loadDashboard, loadUsers, loadActivity, loadSystem]);

  const handleViewUser = async (userId) => {
    setSelectedUser(userId);
    setDetailLoading(true);
    setError(null);
    try {
      const data = await api.getAdminUserDetail(userId);
      setUserDetail(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
    setUserDetail(null);
  };

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(userId);
    try {
      await api.updateUserRole(userId, newRole);
      await loadUsers();
      if (userDetail && userDetail.user?.id === userId) {
        handleViewUser(userId);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Delete user ${email}? This cannot be undone.`)) return;
    setActionLoading(userId);
    try {
      await api.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      if (selectedUser === userId) handleBackToUsers();
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="admin-denied">
          <div className="denied-icon">🔒</div>
          <h2>Admin Access Required</h2>
          <p>You don&apos;t have permission to access this page.</p>
          <button className="admin-btn-primary" onClick={() => navigate('/home')}>Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-left">
          <h1 className="admin-title">Admin Panel</h1>
          <span className="admin-badge">SOPHIA Control Center</span>
        </div>
        <div className="admin-header-right">
          <span className="admin-user-pill">👤 {user?.name || user?.email}</span>
        </div>
      </header>

      <nav className="admin-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.id); handleBackToUsers(); }}
          >
            <span className="admin-tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {error && (
        <div className="admin-error">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="admin-content">
        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" />
            <p>Loading…</p>
          </div>
        ) : activeTab === 'dashboard' ? (
          <DashboardView stats={stats} onViewUser={handleViewUser} />
        ) : activeTab === 'users' ? (
          selectedUser && userDetail ? (
            <UserDetailView
              detail={userDetail}
              loading={detailLoading}
              actionLoading={actionLoading}
              currentUserId={user?.id}
              onBack={handleBackToUsers}
              onRoleChange={handleRoleChange}
              onDelete={handleDeleteUser}
            />
          ) : (
            <UsersView
              users={users}
              currentUserId={user?.id}
              actionLoading={actionLoading}
              onRoleChange={handleRoleChange}
              onDelete={handleDeleteUser}
              onViewUser={handleViewUser}
            />
          )
        ) : activeTab === 'activity' ? (
          <ActivityView activity={activity} />
        ) : (
          <SystemView system={system} />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Dashboard View
   ═══════════════════════════════════════════ */
function DashboardView({ stats, onViewUser }) {
  if (!stats) return <p className="admin-empty">No data available</p>;

  const s = stats.stats || {};
  const cards = [
    { label: 'Total Users', value: s.totalUsers ?? 0, icon: '👤', color: '#a855f7' },
    { label: 'Habits', value: s.totalHabits ?? 0, icon: '🎯', color: '#22d3ee' },
    { label: 'Tasks', value: s.totalTasks ?? 0, icon: '✅', color: '#3b82f6' },
    { label: 'Journal Entries', value: s.totalJournalEntries ?? 0, icon: '📝', color: '#f59e0b' },
    { label: 'Goals', value: s.totalGoals ?? 0, icon: '🏆', color: '#10b981' },
  ];

  return (
    <div className="dashboard-view">
      <div className="stat-cards-grid">
        {cards.map(card => (
          <div className="admin-stat-card" key={card.label} style={{ '--accent': card.color }}>
            <div className="asc-icon">{card.icon}</div>
            <div className="asc-value">{card.value}</div>
            <div className="asc-label">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="admin-section">
        <h3 className="admin-section-title">Recent Users</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th><th>Level</th><th>Joined</th><th></th>
              </tr>
            </thead>
            <tbody>
              {(stats.recentUsers || []).map(u => (
                <tr key={u.id || u.email}>
                  <td className="td-name">{u.fullName || '—'}</td>
                  <td>{u.email}</td>
                  <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                  <td>Lv {u.level}</td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                  <td>
                    {u.id && <button className="admin-btn-small view" onClick={() => onViewUser(u.id)}>View →</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Users List View
   ═══════════════════════════════════════════ */
function UsersView({ users, currentUserId, actionLoading, onRoleChange, onDelete, onViewUser }) {
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);

  const filtered = (Array.isArray(users) ? users : []).filter(u =>
    (u.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleExportAll = async () => {
    setExporting(true);
    try { await api.downloadAdminCSV('users'); }
    catch (e) { alert('Export failed: ' + e.message); }
    finally { setExporting(false); }
  };

  return (
    <div className="users-view">
      <div className="users-toolbar">
        <input
          className="admin-search"
          type="text"
          placeholder="Search users by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="users-count">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
        <button className="admin-btn-small csv" onClick={handleExportAll} disabled={exporting}>
          {exporting ? '⏳ Exporting…' : '📥 Export All CSV'}
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th><th>Email</th><th>Role</th><th>Level</th><th>XP</th><th>Joined</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const isSelf = u.id === currentUserId;
              const isLoading = actionLoading === u.id;
              return (
                <tr key={u.id || u.email} className={isSelf ? 'row-self' : ''}>
                  <td className="td-name">
                    <div className="user-cell">
                      <img className="user-avatar" src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`} alt="" />
                      <span>{u.fullName || '—'}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                  <td>Lv {u.level}</td>
                  <td>{u.experience ?? 0} XP</td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="td-actions">
                    {u.id && (
                      <button className="admin-btn-small view" onClick={() => onViewUser(u.id)}>View</button>
                    )}
                    {isSelf ? (
                      <span className="self-label">You</span>
                    ) : isLoading ? (
                      <div className="admin-spinner small" />
                    ) : (
                      <>
                        <button
                          className="admin-btn-small"
                          onClick={() => onRoleChange(u.id, u.role === 'admin' ? 'user' : 'admin')}
                        >
                          {u.role === 'admin' ? '⬇ Demote' : '⬆ Promote'}
                        </button>
                        <button className="admin-btn-small danger" onClick={() => onDelete(u.id, u.email)}>🗑</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="admin-empty">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   User Detail Drill-Down View
   ═══════════════════════════════════════════ */
function UserDetailView({ detail, loading, actionLoading, currentUserId, onBack, onRoleChange, onDelete }) {
  const [detailTab, setDetailTab] = useState('overview');
  const [exporting, setExporting] = useState(false);

  const handleExportUser = async (userId) => {
    setExporting(true);
    try { await api.downloadAdminCSV('user', userId); }
    catch (e) { alert('Export failed: ' + e.message); }
    finally { setExporting(false); }
  };

  if (loading || !detail) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <p>Loading user details…</p>
      </div>
    );
  }

  const u = detail.user || {};
  const sum = detail.summary || {};
  const isSelf = u.id === currentUserId;

  const detailTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'habits', label: `Habits (${sum.totalHabits || 0})` },
    { id: 'tasks', label: `Tasks (${sum.totalTasks || 0})` },
    { id: 'goals', label: `Goals (${sum.totalGoals || 0})` },
    { id: 'journal', label: `Journal (${sum.journalEntries || 0})` },
    { id: 'study', label: `Study (${sum.studySessions || 0})` },
  ];

  return (
    <div className="user-detail-view">
      <button className="admin-back-btn" onClick={onBack}>← Back to Users</button>

      {/* User Profile Header */}
      <div className="user-detail-header">
        <img className="user-detail-avatar" src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`} alt="" />
        <div className="user-detail-info">
          <h2 className="user-detail-name">{u.fullName || '—'}</h2>
          <p className="user-detail-email">{u.email}</p>
          <div className="user-detail-badges">
            <span className={`role-badge role-${u.role}`}>{u.role}</span>
            <span className="level-badge">Lv {u.level} • {u.experience ?? 0} XP</span>
            <span className="date-badge">Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</span>
          </div>
        </div>
        <div className="user-detail-actions">
          <button
            className="admin-btn-small csv"
            disabled={exporting}
            onClick={() => handleExportUser(u.id)}
          >
            {exporting ? '⏳ Exporting…' : '📥 Export CSV'}
          </button>
          {!isSelf && (
            <>
              <button
                className="admin-btn-small"
                disabled={actionLoading === u.id}
                onClick={() => onRoleChange(u.id, u.role === 'admin' ? 'user' : 'admin')}
              >
                {u.role === 'admin' ? '⬇ Demote' : '⬆ Promote'}
              </button>
              <button
                className="admin-btn-small danger"
                disabled={actionLoading === u.id}
                onClick={() => onDelete(u.id, u.email)}
              >
                🗑 Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="user-summary-grid">
        <div className="user-summary-card"><span className="usc-icon">🎯</span><span className="usc-val">{sum.totalHabits || 0}</span><span className="usc-lbl">Habits ({sum.activeHabits || 0} active)</span></div>
        <div className="user-summary-card"><span className="usc-icon">✅</span><span className="usc-val">{sum.totalTasks || 0}</span><span className="usc-lbl">Tasks ({sum.completedTasks || 0} done)</span></div>
        <div className="user-summary-card"><span className="usc-icon">🏆</span><span className="usc-val">{sum.totalGoals || 0}</span><span className="usc-lbl">Goals ({sum.activeGoals || 0} active)</span></div>
        <div className="user-summary-card"><span className="usc-icon">📝</span><span className="usc-val">{sum.journalEntries || 0}</span><span className="usc-lbl">Journal Entries</span></div>
        <div className="user-summary-card"><span className="usc-icon">📚</span><span className="usc-val">{sum.studySessions || 0}</span><span className="usc-lbl">Study Sessions</span></div>
      </div>

      {/* Detail Sub-tabs */}
      <nav className="detail-tabs">
        {detailTabs.map(t => (
          <button key={t.id} className={`detail-tab ${detailTab === t.id ? 'active' : ''}`} onClick={() => setDetailTab(t.id)}>{t.label}</button>
        ))}
      </nav>

      {/* Detail Content */}
      <div className="detail-content">
        {detailTab === 'overview' && <UserOverview detail={detail} />}
        {detailTab === 'habits' && <DataTable data={detail.habits || []} columns={habitColumns} emptyMsg="No habits created yet" />}
        {detailTab === 'tasks' && <DataTable data={detail.tasks || []} columns={taskColumns} emptyMsg="No tasks created yet" />}
        {detailTab === 'goals' && <DataTable data={detail.goals || []} columns={goalColumns} emptyMsg="No goals created yet" />}
        {detailTab === 'journal' && <DataTable data={detail.journal || []} columns={journalColumns} emptyMsg="No journal entries yet" />}
        {detailTab === 'study' && <DataTable data={detail.studySessions || []} columns={studyColumns} emptyMsg="No study sessions yet" />}
      </div>
    </div>
  );
}

/* ─── User Overview (inside detail) ─── */
function UserOverview({ detail }) {
  const tasks = detail.tasks || [];
  const habits = detail.habits || [];
  const goals = detail.goals || [];
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.completed_at).length;
  const taskRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const activeHabits = habits.filter(h => h.is_active).length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.longest_streak || 0), 0);

  return (
    <div className="user-overview">
      <div className="overview-grid">
        <div className="overview-card">
          <h4>Task Completion</h4>
          <div className="overview-bar-wrap">
            <div className="overview-bar" style={{ width: `${taskRate}%` }} />
          </div>
          <span className="overview-pct">{taskRate}% ({completedTasks}/{tasks.length})</span>
        </div>
        <div className="overview-card">
          <h4>Active Habits</h4>
          <div className="overview-big-num">{activeHabits}</div>
          <span className="overview-sub">Best streak: {bestStreak} days</span>
        </div>
        <div className="overview-card">
          <h4>Goals Progress</h4>
          <div className="overview-big-num">{goals.filter(g => g.status === 'active').length} active</div>
          <span className="overview-sub">{goals.filter(g => g.status === 'completed').length} completed</span>
        </div>
      </div>

      {/* Recent activity timeline */}
      <h4 style={{ margin: '20px 0 12px', color: '#c9a84c' }}>Recent Items</h4>
      <div className="recent-items-list">
        {tasks.slice(0, 5).map(t => (
          <div className="recent-item" key={t.id}>
            <span className="ri-icon">✅</span>
            <span className="ri-text">{t.title}</span>
            <span className={`ri-status status-${t.status || 'todo'}`}>{t.status || 'todo'}</span>
            <span className="ri-date">{fmtDate(t.created_at)}</span>
          </div>
        ))}
        {habits.slice(0, 5).map(h => (
          <div className="recent-item" key={h.id}>
            <span className="ri-icon">🎯</span>
            <span className="ri-text">{h.name}</span>
            <span className="ri-status">{h.is_active ? 'active' : 'paused'}</span>
            <span className="ri-date">{fmtDate(h.created_at)}</span>
          </div>
        ))}
        {tasks.length === 0 && habits.length === 0 && <p className="admin-empty">No activity recorded yet</p>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Activity Feed View
   ═══════════════════════════════════════════ */
function ActivityView({ activity }) {
  const [filter, setFilter] = useState('all');
  const types = ['all', 'task', 'habit', 'journal', 'goal'];
  const typeIcons = { task: '✅', habit: '🎯', journal: '📝', goal: '🏆' };

  const filtered = filter === 'all' ? activity : activity.filter(a => a.type === filter);

  return (
    <div className="activity-view">
      <div className="activity-toolbar">
        {types.map(t => (
          <button key={t} className={`filter-btn ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
            {t === 'all' ? '📋 All' : `${typeIcons[t]} ${t.charAt(0).toUpperCase() + t.slice(1)}s`}
          </button>
        ))}
        <span className="activity-count">{filtered.length} items</span>
      </div>

      <div className="activity-feed">
        {filtered.length === 0 ? (
          <p className="admin-empty">No activity recorded yet</p>
        ) : filtered.map((item, i) => (
          <div className="activity-item" key={`${item.type}-${item.id}-${i}`}>
            <span className="ai-icon">{typeIcons[item.type] || '📌'}</span>
            <div className="ai-body">
              <div className="ai-top">
                <span className="ai-name">{item.userName || 'Unknown'}</span>
                <span className="ai-email">{item.userEmail}</span>
                <span className={`ai-type type-${item.type}`}>{item.type}</span>
              </div>
              <div className="ai-title">{item.title || item.name || item.content?.slice(0, 80) || '(no title)'}</div>
              {item.status && <span className={`ri-status status-${item.status}`}>{item.status}</span>}
            </div>
            <span className="ai-date">{fmtDate(item.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   System View
   ═══════════════════════════════════════════ */
function SystemView({ system }) {
  if (!system) return <p className="admin-empty">No system data</p>;

  const items = [
    { label: 'Uptime', value: system.uptimeFormatted, icon: '⏱' },
    { label: 'Node.js', value: system.nodeVersion, icon: '🟢' },
    { label: 'Platform', value: system.platform, icon: '💻' },
    { label: 'Environment', value: system.env, icon: '🌐' },
    { label: 'Heap Used', value: system.memory?.heapUsed, icon: '📦' },
    { label: 'Heap Total', value: system.memory?.heapTotal, icon: '📦' },
    { label: 'RSS', value: system.memory?.rss, icon: '📦' },
  ];

  return (
    <div className="system-view">
      <div className="system-grid">
        {items.map(item => (
          <div className="system-card" key={item.label}>
            <span className="system-card-icon">{item.icon}</span>
            <div>
              <div className="system-card-value">{item.value || '—'}</div>
              <div className="system-card-label">{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Reusable Data Table
   ═══════════════════════════════════════════ */
const habitColumns = [
  { key: 'name', label: 'Name' },
  { key: 'frequency', label: 'Frequency' },
  { key: 'streak', label: 'Streak' },
  { key: 'longest_streak', label: 'Best' },
  { key: 'is_active', label: 'Active', render: v => v ? '✅' : '❌' },
  { key: 'created_at', label: 'Created', render: fmtDate },
];
const taskColumns = [
  { key: 'title', label: 'Title' },
  { key: 'status', label: 'Status', render: v => <span className={`ri-status status-${v || 'todo'}`}>{v || 'todo'}</span> },
  { key: 'priority', label: 'Priority', render: v => ['—','🔴','🟡','🟢','⚪'][v] || v },
  { key: 'due_date', label: 'Due', render: fmtDate },
  { key: 'created_at', label: 'Created', render: fmtDate },
];
const goalColumns = [
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status', render: v => <span className={`ri-status status-${v || 'active'}`}>{v || 'active'}</span> },
  { key: 'progress_percentage', label: 'Progress', render: v => `${v || 0}%` },
  { key: 'created_at', label: 'Created', render: fmtDate },
];
const journalColumns = [
  { key: 'title', label: 'Title', render: (v, row) => v || (row.content?.slice(0, 60) + '…') || '—' },
  { key: 'mood', label: 'Mood' },
  { key: 'created_at', label: 'Date', render: fmtDate },
];
const studyColumns = [
  { key: 'subject', label: 'Subject', render: (v, row) => v || row.topic || '—' },
  { key: 'duration', label: 'Duration (min)', render: v => v || '—' },
  { key: 'created_at', label: 'Date', render: fmtDate },
];

function DataTable({ data, columns, emptyMsg }) {
  if (!data || data.length === 0) return <p className="admin-empty">{emptyMsg}</p>;

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i}>
              {columns.map(c => (
                <td key={c.key}>{c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Helpers ─── */
function fmtDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return d; }
}
