import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';
import './Navbar.css';

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, logout, isAdmin, isSeller } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className="site-header">
      {/* Top utility bar */}
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-left">
            <Link to="/about">About Us</Link>
            <Link to="/contact">Help &amp; Support</Link>
            <Link to="/shipping-policy">Shipping Policy</Link>
          </div>
          <div className="topbar-right">
            {user ? (
              <>
                <span className="topbar-user">Hi, {user.name.split(' ')[0]}</span>
                {isAdmin && <Link to="/admin" className="topbar-role">Admin Panel</Link>}
                {isSeller && !isAdmin && <Link to="/seller" className="topbar-role">Seller Panel</Link>}
                <Link to="/orders">My Orders</Link>
                <Link to="/profile">Profile</Link>
                <button className="topbar-logout" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/signup">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="navbar-brand">
            <svg className="brand-logo-svg" viewBox="0 0 100 100" width="38" height="38" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316"/>
                  <stop offset="40%" stopColor="#ec4899"/>
                  <stop offset="70%" stopColor="#8b5cf6"/>
                  <stop offset="100%" stopColor="#3b82f6"/>
                </linearGradient>
                <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4"/>
                  <stop offset="50%" stopColor="#10b981"/>
                  <stop offset="100%" stopColor="#84cc16"/>
                </linearGradient>
              </defs>
              {/* Outer G shape - top-left arc */}
              <path d="M50 8 C28 8 12 24 12 46 C12 68 28 84 50 84 C62 84 72 79 79 71 L79 52 L54 52 L54 62 L68 62 L68 68 C63 72 57 74 50 74 C34 74 22 62 22 46 C22 30 34 18 50 18 C58 18 65 21 70 27 L78 20 C71 13 61 8 50 8 Z" fill="url(#g1)"/>
              {/* Inner G notch fill */}
              <path d="M54 52 L79 52 L79 71 C75 76 70 80 64 82 L64 72 C67 70 70 67 71 64 L54 64 Z" fill="url(#g2)"/>
            </svg>
            <div className="brand-text-wrap">
              <span className="brand-text-main">Gen.Z</span>
              <span className="brand-text-sub">Nepal</span>
            </div>
          </Link>

          <SearchBar />

          <Link to="/cart" className="cart-btn" aria-label="Cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          {user ? (
            <>
              <Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
              {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
              {isSeller && !isAdmin && <Link to="/seller" onClick={() => setMenuOpen(false)}>Seller Panel</Link>}
              <button className="mobile-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
          <Link to="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>Help &amp; Support</Link>
        </div>
      )}
    </header>
  );
}
