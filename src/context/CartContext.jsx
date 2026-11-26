import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { orderService } from '../services/orderService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

const EMPTY_SUMMARY = {
  totalItems: 0,
  subtotal: 0,
  originalSubtotal: 0,
  discountSavings: 0,
  deliveryFee: 0,
  freeDeliveryThreshold: 999,
  totalAmount: 0,
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setSummary(EMPTY_SUMMARY);
      return;
    }
    setLoading(true);
    try {
      const res = await orderService.getCart();
      setItems(res.data.items || []);
      setSummary(res.data.summary || EMPTY_SUMMARY);
    } catch {
      setItems([]);
      setSummary(EMPTY_SUMMARY);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (productId, quantity = 1) => {
    const res = await orderService.addToCart(productId, quantity);
    setItems(res.data.items || []);
    setSummary(res.data.summary || EMPTY_SUMMARY);
    showToast('Added to shopping cart', 'success');
    return res.data;
  };

  const updateQuantity = async (itemId, quantity) => {
    const res = await orderService.updateCartItem(itemId, quantity);
    setItems(res.data.items || []);
    setSummary(res.data.summary || EMPTY_SUMMARY);
  };

  const removeItem = async (itemId) => {
    const res = await orderService.removeCartItem(itemId);
    setItems(res.data.items || []);
    setSummary(res.data.summary || EMPTY_SUMMARY);
    showToast('Removed item from cart', 'info');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        summary,
        loading,
        fetchCart,
        addItem,
        updateQuantity,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
