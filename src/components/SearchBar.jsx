import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './SearchBar.css';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length < 2) { setResults([]); setShow(false); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/products?search=${encodeURIComponent(query)}`);
        setResults(data.slice(0, 6));
        setShow(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  // Close on outside click/tap
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShow(false);
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, []);

  const handleSelect = (id) => {
    setQuery('');
    setShow(false);
    navigate(`/product/${id}`);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShow(false);
      setQuery('');
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="searchbar-wrap" ref={wrapRef}>
      <form className="searchbar-form" onSubmit={handleSubmit}>
        <input
          className="searchbar-input"
          placeholder="Search in Gen.Z Nepal..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShow(true)}
          autoComplete="off"
        />
        <button type="submit" className="searchbar-btn" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      </form>

      {show && (
        <div className="searchbar-dropdown">
          {loading && <p className="search-item muted">Searching...</p>}
          {!loading && results.length === 0 && <p className="search-item muted">No results found</p>}
          {results.map((p) => (
            <div
              key={p._id}
              className="search-item"
              onPointerDown={(e) => { e.preventDefault(); handleSelect(p._id); }}
            >
              <img src={p.image} alt={p.name} className="search-thumb" />
              <div>
                <p className="search-name">{p.name}</p>
                <p className="search-price">NPR {p.price?.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
