import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signOutUser } from '../services/session.js';
import { toggleAutoSave, toggleDarkMode, toggleNotifications } from '../store/slices/settingsSlice.js';
import exportService from '../services/export.js';
import styles from '../styles/Profile.module.css';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { darkMode, notifications, autoSave } = useSelector((state) => state.settings);

  // Mock data - in real app, this would come from backend
  const mockUserData = {
    habits: [
      { name: 'Morning Exercise', streak: 5, completedToday: true, longestStreak: 12 },
      { name: 'Read 30 mins', streak: 3, completedToday: false, longestStreak: 8 }
    ],
    goals: [
      { title: 'Learn React', category: 'personal_growth', progressPercentage: 75, status: 'active' },
      { title: 'Run 5K daily', category: 'health', progressPercentage: 100, status: 'completed' }
    ],
    journal: {
      totalEntries: 15,
      avgSentiment: 0.3,
      topTags: [
        { tag: 'gratitude', count: 8 },
        { tag: 'reflection', count: 5 }
      ]
    },
    study: {
      totalSessions: 12,
      totalMinutes: 480,
      avgMinutes: 40,
      topTechniques: [
        { technique: 'Pomodoro', count: 8 },
        { technique: 'Active Recall', count: 4 }
      ]
    }
  };

  const handleLogout = () => {
    void signOutUser(dispatch, navigate);
  };

  const handleExportWeekly = () => {
    exportService.generateWeeklyReport(mockUserData);
  };

  const handleExportMonthly = () => {
    exportService.generateMonthlyReport(mockUserData);
  };

  const handleExportHabits = () => {
    exportService.exportHabitsCSV(mockUserData.habits);
  };

  const handleExportGoals = () => {
    exportService.exportGoalsCSV(mockUserData.goals);
  };

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.avatar} aria-hidden="true">
          <span className={styles.initials}>SM</span>
        </div>
        <div className={styles.details}>
          <div className={styles.name}>{user.name}</div>
          <div className={styles.role}>{user.role}</div>
          <div className={styles.school}>{user.school}</div>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statValue}>247</div>
          <div className={styles.statLabel}>chats</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>84</div>
          <div className={styles.statLabel}>files</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>1.2k</div>
          <div className={styles.statLabel}>tokens/day</div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>EXPORT & REPORTS</div>
        <div className={styles.exportSection}>
          <button className={`${styles.exportButton} ${styles.exportPdf}`} onClick={handleExportWeekly}>
            📊 Generate Weekly Report
          </button>
          <button className={`${styles.exportButton} ${styles.exportPdf}`} onClick={handleExportMonthly}>
            📈 Generate Monthly Summary
          </button>
          <button className={`${styles.exportButton} ${styles.exportCsv}`} onClick={handleExportHabits}>
            📋 Export Habits Data
          </button>
          <button className={`${styles.exportButton} ${styles.exportCsv}`} onClick={handleExportGoals}>
            🎯 Export Goals Data
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>PREFERENCES</div>
        <div className={styles.settingRow}>
          <div>
            <div className={styles.settingTitle}>☾ Dark Mode</div>
            <div className={styles.settingSubtitle}>VS Code theme</div>
          </div>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => dispatch(toggleDarkMode())}
            />
            <span className={styles.slider} />
          </label>
        </div>
        <div className={styles.settingRow}>
          <div>
            <div className={styles.settingTitle}>🔔 Notifications</div>
            <div className={styles.settingSubtitle}>Toggle on/off</div>
          </div>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => dispatch(toggleNotifications())}
            />
            <span className={styles.slider} />
          </label>
        </div>
        <div className={styles.settingRow}>
          <div>
            <div className={styles.settingTitle}>💾 Auto-Save Files</div>
            <div className={styles.settingSubtitle}>Every 30s</div>
          </div>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={autoSave}
              onChange={() => dispatch(toggleAutoSave())}
            />
            <span className={styles.slider} />
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>ACCOUNT</div>
        <div className={styles.accountRow}>
          <div>
            <div className={styles.settingTitle}>🔑 Security</div>
            <div className={styles.settingSubtitle}>2FA enabled</div>
          </div>
          <div className={styles.chevron}>›</div>
        </div>
        <div className={styles.accountRow}>
          <div>
            <div className={styles.settingTitle}>👤 Edit Profile</div>
            <div className={styles.settingSubtitle}>{user.email}</div>
          </div>
          <div className={styles.chevron}>›</div>
        </div>
        <div className={styles.accountRow}>
          <div>
            <div className={styles.settingTitle}>⭐ Upgrade to Pro</div>
            <div className={styles.settingSubtitle}>Unlimited tokens</div>
          </div>
          <div className={styles.chevron}>›</div>
        </div>
      </div>

      <button type="button" className={styles.signOut} onClick={handleLogout}>
        Sign Out
      </button>
    </div>
  );
}
