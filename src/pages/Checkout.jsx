import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { SHIPPING, getShipping } from '../constants';
import './Checkout.css';

const NEPAL_CITIES = [
  'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Biratnagar',
  'Birgunj', 'Butwal', 'Dharan', 'Hetauda', 'Itahari',
  'Janakpur', 'Nepalgunj', 'Bharatpur', 'Dhangadhi', 'Tulsipur',
];

const PAYMENT_METHODS = [
  { id: 'Cash on Delivery', label: 'Cash on Delivery', desc: 'Pay in cash when your order arrives.', icon: 'ðŸ’µ' },
  { id: 'eSewa', label: 'eSewa', desc: 'Pay via eSewa digital wallet.', icon: 'ðŸ’š' },
  { id: 'Khalti', label: 'Khalti', desc: 'Pay via Khalti digital wallet.', icon: 'ðŸ’œ' },
  { id: 'Bank Transfer', label: 'Bank Transfer', desc: 'Direct bank transfer.', icon: 'ðŸ¦' },
];

// Load Khalti SDK dynamically
function loadKhaltiScript() {
  return new Promise((resolve) => {
    if (window.KhaltiCheckout) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://khalti.s3.ap-south-1.amazonaws.com/KPG/dist/2020.12.17.0.0.0/khalti-checkout.iffe.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export default function Checkout() {
  const { cart, subtotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=address, 2=payment, 3=review
  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: '',
    email: user?.email || '',
    province: '',
    city: '',
    district: '',
    area: '',
    street: '',
    landmark: '',
    postalCode: '',
  });
  const [payment, setPayment] = useState('Cash on Delivery');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const shipping = getShipping(form.city);
  const total = subtotal + shipping;

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const validateAddress = () => {
    if (!form.fullName.trim()) return 'Full name is required';
    if (!form.phone.trim()) return 'Phone number is required';
    if (!/^(\+977)?[0-9]{9,10}$/.test(form.phone.replace(/\s/g, ''))) return 'Enter a valid Nepal phone number';
    if (!form.city) return 'City is required';
    if (!form.street.trim()) return 'Street address is required';
    return null;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      const err = validateAddress();
      if (err) { setError(err); return; }
      setError('');
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const placeOrder = async (paymentStatus = 'pending', paymentRef = '') => {
    setLoading(true);
    setError('');
    try {
      const items = cart.map((i) => ({
        product: i._id, name: i.name, price: i.price, quantity: i.quantity, image: i.image,
      }));
      const { data: order } = await api.post('/api/orders', {
        items, shippingAddress: form, paymentMethod: payment,
        paymentStatus, paymentRef, subtotal, shipping: shipping,
      }, { headers: { Authorization: `Bearer ${token}` } });

      clearCart();
      navigate('/payment-success', {
        state: { orderId: order._id, ref: paymentRef || 'COD', method: payment, address: form },
      });
      return order;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // eSewa â€” backend generates proper HMAC signature
  const handleEsewa = async () => {
    setLoading(true);
    setError('');
    try {
      const items = cart.map((i) => ({
        product: i._id, name: i.name, price: i.price, quantity: i.quantity, image: i.image,
      }));

      // Backend creates order + generates signed form data
      const { data } = await api.post('/api/esewa/initiate', {
        items, shippingAddress: form, subtotal, shipping: shipping,
      }, { headers: { Authorization: `Bearer ${token}` } });

      // Submit form to eSewa
      const form_el = document.createElement('form');
      form_el.method = 'POST';
      form_el.action = data.esewaUrl;

      Object.entries(data.formData).forEach(([key, val]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = val;
        form_el.appendChild(input);
      });

      clearCart();
      document.body.appendChild(form_el);
      form_el.submit();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate eSewa payment');
      setLoading(false);
    }
  };

  // Khalti â€” JS widget
  const handleKhalti = async () => {
    const loaded = await loadKhaltiScript();
    if (!loaded) { setError('Failed to load Khalti. Please try again.'); return; }

    // Create pending order first
    setLoading(true);
    setError('');
    try {
      const items = cart.map((i) => ({
        product: i._id, name: i.name, price: i.price, quantity: i.quantity, image: i.image,
      }));
      const { data: order } = await api.post('/api/orders', {
        items, shippingAddress: form, paymentMethod: 'Khalti',
        paymentStatus: 'pending', paymentRef: '', subtotal, shipping: shipping,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setLoading(false);

      const publicKey = import.meta.env.VITE_KHALTI_PUBLIC_KEY || 'test_public_key_dc74e0fd57cb46cd93832aee0a390234';

      const checkout = new window.KhaltiCheckout({
        publicKey,
        productIdentity: order._id,
        productName: `Gen.Z Nepal Order #${String(order._id).slice(-8).toUpperCase()}`,
        productUrl: `${window.location.origin}/orders`,
        paymentPreference: ['KHALTI', 'EBANKING', 'MOBILE_BANKING', 'CONNECT_IPS', 'SCT'],
        eventHandler: {
          onSuccess: async (payload) => {
            // Verify on backend
            try {
              await api.post('/api/orders/verify-khalti', {
                token: payload.token,
                amount: payload.amount,
                orderId: order._id,
              }, { headers: { Authorization: `Bearer ${token}` } });

              clearCart();
              navigate('/payment-success', {
                state: { orderId: order._id, ref: payload.idx || payload.token, method: 'Khalti', address: form },
              });
            } catch {
              setError('Payment verified but order update failed. Contact support.');
            }
          },
          onError: (err) => {
            console.error('Khalti error:', err);
            setError('Khalti payment failed. Please try again.');
          },
          onClose: () => {},
        },
      });

      checkout.show({ amount: total * 100 }); // Khalti uses paisa
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate Khalti payment');
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (payment === 'eSewa') return handleEsewa();
    if (payment === 'Khalti') return handleKhalti();
    // COD and Bank Transfer
    await placeOrder('pending', '');
  };

  const STEPS = ['Delivery Address', 'Payment', 'Review & Place'];
  const stepPct = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="checkout-wrap">
    <div className="checkout-container">
        {/* Progress */}
        <div className="checkout-progress">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${stepPct}%` }} />
          </div>
          <div className="progress-steps">
            {STEPS.map((s, i) => (
              <div key={s} className={`progress-step ${i + 1 <= step ? 'done' : ''} ${i + 1 === step ? 'current' : ''}`}>
                <div className="progress-dot">{i + 1 < step ? 'âœ“' : i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="checkout-body">
          {/* Left: form */}
          <div className="checkout-left">
            {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

            {/* Step 1: Address */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="checkout-section">
                <h2 className="section-title">Delivery Address</h2>

                <div className="field-row">
                  <div className="form-group">
                    <label>Full Name <span className="req">*</span></label>
                    <input
                      placeholder="e.g. Aryan Sharma"
                      value={form.fullName}
                      onChange={set('fullName')}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number <span className="req">*</span></label>
                    <input
                      placeholder="+977 98XXXXXXXX"
                      value={form.phone}
                      onChange={set('phone')}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="you@gmail.com"
                    value={form.email}
                    onChange={set('email')}
                  />
                </div>

                <div className="field-row">
                  <div className="form-group">
                    <label>Province</label>
                    <select value={form.province} onChange={set('province')}>
                      <option value="">Select Province</option>
                      {['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'].map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>City / Municipality <span className="req">*</span></label>
                    <select value={form.city} onChange={set('city')} required>
                      <option value="">Select City</option>
                      {NEPAL_CITIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="field-row">
                  <div className="form-group">
                    <label>District</label>
                    <input placeholder="e.g. Kathmandu" value={form.district} onChange={set('district')} />
                  </div>
                  <div className="form-group">
                    <label>Area / Tole</label>
                    <input placeholder="e.g. Thamel, Baneshwor" value={form.area} onChange={set('area')} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Street Address <span className="req">*</span></label>
                  <input
                    placeholder="House No., Street Name"
                    value={form.street}
                    onChange={set('street')}
                    required
                  />
                </div>

                <div className="field-row">
                  <div className="form-group">
                    <label>Landmark</label>
                    <input placeholder="Near school, temple, etc." value={form.landmark} onChange={set('landmark')} />
                  </div>
                  <div className="form-group">
                    <label>Postal Code</label>
                    <input placeholder="e.g. 44600" value={form.postalCode} onChange={set('postalCode')} />
                  </div>
                </div>

                <button type="submit" className="checkout-next-btn">
                  Continue to Payment â†’
                </button>
              </form>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <form onSubmit={handleNextStep} className="checkout-section">
                <h2 className="section-title">Payment Method</h2>
                <div className="payment-grid">
                  {PAYMENT_METHODS.map((m) => (
                    <label key={m.id} className={`payment-card ${payment === m.id ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value={m.id}
                        checked={payment === m.id}
                        onChange={() => setPayment(m.id)}
                      />
                      <span className="payment-icon">{m.icon}</span>
                      <div>
                        <p className="payment-name">{m.label}</p>
                        <p className="payment-desc">{m.desc}</p>
                      </div>
                      {payment === m.id && <span className="payment-check">âœ“</span>}
                    </label>
                  ))}
                </div>
                <div className="step-nav">
                  <button type="button" className="checkout-back-btn" onClick={() => setStep(1)}>â† Back</button>
                  <button type="submit" className="checkout-next-btn">Review Order â†’</button>
                </div>
              </form>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="checkout-section">
                <h2 className="section-title">Review Your Order</h2>

                {/* Address summary */}
                <div className="review-block">
                  <div className="review-block-header">
                    <span>Delivery Address</span>
                    <button className="edit-link" onClick={() => setStep(1)}>Edit</button>
                  </div>
                  <p className="review-name">{form.fullName}</p>
                  <p className="review-detail">{form.phone}{form.email ? ` Â· ${form.email}` : ''}</p>
                  <p className="review-detail">
                    {[form.street, form.area, form.landmark].filter(Boolean).join(', ')}
                  </p>
                  <p className="review-detail">
                    {[form.city, form.district, form.province].filter(Boolean).join(', ')}
                    {form.postalCode ? ` â€” ${form.postalCode}` : ''}
                  </p>
                </div>

                {/* Payment summary */}
                <div className="review-block">
                  <div className="review-block-header">
                    <span>Payment Method</span>
                    <button className="edit-link" onClick={() => setStep(2)}>Edit</button>
                  </div>
                  <p className="review-name">
                    {PAYMENT_METHODS.find((m) => m.id === payment)?.icon} {payment}
                  </p>
                </div>

                {/* Items */}
                <div className="review-block">
                  <div className="review-block-header"><span>Items ({cart.length})</span></div>
                  {cart.map((item) => (
                    <div key={item._id} className="review-item">
                      <img src={item.image} alt={item.name} className="review-item-img" />
                      <div className="review-item-info">
                        <p className="review-item-name">{item.name}</p>
                        <p className="review-item-meta">Qty: {item.quantity}</p>
                      </div>
                      <span className="review-item-price">NPR {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="step-nav">
                  <button type="button" className="checkout-back-btn" onClick={() => setStep(2)}>â† Back</button>
                  <button
                    className="checkout-place-btn"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                  >
                    {loading ? 'Placing Order...' : payment === 'Cash on Delivery' ? 'Place Order' : `Pay with ${payment}`}
                  </button>
                </div>
                <p className="terms-note">By placing your order you agree to our Terms of Service.</p>
              </div>
            )}
          </div>

          {/* Right: Order summary */}
          <div className="checkout-summary">
            <h3 className="summary-heading">Order Summary</h3>
            <div className="summary-items">
              {cart.map((item) => (
                <div key={item._id} className="summary-item">
                  <div className="summary-item-img-wrap">
                    <img src={item.image} alt={item.name} />
                    <span className="summary-item-qty">{item.quantity}</span>
                  </div>
                  <div className="summary-item-info">
                    <p>{item.name}</p>
                  </div>
                  <span className="summary-item-price">NPR {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>NPR {subtotal.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping {form.city ? `(${form.city})` : ''}</span>
                <span>NPR {shipping.toLocaleString()}</span>
              </div>
              <div className="summary-total-row">
                <span>Total</span>
                <span>NPR {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

