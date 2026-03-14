'use client';
export const dynamic = "force-dynamic";

import React, { useState } from 'react';
import { useAuthStore } from '@/src/lib/authStore';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPass, setShowPass] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatus('error');
        setErrorMsg(data.error || 'Update failed. Please try again.');
        return;
      }

      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050E1F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: '36px 28px',
        width: '100%',
        maxWidth: 420,
        color: '#fff',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/branding/lina-avatar.png" alt="Zeniva" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px' }} />
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>Change Password</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Zeniva Travel · Secure</div>
        </div>

        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Password Updated!</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
              You can now sign in with your new password.
            </div>
            <button
              onClick={() => router.push('/login')}
              style={{
                width: '100%',
                padding: '14px',
                background: '#0F6CF5',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Sign In →
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10,
                  color: '#fff',
                  fontSize: 15,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* New Password */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 14px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: 15,
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    fontSize: 16,
                    padding: 0,
                  }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>
                Confirm New Password
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Repeat password"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.07)',
                  border: `1px solid ${confirm && password !== confirm ? '#ef4444' : 'rgba(255,255,255,0.15)'}`,
                  borderRadius: 10,
                  color: '#fff',
                  fontSize: 15,
                  boxSizing: 'border-box',
                }}
              />
              {confirm && password !== confirm && (
                <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>Passwords don&apos;t match</div>
              )}
            </div>

            {/* Error */}
            {errorMsg && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 13,
                color: '#fca5a5',
                marginBottom: 16,
              }}>
                {errorMsg}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                width: '100%',
                padding: '14px',
                background: status === 'loading' ? 'rgba(15,108,245,0.5)' : '#0F6CF5',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {status === 'loading' ? 'Updating...' : 'Update Password'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <a href="/login" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
                ← Back to Sign In
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
