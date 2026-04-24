import React from 'react';

export default function SophiaFooter() {
  return (
    <footer className="sophia-footer sophia-reveal" data-sophia-reveal>
      <div className="sophia-footer-divider" />
      <div className="sophia-footer-grid">
        <div>
          <div className="sophia-wordmark" style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 800, marginBottom: 10 }}>
            SOPHIA
          </div>
          <p style={{ margin: 0, color: 'var(--sophia-text-dim)', lineHeight: 1.7 }}>
            Your personal AI companion for self-improvement, habit intelligence, focus rituals, goal momentum, and progress visibility.
          </p>
        </div>
        <div>
          <div className="sophia-footer-meta" style={{ color: 'var(--sophia-cyan)', marginBottom: 10, fontSize: 13 }}>
            SYSTEM STATUS
          </div>
          <p style={{ margin: 0, color: 'var(--sophia-text-dim)', lineHeight: 1.7 }}>
            Neural guidance online. Daily growth systems active. Keep building your body, mind, discipline, and progress inside one SOPHIA runtime.
          </p>
        </div>
      </div>
    </footer>
  );
}