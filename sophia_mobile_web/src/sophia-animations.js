function createScrollProgressBar() {
  let bar = document.getElementById('sophia-scroll-progress');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'sophia-scroll-progress';
    document.body.appendChild(bar);
  }
  let label = document.getElementById('sophia-scroll-label');
  if (!label) {
    label = document.createElement('div');
    label.id = 'sophia-scroll-label';
    document.body.appendChild(label);
  }

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.height = `${Math.min(progress, 76)}vh`;
    label.textContent = `${Math.round(progress)}%`;
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);

  return () => {
    window.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);
  };
}

function ensureAurora() {
  let aurora = document.getElementById('sophia-aurora');
  if (!aurora) {
    aurora = document.createElement('div');
    aurora.id = 'sophia-aurora';
    aurora.className = 'sophia-aurora';
    aurora.setAttribute('aria-hidden', 'true');
    document.body.prepend(aurora);
  }
  const leftover = document.getElementById('legacy-particle-canvas');
  if (leftover) leftover.remove();
  return () => {};
}

function initRevealAnimations() {
  const targets = Array.from(document.querySelectorAll('[data-sophia-reveal], .sophia-reveal'));
  if (!targets.length) return () => {};

  if (!('IntersectionObserver' in window)) {
    targets.forEach((target) => target.classList.add('is-visible'));
    return () => {};
  }

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

  // Keep content visible if a mobile browser delays intersection callbacks.
  const fallback = window.setTimeout(() => {
    targets.forEach((target) => target.classList.add('is-visible'));
  }, 1200);

  const cleanup = () => {
    window.clearTimeout(fallback);
    observer.disconnect();
  };
  return cleanup;
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
    ensureAurora(),
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
