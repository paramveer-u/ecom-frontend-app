import { useEffect, useState } from 'react';
import { paymentService } from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';
import Loading from '../../components/Loading';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function Inventory() {
  const { showToast } = useToast();
  const [data, setData] = useState({ products: [], recentTransactions: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState({});
  const [updating, setUpdating] = useState(null);

  const load = (f = filter) => {
    setLoading(true);
    paymentService.getAdminInventory(f).then(res => setData(res.data || { products: [], recentTransactions: [] })).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleUpdateStock = async (productId, note = 'Admin stock adjustment') => {
    const qty = editing[productId];
    if (qty === undefined || qty === '' || isNaN(Number(qty))) return;
    setUpdating(productId);
    try {
      await paymentService.updateInventoryStock(productId, { stockQuantity: Number(qty), note });
      showToast('Stock updated!', 'success');
      setEditing(prev => { const n = { ...prev }; delete n[productId]; return n; });
      load();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setUpdating(null); }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}><div className="section-eyebrow">Inventory Management</div><h1 style={{ fontSize: '24px' }}>Stock Control</h1></div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        {[['all', 'All Products'], ['low', 'Low Stock'], ['out', 'Out of Stock']].map(([v, l]) => (
          <button key={v} className={`btn ${filter === v ? 'btn-navy' : 'btn-outline'} btn-sm`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      {loading ? <Loading /> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div className="card"><div className="admin-table-wrap"><table className="admin-table">
            <thead><tr><th>Product</th><th>SKU</th><th>Stock</th><th>Threshold</th><th>Update Stock</th></tr></thead>
            <tbody>
              {data.products.length === 0 ? <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>No products match filter.</td></tr>
                : data.products.map(p => (
                  <tr key={p.id}>
                    <td><div style={{ fontWeight: 600, fontSize: '13px' }}>{p.name.slice(0, 36)}{p.name.length > 36 ? '...' : ''}</div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.brand}</div></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>{p.sku}</td>
                    <td><span className={`badge ${p.stock_quantity === 0 ? 'badge-danger' : p.stock_quantity <= p.low_stock_threshold ? 'badge-warning' : 'badge-success'}`}>{p.stock_quantity}</span></td>
                    <td style={{ fontSize: '13px' }}>{p.low_stock_threshold}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input type="number" min="0" className="form-input" style={{ width: '70px', padding: '5px 8px' }} placeholder={p.stock_quantity} value={editing[p.id] ?? ''} onChange={e => setEditing(prev => ({ ...prev, [p.id]: e.target.value }))} />
                        <button className="btn btn-primary btn-sm" disabled={updating === p.id || editing[p.id] === undefined || editing[p.id] === ''} onClick={() => handleUpdateStock(p.id)}>Set</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table></div></div>

          <div className="card card-pad">
            <h3 style={{ fontSize: '16px', marginBottom: '14px' }}>Recent Inventory Transactions</h3>
            {data.recentTransactions.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No transactions yet.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {data.recentTransactions.slice(0, 15).map(tx => (
                  <div key={tx.id} style={{ padding: '10px', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700 }}>{tx.product_name?.slice(0, 28)}</span>
                      <span className={`badge ${tx.quantity_change > 0 ? 'badge-success' : 'badge-danger'}`}>{tx.quantity_change > 0 ? '+' : ''}{tx.quantity_change}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{tx.change_type} · {tx.previous_stock} → {tx.new_stock} · {formatDate(tx.created_at)}</div>
                    {tx.note && <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>{tx.note}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
