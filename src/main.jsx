import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </BrowserRouter>
);

