import React, { useEffect, useState } from 'react';
import api from '../api';
import ProductCard from '../components/ProductCard';
import BarcodeSearch from '../components/BarcodeSearch';
import './Home.css';

const CATEGORIES = ['All', 'Accessories', 'Home', 'Electronics', 'Stationery', 'Wellness'];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = activeCategory === 'All'
          ? '/api/products'
          : `/api/products?category=${activeCategory}`;
        const { data } = await api.get(url);
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory]);

  const featured = products.slice(0, 4);

  return (
    <div>
      {/* Hero / Promo Banner */}
      <section className="hero">
        <div className="container hero-content">
          <p className="hero-tag">New Collection</p>
          <h1>Elevating the<br />Essence of<br />Kathmandu.</h1>
          <p className="hero-sub">Discover curated essentials that blend ancient heritage with modern Himalayan living.</p>
          <a href="#products" className="btn btn-primary">Shop Collection →</a>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="container featured-section">
          <h2 className="section-title">Featured Picks</h2>
          <div className="product-grid">
            {featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* Barcode Search */}
      <section className="container" style={{ marginTop: '1.5rem' }}>
        <BarcodeSearch />
      </section>

      {/* Category Tabs */}
      <section className="container" style={{ marginTop: '0.5rem' }}>
        <div className="category-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => { setActiveCategory(cat); setLoading(true); }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* All Products */}
      <section id="products" className="container" style={{ marginTop: '1.5rem', paddingBottom: '3rem' }}>
        <div className="section-header">
          <h2 className="page-title">All Products</h2>
          <p className="page-subtitle">Handpicked for your lifestyle</p>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try a different category</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
