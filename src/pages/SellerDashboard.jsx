import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import ImageUploader from '../components/ImageUploader';
import './AdminDashboard.css';
import './SellerDashboard.css';

const CATEGORIES = ['Accessories', 'Home', 'Electronics', 'Stationery', 'Wellness'];

export default function SellerDashboard() {
  const { token, user } = useAuth();
  const [tab, setTab] = useState('products');
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  const loadNotifications = useCallback(() => {
    api.get('/api/notifications', headers)
      .then(({ data }) => {
        setNotifications(data);
        setUnread(data.filter((n) => !n.read).length);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markAllRead = async () => {
    await api.patch('/api/notifications/read-all', {}, headers);
    loadNotifications();
  };

  return (
    <div className="seller-layout">
      <aside className="seller-sidebar">
        <div className="seller-brand">
          <div className="seller-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <p className="seller-name">{user?.name}</p>
            <p className="seller-role">Seller</p>
          </div>
        </div>
        <nav>
          {[
            { key: 'products', label: 'Products', icon: '📦' },
            { key: 'orders', label: 'Orders', icon: '🛒' },
            { key: 'payment', label: 'Payment Accounts', icon: '💳' },
            { key: 'notifications', label: 'Notifications', icon: '🔔', badge: unread },
          ].map((item) => (
            <button
              key={item.key}
              className={`sidebar-btn ${tab === item.key ? 'active' : ''}`}
              onClick={() => { setTab(item.key); if (item.key === 'notifications') markAllRead(); }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge > 0 && <span className="sidebar-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="seller-main">
        {tab === 'products' && <SellerProducts token={token} userId={user?.id} />}
        {tab === 'orders' && <SellerOrders token={token} />}
        {tab === 'payment' && <SellerPaymentAccounts token={token} />}
        {tab === 'notifications' && <SellerNotifications notifications={notifications} />}
      </main>
    </div>
  );
}

/* ── Products ── */
function SellerProducts({ token, userId }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', category: '', image: '', stock: '', description: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  const load = () =>
    api.get('/api/products?limit=100').then(({ data }) => {
      const all = Array.isArray(data) ? data : data.products || [];
      setProducts(all.filter((p) => String(p.createdBy) === userId));
    });

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // prevent double submit
    setError('');
    if (!form.image) { setError('Please upload a product image'); return; }
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/api/products/${editing}`, form, headers);
      } else {
        await api.post('/api/products', form, headers);
      }
      setForm({ name: '', price: '', category: '', image: '', stock: '', description: '' });
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (p) => {
    setEditing(p._id);
    setForm({ name: p.name, price: p.price, category: p.category, image: p.image, stock: p.stock, description: p.description || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/api/products/${id}`, headers);
    load();
  };

  return (
    <div>
      <div className="seller-page-header">
        <h1 className="seller-page-title">{editing ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <div className="seller-card" style={{ marginBottom: '1.5rem' }}>
        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Product Name</label>
            <input
              placeholder="e.g. Handmade Lokta Journal"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (NPR)</label>
              <input
                type="number"
                placeholder="0"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                placeholder="0"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Image upload — file only, no URL */}
          <div className="form-group">
            <label>Product Image</label>
            <ImageUploader
              token={token}
              currentUrl={form.image}
              onUpload={(url) => setForm((f) => ({ ...f, image: url }))}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={3}
              placeholder="Describe your product..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting ? (editing ? 'Updating...' : 'Adding...') : (editing ? 'Update Product' : 'Add Product')}
            </button>
            {editing && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={submitting}
                onClick={() => { setEditing(null); setForm({ name: '', price: '', category: '', image: '', stock: '', description: '' }); }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Products table */}
      <div className="seller-card">
        <h3 className="seller-section-title">My Products ({products.length})</h3>
        {products.length === 0 ? (
          <p className="seller-empty">No products yet. Add your first product above.</p>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td><img src={p.image} alt={p.name} className="table-img" /></td>
                    <td>{p.name}</td>
                    <td><span className="cat-pill">{p.category}</span></td>
                    <td>NPR {Number(p.price).toLocaleString()}</td>
                    <td>
                      <span className={`stock-pill ${p.stock === 0 ? 'out' : p.stock < 5 ? 'low' : 'ok'}`}>
                        {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn edit" onClick={() => handleEdit(p)}>Edit</button>
                      <button className="action-btn delete" onClick={() => handleDelete(p._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Orders ── */
function SellerOrders({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  const load = () => {
    api.get('/api/orders/seller', headers)
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const STATUS_FLOW = ['pending', 'processing', 'shipped', 'delivered'];

  const canAdvance = (order) => {
    // COD: seller can always advance (payment on delivery)
    if (order.paymentMethod === 'Cash on Delivery') return true;
    // Digital payment: must be paid before processing
    return order.paymentStatus === 'paid';
  };

  const nextStatus = (current) => {
    const idx = STATUS_FLOW.indexOf(current);
    if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[idx + 1];
  };

  const updateStatus = async (id, status) => {
    setUpdating(id + status);
    try {
      await api.patch(`/api/orders/seller/${id}/status`, { status }, headers);
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status } : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const confirmPayment = async (id) => {
    setUpdating(id + 'pay');
    try {
      await api.patch(`/api/orders/seller/${id}/confirm-payment`, {}, headers);
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, paymentStatus: 'paid' } : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm payment');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="seller-page-header">
        <h1 className="seller-page-title">My Orders</h1>
        <span className="seller-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
      </div>

      {orders.length === 0 ? (
        <div className="seller-card">
          <p className="seller-empty">No orders yet. Share your products to get started!</p>
        </div>
      ) : (
        <div className="seller-orders-list">
          {orders.map((o) => {
            const isPaid = o.paymentStatus === 'paid';
            const isCOD = o.paymentMethod === 'Cash on Delivery';
            const paymentOk = isPaid || isCOD;
            const next = nextStatus(o.status);
            const isCancelled = o.status === 'cancelled';
            const isDelivered = o.status === 'delivered';
            const isOpen = expanded === o._id;

            return (
              <div key={o._id} className="seller-order-card">
                {/* Header */}
                <div className="seller-order-header" onClick={() => setExpanded(isOpen ? null : o._id)}>
                  <div className="seller-order-id-wrap">
                    <span className="seller-order-id">#{o._id.slice(-8).toUpperCase()}</span>
                    <span className="seller-order-date">{new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="seller-order-badges">
                    {/* Payment status badge */}
                    <span className={`seller-pay-badge ${isPaid ? 'paid' : isCOD ? 'cod' : 'unpaid'}`}>
                      {isPaid ? '✓ Paid' : isCOD ? '💵 COD' : '⏳ Awaiting Payment'}
                    </span>
                    {/* Order status badge */}
                    <span className={`seller-status-badge s-${o.status}`}>
                      {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                    </span>
                    <span className="seller-order-total">NPR {o.total?.toLocaleString()}</span>
                    <svg className={`expand-icon ${isOpen ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>

                {/* Payment warning for digital unpaid */}
                {!paymentOk && !isCancelled && (
                  <div className="seller-payment-warning">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Customer has not paid yet via <strong>{o.paymentMethod}</strong>. You cannot process this order until payment is confirmed.
                  </div>
                )}

                {/* COD / Bank Transfer — seller can manually confirm payment */}
                {!isPaid && !isCancelled && (isCOD || o.paymentMethod === 'Bank Transfer') && (
                  <div className="seller-confirm-payment-bar">
                    <div className="seller-confirm-payment-info">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {isCOD
                        ? 'Confirm when customer pays cash on delivery'
                        : 'Confirm when you receive the bank transfer'}
                    </div>
                    <button
                      className="seller-confirm-pay-btn"
                      onClick={() => confirmPayment(o._id)}
                      disabled={updating === o._id + 'pay'}
                    >
                      {updating === o._id + 'pay' ? 'Confirming...' : '✓ Mark as Paid'}
                    </button>
                  </div>
                )}

                {/* Status flow stepper */}
                {!isCancelled && (
                  <div className="seller-status-stepper">
                    {STATUS_FLOW.map((s, i) => {
                      const currentIdx = STATUS_FLOW.indexOf(o.status);
                      const isDone = i < currentIdx;
                      const isActive = i === currentIdx;
                      return (
                        <React.Fragment key={s}>
                          <div className={`stepper-node ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                            <div className="stepper-circle">
                              {isDone ? '✓' : i + 1}
                            </div>
                            <span className="stepper-label">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                          </div>
                          {i < STATUS_FLOW.length - 1 && (
                            <div className={`stepper-line ${isDone ? 'filled' : ''}`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}

                {isCancelled && (
                  <div className="seller-cancelled-bar">
                    <span>✕</span> Order Cancelled
                    {o.cancelReason && <span className="seller-cancel-reason"> — {o.cancelReason}</span>}
                  </div>
                )}

                {/* Action buttons */}
                {!isCancelled && !isDelivered && (
                  <div className="seller-order-actions">
                    {next && (
                      paymentOk ? (
                        <button
                          className="seller-advance-btn"
                          onClick={() => updateStatus(o._id, next)}
                          disabled={updating === o._id + next}
                        >
                          {updating === o._id + next ? 'Updating...' : (
                            next === 'delivered'
                              ? '✓ Mark as Delivered'
                              : next === 'shipped'
                              ? '🚚 Mark as Shipped'
                              : next === 'processing'
                              ? '⚙️ Start Processing'
                              : `Mark as ${next.charAt(0).toUpperCase() + next.slice(1)} →`
                          )}
                        </button>
                      ) : (
                        <div className="seller-blocked-btn">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                          Waiting for payment to advance
                        </div>
                      )
                    )}
                    <button
                      className="seller-cancel-btn"
                      onClick={() => updateStatus(o._id, 'cancelled')}
                      disabled={updating === o._id + 'cancelled'}
                    >
                      Cancel Order
                    </button>
                  </div>
                )}

                {isDelivered && (
                  <div className="seller-delivered-bar">
                    <span>✓</span> Order Delivered Successfully
                  </div>
                )}

                {/* Expanded details */}
                {isOpen && (
                  <div className="seller-order-details">
                    <div className="seller-order-detail-section">
                      <h4>Customer</h4>
                      <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{o.user?.name || 'N/A'}</p>
                      <p style={{ color: '#888', fontSize: '0.8rem' }}>{o.user?.email}</p>
                    </div>
                    <div className="seller-order-detail-section">
                      <h4>Items</h4>
                      {o.items.map((item, i) => (
                        <div key={i} className="seller-order-item-row">
                          <img src={item.image} alt={item.name} />
                          <div>
                            <p>{item.name}</p>
                            <p className="text-muted">×{item.quantity} · NPR {item.price?.toLocaleString()}</p>
                          </div>
                          <span style={{ fontWeight: 700, color: '#0ea5e9' }}>NPR {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    {o.shippingAddress && (
                      <div className="seller-order-detail-section">
                        <h4>Delivery Address</h4>
                        <p style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.6 }}>
                          {o.shippingAddress.fullName} · {o.shippingAddress.phone}<br />
                          {[o.shippingAddress.street, o.shippingAddress.area, o.shippingAddress.city].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Payment Accounts ── */
function SellerPaymentAccounts({ token }) {
  const [form, setForm] = useState({ esewa: '', khalti: '', bankName: '', accountName: '', accountNumber: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    api.get('/api/users/me', headers).then(({ data }) => {
      if (data.paymentAccounts) setForm({ ...{ esewa: '', khalti: '', bankName: '', accountName: '', accountNumber: '' }, ...data.paymentAccounts });
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.put('/api/users/me/payment-accounts', form, headers);
      setSuccess('Payment accounts saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="seller-page-header">
        <h1 className="seller-page-title">Payment Accounts</h1>
      </div>
      <div className="seller-card">
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Add your payment details below. Customers will see these when they choose to pay you directly via eSewa, Khalti, or Bank Transfer.
        </p>

        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

        <form onSubmit={handleSave}>
          {/* eSewa */}
          <div className="payment-account-section">
            <div className="payment-account-header">
              <span className="payment-account-logo esewa-logo">eSewa</span>
              <span className="payment-account-label">eSewa Account</span>
            </div>
            <div className="form-group">
              <label>eSewa Registered Phone / ID</label>
              <input
                placeholder="e.g. 98XXXXXXXX"
                value={form.esewa}
                onChange={(e) => setForm({ ...form, esewa: e.target.value })}
              />
            </div>
          </div>

          {/* Khalti */}
          <div className="payment-account-section">
            <div className="payment-account-header">
              <span className="payment-account-logo khalti-logo">khalti</span>
              <span className="payment-account-label">Khalti Account</span>
            </div>
            <div className="form-group">
              <label>Khalti Registered Phone / ID</label>
              <input
                placeholder="e.g. 98XXXXXXXX"
                value={form.khalti}
                onChange={(e) => setForm({ ...form, khalti: e.target.value })}
              />
            </div>
          </div>

          {/* Bank Transfer */}
          <div className="payment-account-section">
            <div className="payment-account-header">
              <span className="payment-account-logo bank-logo">🏦</span>
              <span className="payment-account-label">Bank Transfer</span>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Bank Name</label>
                <input
                  placeholder="e.g. Nabil Bank"
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Account Holder Name</label>
                <input
                  placeholder="e.g. Abishkar Sharma"
                  value={form.accountName}
                  onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Account Number</label>
              <input
                placeholder="e.g. 0123456789012"
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Payment Accounts'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Notifications ── */
function SellerNotifications({ notifications }) {
  return (
    <div>
      <div className="seller-page-header">
        <h1 className="seller-page-title">Notifications</h1>
      </div>
      <div className="seller-card">
        {notifications.length === 0 ? (
          <p className="seller-empty">No notifications yet.</p>
        ) : (
          <div className="notif-list">
            {notifications.map((n) => (
              <div key={n._id} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                <div className="notif-icon">
                  {n.type === 'new_order' ? '🛒' : n.type === 'message' ? '💬' : '📦'}
                </div>
                <div className="notif-body">
                  <p className="notif-title">{n.title}</p>
                  <p className="notif-text">{n.body}</p>
                  <p className="notif-time">
                    {new Date(n.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.read && <span className="notif-dot" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
