/* ═══════════════════════════════════════════════════════════
   AUTH.JS — Login, Register, Session Logic
   ═══════════════════════════════════════════════════════════ */

const Auth = (() => {
  let failedAttempts = 0;
  let lockoutUntil = 0;

  // Demo accounts
  const DEMO_ACCOUNTS = [
    { email: 'user@sophia.app', password: 'Demo1234!', name: 'Alex Morgan', role: 'user', plan: 'premium' },
    { email: 'admin@sophia.app', password: 'Admin1234!', name: 'Sophia Admin', role: 'admin', plan: 'lifetime' },
  ];

  function init() {
    renderAuthModal();
    if (!Storage.isLoggedIn()) {
      show();
    }
  }

  function renderAuthModal() {
    const overlay = document.getElementById('auth-overlay');
    if (!overlay) return;
    overlay.innerHTML = `
      <div class="auth-backdrop"></div>
      <div class="auth-card" id="auth-card">
        <div class="auth-brand">
          <div class="auth-logo">SOPHIA</div>
          <div class="auth-tagline">Begin your ascent</div>
        </div>
        <div id="auth-content"></div>
      </div>
    `;
    renderLoginForm();
  }

  function renderLoginForm() {
    const container = document.getElementById('auth-content');
    if (!container) return;
    container.innerHTML = `
      <form id="login-form" class="auth-form" autocomplete="off">
        <h2 style="font-family:var(--font-serif);margin-bottom:20px;">Sign In</h2>
        <div id="login-lockout" class="auth-lockout hidden"></div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" id="login-email" class="form-input" placeholder="you@example.com" required autocomplete="username">
          <div class="form-error" id="login-email-error"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" id="login-password" class="form-input" placeholder="Your password" required autocomplete="current-password">
          <div class="form-error" id="login-password-error"></div>
        </div>
        <label class="checkbox-wrapper" style="margin-bottom:16px;">
          <input type="checkbox" id="login-remember">
          <span class="checkbox-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>
          <span>Remember me</span>
        </label>
        <button type="submit" class="btn btn-primary btn-block btn-lg" id="login-btn">Sign In</button>
        <div class="auth-footer">
          <a href="#" id="show-forgot">Forgot password?</a>
          <span style="color:var(--text-muted)">|</span>
          <a href="#" id="show-register">Create account</a>
        </div>
        <div class="auth-demo">
          <small style="color:var(--text-muted)">Demo: user@sophia.app / Demo1234!</small>
        </div>
      </form>
    `;
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('show-register').addEventListener('click', e => { e.preventDefault(); renderRegisterForm(); });
    document.getElementById('show-forgot').addEventListener('click', e => { e.preventDefault(); renderForgotForm(); });
  }

  function renderRegisterForm() {
    const container = document.getElementById('auth-content');
    if (!container) return;
    container.innerHTML = `
      <form id="register-form" class="auth-form" autocomplete="off">
        <h2 style="font-family:var(--font-serif);margin-bottom:20px;">Create Account</h2>
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" id="reg-name" class="form-input" placeholder="Your full name" required maxlength="60">
          <div class="form-error" id="reg-name-error"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" id="reg-email" class="form-input" placeholder="you@example.com" required autocomplete="username">
          <div class="form-error" id="reg-email-error"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Date of Birth</label>
          <input type="date" id="reg-dob" class="form-input" required>
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" id="reg-password" class="form-input" placeholder="Min 8 characters" required autocomplete="new-password">
          <div class="password-strength" id="pw-strength">
            <div class="pw-bar"><div class="pw-fill" id="pw-fill"></div></div>
            <span class="pw-text" id="pw-text">Enter a password</span>
          </div>
          <div class="form-error" id="reg-password-error"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Confirm Password</label>
          <input type="password" id="reg-confirm" class="form-input" placeholder="Confirm your password" required autocomplete="new-password">
          <div class="form-error" id="reg-confirm-error"></div>
        </div>
        <label class="checkbox-wrapper" style="margin-bottom:16px;">
          <input type="checkbox" id="reg-terms" required>
          <span class="checkbox-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>
          <span>I agree to the Terms of Service</span>
        </label>
        <button type="submit" class="btn btn-primary btn-block btn-lg" id="register-btn">Create Account</button>
        <div class="auth-footer">
          <a href="#" id="show-login">Already have an account? Sign in</a>
        </div>
      </form>
    `;
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('show-login').addEventListener('click', e => { e.preventDefault(); renderLoginForm(); });
    document.getElementById('reg-password').addEventListener('input', updatePasswordStrength);
  }

  function renderForgotForm() {
    const container = document.getElementById('auth-content');
    if (!container) return;
    container.innerHTML = `
      <form id="forgot-form" class="auth-form" autocomplete="off">
        <h2 style="font-family:var(--font-serif);margin-bottom:20px;">Reset Password</h2>
        <p style="color:var(--text-secondary);margin-bottom:16px;font-size:0.9375rem;">Enter your email and we'll send a reset link.</p>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" id="forgot-email" class="form-input" placeholder="you@example.com" required>
        </div>
        <button type="submit" class="btn btn-primary btn-block btn-lg">Send Reset Link</button>
        <div class="auth-footer">
          <a href="#" id="show-login-2">Back to sign in</a>
        </div>
      </form>
    `;
    document.getElementById('forgot-form').addEventListener('submit', e => {
      e.preventDefault();
      container.innerHTML = `
        <div style="text-align:center;padding:32px 0;">
          ${Icons.get('check')}
          <h3 style="margin:16px 0 8px;">Check your email</h3>
          <p style="color:var(--text-secondary);">If an account exists, a reset link has been sent.</p>
          <a href="#" id="show-login-3" style="display:inline-block;margin-top:16px;">Back to sign in</a>
        </div>
      `;
      document.getElementById('show-login-3').addEventListener('click', e => { e.preventDefault(); renderLoginForm(); });
    });
    document.getElementById('show-login-2').addEventListener('click', e => { e.preventDefault(); renderLoginForm(); });
  }

  function handleLogin(e) {
    e.preventDefault();
    if (Date.now() < lockoutUntil) {
      const mins = Math.ceil((lockoutUntil - Date.now()) / 60000);
      showError('login-email-error', `Account locked. Try again in ${mins} minute(s).`);
      return;
    }

    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;

    clearErrors(['login-email-error', 'login-password-error']);

    if (!email) { showError('login-email-error', 'Email is required'); return; }
    if (!Utils.validateEmail(email)) { showError('login-email-error', 'Invalid email format'); return; }
    if (!password) { showError('login-password-error', 'Password is required'); return; }

    // Check demo accounts
    const demo = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
    // Check registered users
    const users = Storage.getAll(Storage.KEYS.USERS_DB);
    const registeredUser = users.find(u => u.email === email && u.password === password);

    const matchedUser = demo || registeredUser;

    if (!matchedUser) {
      failedAttempts++;
      if (failedAttempts >= 5) {
        lockoutUntil = Date.now() + 15 * 60 * 1000;
        const lockoutEl = document.getElementById('login-lockout');
        if (lockoutEl) {
          lockoutEl.textContent = 'Account locked for 15 minutes due to too many failed attempts.';
          lockoutEl.classList.remove('hidden');
        }
        return;
      }
      showError('login-password-error', 'Invalid email or password');
      return;
    }

    failedAttempts = 0;
    const user = {
      id: matchedUser.id || Storage.uid(),
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role || 'user',
      plan: matchedUser.plan || 'free',
      joinDate: matchedUser.joinDate || new Date().toISOString(),
    };

    Storage.setAuth({
      user,
      session: { token: Storage.uid(), createdAt: new Date().toISOString() },
    });

    hide();
    App.init();
    AIAgent.init();
  }

  function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const dob = document.getElementById('reg-dob').value;
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    const terms = document.getElementById('reg-terms').checked;

    clearErrors(['reg-name-error', 'reg-email-error', 'reg-password-error', 'reg-confirm-error']);

    if (!name || name.length < 2) { showError('reg-name-error', 'Name must be at least 2 characters'); return; }
    if (!Utils.validateEmail(email)) { showError('reg-email-error', 'Invalid email format'); return; }
    if (!dob) { showError('reg-name-error', 'Date of birth is required'); return; }

    const pwCheck = Utils.validatePassword(password);
    if (pwCheck.passed < 4) { showError('reg-password-error', 'Password needs uppercase, lowercase, digit, and special char'); return; }
    if (password !== confirm) { showError('reg-confirm-error', 'Passwords do not match'); return; }
    if (!terms) { showError('reg-confirm-error', 'You must agree to the Terms'); return; }

    // Check if email exists
    const existing = Storage.getAll(Storage.KEYS.USERS_DB);
    if (existing.some(u => u.email === email)) {
      showError('reg-email-error', 'An account with this email already exists');
      return;
    }

    const user = {
      id: Storage.uid(),
      name,
      email,
      password,
      dob,
      role: 'user',
      plan: 'free',
      joinDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      streak: 0,
    };

    Storage.create(Storage.KEYS.USERS_DB, user);

    Storage.setAuth({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan, joinDate: user.joinDate },
      session: { token: Storage.uid(), createdAt: new Date().toISOString() },
    });

    // Seed initial data for new user
    SeedData.seedForNewUser();
    hide();
    App.init();
    AIAgent.init();
    Utils.toast('Account created! Welcome to SOPHIA.', 'success');
  }

  function updatePasswordStrength() {
    const pw = document.getElementById('reg-password').value;
    const result = Utils.validatePassword(pw);
    const fill = document.getElementById('pw-fill');
    const text = document.getElementById('pw-text');
    if (!fill || !text) return;

    const widths = { weak: '25%', fair: '50%', strong: '75%', excellent: '100%' };
    const colors = { weak: 'var(--rose)', fair: 'var(--amber)', strong: 'var(--cyan)', excellent: 'var(--emerald)' };
    fill.style.width = widths[result.strength];
    fill.style.background = colors[result.strength];
    text.textContent = pw ? Utils.capitalize(result.strength) : 'Enter a password';
    text.style.color = pw ? colors[result.strength] : 'var(--text-muted)';
  }

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.classList.add('visible'); }
  }

  function clearErrors(ids) {
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.textContent = ''; el.classList.remove('visible'); }
    });
  }

  function show() {
    const overlay = document.getElementById('auth-overlay');
    if (overlay) overlay.classList.remove('hidden');
    document.getElementById('app').style.filter = 'blur(8px)';
    // Hide AI FAB on login screen
    const fab = document.getElementById('ai-fab');
    const panel = document.getElementById('ai-panel');
    if (fab) fab.style.display = 'none';
    if (panel) panel.style.display = 'none';
  }

  function hide() {
    const overlay = document.getElementById('auth-overlay');
    if (overlay) overlay.classList.add('hidden');
    document.getElementById('app').style.filter = '';
    // Show AI FAB after login
    const fab = document.getElementById('ai-fab');
    const panel = document.getElementById('ai-panel');
    if (fab) fab.style.display = 'flex';
    if (panel) panel.style.display = '';
  }

  function logout() {
    Storage.remove(Storage.KEYS.AUTH);
    renderAuthModal();
    show();
    window.location.hash = '#dashboard';
  }

  return { init, show, hide, logout, renderLoginForm };
})();
