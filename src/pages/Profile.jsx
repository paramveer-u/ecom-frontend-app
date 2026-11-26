import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';

export default function Profile() {
  const { user, refreshProfile, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '' });
  const [addresses, setAddresses] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ fullName: user.fullName, phone: user.phone || '' });
    orderService.getAddresses().then(res => setAddresses(res.data || [])).catch(() => {});
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authService.updateProfile({ fullName: form.fullName, phone: form.phone });
      await refreshProfile();
      showToast('Profile updated!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="container page-shell">
      <div className="section-eyebrow">Customer Account</div>
      <h1 className="section-title" style={{ marginBottom: '24px' }}>Account Settings</h1>

      <div className="grid-2" style={{ gap: '24px', alignItems: 'start' }}>
        <div className="card card-pad">
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Personal Details</h2>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input className="form-input" value={user?.email || ''} readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 9999999999" />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              <button type="button" className="btn btn-danger btn-sm" onClick={handleLogout}>Logout</button>
            </div>
          </form>
        </div>

        <div className="card card-pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '18px' }}>Saved Addresses</h2>
            <Link to="/checkout" className="btn btn-outline btn-sm">Manage in Checkout</Link>
          </div>
          {addresses.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No addresses saved yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {addresses.map(addr => (
                <div key={addr.id} style={{ padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '14px' }}>
                  <div style={{ fontWeight: 700 }}>{addr.full_name} · {addr.phone}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{addr.address_line1}, {addr.city}, {addr.state} - {addr.postal_code}</div>
                  {addr.is_default ? <span className="badge badge-success" style={{ marginTop: '4px' }}>Default</span> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontWeight: 700 }}>Quick Links</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Manage your ElectroMart activity</div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/orders" className="btn btn-outline btn-sm">My Orders</Link>
          <Link to="/wishlist" className="btn btn-outline btn-sm">My Wishlist</Link>
          {user?.role === 'ADMIN' && <Link to="/admin" className="btn btn-navy btn-sm">Admin Dashboard</Link>}
        </div>
      </div>
    </div>
  );
}
