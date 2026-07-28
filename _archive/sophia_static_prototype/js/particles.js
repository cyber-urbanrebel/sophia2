/* ═══════════════════════════════════════════════════════════
   PARTICLES.JS — Ambient particle background effect
   ═══════════════════════════════════════════════════════════ */
const ParticleEngine = (function () {
  let canvas, ctx, W, H;
  let particles = [];
  let mouse = { x: -9999, y: -9999 };
  const COUNT = 320;
  const COLORS = [
    [180, 100, 255],
    [100, 180, 255],
    [255, 100, 200],
    [100, 255, 220],
    [255, 200, 100],
    [200, 255, 130],
  ];

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function mkParticle() {
    const col = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x: rand(0, W / devicePixelRatio),
      y: rand(0, H / devicePixelRatio),
      z: rand(0.1, 1),
      vx: rand(-0.25, 0.25),
      vy: rand(-0.25, 0.25),
      r: rand(0.8, 2.8),
      col,
      alpha: rand(0.4, 1),
      pulse: rand(0, Math.PI * 2),
      pulseSpeed: rand(0.008, 0.025),
      trail: [],
    };
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = canvas.width = rect.width * devicePixelRatio;
    H = canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  function init() {
    particles = [];
    for (let i = 0; i < COUNT; i++) particles.push(mkParticle());
  }

  function draw() {
    const rW = W / devicePixelRatio;
    const rH = H / devicePixelRatio;
    const mx = mouse.x;
    const my = mouse.y;

    ctx.fillStyle = 'rgba(15,15,26,0.30)';
    ctx.fillRect(0, 0, rW, rH);

    particles.forEach((p) => {
      p.pulse += p.pulseSpeed;
      const pulseFactor = 0.7 + 0.3 * Math.sin(p.pulse);

      const dx = p.x - mx;
      const dy = p.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = Math.max(0, 1 - dist / 140);
      p.vx += (dx / dist) * force * 0.18 * p.z;
      p.vy += (dy / dist) * force * 0.18 * p.z;
      p.vx *= 0.97;
      p.vy *= 0.97;
      p.x += p.vx + Math.sin(p.pulse * 0.5) * 0.08;
      p.y += p.vy + Math.cos(p.pulse * 0.4) * 0.08;

      if (p.x < -10) p.x = rW + 10;
      if (p.x > rW + 10) p.x = -10;
      if (p.y < -10) p.y = rH + 10;
      if (p.y > rH + 10) p.y = -10;

      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 14) p.trail.shift();

      if (p.trail.length > 2) {
        const [r, g, b] = p.col;
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (let i = 1; i < p.trail.length; i++) {
          ctx.lineTo(p.trail[i].x, p.trail[i].y);
        }
        ctx.strokeStyle = `rgba(${r},${g},${b},${p.alpha * 0.12 * p.z * pulseFactor})`;
        ctx.lineWidth = p.r * p.z * 0.6;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      const glowR = p.r * p.z * pulseFactor * 5;
      const [r, g, b] = p.col;
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
      grd.addColorStop(0, `rgba(${r},${g},${b},${p.alpha * 0.22 * p.z})`);
      grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.z * pulseFactor, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha * p.z})`;
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b2 = particles[j];
        const dx = a.x - b2.x;
        const dy = a.y - b2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const dax = a.x - mx;
        const day = a.y - my;
        const distA = Math.sqrt(dax * dax + day * day);
        if (dist < 75 && distA < 160) {
          const alpha = (1 - dist / 75) * (1 - distA / 160) * 0.35;
          const [r, g, b] = COLORS[Math.floor((i + j) % COLORS.length)];
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b2.x, b2.y);
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

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

    requestAnimationFrame(draw);
  }

  function bindEvents() {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
    }, { passive: false });

    window.addEventListener('resize', () => {
      resize();
      init();
    });
  }

  function start(canvasId) {
    canvas = document.getElementById(canvasId);
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    init();
    bindEvents();
    draw();
  }

  return { start };
})();
