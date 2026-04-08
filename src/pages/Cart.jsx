import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { SHIPPING, TAX_RATE } from '../constants';
import './Cart.css';

export default function Cart() {
  const { cart, removeFromCart, updateQty, subtotal } = useCart();
  const navigate = useNavigate();

  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + SHIPPING + tax;

  if (cart.length === 0) {
    return (
      <div className="container empty-state" style={{ marginTop: '4rem' }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1 className="page-title">Your Selection <span className="item-count">({cart.length} items)</span></h1>

      <div className="cart-layout">
        {/* Items */}
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item._id} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-item-img" />
              <div className="cart-item-info">
                <p className="cart-item-name">{item.name}</p>
                <p className="cart-item-sub">One Size</p>
                <p className="price">NPR {item.price.toLocaleString()} <span className="vat-note">+13% VAT = NPR {Math.round(item.price * 1.13).toLocaleString()}</span></p>
              </div>
              <div className="cart-item-right">
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => updateQty(item._id, item.quantity - 1)}>−</button>
                  <span className="qty-value">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQty(item._id, item.quantity + 1)}>+</button>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item._id)} aria-label="Remove item">
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-row"><span>Subtotal</span><span>NPR {subtotal.toLocaleString()}</span></div>
          <div className="summary-row"><span>Estimated Shipping</span><span>NPR {SHIPPING.toLocaleString()}</span></div>
          <div className="summary-row"><span>Taxes (VAT 13%)</span><span>NPR {tax.toLocaleString()}</span></div>
          <div className="summary-row total"><span>Total</span><span>NPR {total.toLocaleString()}</span></div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => navigate('/checkout')}>
            Proceed to Checkout →
          </button>
          <p className="secure-note">🔒 Secure Encrypted Checkout</p>
        </div>
      </div>
    </div>
  );
}
