import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import ReviewSection from '../components/ReviewSection';
import ContactSeller from '../components/ContactSeller';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api.get(`/api/products/${id}`)
      .then(({ data }) => setProduct(data))
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

  return (
    <div className="container detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="detail-grid">
        <div className="detail-img-wrap">
          <img src={product.image} alt={product.name} className="detail-img" />
          <span className="badge">{product.category}</span>
        </div>

        <div className="detail-info">
          <p className="detail-category">{product.category}</p>
          <h1 className="detail-name">{product.name}</h1>

          {/* Price */}
          <div className="detail-price-block">
            <p className="detail-price-main">NPR {product.price.toLocaleString()}</p>
            {product.originalPrice && (
              <p className="detail-price-original">NPR {product.originalPrice.toLocaleString()}</p>
            )}
          </div>

          <p className="detail-desc">{product.description}</p>

          {/* Specifications */}
          {product.specifications?.length > 0 && (
            <div className="specs-table">
              <h4>Specifications</h4>
              <table>
                <tbody>
                  {product.specifications.map((s, i) => (
                    <tr key={i}>
                      <td className="spec-key">{s.key}</td>
                      <td className="spec-val">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="detail-stock">
            {product.stock > 0
              ? <span className="in-stock">✓ In Stock ({product.stock} available)</span>
              : <span className="out-stock">Out of Stock</span>}
          </div>

          <div className="detail-actions">
            <div className="qty-control">
              <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span className="qty-value">{qty}</span>
              <button className="qty-btn" onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
            </div>
            <button
              className={`btn btn-primary ${added ? 'added' : ''}`}
              onClick={handleAdd}
              disabled={product.stock === 0}
            >
              {added ? '✓ Added to Cart' : 'Add to Cart'}
            </button>
          </div>

          <button className="btn btn-outline" style={{ marginTop: '0.75rem', width: '100%' }}
            onClick={() => { addToCart(product, qty); navigate('/cart'); }}>
            Buy Now →
          </button>
        </div>
      </div>

      {/* Contact Seller */}
      <ContactSeller product={product} />

      {/* Reviews */}
      <ReviewSection productId={id} />
    </div>
  );
}
