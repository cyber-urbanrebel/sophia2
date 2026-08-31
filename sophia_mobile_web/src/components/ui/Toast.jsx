import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import ReactDOM from 'react-dom';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

const ICONS = {
  success: 'âœ“',
  error: 'âœ•',
  warning: 'âš ',
  info: 'â„¹',
};

const COLORS = {
  success: { bg: 'rgba(63,185,80,0.12)', border: 'rgba(63,185,80,0.25)', icon: '#3fb950' },
  error: { bg: 'rgba(255,107,107,0.12)', border: 'rgba(255,107,107,0.25)', icon: '#ff6b6b' },
  warning: { bg: 'rgba(201,168,76,0.12)', border: 'rgba(201,168,76,0.25)', icon: '#c9a84c' },
  info: { bg: 'rgba(0,212,255,0.12)', border: 'rgba(0,212,255,0.25)', icon: 'var(--color-primary)' },
};

function Toast({ id, message, type = 'info', onRemove }) {
  const [exiting, setExiting] = useState(false);
  const c = COLORS[type] || COLORS.info;

  useEffect(() => {
    const t = setTimeout(() => setExiting(true), 3200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (exiting) {
      const t = setTimeout(() => onRemove(id), 300);
      return () => clearTimeout(t);
    }
  }, [exiting, id, onRemove]);

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 18px', borderRadius: 12,
        background: c.bg, border: `1px solid ${c.border}`,
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        color: '#e0ddd6', fontSize: 14, fontFamily: "'Dark Castle'",
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        transform: exiting ? 'translateX(120%)' : 'translateX(0)',
        opacity: exiting ? 0 : 1,
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s',
        pointerEvents: 'auto', cursor: 'pointer', maxWidth: 360,
      }}
      onClick={() => setExiting(true)}
    >
      <span style={{ fontSize: 16, fontWeight: 700, color: c.icon, flexShrink: 0, width: 20, textAlign: 'center' }}>{ICONS[type]}</span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{message}</span>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  let idCounter = 0;

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-4), { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const api = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {ReactDOM.createPortal(
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 10000,
          display: 'flex', flexDirection: 'column', gap: 8,
          pointerEvents: 'none',
        }}>
          {toasts.map(t => (
            <Toast key={t.id} {...t} onRemove={removeToast} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}
