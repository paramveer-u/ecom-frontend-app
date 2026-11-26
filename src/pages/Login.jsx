import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  const [roleTab, setRoleTab] = useState('CUSTOMER');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleTabChange = (tab) => {
    setRoleTab(tab);
    setError('');
  };

  const fillDemoCredentials = () => {
    setError('');
    if (roleTab === 'ADMIN') {
      setForm({ email: 'admin@electromart.in', password: 'Admin@123' });
    } else {
      setForm({ email: 'priya@example.com', password: 'Customer@123' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password) {
      setError('Email and password are required.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(form);
      showToast(`Welcome back, ${user.fullName.split(' ')[0]}!`, 'success');
      if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate(redirectTo === '/login' ? '/' : redirectTo, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page-shell">
      <div className="card card-pad auth-shell">
        <div className="section-eyebrow">ElectroMart Portal</div>
        <h1 style={{ fontSize: '26px', marginBottom: '8px' }}>
          {roleTab === 'ADMIN' ? 'Admin Dashboard Sign In' : 'Customer Sign In'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '18px' }}>
          {roleTab === 'ADMIN'
            ? 'Manage products, inventory, orders, customers, and sales analytics.'
            : 'Access your saved cart, wishlist, order tracking, and fast checkout.'}
        </p>

        {/* Role Switcher Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            padding: '4px',
            background: '#F1F3F6',
            borderRadius: '10px',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => handleTabChange('CUSTOMER')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 12px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              transition: 'all 0.15s ease',
              background: roleTab === 'CUSTOMER' ? '#FFFFFF' : 'transparent',
              color: roleTab === 'CUSTOMER' ? 'var(--primary-navy)' : 'var(--text-secondary)',
              boxShadow: roleTab === 'CUSTOMER' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <User size={16} />
            Customer Login
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('ADMIN')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 12px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              transition: 'all 0.15s ease',
              background: roleTab === 'ADMIN' ? '#17243B' : 'transparent',
              color: roleTab === 'ADMIN' ? '#FFFFFF' : 'var(--text-secondary)',
              boxShadow: roleTab === 'ADMIN' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
            }}
          >
            <ShieldCheck size={16} />
            Admin Login
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder={roleTab === 'ADMIN' ? 'admin@electromart.in' : 'you@example.com'}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
            {submitting
              ? 'Signing in...'
              : roleTab === 'ADMIN'
                ? 'Sign In to Admin Dashboard'
                : 'Sign In to Store'}
          </button>
        </form>

        <div style={{ marginTop: '14px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="btn btn-outline btn-sm"
            style={{ width: '100%' }}
          >
            {roleTab === 'ADMIN'
              ? 'Fill Demo Admin Credentials (admin@electromart.in)'
              : 'Fill Demo Customer Credentials (priya@example.com)'}
          </button>
        </div>

        <div
          style={{
            marginTop: '18px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '14px',
            color: 'var(--text-secondary)',
          }}
        >
          <span>
            New here?{' '}
            <Link to="/register" style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>
              Create account
            </Link>
          </span>
          <Link to="/shop" style={{ color: 'var(--primary-navy)', fontWeight: 600 }}>
            Browse as Guest →
          </Link>
        </div>
      </div>
    </div>
  );
}
