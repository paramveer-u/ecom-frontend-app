import { useEffect, useState } from 'react';
import { paymentService } from '../../services/paymentService';
import Loading from '../../components/Loading';
import { formatCurrency } from '../../utils/formatters';
import { getStatusBadgeClass } from '../../utils/formatters';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentService.getAdminReports().then(res => setData(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Generating reports..." />;
  if (!data) return <div className="alert alert-error">Failed to load report data.</div>;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}><div className="section-eyebrow">Analytics</div><h1 style={{ fontSize: '24px' }}>Sales Reports</h1></div>
      <div className="grid-2" style={{ gap: '20px', alignItems: 'start' }}>
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}><h2 style={{ fontSize: '17px' }}>Revenue by Category</h2></div>
          <div className="admin-table-wrap"><table className="admin-table">
            <thead><tr><th>Category</th><th>Orders</th><th>Units Sold</th><th>Revenue</th></tr></thead>
            <tbody>
              {data.categorySales.map((c, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700 }}>{c.category_name}</td>
                  <td>{c.orders_count}</td>
                  <td>{c.units_sold}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>{formatCurrency(c.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>

        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}><h2 style={{ fontSize: '17px' }}>Orders by Status</h2></div>
          <div className="admin-table-wrap"><table className="admin-table">
            <thead><tr><th>Status</th><th>Count</th><th>Revenue</th></tr></thead>
            <tbody>
              {data.statusBreakdown.map((s, i) => (
                <tr key={i}>
                  <td><span className={`badge ${getStatusBadgeClass(s.order_status)}`}>{s.order_status}</span></td>
                  <td style={{ fontWeight: 700 }}>{s.count}</td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(s.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      </div>
    </div>
  );
}
