import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess, logout } from '../store/slices/authSlice.js';
import { resetOnboarding } from '../store/slices/onboardingSlice.js';
import api from '../services/api.js';
import styles from '../styles/Auth.module.css';

const ONBOARDING_KEY = 'sophia-onboarding-complete';

export default function AuthPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [visible, setVisible] = useState(true);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    dispatch(logout());
    dispatch(resetOnboarding());
  }, [dispatch]);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  function switchMode(next) {
    if (next === mode) return;
    setMode(next); setError(''); setResetMessage(''); setFieldErrors({});
    setName(''); setEmail(''); setPassword(''); setConfirmPassword('');
  }

  async function handleForgotPassword() {
    setError('');
    setResetMessage('');
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setFieldErrors({ email: 'Enter your email first' });
      return;
    }
    if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
      setFieldErrors({ email: 'Enter a valid email address' });
      return;
    }

    setSubmitting(true);
    try {
      await api.forgotPassword(normalizedEmail);
      setResetMessage('Password reset email sent. Check your inbox.');
    } catch (err) {
      const message = String(err?.message || 'Unable to send the reset email.');
      setError(message.replace('auth/', '').replaceAll('-', ' '));
    } finally {
      setSubmitting(false);
    }
  }

  function getPasswordStrength(pw) {
    if (!pw) return { score: 0, label: '', color: 'transparent' };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const levels = [
      { label: 'Still finding its feet', color: '#D9A24B' },
      { label: 'A little more', color: '#D9A24B' },
      { label: 'Coming along', color: '#E9A15B' },
      { label: 'Solid', color: '#6FA98C' },
      { label: 'Strong', color: '#6FA98C' },
      { label: 'Nice and sturdy', color: '#30cfd0' },
    ];
    return { score, ...levels[score] };
  }

  async function handleSubmit(e) {
    e?.preventDefault();
    setError('');
    const errors = {};
    if (!email) errors.email = 'Email is required';
    else if (!email.includes('@') || !email.includes('.')) errors.email = 'Enter a valid email address';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Must be at least 6 characters';
    if (mode === 'register') {
      if (!name.trim()) errors.name = 'Name is required';
      if (password && confirmPassword && password !== confirmPassword) errors.confirm = 'Passwords do not match';
      else if (!confirmPassword) errors.confirm = 'Please confirm your password';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      let result;
      if (mode === 'register') {
        const parts = name.trim().split(/\s+/);
        result = await api.register(email, password, parts[0], parts.slice(1).join(' '));
      } else {
        result = await api.login(email, password);
      }
      const token = result.token;
      const rawUser = result.user || {};
      const user = {
        id: rawUser.id || rawUser.uid || null,
        email: rawUser.email || email,
        name: rawUser.name || rawUser.fullName || rawUser.full_name || email.split('@')[0],
        fullName: rawUser.fullName || rawUser.full_name || rawUser.name || '',
        firstName: rawUser.firstName || '',
        lastName: rawUser.lastName || '',
        role: rawUser.role || 'user',
        level: rawUser.level || 1,
        experience: rawUser.experience || 0,
        avatar: rawUser.avatar || null,
      };
      api.setToken(token);
      localStorage.setItem('sophia-auth-token', token);
      localStorage.setItem('sophia-user-profile', JSON.stringify(user));
      dispatch(loginSuccess({ user, token }));

      const alreadyOnboarded = localStorage.getItem('sophia-onboarding-complete') === 'true';
      setVisible(false);
      setTimeout(() => navigate(alreadyOnboarded ? '/dashboard' : '/onboarding', { replace: true }), 500);
    } catch (err) {
      const message = String(err?.message || 'Authentication failed. Check your credentials.');
      if (/failed to fetch|network|load failed/i.test(message)) {
        setError('We could not reach the server. Try again in a moment — your space is still here.');
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const focusBorder = (field) => fieldErrors[field] ? 'rgba(217,162,75,0.8)' : undefined;

  return (
    <div className={styles.background}>
      <img src="/assets/sophia-gyrate.svg" className={styles.gyrate} alt="" aria-hidden="true" />
      <div className={styles.neonRing} />

      {/* Auth card */}
      <div
        className={styles.container}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.96)',
          transition: 'opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <p className={styles.kicker}>01 / welcome · est. 2026</p>
        <h1 className={styles.title}>
          <span className={styles.logoAccent}>S</span>ophia
        </h1>
        <p className={styles.subtitle}>A calm place to notice how you feel, keep small promises, and grow without the noise.</p>

        <div className={styles.metaRow}>
          <span className={`${styles.statusPill} ${isOffline ? styles.statusOffline : styles.statusOnline}`}>
            <span className="dot" style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: isOffline ? '#E8C36A' : '#30cfd0', marginRight: 8 }} />
            {isOffline ? 'Signal lost' : 'Link live'}
          </span>
        </div>

        {/* Mode tabs */}
        <div className={styles.modeTabs}>
          <button className={`${styles.modeTab} ${mode === 'login' ? styles.modeTabActive : ''}`} onClick={() => switchMode('login')}>Sign In</button>
          <button className={`${styles.modeTab} ${mode === 'register' ? styles.modeTabActive : ''}`} onClick={() => switchMode('register')}>Create Account</button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className={styles.inputWrap}>
              <input
                type="text" placeholder="Your name" value={name}
                onChange={e => { setName(e.target.value); setFieldErrors(p => ({...p, name: undefined})); }}
                style={focusBorder('name') ? { borderColor: focusBorder('name') } : undefined}
                autoComplete="name"
              />
              {fieldErrors.name && <div className={styles.fieldError}>{fieldErrors.name}</div>}
            </div>
          )}

          <div className={styles.inputWrap}>
            <input
              type="email" placeholder="you@example.com" value={email}
              onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({...p, email: undefined})); }}
              style={focusBorder('email') ? { borderColor: focusBorder('email') } : undefined}
              autoComplete="username"
            />
            {fieldErrors.email && <div className={styles.fieldError}>{fieldErrors.email}</div>}
          </div>

          <div className={styles.inputWrap}>
            <div className={styles.passwordRow}>
              <input
                type={showPassword ? 'text' : 'password'} placeholder="Password (6+ chars)" value={password}
                onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({...p, password: undefined})); }}
                style={focusBorder('password') ? { borderColor: focusBorder('password') } : undefined}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {fieldErrors.password && <div className={styles.fieldError}>{fieldErrors.password}</div>}
            {mode === 'register' && password && (() => {
              const str = getPasswordStrength(password);
              return (
                <div className={styles.strengthWrap}>
                  <div className={styles.strengthBar} style={{ width: `${(str.score/5)*100}%`, background: str.color }} />
                  <span className={styles.strengthLabel} style={{ color: str.color }}>{str.label}</span>
                </div>
              );
            })()}
          </div>

          {mode === 'register' && (
            <div className={styles.inputWrap}>
              <input
                type={showPassword ? 'text' : 'password'} placeholder="Confirm password" value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setFieldErrors(p => ({...p, confirm: undefined})); }}
                style={focusBorder('confirm') ? { borderColor: focusBorder('confirm') } : undefined}
                autoComplete="new-password"
              />
              {fieldErrors.confirm && <div className={styles.fieldError}>{fieldErrors.confirm}</div>}
            </div>
          )}

          <button type="submit" className={styles.primaryButton} disabled={submitting || !email || !password}>
            {submitting ? 'One moment…' : mode === 'login' ? 'Come in' : 'Create your space'}
          </button>
        </form>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.forgotLink}
            onClick={handleForgotPassword}
            disabled={submitting}
          >
            {submitting ? 'Sending reset email...' : 'Forgot password?'}
          </button>
          <button type="button" className={styles.signupLink} onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Create account →' : '← Back to sign in'}
          </button>
        </div>
        {resetMessage && <div className={styles.success}>{resetMessage}</div>}
        <p className={styles.githubNote}>
          Source lives on{' '}
          <a href="https://github.com/cyber-urbanrebel/sophia2" target="_blank" rel="noreferrer">GitHub</a>
          — not a demo replica.
        </p>
      </div>
    </div>
  );
}
