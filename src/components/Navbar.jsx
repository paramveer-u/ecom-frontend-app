import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Cpu, Heart, ShoppingCart, User, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { productService } from '../services/productService';
import SearchBar from './SearchBar';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { summary } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [categories, setCategories] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    productService
      .getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="utility-strip">
        <div className="container utility-strip-inner">
          <span>Free Express Delivery on orders above ₹999 · 100% Genuine Brand Warranty</span>
          <span>
            {isAdmin ? (
              <Link to="/admin" style={{ color: '#FF9C75', fontWeight: 700 }}>
                Open Admin Console →
              </Link>
            ) : (
              '24/7 Tech Support · Verified Razorpay Checkout'
            )}
          </span>
        </div>
      </div>

      <div className="container navbar-inner">
        <Link to="/" className="brand-logo">
          <span className="brand-mark">
            <Cpu size={18} />
          </span>
          <span>
            Electro<span className="brand-accent">Mart</span>
          </span>
        </Link>

        <SearchBar />

        <nav className="nav-actions" aria-label="Account and Cart">
          <Link to="/wishlist" className="nav-icon-btn" title="Wishlist">
            <Heart size={19} />
            <span className="hide-sm">Wishlist</span>
            {wishlistItems.length > 0 && (
              <span className="nav-count-badge">{wishlistItems.length}</span>
            )}
          </Link>

          <Link to="/cart" className="nav-icon-btn" title="Shopping Cart">
            <ShoppingCart size={19} />
            <span className="hide-sm">Cart</span>
            {summary.totalItems > 0 && (
              <span className="nav-count-badge">{summary.totalItems}</span>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="btn btn-navy btn-sm hide-sm">
                  <ShieldCheck size={15} />
                  Admin
                </Link>
              )}
              <Link to="/orders" className="nav-icon-btn hide-sm">
                Orders
              </Link>
              <Link to="/profile" className="nav-icon-btn">
                <User size={18} />
                <span className="hide-sm">{user.fullName.split(' ')[0]}</span>
              </Link>
              <button
                type="button"
                className="btn btn-ghost btn-sm hide-sm"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm hide-sm">
                Register
              </Link>
            </>
          )}

          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>
      </div>

      {mobileOpen && (
        <div
          className="container"
          style={{
            paddingBottom: '14px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            paddingTop: '10px',
          }}
        >
          <Link to="/products" className="btn btn-outline btn-sm" onClick={() => setMobileOpen(false)}>
            All Electronics
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/orders" className="btn btn-outline btn-sm" onClick={() => setMobileOpen(false)}>
                My Orders
              </Link>
              {isAdmin && (
                <Link to="/admin" className="btn btn-navy btn-sm" onClick={() => setMobileOpen(false)}>
                  Admin Dashboard
                </Link>
              )}
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>
              Create Account
            </Link>
          )}
        </div>
      )}

      <div className="category-nav-strip">
        <div className="container">
          <div className="category-nav-list">
            <NavLink to="/products" className="category-nav-link">
              All Electronics
            </NavLink>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="category-nav-link"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
