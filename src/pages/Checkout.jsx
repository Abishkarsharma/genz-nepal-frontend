import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import { SHIPPING } from '../constants';
import './Checkout.css';

const NEPAL_CITIES = [
  'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Biratnagar',
  'Birgunj', 'Butwal', 'Dharan', 'Hetauda', 'Itahari',
  'Janakpur', 'Nepalgunj', 'Bharatpur', 'Dhangadhi', 'Tulsipur',
];

const PAYMENT_METHODS = [
  {
    id: 'Cash on Delivery',
    label: 'Cash on Delivery',
    desc: 'Pay in cash when your order arrives at your door.',
    icon: '💵',
  },
  {
    id: 'eSewa',
    label: 'eSewa',
    desc: 'Pay securely via eSewa digital wallet.',
    icon: '💚',
  },
  {
    id: 'Khalti',
    label: 'Khalti',
    desc: 'Pay securely via Khalti digital wallet.',
    icon: '💜',
  },
  {
    id: 'Bank Transfer',
    label: 'Bank Transfer',
    desc: 'Direct transfer to our bank account.',
    icon: '🏦',
  },
];

const SIMULATED = ['eSewa', 'Khalti', 'Bank Transfer'];

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
  const [showModal, setShowModal] = useState(false);

  const total = subtotal + SHIPPING;

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

  const placeOrder = async (paymentStatus, paymentRef) => {
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
      const { data: order } = await api.post(
        '/api/orders',
        {
          items,
          shippingAddress: form,
          paymentMethod: payment,
          paymentStatus,
          paymentRef: paymentRef || '',
          subtotal,
          shipping: SHIPPING,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      clearCart();
      navigate('/payment-success', {
        state: { orderId: order._id, ref: paymentRef || 'COD', method: payment, address: form },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (SIMULATED.includes(payment)) {
      setShowModal(true);
    } else {
      await placeOrder('pending', '');
    }
  };

  const STEPS = ['Delivery Address', 'Payment', 'Review & Place'];
  const stepPct = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="checkout-wrap">
      {showModal && (
        <PaymentModal
          method={payment}
          amount={total}
          onConfirm={async (ref) => { setShowModal(false); await placeOrder('paid', ref); }}
          onClose={() => setShowModal(false)}
        />
      )}

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
                  Continue to Payment →
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
                      {payment === m.id && <span className="payment-check">✓</span>}
                    </label>
                  ))}
                </div>
                <div className="step-nav">
                  <button type="button" className="checkout-back-btn" onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="checkout-next-btn">Review Order →</button>
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
                    {form.postalCode ? ` — ${form.postalCode}` : ''}
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
                  <button type="button" className="checkout-back-btn" onClick={() => setStep(2)}>← Back</button>
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
                <span>Shipping</span>
                <span>NPR {SHIPPING.toLocaleString()}</span>
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
