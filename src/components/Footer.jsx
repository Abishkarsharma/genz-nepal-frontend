import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="footer-logo-icon">G</span>
            <span>Gen.Z Nepal</span>
          </div>
          <p>Curating the finest of Kathmandu for the world.</p>
          <div className="footer-socials">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/?category=Electronics">Electronics</Link>
          <Link to="/?category=Accessories">Accessories</Link>
          <Link to="/?category=Home">Home &amp; Living</Link>
          <Link to="/?category=Wellness">Wellness</Link>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/shipping-policy">Shipping Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>

        <div className="footer-col">
          <h4>Sell on Gen.Z</h4>
          <Link to="/signup">Become a Seller</Link>
          <Link to="/seller">Seller Dashboard</Link>
          <Link to="/contact">Seller Support</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} Gen.Z Nepal. Crafted in Kathmandu.</p>
          <div className="footer-payment-icons">
            <span className="payment-badge">eSewa</span>
            <span className="payment-badge">Khalti</span>
            <span className="payment-badge">Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
