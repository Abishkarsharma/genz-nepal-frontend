import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import PaymentSuccess from './pages/PaymentSuccess';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import ShippingPolicy from './pages/ShippingPolicy';
import TermsOfService from './pages/TermsOfService';
import SearchResults from './pages/SearchResults';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Authenticated */}
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

          {/* Seller (and admin) */}
          <Route path="/seller" element={<ProtectedRoute role="seller"><SellerDashboard /></ProtectedRoute>} />

          {/* Public info pages */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/search" element={<SearchResults />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
