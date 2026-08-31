import React, { useEffect, useState } from 'react';

export default function HudBar({ room = 'PATH' }) {
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const stamp = clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="hud-bar" role="status">
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <img src="/assets/sophia-gyrate.svg" className="hud-gyrate" width="22" height="22" alt="" aria-hidden="true" />
        <span className="dot" aria-hidden="true" />
        SYS // SOPHIA
      </span>
      <span>{room}</span>
      <span>{stamp} · EST. 2026</span>
    </div>
  );
}
