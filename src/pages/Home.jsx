import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import ImageSearch from '../components/ImageSearch';
import './Home.css';

const CATEGORIES = ['All', 'Electronics', 'Accessories', 'Home', 'Stationery', 'Wellness'];
const SORT_OPTIONS = [
  { label: 'Best Match', value: 'best' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest First', value: 'newest' },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('best');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [freeDelivery, setFreeDelivery] = useState(false);
  const location = useLocation();

  const fetchProducts = useCallback(async (category) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.set('category', category);
      const searchParam = new URLSearchParams(location.search).get('search');
      if (searchParam) params.set('search', searchParam);
      const { data } = await api.get(`/api/products?${params}`);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [location.search]);

  useEffect(() => {
    fetchProducts(activeCategory);
  }, [activeCategory, fetchProducts]);

  const allBrands = [...new Set(products.map((p) => p.brand).filter(Boolean))];
  const visibleBrands = showAllBrands ? allBrands : allBrands.slice(0, 8);

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  let filtered = [...products];
  if (selectedBrands.length > 0) filtered = filtered.filter((p) => selectedBrands.includes(p.brand));
  if (freeDelivery) filtered = filtered.filter((p) => p.freeDelivery);
  if (sortBy === 'price_asc') filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price_desc') filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === 'newest') filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="container hero-content">
          <div className="hero-text">
            <span className="hero-tag">New Collection 2025</span>
            <h1>Elevating the<br />Essence of<br />Kathmandu.</h1>
            <p>Curated essentials blending ancient heritage with modern Himalayan living.</p>
            <div className="hero-actions">
              <a href="#products" className="btn btn-primary">Shop Now</a>
              <a href="#products" className="btn hero-btn-ghost">View All</a>
            </div>
          </div>
          <div className="hero-trending">
            <p className="trending-label">Trending</p>
            {['Electronics', 'Accessories', 'Home Decor', 'Wellness'].map((t) => (
              <button
                key={t}
                className="trending-tag"
                onClick={() => {
                  const cat = CATEGORIES.find((c) => t.startsWith(c)) || 'All';
                  setActiveCategory(cat);
                  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Image Search */}
      <section className="container barcode-section">
        <ImageSearch />
      </section>

      {/* Category tabs — top of products */}
      <section className="container cat-tabs-section">
        <div className="cat-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Products */}
      <section id="products" className="container products-section">
        {/* Sidebar */}
        <aside className="filter-sidebar">
          {allBrands.length > 0 && (
            <div className="filter-block">
              <h4 className="filter-heading">Brand</h4>
              {visibleBrands.map((brand) => (
                <label key={brand} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                    className="filter-checkbox"
                  />
                  <span>{brand}</span>
                </label>
              ))}
              {allBrands.length > 8 && (
                <button className="view-more-btn" onClick={() => setShowAllBrands((v) => !v)}>
                  {showAllBrands ? 'VIEW LESS' : 'VIEW MORE'}
                </button>
              )}
            </div>
          )}

          <div className="filter-block">
            <h4 className="filter-heading">Service</h4>
            <label className="filter-option">
              <input
                type="checkbox"
                checked={freeDelivery}
                onChange={() => setFreeDelivery((v) => !v)}
                className="filter-checkbox"
              />
              <span>Free Delivery</span>
            </label>
          </div>
        </aside>

        {/* Main */}
        <div className="products-main">
          <div className="results-bar">
            <span className="results-count">
              {filtered.length} item{filtered.length !== 1 ? 's' : ''}
              {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
            </span>
            <div className="results-controls">
              <div className="sort-control">
                <span className="sort-label">Sort By:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="view-toggle">
                <span className="sort-label">View:</span>
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="4" width="18" height="3" rx="1"/><rect x="3" y="10.5" width="18" height="3" rx="1"/><rect x="3" y="17" width="18" height="3" rx="1"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="spinner" />
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try a different category or filter</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'product-grid' : 'product-list'}>
              {filtered.map((p) => (
                <ProductCard key={p._id} product={p} listView={viewMode === 'list'} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
