import React, { useRef, useEffect } from 'react';

/*  ═══════════════════════════════════════════════════════════
    ParticleCanvas — mouse-reactive ambient particle engine
    Ported from sophia/js/particles.js (ParticleEngine)
    ═══════════════════════════════════════════════════════════ */

const COLORS = [
  [180, 100, 255],  // purple
  [100, 180, 255],  // sky
  [255, 100, 200],  // pink
  [100, 255, 220],  // teal
  [201, 168, 76],   // gold
  [200, 255, 130],  // lime
];

function rand(a, b) { return a + Math.random() * (b - a); }

export default function ParticleCanvas({ opacity = 0.45, zIndex = 0, count = 200 }) {
  const ref = useRef(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let particles = [];
    const dpr = window.devicePixelRatio || 1;
    let W, H, rW, rH;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      W = canvas.width  = rect.width  * dpr;
      H = canvas.height = rect.height * dpr;
      rW = rect.width;
      rH = rect.height;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function mkParticle() {
      const col = COLORS[Math.floor(Math.random() * COLORS.length)];
      return {
        x: rand(0, rW), y: rand(0, rH),
        z: rand(0.15, 1),
        vx: rand(-0.25, 0.25), vy: rand(-0.25, 0.25),
        r: rand(0.8, 2.6), col,
        alpha: rand(0.4, 1),
        pulse: rand(0, Math.PI * 2),
        pulseSpeed: rand(0.008, 0.025),
        trail: [],
      };
    }

    function init() {
      resize();
      const n = Math.min(count, Math.floor((rW * rH) / 5500));
      particles = [];
      for (let i = 0; i < n; i++) particles.push(mkParticle());
    }

    function draw() {
      const mx = mouse.current.x;
      const my = mouse.current.y;

      // Semi-transparent clear for trail persistence
      ctx.fillStyle = 'rgba(15,15,26,0.28)';
      ctx.fillRect(0, 0, rW, rH);

      // --- Update & render particles ---
      for (const p of particles) {
        p.pulse += p.pulseSpeed;
        const pf = 0.7 + 0.3 * Math.sin(p.pulse);

        // Mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = Math.max(0, 1 - dist / 140);
        p.vx += (dx / dist) * force * 0.18 * p.z;
        p.vy += (dy / dist) * force * 0.18 * p.z;

        // Friction + organic drift
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.x += p.vx + Math.sin(p.pulse * 0.5) * 0.08;
        p.y += p.vy + Math.cos(p.pulse * 0.4) * 0.08;

        // Wrap edges
        if (p.x < -10) p.x = rW + 10;
        if (p.x > rW + 10) p.x = -10;
        if (p.y < -10) p.y = rH + 10;
        if (p.y > rH + 10) p.y = -10;

        // Trail
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 14) p.trail.shift();

        const [r, g, b] = p.col;

        // Draw trail
        if (p.trail.length > 2) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let i = 1; i < p.trail.length; i++) ctx.lineTo(p.trail[i].x, p.trail[i].y);
          ctx.strokeStyle = `rgba(${r},${g},${b},${p.alpha * 0.12 * p.z * pf})`;
          ctx.lineWidth = p.r * p.z * 0.6;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Glow halo
        const glowR = p.r * p.z * pf * 5;
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
        grd.addColorStop(0, `rgba(${r},${g},${b},${p.alpha * 0.22 * p.z})`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.z * pf, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha * p.z})`;
        ctx.fill();
      }

      // --- Connecting lines near cursor ---
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], bP = particles[j];
          const dx = a.x - bP.x, dy = a.y - bP.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const dax = a.x - mx, day = a.y - my;
          const distA = Math.sqrt(dax * dax + day * day);
          if (dist < 75 && distA < 160) {
            const alpha = (1 - dist / 75) * (1 - distA / 160) * 0.35;
            const [r, g, b] = COLORS[(i + j) % COLORS.length];
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(bP.x, bP.y);
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // --- Cursor glow ---
      if (mx > 0 && mx < rW) {
        const cg = ctx.createRadialGradient(mx, my, 0, mx, my, 55);
        cg.addColorStop(0, 'rgba(180,100,255,0.22)');
        cg.addColorStop(0.4, 'rgba(100,180,255,0.10)');
        cg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(mx, my, 55, 0, Math.PI * 2);
        ctx.fillStyle = cg;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(mx, my, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(220,180,255,0.9)';
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    init();
    draw();

    // --- Mouse / touch events ---
    function onMouse(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    function onLeave() { mouse.current = { x: -9999, y: -9999 }; }
    function onTouch(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }

    // Listen on window so particles react even when cursor is over UI elements
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('resize', init);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('resize', init);
    };
  }, [count]);

  return (
    <canvas
      ref={ref}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex,
        opacity,
      }}
    />
  );
}
