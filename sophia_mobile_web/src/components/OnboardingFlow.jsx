import React, { useState, useCallback, useEffect } from 'react';

const ONBOARDING_STEP_KEY = 'sophia-onboarding-step';

const OnboardingFlow = ({ onComplete }) => {
  const savedStep = parseInt(localStorage.getItem(ONBOARDING_STEP_KEY) || '0', 10);
  const [step, setStep] = useState(savedStep);
  const [formData, setFormData] = useState({
    name: '',
    selectedGoals: [],
    focusAreas: [],
    notifications: { daily: true, weekly: true, achievements: true },
  });

  useEffect(() => {
    localStorage.setItem(ONBOARDING_STEP_KEY, String(step));
  }, [step]);

  const steps = [
    { id: 'nameGoals', title: 'Welcome to SOPHIA', subtitle: 'Tell us about yourself', icon: '🚀', type: 'nameGoals' },
    { id: 'focus', title: 'Choose your focus', subtitle: 'What matters most to you?', icon: '🎯', type: 'focus' },
    { id: 'notifications', title: 'Stay on track', subtitle: 'Notification preferences', icon: '🔔', type: 'notifications' },
    { id: 'complete', title: "You're all set, {name}!", subtitle: 'Your journey begins now', icon: '✅', type: 'complete' },
  ];

  const handleNext = useCallback(() => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      if (onComplete) onComplete(formData);
    }
  }, [step, formData, onComplete]);

  const handlePrevious = useCallback(() => {
    if (step > 0) setStep(step - 1);
  }, [step]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleArrayItem = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  }, []);

  const toggleNotification = useCallback((key) => {
    setFormData(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }));
  }, []);

  const currentStep = steps[step];
  const stepTitle = currentStep.title.replace('{name}', formData.name || 'Friend');
  const progress = ((step + 1) / steps.length) * 100;

  const goalOptions = [
    'Strengthen focus & concentration', 'Build emotional resilience',
    'Improve time management', 'Enhance communication skills',
    'Develop leadership qualities', 'Cultivate mindfulness',
    'Boost creativity & innovation', 'Expand financial literacy',
    'Improve physical fitness', 'Strengthen spiritual grounding',
    'Build consistent study habits', 'Reduce procrastination',
    'Improve decision-making skills', 'Enhance social connections',
    'Develop problem-solving ability',
  ];
  const focusOptions = [
    { value: 'body', label: 'Build my body', icon: '💪' },
    { value: 'mind', label: 'Master my mind', icon: '🧠' },
    { value: 'discipline', label: 'Build discipline', icon: '⭐' },
    { value: 'habits', label: 'Build daily habits', icon: '📋' },
    { value: 'career', label: 'Grow my career', icon: '💼' },
    { value: 'transform', label: 'Transform everything', icon: '🚀' },
  ];
  const notifOptions = [
    { key: 'daily', label: 'Daily reminders', desc: 'Get morning and evening check-ins' },
    { key: 'weekly', label: 'Weekly progress reports', desc: 'Summary of your week every Sunday' },
    { key: 'achievements', label: 'Achievement alerts', desc: 'Celebrate milestones as you earn them' },
  ];

  const canProceed = () => {
    if (step === 0) return formData.name.trim().length > 0 && formData.selectedGoals.length > 0;
    if (step === 1) return formData.focusAreas.length > 0;
    return true;
  };

  const s = {
    container: {
      minHeight: '100vh', width: '100%',
      backgroundImage: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)', color: '#F4FBFF',
      fontFamily: "'Dark Castle'",
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
      boxSizing: 'border-box',
    },
    bg: {
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: `radial-gradient(circle at 18% 18%, rgba(0,212,255,0.14) 0%, transparent 20%),
        radial-gradient(circle at 82% 14%, rgba(123,47,255,0.16) 0%, transparent 22%),
        radial-gradient(circle at 78% 80%, rgba(0,212,255,0.1) 0%, transparent 20%)`,
    },
    card: {
      background: 'linear-gradient(180deg, rgba(7,15,32,0.92), rgba(5,12,24,0.94))', backdropFilter: 'blur(28px)',
      border: '1px solid rgba(0,212,255,0.16)', borderRadius: '32px',
      padding: '38px 32px', maxWidth: '540px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
      boxShadow: '0 30px 80px rgba(0,0,0,0.52), 0 0 0 1px rgba(123,47,255,0.08)',
      position: 'relative', zIndex: 1, animation: 'onb-slideIn 0.5s cubic-bezier(0.22,1,0.36,1)',
    },
    progBar: { width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', marginBottom: '30px', overflow: 'hidden' },
    progFill: {
      height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-violet), var(--color-primary))',
      width: `${progress}%`, transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
      borderRadius: '999px', boxShadow: '0 0 18px rgba(0,212,255,0.26)',
    },
    icon: { fontSize: '64px', marginBottom: '18px', animation: 'onb-bounceIn 0.6s ease-out', filter: 'drop-shadow(0 10px 18px rgba(0,212,255,0.22))' },
    title: {
      fontSize: '40px', marginBottom: '10px', fontWeight: '800', letterSpacing: '-0.05em',
      background: 'linear-gradient(135deg, #f5fbff, var(--color-primary) 55%, var(--color-violet))',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      fontFamily: "'Dark Castle'", lineHeight: 0.98,
    },
    subtitle: { fontSize: '17px', marginBottom: '24px', color: '#8ea7c2', fontWeight: '500' },
    input: {
      width: '100%', background: 'rgba(8,19,38,0.88)', border: '1px solid rgba(0,212,255,0.12)',
      borderRadius: '18px', padding: '15px 18px', color: '#f5fbff', fontSize: '15px', fontFamily: 'inherit',
      marginBottom: '20px', boxSizing: 'border-box', transition: 'all 0.3s', outline: 'none',
    },
    chip: (active) => ({
      display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 18px', borderRadius: '999px',
      cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px', fontWeight: '500', border: 'none',
      background: active ? 'linear-gradient(135deg, rgba(0,212,255,0.18), rgba(123,47,255,0.14))' : 'rgba(8,19,38,0.82)',
      color: '#f5fbff',
      outline: active ? '1px solid rgba(0,212,255,0.24)' : '1px solid rgba(255,255,255,0.08)',
    }),
    focusCard: (active) => ({
      display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', borderRadius: '20px',
      cursor: 'pointer', transition: 'all 0.2s', marginBottom: '10px', border: 'none', width: '100%', textAlign: 'left',
      background: active ? 'linear-gradient(135deg, rgba(0,212,255,0.16), rgba(123,47,255,0.14))' : 'rgba(8,19,38,0.82)',
      outline: active ? '1px solid rgba(0,212,255,0.26)' : '1px solid rgba(255,255,255,0.08)',
      boxShadow: active ? '0 16px 32px rgba(0,212,255,0.12)' : 'none',
    }),
    notifRow: (on) => ({
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px',
      borderRadius: '14px', marginBottom: '10px', cursor: 'pointer', transition: 'all 0.2s', border: 'none', width: '100%', textAlign: 'left',
      background: on ? 'linear-gradient(135deg, rgba(0,212,255,0.14), rgba(123,47,255,0.12))' : 'rgba(8,19,38,0.8)',
      outline: on ? '1px solid rgba(0,212,255,0.22)' : '1px solid rgba(255,255,255,0.08)',
    }),
    toggle: (on) => ({
      width: '44px', height: '24px', borderRadius: '12px', position: 'relative', flexShrink: 0,
      background: on ? 'linear-gradient(135deg, var(--color-primary), var(--color-violet))' : 'rgba(255,255,255,0.12)',
      transition: 'background 0.3s',
    }),
    toggleDot: (on) => ({
      position: 'absolute', top: '3px', left: on ? '23px' : '3px', width: '18px', height: '18px',
      borderRadius: '50%', background: '#fff', transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    }),
    btns: { display: 'flex', gap: '16px', justifyContent: 'space-between', marginTop: '32px' },
    backBtn: {
      padding: '14px 28px', borderRadius: '18px', border: 'none', fontSize: '16px', fontWeight: '600',
      cursor: step === 0 ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'all 0.3s',
      background: 'transparent', color: step === 0 ? 'rgba(142,167,194,0.34)' : '#8ea7c2',
      outline: `1px solid ${step === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,212,255,0.16)'}`,
      opacity: step === 0 ? 0.4 : 1, minWidth: '100px',
    },
    nextBtn: {
      padding: '15px 28px', borderRadius: '18px', border: 'none', fontSize: '16px', fontWeight: '700',
      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.3s', flex: 1,
      background: canProceed() ? 'linear-gradient(135deg, #30cfd0, #5b2aa8)' : 'rgba(255,255,255,0.08)',
      color: canProceed() ? '#F4FBFF' : 'rgba(244,251,255,0.45)',
      boxShadow: canProceed() ? '0 18px 36px rgba(0,212,255,0.22)' : 'none',
    },
    stepText: { textAlign: 'center', color: '#8ea7c2', marginTop: '24px', fontSize: '14px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase' },
  };

  return (
    <div style={s.container}>
      <style>{`
        @keyframes onb-slideIn { from { opacity:0; transform:translateY(24px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes onb-bounceIn { 0% { opacity:0; transform:scale(0.4) } 60% { opacity:1; transform:scale(1.08) } 100% { transform:scale(1) } }
        .onb-input:focus { border-color:rgba(0,212,255,0.45) !important; box-shadow:0 0 0 6px rgba(0,212,255,0.1) !important }
        .onb-next:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 18px 42px rgba(0,212,255,0.3) }
        .onb-next:active:not(:disabled) { transform:translateY(0) }
      `}</style>
      <div style={s.bg} />
      <div style={s.card}>
        <div style={s.progBar}><div style={s.progFill} /></div>
        <div style={s.icon}>{currentStep.icon}</div>
        <h1 style={s.title}>{stepTitle}</h1>
        <p style={s.subtitle}>{currentStep.subtitle}</p>

        {/* STEP 1 — Name + Goals */}
        {currentStep.type === 'nameGoals' && (
          <>
            <input type="text" placeholder="Enter your name" value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              style={s.input} className="onb-input" />
            <p style={{ color: '#8ea7c2', fontSize: '13px', marginBottom: '12px' }}>Pick up to 3 goals</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {goalOptions.map(g => (
                <button key={g} type="button" style={s.chip(formData.selectedGoals.includes(g))}
                  onClick={() => { if (formData.selectedGoals.includes(g) || formData.selectedGoals.length < 3) toggleArrayItem('selectedGoals', g); }}>
                  {g}
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 2 — Focus Areas */}
        {currentStep.type === 'focus' && (
          <div>
            {focusOptions.map(f => (
              <button key={f.value} type="button" style={s.focusCard(formData.focusAreas.includes(f.value))}
                onClick={() => toggleArrayItem('focusAreas', f.value)}>
                <span style={{ fontSize: '28px' }}>{f.icon}</span>
                <span style={{ color: formData.focusAreas.includes(f.value) ? 'var(--color-primary)' : '#f5fbff', fontSize: '15px', fontWeight: '500' }}>{f.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* STEP 3 — Notification Preferences */}
        {currentStep.type === 'notifications' && (
          <div>
            {notifOptions.map(n => (
              <button key={n.key} type="button" style={s.notifRow(formData.notifications[n.key])}
                onClick={() => toggleNotification(n.key)}>
                <div>
                  <div style={{ color: '#f5fbff', fontSize: '15px', fontWeight: '500' }}>{n.label}</div>
                  <div style={{ color: '#8ea7c2', fontSize: '13px', marginTop: '4px' }}>{n.desc}</div>
                </div>
                <div style={s.toggle(formData.notifications[n.key])}>
                  <div style={s.toggleDot(formData.notifications[n.key])} />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* STEP 4 — Complete */}
        {currentStep.type === 'complete' && (
          <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'onb-bounceIn 0.6s ease-out' }}>🚀</div>
            {[
              { icon: '✅', text: 'Your goals are set' },
              { icon: '✅', text: 'Your focus areas are locked in' },
              { icon: '✅', text: 'Your dashboard is ready' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', marginBottom: '8px', borderRadius: '12px',
                background: 'rgba(8,19,38,0.82)', border: '1px solid rgba(0,212,255,0.12)',
                animation: `onb-slideIn 0.4s cubic-bezier(0.16,1,0.3,1) ${0.2 + i * 0.15}s both`,
              }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span style={{ color: '#f5fbff', fontWeight: '500', fontSize: '14px' }}>{item.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div style={s.btns}>
          <button onClick={handlePrevious} disabled={step === 0} style={s.backBtn}>← Back</button>
          <button onClick={handleNext} disabled={!canProceed()} style={s.nextBtn} className="onb-next">
            {step === steps.length - 1 ? '🚀 Enter SOPHIA' : 'Next →'}
          </button>
        </div>
        <p style={s.stepText}>Step {step + 1} of {steps.length}</p>
      </div>
    </div>
  );
};

export default OnboardingFlow;
