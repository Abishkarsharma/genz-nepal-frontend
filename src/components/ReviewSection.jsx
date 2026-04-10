import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './ReviewSection.css';

function StarRating({ value, onChange, size = 20 }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  return (
    <div className="star-row" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          className={`star-btn ${s <= active ? 'star-on' : 'star-off'}`}
          style={{ fontSize: size }}
          onMouseEnter={() => onChange && setHovered(s)}
          onClick={() => onChange && onChange(s)}
          aria-label={`${s} star`}
        >★</button>
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="rating-bar-row">
      <span className="rating-bar-label">{label}</span>
      <div className="rating-bar-track">
        <div className="rating-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="rating-bar-count">{count}</span>
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
  const [success, setSuccess] = useState(false);

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
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Build rating distribution
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: data.reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="review-section">
      <h3 className="review-heading">Ratings &amp; Reviews</h3>

      {/* Summary */}
      <div className="review-summary-block">
        <div className="review-avg-col">
          <span className="review-avg-num">{data.avgRating > 0 ? data.avgRating.toFixed(1) : '—'}</span>
          <StarRating value={Math.round(data.avgRating)} size={18} />
          <span className="review-total-count">{data.count} review{data.count !== 1 ? 's' : ''}</span>
        </div>
        <div className="review-dist-col">
          {dist.map((d) => (
            <RatingBar key={d.star} label={`${d.star}★`} count={d.count} total={data.count} />
          ))}
        </div>
      </div>

      {/* Write review */}
      {user ? (
        <div className="write-review-block">
          <h4 className="write-review-title">Write a Review</h4>
          {error && <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}>{error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: '0.75rem' }}>Review submitted!</div>}
          <form onSubmit={handleSubmit} className="review-form">
            <div className="review-form-row">
              <span className="review-form-label">Your rating</span>
              <StarRating value={form.rating} onChange={(s) => setForm({ ...form, rating: s })} size={24} />
            </div>
            <textarea
              className="review-textarea"
              placeholder="What did you like or dislike? (optional)"
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              maxLength={500}
              rows={3}
            />
            <button type="submit" className="review-submit-btn" disabled={submitting || !form.rating}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      ) : (
        <p className="review-login-note">
          <a href="/login">Sign in</a> to leave a review
        </p>
      )}

      {/* Reviews list */}
      <div className="reviews-list">
        {loading ? (
          <div className="spinner" />
        ) : data.reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review this product.</p>
        ) : (
          data.reviews.map((r) => (
            <div key={r._id} className="review-card">
              <div className="review-card-top">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {r.user?.profilePicture
                      ? <img src={r.user.profilePicture} alt={r.user.name} />
                      : <span>{r.user?.name?.[0]?.toUpperCase() || '?'}</span>}
                  </div>
                  <div>
                    <p className="reviewer-name">{r.user?.name || 'Anonymous'}</p>
                    <StarRating value={r.rating} size={13} />
                  </div>
                </div>
                <span className="review-date">
                  {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              {r.comment && <p className="review-comment">{r.comment}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
