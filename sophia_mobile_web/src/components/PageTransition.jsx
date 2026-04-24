import React, { useEffect, useState } from 'react';

export default function PageTransition({ message = 'Loading...' }) {
  const [phase, setPhase] = useState('enter'); // 'enter' | 'visible' | 'exit'

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('visible'), 50);
    const t2 = setTimeout(() => setPhase('exit'), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const opacity = phase === 'enter' ? 0 : phase === 'exit' ? 0 : 1;
  const scale = phase === 'enter' ? 0.95 : phase === 'exit' ? 1.03 : 1;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(135deg, #0a0a0a 0%, #0f0f1a 40%, #1a1a2e 100%)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <style>{`
        @keyframes pt-pulse { 0%,100% { opacity:0.6; transform:scale(1) } 50% { opacity:1; transform:scale(1.1) } }
        @keyframes pt-glow { 0% { box-shadow:0 0 20px rgba(0,212,255,0.2) } 50% { box-shadow:0 0 40px rgba(187,134,252,0.3) } 100% { box-shadow:0 0 20px rgba(201,168,76,0.25) } }
      `}</style>

      <div style={{
        opacity, transform: `scale(${scale})`,
        transition: 'opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
      }}>
        {/* Sophia logo mark */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, #00d4ff, #bb86fc, #c9a84c)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pt-pulse 1.6s ease-in-out infinite, pt-glow 2s ease-in-out infinite',
        }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: '#000' }}>S</span>
        </div>

        {/* Message */}
        <div style={{
          fontSize: 20, fontWeight: 600, color: '#e0ddd6', letterSpacing: '-0.01em',
          textAlign: 'center', maxWidth: 340,
        }}>
          {message}
        </div>

        {/* Shimmer bar */}
        <div style={{
          width: 200, height: 3, borderRadius: 2, overflow: 'hidden',
          background: 'rgba(255,255,255,0.06)',
        }}>
          <div style={{
            width: '40%', height: '100%', borderRadius: 2,
            background: 'linear-gradient(90deg, #00d4ff, #bb86fc, #c9a84c)',
            animation: 'pt-shimmer 1.2s ease-in-out infinite',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes pt-shimmer {
          0% { transform: translateX(-100%) }
          100% { transform: translateX(350%) }
        }
      `}</style>
    </div>
  );
}
