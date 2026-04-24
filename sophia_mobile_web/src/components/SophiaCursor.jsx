import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Hyperrealistic glowing cursor + ambient floating particles.
 */
export default function SophiaCursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);

  /* Generate randomised particles once */
  const particles = useMemo(() => {
    const count = 18;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      dur: `${6 + Math.random() * 10}s`,
      delay: `${Math.random() * 8}s`,
    }));
  }, []);

  useEffect(() => {
    let raf;

    const onMove = (e) => {
      target.current = { x: e.clientX, y: e.clientY };
    };

    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);

    const onOver = (e) => {
      const tag = e.target.tagName;
      const clickable =
        tag === 'BUTTON' ||
        tag === 'A' ||
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        e.target.getAttribute('role') === 'button' ||
        window.getComputedStyle(e.target).cursor === 'pointer';
      setHovering(clickable);
    };

    const animate = () => {
      // Smooth trailing for the outer ring
      pos.current.x += (target.current.x - pos.current.x) * 0.15;
      pos.current.y += (target.current.y - pos.current.y) * 0.15;

      if (ringRef.current) {
        ringRef.current.style.left = `${pos.current.x}px`;
        ringRef.current.style.top = `${pos.current.y}px`;
      }
      if (dotRef.current) {
        dotRef.current.style.left = `${target.current.x}px`;
        dotRef.current.style.top = `${target.current.y}px`;
      }

      raf = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseover', onOver);

    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  const ringClass = `sophia-cursor${hovering ? ' hover' : ''}${clicking ? ' click' : ''}`;
  const dotClass = `sophia-cursor-dot${hovering ? ' hover' : ''}`;

  return (
    <>
      {/* Ambient floating particles */}
      <div className="sophia-particles" aria-hidden="true">
        {particles.map((p) => (
          <div
            key={p.id}
            className="sophia-particle"
            style={{ left: p.left, '--dur': p.dur, '--delay': p.delay }}
          />
        ))}
      </div>

      {/* Cursor ring + dot */}
      <div ref={ringRef} className={ringClass} />
      <div ref={dotRef} className={dotClass} />
    </>
  );
}
