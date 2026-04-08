import { Link } from 'react-router-dom';
import './PolicyPage.css';

export default function ShippingPolicy() {
  return (
    <div className="policy-page">
      <div className="policy-hero">
        <div className="container">
          <p className="policy-tag">Policies</p>
          <h1>Shipping Policy</h1>
          <p>Everything you need to know about how we deliver to your door.</p>
        </div>
      </div>

      <div className="container policy-content">

        <div className="policy-card">
          <h2>📦 Processing Time</h2>
          <p>All orders are processed within <strong>1–2 business days</strong> after payment confirmation. Orders placed on weekends or public holidays are processed the next business day.</p>
        </div>

        <div className="policy-card">
          <h2>🚚 Delivery Timeframes</h2>
          <table className="policy-table">
            <thead><tr><th>Location</th><th>Estimated Time</th><th>Shipping Fee</th></tr></thead>
            <tbody>
              <tr><td>Kathmandu Valley</td><td>1–2 business days</td><td>NPR 100</td></tr>
              <tr><td>Major Cities (Pokhara, Biratnagar, etc.)</td><td>2–4 business days</td><td>NPR 200</td></tr>
              <tr><td>Remote Areas</td><td>4–7 business days</td><td>NPR 300–500</td></tr>
            </tbody>
          </table>
          <p style={{ marginTop: '1rem' }}>Free shipping on orders above <strong>NPR 5,000</strong>.</p>
        </div>

        <div className="policy-card">
          <h2>🔍 Order Tracking</h2>
          <p>Once your order is shipped, you can track it from your <Link to="/orders">My Orders</Link> page. You'll see real-time status updates from processing to delivery.</p>
        </div>

        <div className="policy-card">
          <h2>📬 Delivery Partners</h2>
          <p>We work with trusted local courier services including Pathao, Daraz Logistics, and Nepal Post to ensure safe and timely delivery across Nepal.</p>
        </div>

        <div className="policy-card">
          <h2>⚠️ Failed Deliveries</h2>
          <p>If a delivery attempt fails due to an incorrect address or unavailability, our courier will try again the next business day. After 2 failed attempts, the order will be returned to us and you'll be contacted for re-delivery arrangements.</p>
        </div>

        <div className="policy-card">
          <h2>❓ Questions?</h2>
          <p>If you have any questions about your shipment, <Link to="/contact">contact our support team</Link> and we'll help you out within 24 hours.</p>
        </div>

      </div>
    </div>
  );
}
