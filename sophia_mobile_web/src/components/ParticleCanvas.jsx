import React, { useRef, useEffect } from 'react';

const COLORS = [
  [122, 246, 247],
  [91, 31, 168],
  [180, 100, 255],
  [100, 180, 255],
  [255, 200, 120],
  [200, 255, 180],
];

function rand(a, b) { return a + Math.random() * (b - a); }

export default function ParticleCanvas({ opacity = 0.9, zIndex = 12, count = 220 }) {
  const ref = useRef(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    let raf;
    let particles = [];
    const sparks = [];
    const dpr = window.devicePixelRatio || 1;
    let rW = 0;
    let rH = 0;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      rW = rect.width;
      rH = rect.height;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function mkParticle() {
      const col = COLORS[Math.floor(Math.random() * COLORS.length)];
      return {
        x: rand(0, rW), y: rand(0, rH),
        z: rand(0.2, 1),
        vx: rand(-0.2, 0.2), vy: rand(-0.2, 0.2),
        r: rand(0.7, 2.4), col,
        alpha: rand(0.45, 1),
        pulse: rand(0, Math.PI * 2),
        pulseSpeed: rand(0.01, 0.03),
        trail: [],
      };
    }

    function init() {
      resize();
      const n = Math.min(count, Math.max(80, Math.floor((rW * rH) / 7000)));
      particles = Array.from({ length: n }, mkParticle);
    }

    function draw() {
      const mx = mouse.current.x;
      const my = mouse.current.y;
      ctx.clearRect(0, 0, rW, rH);

      for (const p of particles) {
        p.pulse += p.pulseSpeed;
        const pf = 0.7 + 0.3 * Math.sin(p.pulse);
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const pull = Math.max(0, 1 - dist / 240);
        p.vx += (dx / dist) * pull * 0.07 * p.z;
        p.vy += (dy / dist) * pull * 0.07 * p.z;
        p.vx += (-dy / dist) * pull * 0.12 * p.z;
        p.vy += (dx / dist) * pull * 0.12 * p.z;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.x += p.vx + Math.sin(p.pulse * 0.5) * 0.08;
        p.y += p.vy + Math.cos(p.pulse * 0.4) * 0.08;
        if (p.x < -12) p.x = rW + 12;
        if (p.x > rW + 12) p.x = -12;
        if (p.y < -12) p.y = rH + 12;
        if (p.y > rH + 12) p.y = -12;
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 10) p.trail.shift();

        const [r, g, b] = p.col;
        if (p.trail.length > 2) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let i = 1; i < p.trail.length; i++) ctx.lineTo(p.trail[i].x, p.trail[i].y);
          ctx.strokeStyle = `rgba(${r},${g},${b},${p.alpha * 0.16 * p.z * pf})`;
          ctx.lineWidth = p.r * p.z * 0.7;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
        const glowR = p.r * p.z * pf * 5;
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
        grd.addColorStop(0, `rgba(${r},${g},${b},${p.alpha * 0.28 * p.z})`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.z * pf, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha * p.z})`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const bP = particles[j];
          const dx = a.x - bP.x;
          const dy = a.y - bP.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const dax = a.x - mx;
          const day = a.y - my;
          const distA = Math.sqrt(dax * dax + day * day);
          if (dist < 70 && distA < 150) {
            const alpha = (1 - dist / 70) * (1 - distA / 150) * 0.4;
            const [r, g, b] = COLORS[(i + j) % COLORS.length];
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(bP.x, bP.y);
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life -= 0.035;
        s.x += s.vx;
        s.y += s.vy;
        if (s.life <= 0) sparks.splice(i, 1);
        else {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(122,246,247,${s.life})`;
          ctx.fill();
        }
      }

      if (mx > 0 && mx < rW) {
        const cg = ctx.createRadialGradient(mx, my, 0, mx, my, 70);
        cg.addColorStop(0, 'rgba(122,246,247,0.28)');
        cg.addColorStop(0.45, 'rgba(91,31,168,0.12)');
        cg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(mx, my, 70, 0, Math.PI * 2);
        ctx.fillStyle = cg;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    function onMouse(e) {
      mouse.current = { x: e.clientX, y: e.clientY };
      sparks.push({
        x: e.clientX, y: e.clientY,
        vx: rand(-1.2, 1.2), vy: rand(-1.6, 0.2),
        r: rand(1.2, 2.6), life: 1,
      });
      if (sparks.length > 40) sparks.shift();
    }

    init();
    draw();
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('resize', init);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', init);
    };
  }, [count]);

  return (
    <canvas
      id="particle-canvas"
      ref={ref}
      aria-hidden="true"
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
