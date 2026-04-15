import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';
import api from '../api';
import './Navbar.css';

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, logout, isAdmin, isSeller, token } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const notifRef = useRef(null);

  const loadNotifications = useCallback(() => {
    if (!token) return;
    api.get('/api/notifications', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        setNotifications(data);
        setUnread(data.filter((n) => !n.read).length);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, loadNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleNotif = () => {
    setNotifOpen((prev) => !prev);
    if (!notifOpen && unread > 0) {
      // Mark all as read when opening
      api.patch('/api/notifications/read-all', {}, { headers: { Authorization: `Bearer ${token}` } })
        .then(() => {
          setUnread(0);
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        })
        .catch(() => {});
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const notifIcon = (type) => {
    if (type === 'new_order') return '🛒';
    if (type === 'order_status') return '📦';
    if (type === 'message') return '💬';
    return '🔔';
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
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
            {/* Gen.Z Nepal Original Logo Mark */}
            <svg className="brand-logo-svg" viewBox="0 0 48 48" width="42" height="42" xmlns="http://www.w3.org/2000/svg" aria-label="Gen.Z Nepal">
              <defs>
                <linearGradient id="gz-grad-main" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor="#0ea5e9"/>
                  <stop offset="50%"  stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#ec4899"/>
                </linearGradient>
                <linearGradient id="gz-grad-accent" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#10b981"/>
                  <stop offset="100%" stopColor="#0ea5e9"/>
                </linearGradient>
              </defs>
              <rect x="1" y="1" width="46" height="46" rx="12" ry="12" fill="url(#gz-grad-main)"/>
              <path
                d="M24 10 C16.3 10 10 16.3 10 24 C10 31.7 16.3 38 24 38
                   C28.2 38 31.9 36.2 34.5 33.3 L34.5 23 L23.5 23 L23.5 27
                   L30 27 L30 31.2 C28.4 32.3 26.3 33 24 33
                   C19 33 15 29 15 24 C15 19 19 15 24 15
                   C26.6 15 28.9 16.1 30.5 17.9 L34.1 14.3
                   C31.5 11.6 27.9 10 24 10 Z"
                fill="white"
              />
              <rect x="29" y="29" width="14" height="14" rx="4" ry="4" fill="url(#gz-grad-accent)"/>
              <text x="36" y="40" textAnchor="middle" fontSize="9" fontWeight="900" fontFamily="Arial,sans-serif" fill="white" letterSpacing="-0.5">Z</text>
            </svg>
            <div className="brand-text-wrap">
              <span className="brand-text-main">Gen.Z</span>
              <span className="brand-text-sub">Nepal</span>
            </div>
          </Link>

          <SearchBar />

          {/* Notification Bell — shown for all logged-in users */}
          {user && (
            <div className="notif-wrap" ref={notifRef}>
              <button
                className="notif-bell-btn"
                onClick={toggleNotif}
                aria-label="Notifications"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {unread > 0 && (
                  <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>
                )}
              </button>

              {/* Dropdown panel */}
              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-dropdown-header">
                    <span>Notifications</span>
                    {notifications.length > 0 && (
                      <span className="notif-count">{notifications.length}</span>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="notif-empty">
                      <span>🔔</span>
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    <div className="notif-list">
                      {notifications.slice(0, 15).map((n) => (
                        <div
                          key={n._id}
                          className={`notif-item-row ${!n.read ? 'unread' : ''}`}
                          onClick={() => {
                            setNotifOpen(false);
                            if (n.type === 'new_order' && (isSeller || isAdmin)) navigate('/seller');
                            else if (n.type === 'new_order') navigate('/orders');
                          }}
                        >
                          <div className="notif-item-icon">{notifIcon(n.type)}</div>
                          <div className="notif-item-body">
                            <p className="notif-item-title">{n.title}</p>
                            <p className="notif-item-text">{n.body}</p>
                            <p className="notif-item-time">{timeAgo(n.createdAt)}</p>
                          </div>
                          {!n.read && <span className="notif-unread-dot" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
          <div className="mobile-search-row">
            <SearchBar />
          </div>
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
