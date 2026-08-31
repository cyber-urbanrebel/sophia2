import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ReactDOM from 'react-dom';
import { signOutUser } from '../services/session.js';

const ROUTES = [
  { id: 'path', label: 'Path', path: '/path', icon: '◎', keywords: 'home overview path' },
  { id: 'mind', label: 'Mind', path: '/mind', icon: '◉', keywords: 'journal mood mind' },
  { id: 'body', label: 'Body', path: '/body', icon: '○', keywords: 'body water sleep' },
  { id: 'discipline', label: 'Discipline', path: '/discipline', icon: '△', keywords: 'habits tasks' },
  { id: 'shadow', label: 'Shadow', path: '/shadow', icon: '◐', keywords: 'shadow journal' },
  { id: 'progress', label: 'Progress', path: '/progress', icon: '▷', keywords: 'progress review' },
  { id: 'voice', label: 'Voice', path: '/voice', icon: '◈', keywords: 'voice coach talk' },
  { id: 'wisdom', label: 'Wisdom', path: '/wisdom', icon: '◇', keywords: 'wisdom library' },
  { id: 'goals', label: 'Goals', path: '/goals', icon: '□', keywords: 'goals' },
  { id: 'focus', label: 'Focus', path: '/focus', icon: '◯', keywords: 'timer focus' },
  { id: 'profile', label: 'You', path: '/profile', icon: '▣', keywords: 'profile you settings' },
];

const ACTIONS = [
  { id: 'theme', label: 'Toggle Dark/Light Mode', icon: '🌙', keywords: 'theme mode dark light appearance', action: 'toggle-theme' },
  { id: 'signout', label: 'Sign Out', icon: '🚪', keywords: 'logout exit quit', action: 'sign-out' },
];

function fuzzyMatch(text, query) {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  if (lower.includes(q)) return true;
  let qi = 0;
  for (let i = 0; i < lower.length && qi < q.length; i++) {
    if (lower[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Open/close with Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Auto-focus input when opening
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const allItems = useMemo(() => [...ROUTES, ...ACTIONS], []);

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems;
    return allItems.filter((item) =>
      fuzzyMatch(item.label + ' ' + (item.keywords || ''), query)
    );
  }, [query, allItems]);

  // Keep selectedIndex in bounds
  useEffect(() => {
    if (selectedIndex >= filtered.length) setSelectedIndex(Math.max(0, filtered.length - 1));
  }, [filtered.length, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.children[selectedIndex];
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const executeItem = useCallback((item) => {
    setOpen(false);
    if (item.path) {
      navigate(item.path);
    } else if (item.action === 'toggle-theme') {
      // Dispatch theme toggle if available (placeholder)
      document.body.classList.toggle('light-mode');
    } else if (item.action === 'sign-out') {
      void signOutUser(dispatch, navigate);
    }
  }, [dispatch, navigate]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      executeItem(filtered[selectedIndex]);
    }
  }, [filtered, selectedIndex, executeItem]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div style={overlayStyle} onClick={() => setOpen(false)}>
      <div style={paletteStyle} onClick={(e) => e.stopPropagation()}>
        {/* Search input */}
        <div style={inputWrapStyle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b949e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search…"
            style={inputStyle}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd style={kbdStyle}>Esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={listStyle}>
          {filtered.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#8b949e', fontSize: 14 }}>
              No results found
            </div>
          )}
          {filtered.map((item, i) => (
            <button
              key={item.id}
              onClick={() => executeItem(item)}
              onMouseEnter={() => setSelectedIndex(i)}
              style={{
                ...itemStyle,
                background: i === selectedIndex ? 'rgba(123,104,238,0.12)' : 'transparent',
                borderLeft: i === selectedIndex ? '2px solid #7b68ee' : '2px solid transparent',
              }}
            >
              <span style={{ fontSize: 18, width: 28, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {item.path && <span style={{ fontSize: 11, color: '#6e7681', fontFamily: 'var(--font-mono)' }}>{item.path}</span>}
              {item.action && <span style={{ fontSize: 11, color: '#6e7681', fontStyle: 'italic' }}>action</span>}
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div style={footerStyle}>
          <span><kbd style={kbdSmall}>↑↓</kbd> navigate</span>
          <span><kbd style={kbdSmall}>↵</kbd> select</span>
          <span><kbd style={kbdSmall}>esc</kbd> close</span>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Styles ── */

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 99999,
  background: 'rgba(0,0,0,0.55)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  paddingTop: '12vh',
};

const paletteStyle = {
  width: '100%',
  maxWidth: 560,
  background: '#161b22',
  border: '1px solid #30363d',
  borderRadius: 16,
  boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(123,104,238,0.08)',
  overflow: 'hidden',
  animation: 'cmdPaletteIn 0.18s cubic-bezier(0.16,1,0.3,1)',
};

const inputWrapStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '14px 18px',
  borderBottom: '1px solid #21262d',
};

const inputStyle = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: '#c9d1d9',
  fontSize: 15,
  fontFamily: 'inherit',
};

const kbdStyle = {
  padding: '2px 8px',
  fontSize: 11,
  background: '#21262d',
  border: '1px solid #30363d',
  borderRadius: 6,
  color: '#8b949e',
  fontFamily: 'var(--font-mono)',
};

const listStyle = {
  maxHeight: '40vh',
  overflowY: 'auto',
  padding: '6px 0',
};

const itemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '10px 18px',
  background: 'transparent',
  border: 'none',
  color: '#c9d1d9',
  fontSize: 14,
  fontFamily: 'inherit',
  cursor: 'pointer',
  transition: 'background 0.1s',
};

const footerStyle = {
  display: 'flex',
  gap: 16,
  padding: '10px 18px',
  borderTop: '1px solid #21262d',
  fontSize: 12,
  color: '#6e7681',
};

const kbdSmall = {
  padding: '1px 5px',
  fontSize: 10,
  background: '#21262d',
  border: '1px solid #30363d',
  borderRadius: 4,
  color: '#8b949e',
  fontFamily: 'var(--font-mono)',
  marginRight: 3,
};

// Inject keyframe animation
if (typeof document !== 'undefined' && !document.getElementById('cmd-palette-anim')) {
  const style = document.createElement('style');
  style.id = 'cmd-palette-anim';
  style.textContent = `@keyframes cmdPaletteIn { from { opacity:0; transform:scale(0.96) translateY(-8px); } to { opacity:1; transform:scale(1) translateY(0); } }`;
  document.head.appendChild(style);
}
