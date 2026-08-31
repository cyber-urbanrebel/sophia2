import React from 'react';

export default function SophiaOrb() {
  return (
    <div className="sophia-orb-field sophia-reveal" data-sophia-reveal>
      <div className="sophia-orb-chip top-right">Consciousness Level Active</div>
      <div className="sophia-orb-chip left">Habit Tracking On</div>
      <div className="sophia-orb-chip bottom-right">Path Synced</div>
      <div className="sophia-orb-chip bottom-left">Inner Metrics Live</div>

      <div className="sophia-orb" aria-label="Sophia consciousness orb visualization">
        <svg className="sophia-orb-geometry" viewBox="0 0 100 100" aria-hidden="true">
          <g fill="none" stroke="#c9a44c" strokeWidth="0.4">
            <circle cx="50" cy="50" r="34" />
            <circle cx="50" cy="26" r="20" />
            <circle cx="50" cy="74" r="20" />
            <circle cx="28.9" cy="38" r="20" />
            <circle cx="71.1" cy="38" r="20" />
            <circle cx="28.9" cy="62" r="20" />
            <circle cx="71.1" cy="62" r="20" />
          </g>
        </svg>
        <div className="sophia-orb-ring ring-gold" />
        <div className="sophia-orb-ring ring-1" />
        <div className="sophia-orb-ring ring-2" />
        <div className="sophia-orb-ring ring-3" />
        <div className="sophia-orbit">
          <div className="sophia-orbit-dot" />
        </div>
        <div className="sophia-orbit reverse">
          <div className="sophia-orbit-dot" />
        </div>
        <div className="sophia-orb-core" />
      </div>
    </div>
  );
}