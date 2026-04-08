import React, { useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './ContactSeller.css';

export default function ContactSeller({ product }) {
  const { user, token } = useAuth();
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;
  if (!product?.createdBy) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/api/messages', {
        product: product._id,
        seller: product.createdBy,
        message,
        senderEmail: user.email,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSent(true);
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-seller">
      <h3 className="contact-title">Contact Seller</h3>
      {sent ? (
        <div className="alert alert-success">Message sent! The seller will get back to you.</div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          <textarea
            placeholder="Ask about this product..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            rows={3}
            required
          />
          <p className="char-count">{message.length}/1000</p>
          <button type="submit" className="btn btn-outline btn-sm" disabled={loading}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      )}
    </div>
  );
}
