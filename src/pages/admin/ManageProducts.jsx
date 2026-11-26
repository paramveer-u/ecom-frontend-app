import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import { FALLBACK_PRODUCT_IMAGE, formatCurrency, resolveImageUrl } from '../../utils/formatters';
import Loading from '../../components/Loading';

export default function ManageProducts() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const EMPTY_FORM = {
    name: '', brand: '', categoryId: '', sku: '', description: '',
    price: '', originalPrice: '', stockQuantity: '0', lowStockThreshold: '5',
    isFeatured: false, isTrending: false, isBestSeller: false, isActive: true,
    imageUrls: '', specifications: '',
  };
  const [form, setForm] = useState(EMPTY_FORM);

  const load = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productService.getProducts({ limit: 100, includeInactive: 'true' }),
        productService.getCategories(true),
      ]);
      setProducts(prodRes.data?.products || []);
      setCategories(catRes.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name, brand: product.brand, categoryId: String(product.category_id),
      sku: product.sku, description: product.description, price: String(product.price),
      originalPrice: String(product.original_price), stockQuantity: String(product.stock_quantity),
      lowStockThreshold: String(product.low_stock_threshold), isFeatured: Boolean(product.is_featured),
      isTrending: Boolean(product.is_trending), isBestSeller: Boolean(product.is_best_seller),
      isActive: Boolean(product.is_active), imageUrls: '', specifications: '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== 'imageUrls' && k !== 'specifications') fd.append(k, v);
      });
      if (form.imageUrls.trim()) {
        const urls = form.imageUrls.split('\n').map(u => u.trim()).filter(Boolean);
        fd.append('imageUrls', JSON.stringify(urls));
      }
      if (form.specifications.trim()) {
        try {
          const specLines = form.specifications.split('\n').filter(Boolean);
          const specs = specLines.map(line => {
            const [key, ...rest] = line.split(':');
            return { specKey: key.trim(), specValue: rest.join(':').trim() };
          });
          fd.append('specifications', JSON.stringify(specs));
        } catch {}
      }

      if (editProduct) {
        await productService.updateProduct(editProduct.id, fd);
        showToast('Product updated!', 'success');
      } else {
        await productService.createProduct(fd);
        showToast('Product created!', 'success');
      }
      setShowForm(false);
      setEditProduct(null);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await productService.deleteProduct(id);
      showToast('Product deleted', 'info');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div><div className="section-eyebrow">Catalog Management</div><h1 style={{ fontSize: '24px' }}>Manage Products ({products.length})</h1></div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditProduct(null); setForm(EMPTY_FORM); }}>
          {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Product</>}
        </button>
      </div>

      {showForm && (
        <div className="card card-pad" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Product Name *</label><input required className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Brand *</label><input required className="form-input" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Category *</label>
                <select required className="form-select" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">SKU *</label><input required className="form-input" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Selling Price (₹) *</label><input required type="number" min="0" step="0.01" className="form-input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Original / MRP (₹)</label><input type="number" min="0" step="0.01" className="form-input" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Stock Quantity</label><input type="number" min="0" className="form-input" value={form.stockQuantity} onChange={e => setForm({ ...form, stockQuantity: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Low Stock Alert Threshold</label><input type="number" min="1" className="form-input" value={form.lowStockThreshold} onChange={e => setForm({ ...form, lowStockThreshold: e.target.value })} /></div>
            </div>
            <div className="form-group"><label className="form-label">Description *</label><textarea required rows="3" className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Image URLs (one per line — leave blank to keep existing)</label><textarea rows="3" className="form-textarea" placeholder="https://..." value={form.imageUrls} onChange={e => setForm({ ...form, imageUrls: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Specifications (one per line, format: Key: Value)</label><textarea rows="4" className="form-textarea" placeholder="Display: 6.7&quot; AMOLED 120Hz&#10;Battery: 5000mAh" value={form.specifications} onChange={e => setForm({ ...form, specifications: e.target.value })} /></div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {[['isFeatured', 'Featured'], ['isTrending', 'Trending'], ['isBestSeller', 'Best Seller'], ['isActive', 'Active']].map(([key, label]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} />
                  {label}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}</button>
              <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditProduct(null); setForm(EMPTY_FORM); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card card-pad" style={{ marginBottom: '14px' }}>
        <input className="form-input" placeholder="Search by name, SKU, or brand..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '340px' }} />
      </div>

      {loading ? <Loading text="Loading products..." /> : (
        <div className="card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={resolveImageUrl(p.primary_image)} alt={p.name} style={{ width: '44px', height: '38px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-subtle)', flexShrink: 0 }} onError={e => { e.currentTarget.src = FALLBACK_PRODUCT_IMAGE; }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>{p.name.slice(0, 42)}{p.name.length > 42 ? '...' : ''}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.brand} · SKU: {p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px' }}>{p.category_name}</td>
                    <td><div style={{ fontWeight: 700 }}>{formatCurrency(p.price)}</div>{Number(p.discount_percent) > 0 && <div style={{ fontSize: '11px', color: 'var(--accent-orange)' }}>{Math.round(p.discount_percent)}% off</div>}</td>
                    <td><span className={`badge ${p.stock_quantity === 0 ? 'badge-danger' : p.stock_quantity <= p.low_stock_threshold ? 'badge-warning' : 'badge-success'}`}>{p.stock_quantity}</span></td>
                    <td>{p.is_active ? <span className="badge badge-success">Active</span> : <span className="badge badge-neutral">Inactive</span>}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)} title="Edit"><Pencil size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
