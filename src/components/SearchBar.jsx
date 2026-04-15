import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './SearchBar.css';

export default function SearchBar({ autoFocus = false, onSearch }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Auto-focus when shown on mobile
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [autoFocus]);

  // Image search state
  const [imgPanelOpen, setImgPanelOpen] = useState(false);
  const [imgPreview, setImgPreview] = useState(null);
  const [imgResults, setImgResults] = useState([]);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgSearched, setImgSearched] = useState(false);
  const [dragging, setDragging] = useState(false);

  const timerRef = useRef(null);
  const wrapRef = useRef(null);
  const fileRef = useRef(null);
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
        setImgPanelOpen(false);
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, []);

  const handleSelect = (id) => {
    setQuery('');
    setShow(false);
    navigate(`/product/${id}`);
    if (onSearch) onSearch();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShow(false);
      setQuery('');
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      if (onSearch) onSearch();
    }
  };

  const toggleImgPanel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImgPanelOpen((prev) => !prev);
    setShow(false);
  };

  const analyzeImage = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setImgPreview(url);
    setImgLoading(true);
    setImgSearched(false);
    setImgResults([]);

    const keywords = file.name
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]/g, ' ')
      .toLowerCase()
      .split(' ')
      .filter((w) => w.length > 2);

    try {
      const searches = keywords.length > 0
        ? await Promise.all(keywords.map((kw) => api.get(`/api/products?search=${encodeURIComponent(kw)}`)))
        : [await api.get('/api/products')];

      const seen = new Set();
      const merged = [];
      for (const { data } of searches) {
        const items = Array.isArray(data) ? data : data.products || [];
        for (const p of items) {
          if (!seen.has(p._id)) { seen.add(p._id); merged.push(p); }
        }
      }
      setImgResults(merged.slice(0, 8));
    } catch {
      setImgResults([]);
    } finally {
      setImgLoading(false);
      setImgSearched(true);
    }
  };

  const handleImgFile = (e) => {
    const file = e.target.files[0];
    if (file) analyzeImage(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) analyzeImage(file);
  };

  const resetImg = () => {
    setImgPreview(null);
    setImgResults([]);
    setImgSearched(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="searchbar-wrap" ref={wrapRef}>
      <form className="searchbar-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className="searchbar-input"
          placeholder="Search in Gen.Z Nepal..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShow(true)}
          autoComplete="off"
        />

        {/* Camera icon button */}
        <button
          type="button"
          className={`searchbar-camera-btn ${imgPanelOpen ? 'active' : ''}`}
          onClick={toggleImgPanel}
          aria-label="Search by image"
          title="Search by image"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </button>

        <button type="submit" className="searchbar-btn" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      </form>

      {/* Text search dropdown */}
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

      {/* Image search panel */}
      {imgPanelOpen && (
        <div className="img-search-panel">
          <div className="img-search-panel-header">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <span>Search by Image</span>
            <span className="img-search-panel-badge">Visual Search</span>
            <button
              type="button"
              className="img-search-panel-close"
              onClick={() => setImgPanelOpen(false)}
              aria-label="Close image search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {!imgPreview ? (
            <div
              className={`img-drop-zone-inline ${dragging ? 'dragging' : ''}`}
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
                onChange={handleImgFile}
              />
              <div className="img-drop-icon-sm">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <p className="img-drop-text-sm">Drop an image or tap to upload</p>
              <p className="img-drop-sub-sm">Find similar products by photo</p>
              <button
                type="button"
                className="img-action-btn-sm"
                onClick={(e) => { e.stopPropagation(); fileRef.current.click(); }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                Camera / Upload
              </button>
            </div>
          ) : (
            <div className="img-search-active-inline">
              <div className="img-search-preview-row-inline">
                <img src={imgPreview} alt="Search" className="img-search-preview-sm" />
                <div className="img-search-status-inline">
                  {imgLoading ? (
                    <div className="img-search-loading-inline">
                      <div className="img-search-spinner-sm" />
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <p className="img-search-found-sm">
                      {imgResults.length > 0
                        ? `Found ${imgResults.length} product${imgResults.length !== 1 ? 's' : ''}`
                        : imgSearched ? 'No matches found' : ''}
                    </p>
                  )}
                  <button className="img-search-reset-sm" onClick={resetImg}>
                    Try another image
                  </button>
                </div>
              </div>

              {imgResults.length > 0 && (
                <div className="img-search-results-inline">
                  {imgResults.map((p) => (
                    <div
                      key={p._id}
                      className="img-result-item-inline"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        setImgPanelOpen(false);
                        navigate(`/product/${p._id}`);
                      }}
                    >
                      <img src={p.image} alt={p.name} className="img-result-thumb-sm" />
                      <div className="img-result-info-sm">
                        <p className="img-result-name-sm">{p.name}</p>
                        <p className="img-result-price-sm">NPR {p.price?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
