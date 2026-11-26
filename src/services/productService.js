import api from './api';

export const productService = {
  getProducts: (params = {}) => api.get('/products', { params }).then((r) => r.data),
  getSuggestions: (q) => api.get('/products/suggestions', { params: { q } }).then((r) => r.data),
  getProductById: (idOrSlug) => api.get(`/products/${idOrSlug}`).then((r) => r.data),
  getCategories: (includeInactive = false) =>
    api.get('/categories', { params: { includeInactive } }).then((r) => r.data),
  getReviews: (productId) => api.get(`/reviews/${productId}`).then((r) => r.data),
  createReview: (payload) => api.post('/reviews', payload).then((r) => r.data),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`).then((r) => r.data),
  subscribeNewsletter: (email) => api.post('/newsletter', { email }).then((r) => r.data),

  // Admin product & category operations
  createProduct: (formData) =>
    api
      .post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data),
  updateProduct: (id, formData) =>
    api
      .put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data),
  deleteProduct: (id) => api.delete(`/products/${id}`).then((r) => r.data),
  createCategory: (payload) => api.post('/categories', payload).then((r) => r.data),
  updateCategory: (id, payload) => api.put(`/categories/${id}`, payload).then((r) => r.data),
  deleteCategory: (id, reassignTo = null) =>
    api
      .delete(`/categories/${id}`, { params: reassignTo ? { reassignTo } : {} })
      .then((r) => r.data),
};
