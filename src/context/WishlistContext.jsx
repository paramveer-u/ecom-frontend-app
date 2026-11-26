import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { orderService } from '../services/orderService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await orderService.getWishlist();
      setItems(res.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback(
    (productId) => items.some((item) => Number(item.product_id) === Number(productId)),
    [items]
  );

  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      const res = await orderService.removeFromWishlist(productId);
      setItems(res.data || []);
      showToast('Removed from wishlist', 'info');
      return false;
    } else {
      const res = await orderService.addToWishlist(productId);
      setItems(res.data || []);
      showToast('Saved to wishlist', 'success');
      return true;
    }
  };

  const removeFromWishlist = async (productId) => {
    const res = await orderService.removeFromWishlist(productId);
    setItems(res.data || []);
    showToast('Removed from wishlist', 'info');
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        loading,
        fetchWishlist,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
