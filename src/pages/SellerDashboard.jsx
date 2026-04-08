import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

export default function SellerDashboard() {
  const { token, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', category: '', image: '', stock: '', description: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  const load = () =>
    api.get('/api/products').then(({ data }) =>
      setProducts(data.filter((p) => String(p.createdBy) === user.id))
    );

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const handleEdit = (p) => {
    setEditing(p._id);
    setForm({ name: p.name, price: p.price, category: p.category, image: p.image, stock: p.stock, description: p.description });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/api/products/${id}`, headers);
    load();
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1 className="admin-page-title">Seller Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Manage your products</p>

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
            <button type="submit" className="btn btn-primary btn-sm">{editing ? 'Update' : 'Add Product'}</button>
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
        <h3>My Products ({products.length})</h3>
        {products.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No products yet. Add your first one above.</p>
        ) : (
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
        )}
      </div>
    </div>
  );
}
