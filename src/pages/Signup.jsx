import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function Signup() {
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!form.name.trim()) return 'Full name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!form.email.toLowerCase().endsWith('@gmail.com'))
      return 'Only Gmail addresses are accepted (must end with @gmail.com)';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    setError('');

    // Timeout after 15 seconds — prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false);
      setError('Request timed out. The server may be starting up — please try again in 30 seconds.');
    }, 15000);

    try {
      await api.post('/api/auth/signup', form);
      clearTimeout(timeout);
      setStep('otp');
    } catch (err) {
      clearTimeout(timeout);
      const msg = err.response?.data?.message;
      if (msg?.includes('not configured')) {
        setError('Email service is not set up on the server. Contact the admin.');
      } else if (msg?.includes('Could not send')) {
        setError('Could not send email to this address. Make sure it is a real Gmail account.');
      } else {
        setError(msg || 'Signup failed. Please try again.');
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/api/auth/verify-otp', { email: form.email, otp });
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMsg('');
    setError('');
    try {
      await api.post('/api/auth/signup', form);
      setResendMsg('New code sent! Check your Gmail inbox.');
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

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
          <h1 className="auth-title">Check your Gmail</h1>
          <p className="auth-sub">
            We sent a 6-digit code to <strong>{form.email}</strong>
            <br />Check your inbox (and spam folder).
          </p>
          {error && <div className="alert alert-error">{error}</div>}
          {resendMsg && <div className="alert alert-success">{resendMsg}</div>}
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label>Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="otp-input"
                maxLength={6}
                autoFocus
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary auth-btn"
              disabled={loading || otp.length < 6}
            >
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>
          </form>
          <p className="auth-switch">
            Didn't receive it?{' '}
            <button className="link-btn" onClick={handleResend} disabled={resendLoading}>
              {resendLoading ? 'Sending...' : 'Resend code'}
            </button>
          </p>
          <p className="auth-switch">
            <button className="link-btn" onClick={() => { setStep('form'); setError(''); setOtp(''); }}>
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
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Join Gen.Z Nepal — Gmail required</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              placeholder="Aryan Sharma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Gmail Address</label>
            <input
              type="email"
              placeholder="you@gmail.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            {form.email && !form.email.toLowerCase().endsWith('@gmail.com') && (
              <p className="field-hint error">Only @gmail.com addresses are accepted</p>
            )}
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Register as</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="user">Customer</option>
              <option value="seller">Seller</option>
            </select>
          </div>
          <button
            type="submit"
            className="btn btn-primary auth-btn"
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <span className="btn-spinner" />
                Sending code...
              </span>
            ) : 'Continue →'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
