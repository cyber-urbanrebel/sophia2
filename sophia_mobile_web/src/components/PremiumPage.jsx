import React, { useState, useEffect } from 'react';
import api from '../services/api.js';

const PREMIUM_KEY = 'sophia_premium_status';

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 299,
    priceLabel: 'KES 299/mo',
    desc: 'Billed monthly, cancel anytime',
    badge: null,
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    price: 699,
    priceLabel: 'KES 699/3mo',
    desc: 'Save 22% — KES 233/mo',
    badge: 'POPULAR',
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 1999,
    priceLabel: 'KES 1,999/yr',
    desc: 'Save 44% — KES 167/mo',
    badge: 'BEST VALUE',
  },
];

const FEATURES = {
  free: [
    'Basic habit tracking (5 habits)',
    'Focus Timer (3 sessions/day)',
    'Journal (text only)',
    'Basic dashboard stats',
  ],
  premium: [
    'Unlimited habits & goals',
    'Unlimited Focus Timer sessions',
    'AI Coach — unlimited chats',
    'Advanced Analytics & insights',
    'PDF Progress Reports',
    'Journal mood & sentiment analysis',
    'Custom notification schedules',
    'Priority support',
    'Early access to new features',
  ],
};

function loadPremiumStatus() {
  try {
    const raw = localStorage.getItem(PREMIUM_KEY);
    return raw ? JSON.parse(raw) : { active: false };
  } catch { return { active: false }; }
}

export function isPremium() {
  const status = loadPremiumStatus();
  if (!status.active) return false;
  if (status.expiresAt && new Date(status.expiresAt) < new Date()) return false;
  return true;
}

export default function PremiumPage() {
  const [selectedPlan, setSelectedPlan] = useState('quarterly');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState(loadPremiumStatus);
  const [paying, setPaying] = useState(false);
  const [payResult, setPayResult] = useState(null);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState(null);

  const isActive = status.active && (!status.expiresAt || new Date(status.expiresAt) > new Date());

  const handlePayment = async () => {
    if (!phone || phone.length < 10) {
      setError('Enter a valid M-Pesa phone number (e.g. 0712345678)');
      return;
    }
    setError(null);
    setPaying(true);
    setPayResult(null);

    try {
      const plan = PLANS.find(p => p.id === selectedPlan);
      const result = await api.initiateMPesaPayment(plan.price, phone);
      setPayResult(result);

      // Poll for payment confirmation
      if (result.transactionId || result.CheckoutRequestID) {
        setPolling(true);
        const txId = result.transactionId || result.CheckoutRequestID;
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          try {
            const check = await api.checkPaymentStatus(txId);
            if (check.status === 'completed' || check.paid) {
              clearInterval(interval);
              setPolling(false);
              const expiresAt = new Date();
              if (selectedPlan === 'monthly') expiresAt.setMonth(expiresAt.getMonth() + 1);
              else if (selectedPlan === 'quarterly') expiresAt.setMonth(expiresAt.getMonth() + 3);
              else expiresAt.setFullYear(expiresAt.getFullYear() + 1);

              const newStatus = { active: true, plan: selectedPlan, expiresAt: expiresAt.toISOString(), activatedAt: new Date().toISOString() };
              localStorage.setItem(PREMIUM_KEY, JSON.stringify(newStatus));
              setStatus(newStatus);
            }
          } catch {}
          if (attempts >= 12) { clearInterval(interval); setPolling(false); }
        }, 5000);
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Try again.');
    } finally {
      setPaying(false);
    }
  };

  const s = {
    page: { minHeight: '100vh', padding: '32px 24px', color: '#e0ddd6', fontFamily: '"Inter", -apple-system, sans-serif', maxWidth: 540, margin: '0 auto' },
    header: { fontSize: 28, fontWeight: 700, marginBottom: 4, background: 'linear-gradient(135deg, #c9a84c, #f0d78c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    sub: { color: '#8a8a9a', fontSize: 14, marginBottom: 24 },
    activeCard: {
      background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(240,215,140,0.05))',
      border: '1px solid rgba(201,168,76,0.3)', borderRadius: 16, padding: '24px', marginBottom: 28, textAlign: 'center',
    },
    activeBadge: {
      display: 'inline-block', padding: '4px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700,
      background: 'linear-gradient(135deg, #c9a84c, #f0d78c)', color: '#0a0a14', marginBottom: 12, letterSpacing: 1,
    },
    planGrid: { display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' },
    planCard: (active) => ({
      flex: 1, minWidth: 130, padding: '16px 14px', borderRadius: 14, cursor: 'pointer', textAlign: 'center',
      background: active ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.02)',
      border: active ? '2px solid #c9a84c' : '1px solid rgba(255,255,255,0.06)',
      position: 'relative', overflow: 'visible',
    }),
    planBadge: {
      position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
      padding: '2px 10px', borderRadius: 10, fontSize: 9, fontWeight: 700,
      background: 'linear-gradient(135deg, #c9a84c, #f0d78c)', color: '#0a0a14', whiteSpace: 'nowrap',
    },
    planPrice: { fontSize: 20, fontWeight: 700, color: '#e0ddd6', marginTop: 8 },
    planName: { fontSize: 14, fontWeight: 600, color: '#c9a84c', marginBottom: 4 },
    planDesc: { fontSize: 11, color: '#8a8a9a' },
    featureSection: { marginBottom: 28 },
    featureTitle: { fontSize: 14, fontWeight: 600, color: '#c9a84c', marginBottom: 10 },
    featureItem: (premium) => ({
      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', fontSize: 13,
      color: premium ? '#e0ddd6' : '#6a6a7a',
    }),
    phoneInput: {
      width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
      background: 'rgba(255,255,255,0.04)', color: '#e0ddd6', fontSize: 15, fontFamily: 'inherit', outline: 'none',
      marginBottom: 14, boxSizing: 'border-box',
    },
    payBtn: (disabled) => ({
      width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: disabled ? 'default' : 'pointer',
      fontSize: 15, fontWeight: 700,
      background: disabled ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #c9a84c, #f0d78c)',
      color: disabled ? '#6a6a7a' : '#0a0a14',
    }),
    error: { color: '#ff6b6b', fontSize: 13, marginBottom: 12 },
    pollMsg: { color: '#c9a84c', fontSize: 13, textAlign: 'center', marginTop: 12, animation: 'pulse 1.5s infinite' },
  };

  if (isActive) {
    const exp = status.expiresAt ? new Date(status.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Never';
    return (
      <div style={s.page}>
        <h1 style={s.header}>SOPHIA Premium</h1>
        <div style={s.activeCard}>
          <div style={s.activeBadge}>✦ PREMIUM ACTIVE</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#e0ddd6', marginBottom: 6 }}>You're on the {status.plan || 'premium'} plan</div>
          <div style={{ fontSize: 13, color: '#8a8a9a' }}>Valid until {exp}</div>
        </div>
        <div style={s.featureSection}>
          <div style={s.featureTitle}>Your Premium Features</div>
          {FEATURES.premium.map((f, i) => (
            <div key={i} style={s.featureItem(true)}>
              <span style={{ color: '#3fb950' }}>✓</span> {f}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <h1 style={s.header}>Upgrade to Premium</h1>
      <p style={s.sub}>Unlock the full SOPHIA experience</p>

      {/* Plan Selection */}
      <div style={s.planGrid}>
        {PLANS.map(p => (
          <div key={p.id} style={s.planCard(selectedPlan === p.id)} onClick={() => setSelectedPlan(p.id)}>
            {p.badge && <div style={s.planBadge}>{p.badge}</div>}
            <div style={s.planName}>{p.name}</div>
            <div style={s.planPrice}>{p.priceLabel}</div>
            <div style={s.planDesc}>{p.desc}</div>
          </div>
        ))}
      </div>

      {/* Premium Features */}
      <div style={s.featureSection}>
        <div style={s.featureTitle}>Premium Plan</div>
        {FEATURES.premium.map((f, i) => (
          <div key={i} style={s.featureItem(true)}>
            <span style={{ color: '#c9a84c' }}>✦</span> {f}
          </div>
        ))}
      </div>

      {/* Payment */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#e0ddd6', marginBottom: 10 }}>Pay with M-Pesa</div>
        {error && <div style={s.error}>{error}</div>}
        <input
          type="tel"
          placeholder="M-Pesa phone number (e.g. 0712345678)"
          value={phone}
          onChange={e => setPhone(e.target.value.replace(/[^0-9+]/g, ''))}
          style={s.phoneInput}
          maxLength={13}
        />
        <button
          style={s.payBtn(paying || polling)}
          onClick={handlePayment}
          disabled={paying || polling}
        >
          {paying ? 'Sending payment request...' : polling ? 'Waiting for M-Pesa confirmation...' : `Pay ${PLANS.find(p => p.id === selectedPlan).priceLabel}`}
        </button>
        {polling && <div style={s.pollMsg}>Check your phone for the M-Pesa prompt...</div>}
      </div>
    </div>
  );
}
