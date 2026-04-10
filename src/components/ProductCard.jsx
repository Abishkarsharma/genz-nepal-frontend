import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product, listView }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  if (listView) {
    return (
      <Link to={`/product/${product._id}`} className="product-list-card">
        <img src={product.image} alt={product.name} className="list-card-img" />
        <div className="list-card-body">
          <p className="list-card-name">{product.name}</p>
          <p className="list-card-meta">{product.category}</p>
          <div className="list-card-price-row">
            <span className="list-card-price">NPR {product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="list-card-original">NPR {product.originalPrice.toLocaleString()}</span>
            )}
            {discount && <span className="list-card-discount">{discount}% Off</span>}
          </div>
          {product.sold != null && (
            <p className="list-card-sold">{product.sold} sold</p>
          )}
        </div>
        <button className="list-add-btn" onClick={handleAdd} aria-label="Add to cart">
          {added ? '✓' : 'Add to Cart'}
        </button>
      </Link>
    );
  }

  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <div className="product-img-wrap">
        <img src={product.image} alt={product.name} className="product-img" loading="lazy" />
        {discount && <span className="product-discount-badge">{discount}%<br />Off</span>}
      </div>
      <div className="product-info">
        <p className="product-name">{product.name}</p>
        <div className="product-price-row">
          <span className="product-price">NPR {product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="product-original">NPR {product.originalPrice.toLocaleString()}</span>
          )}
        </div>
        {product.sold != null && (
          <p className="product-sold">{product.sold} sold</p>
        )}
        <button
          className={`product-add-btn ${added ? 'added' : ''}`}
          onClick={handleAdd}
          aria-label={`Add ${product.name} to cart`}
        >
          {added ? '✓ Added' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}
