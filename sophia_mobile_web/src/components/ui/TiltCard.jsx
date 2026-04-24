import React, { useRef, useCallback, useState } from 'react';

/**
 * 3D Tilt Card — follows mouse with CSS perspective transforms.
 * Wrap any content to give it a subtle 3D depth effect on hover.
 *
 * Props:
 *  - maxTilt (number, default 12): maximum rotation degrees
 *  - scale (number, default 1.03): hover scale multiplier
 *  - glare (boolean, default true): show directional light glare
 *  - className, style: passed to outer wrapper
 *  - children: card content
 */
export default function TiltCard({
  children,
  maxTilt = 12,
  scale = 1.03,
  glare = true,
  className = '',
  style = {},
  onClick,
}) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)');
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 });
  const raf = useRef(null);

  const handleMove = useCallback((e) => {
    const el = cardRef.current;
    if (!el) return;
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;   // 0..1
      const y = (e.clientY - rect.top) / rect.height;    // 0..1
      const rotY = (x - 0.5) * maxTilt * 2;   // -maxTilt..+maxTilt
      const rotX = (0.5 - y) * maxTilt * 2;

      setTransform(
        `perspective(800px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(${scale},${scale},${scale})`
      );

      if (glare) {
        const angle = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI) + 90;
        setGlareStyle({
          opacity: 0.15,
          background: `linear-gradient(${angle.toFixed(0)}deg, rgba(255,255,255,0.25) 0%, transparent 80%)`,
        });
      }
    });
  }, [maxTilt, scale, glare]);

  const handleLeave = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    setTransform('perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)');
    setGlareStyle({ opacity: 0 });
  }, []);

  return (
    <div
      ref={cardRef}
      className={className}
      style={{
        ...style,
        transform,
        transition: 'transform 0.35s cubic-bezier(0.03,0.98,0.52,0.99)',
        willChange: 'transform',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
    >
      {children}
      {glare && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            transition: 'opacity 0.35s ease',
            ...glareStyle,
          }}
        />
      )}
    </div>
  );
}
