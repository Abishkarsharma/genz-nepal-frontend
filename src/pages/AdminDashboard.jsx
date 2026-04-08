import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export default function AdminDashboard() {
  const { token } = useAuth();
  const [tab, setTab] = useState('overview');

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="admin-brand">Admin Panel</h2>
        <nav>
          {[
            { key: 'overview', label: '📊 Overview' },
            { key: 'products', label: '📦 Products' },
            { key: 'orders', label: '🛒 Orders' },
            { key: 'users', label: '👥 Users' },
            { key: 'messages', label: '💬 Messages' },
          ].map((item) => (
            <button
              key={item.key}
              className={`sidebar-btn ${tab === item.key ? 'active' : ''}`}
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="admin-main">
        {tab === 'overview' && <Overview token={token} />}
        {tab === 'products' && <Products token={token} />}
        {tab === 'orders' && <Orders token={token} />}
        {tab === 'users' && <Users token={token} />}
        {tab === 'messages' && <Messages token={token} />}
      </main>
    </div>
  );
}

/* ── Overview ── */
function Overview({ token }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/api/admin/stats', authHeader(token)).then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <div className="spinner" />;

  const cards = [
    { label: 'Total Users', value: stats.users, icon: '👥' },
    { label: 'Total Products', value: stats.products, icon: '📦' },
    { label: 'Total Orders', value: stats.orders, icon: '🛒' },
    { label: 'Revenue', value: `NPR ${stats.revenue.toLocaleString()}`, icon: '💰' },
  ];

  return (
    <div>
      <h1 className="admin-page-title">Dashboard Overview</h1>
      <div className="stats-grid">
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <span className="stat-icon">{c.icon}</span>
            <div>
              <p className="stat-value">{c.value}</p>
              <p className="stat-label">{c.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Products ── */
function Products({ token }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', category: '', image: '', stock: '', description: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/api/products').then(({ data }) => setProducts(data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.put(`/api/products/${editing}`, form, authHeader(token));
      } else {
        await api.post('/api/products', form, authHeader(token));
      }
      setForm({ name: '', price: '', category: '', image: '', stock: '', description: '' });
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const handleEdit = (p) => {
    setEditing(p._id);
    setForm({ name: p.name, price: p.price, category: p.category, image: p.image, stock: p.stock, description: p.description });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/api/products/${id}`, authHeader(token));
    load();
  };

  return (
    <div>
      <h1 className="admin-page-title">Products</h1>
      <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
        <h3>{editing ? 'Edit Product' : 'Add New Product'}</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Price (NPR)</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select</option>
              {['Accessories', 'Home', 'Electronics', 'Stationery', 'Wellness'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Image URL</label>
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary btn-sm">
              {editing ? 'Update Product' : 'Add Product'}
            </button>
            {editing && (
              <button type="button" className="btn btn-outline btn-sm"
                onClick={() => { setEditing(null); setForm({ name: '', price: '', category: '', image: '', stock: '', description: '' }); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="admin-card">
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td><img src={p.image} alt={p.name} className="table-img" /></td>
                  <td>{p.name}</td>
                  <td><span className="badge">{p.category}</span></td>
                  <td>NPR {Number(p.price).toLocaleString()}</td>
                  <td>{p.stock}</td>
                  <td>
                    <button className="action-btn edit" onClick={() => handleEdit(p)}>Edit</button>
                    <button className="action-btn delete" onClick={() => handleDelete(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Orders ── */
function Orders({ token }) {
  const [orders, setOrders] = useState([]);

  const load = () => api.get('/api/admin/orders', authHeader(token)).then(({ data }) => setOrders(data));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/api/admin/orders/${id}/status`, { status }, authHeader(token));
    load();
  };

  return (
    <div>
      <h1 className="admin-page-title">All Orders</h1>
      <div className="admin-card">
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="mono">#{o._id.slice(-8).toUpperCase()}</td>
                  <td>
                    <p>{o.user?.name || 'N/A'}</p>
                    <p className="text-muted">{o.user?.email}</p>
                  </td>
                  <td>{o.items.length} item(s)</td>
                  <td>NPR {o.total?.toLocaleString()}</td>
                  <td>
                    <select
                      className={`status-select status-${o.status}`}
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                    >
                      {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="text-muted">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Users ── */
function Users({ token }) {
  const [users, setUsers] = useState([]);

  const load = () => api.get('/api/admin/users', authHeader(token)).then(({ data }) => setUsers(data));
  useEffect(() => { load(); }, []);

  const updateRole = async (id, role) => {
    await api.patch(`/api/admin/users/${id}/role`, { role }, authHeader(token));
    load();
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await api.delete(`/api/admin/users/${id}`, authHeader(token));
    load();
  };

  return (
    <div>
      <h1 className="admin-page-title">All Users</h1>
      <div className="admin-card">
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td className="text-muted">{u.email}</td>
                  <td>
                    <select
                      className={`role-select role-${u.role}`}
                      value={u.role}
                      onChange={(e) => updateRole(u._id, e.target.value)}
                    >
                      <option value="user">user</option>
                      <option value="seller">seller</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="action-btn delete" onClick={() => deleteUser(u._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Messages ── */
function Messages({ token }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    api.get('/api/admin/messages', authHeader(token)).then(({ data }) => setMessages(data));
  }, []);

  return (
    <div>
      <h1 className="admin-page-title">All Messages</h1>
      <div className="admin-card">
        {messages.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No messages yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>From</th><th>Email</th><th>Product</th><th>Message</th><th>Date</th></tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m._id}>
                    <td>{m.sender?.name || m.senderName || 'N/A'}</td>
                    <td className="text-muted">{m.sender?.email || m.senderEmail}</td>
                    <td>{m.product?.name || 'N/A'}</td>
                    <td style={{ maxWidth: '260px', wordBreak: 'break-word' }}>{m.message}</td>
                    <td className="text-muted">{new Date(m.createdAt).toLocaleDateString()}</td>
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
