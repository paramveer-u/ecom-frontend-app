import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { useToast } from '../context/ToastContext';
import Loading from '../components/Loading';
import { FALLBACK_PRODUCT_IMAGE, formatCurrency, formatDate, getStatusBadgeClass, resolveImageUrl } from '../utils/formatters';

const ORDER_STEPS = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    orderService.getOrderById(id)
      .then(res => setOrder(res.data))
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading text="Loading order details..." />;
  if (!order) return <div className="container page-shell"><div className="empty-state"><h3>Order not found</h3><Link to="/orders" className="btn btn-outline">Back to Orders</Link></div></div>;

  const currentStep = order.order_status === 'Cancelled' ? -1 : ORDER_STEPS.indexOf(order.order_status);

  return (
    <div className="container page-shell">
      <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}>← Back to Orders</Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <div className="section-eyebrow">Order Reference</div>
          <h1 style={{ fontSize: '24px', color: 'var(--accent-orange)' }}>{order.order_number}</h1>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Placed on {formatDate(order.created_at)}</div>
        </div>
        <span className={`badge ${getStatusBadgeClass(order.order_status)}`} style={{ fontSize: '14px', padding: '6px 14px' }}>{order.order_status}</span>
      </div>

      {/* Timeline */}
      {order.order_status !== 'Cancelled' && (
        <div className="card card-pad" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '16px' }}>Order Progress</h2>
          <div className="status-stepper">
            {ORDER_STEPS.map((step, i) => (
              <div key={step} className={`status-step ${i < currentStep ? 'done' : i === currentStep ? 'current' : ''}`}>
                <div className="status-dot">{i < currentStep ? '✓' : i + 1}</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: i <= currentStep ? 'var(--navy-900)' : 'var(--text-muted)' }}>{step}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid-2" style={{ gap: '20px', alignItems: 'start' }}>
        {/* Items */}
        <div className="card card-pad">
          <h2 style={{ fontSize: '16px', marginBottom: '14px' }}>Items Ordered</h2>
          {order.items?.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: '12px', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <img src={resolveImageUrl(item.product_image)} alt={item.product_name} style={{ width: '60px', height: '52px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-subtle)', flexShrink: 0 }} onError={e => { e.currentTarget.src = FALLBACK_PRODUCT_IMAGE; }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{item.product_name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>SKU: {item.product_sku} · Qty: {item.quantity}</div>
              </div>
              <div style={{ fontWeight: 700 }}>{formatCurrency(item.line_total)}</div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px', paddingTop: '8px' }}>
            <span>Total</span><span>{formatCurrency(order.total_amount)}</span>
          </div>
        </div>

        {/* Shipping & Payment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card card-pad">
            <h2 style={{ fontSize: '16px', marginBottom: '10px' }}>Delivery Address</h2>
            <div style={{ fontSize: '14px', lineHeight: 1.7 }}>
              <div style={{ fontWeight: 700 }}>{order.shipping_name}</div>
              <div>{order.shipping_phone}</div>
              <div>{order.shipping_address_line1}{order.shipping_address_line2 ? `, ${order.shipping_address_line2}` : ''}</div>
              <div>{order.shipping_city}, {order.shipping_state} - {order.shipping_postal_code}</div>
              <div>{order.shipping_country}</div>
            </div>
          </div>

          <div className="card card-pad">
            <h2 style={{ fontSize: '16px', marginBottom: '10px' }}>Payment</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Method</span>
              <span style={{ fontWeight: 600 }}>{order.payment_method === 'COD' ? 'Cash on Delivery' : 'Razorpay'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Payment Status</span>
              <span className={`badge ${getStatusBadgeClass(order.payment_status)}`}>{order.payment_status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
