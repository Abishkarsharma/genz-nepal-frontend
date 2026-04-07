import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="card product-card">
      <Link to={`/product/${product._id}`} className="product-img-wrap">
        <img src={product.image} alt={product.name} className="product-img" />
        <span className="badge product-category">{product.category}</span>
      </Link>
      <div className="product-info">
        <Link to={`/product/${product._id}`} className="product-name">{product.name}</Link>
        <div className="product-footer">
          <span className="price">NPR {product.price.toLocaleString()}</span>
          <button
            className="add-btn"
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.name} to cart`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
