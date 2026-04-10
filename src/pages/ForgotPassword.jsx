import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './Auth.css';

export default function ForgotPassword() {
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'done'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1 — send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/forgot-password', { email });
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — verify OTP + set new password
  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/reset-password', { email, otp, newPassword });
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-otp-icon" style={{ margin: '0 auto 1rem' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h1 className="auth-title">Password Reset!</h1>
          <p className="auth-sub">Your password has been updated. You can now log in with your new password.</p>
          <button className="btn btn-primary auth-btn" onClick={() => navigate('/login')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-otp-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h1 className="auth-title">Check your email</h1>
          <p className="auth-sub">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleReset}>
            <div className="form-group">
              <label>Verification Code</label>
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="otp-input"
                maxLength={6}
                autoFocus
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary auth-btn"
              disabled={loading || otp.length < 6}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          <p className="auth-switch">
            <button className="link-btn" onClick={() => { setStep('email'); setError(''); setOtp(''); }}>
              ← Use a different email
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Forgot Password?</h1>
        <p className="auth-sub">Enter your email and we'll send you a reset code.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSendOtp}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Sending code...' : 'Send Reset Code →'}
          </button>
        </form>
        <p className="auth-switch"><Link to="/login">← Back to Login</Link></p>
      </div>
    </div>
  );
}
