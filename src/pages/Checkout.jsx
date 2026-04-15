import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getShipping } from '../constants';
import './Checkout.css';

const NEPAL_CITIES = [
  'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Biratnagar',
  'Birgunj', 'Butwal', 'Dharan', 'Hetauda', 'Itahari',
  'Janakpur', 'Nepalgunj', 'Bharatpur', 'Dhangadhi', 'Tulsipur',
];

// Real brand logos using official CDN / reliable image sources
const PaymentIcons = {
  'Cash on Delivery': (
    <svg viewBox="0 0 56 56" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="13" width="50" height="30" rx="5" fill="#0ea5e9"/>
      <rect x="3" y="20" width="50" height="8" fill="#0284c7"/>
      <rect x="8" y="33" width="12" height="4" rx="2" fill="white" opacity="0.85"/>
      <circle cx="43" cy="35" r="5" fill="#fbbf24"/>
      <circle cx="38" cy="35" r="5" fill="#f59e0b"/>
      <text x="40.5" y="37.5" textAnchor="middle" fontSize="5.5" fontWeight="900" fontFamily="Arial,sans-serif" fill="white">$</text>
    </svg>
  ),
  'eSewa': (
    <img
      src="https://cdn.esewa.com.np/ui/images/esewa_og.png"
      alt="eSewa"
      className="payment-logo-img"
      onError={(e) => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'block';
      }}
    />
  ),
  'Khalti': (
    <img
      src="https://khalti.com/static/khalti-logo.png"
      alt="Khalti"
      className="payment-logo-img"
      onError={(e) => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'block';
      }}
    />
  ),
  'Bank Transfer': (
    <svg viewBox="0 0 56 56" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="52" height="52" rx="10" fill="#1e40af"/>
      <polygon points="28,8 48,20 8,20" fill="white" opacity="0.95"/>
      <rect x="10" y="23" width="6" height="16" rx="1.5" fill="white" opacity="0.9"/>
      <rect x="20" y="23" width="6" height="16" rx="1.5" fill="white" opacity="0.9"/>
      <rect x="30" y="23" width="6" height="16" rx="1.5" fill="white" opacity="0.9"/>
      <rect x="40" y="23" width="6" height="16" rx="1.5" fill="white" opacity="0.9"/>
      <rect x="8" y="40" width="40" height="4" rx="2" fill="white" opacity="0.9"/>
    </svg>
  ),
};

// Fallback SVG icons shown if real logo images fail to load
const PaymentIconFallbacks = {
  'eSewa': (
    <svg viewBox="0 0 56 56" width="48" height="48" xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
      <circle cx="28" cy="28" r="26" fill="#60BB46"/>
      <text x="28" y="24" textAnchor="middle" fontSize="9" fontWeight="900" fontFamily="Arial,sans-serif" fill="white">eSewa</text>
      <text x="28" y="36" textAnchor="middle" fontSize="7" fontFamily="Arial,sans-serif" fill="white" opacity="0.9">Mobile Wallet</text>
    </svg>
  ),
  'Khalti': (
    <svg viewBox="0 0 56 56" width="48" height="48" xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
      <rect x="2" y="2" width="52" height="52" rx="10" fill="#5C2D91"/>
      <text x="28" y="26" textAnchor="middle" fontSize="10" fontWeight="900" fontFamily="Arial,sans-serif" fill="white">khalti</text>
      <text x="28" y="38" textAnchor="middle" fontSize="6.5" fontFamily="Arial,sans-serif" fill="white" opacity="0.85">by IME Pay</text>
    </svg>
  ),
};

const PAYMENT_METHODS = [
  { id: 'Cash on Delivery', label: 'Cash on Delivery', desc: 'Cash on Delivery' },
  { id: 'eSewa',            label: 'eSewa',            desc: 'eSewa Mobile Wallet' },
  { id: 'Khalti',           label: 'Khalti by IME',    desc: 'Mobile Wallet' },
  { id: 'Bank Transfer',    label: 'Bank Transfer',    desc: 'Direct Bank Transfer' },
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
  const [sellerPayments, setSellerPayments] = useState({}); // { sellerId: { name, paymentAccounts } }
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
      // Fetch seller payment accounts when moving to payment step
      fetchSellerPayments();
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  // Fetch payment accounts for all unique sellers in cart
  const fetchSellerPayments = async () => {
    try {
      const productIds = cart.map((i) => i._id).filter(Boolean);
      if (!productIds.length) return;
      // Get seller IDs from products
      const { data: products } = await api.get(`/api/products?ids=${productIds.join(',')}&limit=100`);
      const productList = Array.isArray(products) ? products : products.products || [];
      const sellerIds = [...new Set(productList.map((p) => p.createdBy).filter(Boolean))];
      const results = {};
      await Promise.all(sellerIds.map(async (sid) => {
        try {
          const { data } = await api.get(`/api/users/seller/${sid}/payment`);
          results[sid] = data;
        } catch { /* seller may not have payment accounts set */ }
      }));
      setSellerPayments(results);
    } catch { /* non-critical */ }
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
        paymentStatus, paymentRef, subtotal, shipping,
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

  // eSewa – backend generates proper HMAC signature
  const handleEsewa = async () => {
    setLoading(true);
    setError('');
    try {
      const items = cart.map((i) => ({
        product: i._id, name: i.name, price: i.price, quantity: i.quantity, image: i.image,
      }));

      const { data } = await api.post('/api/esewa/initiate', {
        items, shippingAddress: form, subtotal, shipping,
      }, { headers: { Authorization: `Bearer ${token}` } });

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

  // Khalti – JS widget
  const handleKhalti = async () => {
    const loaded = await loadKhaltiScript();
    if (!loaded) { setError('Failed to load Khalti. Please try again.'); return; }

    setLoading(true);
    setError('');
    try {
      const items = cart.map((i) => ({
        product: i._id, name: i.name, price: i.price, quantity: i.quantity, image: i.image,
      }));
      const { data: order } = await api.post('/api/orders', {
        items, shippingAddress: form, paymentMethod: 'Khalti',
        paymentStatus: 'pending', paymentRef: '', subtotal, shipping,
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
                <div className="progress-dot">{i + 1 < step ? '✓' : i + 1}</div>
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
                  Continue to Payment &rarr;
                </button>
              </form>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <form onSubmit={handleNextStep} className="checkout-section">
                <h2 className="section-title">Select Payment Method</h2>
                <div className="payment-grid">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`payment-card ${payment === m.id ? 'selected' : ''}`}
                      onClick={() => setPayment(m.id)}
                      aria-pressed={payment === m.id}
                    >
                      <div className="payment-icon-wrap">
                        {PaymentIcons[m.id]}
                        {PaymentIconFallbacks[m.id] || null}
                      </div>
                      <p className="payment-name">{m.label}</p>
                      <p className="payment-desc">{m.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Seller payment details — shown for digital payments */}
                {payment !== 'Cash on Delivery' && Object.keys(sellerPayments).length > 0 && (
                  <div className="seller-payment-info">
                    <p className="seller-payment-title">Send payment directly to seller:</p>
                    {Object.values(sellerPayments).map((sp, i) => {
                      const acc = sp.paymentAccounts || {};
                      const info = payment === 'eSewa' ? acc.esewa
                        : payment === 'Khalti' ? acc.khalti
                        : payment === 'Bank Transfer' ? (acc.bankName ? `${acc.bankName} · ${acc.accountName} · ${acc.accountNumber}` : '') : '';
                      if (!info) return null;
                      return (
                        <div key={i} className="seller-payment-card">
                          <span className="seller-payment-seller">🏪 {sp.name}</span>
                          <span className="seller-payment-detail">{info}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="step-nav">
                  <button type="button" className="checkout-back-btn" onClick={() => setStep(1)}>&larr; Back</button>
                  <button type="submit" className="checkout-next-btn">Review Order &rarr;</button>
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
                  <p className="review-detail">{form.phone}{form.email ? ` · ${form.email}` : ''}</p>
                  <p className="review-detail">
                    {[form.street, form.area, form.landmark].filter(Boolean).join(', ')}
                  </p>
                  <p className="review-detail">
                    {[form.city, form.district, form.province].filter(Boolean).join(', ')}
                    {form.postalCode ? ` – ${form.postalCode}` : ''}
                  </p>
                </div>

                {/* Payment summary */}
                <div className="review-block">
                  <div className="review-block-header">
                    <span>Payment Method</span>
                    <button className="edit-link" onClick={() => setStep(2)}>Edit</button>
                  </div>
                  <p className="review-name" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ display: 'inline-flex' }}>{PaymentIcons[payment]}</span>
                    {PAYMENT_METHODS.find((m) => m.id === payment)?.label}
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
                  <button type="button" className="checkout-back-btn" onClick={() => setStep(2)}>&larr; Back</button>
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
