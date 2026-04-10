import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './PaymentSuccess.css';

export default function PaymentSuccess() {
  const { state } = useLocation();
  const orderId = state?.orderId;
  const ref = state?.ref;
  const method = state?.method;
  const addr = state?.address || {};

  return (
    <div className="success-wrap">
      <div className="success-card">
        <div className="success-icon-wrap">
          <div className="success-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>

        <h1 className="success-title">Order Placed!</h1>
        <p className="success-sub">
          {method === 'Cash on Delivery'
            ? 'Your order is confirmed. Pay when it arrives.'
            : 'Payment received. Your order is being processed.'}
        </p>

        <div className="success-details">
          {orderId && (
            <div className="detail-row">
              <span>Order ID</span>
              <span className="detail-val mono">#{String(orderId).slice(-8).toUpperCase()}</span>
            </div>
          )}
          <div className="detail-row">
            <span>Payment</span>
            <span className="detail-val">{method}</span>
          </div>
          {ref && ref !== 'COD' && (
            <div className="detail-row">
              <span>Reference</span>
              <span className="detail-val mono">{ref}</span>
            </div>
          )}
          {addr.fullName && (
            <div className="detail-row">
              <span>Deliver to</span>
              <span className="detail-val">
                {addr.fullName}
                {addr.city ? `, ${addr.city}` : ''}
              </span>
            </div>
          )}
        </div>

        {addr.fullName && (
          <div className="success-address">
            <p className="success-address-label">Delivery Address</p>
            <p className="success-address-name">{addr.fullName} · {addr.phone}</p>
            <p className="success-address-line">
              {[addr.street, addr.area, addr.landmark].filter(Boolean).join(', ')}
            </p>
            <p className="success-address-line">
              {[addr.city, addr.district, addr.province].filter(Boolean).join(', ')}
              {addr.postalCode ? ` — ${addr.postalCode}` : ''}
            </p>
          </div>
        )}

        <div className="success-actions">
          <Link to="/orders" className="btn btn-primary" style={{ justifyContent: 'center' }}>
            Track My Order
          </Link>
          <Link to="/" className="btn btn-outline" style={{ justifyContent: 'center' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
