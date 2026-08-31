import React, { useMemo } from 'react';

/** Ambient particles only — the default pointer is the PNG cursor in global.css. */
export default function SophiaCursor() {
  const particles = useMemo(() => {
    const count = 18;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      dur: `${6 + Math.random() * 10}s`,
      delay: `${Math.random() * 8}s`,
    }));
  }, []);

  return (
    <div className="sophia-particles" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="sophia-particle"
          style={{ left: p.left, '--dur': p.dur, '--delay': p.delay }}
        />
      ))}
    </div>
  );
}
