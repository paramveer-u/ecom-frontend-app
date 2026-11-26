import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="container page-shell">
      <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center', padding: '48px 20px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--success-bg)', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle size={38} color="var(--success)" />
        </div>
        <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>Order Placed Successfully!</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>
          Thank you for shopping at ElectroMart. Your order has been confirmed and will be dispatched shortly.
        </p>

        {order && (
          <div className="card card-pad" style={{ textAlign: 'left', marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '14px' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Order Number</div>
                <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--accent-orange)' }}>{order.orderNumber}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Total Paid</div>
                <div style={{ fontWeight: 700, fontSize: '16px' }}>{formatCurrency(order.totalAmount)}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Payment</div>
                <div>{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Razorpay'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Status</div>
                <span className="badge badge-success">{order.orderStatus}</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/orders" className="btn btn-navy">
            <Package size={16} /> Track My Orders
          </Link>
          <Link to="/products" className="btn btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
