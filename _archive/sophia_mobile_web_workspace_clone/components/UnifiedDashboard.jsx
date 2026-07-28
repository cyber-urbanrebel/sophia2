import React, { useState, useMemo } from 'react';
import BodySection from './BodySection.jsx';
import MindSection from './MindSection.jsx';
import DisciplineSection from './DisciplineSection.jsx';
import ProgressSection from './ProgressSection.jsx';

const UnifiedDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedView, setExpandedView] = useState(false);

  const sections = [
    { id: 'body', label: '💪 Body', component: BodySection, icon: '🏋️' },
    { id: 'mind', label: '🧠 Mind', component: MindSection, icon: '🎯' },
    { id: 'discipline', label: '⚡ Discipline', component: DisciplineSection, icon: '📋' },
    { id: 'progress', label: '📈 Progress', component: ProgressSection, icon: '🚀' },
  ];

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      color: '#fff',
      padding: '20px',
      fontFamily: 'monospace',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '24px',
        paddingBottom: '20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 'bold' }}>
          ✨ SOPHIA - Unified Dashboard
        </h1>
        <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
          All your life systems integrated in one place
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '24px',
      }}>
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            style={{
              padding: '12px 16px',
              background: activeSection === section.id 
                ? 'rgba(88, 166, 255, 0.2)' 
                : 'rgba(255, 255, 255, 0.05)',
              border: activeSection === section.id 
                ? '2px solid #58a6ff' 
                : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: activeSection === section.id ? '#58a6ff' : '#fff',
              cursor: 'pointer',
              fontWeight: activeSection === section.id ? 'bold' : 'normal',
              transition: 'all 0.3s ease',
              fontSize: '13px',
              fontFamily: 'monospace',
            }}
          >
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>{section.icon}</div>
            {section.label}
          </button>
        ))}
      </div>

      {/* View Toggle */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        justifyContent: 'flex-end',
      }}>
        <button
          onClick={() => setExpandedView(false)}
          style={{
            padding: '8px 16px',
            background: !expandedView ? 'rgba(88, 166, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: !expandedView ? '1px solid #58a6ff' : '1px solid rgba(255, 255, 255, 0.2)',
            color: !expandedView ? '#58a6ff' : '#aaa',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: 'monospace',
          }}
        >
          📱 Focused View
        </button>
        <button
          onClick={() => setExpandedView(true)}
          style={{
            padding: '8px 16px',
            background: expandedView ? 'rgba(88, 166, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: expandedView ? '1px solid #58a6ff' : '1px solid rgba(255, 255, 255, 0.2)',
            color: expandedView ? '#58a6ff' : '#aaa',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: 'monospace',
          }}
        >
          🖥️ Expanded View
        </button>
      </div>

      {/* Content Area */}
      <div style={{
        background: 'rgba(22, 27, 34, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '24px',
        backdropFilter: 'blur(10px)',
        maxHeight: expandedView ? 'calc(100vh - 280px)' : 'auto',
        overflowY: expandedView ? 'auto' : 'visible',
        overflowX: 'hidden',
      }}>
        {currentSection && (
          <div key={currentSection.id}>
            <h2 style={{
              margin: '0 0 20px 0',
              fontSize: '20px',
              color: '#58a6ff',
              paddingBottom: '12px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              {currentSection.label}
            </h2>
            <currentSection.component />
          </div>
        )}
      </div>

      {/* Quick Stats Footer */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        marginTop: '24px',
      }}>
        {[
          { label: '💪 Strength', value: 'Active', color: '#58a6ff' },
          { label: '🧠 Focus', value: 'Sharp', color: '#3fb950' },
          { label: '⚡ Energy', value: 'High', color: '#d2a8ff' },
          { label: '🎯 Progress', value: '85%', color: '#f78166' },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid rgba(${
                stat.color === '#58a6ff' ? '88, 166, 255' :
                stat.color === '#3fb950' ? '63, 185, 80' :
                stat.color === '#d2a8ff' ? '210, 168, 255' :
                '247, 129, 102'
              }, 0.3)`,
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
              fontSize: '12px',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: stat.color, marginBottom: '4px' }}>
              {stat.value}
            </div>
            <div style={{ color: '#888', fontSize: '11px' }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnifiedDashboard;
