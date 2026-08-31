import React, { useState, useEffect } from 'react';

const AdvancedAnalytics = () => {
  const [stats, setStats] = useState({
    totalUsers: 2847,
    dailyActiveUsers: 412,
    weeklyActiveUsers: 1205,
    averageSessionTime: 23,
    retentionRate: 78,
    topFeatures: [
      { name: 'Habits', usage: 45 },
      { name: 'Journal', usage: 28 },
      { name: 'Progress', usage: 18 },
      { name: 'Analytics', usage: 9 },
    ],
  });

  const [timeRange, setTimeRange] = useState('week');

  // Simple SVG line chart data
  const chartData = [
    { day: 'Mon', value: 240 },
    { day: 'Tue', value: 380 },
    { day: 'Wed', value: 290 },
    { day: 'Thu', value: 420 },
    { day: 'Fri', value: 510 },
    { day: 'Sat', value: 480 },
    { day: 'Sun', value: 390 },
  ];

  const maxValue = Math.max(...chartData.map(d => d.value));
  const chartWidth = 400;
  const chartHeight = 200;

  // Generate line path
  const points = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - (d.value / maxValue) * (chartHeight - 40) - 20;
    return `${x},${y}`;
  }).join(' ');

  const heatmapData = Array(5).fill(null).map(() =>
    Array(7).fill(null).map(() => Math.floor(Math.random() * 10))
  );

  const getHeatmapColor = (value) => {
    const intensity = (value / 10) * 100;
    if (intensity === 0) return '#1a1a1a';
    if (intensity < 25) return '#162a2a';
    if (intensity < 50) return '#0d4d4d';
    if (intensity < 75) return '#009999';
    return 'var(--color-primary)';
  };

  return (
    <div style={{ padding: '24px', color: '#fff', background: '#0a0a0a', minHeight: '100vh', fontFamily: "var(--font-plain)", paddingBottom: '100px' }}>
      <h1 style={{ fontSize: '28px', margin: '0 0 24px 0', color: 'var(--color-primary)' }}>📊 Admin Analytics</h1>

      {/* Time Range Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #222222', paddingBottom: '12px' }}>
        {['day', 'week', 'month', 'all'].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            style={{
              background: timeRange === range ? 'var(--color-primary)' : 'transparent',
              color: timeRange === range ? '#000' : '#888',
              border: `1px solid ${timeRange === range ? 'var(--color-primary)' : '#333'}`,
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: timeRange === range ? 'bold' : 'normal',
            }}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: '12px', padding: '20px' }}>
          <p style={{ color: '#888', fontSize: '12px', margin: '0 0 8px 0' }}>Total Users</p>
          <p style={{ fontSize: '32px', color: 'var(--color-primary)', margin: '0', fontWeight: 'bold' }}>{stats.totalUsers.toLocaleString()}</p>
          <p style={{ color: '#00e676', fontSize: '12px', margin: '8px 0 0 0' }}>↑ 12% from last month</p>
        </div>

        <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: '12px', padding: '20px' }}>
          <p style={{ color: '#888', fontSize: '12px', margin: '0 0 8px 0' }}>Daily Active</p>
          <p style={{ fontSize: '32px', color: 'var(--color-primary)', margin: '0', fontWeight: 'bold' }}>{stats.dailyActiveUsers}</p>
          <p style={{ color: '#00e676', fontSize: '12px', margin: '8px 0 0 0' }}>↑ 8% today</p>
        </div>

        <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: '12px', padding: '20px' }}>
          <p style={{ color: '#888', fontSize: '12px', margin: '0 0 8px 0' }}>Weekly Active</p>
          <p style={{ fontSize: '32px', color: 'var(--color-primary)', margin: '0', fontWeight: 'bold' }}>{stats.weeklyActiveUsers}</p>
          <p style={{ color: '#00e676', fontSize: '12px', margin: '8px 0 0 0' }}>↑ 5% this week</p>
        </div>

        <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: '12px', padding: '20px' }}>
          <p style={{ color: '#888', fontSize: '12px', margin: '0 0 8px 0' }}>Retention</p>
          <p style={{ fontSize: '32px', color: '#00e676', margin: '0', fontWeight: 'bold' }}>{stats.retentionRate}%</p>
          <p style={{ color: '#ffaa00', fontSize: '12px', margin: '8px 0 0 0' }}>→ Stable</p>
        </div>
      </div>

      {/* Activity Trend Chart */}
      <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ marginTop: '0', marginBottom: '16px', color: 'var(--color-primary)' }}>Daily Active Users (7-day trend)</h3>
        <svg width={chartWidth} height={chartHeight} style={{ width: '100%', maxWidth: '100%' }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((percent, i) => {
            const y = chartHeight - percent * (chartHeight - 40) - 20;
            return (
              <g key={`grid-${i}`}>
                <line x1="20" y1={y} x2={chartWidth - 20} y2={y} stroke="#222222" strokeWidth="1" strokeDasharray="4" />
                <text x="5" y={y + 4} fontSize="9" fill="#666">{Math.round(percent * maxValue)}</text>
              </g>
            );
          })}

          {/* Line chart */}
          <polyline points={points} fill="none" stroke="var(--color-primary)" strokeWidth="2" />

          {/* Data points */}
          {chartData.map((d, i) => {
            const x = (i / (chartData.length - 1)) * (chartWidth - 40) + 20;
            const y = chartHeight - (d.value / maxValue) * (chartHeight - 40) - 20;
            return (
              <g key={`dot-${i}`}>
                <circle cx={x} cy={y} r="4" fill="var(--color-primary)" />
                <text x={x} y={chartHeight - 5} fontSize="10" textAnchor="middle" fill="#888">{d.day}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Top Features */}
        <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ marginTop: '0', marginBottom: '16px', color: 'var(--color-primary)' }}>✦ Top Features</h3>
          {stats.topFeatures.map(feature => (
            <div key={feature.name} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#ccc', fontSize: '14px' }}>{feature.name}</span>
                <span style={{ color: '#888', fontSize: '12px' }}>{feature.usage}%</span>
              </div>
              <div style={{ background: '#0a0a0a', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--color-primary)', height: '100%', width: `${feature.usage}%`, transition: 'width 0.3s' }} />
              </div>
            </div>
          ))}
        </div>

        {/* System Health */}
        <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ marginTop: '0', marginBottom: '16px', color: 'var(--color-primary)' }}>⚙️ System Health</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #1a1a1a' }}>
              <span style={{ color: '#ccc' }}>API Status</span>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00e676' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #1a1a1a' }}>
              <span style={{ color: '#ccc' }}>Database</span>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00e676' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #1a1a1a' }}>
              <span style={{ color: '#ccc' }}>Cache (Redis)</span>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffaa00' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#ccc' }}>Storage</span>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00e676' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ marginTop: '0', marginBottom: '16px', color: 'var(--color-primary)' }}>● Activity Heatmap (Last 5 Weeks)</h3>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {heatmapData.map((week, weekIndex) => (
            <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    background: getHeatmapColor(day),
                    border: '1px solid #222222',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  title={`Activity: ${day}/10`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Error Log */}
      <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ marginTop: '0', marginBottom: '16px', color: 'var(--color-primary)' }}>📋 Recent Errors</h3>
        <div style={{ background: '#0a0a0a', padding: '12px', borderRadius: '8px' }}>
          <p style={{ color: '#888', fontSize: '12px', margin: '0' }}>No critical errors in the last 24 hours. System running smoothly! ✓</p>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;