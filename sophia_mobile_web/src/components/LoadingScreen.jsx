import React from 'react';
import SophiaGyrate from './SophiaGyrate.jsx';

const LoadingScreen = () => {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundImage: 'linear-gradient(to top, #7AF6F7 0%, #5B1FA8 100%)',
      color: '#FFFFFF',
      fontFamily: "var(--font-plain)",
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <SophiaGyrate className="sophia-gyrate-load" size={280} />
      <div style={{ fontFamily: "var(--font-plain)", fontSize: 36, fontWeight: 400, marginBottom: 8 }}>SOPHIA</div>
      <div style={{ fontFamily: "var(--font-plain)", fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(244,251,255,0.72)' }}>
        take a breath — we are preparing your space
      </div>
      <style>{`@keyframes sophia-breathe { 0%,100% { transform: scale(1); opacity: 0.85 } 50% { transform: scale(1.06); opacity: 1 } }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important } }`}</style>
    </div>
  );
};

export default LoadingScreen;
