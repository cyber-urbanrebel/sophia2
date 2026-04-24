import React from 'react';

const LoadingScreen = () => {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      color: '#fff',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '44px', fontWeight: 700, marginBottom: '16px' }}>SOPHIA</div>
      <div style={{ width: '48px', height: '48px', border: '5px solid rgba(255, 255, 255, 0.2)', borderTopColor: '#00d4ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <div style={{ marginTop: '16px', color: '#aaa' }}>Loading your Personal AI Workspace...</div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LoadingScreen;
