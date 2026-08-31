import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess, logout } from '../store/slices/authSlice.js';
import { resetOnboarding } from '../store/slices/onboardingSlice.js';
import api from '../services/api.js';
import styles from '../styles/Auth.module.css';

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

  function formatAuthError(err) {
    const raw = String(err?.code || err?.message || 'Authentication failed.');
    const code = String(err?.code || '');
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request' || /popup-closed-by-user/i.test(raw)) {
      return 'Google sign-in was cancelled.';
    }
    if (code === 'auth/popup-blocked' || /popup-blocked/i.test(raw)) {
      return 'The Google window was blocked. Allow popups for this site and try again.';
    }
    if (code === 'auth/unauthorized-domain' || /unauthorized-domain/i.test(raw)) {
      return 'This site is not yet allowed in Firebase. Add sophia-api-s7t4.onrender.com under Authentication → Settings → Authorized domains.';
    }
    if (code === 'auth/operation-not-allowed' || /operation-not-allowed/i.test(raw)) {
      return 'Google sign-in is not enabled yet. Turn on Google in Firebase Authentication → Sign-in method.';
    }
    if (/HTTP 401|invalid_credentials|invalid credentials/i.test(raw)) {
      return 'Email or password did not match a Firebase account. Use Create Account, or Continue with Google.';
    }
      return 'We could not reach the server. Try again in a moment — your space is still here.';
    }
    return raw.replace(/^Firebase:\s*/i, '').replace(/auth\//, '').replaceAll('-', ' ');
  }

  async function enterSession(result, fallbackEmail = '') {
    const token = result.token;
    const rawUser = result.user || {};
    const user = {
      id: rawUser.id || rawUser.uid || null,
      email: rawUser.email || fallbackEmail,
      name: rawUser.name || rawUser.fullName || rawUser.full_name || (rawUser.email || fallbackEmail || '').split('@')[0] || 'Sophia User',
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
    navigate(alreadyOnboarded ? '/dashboard' : '/onboarding', { replace: true });
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
      await enterSession(result, email);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setResetMessage('');
    setSubmitting(true);
    try {
      const result = await api.loginWithGoogle();
      await enterSession(result);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  const focusBorder = (field) => (fieldErrors[field] ? 'rgba(217,162,75,0.8)' : undefined);
  const passwordStrength = mode === 'register' && password ? getPasswordStrength(password) : null;

  return (
    <div className={`${styles.background} authRoot`}>
      <img src="/assets/sophia-gyrate.svg" className={styles.gyrate} alt="" aria-hidden="true" />
      <div className={styles.neonRing} />

      <div className={styles.container}>
        <p className={styles.kicker}>01 / welcome · est. 2026</p>
        <h1 className={styles.title}>
          <span className={styles.logoAccent}>S</span>ophia
        </h1>
        <p className={styles.subtitle}>A digital wellness platform designed to support self-awareness, steady habits, and personal growth at EVERY stage of life.</p>

        <div className={styles.metaRow}>
          <span className={`${styles.statusPill} ${isOffline ? styles.statusOffline : styles.statusOnline}`}>
            <span className="dot" style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: isOffline ? '#E8C36A' : '#30cfd0', marginRight: 8 }} />
            {isOffline ? 'Signal lost' : 'Link live'}
          </span>
        </div>

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
            {passwordStrength && (
              <div className={styles.strengthWrap}>
                <div
                  className={styles.strengthBar}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%`, background: passwordStrength.color }}
                />
                <span className={styles.strengthLabel} style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
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

        <div className={styles.divider}><span>or</span></div>

        <button type="button" className={styles.googleButton} onClick={handleGoogleSignIn} disabled={submitting}>
          <svg className={styles.googleIcon} viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M23.49 12.27c0-.82-.07-1.64-.23-2.43H12v4.6h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.55-5.17 3.55-8.79z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.94l-3.88-3c-1.08.72-2.47 1.14-4.07 1.14-3.13 0-5.78-2.11-6.73-4.96H1.26v3.09A12 12 0 0 0 12 24z" />
            <path fill="#FBBC05" d="M5.27 14.24A7.2 7.2 0 0 1 4.89 12c0-.78.14-1.53.38-2.24V6.67H1.26A12 12 0 0 0 0 12c0 1.94.46 3.77 1.26 5.33l4.01-3.09z" />
            <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.58 1.78l3.44-3.44C17.95 1.14 15.24 0 12 0 7.31 0 3.26 2.69 1.26 6.67l4.01 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
          </svg>
          Continue with Google
        </button>

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
      </div>
    </div>
  );
}
