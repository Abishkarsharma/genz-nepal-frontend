import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Signup() {
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/signup', form);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
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
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setError('');
    try {
      await api.post('/api/auth/signup', form);
      setError('');
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend');
    }
  };

  if (step === 'otp') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-otp-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h1 className="auth-title">Check your email</h1>
          <p className="auth-sub">We sent a 6-digit code to <strong>{form.email}</strong></p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label>Verification Code</label>
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="otp-input"
                autoFocus
                required
              />
            </div>
            <button type="submit" className="btn btn-primary auth-btn" disabled={loading || otp.length < 6}>
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>
          </form>
          <p className="auth-switch">
            Didn't receive it?{' '}
            <button className="link-btn" onClick={resendOtp}>Resend code</button>
          </p>
          <p className="auth-switch">
            <button className="link-btn" onClick={() => { setStep('form'); setError(''); }}>← Back</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Join The Gen.Z Nepal</p>
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
            <label>Email</label>
            <input
              type="email"
              placeholder="you@gmail.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label>Register as</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="user">Customer</option>
              <option value="seller">Seller</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Sending code...' : 'Continue →'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}

