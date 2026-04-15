import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import ImageUploader from '../components/ImageUploader';
import './AdminDashboard.css';
import './SellerDashboard.css';

const CATEGORIES = ['Accessories', 'Home', 'Electronics', 'Stationery', 'Wellness'];
const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

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
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  const load = () => {
    api.get('/api/orders/seller', headers)
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/api/orders/seller/${id}/status`, { status }, headers);
    load();
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="seller-page-header">
        <h1 className="seller-page-title">My Orders</h1>
        <span className="seller-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="seller-card">
        {orders.length === 0 ? (
          <p className="seller-empty">No orders yet. Share your products to get started!</p>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td className="mono">#{o._id.slice(-8).toUpperCase()}</td>
                    <td>
                      <p style={{ fontWeight: 500 }}>{o.user?.name || 'N/A'}</p>
                      <p className="text-muted">{o.user?.email}</p>
                    </td>
                    <td>
                      {o.items.map((item, i) => (
                        <p key={i} style={{ fontSize: '0.8rem', color: '#555' }}>
                          {item.name} × {item.quantity}
                        </p>
                      ))}
                    </td>
                    <td style={{ fontWeight: 600 }}>NPR {o.total?.toLocaleString()}</td>                    <td>
                      <select
                        className={`status-select status-${o.status}`}
                        value={o.status}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="text-muted">{new Date(o.createdAt).toLocaleDateString()}</td>
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
