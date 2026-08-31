import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signOutUser } from '../services/session.js';
import AvatarUpload from './AvatarUpload.jsx';
import {
  FlameIcon,
  BodyFitIcon,
  MeditationIcon,
  LightningIcon,
  TrendUpIcon,
  TargetIcon,
  SunriseIcon,
} from './SophiaIcons.jsx';

const glass = {
  background: 'rgba(255, 255, 255, 0.78)',
  border: '1px solid rgba(0, 0, 0, 0.16)',
  borderRadius: 16,
  color: '#000',
};

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    { id: 1, icon: <FlameIcon size={36} />, name: 'Week Warrior', description: 'Seven days in a row' },
    { id: 2, icon: <BodyFitIcon size={36} />, name: 'Fitness First', description: 'Ten workouts logged' },
    { id: 3, icon: <MeditationIcon size={36} />, name: 'Mindful Mind', description: 'Thirty quiet sessions' },
    { id: 4, icon: <LightningIcon size={36} />, name: 'Discipline Master', description: 'Thirty days of follow-through' },
  ];

  const stats = [
    { label: 'Level', value: growthProfile.level, icon: <TrendUpIcon size={28} /> },
    { label: 'Total XP', value: growthProfile.totalXp, icon: <TargetIcon size={28} /> },
    { label: 'Member since', value: profile.joinDate, icon: <SunriseIcon size={28} /> },
    { label: 'Streak days', value: '0', icon: <FlameIcon size={28} /> },
  ];

  const updateProfile = useCallback(() => {
    setProfile(formData);
    localStorage.setItem('sophia_user_profile', JSON.stringify(formData));
    setEditMode(false);
  }, [formData]);

  const handleLogout = useCallback(() => {
    void signOutUser(dispatch, navigate);
  }, [dispatch, navigate]);

  return (
    <div style={{ padding: '0', color: '#000', background: 'transparent', paddingBottom: '96px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', margin: '0', color: '#000' }}>You</h1>
        <button
          onClick={() => setEditMode(!editMode)}
          style={{
            background: 'var(--color-primary)',
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
        <div style={{ ...glass, padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ marginTop: '0', marginBottom: '16px', color: '#000' }}>Edit profile</h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#888', fontSize: '12px', marginBottom: '8px' }}>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.2)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#000',
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
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.2)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#000',
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
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.2)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#000',
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
              background: 'var(--color-primary)',
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
          <div style={{ ...glass, padding: '32px 24px', marginBottom: '24px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <AvatarUpload size={100} fallbackName={profile.name} editable={true} />
            </div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#000' }}>{profile.name}</h2>
            <p style={{ margin: '0 0 4px 0', color: '#1a1a1a', fontSize: '16px', fontFamily: 'var(--font-display)' }}>{profile.email}</p>
            <p style={{ margin: '0', color: '#1a1a1a', fontSize: '14px' }}>Member since {profile.joinDate}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {stats.map(stat => (
              <div key={stat.label} style={{ ...glass, padding: '16px', textAlign: 'center' }}>
                <div style={{ margin: '0 0 8px 0', display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
                <p style={{ color: '#000', fontSize: '13px', margin: '0 0 4px 0', fontFamily: 'var(--font-display)' }}>{stat.label}</p>
                <p style={{ fontSize: '18px', color: '#000', margin: '0', fontWeight: 'bold' }}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div style={{ ...glass, padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ marginTop: '0', marginBottom: '16px', color: '#000' }}>Preferences</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
                <span style={{ color: '#000' }}>Timezone</span>
                <span style={{ color: '#000', fontSize: '14px', fontFamily: 'var(--font-display)' }}>{profile.timezone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
                <span style={{ color: '#000' }}>Atmosphere</span>
                <span style={{ color: '#000', fontSize: '14px', fontFamily: 'var(--font-display)' }}>Calm HUD</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#000' }}>Focus</span>
                <span style={{ color: '#000', fontSize: '14px', fontFamily: 'var(--font-display)' }}>{profile.focusArea || 'Not set'}</span>
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: '20px', color: '#000', margin: '24px 0 12px 0' }}>Achievements</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {achievements.map(achievement => (
              <div
                key={achievement.id}
                style={{ ...glass, padding: '18px 14px', textAlign: 'center' }}
              >
                <div style={{ margin: '0 0 10px 0', display: 'flex', justifyContent: 'center' }}>{achievement.icon}</div>
                <p style={{ margin: '0 0 6px 0', color: '#000', fontSize: '15px' }}>{achievement.name}</p>
                <p style={{ margin: '0', color: '#1a1a1a', fontSize: '13px', fontFamily: 'var(--font-display)' }}>{achievement.description}</p>
              </div>
            ))}
          </div>

          {profile.goals && profile.goals.length > 0 && (
            <>
              <h3 style={{ fontSize: '20px', color: '#000', margin: '24px 0 12px 0' }}>Your goals</h3>
              <div style={{ ...glass, padding: '0', overflow: 'hidden' }}>
                {profile.goals.map((goal, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '16px',
                      borderBottom: index < profile.goals.length - 1 ? '1px solid rgba(0,0,0,0.12)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <span style={{ color: '#000' }}>{goal}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ ...glass, padding: '20px', marginTop: '24px' }}>
            <h3 style={{ marginTop: '0', marginBottom: '12px', color: '#000' }}>Sign out</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: 'var(--color-primary)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 'bold',
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;