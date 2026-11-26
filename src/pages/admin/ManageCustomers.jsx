import { useEffect, useState } from 'react';
import { paymentService } from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';
import Loading from '../../components/Loading';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function ManageCustomers() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = (s = '') => {
    setLoading(true);
    paymentService.getAdminUsers(s).then(res => setCustomers(res.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id, currentActive) => {
    try {
      await paymentService.toggleUserStatus(id, !currentActive);
      showToast(`Account ${!currentActive ? 'activated' : 'deactivated'}`, 'success');
      load(search);
    } catch (err) { showToast(err.message, 'error'); }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}><div className="section-eyebrow">Customer Management</div><h1 style={{ fontSize: '24px' }}>Customers ({customers.length})</h1></div>
      <div className="card card-pad" style={{ marginBottom: '14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input className="form-input" style={{ maxWidth: '300px' }} placeholder="Search name, email or phone..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(search)} />
        <button className="btn btn-outline btn-sm" onClick={() => load(search)}>Search</button>
      </div>
      {loading ? <Loading /> : (
        <div className="card"><div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>Customer</th><th>Phone</th><th>Orders</th><th>Total Spent</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {customers.length === 0 ? <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>No customers found.</td></tr>
              : customers.map(c => (
                <tr key={c.id}>
                  <td><div style={{ fontWeight: 700 }}>{c.full_name}</div><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.email}</div></td>
                  <td style={{ fontSize: '13px' }}>{c.phone || '—'}</td>
                  <td style={{ fontWeight: 700 }}>{c.order_count}</td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(c.total_spent)}</td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(c.created_at)}</td>
                  <td>{c.is_active ? <span className="badge badge-success">Active</span> : <span className="badge badge-danger">Inactive</span>}</td>
                  <td><button className={`btn ${c.is_active ? 'btn-danger' : 'btn-outline'} btn-sm`} onClick={() => handleToggle(c.id, c.is_active)}>{c.is_active ? 'Deactivate' : 'Activate'}</button></td>
                </tr>
              ))}
          </tbody>
        </table></div></div>
      )}
    </div>
  );
}
