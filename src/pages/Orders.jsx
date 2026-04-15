import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const CANCEL_REASONS = [
  'Changed my mind',
  'Ordered by mistake',
  'Found a better price elsewhere',
  'Delivery time is too long',
  'Product details were incorrect',
  'Payment issue',
  'Other',
];

function OrderTracker({ status }) {
  if (status === 'cancelled') {
    return <div className="tracker-cancelled"><span>✕</span> Order Cancelled</div>;
  }
  const idx = STATUS_STEPS.indexOf(status);
  return (
    <div className="tracker">
      {STATUS_STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`tracker-node ${i <= idx ? 'done' : ''} ${i === idx ? 'active' : ''}`}>
            <div className="tracker-circle">
              {i < idx ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : i + 1}
            </div>
            <span className="tracker-label">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`tracker-line ${i < idx ? 'filled' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Cancel Modal Component
function CancelModal({ order, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason) { setError('Please select a reason for cancellation'); return; }
    onConfirm(order._id, reason, note);
  };

  return (
    <div className="cancel-modal-overlay" onClick={onClose}>
      <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cancel-modal-header">
          <h3>Cancel Order</h3>
          <button className="cancel-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Order summary */}
        <div className="cancel-order-summary">
          <span className="cancel-order-id">#{order._id.slice(-8).toUpperCase()}</span>
          <span className="cancel-order-total">NPR {order.total?.toLocaleString()}</span>
        </div>
        <div className="cancel-order-items">
          {order.items.slice(0, 3).map((item, i) => (
            <div key={i} className="cancel-item-row">
              <img src={item.image} alt={item.name} />
              <span>{item.name} ×{item.quantity}</span>
            </div>
          ))}
          {order.items.length > 3 && (
            <p className="cancel-more">+{order.items.length - 3} more item(s)</p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}>{error}</div>}

          <div className="cancel-field">
            <label>Why are you cancelling? <span style={{ color: '#ef4444' }}>*</span></label>
            <div className="cancel-reasons">
              {CANCEL_REASONS.map((r) => (
                <label key={r} className={`cancel-reason-option ${reason === r ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => { setReason(r); setError(''); }}
                  />
                  {r}
                </label>
              ))}
            </div>
          </div>

          <div className="cancel-field">
            <label>Additional details <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              rows={3}
              placeholder="Tell us more about why you're cancelling..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
            />
            <span className="cancel-char-count">{note.length}/300</span>
          </div>

          <div className="cancel-modal-actions">
            <button type="button" className="cancel-modal-back" onClick={onClose}>
              Keep Order
            </button>
            <button type="submit" className="cancel-modal-confirm" disabled={loading}>
              {loading ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Orders() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [cancelModal, setCancelModal] = useState(null); // order object
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/api/orders/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setOrders(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleCancelConfirm = async (orderId, reason, note) => {
    setCancelling(true);
    try {
      await api.patch(`/api/orders/cancel/${orderId}`, { cancelReason: reason, cancelNote: note }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders((prev) =>
        prev.map((o) => o._id === orderId
          ? { ...o, status: 'cancelled', cancelReason: reason, cancelNote: note }
          : o
        )
      );
      setCancelModal(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="spinner" style={{ marginTop: '4rem' }} />;

  return (
    <div className="orders-wrap">
      <div className="container orders-page">
        <div className="orders-header">
          <h1 className="orders-title">My Orders</h1>
          <span className="orders-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders yet</h3>
            <p>Your orders will appear here once you shop.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const addr = order.shippingAddress || {};
              const isOpen = expanded === order._id;
              const canCancel = ['pending', 'processing'].includes(order.status);
              return (
                <div key={order._id} className="order-card">
                  <div className="order-card-top" onClick={() => setExpanded(isOpen ? null : order._id)}>
                    <div className="order-meta">
                      <span className="order-id">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="order-card-right">
                      <span className={`order-status-badge status-${order.status}`}>{order.status}</span>
                      <span className="order-total-badge">NPR {order.total?.toLocaleString()}</span>
                      <svg className={`expand-icon ${isOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                  </div>

                  <div className="order-items-preview">
                    {order.items.slice(0, 4).map((item, i) => (
                      <img key={i} src={item.image} alt={item.name} className="order-thumb" />
                    ))}
                    {order.items.length > 4 && <span className="order-more-items">+{order.items.length - 4}</span>}
                    <span className="order-item-count">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>

                    {canCancel && (
                      <button
                        className="cancel-order-btn"
                        onClick={(e) => { e.stopPropagation(); setCancelModal(order); }}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>

                  <OrderTracker status={order.status} />

                  {/* Show cancellation reason if cancelled */}
                  {order.status === 'cancelled' && order.cancelReason && (
                    <div className="cancel-reason-display">
                      <span className="cancel-reason-label">Cancellation Reason:</span>
                      <span className="cancel-reason-value">{order.cancelReason}</span>
                      {order.cancelNote && (
                        <p className="cancel-reason-note">"{order.cancelNote}"</p>
                      )}
                    </div>
                  )}

                  {isOpen && (
                    <div className="order-details">
                      <div className="order-detail-section">
                        <h4>Items Ordered</h4>
                        {order.items.map((item, i) => (
                          <div key={i} className="order-detail-item">
                            <img src={item.image} alt={item.name} />
                            <div className="order-detail-item-info">
                              <p className="order-detail-item-name">{item.name}</p>
                              <p className="order-detail-item-meta">Qty: {item.quantity} · NPR {item.price?.toLocaleString()} each</p>
                            </div>
                            <span className="order-detail-item-total">NPR {(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-detail-section">
                        <h4>Delivery Address</h4>
                        <div className="address-block">
                          <p className="addr-name">{addr.fullName}</p>
                          <p className="addr-line">{addr.phone}{addr.email ? ` · ${addr.email}` : ''}</p>
                          <p className="addr-line">{[addr.street, addr.area, addr.landmark].filter(Boolean).join(', ')}</p>
                          <p className="addr-line">
                            {[addr.city, addr.district, addr.province].filter(Boolean).join(', ')}
                            {addr.postalCode ? ` — ${addr.postalCode}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="order-detail-section">
                        <h4>Payment</h4>
                        <div className="order-payment-row">
                          <span>{order.paymentMethod}</span>
                          <span className={`payment-status-pill ${order.paymentStatus === 'paid' ? 'paid' : 'pending-pay'}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                        <div className="order-totals">
                          <div className="order-total-row"><span>Subtotal</span><span>NPR {order.subtotal?.toLocaleString()}</span></div>
                          <div className="order-total-row"><span>Shipping</span><span>NPR {order.shipping?.toLocaleString()}</span></div>
                          <div className="order-total-row grand"><span>Total</span><span>NPR {order.total?.toLocaleString()}</span></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {cancelModal && (
        <CancelModal
          order={cancelModal}
          onClose={() => setCancelModal(null)}
          onConfirm={handleCancelConfirm}
          loading={cancelling}
        />
      )}
    </div>
  );
}
