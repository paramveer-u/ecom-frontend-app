import { useEffect, useState } from 'react';
import { paymentService } from '../../services/paymentService';
import { productService } from '../../services/productService';
import Loading from '../../components/Loading';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';

const STATUSES = ['ALL', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);

  const load = (params = {}) => {
    setLoading(true);
    paymentService.getAdminOrders(params)
      .then(res => setOrders(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load({ status: statusFilter !== 'ALL' ? statusFilter : undefined, search }); }, [statusFilter, search]);

  const handleStatusUpdate = async (orderId, orderStatus) => {
    if (!window.confirm(`Change order status to "${orderStatus}"?`)) return;
    setUpdating(orderId);
    try {
      await paymentService.updateOrderStatus(orderId, { orderStatus });
      load({ status: statusFilter !== 'ALL' ? statusFilter : undefined, search });
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div><div className="section-eyebrow">Order Management</div><h1 style={{ fontSize: '24px' }}>All Orders ({orders.length})</h1></div>
      </div>

      <div className="card card-pad" style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-input" style={{ maxWidth: '280px' }} placeholder="Search order # or customer..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <Loading text="Loading orders..." /> : (
        <div className="card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Order Status</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>No orders found.</td></tr>
                ) : orders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>{order.order_number}</td>
                    <td><div style={{ fontWeight: 600 }}>{order.customer_name}</div><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.customer_email}</div></td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(order.total_amount)}</td>
                    <td><span className={`badge ${order.payment_method === 'COD' ? 'badge-warning' : 'badge-info'}`}>{order.payment_method}</span><div style={{ marginTop: '4px' }}><span className={`badge ${getStatusBadgeClass(order.payment_status)}`} style={{ fontSize: '11px' }}>{order.payment_status}</span></div></td>
                    <td><span className={`badge ${getStatusBadgeClass(order.order_status)}`}>{order.order_status}</span></td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(order.created_at)}</td>
                    <td>
                      {order.order_status !== 'Cancelled' && order.order_status !== 'Delivered' && (
                        <select className="form-select" style={{ fontSize: '12px', padding: '5px 8px' }} disabled={updating === order.id} defaultValue="" onChange={e => { if (e.target.value) handleStatusUpdate(order.id, e.target.value); }}>
                          <option value="" disabled>Update...</option>
                          {['Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].filter(s => s !== order.order_status).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      )}
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
