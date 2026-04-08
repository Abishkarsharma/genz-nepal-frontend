import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <h3>The Gen.Z Nepal</h3>
          <p>Curating the finest of Kathmandu for the world. Crafted in Kathmandu.</p>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="footer-col">
          <h4>Policies</h4>
          <Link to="/shipping-policy">Shipping Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
        <div className="footer-col">
          <h4>Newsletter</h4>
          <div className="newsletter">
            <input type="email" placeholder="Email" />
            <button className="btn btn-primary btn-sm">→</button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 The Gen.Z Nepal. Crafted in Kathmandu.</p>
      </div>
    </footer>
  );
}
