import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveCart = (items) => {
    setCart(items);
    localStorage.setItem('cart', JSON.stringify(items));
  };

  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      const maxStock = product.stock ?? 9999;
      let updated;
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, maxStock);
        updated = prev.map((i) =>
          i._id === product._id ? { ...i, quantity: newQty } : i
        );
      } else {
        updated = [...prev, { ...product, quantity: Math.min(qty, maxStock) }];
      }
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = (id) => {
    const updated = cart.filter((i) => i._id !== id);
    saveCart(updated);
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    const item = cart.find((i) => i._id === id);
    const maxStock = item?.stock ?? 9999;
    const capped = Math.min(qty, maxStock);
    const updated = cart.map((i) => (i._id === id ? { ...i, quantity: capped } : i));
    saveCart(updated);
  };

  const clearCart = () => saveCart([]);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, cartCount, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
