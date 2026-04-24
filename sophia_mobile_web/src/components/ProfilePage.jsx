import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice.js';
import AvatarUpload from './AvatarUpload.jsx';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('sophia_user_profile');
    return saved ? JSON.parse(saved) : {
      name: authUser?.name || 'User',
      email: authUser?.email || 'user@example.com',
      timezone: 'UTC',
      theme: 'dark',
      goals: [],
      focusArea: '',
      joinDate: new Date().toLocaleDateString(),
    };
  });

  const [growthProfile, setGrowthProfile] = useState(() => {
    const saved = localStorage.getItem('sophia_growth_profile');
    return saved ? JSON.parse(saved) : {
      level: 1,
      totalXp: 0,
      achievements: [],
    };
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(profile);

  const achievements = [
    { id: 1, icon: '🔥', name: 'Week Warrior', description: '7-day streak achieved' },
    { id: 2, icon: '💪', name: 'Fitness First', description: 'Logged 10 workouts' },
    { id: 3, icon: '🧠', name: 'Mindful Mind', description: '30 meditation sessions' },
    { id: 4, icon: '⚡', name: 'Discipline Master', description: '30-day consistency' },
  ];

  const stats = [
    { label: 'Level', value: growthProfile.level, icon: '📈' },
    { label: 'Total XP', value: growthProfile.totalXp, icon: '⭐' },
    { label: 'Member Since', value: profile.joinDate, icon: '📅' },
    { label: 'Streak Days', value: '0', icon: '🔥' },
  ];

  const updateProfile = useCallback(() => {
    setProfile(formData);
    localStorage.setItem('sophia_user_profile', JSON.stringify(formData));
    setEditMode(false);
  }, [formData]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  return (
    <div style={{ padding: '0', color: '#fff', background: 'transparent', fontFamily: '"DM Mono", monospace', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', margin: '0', color: '#00d4ff' }}>👤 Profile</h1>
        <button
          onClick={() => setEditMode(!editMode)}
          style={{
            background: '#00d4ff',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {editMode ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {editMode ? (
        // EDIT MODE
        <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ marginTop: '0', marginBottom: '16px', color: '#00d4ff' }}>Edit Profile</h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#888', fontSize: '12px', marginBottom: '8px' }}>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                background: '#0a0a0a',
                border: '1px solid #222222',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#fff',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#888', fontSize: '12px', marginBottom: '8px' }}>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                width: '100%',
                background: '#0a0a0a',
                border: '1px solid #222222',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#fff',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#888', fontSize: '12px', marginBottom: '8px' }}>Timezone</label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              style={{
                width: '100%',
                background: '#0a0a0a',
                border: '1px solid #222222',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#fff',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            >
              <option>UTC</option>
              <option>EST</option>
              <option>CST</option>
              <option>MST</option>
              <option>PST</option>
              <option>GMT</option>
              <option>CET</option>
              <option>IST</option>
              <option>JST</option>
            </select>
          </div>

          <button
            onClick={updateProfile}
            style={{
              background: '#00d4ff',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'inherit',
              width: '100%',
            }}
          >
            Save Changes
          </button>
        </div>
      ) : (
        // VIEW MODE
        <>
          {/* User Header */}
          <div style={{ background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px 24px', marginBottom: '24px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <AvatarUpload size={100} fallbackName={profile.name} editable={true} />
            </div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#00d4ff' }}>{profile.name}</h2>
            <p style={{ margin: '0 0 4px 0', color: '#888', fontSize: '14px' }}>{profile.email}</p>
            <p style={{ margin: '0', color: '#666', fontSize: '12px' }}>Member since {profile.joinDate}</p>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {stats.map(stat => (
              <div key={stat.label} style={{ background: '#111111', border: '1px solid #222222', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '24px', margin: '0 0 8px 0' }}>{stat.icon}</p>
                <p style={{ color: '#888', fontSize: '12px', margin: '0 0 4px 0' }}>{stat.label}</p>
                <p style={{ fontSize: '18px', color: '#00d4ff', margin: '0', fontWeight: 'bold' }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Preferences */}
          <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ marginTop: '0', marginBottom: '16px', color: '#00d4ff' }}>⚙️ Preferences</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #1a1a1a' }}>
                <span style={{ color: '#ccc' }}>Timezone</span>
                <span style={{ color: '#888', fontSize: '12px' }}>{profile.timezone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #1a1a1a' }}>
                <span style={{ color: '#ccc' }}>Theme</span>
                <span style={{ color: '#888', fontSize: '12px' }}>Dark Mode</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#ccc' }}>Focus Area</span>
                <span style={{ color: '#888', fontSize: '12px' }}>{profile.focusArea || 'Not set'}</span>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#888', margin: '24px 0 12px 0' }}>🏆 Achievements</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {achievements.map(achievement => (
              <div
                key={achievement.id}
                style={{ background: '#111111', border: '1px solid #222222', borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00d4ff';
                  e.currentTarget.style.background = '#161616';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#222222';
                  e.currentTarget.style.background = '#111111';
                }}
              >
                <p style={{ fontSize: '32px', margin: '0 0 8px 0' }}>{achievement.icon}</p>
                <p style={{ margin: '0 0 4px 0', color: '#ccc', fontSize: '12px', fontWeight: 'bold' }}>{achievement.name}</p>
                <p style={{ margin: '0', color: '#888', fontSize: '10px' }}>{achievement.description}</p>
              </div>
            ))}
          </div>

          {/* Goals */}
          {profile.goals && profile.goals.length > 0 && (
            <>
              <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#888', margin: '24px 0 12px 0' }}>🎯 Your Goals</h3>
              <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: '12px', padding: '0', overflow: 'hidden' }}>
                {profile.goals.map((goal, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '16px',
                      borderBottom: index < profile.goals.length - 1 ? '1px solid #1a1a1a' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>✓</span>
                    <span style={{ color: '#ccc' }}>{goal}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Danger Zone */}
          <div style={{ background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255, 23, 68, 0.3)', borderRadius: '12px', padding: '20px', marginTop: '24px' }}>
            <h3 style={{ marginTop: '0', marginBottom: '12px', color: '#ff1744' }}>⚠️ Danger Zone</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={handleLogout}
                style={{
                  background: '#ff1744',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 'bold',
                }}
              >
                Logout
              </button>
              <button
                style={{
                  background: 'transparent',
                  color: '#ff1744',
                  border: '1px solid #ff1744',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;