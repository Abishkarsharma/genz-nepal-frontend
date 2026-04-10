import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { SHIPPING } from '../constants';
import './Cart.css';

export default function Cart() {
  const { cart, removeFromCart, updateQty, subtotal } = useCart();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState('');
  const [wishlist, setWishlist] = useState({});

  // Build checked state from current cart — all checked by default
  const [checkedItems, setCheckedItems] = useState({});

  // Sync whenever cart changes — new items get auto-checked
  useEffect(() => {
    setCheckedItems((prev) => {
      const next = {};
      cart.forEach((i) => {
        // Keep existing state if already set, otherwise default to true
        next[i._id] = i._id in prev ? prev[i._id] : true;
      });
      return next;
    });
  }, [cart]);

  const allChecked = cart.length > 0 && cart.every((i) => checkedItems[i._id]);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const shipping = cart.length > 0 ? SHIPPING : 0;

  // Only calculate totals for checked items
  const checkedCart = cart.filter((i) => checkedItems[i._id]);
  const checkedSubtotal = checkedCart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = checkedSubtotal + (checkedCart.length > 0 ? shipping : 0);

  const toggleSelectAll = () => {
    const next = !allChecked;
    const updated = {};
    cart.forEach((i) => (updated[i._id] = next));
    setCheckedItems(updated);
  };

  const toggleItem = (id) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleWishlist = (id) => {
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const deleteChecked = () => {
    Object.entries(checkedItems).forEach(([id, checked]) => {
      if (checked) removeFromCart(id);
    });
    setCheckedItems({});
  };

  const grouped = cart.reduce((acc, item) => {
    const seller = item.seller || item.category || 'Store';
    if (!acc[seller]) acc[seller] = [];
    acc[seller].push(item);
    return acc;
  }, {});

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
    <div className="cart-page-wrap">
      <div className="cart-page container">
        <div className="cart-left">
          {/* Select All Bar */}
          <div className="cart-select-bar">
            <label className="cart-checkbox-label">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleSelectAll}
                className="cart-checkbox"
              />
              <span>SELECT ALL ({cart.length} ITEM{cart.length !== 1 ? 'S' : ''})</span>
            </label>
            {checkedCount > 0 && (
              <button className="cart-delete-btn" onClick={deleteChecked}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
                DELETE
              </button>
            )}
          </div>

          {Object.entries(grouped).map(([seller, items]) => (
            <div key={seller} className="cart-seller-group">
              <div className="cart-seller-header">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span className="seller-name">{seller}</span>
              </div>

              {items.map((item) => (
                <div key={item._id} className="cart-item-row">
                  <input
                    type="checkbox"
                    checked={!!checkedItems[item._id]}
                    onChange={() => toggleItem(item._id)}
                    className="cart-checkbox"
                  />
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-details">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-meta">{item.category}</p>
                    <div className="cart-item-price-row">
                      <span className="cart-price-current">NPR {item.price.toLocaleString()}</span>
                      {item.originalPrice && (
                        <span className="cart-price-original">NPR {item.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="cart-item-actions">
                      <button
                        className={`cart-wishlist-btn ${wishlist[item._id] ? 'wishlisted' : ''}`}
                        onClick={() => toggleWishlist(item._id)}
                        aria-label="Wishlist"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24"
                          fill={wishlist[item._id] ? 'currentColor' : 'none'}
                          stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </button>
                      <button className="cart-remove-btn" onClick={() => removeFromCart(item._id)} aria-label="Remove">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                          <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="cart-qty-col">
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => updateQty(item._id, item.quantity - 1)}>−</button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQty(item._id, item.quantity + 1)}
                        disabled={item.stock != null && item.quantity >= item.stock}
                      >+</button>
                    </div>
                    {item.stock != null && item.quantity >= item.stock && (
                      <p className="cart-stock-warn">Max {item.stock} available</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="cart-summary">
          <h2 className="summary-title">Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal ({checkedCart.length} item{checkedCart.length !== 1 ? 's' : ''} selected)</span>
            <span>NPR {checkedSubtotal.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Shipping Fee</span>
            <span>{checkedCart.length > 0 ? `NPR ${shipping.toLocaleString()}` : '—'}</span>
          </div>
          <div className="voucher-row">
            <input
              type="text"
              placeholder="Enter Voucher Code"
              value={voucher}
              onChange={(e) => setVoucher(e.target.value)}
              className="voucher-input"
            />
            <button className="voucher-apply-btn">APPLY</button>
          </div>
          <div className="summary-total-row">
            <span>Total</span>
            <span className="summary-total-amount">NPR {total.toLocaleString()}</span>
          </div>
          <button
            className="checkout-btn"
            onClick={() => navigate('/checkout')}
            disabled={checkedCount === 0}
            style={{ opacity: checkedCount === 0 ? 0.5 : 1 }}
          >
            {checkedCount === 0 ? 'SELECT ITEMS TO CHECKOUT' : `PROCEED TO CHECKOUT (${checkedCount})`}
          </button>
        </div>
      </div>
    </div>
  );
}
