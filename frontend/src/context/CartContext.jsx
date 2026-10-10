import { createContext, useContext, useState, useCallback, useMemo } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // { restaurantId, restaurantName, items: { [menuItemId]: { ...item, quantity } } }
  const [cart, setCart] = useState(null);

  const addItem = useCallback((restaurant, item) => {
    setCart((prev) => {
      if (prev && prev.restaurantId !== restaurant.id) {
        const replace = window.confirm(
          `Your cart has items from ${prev.restaurantName}. Starting a new order from ${restaurant.name} will clear it. Continue?`
        );
        if (!replace) return prev;
        prev = null;
      }
      const base = prev || { restaurantId: restaurant.id, restaurantName: restaurant.name, items: {} };
      const existing = base.items[item.id];
      return {
        ...base,
        items: {
          ...base.items,
          [item.id]: existing
            ? { ...existing, quantity: existing.quantity + 1 }
            : { ...item, quantity: 1 },
        },
      };
    });
  }, []);

  const removeItem = useCallback((itemId) => {
    setCart((prev) => {
      if (!prev) return prev;
      const items = { ...prev.items };
      if (items[itemId].quantity <= 1) {
        delete items[itemId];
      } else {
        items[itemId] = { ...items[itemId], quantity: items[itemId].quantity - 1 };
      }
      const hasItems = Object.keys(items).length > 0;
      return hasItems ? { ...prev, items } : null;
    });
  }, []);

  const clearCart = useCallback(() => setCart(null), []);

  const subtotalCents = useMemo(() => {
    if (!cart) return 0;
    return Object.values(cart.items).reduce((sum, i) => sum + i.price_cents * i.quantity, 0);
  }, [cart]);

  const itemCount = useMemo(() => {
    if (!cart) return 0;
    return Object.values(cart.items).reduce((sum, i) => sum + i.quantity, 0);
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, clearCart, subtotalCents, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
