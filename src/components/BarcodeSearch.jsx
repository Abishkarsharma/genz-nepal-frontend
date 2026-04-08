import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './BarcodeSearch.css';

export default function BarcodeSearch() {
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) { setError('Please enter a barcode'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/api/products?barcode=${encodeURIComponent(barcode.trim())}`);
      navigate(`/product/${data._id}`);
    } catch {
      setError('No product found for this barcode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="barcode-wrap">
      <form onSubmit={handleSubmit} className="barcode-form">
        <span className="barcode-icon">▦</span>
        <input
          className="barcode-input"
          placeholder="Scan or enter barcode..."
          value={barcode}
          onChange={(e) => { setBarcode(e.target.value); setError(''); }}
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
          {loading ? '...' : 'Find'}
        </button>
      </form>
      {error && <p className="barcode-error">{error}</p>}
    </div>
  );
}
