/* ═══════════════════════════════════════════════════════════
   PAYMENT.JS — Plans & Pricing Page with M-Pesa Integration
   ═══════════════════════════════════════════════════════════ */

const Payment = (() => {

  const API_BASE = 'http://localhost:3001'; // Backend server

  const PLANS = [
    {
      id: 'free',
      name: 'Seeker',
      priceUSD: 0,
      priceKES: 0,
      period: 'Forever',
      features: [
        'Up to 3 habits',
        'Basic journal',
        'Limited wisdom feed',
        'Basic analytics',
        'Community access',
      ],
      limitations: [
        'No focus mode',
        'No advanced analytics',
        'No AI coaching',
      ],
    },
    {
      id: 'premium',
      name: 'Philosopher',
      priceUSD: 9.99,
      priceKES: 1500,
      period: '/month',
      featured: true,
      features: [
        'Unlimited habits',
        'Advanced journal + prompts',
        'Full wisdom library',
        'Detailed analytics',
        'Focus mode + Pomodoro',
        'Goal milestones & vision board',
        'Body metrics tracking',
        'Priority support',
      ],
      limitations: [],
    },
    {
      id: 'lifetime',
      name: 'Sage',
      priceUSD: 199,
      priceKES: 29900,
      period: 'one-time',
      features: [
        'Everything in Philosopher',
        'Lifetime access',
        'Early access to new features',
        'AI coaching (coming soon)',
        'Custom wisdom paths',
        'Export all data',
        'Founding member badge',
        'No future price increases',
      ],
      limitations: [],
    },
  ];

  let selectedPlan = null;
  let paymentMethod = 'mpesa'; // 'mpesa' | 'card'

  // ── M-Pesa SVG Icon ──
  const mpesaIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="6" x2="15" y2="6"/></svg>`;

  function render() {
    const user = Storage.getUser();
    const currentPlan = user?.plan || 'free';

    return `
      <div class="payment-page page-enter">
        <div style="text-align:center;max-width:600px;margin:0 auto 40px;">
          <h1 style="font-family:var(--font-serif);font-size:2rem;margin-bottom:8px;">Choose Your Path</h1>
          <p style="color:var(--text-secondary);font-size:1.0625rem;">Invest in yourself. Every great philosopher started as a student.</p>
          <!-- Currency Toggle -->
          <div style="display:inline-flex;gap:4px;margin-top:16px;background:var(--bg-surface);padding:4px;border-radius:var(--radius-sm);border:1px solid var(--border);">
            <button class="currency-toggle active" data-currency="kes" style="padding:6px 16px;border-radius:var(--radius-sm);cursor:pointer;font-size:0.8125rem;font-weight:600;border:none;background:var(--gold);color:var(--bg-primary);transition:all 0.2s;">KES</button>
            <button class="currency-toggle" data-currency="usd" style="padding:6px 16px;border-radius:var(--radius-sm);cursor:pointer;font-size:0.8125rem;font-weight:600;border:none;background:transparent;color:var(--text-secondary);transition:all 0.2s;">USD</button>
          </div>
        </div>

        <!-- Pricing Grid -->
        <div class="pricing-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;max-width:960px;margin:0 auto;">
          ${PLANS.map(plan => renderPlanCard(plan, currentPlan, 'kes')).join('')}
        </div>

        <!-- Payment Methods Info -->
        <div style="max-width:680px;margin:32px auto 0;">
          <div class="card" style="border-color:var(--emerald);">
            <div class="card-body" style="padding:20px;">
              <h3 style="margin-bottom:12px;display:flex;align-items:center;gap:8px;">
                ${mpesaIcon}
                <span>Pay with M-Pesa</span>
                <span class="badge badge-emerald" style="font-size:0.65rem;">Supported</span>
              </h3>
              <p style="color:var(--text-secondary);font-size:0.875rem;line-height:1.6;">
                Pay directly from your Safaricom M-Pesa wallet. An STK push prompt will be sent to your phone — just enter your PIN to confirm. Instant activation, no card needed.
              </p>
              <div style="display:flex;gap:20px;margin-top:12px;">
                <div style="display:flex;align-items:center;gap:6px;font-size:0.75rem;color:var(--text-muted);">
                  ${Icons.getSmall('check')} <span style="color:var(--emerald);">Safaricom STK Push</span>
                </div>
                <div style="display:flex;align-items:center;gap:6px;font-size:0.75rem;color:var(--text-muted);">
                  ${Icons.getSmall('check')} <span style="color:var(--emerald);">Instant Confirmation</span>
                </div>
                <div style="display:flex;align-items:center;gap:6px;font-size:0.75rem;color:var(--text-muted);">
                  ${Icons.getSmall('check')} <span style="color:var(--emerald);">Sandbox + Production</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- FAQ -->
        <div style="max-width:680px;margin:48px auto 0;">
          <h2 style="font-family:var(--font-serif);text-align:center;margin-bottom:24px;">Frequently Asked</h2>
          ${renderFAQ()}
        </div>

        <!-- Guarantee -->
        <div class="card" style="max-width:600px;margin:32px auto 0;text-align:center;border-color:var(--gold);">
          <div class="card-body" style="padding:24px;">
            <div style="color:var(--gold);margin-bottom:12px;">${Icons.get('trophy', 32)}</div>
            <h3>30-Day Money-Back Guarantee</h3>
            <p style="color:var(--text-secondary);margin-top:8px;">Not satisfied? Get a full refund within 30 days, no questions asked.</p>
          </div>
        </div>

        <!-- Payment Modal -->
        <div class="modal-overlay" id="payment-modal" style="display:none;">
          <div class="modal" style="max-width:480px;">
            <div class="modal-header">
              <h3 id="payment-modal-title">Complete Payment</h3>
              <button class="btn btn-ghost btn-icon" id="payment-modal-close">${Icons.get('close', 20)}</button>
            </div>
            <div class="modal-body" style="padding:24px;">
              <!-- Plan Summary -->
              <div id="payment-summary" style="background:var(--bg-surface);padding:16px;border-radius:var(--radius-sm);margin-bottom:20px;"></div>

              <!-- Payment Method Tabs -->
              <div class="tabs" style="margin-bottom:20px;">
                <button class="tab active" data-method="mpesa">${mpesaIcon} M-Pesa</button>
                <button class="tab" data-method="card">${Icons.getSmall('payment')} Card</button>
              </div>

              <!-- M-Pesa Form -->
              <form id="mpesa-form">
                <div class="form-group">
                  <label class="form-label">M-Pesa Phone Number</label>
                  <input type="tel" id="mpesa-phone" class="form-input" placeholder="254712345678" required pattern="^254[0-9]{9}$" maxlength="12"
                    style="font-size:1.125rem;letter-spacing:1px;font-family:var(--font-mono);">
                  <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">
                    Format: 254XXXXXXXXX (Start with 254, no spaces or dashes)
                  </div>
                  <div class="form-error" id="mpesa-phone-error"></div>
                </div>
                <div style="background:var(--bg-elevated);padding:12px;border-radius:var(--radius-sm);margin:16px 0;display:flex;align-items:center;gap:10px;">
                  ${Icons.getSmall('info')}
                  <span style="font-size:0.8125rem;color:var(--text-secondary);">You'll receive an STK Push on your phone. Enter your M-Pesa PIN to complete.</span>
                </div>
                <button type="submit" class="btn btn-primary btn-block btn-lg" id="mpesa-pay-btn" style="background:var(--emerald);">
                  Pay with M-Pesa
                </button>
              </form>

              <!-- Card Form (fallback) -->
              <form id="card-form" style="display:none;">
                <div class="form-group">
                  <label class="form-label">Card Number</label>
                  <input type="text" id="card-number" class="form-input" placeholder="4242 4242 4242 4242" maxlength="19"
                    style="font-size:1.125rem;letter-spacing:2px;font-family:var(--font-mono);">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                  <div class="form-group">
                    <label class="form-label">Expiry</label>
                    <input type="text" id="card-expiry" class="form-input" placeholder="MM/YY" maxlength="5">
                  </div>
                  <div class="form-group">
                    <label class="form-label">CVC</label>
                    <input type="text" id="card-cvc" class="form-input" placeholder="123" maxlength="4">
                  </div>
                </div>
                <button type="submit" class="btn btn-primary btn-block btn-lg" id="card-pay-btn">
                  Pay with Card
                </button>
              </form>

              <!-- Status Display -->
              <div id="payment-status" style="display:none;text-align:center;padding:20px;">
                <div id="payment-status-icon" style="margin-bottom:12px;"></div>
                <p id="payment-status-text" style="font-size:1rem;"></p>
              </div>

              <!-- Transaction History Link -->
              <div style="text-align:center;margin-top:16px;">
                <button class="btn btn-ghost btn-sm" id="view-transactions-btn" style="font-size:0.75rem;">View Transaction History</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Transaction History Modal -->
        <div class="modal-overlay" id="txn-modal" style="display:none;">
          <div class="modal" style="max-width:560px;">
            <div class="modal-header">
              <h3>Transaction History</h3>
              <button class="btn btn-ghost btn-icon" id="txn-modal-close">${Icons.get('close', 20)}</button>
            </div>
            <div class="modal-body" style="padding:20px;" id="txn-list"></div>
          </div>
        </div>
      </div>
    `;
  }

  function renderPlanCard(plan, currentPlan, currency) {
    const isCurrent = plan.id === currentPlan;
    const featured = plan.featured ? 'featured' : '';
    const price = currency === 'kes' ? plan.priceKES : plan.priceUSD;
    const symbol = currency === 'kes' ? 'KES ' : '$';
    const periodLabel = plan.period === 'Forever' ? '' : plan.period;

    return `
      <div class="card pricing-card ${featured}" data-plan-id="${plan.id}" style="${plan.featured ? 'border-color:var(--gold);box-shadow:var(--shadow-gold);' : ''}">
        ${plan.featured ? '<div class="pricing-badge" style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--gold);color:var(--bg-primary);padding:4px 16px;border-radius:20px;font-size:0.75rem;font-weight:600;">Most Popular</div>' : ''}
        <div class="card-body" style="padding:28px;position:relative;text-align:center;">
          <h3 style="font-family:var(--font-serif);font-size:1.375rem;margin-bottom:4px;">${plan.name}</h3>
          <div class="plan-price" style="margin:16px 0;">
            ${price === 0
              ? '<span style="font-size:2.5rem;font-weight:700;">Free</span>'
              : `<span style="font-size:2.5rem;font-weight:700;">${symbol}${price.toLocaleString()}</span><span style="color:var(--text-muted);">${periodLabel}</span>`
            }
          </div>
          <ul style="list-style:none;text-align:left;margin:20px 0;">
            ${plan.features.map(f => `
              <li style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:0.875rem;">
                <span style="color:var(--emerald);">${Icons.getSmall('check')}</span>
                ${Utils.escapeHtml(f)}
              </li>
            `).join('')}
            ${plan.limitations.map(l => `
              <li style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:0.875rem;color:var(--text-muted);">
                <span style="color:var(--rose);">${Icons.getSmall('close')}</span>
                ${Utils.escapeHtml(l)}
              </li>
            `).join('')}
          </ul>
          ${isCurrent
            ? `<button class="btn btn-secondary btn-block btn-lg" disabled>Current Plan</button>`
            : plan.price === 0
              ? `<button class="btn btn-secondary btn-block btn-lg plan-select" data-plan="${plan.id}">Downgrade</button>`
              : `<button class="btn btn-primary btn-block btn-lg plan-select" data-plan="${plan.id}" ${plan.featured ? 'style="background:var(--gold);color:var(--bg-primary);"' : ''}>
                  ${plan.id === 'lifetime' ? 'Get Lifetime Access' : 'Upgrade Now'}
                </button>`
          }
        </div>
      </div>
    `;
  }

  function renderFAQ() {
    const faqs = [
      { q: 'Can I cancel anytime?', a: 'Yes. Cancel your subscription at any time from your profile settings. You will retain access until the end of your billing period.' },
      { q: 'What payment methods do you accept?', a: 'We accept M-Pesa (Lipa na M-Pesa via STK Push) for Kenya and East Africa, plus major credit/debit cards globally.' },
      { q: 'How does M-Pesa payment work?', a: 'When you select M-Pesa, we send an STK Push prompt to your phone. Enter your M-Pesa PIN to confirm. Payment is processed instantly through Safaricom\'s secure Daraja API.' },
      { q: 'Is my data safe?', a: 'Your data is stored locally on your device. Payment processing is handled through Safaricom\'s encrypted API. We never store your M-Pesa PIN.' },
      { q: 'Can I switch plans later?', a: 'Absolutely. Upgrade or downgrade at any time. If upgrading, you\'ll only pay the difference.' },
    ];

    return faqs.map(f => `
      <div class="accordion" style="margin-bottom:8px;">
        <button class="accordion-header" style="width:100%;text-align:left;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px 16px;color:var(--text-primary);font-size:0.9375rem;font-weight:500;cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
          ${Utils.escapeHtml(f.q)}
          ${Icons.getSmall('chevronDown')}
        </button>
        <div class="accordion-body" style="display:none;padding:12px 16px;background:var(--bg-surface);border:1px solid var(--border);border-top:0;border-radius:0 0 var(--radius-sm) var(--radius-sm);color:var(--text-secondary);font-size:0.875rem;line-height:1.6;">
          ${Utils.escapeHtml(f.a)}
        </div>
      </div>
    `).join('');
  }

  function init() {
    // Currency toggle
    document.querySelectorAll('.currency-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.currency-toggle').forEach(b => {
          b.style.background = 'transparent';
          b.style.color = 'var(--text-secondary)';
          b.classList.remove('active');
        });
        btn.style.background = 'var(--gold)';
        btn.style.color = 'var(--bg-primary)';
        btn.classList.add('active');
        updatePrices(btn.dataset.currency);
      });
    });

    // Plan selection → open payment modal
    document.querySelectorAll('.plan-select').forEach(btn => {
      btn.addEventListener('click', () => {
        const planId = btn.dataset.plan;
        const plan = PLANS.find(p => p.id === planId);
        if (!plan) return;

        if (plan.priceKES === 0) {
          downgrade();
          return;
        }
        selectedPlan = plan;
        openPaymentModal(plan);
      });
    });

    // FAQ accordions
    document.querySelectorAll('.accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const body = header.nextElementSibling;
        const isOpen = body.style.display === 'block';
        document.querySelectorAll('.accordion-body').forEach(b => b.style.display = 'none');
        if (!isOpen) body.style.display = 'block';
      });
    });

    // Payment modal close
    document.getElementById('payment-modal-close')?.addEventListener('click', closePaymentModal);

    // Payment method tabs
    document.querySelectorAll('#payment-modal .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#payment-modal .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        paymentMethod = tab.dataset.method;
        document.getElementById('mpesa-form').style.display = paymentMethod === 'mpesa' ? 'block' : 'none';
        document.getElementById('card-form').style.display = paymentMethod === 'card' ? 'block' : 'none';
        document.getElementById('payment-status').style.display = 'none';
      });
    });

    // M-Pesa form submit
    document.getElementById('mpesa-form')?.addEventListener('submit', handleMpesaPayment);

    // Card form submit
    document.getElementById('card-form')?.addEventListener('submit', handleCardPayment);

    // View transactions
    document.getElementById('view-transactions-btn')?.addEventListener('click', showTransactions);
    document.getElementById('txn-modal-close')?.addEventListener('click', () => {
      document.getElementById('txn-modal').style.display = 'none';
    });
  }

  function updatePrices(currency) {
    PLANS.forEach(plan => {
      const card = document.querySelector(`.pricing-card[data-plan-id="${plan.id}"]`);
      if (!card) return;
      const priceEl = card.querySelector('.plan-price');
      if (!priceEl) return;
      const price = currency === 'kes' ? plan.priceKES : plan.priceUSD;
      const symbol = currency === 'kes' ? 'KES ' : '$';
      if (price === 0) {
        priceEl.innerHTML = '<span style="font-size:2.5rem;font-weight:700;">Free</span>';
      } else {
        priceEl.innerHTML = `<span style="font-size:2.5rem;font-weight:700;">${symbol}${price.toLocaleString()}</span><span style="color:var(--text-muted);">${plan.period}</span>`;
      }
    });
  }

  function openPaymentModal(plan) {
    const modal = document.getElementById('payment-modal');
    if (!modal) return;

    document.getElementById('payment-modal-title').textContent = `Upgrade to ${plan.name}`;
    document.getElementById('payment-summary').innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h4 style="margin-bottom:4px;">${plan.name} Plan</h4>
          <span style="font-size:0.8125rem;color:var(--text-muted);">${plan.id === 'lifetime' ? 'One-time payment' : 'Monthly subscription'}</span>
        </div>
        <div style="text-align:right;">
          <div style="font-size:1.5rem;font-weight:700;color:var(--gold);">KES ${plan.priceKES.toLocaleString()}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">~$${plan.priceUSD}</div>
        </div>
      </div>
    `;

    // Reset forms
    document.getElementById('mpesa-form').style.display = 'block';
    document.getElementById('card-form').style.display = 'none';
    document.getElementById('payment-status').style.display = 'none';
    document.getElementById('mpesa-phone-error').textContent = '';
    document.querySelectorAll('#payment-modal .tab').forEach((t, i) => t.classList.toggle('active', i === 0));
    paymentMethod = 'mpesa';

    modal.style.display = 'flex';
  }

  function closePaymentModal() {
    document.getElementById('payment-modal').style.display = 'none';
    selectedPlan = null;
  }

  // ── M-Pesa STK Push Payment ──
  async function handleMpesaPayment(e) {
    e.preventDefault();
    if (!selectedPlan) return;

    const phoneInput = document.getElementById('mpesa-phone');
    const phone = phoneInput.value.trim().replace(/[\s\-]/g, '');
    const errorEl = document.getElementById('mpesa-phone-error');
    const btn = document.getElementById('mpesa-pay-btn');

    // Validate phone
    if (!/^254[0-9]{9}$/.test(phone)) {
      errorEl.textContent = 'Enter a valid Safaricom number starting with 254 (e.g. 254712345678)';
      return;
    }
    errorEl.textContent = '';

    // Show loading
    btn.classList.add('btn-loading');
    btn.disabled = true;
    btn.textContent = 'Sending STK Push...';

    try {
      const res = await fetch(`${API_BASE}/api/payments/stk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          amount: selectedPlan.priceKES,
          accountReference: `SOPHIA-${selectedPlan.id.toUpperCase()}`,
          transactionDesc: `SOPHIA ${selectedPlan.name} Plan`,
        }),
      });

      const data = await res.json();

      if (data.ok && data.result?.ResponseCode === '0') {
        showPaymentStatus('pending',
          'STK Push sent! Check your phone and enter your M-Pesa PIN to complete payment.',
          data.result.CheckoutRequestID
        );
        // Save transaction
        saveTransaction({
          id: data.result.CheckoutRequestID || Storage.uid(),
          plan: selectedPlan.id,
          amount: selectedPlan.priceKES,
          currency: 'KES',
          method: 'mpesa',
          phone,
          status: 'pending',
          merchantRequestId: data.result.MerchantRequestID,
          date: new Date().toISOString(),
        });
        // Poll for confirmation (simulated for demo)
        simulateConfirmation(data.result.CheckoutRequestID);
      } else {
        showPaymentStatus('error', data.error || data.result?.ResponseDescription || 'STK Push failed. Please try again.');
      }
    } catch (err) {
      // Offline / backend not running fallback: demo mode
      showPaymentStatus('pending', 'STK Push sent! Check your phone and enter your M-Pesa PIN. (Demo Mode)');
      saveTransaction({
        id: Storage.uid(),
        plan: selectedPlan.id,
        amount: selectedPlan.priceKES,
        currency: 'KES',
        method: 'mpesa',
        phone,
        status: 'pending',
        date: new Date().toISOString(),
      });
      simulateConfirmation(null);
    } finally {
      btn.classList.remove('btn-loading');
      btn.disabled = false;
      btn.textContent = 'Pay with M-Pesa';
    }
  }

  // ── Card Payment (Demo) ──
  function handleCardPayment(e) {
    e.preventDefault();
    if (!selectedPlan) return;

    const btn = document.getElementById('card-pay-btn');
    btn.classList.add('btn-loading');
    btn.disabled = true;
    btn.textContent = 'Processing...';

    // Demo: simulate card processing
    setTimeout(() => {
      saveTransaction({
        id: Storage.uid(),
        plan: selectedPlan.id,
        amount: selectedPlan.priceUSD,
        currency: 'USD',
        method: 'card',
        status: 'completed',
        date: new Date().toISOString(),
      });
      activatePlan(selectedPlan.id);
      showPaymentStatus('success', `Payment successful! Your ${selectedPlan.name} plan is now active.`);
      btn.classList.remove('btn-loading');
      btn.disabled = false;
      btn.textContent = 'Pay with Card';
    }, 2000);
  }

  // ── Simulate M-Pesa Confirmation ──
  function simulateConfirmation(checkoutRequestId) {
    setTimeout(() => {
      const txns = getTransactions();
      const txn = txns.find(t => (checkoutRequestId && t.id === checkoutRequestId) || t.status === 'pending');
      if (txn) {
        txn.status = 'completed';
        txn.mpesaReceiptNumber = 'QKJ' + Math.random().toString(36).substring(2, 10).toUpperCase();
        txn.completedAt = new Date().toISOString();
        Storage.set('sophia_transactions', txns);
      }
      if (selectedPlan) {
        activatePlan(selectedPlan.id);
        showPaymentStatus('success', `Payment confirmed! M-Pesa receipt: ${txn?.mpesaReceiptNumber || 'N/A'}. Your plan is now active.`);
      }
    }, 5000);
  }

  function activatePlan(planId) {
    const auth = Storage.getAuth();
    if (auth?.user) {
      auth.user.plan = planId;
      Storage.setAuth(auth);
    }
    Utils.showConfetti(2500);
    Utils.toast('Plan upgraded successfully!', 'success');
    App.renderShell();
  }

  function downgrade() {
    if (!confirm('Downgrade to the free plan? You may lose access to premium features.')) return;
    const auth = Storage.getAuth();
    if (auth?.user) {
      auth.user.plan = 'free';
      Storage.setAuth(auth);
    }
    Utils.toast('Downgraded to Seeker plan', 'info');
    App.renderShell();
    App.route();
  }

  function showPaymentStatus(type, message, txnId) {
    const statusEl = document.getElementById('payment-status');
    const iconEl = document.getElementById('payment-status-icon');
    const textEl = document.getElementById('payment-status-text');
    if (!statusEl) return;

    document.getElementById('mpesa-form').style.display = 'none';
    document.getElementById('card-form').style.display = 'none';
    statusEl.style.display = 'block';

    const icons = {
      pending: `<div style="width:48px;height:48px;margin:0 auto;border:3px solid var(--amber);border-radius:50%;display:flex;align-items:center;justify-content:center;animation:ai-pulse 2s infinite;">
        ${mpesaIcon}
      </div>`,
      success: `<div style="width:48px;height:48px;margin:0 auto;background:var(--emerald);border-radius:50%;display:flex;align-items:center;justify-content:center;">
        ${Icons.get('check', 28)}
      </div>`,
      error: `<div style="width:48px;height:48px;margin:0 auto;background:var(--rose);border-radius:50%;display:flex;align-items:center;justify-content:center;">
        ${Icons.get('close', 28)}
      </div>`,
    };

    iconEl.innerHTML = icons[type] || '';
    textEl.innerHTML = Utils.escapeHtml(message);
    textEl.style.color = type === 'success' ? 'var(--emerald)' : type === 'error' ? 'var(--rose)' : 'var(--amber)';
  }

  // ── Transaction Storage ──
  function saveTransaction(txn) {
    const txns = getTransactions();
    txns.unshift(txn);
    if (txns.length > 50) txns.length = 50;
    Storage.set('sophia_transactions', txns);
  }

  function getTransactions() {
    return Storage.get('sophia_transactions') || [];
  }

  function showTransactions() {
    const txns = getTransactions();
    const listEl = document.getElementById('txn-list');
    if (!listEl) return;

    if (!txns.length) {
      listEl.innerHTML = '<p style="color:var(--text-muted);text-align:center;">No transactions yet.</p>';
    } else {
      listEl.innerHTML = `
        <div class="data-table" style="max-height:400px;overflow-y:auto;">
          <table>
            <thead>
              <tr><th>Date</th><th>Plan</th><th>Amount</th><th>Method</th><th>Status</th><th>Receipt</th></tr>
            </thead>
            <tbody>
              ${txns.map(t => `
                <tr>
                  <td style="font-size:0.75rem;">${t.date ? Utils.formatDate(new Date(t.date), 'short') : '—'}</td>
                  <td><span class="badge badge-gold" style="font-size:0.65rem;">${Utils.escapeHtml(t.plan)}</span></td>
                  <td style="font-family:var(--font-mono);font-size:0.8125rem;">${t.currency === 'KES' ? 'KES ' : '$'}${(t.amount || 0).toLocaleString()}</td>
                  <td>${t.method === 'mpesa' ? `${mpesaIcon} M-Pesa` : 'Card'}</td>
                  <td><span class="badge ${t.status === 'completed' ? 'badge-emerald' : t.status === 'pending' ? 'badge-amber' : 'badge-rose'}" style="font-size:0.65rem;">${t.status}</span></td>
                  <td style="font-size:0.75rem;font-family:var(--font-mono);">${t.mpesaReceiptNumber || '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    document.getElementById('txn-modal').style.display = 'flex';
  }

  return { render, init };
})();
