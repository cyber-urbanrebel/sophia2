import React, { useEffect, useState } from 'react';
import { DURATION_SLOW, EASING_CSS } from '../motion/tokens.js';

export default function PageTransition({ message = 'A quiet moment…' }) {
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('visible'), 40);
    const t2 = setTimeout(() => setPhase('exit'), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const opacity = phase === 'visible' ? 1 : 0;
  const clip = phase === 'enter' ? 'circle(0% at 50% 50%)' : phase === 'exit' ? 'circle(0% at 50% 50%)' : 'circle(140% at 50% 50%)';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(51, 8, 103, 0.28)',
      clipPath: clip,
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      fontFamily: "var(--font-plain)",
      transition: `opacity ${DURATION_SLOW}s ${EASING_CSS}, clip-path ${DURATION_SLOW}s ${EASING_CSS}`,
      opacity,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        border: '1px solid rgba(48,207,208,0.4)',
        display: 'grid', placeItems: 'center',
        background: 'rgba(20, 6, 48, 0.55)',
        boxShadow: '0 12px 32px rgba(51,8,103,0.28)',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#30cfd0' }} />
      </div>
      <div style={{
        marginTop: 18, fontFamily: "var(--font-plain)", fontSize: 22, color: '#F4FBFF', textAlign: 'center', maxWidth: 360,
      }}>
        {message}
      </div>
    </div>
  );
}
