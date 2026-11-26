import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import Loading from '../../components/Loading';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentService.getAdminDashboard()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Loading dashboard analytics..." />;
  if (!data) return <div className="alert alert-error">Failed to load dashboard data.</div>;

  const { stats, lowStockProducts, recentOrders, bestSellingProducts, monthlyRevenue } = data;

  const maxRevenue = Math.max(...(monthlyRevenue.map(m => Number(m.revenue)) || [1]), 1);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div className="section-eyebrow">Admin Dashboard</div>
        <h1 style={{ fontSize: '26px' }}>ElectroMart Overview</h1>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {[
          { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), sub: 'Paid & COD orders', color: 'var(--accent-orange)' },
          { label: 'Total Orders', value: stats.totalOrders, sub: `${stats.pendingOrders} pending`, color: 'var(--navy-900)' },
          { label: 'Total Customers', value: stats.totalCustomers, sub: 'Registered accounts', color: '#1D4ED8' },
          { label: 'Active Products', value: stats.totalProducts, sub: `${stats.lowStockCount} low stock`, color: '#15803D' },
        ].map(card => (
          <div key={card.label} className="kpi-card">
            <div className="kpi-label">{card.label}</div>
            <div className="kpi-value" style={{ color: card.color }}>{card.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Revenue Chart */}
        <div className="card card-pad">
          <h2 style={{ fontSize: '17px', marginBottom: '20px' }}>Monthly Revenue (Last 6 Months)</h2>
          {monthlyRevenue.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No revenue data available yet.</div>
          ) : (
            <div className="revenue-chart">
              {monthlyRevenue.map(m => (
                <div key={m.month} className="revenue-bar-col" title={`${m.label}: ${formatCurrency(m.revenue)}`}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{formatCurrency(m.revenue)}</div>
                  <div
                    className="revenue-bar"
                    style={{ height: `${Math.max(8, (Number(m.revenue) / maxRevenue) * 160)}px` }}
                  />
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>{m.label.slice(0, 3)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="card card-pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '17px' }}>Low Stock Alerts</h2>
            <Link to="/admin/inventory" className="btn btn-outline btn-sm">View All</Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>All products well-stocked ✓</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {lowStockProducts.slice(0, 5).map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{p.name.slice(0, 36)}{p.name.length > 36 ? '...' : ''}</div>
                    <div style={{ color: 'var(--text-muted)' }}>SKU: {p.sku}</div>
                  </div>
                  <span className={`badge ${p.stock_quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                    {p.stock_quantity === 0 ? 'Out of Stock' : `${p.stock_quantity} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '17px' }}>Recent Orders</h2>
          <Link to="/admin/orders" className="btn btn-outline btn-sm">All Orders</Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td><Link to={`/admin/orders`} style={{ color: 'var(--accent-orange)', fontWeight: 700 }}>{order.order_number}</Link></td>
                  <td><div style={{ fontWeight: 600 }}>{order.customer_name}</div><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.customer_email}</div></td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(order.total_amount)}</td>
                  <td><span className={`badge ${order.payment_method === 'COD' ? 'badge-warning' : 'badge-info'}`}>{order.payment_method}</span></td>
                  <td><span className={`badge ${getStatusBadgeClass(order.order_status)}`}>{order.order_status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{formatDate(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Best Sellers */}
      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: '17px' }}>Best-Selling Products</h2>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Product</th><th>SKU</th><th>Price</th><th>Stock</th><th>Units Sold</th></tr>
            </thead>
            <tbody>
              {bestSellingProducts.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name.slice(0, 44)}{p.name.length > 44 ? '...' : ''}</td>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '13px' }}>{p.sku}</td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(p.price)}</td>
                  <td><span className={`badge ${p.stock_quantity === 0 ? 'badge-danger' : p.stock_quantity <= 5 ? 'badge-warning' : 'badge-success'}`}>{p.stock_quantity}</span></td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>{p.sales_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
