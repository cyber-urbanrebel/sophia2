import React from 'react';

/**
 * Reusable empty state for pages with no data.
 * @param {string} icon - Emoji or text icon
 * @param {string} title - Main message
 * @param {string} subtitle - Secondary message / CTA text
 * @param {string} actionLabel - Button label
 * @param {function} onAction - Button callback
 */
export default function EmptyState({ icon = '📭', title, subtitle, actionLabel, onAction }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '60px 24px', textAlign: 'center', minHeight: 260,
    }}>
      <div style={{ fontSize: 48, marginBottom: 16, filter: 'grayscale(0.2)' }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: '#e0ddd6', marginBottom: 8 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 14, color: '#6a6a7a', maxWidth: 320, lineHeight: 1.5, marginBottom: 20 }}>{subtitle}</div>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: '10px 28px', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: 600,
            background: 'linear-gradient(135deg, var(--color-primary), #bb86fc)', color: '#000',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,212,255,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/**
 * Skeleton loading placeholder.
 * @param {string} variant - 'card' | 'line' | 'circle' | 'stat'
 * @param {number} count - Number of skeletons to render
 */
export function SkeletonLoader({ variant = 'card', count = 1, style }) {
  const shimmer = {
    background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeletonShimmer 1.5s ease-in-out infinite',
    borderRadius: variant === 'circle' ? '50%' : 12,
  };

  const variants = {
    card: { width: '100%', height: 100, ...shimmer },
    line: { width: '100%', height: 16, ...shimmer, borderRadius: 8 },
    circle: { width: 48, height: 48, ...shimmer },
    stat: { width: '100%', height: 80, ...shimmer },
  };

  return (
    <>
      <style>{`@keyframes skeletonShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ ...variants[variant], marginBottom: 8, ...style }} />
      ))}
    </>
  );
}
