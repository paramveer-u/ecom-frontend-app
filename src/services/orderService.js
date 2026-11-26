import api from './api';

export const orderService = {
  // Cart
  getCart: () => api.get('/cart').then((r) => r.data),
  addToCart: (productId, quantity = 1) =>
    api.post('/cart', { productId, quantity }).then((r) => r.data),
  updateCartItem: (itemId, quantity) =>
    api.put(`/cart/${itemId}`, { quantity }).then((r) => r.data),
  removeCartItem: (itemId) => api.delete(`/cart/${itemId}`).then((r) => r.data),

  // Wishlist
  getWishlist: () => api.get('/wishlist').then((r) => r.data),
  addToWishlist: (productId) => api.post('/wishlist', { productId }).then((r) => r.data),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`).then((r) => r.data),

  // Addresses
  getAddresses: () => api.get('/addresses').then((r) => r.data),
  createAddress: (payload) => api.post('/addresses', payload).then((r) => r.data),
  updateAddress: (id, payload) => api.put(`/addresses/${id}`, payload).then((r) => r.data),
  deleteAddress: (id) => api.delete(`/addresses/${id}`).then((r) => r.data),

  // Orders
  createOrder: (payload) => api.post('/orders', payload).then((r) => r.data),
  getMyOrders: () => api.get('/orders/my-orders').then((r) => r.data),
  getOrderById: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }).then((r) => r.data),
};
