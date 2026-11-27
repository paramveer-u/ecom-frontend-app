import api from './api';

export const paymentService = {
  createRazorpayOrder: (payload) => api.post('/payments/create-order', payload).then((r) => r.data),
  verifyRazorpayPayment: (payload) => api.post('/payments/verify', payload).then((r) => r.data),
  simulateRazorpayPayment: (payload) => api.post('/payments/simulate-success', payload).then((r) => r.data),
  recordPaymentFailure: (payload) => api.post('/payments/failure', payload).then((r) => r.data),

  // Admin analytics & management APIs
  getAdminDashboard: () => api.get('/admin/dashboard').then((r) => r.data),
  getAdminUsers: (search = '') =>
    api.get('/admin/users', { params: { search } }).then((r) => r.data),
  getAdminUserDetails: (id) => api.get(`/admin/users/${id}`).then((r) => r.data),
  toggleUserStatus: (id, isActive) =>
    api.put(`/admin/users/${id}/status`, { isActive }).then((r) => r.data),
  getAdminOrders: (params = {}) => api.get('/admin/orders', { params }).then((r) => r.data),
  updateOrderStatus: (id, payload) =>
    api.put(`/admin/orders/${id}/status`, payload).then((r) => r.data),
  getAdminInventory: (filter = 'all') =>
    api.get('/admin/inventory', { params: { filter } }).then((r) => r.data),
  updateInventoryStock: (productId, payload) =>
    api.put(`/admin/inventory/${productId}`, payload).then((r) => r.data),
  getAdminReviews: () => api.get('/admin/reviews').then((r) => r.data),
  moderateReview: (id, isApproved) =>
    api.put(`/admin/reviews/${id}/moderate`, { isApproved }).then((r) => r.data),
  getAdminReports: () => api.get('/admin/reports').then((r) => r.data),
};
