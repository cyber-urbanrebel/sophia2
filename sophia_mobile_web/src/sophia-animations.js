function createScrollProgressBar() {
  let bar = document.getElementById('sophia-scroll-progress');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'sophia-scroll-progress';
    document.body.appendChild(bar);
  }

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${Math.min(progress, 100)}%`;
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);

  return () => {
    window.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);
  };
}

function ensureParticleCanvas() {
  let canvas = document.getElementById('particle-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    document.body.prepend(canvas);
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const mouse = {
    x: -9999,
    y: -9999,
    radius: 170,
    strength: 0.22,
    active: false,
  };
  const dpr = window.devicePixelRatio || 1;
  let width = 0;
  let height = 0;
  let frame = 0;
  let particles = [];
  let burstAlpha = 0;

  const cyan = [0, 212, 255];
  const purple = [123, 47, 255];
  const gold = [201, 168, 76];

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function particleCountForViewport() {
    const ambientMode = document.body.dataset.sophiaAmbient === 'calm' ? 'calm' : 'immersive';
    if (prefersReducedMotion.matches) {
      return ambientMode === 'calm'
        ? Math.max(24, Math.min(36, Math.floor((width * height) / 48000)))
        : Math.max(36, Math.min(54, Math.floor((width * height) / 36000)));
    }
    return ambientMode === 'calm'
      ? Math.max(48, Math.min(82, Math.floor((width * height) / 22000)))
      : Math.max(70, Math.min(130, Math.floor((width * height) / 15000)));
  }

  function getAmbientSettings() {
    const calm = document.body.dataset.sophiaAmbient === 'calm';
    return calm
      ? {
        mouseRadius: 145,
        mouseStrength: 0.16,
        glow: 0.82,
        linkDistance: 98,
        linkDistanceActive: 122,
        drift: 0.000009,
        trailLength: 5,
      }
      : {
        mouseRadius: 220,
        mouseStrength: 0.3,
        glow: 1.25,
        linkDistance: 126,
        linkDistanceActive: 158,
        drift: 0.000016,
        trailLength: 10,
      };
  }

  function buildParticle() {
    const depth = randomBetween(0.25, 1);
    const palette = Math.random() > 0.84 ? gold : Math.random() > 0.55 ? purple : cyan;

    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * (prefersReducedMotion.matches ? 0.12 : 0.36) * depth,
      vy: (Math.random() - 0.5) * (prefersReducedMotion.matches ? 0.12 : 0.36) * depth,
      depth,
      radius: randomBetween(0.6, 2.1) * depth,
      alpha: randomBetween(0.22, 0.96),
      twinkle: randomBetween(0, Math.PI * 2),
      twinkleSpeed: randomBetween(0.006, 0.022),
      trail: [],
      palette,
    };
  }

  function drawGlow(x, y, size, rgba, intensity) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${intensity})`);
    gradient.addColorStop(1, `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, 0)`);
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  function resize() {
    const ambient = getAmbientSettings();
    width = window.innerWidth;
    height = window.innerHeight;
    mouse.radius = ambient.mouseRadius;
    mouse.strength = ambient.mouseStrength;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    particles = Array.from({ length: particleCountForViewport() }, buildParticle);
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    const ambient = getAmbientSettings();

    if (mouse.active && !isCoarsePointer) {
      drawGlow(mouse.x, mouse.y, 220, cyan, (0.09 + burstAlpha * 0.1) * ambient.glow);
      drawGlow(mouse.x, mouse.y, 118, purple, (0.06 + burstAlpha * 0.06) * ambient.glow);
      drawGlow(mouse.x, mouse.y, 56, gold, (0.035 + burstAlpha * 0.045) * ambient.glow);
    }

    burstAlpha *= 0.96;

    for (let index = 0; index < particles.length; index += 1) {
      const particle = particles[index];
      particle.twinkle += particle.twinkleSpeed;
      const twinkleFactor = 0.72 + Math.sin(particle.twinkle) * 0.28;

      if (mouse.active && !isCoarsePointer) {
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        if (distance < mouse.radius) {
          const force = (1 - distance / mouse.radius) * mouse.strength * particle.depth;
          particle.vx += (dx / distance) * force * 0.05;
          particle.vy += (dy / distance) * force * 0.05;
        }
      }

      particle.vx *= 0.994;
      particle.vy *= 0.994;
      particle.x += particle.vx + (mouse.x - width / 2) * ambient.drift * particle.depth;
      particle.y += particle.vy + (mouse.y - height / 2) * ambient.drift * particle.depth;

      if (particle.x < -20) particle.x = width + 20;
      if (particle.x > width + 20) particle.x = -20;
      if (particle.y < -20) particle.y = height + 20;
      if (particle.y > height + 20) particle.y = -20;

      if (!prefersReducedMotion.matches) {
        particle.trail.push({ x: particle.x, y: particle.y });
        if (particle.trail.length > ambient.trailLength) particle.trail.shift();
      }

      if (particle.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
        for (let trailIndex = 1; trailIndex < particle.trail.length; trailIndex += 1) {
          ctx.lineTo(particle.trail[trailIndex].x, particle.trail[trailIndex].y);
        }
        ctx.strokeStyle = `rgba(${particle.palette[0]}, ${particle.palette[1]}, ${particle.palette[2]}, ${particle.alpha * 0.13 * particle.depth})`;
        ctx.lineWidth = 0.5 + particle.depth * 0.6;
        ctx.stroke();
      }

      drawGlow(
        particle.x,
        particle.y,
        8 + particle.depth * 10,
        particle.palette,
        particle.alpha * 0.12 * twinkleFactor,
      );

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particle.palette[0]}, ${particle.palette[1]}, ${particle.palette[2]}, ${particle.alpha * twinkleFactor})`;
      ctx.fill();

      for (let neighborIndex = index + 1; neighborIndex < particles.length; neighborIndex += 1) {
        const neighbor = particles[neighborIndex];
        const dx = particle.x - neighbor.x;
        const dy = particle.y - neighbor.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = mouse.active ? ambient.linkDistanceActive : ambient.linkDistance;
        if (distance < maxDistance) {
          const alpha = 1 - distance / maxDistance;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(neighbor.x, neighbor.y);
          ctx.strokeStyle = `rgba(120, 220, 255, ${alpha * 0.16 * Math.min(particle.depth + neighbor.depth, 1.4)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    frame = window.requestAnimationFrame(render);
  }

  const onMouseMove = (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
  };

  const onMouseLeave = () => {
    mouse.x = -9999;
    mouse.y = -9999;
    mouse.active = false;
  };

  const onPointerDown = (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
    burstAlpha = 1;
  };

  resize();
  render();
  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  window.addEventListener('mouseleave', onMouseLeave);
  window.addEventListener('resize', resize);
  prefersReducedMotion.addEventListener('change', resize);

  return () => {
    window.cancelAnimationFrame(frame);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('mouseleave', onMouseLeave);
    window.removeEventListener('resize', resize);
    prefersReducedMotion.removeEventListener('change', resize);
  };
}

function initRevealAnimations() {
  const targets = Array.from(document.querySelectorAll('[data-sophia-reveal], .sophia-reveal'));
  if (!targets.length) return () => {};

  targets.forEach((target, index) => {
    target.style.transitionDelay = `${index * 80}ms`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach((target) => observer.observe(target));
  return () => observer.disconnect();
}

function initCountUpAnimations() {
  const nodes = Array.from(document.querySelectorAll('[data-sophia-count]'));
  if (!nodes.length) return () => {};

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const node = entry.target;
      const target = Number(node.getAttribute('data-sophia-count') || 0);
      const prefix = node.getAttribute('data-sophia-prefix') || '';
      const suffix = node.getAttribute('data-sophia-suffix') || '';
      const duration = 1200;
      const startTime = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const value = Math.round(target * progress);
        node.textContent = `${prefix}${value}${suffix}`;
        if (progress < 1) {
          window.requestAnimationFrame(tick);
        }
      };

      node.textContent = `${prefix}0${suffix}`;
      window.requestAnimationFrame(tick);
      observer.unobserve(node);
    });
  }, { threshold: 0.2 });

  nodes.forEach((node) => observer.observe(node));
  return () => observer.disconnect();
}

function initProgressAnimations() {
  const nodes = Array.from(document.querySelectorAll('[data-sophia-progress]'));
  if (!nodes.length) return () => {};

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      const value = Number(node.getAttribute('data-sophia-progress') || 0);
      node.style.width = `${Math.max(0, Math.min(100, value))}%`;
      observer.unobserve(node);
    });
  }, { threshold: 0.2 });

  nodes.forEach((node) => {
    node.style.width = '0%';
    observer.observe(node);
  });
  return () => observer.disconnect();
}

function initOrbHover() {
  const orb = document.querySelector('.sophia-orb');
  if (!orb) return () => {};

  const onMove = (event) => {
    const rect = orb.getBoundingClientRect();
    const rotateX = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
    const rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
    orb.style.transform = `scale(1.05) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const reset = () => {
    orb.style.transform = 'scale(1) rotateX(0deg) rotateY(0deg)';
  };

  orb.addEventListener('mousemove', onMove);
  orb.addEventListener('mouseleave', reset);

  return () => {
    orb.removeEventListener('mousemove', onMove);
    orb.removeEventListener('mouseleave', reset);
  };
}

export function initSophiaAnimations() {
  document.body.classList.add('sophia-theme');

  const cleanups = [
    ensureParticleCanvas(),
    createScrollProgressBar(),
    initRevealAnimations(),
    initCountUpAnimations(),
    initProgressAnimations(),
    initOrbHover(),
  ];

  return () => {
    cleanups.forEach((cleanup) => {
      if (typeof cleanup === 'function') cleanup();
    });
  };
}