import React, { useState, useCallback, useEffect } from 'react';

const GrowthSystem = () => {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('sophia_growth_profile');
    return saved ? JSON.parse(saved) : {
      level: 1,
      xp: 0,
      totalXp: 0,
      streak: 0,
      achievements: [],
      nextLevelXp: 100,
    };
  });

  const addXP = useCallback((amount, source) => {
    setProfile(prev => {
      const newXp = prev.xp + amount;
      const leveledUp = newXp >= prev.nextLevelXp;
      const newProfile = {
        ...prev,
        xp: leveledUp ? newXp - prev.nextLevelXp : newXp,
        totalXp: prev.totalXp + amount,
        level: leveledUp ? prev.level + 1 : prev.level,
        nextLevelXp: leveledUp ? prev.nextLevelXp * 1.15 : prev.nextLevelXp,
      };
      localStorage.setItem('sophia_growth_profile', JSON.stringify(newProfile));
      return newProfile;
    });
  }, []);

  useEffect(() => {
    // Reward XP for daily check-in
    const lastCheckIn = localStorage.getItem('sophia_last_checkin');
    const today = new Date().toDateString();
    if (lastCheckIn !== today) {
      addXP(10, 'daily-checkin');
      localStorage.setItem('sophia_last_checkin', today);
    }
  }, [addXP]);

  const getLevel = (level) => {
    const levels = ['Seedling', 'Sprout', 'Flourishing', 'Thriving', 'Zenith', 'Legend'];
    return levels[Math.min(level - 1, levels.length - 1)];
  };

  return (
    <div style={{ padding: '0', color: '#000', background: 'transparent', paddingBottom: '40px' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '24px', color: '#000' }}>Growth</h2>

      <div style={{ background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(0,0,0,0.16)', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ fontSize: '64px', fontWeight: 'bold', color: 'var(--color-primary)', minWidth: '100px' }}>
            LVL {profile.level}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--color-primary)' }}>{getLevel(profile.level)}</p>
            <div style={{ background: 'rgba(0,0,0,0.12)', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ background: 'var(--color-primary)', height: '100%', width: `${(profile.xp / profile.nextLevelXp) * 100}%`, transition: 'width 0.3s' }} />
            </div>
            <p style={{ fontSize: '12px', color: '#888' }}>
              {Math.floor(profile.xp)} / {Math.floor(profile.nextLevelXp)} XP to next level
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(0,0,0,0.16)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <p style={{ color: '#000', fontSize: '12px', marginBottom: '8px' }}>Total XP</p>
          <p style={{ fontSize: '24px', color: '#000', fontWeight: 'bold' }}>{profile.totalXp}</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(0,0,0,0.16)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Current Streak</p>
          <p style={{ fontSize: '24px', color: '#000', fontWeight: 'bold' }}>{profile.streak}</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(0,0,0,0.16)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Achievements</p>
          <p style={{ fontSize: '24px', color: '#bb86fc', fontWeight: 'bold' }}>{profile.achievements.length}</p>
        </div>
      </div>

      {/* Quick XP Button */}
      <button
        onClick={() => addXP(25, 'manual')}
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
        }}
      >
        + 25 XP (Demo)
      </button>
    </div>
  );
};

export default GrowthSystem;