import { Link } from 'react-router-dom';
import './PolicyPage.css';

export default function TermsOfService() {
  return (
    <div className="policy-page">
      <div className="policy-hero">
        <div className="container">
          <p className="policy-tag">Legal</p>
          <h1>Terms of Service</h1>
          <p>Please read these terms carefully before using The Gen.Z Nepal.</p>
        </div>
      </div>

      <div className="container policy-content">

        <div className="policy-card">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using The Gen.Z Nepal website, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>
        </div>

        <div className="policy-card">
          <h2>2. Use of the Platform</h2>
          <p>You agree to use this platform only for lawful purposes. You must not:</p>
          <ul>
            <li>Post false, misleading, or fraudulent content</li>
            <li>Attempt to gain unauthorized access to any part of the platform</li>
            <li>Use the platform to harass, abuse, or harm others</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>
        </div>

        <div className="policy-card">
          <h2>3. Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. We reserve the right to terminate accounts that violate these terms.</p>
        </div>

        <div className="policy-card">
          <h2>4. Seller Responsibilities</h2>
          <p>Sellers on The Gen.Z Nepal are responsible for the accuracy of their product listings, timely fulfillment of orders, and compliance with all applicable laws. We reserve the right to remove listings or suspend sellers who violate our policies.</p>
        </div>

        <div className="policy-card">
          <h2>5. Payments & Refunds</h2>
          <p>All prices are listed in Nepali Rupees (NPR) and include applicable VAT. Refund requests must be made within 7 days of delivery. Please see our <Link to="/shipping-policy">Shipping Policy</Link> for more details on returns.</p>
        </div>

        <div className="policy-card">
          <h2>6. Intellectual Property</h2>
          <p>All content on this platform — including logos, designs, and text — is the property of The Gen.Z Nepal. You may not reproduce or distribute any content without written permission.</p>
        </div>

        <div className="policy-card">
          <h2>7. Limitation of Liability</h2>
          <p>The Gen.Z Nepal is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount paid for the specific transaction in question.</p>
        </div>

        <div className="policy-card">
          <h2>8. Changes to Terms</h2>
          <p>We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the new terms. Last updated: April 2025.</p>
        </div>

        <div className="policy-card">
          <h2>9. Contact</h2>
          <p>For any questions about these terms, please <Link to="/contact">contact us</Link>.</p>
        </div>

      </div>
    </div>
  );
}
