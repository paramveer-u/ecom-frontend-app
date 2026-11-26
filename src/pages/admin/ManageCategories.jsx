import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import Loading from '../../components/Loading';

export default function ManageCategories() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', imageUrl: '', isActive: true });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await productService.getCategories(true);
      setCategories(res.data || []);
    } catch (err) { showToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editCat) {
        await productService.updateCategory(editCat.id, form);
        showToast('Category updated!', 'success');
      } else {
        await productService.createCategory(form);
        showToast('Category created!', 'success');
      }
      setShowForm(false); setEditCat(null); setForm({ name: '', description: '', imageUrl: '', isActive: true });
      load();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id, name, productCount) => {
    if (productCount > 0 && !window.confirm(`Category "${name}" has ${productCount} products. Delete anyway?`)) return;
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await productService.deleteCategory(id);
      showToast('Category deleted', 'info'); load();
    } catch (err) { showToast(err.message, 'error'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div><div className="section-eyebrow">Category Management</div><h1 style={{ fontSize: '24px' }}>Categories ({categories.length})</h1></div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditCat(null); setForm({ name: '', description: '', imageUrl: '', isActive: true }); }}>
          {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Category</>}
        </button>
      </div>

      {showForm && (
        <div className="card card-pad" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '17px', marginBottom: '14px' }}>{editCat ? 'Edit Category' : 'Add Category'}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="grid-2">
              <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Name *</label><input required className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Image URL</label><input type="url" className="form-input" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} /></div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Description</label><input className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> Active
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editCat ? 'Update' : 'Create'}</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <Loading /> : (
        <div className="card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Category</th><th>Slug</th><th>Products</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td><div style={{ fontWeight: 700 }}>{cat.name}</div><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cat.description?.slice(0, 60)}</div></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-muted)' }}>{cat.slug}</td>
                    <td><span className="badge badge-neutral">{cat.product_count} products</span></td>
                    <td>{cat.is_active ? <span className="badge badge-success">Active</span> : <span className="badge badge-neutral">Inactive</span>}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => { setEditCat(cat); setForm({ name: cat.name, description: cat.description || '', imageUrl: cat.image_url || '', isActive: Boolean(cat.is_active) }); setShowForm(true); }}><Pencil size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id, cat.name, cat.product_count)}><Trash2 size={14} /></button>
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
