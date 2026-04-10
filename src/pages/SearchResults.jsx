import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import './SearchResults.css';

const SORT_OPTIONS = [
  { label: 'Best Match', value: 'best' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest First', value: 'newest' },
];

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('best');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    api.get(`/api/products?search=${encodeURIComponent(query)}`)
      .then(({ data }) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [query]);

  let sorted = [...products];
  if (sortBy === 'price_asc') sorted.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price_desc') sorted.sort((a, b) => b.price - a.price);
  else if (sortBy === 'newest') sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="sr-wrap">
      <div className="container sr-page">
        {/* Header */}
        <div className="sr-header">
          <div className="sr-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Search results for "{query}"</span>
          </div>
          <h1 className="sr-title">
            {loading ? 'Searching...' : `${sorted.length} result${sorted.length !== 1 ? 's' : ''} for "${query}"`}
          </h1>
        </div>

        <div className="sr-body">
          {/* Sidebar */}
          <aside className="sr-sidebar">
            <div className="sr-sidebar-block">
              <h4>Category</h4>
              {['All', 'Electronics', 'Accessories', 'Home', 'Stationery', 'Wellness'].map((cat) => (
                <Link
                  key={cat}
                  to={cat === 'All' ? `/?search=${query}` : `/?search=${query}&category=${cat}`}
                  className="sr-cat-link"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </aside>

          {/* Results */}
          <div className="sr-main">
            {/* Controls bar */}
            <div className="sr-controls">
              <span className="sr-count">
                {loading ? '' : `${sorted.length} items found`}
              </span>
              <div className="sr-controls-right">
                <div className="sort-control">
                  <span className="sort-label">Sort By:</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="view-toggle">
                  <button
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="3" y="3" width="7" height="7" rx="1"/>
                      <rect x="14" y="3" width="7" height="7" rx="1"/>
                      <rect x="3" y="14" width="7" height="7" rx="1"/>
                      <rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                  </button>
                  <button
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="3" y="4" width="18" height="3" rx="1"/>
                      <rect x="3" y="10.5" width="18" height="3" rx="1"/>
                      <rect x="3" y="17" width="18" height="3" rx="1"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="spinner" />
            ) : sorted.length === 0 ? (
              <div className="sr-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <h3>No results for "{query}"</h3>
                <p>Try different keywords or browse our categories</p>
                <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse All Products</Link>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'product-grid' : 'product-list'}>
                {sorted.map((p) => (
                  <ProductCard key={p._id} product={p} listView={viewMode === 'list'} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
