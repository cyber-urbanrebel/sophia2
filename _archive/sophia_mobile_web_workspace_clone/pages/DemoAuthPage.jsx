import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice.js';

export default function DemoAuthPage() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('demo@sophia.com');
  const [password, setPassword] = useState('demo123');
  const [firstName, setFirstName] = useState('Demo');
  const [lastName, setLastName] = useState('User');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate a brief delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Accept any credentials and log in
    const user = {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      email: email.trim() || 'user@sophia.local',
      firstName: firstName.trim() || 'User',
      lastName: lastName.trim() || 'Sophia',
      name: `${firstName.trim() || 'User'} ${lastName.trim() || 'Sophia'}`
    };

    const token = `token-${Math.random().toString(36).substr(2, 20)}`;

    dispatch(loginSuccess({ user, token }));
    setIsLoading(false);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      color: '#fff',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(22, 27, 34, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '40px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '32px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #58a6ff, #3fb950)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            ✨ SOPHIA
          </h1>
          <p style={{
            margin: '0 0 16px 0',
            color: '#888',
            fontSize: '14px',
          }}>
            Personal AI Workspace
          </p>
          <p style={{
            margin: 0,
            color: '#666',
            fontSize: '12px',
          }}>
            Demo Mode - Use any credentials
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'register' && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#aaa' }}>
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#aaa' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#aaa' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#fff',
                fontFamily: 'monospace',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#aaa' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#fff',
                fontFamily: 'monospace',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '12px',
              background: 'linear-gradient(135deg, #58a6ff, #3fb950)',
              border: 'none',
              borderRadius: '6px',
              color: '#000',
              fontWeight: 'bold',
              fontSize: '14px',
              fontFamily: 'monospace',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => !isLoading && (e.target.style.boxShadow = '0 0 20px rgba(88, 166, 255, 0.5)')}
            onMouseLeave={(e) => (e.target.style.boxShadow = 'none')}
          >
            {isLoading ? '⏳ Loading...' : (mode === 'login' ? '🔓 Enter SOPHIA' : '✨ Create Account')}
          </button>
        </form>

        {/* Toggle Mode */}
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '13px',
          color: '#888',
        }}>
          {mode === 'login' ? (
            <>
              <span>New to SOPHIA? </span>
              <button
                onClick={() => setMode('register')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#58a6ff',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                }}
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              <span>Already a member? </span>
              <button
                onClick={() => setMode('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#58a6ff',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                }}
              >
                Sign In
              </button>
            </>
          )}
        </div>

        {/* Demo Info */}
        <div style={{
          marginTop: '24px',
          padding: '12px',
          background: 'rgba(88, 166, 255, 0.1)',
          border: '1px solid rgba(88, 166, 255, 0.2)',
          borderRadius: '6px',
          fontSize: '11px',
          color: '#58a6ff',
          lineHeight: '1.6',
        }}>
          <strong>🎮 Demo Mode:</strong><br />
          Use any email & password to access the full app. No real authentication required.
        </div>
      </div>
    </div>
  );
}
