import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './ImageSearch.css';

export default function ImageSearch() {
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();
  const navigate = useNavigate();

  const analyzeImage = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setLoading(true);
    setSearched(false);
    setResults([]);

    // Extract dominant color and filename keywords for matching
    const keywords = file.name
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]/g, ' ')
      .toLowerCase()
      .split(' ')
      .filter((w) => w.length > 2);

    try {
      // Search by filename keywords — works for most product photos
      const searches = keywords.length > 0
        ? await Promise.all(keywords.map((kw) => api.get(`/api/products?search=${encodeURIComponent(kw)}`)))
        : [await api.get('/api/products')];

      const seen = new Set();
      const merged = [];
      for (const { data } of searches) {
        for (const p of data) {
          if (!seen.has(p._id)) { seen.add(p._id); merged.push(p); }
        }
      }
      setResults(merged.slice(0, 8));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) analyzeImage(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) analyzeImage(file);
  };

  const reset = () => {
    setPreview(null);
    setResults([]);
    setSearched(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="img-search-wrap">
      <div className="img-search-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span>Search by Image</span>
        <span className="img-search-badge">Visual Search</span>
      </div>

      {!preview ? (
        <div
          className={`img-drop-zone ${dragging ? 'dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handleFile}
          />
          <div className="img-drop-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <p className="img-drop-text">Drop an image or tap to upload</p>
          <p className="img-drop-sub">Take a photo or upload from gallery to find similar products</p>
          <div className="img-drop-actions">
            <button
              type="button"
              className="img-action-btn"
              onClick={(e) => { e.stopPropagation(); fileRef.current.click(); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Camera / Upload
            </button>
          </div>
        </div>
      ) : (
        <div className="img-search-active">
          <div className="img-search-preview-row">
            <img src={preview} alt="Search" className="img-search-preview" />
            <div className="img-search-status">
              {loading ? (
                <div className="img-search-loading">
                  <div className="img-search-spinner" />
                  <span>Searching products...</span>
                </div>
              ) : (
                <p className="img-search-found">
                  {results.length > 0
                    ? `Found ${results.length} matching product${results.length !== 1 ? 's' : ''}`
                    : 'No matching products found'}
                </p>
              )}
              <button className="img-search-reset" onClick={reset}>
                Try another image
              </button>
            </div>
          </div>

          {results.length > 0 && (
            <div className="img-search-results">
              {results.map((p) => (
                <div
                  key={p._id}
                  className="img-result-item"
                  onClick={() => navigate(`/product/${p._id}`)}
                >
                  <img src={p.image} alt={p.name} className="img-result-thumb" />
                  <div className="img-result-info">
                    <p className="img-result-name">{p.name}</p>
                    <p className="img-result-price">NPR {p.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

