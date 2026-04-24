import React from 'react';

export default function SophiaOrb() {
  return (
    <div className="sophia-orb-field sophia-reveal" data-sophia-reveal>
      <div className="sophia-orb-chip top-right">Neural Core Active</div>
      <div className="sophia-orb-chip left">Habit Tracking On</div>
      <div className="sophia-orb-chip bottom-right">Goal Sync Ready</div>
      <div className="sophia-orb-chip bottom-left">Mood Analysis</div>

      <div className="sophia-orb" aria-label="Sophia neural orb visualization">
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