import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

const SHIPPING = 150;

export default function Checkout() {
  const { cart, subtotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: '', phone: '', city: 'Kathmandu', address: '' });
  const [payment, setPayment] = useState('Cash on Delivery');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const total = subtotal + SHIPPING;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (cart.length === 0) return navigate('/');

    setLoading(true);
    setError('');
    try {
      const items = cart.map((i) => ({
        product: i._id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      }));
      await api.post('/api/orders', {
        items,
        shippingAddress: form,
        paymentMethod: payment,
        subtotal,
        shipping: SHIPPING,
        total,
      }, { headers: { Authorization: `Bearer ${token}` } });

      clearCart();
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container checkout-page">
      <div className="checkout-header">
        <h1>The Gen.Z Nepal</h1>
        <span className="secure-badge">🔒 Secure Checkout</span>
      </div>

      <div className="checkout-steps">
        <span className="step active">● Address</span>
        <span className="step-line" />
        <span className="step">○ Payment</span>
        <span className="step-line" />
        <span className="step">○ Review</span>
      </div>

      <div className="checkout-layout">
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-section">
            <h2>Shipping Details</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label>Full Name</label>
              <input name="fullName" placeholder="e.g. Aryan Sharma" value={form.fullName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input name="phone" placeholder="+977 98XXXXXXXX" value={form.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>City</label>
              <select name="city" value={form.city} onChange={handleChange}>
                <option>Kathmandu</option>
                <option>Pokhara</option>
                <option>Lalitpur</option>
                <option>Bhaktapur</option>
                <option>Biratnagar</option>
              </select>
            </div>
            <div className="form-group">
              <label>Detailed Address</label>
              <textarea name="address" placeholder="House No., Street Name, Landmark..." rows={3}
                value={form.address} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-section">
            <h2>Payment Method</h2>
            <div className="payment-options">
              {['Cash on Delivery', 'Card / Wallet'].map((method) => (
                <label key={method} className={`payment-option ${payment === method ? 'selected' : ''}`}>
                  <input type="radio" name="payment" value={method}
                    checked={payment === method} onChange={() => setPayment(method)} />
                  <div>
                    <p className="payment-title">{method}</p>
                    <p className="payment-sub">
                      {method === 'Cash on Delivery'
                        ? 'Pay with cash when your package arrives.'
                        : 'Visa, Mastercard, or local digital wallets.'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Placing Order...' : 'Place Order →'}
          </button>
          <p className="terms-note">By placing your order, you agree to our Terms of Service and Privacy Policy.</p>
        </form>

        {/* Order Summary */}
        <div className="checkout-summary">
          <h2>Order Summary</h2>
          {cart.map((item) => (
            <div key={item._id} className="checkout-item">
              <img src={item.image} alt={item.name} />
              <div>
                <p>{item.name}</p>
                <p className="checkout-item-qty">Qty: {item.quantity}</p>
              </div>
              <span>NPR {(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="checkout-totals">
            <div className="summary-row"><span>Subtotal</span><span>NPR {subtotal.toLocaleString()}</span></div>
            <div className="summary-row"><span>Shipping</span><span>NPR {SHIPPING}</span></div>
            <div className="summary-row total"><span>Total Amount</span><span>NPR {total.toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
