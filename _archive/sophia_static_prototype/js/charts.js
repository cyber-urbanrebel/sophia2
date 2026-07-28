/* ═══════════════════════════════════════════════════════════
   CHARTS.JS — All Chart.js Implementations
   ═══════════════════════════════════════════════════════════ */

const Charts = (() => {
  const instances = {};

  // Global defaults
  function setDefaults() {
    if (typeof Chart === 'undefined') return;
    Chart.defaults.color = '#9E9B8A';
    Chart.defaults.font.family = 'DM Sans';
    Chart.defaults.plugins.legend.display = false;
    Chart.defaults.animation = { duration: 1200, easing: 'easeInOutQuart' };
    Chart.defaults.scale = Chart.defaults.scale || {};
  }

  function destroy(id) {
    if (instances[id]) { instances[id].destroy(); delete instances[id]; }
  }

  function getCtx(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    return canvas.getContext('2d');
  }

  const gridColor = 'rgba(196,169,98,0.1)';
  const goldColor = '#C4A962';
  const cyanColor = '#00CED1';
  const violetColor = '#8B5CF6';
  const emeraldColor = '#10B981';

  // ── Domain Radar Chart ──
  function domainRadar(canvasId, scores) {
    const ctx = getCtx(canvasId);
    if (!ctx) return;
    destroy(canvasId);
    instances[canvasId] = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Physical', 'Mental', 'Emotional', 'Spiritual', 'Professional', 'Financial', 'Relationships', 'Creative'],
        datasets: [{
          data: [
            scores.physical || 0, scores.mental || 0, scores.emotional || 0, scores.spiritual || 0,
            scores.professional || 0, scores.financial || 0, scores.relationships || 0, scores.creative || 0,
          ],
          backgroundColor: 'rgba(196,169,98,0.15)',
          borderColor: goldColor,
          borderWidth: 2,
          pointBackgroundColor: goldColor,
          pointRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 25, display: false },
            grid: { color: gridColor },
            angleLines: { color: gridColor },
            pointLabels: { font: { size: 11 }, color: '#9E9B8A' },
          },
        },
      },
    });
  }

  // ── Habit Completion Trend (Stacked Area) ──
  function habitTrend(canvasId, data) {
    const ctx = getCtx(canvasId);
    if (!ctx) return;
    destroy(canvasId);
    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, 'rgba(196,169,98,0.3)');
    gradient.addColorStop(1, 'rgba(196,169,98,0.02)');
    instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.values,
          backgroundColor: gradient,
          borderColor: goldColor,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: gridColor }, ticks: { font: { size: 10 } } },
          y: { beginAtZero: true, grid: { color: gridColor }, ticks: { font: { size: 10 } } },
        },
        plugins: { tooltip: { mode: 'index', intersect: false } },
      },
    });
  }

  // ── Goal Progress (Line) ──
  function goalProgress(canvasId, goals) {
    const ctx = getCtx(canvasId);
    if (!ctx) return;
    destroy(canvasId);
    const colors = [goldColor, cyanColor, violetColor, emeraldColor, '#F59E0B', '#F43F5E'];
    instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: goals[0]?.data?.map(d => d.label) || [],
        datasets: goals.map((g, i) => ({
          label: g.name,
          data: g.data.map(d => d.value),
          borderColor: colors[i % colors.length],
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 3,
          fill: false,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 12, padding: 16 } } },
        scales: {
          x: { grid: { color: gridColor } },
          y: { beginAtZero: true, max: 100, grid: { color: gridColor } },
        },
      },
    });
  }

  // ── Completion Bar Chart ──
  function completionBar(canvasId, data) {
    const ctx = getCtx(canvasId);
    if (!ctx) return;
    destroy(canvasId);
    instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.values,
          backgroundColor: data.colors || goldColor,
          borderRadius: 4,
          maxBarThickness: 32,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: gridColor } },
        },
      },
    });
  }

  // ── XP Over Time (Area with gradient) ──
  function xpOverTime(canvasId, data) {
    const ctx = getCtx(canvasId);
    if (!ctx) return;
    destroy(canvasId);
    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, 'rgba(0,206,209,0.3)');
    gradient.addColorStop(1, 'rgba(0,206,209,0.02)');
    instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.values,
          backgroundColor: gradient,
          borderColor: cyanColor,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: gridColor } },
          y: { beginAtZero: true, grid: { color: gridColor } },
        },
      },
    });
  }

  // ── Domain Balance (Doughnut) ──
  function domainDoughnut(canvasId, scores) {
    const ctx = getCtx(canvasId);
    if (!ctx) return;
    destroy(canvasId);
    const domainColors = ['#00CED1', '#8B5CF6', '#F43F5E', '#10B981', '#3B82F6', '#F59E0B', '#14B8A6', '#EC4899'];
    instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Physical', 'Mental', 'Emotional', 'Spiritual', 'Professional', 'Financial', 'Relationships', 'Creative'],
        datasets: [{
          data: Object.values(scores),
          backgroundColor: domainColors,
          borderWidth: 0,
          spacing: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { display: true, position: 'bottom', labels: { boxWidth: 10, padding: 12 } },
        },
      },
    });
  }

  // ── Journal Frequency (Bar) ──
  function journalFrequency(canvasId, data) {
    return completionBar(canvasId, { ...data, colors: violetColor });
  }

  // ── DAU Line (Admin) ──
  function dauLine(canvasId, data) {
    const ctx = getCtx(canvasId);
    if (!ctx) return;
    destroy(canvasId);
    instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.values,
          borderColor: cyanColor,
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 2,
          fill: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: gridColor } },
          y: { beginAtZero: true, grid: { color: gridColor } },
        },
      },
    });
  }

  // ── Revenue Bar (Admin) ──
  function revenueBar(canvasId, data) {
    return completionBar(canvasId, { ...data, colors: goldColor });
  }

  // ── SVG Circular Gauge ──
  function circularGauge(container, value, color, label, size = 80) {
    const r = (size - 8) / 2;
    const circumference = 2 * Math.PI * r;
    const offset = circumference * (1 - value / 100);
    container.innerHTML = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--border)" stroke-width="4"/>
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="4"
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"
          transform="rotate(-90 ${size/2} ${size/2})"
          style="transition: stroke-dashoffset 1.2s ease"/>
        <text x="${size/2}" y="${size/2}" text-anchor="middle" dominant-baseline="central"
          fill="var(--text-primary)" font-size="${size*0.22}" font-weight="700" font-family="DM Sans">${Math.round(value)}%</text>
      </svg>
      ${label ? `<div class="gauge-label">${label}</div>` : ''}
    `;
  }

  // ── Destroy all ──
  function destroyAll() {
    Object.keys(instances).forEach(destroy);
  }

  return {
    setDefaults, destroy, destroyAll,
    domainRadar, habitTrend, goalProgress, completionBar,
    xpOverTime, domainDoughnut, journalFrequency,
    dauLine, revenueBar, circularGauge,
  };
})();
