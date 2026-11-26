import { useEffect, useState } from 'react';
import { paymentService } from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';
import Loading from '../../components/Loading';
import { formatDate } from '../../utils/formatters';

export default function ManageReviews() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    paymentService.getAdminReviews().then(res => setReviews(res.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleModerate = async (id, approve) => {
    try {
      await paymentService.moderateReview(id, approve);
      showToast(approve ? 'Review approved' : 'Review hidden', 'success');
      load();
    } catch (err) { showToast(err.message, 'error'); }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}><div className="section-eyebrow">Review Moderation</div><h1 style={{ fontSize: '24px' }}>Customer Reviews ({reviews.length})</h1></div>
      {loading ? <Loading /> : (
        <div className="card"><div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>Product</th><th>Customer</th><th>Rating</th><th>Review</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {reviews.length === 0 ? <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>No reviews yet.</td></tr>
              : reviews.map(rev => (
                <tr key={rev.id}>
                  <td style={{ fontSize: '13px', fontWeight: 600 }}>{rev.product_name?.slice(0, 32)}</td>
                  <td><div style={{ fontSize: '13px', fontWeight: 600 }}>{rev.author_name}</div><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{rev.author_email}</div></td>
                  <td><span style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span></td>
                  <td style={{ fontSize: '13px', maxWidth: '240px' }}>{rev.title && <div style={{ fontWeight: 600 }}>{rev.title}</div>}<div style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rev.comment}</div></td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDate(rev.created_at)}</td>
                  <td>{rev.is_approved ? <span className="badge badge-success">Approved</span> : <span className="badge badge-danger">Hidden</span>}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {!rev.is_approved && <button className="btn btn-outline btn-sm" onClick={() => handleModerate(rev.id, true)}>Approve</button>}
                      {rev.is_approved && <button className="btn btn-danger btn-sm" onClick={() => handleModerate(rev.id, false)}>Hide</button>}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table></div></div>
      )}
    </div>
  );
}
