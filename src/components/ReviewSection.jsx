import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './ReviewSection.css';

function Stars({ rating, onSelect }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`star ${s <= rating ? 'filled' : ''} ${onSelect ? 'clickable' : ''}`}
          onClick={() => onSelect && onSelect(s)}
        >★</span>
      ))}
    </div>
  );
}

export default function ReviewSection({ productId }) {
  const { user, token } = useAuth();
  const [data, setData] = useState({ reviews: [], avgRating: 0, count: 0 });
  const [form, setForm] = useState({ rating: 0, comment: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = () =>
    api.get(`/api/reviews?product=${productId}`)
      .then(({ data: d }) => setData(d))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) { setError('Please select a rating'); return; }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/reviews', { product: productId, ...form },
        { headers: { Authorization: `Bearer ${token}` } });
      setForm({ rating: 0, comment: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-section">
      <h3 className="review-title">Reviews & Ratings</h3>

      {/* Summary */}
      <div className="review-summary">
        <span className="avg-rating">{data.avgRating}</span>
        <Stars rating={Math.round(data.avgRating)} />
        <span className="review-count">({data.count} review{data.count !== 1 ? 's' : ''})</span>
      </div>

      {/* Submit form */}
      {user && (
        <form onSubmit={handleSubmit} className="review-form">
          <p className="review-form-label">Leave a review</p>
          {error && <div className="alert alert-error">{error}</div>}
          <Stars rating={form.rating} onSelect={(s) => setForm({ ...form, rating: s })} />
          <textarea
            placeholder="Share your experience (optional)"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            maxLength={500}
            rows={3}
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Reviews list */}
      {loading ? <div className="spinner" /> : (
        <div className="reviews-list">
          {data.reviews.length === 0 && <p className="no-reviews">No reviews yet. Be the first!</p>}
          {data.reviews.map((r) => (
            <div key={r._id} className="review-item">
              <div className="review-header">
                <div className="reviewer-avatar">
                  {r.user?.profilePicture
                    ? <img src={r.user.profilePicture} alt={r.user.name} />
                    : <span>{r.user?.name?.[0]?.toUpperCase() || '?'}</span>}
                </div>
                <div>
                  <p className="reviewer-name">{r.user?.name || 'Anonymous'}</p>
                  <Stars rating={r.rating} />
                </div>
                <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              {r.comment && <p className="review-comment">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
