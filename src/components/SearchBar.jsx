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

  const handleSelect = (id) => {
    setQuery('');
    setShow(false);
    navigate(`/product/${id}`);
  };

  return (
    <div className="searchbar-wrap">
      <input
        className="searchbar-input"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        onFocus={() => query.length >= 2 && setShow(true)}
      />
      {show && (
        <div className="searchbar-dropdown">
          {loading && <p className="search-item muted">Searching...</p>}
          {!loading && results.length === 0 && <p className="search-item muted">No results found</p>}
          {results.map((p) => (
            <div key={p._id} className="search-item" onMouseDown={() => handleSelect(p._id)}>
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
