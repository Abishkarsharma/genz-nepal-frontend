import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const { token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', profilePicture: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setForm({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        profilePicture: data.profilePicture || '',
      }))
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.put('/api/users/me', form, { headers: { Authorization: `Bearer ${token}` } });
      updateUser({ name: data.name, email: data.email, profilePicture: data.profilePicture });
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner" style={{ marginTop: '4rem' }} />;

  return (
    <div className="container profile-page">
      <div className="profile-card">
        <div className="profile-avatar">
          {form.profilePicture
            ? <img src={form.profilePicture} alt="Profile" className="avatar-img" />
            : <div className="avatar-placeholder">{form.name?.[0]?.toUpperCase() || '?'}</div>}
        </div>
        <h1 className="page-title">{form.name}</h1>
        <p className="page-subtitle">Manage your account details</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Full Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input placeholder="+977 98XXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Profile Picture URL</label>
            <input placeholder="https://..." value={form.profilePicture} onChange={(e) => setForm({ ...form, profilePicture: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
