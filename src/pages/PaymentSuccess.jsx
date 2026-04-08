import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './PaymentSuccess.css';

export default function PaymentSuccess() {
  const { state } = useLocation();
  const orderId = state?.orderId;
  const ref = state?.ref;
  const method = state?.method;

  return (
    <div className="container success-page">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Payment Successful!</h1>
        <p className="success-sub">Your order has been placed successfully.</p>

        <div className="success-details">
          {orderId && (
            <div className="detail-row">
              <span>Order ID</span>
              <span className="mono">#{String(orderId).slice(-8).toUpperCase()}</span>
            </div>
          )}
          {ref && ref !== 'COD' && (
            <div className="detail-row">
              <span>Payment Ref</span>
              <span className="mono">{ref}</span>
            </div>
          )}
          {method && (
            <div className="detail-row">
              <span>Payment Method</span>
              <span>{method}</span>
            </div>
          )}
        </div>

        <Link to="/orders" className="btn btn-primary" style={{ justifyContent: 'center', width: '100%' }}>
          View My Orders →
        </Link>
        <Link to="/" className="btn btn-outline" style={{ justifyContent: 'center', width: '100%', marginTop: '0.75rem' }}>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
