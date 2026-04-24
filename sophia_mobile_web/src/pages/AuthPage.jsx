import React, { useState, useEffect, useRef } from 'react';
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const usingFirebase = import.meta.env.VITE_USE_FIREBASE === 'true';

  // ── Mini particle canvas for auth background ──
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const mouse = { x: -9999, y: -9999 };
    const COLORS = [[180,100,255],[100,180,255],[255,100,200],[100,255,220],[201,168,76]];
    const dpr = window.devicePixelRatio || 1;
    let W, H, rW, rH, particles = [];

    function rand(a,b){ return a + Math.random()*(b-a); }
    function resize(){
      const rect = canvas.getBoundingClientRect();
      W = canvas.width = rect.width * dpr;
      H = canvas.height = rect.height * dpr;
      rW = rect.width; rH = rect.height;
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    function init(){
      resize();
      const n = Math.min(160, Math.floor((rW*rH)/6000));
      particles = [];
      for(let i=0;i<n;i++){
        const col = COLORS[Math.floor(Math.random()*COLORS.length)];
        particles.push({
          x:rand(0,rW), y:rand(0,rH), z:rand(0.15,1),
          vx:rand(-0.2,0.2), vy:rand(-0.2,0.2),
          r:rand(0.6,2.2), col, alpha:rand(0.3,0.9),
          pulse:rand(0,Math.PI*2), pulseSpeed:rand(0.008,0.02),
          trail:[],
        });
      }
    }
    function draw(){
      ctx.fillStyle='rgba(10,10,10,0.25)';
      ctx.fillRect(0,0,rW,rH);
      const mx=mouse.x, my=mouse.y;
      for(const p of particles){
        p.pulse+=p.pulseSpeed;
        const pf=0.7+0.3*Math.sin(p.pulse);
        const dx=p.x-mx, dy=p.y-my;
        const dist=Math.sqrt(dx*dx+dy*dy)||1;
        const force=Math.max(0,1-dist/130);
        p.vx+=(dx/dist)*force*0.15*p.z;
        p.vy+=(dy/dist)*force*0.15*p.z;
        p.vx*=0.97; p.vy*=0.97;
        p.x+=p.vx+Math.sin(p.pulse*0.5)*0.06;
        p.y+=p.vy+Math.cos(p.pulse*0.4)*0.06;
        if(p.x<-10)p.x=rW+10; if(p.x>rW+10)p.x=-10;
        if(p.y<-10)p.y=rH+10; if(p.y>rH+10)p.y=-10;
        p.trail.push({x:p.x,y:p.y});
        if(p.trail.length>10)p.trail.shift();
        const[r,g,b]=p.col;
        if(p.trail.length>2){
          ctx.beginPath(); ctx.moveTo(p.trail[0].x,p.trail[0].y);
          for(let i=1;i<p.trail.length;i++) ctx.lineTo(p.trail[i].x,p.trail[i].y);
          ctx.strokeStyle=`rgba(${r},${g},${b},${p.alpha*0.1*p.z*pf})`;
          ctx.lineWidth=p.r*p.z*0.5; ctx.lineCap='round'; ctx.stroke();
        }
        const glowR=p.r*p.z*pf*4;
        const grd=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,glowR);
        grd.addColorStop(0,`rgba(${r},${g},${b},${p.alpha*0.18*p.z})`);
        grd.addColorStop(1,`rgba(${r},${g},${b},0)`);
        ctx.beginPath(); ctx.arc(p.x,p.y,glowR,0,Math.PI*2);
        ctx.fillStyle=grd; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r*p.z*pf,0,Math.PI*2);
        ctx.fillStyle=`rgba(${r},${g},${b},${p.alpha*p.z})`; ctx.fill();
      }
      for(let i=0;i<particles.length;i++){
        for(let j=i+1;j<particles.length;j++){
          const a=particles[i],bP=particles[j];
          const dx=a.x-bP.x,dy=a.y-bP.y,dist=Math.sqrt(dx*dx+dy*dy);
          const dax=a.x-mx,day=a.y-my,distA=Math.sqrt(dax*dax+day*day);
          if(dist<65&&distA<140){
            const al=(1-dist/65)*(1-distA/140)*0.3;
            const [r,g,b]=COLORS[(i+j)%COLORS.length];
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(bP.x,bP.y);
            ctx.strokeStyle=`rgba(${r},${g},${b},${al})`; ctx.lineWidth=0.4; ctx.stroke();
          }
        }
      }
      if(mx>0&&mx<rW){
        const cg=ctx.createRadialGradient(mx,my,0,mx,my,50);
        cg.addColorStop(0,'rgba(180,100,255,0.18)');
        cg.addColorStop(0.4,'rgba(100,180,255,0.08)');
        cg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(mx,my,50,0,Math.PI*2);
        ctx.fillStyle=cg; ctx.fill();
      }
      raf=requestAnimationFrame(draw);
    }
    function onMouse(e){ const r=canvas.getBoundingClientRect(); mouse.x=e.clientX-r.left; mouse.y=e.clientY-r.top; }
    function onLeave(){ mouse.x=-9999; mouse.y=-9999; }
    init(); draw();
    window.addEventListener('mousemove',onMouse);
    window.addEventListener('mouseleave',onLeave);
    window.addEventListener('resize',init);
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('mousemove',onMouse); window.removeEventListener('mouseleave',onLeave); window.removeEventListener('resize',init); };
  }, []);

  useEffect(() => {
    dispatch(logout());
    dispatch(resetOnboarding());
    requestAnimationFrame(() => setVisible(true));
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
    setMode(next); setError(''); setFieldErrors({});
    setName(''); setEmail(''); setPassword(''); setConfirmPassword('');
  }

  function useDemoCredentials() {
    setEmail('testuser@sophia.dev');
    setPassword('TestPass123!');
    setError('');
    setFieldErrors({});
    setMode('login');
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
      { label: 'Very weak', color: '#e04a4a' },
      { label: 'Weak', color: '#e04a4a' },
      { label: 'Fair', color: '#c9a84c' },
      { label: 'Good', color: '#c9a84c' },
      { label: 'Strong', color: '#3fb950' },
      { label: 'Very strong', color: '#3fb950' },
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
        setError('Connection issue detected. Using local fallback mode, then try Sign In again.');
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const focusBorder = (field) => fieldErrors[field] ? 'rgba(255,60,30,0.7)' : undefined;

  return (
    <div className={styles.background}>
      {/* Particle canvas behind everything */}
      <canvas ref={canvasRef} className={styles.particleBg} />

      {/* Neon heartbeat ring behind login */}
      <div className={styles.neonRing}>
      </div>

      {/* Auth card */}
      <div
        className={styles.container}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.96)',
          transition: 'opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <p className={styles.kicker}>Personal Operating System</p>
        <h1 className={styles.title}>
          <span className={styles.logoAccent}>S</span>OPHIA
        </h1>
        <p className={styles.subtitle}>Build your body, mind, discipline, and progress inside one high-energy daily command center.</p>

        <div className={styles.metaRow}>
          <span className={`${styles.statusPill} ${isOffline ? styles.statusOffline : styles.statusOnline}`}>
            {isOffline ? 'Offline' : 'Online'}
          </span>
          <span className={styles.statusPill}>{usingFirebase ? 'Firebase Auth' : 'API Auth'}</span>
          <button type="button" className={styles.quickFillBtn} onClick={useDemoCredentials}>Use Demo Login</button>
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
            {submitting ? '✦ Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className={styles.footer}>
          <button type="button" className={styles.forgotLink}>Forgot password?</button>
          <button type="button" className={styles.signupLink} onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Create account →' : '← Back to sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
