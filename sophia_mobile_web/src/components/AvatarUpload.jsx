import React, { useState, useRef, useCallback } from 'react';

const AVATAR_KEY = 'sophia_user_avatar';
const MAX_SIZE = 512 * 1024; // 512KB max

function getStoredAvatar() {
  try {
    return localStorage.getItem(AVATAR_KEY) || null;
  } catch {
    return null;
  }
}

function storeAvatar(dataUrl) {
  try {
    localStorage.setItem(AVATAR_KEY, dataUrl);
  } catch {
    // localStorage full — silently fail
  }
}

function clearAvatar() {
  try {
    localStorage.removeItem(AVATAR_KEY);
  } catch {
    // ignore
  }
}

/**
 * AvatarUpload — Cinematic avatar component for Sophia.
 * @param {Object} props
 * @param {number} [props.size=96] — diameter in px
 * @param {string} [props.fallbackName] — user name for initials fallback
 * @param {boolean} [props.editable=true] — show upload overlay
 * @param {function} [props.onAvatarChange] — callback(dataUrl | null)
 */
export default function AvatarUpload({ size = 96, fallbackName = 'User', editable = true, onAvatarChange }) {
  const [avatarUrl, setAvatarUrl] = useState(getStoredAvatar);
  const [hover, setHover] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const initials = (fallbackName || 'U')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  const handleFile = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) return;
      if (file.size > MAX_SIZE * 4) return; // Allow reading up to 2MB then compress

      setSaving(true);
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          // Resize to 256x256 for storage efficiency
          const canvas = document.createElement('canvas');
          const dim = 256;
          canvas.width = dim;
          canvas.height = dim;
          const ctx = canvas.getContext('2d');

          // Crop center square
          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;
          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, dim, dim);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          storeAvatar(dataUrl);
          setAvatarUrl(dataUrl);
          setSaving(false);
          onAvatarChange?.(dataUrl);
        };
        img.onerror = () => setSaving(false);
        img.src = reader.result;
      };
      reader.onerror = () => setSaving(false);
      reader.readAsDataURL(file);
    },
    [onAvatarChange]
  );

  const handleRemove = useCallback(
    (e) => {
      e.stopPropagation();
      clearAvatar();
      setAvatarUrl(null);
      onAvatarChange?.(null);
    },
    [onAvatarChange]
  );

  const fontSize = Math.round(size * 0.35);

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Ring glow */}
      <div
        style={{
          position: 'absolute',
          inset: -3,
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, #00d4ff, #bb86fc, #ffaa00, #00d4ff)',
          opacity: hover ? 0.9 : 0.5,
          transition: 'opacity 0.4s ease',
          filter: 'blur(1px)',
        }}
      />

      {/* Avatar circle */}
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          cursor: editable ? 'pointer' : 'default',
          background: avatarUrl
            ? 'transparent'
            : 'linear-gradient(135deg, rgba(0,212,255,0.25), rgba(187,134,252,0.25))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px solid #0f0f1a',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          transform: hover ? 'scale(1.05)' : 'scale(1)',
          boxShadow: hover
            ? '0 0 24px rgba(0,212,255,0.4)'
            : '0 4px 12px rgba(0,0,0,0.4)',
        }}
        onClick={() => editable && fileRef.current?.click()}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <span
            style={{
              fontSize,
              fontWeight: 700,
              color: '#fff',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              letterSpacing: '1px',
              fontFamily: '"Inter", -apple-system, sans-serif',
            }}
          >
            {initials}
          </span>
        )}

        {/* Hover overlay */}
        {editable && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.55)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: hover ? 1 : 0,
              transition: 'opacity 0.3s ease',
              borderRadius: '50%',
            }}
          >
            {saving ? (
              <div
                style={{
                  width: 20,
                  height: 20,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#00d4ff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span style={{ fontSize: 10, color: '#fff', marginTop: 4, fontWeight: 600 }}>
                  {avatarUrl ? 'Change' : 'Upload'}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Remove button */}
      {editable && avatarUrl && hover && (
        <button
          onClick={handleRemove}
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: '#ff1744',
            border: '2px solid #0f0f1a',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            transition: 'transform 0.2s ease',
          }}
          title="Remove avatar"
        >
          ×
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFile}
        style={{ display: 'none' }}
      />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * AvatarDisplay — Read-only avatar for headers/nav.
 */
export function AvatarDisplay({ size = 36, fallbackName = 'User' }) {
  const [avatarUrl] = useState(getStoredAvatar);
  const initials = (fallbackName || 'U')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
  const fontSize = Math.round(size * 0.38);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        background: avatarUrl
          ? 'transparent'
          : 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(187,134,252,0.3))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid rgba(0,212,255,0.3)',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ fontSize, fontWeight: 700, color: '#fff', fontFamily: '"Inter", sans-serif' }}>{initials}</span>
      )}
    </div>
  );
}
