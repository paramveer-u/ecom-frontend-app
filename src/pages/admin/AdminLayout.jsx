import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BarChart2, Box, Clipboard, Grid, Home, LogOut, Package, ShieldCheck, Star, Users } from 'lucide-react';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: Home, end: true },
  { to: '/admin/products', label: 'Products', icon: Box },
  { to: '/admin/categories', label: 'Categories', icon: Grid },
  { to: '/admin/orders', label: 'Orders', icon: Clipboard },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/inventory', label: 'Inventory', icon: Package },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/reports', label: 'Reports', icon: BarChart2 },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <div className="admin-brand">
            <ShieldCheck size={22} color="#E66C3D" />
            <div>
              <div className="admin-brand-title">ElectroMart</div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>Admin Console</div>
            </div>
          </div>
          <nav className="admin-nav-list">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div>
          <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '13px' }}>
            <div style={{ color: '#FFFFFF', fontWeight: 600 }}>{user?.fullName}</div>
            <div style={{ color: '#94A3B8', fontSize: '12px' }}>{user?.email}</div>
          </div>
          <button type="button" className="admin-nav-item" style={{ width: '100%', border: 'none', cursor: 'pointer' }} onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
          <Link to="/" className="admin-nav-item" style={{ fontSize: '12px', color: '#94A3B8' }}>← Back to Store</Link>
        </div>
      </aside>
      <main className="admin-main">
        <div className="admin-topbar">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--navy-900)' }}>
            Admin Management Portal
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Logged in as <strong>{user?.email}</strong>
          </div>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
