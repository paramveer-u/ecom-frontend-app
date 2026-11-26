import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { useToast } from '../context/ToastContext';
import Loading from '../components/Loading';
import { FALLBACK_PRODUCT_IMAGE, formatCurrency, formatDate, getStatusBadgeClass, resolveImageUrl } from '../utils/formatters';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getMyOrders();
      setOrders(res.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await orderService.cancelOrder(orderId, 'Cancelled by customer');
      showToast('Order cancelled successfully', 'info');
      loadOrders();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <Loading text="Loading your order history..." />;

  return (
    <div className="container page-shell">
      <div className="section-eyebrow">Customer Account</div>
      <h1 className="section-title" style={{ marginBottom: '24px' }}>My Orders ({orders.length})</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>Your placed orders will appear here once you complete a checkout.</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map(order => (
            <div key={order.id} className="card card-pad" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '20px', alignItems: 'center' }}>
              <img
                src={resolveImageUrl(order.preview_image)}
                alt={order.preview_product_name}
                style={{ width: '80px', height: '66px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
                onError={e => { e.currentTarget.src = FALLBACK_PRODUCT_IMAGE; }}
              />
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--accent-orange)' }}>{order.order_number}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0' }}>
                  {order.preview_product_name}{order.item_count > 1 ? ` +${order.item_count - 1} more items` : ''}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDate(order.created_at)} · {order.payment_method}</div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                <div style={{ fontWeight: 700, fontSize: '16px', fontFamily: 'var(--font-display)' }}>{formatCurrency(order.total_amount)}</div>
                <span className={`badge ${getStatusBadgeClass(order.order_status)}`}>{order.order_status}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link to={`/orders/${order.id}`} className="btn btn-outline btn-sm">Details</Link>
                  {['Pending', 'Confirmed', 'Processing'].includes(order.order_status) && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleCancel(order.id)}>Cancel</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
