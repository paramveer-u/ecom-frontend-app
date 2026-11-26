import { Link } from 'react-router-dom';
import { Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link to="/" className="brand-logo" style={{ color: '#FFFFFF', marginBottom: '12px' }}>
              <span className="brand-mark" style={{ backgroundColor: '#1F304D' }}>
                <Cpu size={18} />
              </span>
              <span>
                Electro<span className="brand-accent">Mart</span>
              </span>
            </Link>
            <p style={{ fontSize: '14px', maxWidth: '300px', lineHeight: 1.6 }}>
              Curated flagship electronics, creator workstations, and precision audio hardware backed
              by official brand warranty and verified checkout.
            </p>
          </div>

          <div>
            <div className="footer-heading">Shop Categories</div>
            <ul className="footer-links">
              <li><Link to="/products?category=smartphones">Smartphones</Link></li>
              <li><Link to="/products?category=laptops">Laptops</Link></li>
              <li><Link to="/products?category=headphones">Headphones</Link></li>
              <li><Link to="/products?category=monitors">Monitors</Link></li>
              <li><Link to="/products?category=cameras">Cameras</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-heading">Customer Care</div>
            <ul className="footer-links">
              <li><Link to="/orders">Track My Orders</Link></li>
              <li><Link to="/cart">Shopping Cart</Link></li>
              <li><Link to="/wishlist">Saved Wishlist</Link></li>
              <li><Link to="/profile">Manage Addresses</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-heading">Trust &amp; Payments</div>
            <ul className="footer-links">
              <li>Razorpay Encrypted Checkout</li>
              <li>Cash on Delivery Available</li>
              <li>7-Day Replacement Policy</li>
              <li>support@electromart.in</li>
            </ul>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            paddingTop: '20px',
            fontSize: '13px',
            color: '#94A3B8',
          }}
        >
          <span>© {new Date().getFullYear()} ElectroMart Electronics Pvt. Ltd. All rights reserved.</span>
          <span>Built with React, Express, MySQL &amp; Razorpay</span>
        </div>
      </div>
    </footer>
  );
}
