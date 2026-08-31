import React, { useState, useCallback, useEffect } from 'react';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('sophia_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('sophia_notification_settings');
    return saved ? JSON.parse(saved) : {
      dailyReminders: true,
      streakAlerts: true,
      achievementNotifications: true,
      weeklyReports: true,
      time: '08:00',
    };
  });

  const addNotification = useCallback((message, type = 'info', icon = 'i️') => {
    const notification = {
      id: Date.now(),
      message,
      type, // 'success', 'warning', 'error', 'info'
      icon,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => {
      const updated = [notification, ...prev];
      localStorage.setItem('sophia_notifications', JSON.stringify(updated));
      return updated;
    });
    return notification.id;
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem('sophia_notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('sophia_notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('sophia_notification_settings', JSON.stringify(newSettings));
  }, []);

  // Auto-generate sample notifications on mount
  useEffect(() => {
    if (notifications.length === 0) {
      addNotification('🌟 Great job on your morning meditation!', 'success', '🧘');
      addNotification('💧 Remember to drink water', 'info', '💧');
      addNotification('● 5-day streak. Keep going.', 'success', '●');
    }
  }, []);

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return '#00e676';
      case 'warning': return '#ffaa00';
      case 'error': return '#ff1744';
      default: return 'var(--color-primary)';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ padding: '0', color: '#fff', background: 'transparent', fontFamily: "var(--font-plain)", paddingBottom: '40px' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--color-primary)' }}>🔔 Notifications</h2>

      {/* Unread Count Badge */}
      {unreadCount > 0 && (
        <div style={{ background: '#ff1744', color: '#fff', padding: '8px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>
          {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #222222', paddingBottom: '12px' }}>
        <button style={{ background: 'transparent', color: 'var(--color-primary)', border: 'none', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit', fontWeight: 'bold' }}>
          All ({notifications.length})
        </button>
        <button style={{ background: 'transparent', color: '#888', border: 'none', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>
          Settings
        </button>
      </div>

      {/* Notification List */}
      <div style={{ marginBottom: '20px' }}>
        {notifications.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>No notifications yet</p>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              style={{
                background: notif.read ? '#0a0a0a' : '#111111',
                border: `1px solid ${notif.read ? '#1a1a1a' : getTypeColor(notif.type)}`,
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <span style={{ fontSize: '20px' }}>{notif.icon}</span>
                <div>
                  <p style={{ color: '#fff', margin: '0 0 4px 0', fontWeight: notif.read ? 'normal' : 'bold' }}>{notif.message}</p>
                  <p style={{ color: '#888', fontSize: '12px', margin: '0' }}>
                    {new Date(notif.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissNotification(notif.id);
                }}
                style={{
                  background: 'transparent',
                  color: '#888',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '8px',
                }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Settings */}
      <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: '12px', padding: '20px', marginTop: '20px' }}>
        <h3 style={{ marginTop: '0', marginBottom: '16px', color: 'var(--color-primary)' }}>⚙️ Notification Preferences</h3>
        {[
          { key: 'dailyReminders', label: 'Daily Reminders' },
          { key: 'streakAlerts', label: 'Streak Alerts' },
          { key: 'achievementNotifications', label: 'Achievement Notifications' },
          { key: 'weeklyReports', label: 'Weekly Reports' },
        ].map(pref => (
          <label key={pref.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings[pref.key]}
              onChange={(e) => updateSettings({ ...settings, [pref.key]: e.target.checked })}
              style={{ cursor: 'pointer', width: '18px', height: '18px' }}
            />
            <span style={{ color: '#ccc' }}>{pref.label}</span>
          </label>
        ))}
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #222222' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#ccc' }}>Reminder Time:</span>
            <input
              type="time"
              value={settings.time}
              onChange={(e) => updateSettings({ ...settings, time: e.target.value })}
              style={{
                background: '#0a0a0a',
                color: 'var(--color-primary)',
                border: '1px solid #222222',
                borderRadius: '4px',
                padding: '6px 12px',
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default NotificationSystem;