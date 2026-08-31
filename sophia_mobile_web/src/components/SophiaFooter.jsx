import React from 'react';

export default function SophiaFooter() {
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  return (
    <footer className="sophia-footer sophia-reveal" data-sophia-reveal>
      <div className="sophia-footer-divider" />
      <div className="sophia-footer-grid">
        <div>
          <div className="sophia-wordmark" style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 700, marginBottom: 10 }}>
            SOPHIA
          </div>
          <p style={{ margin: 0, color: 'var(--sophia-text-dim)', lineHeight: 1.7 }}>
            A wellness companion for habits, rest, and honest self-reflection. Built to feel like a person sitting with you — not a system measuring you.
          </p>
        </div>
        <div>
          <div className="sophia-footer-meta" style={{ color: 'var(--color-primary)', marginBottom: 10, fontSize: 12 }}>
            {today} · github.com/cyber-urbanrebel/sophia2
          </div>
          <p style={{ margin: 0, color: 'var(--sophia-text-dim)', lineHeight: 1.7 }}>
            Code lives on GitHub. Come back when you are ready — nothing here expires overnight.
          </p>
          <a href="https://github.com/cyber-urbanrebel/sophia2" target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 12, color: 'var(--color-primary-dark)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            Open the GitHub repo
          </a>
        </div>
      </div>
    </footer>
  );
}
