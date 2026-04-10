import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import ReviewSection from '../components/ReviewSection';
import ContactSeller from '../components/ContactSeller';
import './ProductDetail.css';

function DeliveryEstimate({ city }) {
  const today = new Date();
  const days = city === 'Kathmandu' || city === 'Lalitpur' || city === 'Bhaktapur' ? 2 : 5;
  const delivery = new Date(today);
  delivery.setDate(today.getDate() + days);
  const formatted = delivery.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  return (
    <div className="delivery-estimate">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 5v3h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
      <span>Estimated delivery by <strong>{formatted}</strong></span>
    </div>
  );
}

function StarDisplay({ rating, count }) {
  return (
    <div className="star-display">
      <div className="stars-row">
        {[1,2,3,4,5].map((s) => (
          <svg key={s} width="14" height="14" viewBox="0 0 24 24"
            fill={s <= Math.round(rating) ? '#f59e0b' : '#e5e7eb'}
            stroke={s <= Math.round(rating) ? '#f59e0b' : '#e5e7eb'}
            strokeWidth="1">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        ))}
      </div>
      <span className="rating-val">{rating > 0 ? rating.toFixed(1) : '—'}</span>
      <span className="rating-count">({count} review{count !== 1 ? 's' : ''})</span>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviewData, setReviewData] = useState({ avgRating: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    Promise.all([
      api.get(`/api/products/${id}`),
      api.get(`/api/reviews?product=${id}`),
    ])
      .then(([{ data: p }, { data: r }]) => {
        setProduct(p);
        setReviewData({ avgRating: r.avgRating || 0, count: r.count || 0 });
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div className="spinner" style={{ marginTop: '4rem' }} />;
  if (!product) return null;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="container detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back
      </button>

      <div className="detail-grid">
        {/* Image */}
        <div className="detail-img-col">
          <div className="detail-img-wrap">
            <img src={product.image} alt={product.name} className="detail-img" />
            {discount && <span className="detail-discount-badge">{discount}% OFF</span>}
            {isOutOfStock && <div className="detail-oos-overlay">Out of Stock</div>}
          </div>
        </div>

        {/* Info */}
        <div className="detail-info">
          <p className="detail-category">{product.category}</p>
          <h1 className="detail-name">{product.name}</h1>

          {/* Ratings — above the fold */}
          <div className="detail-ratings-row">
            <StarDisplay rating={reviewData.avgRating} count={reviewData.count} />
            {product.sold > 0 && (
              <span className="detail-sold">{product.sold} sold</span>
            )}
          </div>

          {/* Price */}
          <div className="detail-price-block">
            <span className="detail-price-main">NPR {product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <>
                <span className="detail-price-original">NPR {product.originalPrice.toLocaleString()}</span>
                <span className="detail-price-save">Save NPR {(product.originalPrice - product.price).toLocaleString()}</span>
              </>
            )}
          </div>

          {/* Stock urgency */}
          <div className="detail-stock-row">
            {isOutOfStock ? (
              <span className="stock-badge out">Out of Stock</span>
            ) : isLowStock ? (
              <span className="stock-badge low">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" stroke="white" strokeWidth="2"/>
                </svg>
                Only {product.stock} left — order soon!
              </span>
            ) : (
              <span className="stock-badge in">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                In Stock ({product.stock} available)
              </span>
            )}
          </div>

          {/* Delivery estimate */}
          <DeliveryEstimate city={product.city || 'Kathmandu'} />

          {/* Qty + Add to Cart */}
          {!isOutOfStock && (
            <div className="detail-actions">
              <div className="qty-control">
                <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span className="qty-value">{qty}</span>
                <button className="qty-btn" onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
              </div>
              <button
                className={`detail-add-btn ${added ? 'added' : ''}`}
                onClick={handleAdd}
              >
                {added ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Added!
                  </>
                ) : 'Add to Cart'}
              </button>
            </div>
          )}

          <button
            className="detail-buy-btn"
            disabled={isOutOfStock}
            onClick={() => { if (!isOutOfStock) { addToCart(product, qty); navigate('/cart'); } }}
          >
            {isOutOfStock ? 'Currently Unavailable' : 'Buy Now →'}
          </button>

          {/* Trust badges */}
          <div className="detail-trust">
            <div className="trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Secure Payment</span>
            </div>
            <div className="trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Delivery across Nepal</span>
            </div>
            <div className="trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              <span>Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description / Specs */}
      <div className="detail-tabs">
        <button
          className={`detail-tab ${activeTab === 'description' ? 'active' : ''}`}
          onClick={() => setActiveTab('description')}
        >
          Description
        </button>
        {product.specifications?.length > 0 && (
          <button
            className={`detail-tab ${activeTab === 'specs' ? 'active' : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            Specifications
          </button>
        )}
      </div>

      <div className="detail-tab-content">
        {activeTab === 'description' && (
          <p className="detail-desc">{product.description || 'No description available.'}</p>
        )}
        {activeTab === 'specs' && product.specifications?.length > 0 && (
          <table className="specs-table">
            <tbody>
              {product.specifications.map((s, i) => (
                <tr key={i}>
                  <td className="spec-key">{s.key}</td>
                  <td className="spec-val">{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Contact Seller */}
      <ContactSeller product={product} />

      {/* Reviews */}
      <ReviewSection productId={id} />
    </div>
  );
}
