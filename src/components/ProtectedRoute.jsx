import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Redirects to /login if not authenticated, or / if role doesn't match
export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (role === 'admin' && user.role !== 'admin') return <Navigate to="/" replace />;
  if (role === 'seller' && user.role !== 'seller' && user.role !== 'admin')
    return <Navigate to="/" replace />;

  return children;
}
