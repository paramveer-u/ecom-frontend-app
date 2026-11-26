import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { FALLBACK_PRODUCT_IMAGE, formatCurrency, resolveImageUrl } from '../utils/formatters';

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const wishlisted = isInWishlist(product.id);
  const inStock = Number(product.stock_quantity) > 0;
  const discount = Math.round(Number(product.discount_percent || 0));

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to add items to your cart', 'info');
      navigate('/login');
      return;
    }
    try {
      await addItem(product.id, 1);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to save items to your wishlist', 'info');
      navigate('/login');
      return;
    }
    try {
      await toggleWishlist(product.id);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <article className="product-card">
      <div className="product-card-media">
        <Link to={`/products/${product.id}`}>
          <img
            src={resolveImageUrl(product.primary_image)}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
            }}
          />
        </Link>

        {discount > 0 && <span className="product-discount-tag">{discount}% OFF</span>}

        <button
          type="button"
          className={`product-wishlist-fab ${wishlisted ? 'active' : ''}`}
          onClick={handleToggleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="product-card-body">
        <div className="product-brand">
          {product.brand} {product.category_name ? `· ${product.category_name}` : ''}
        </div>

        <Link to={`/products/${product.id}`} className="product-title">
          {product.name}
        </Link>

        <div className="product-rating-row">
          <span className="rating-pill">
            <Star size={13} fill="#E66C3D" color="#E66C3D" />
            {Number(product.rating_avg || 0).toFixed(1)}
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
              ({product.rating_count || 0})
            </span>
          </span>

          {inStock ? (
            <span
              className={`badge ${product.stock_quantity <= 5 ? 'badge-warning' : 'badge-success'}`}
            >
              {product.stock_quantity <= 5 ? `Only ${product.stock_quantity} left` : 'In Stock'}
            </span>
          ) : (
            <span className="badge badge-danger">Out of Stock</span>
          )}
        </div>

        <div className="product-price-row">
          <span className="product-price">{formatCurrency(product.price)}</span>
          {Number(product.original_price) > Number(product.price) && (
            <span className="product-orig-price">{formatCurrency(product.original_price)}</span>
          )}
        </div>

        <div className="product-card-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={!inStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart size={15} />
            {inStock ? 'Add to Cart' : 'Sold Out'}
          </button>
          <Link
            to={`/products/${product.id}`}
            className="btn btn-outline btn-sm"
            title="View Details"
            aria-label={`View details for ${product.name}`}
          >
            <Eye size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
