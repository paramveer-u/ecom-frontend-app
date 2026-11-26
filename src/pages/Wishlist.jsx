import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import Loading from '../components/Loading';
import { FALLBACK_PRODUCT_IMAGE, formatCurrency, resolveImageUrl } from '../utils/formatters';

export default function Wishlist() {
  const { items, loading, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const handleMoveToCart = async (productId, name) => {
    try {
      await addItem(productId, 1);
      await removeFromWishlist(productId);
      showToast(`${name} moved to cart`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <Loading text="Loading wishlist..." />;

  return (
    <div className="container page-shell">
      <div className="section-eyebrow">Your Saved Items</div>
      <h1 className="section-title" style={{ marginBottom: '24px' }}>Wishlist ({items.length})</h1>

      {items.length === 0 ? (
        <div className="empty-state">
          <h3>Your wishlist is empty</h3>
          <p>Tap the ♥ heart icon on any product to save it for later.</p>
          <Link to="/products" className="btn btn-primary">Browse Electronics</Link>
        </div>
      ) : (
        <div className="product-grid">
          {items.map(item => (
            <div key={item.wishlist_item_id} className="product-card">
              <div className="product-card-media">
                <Link to={`/products/${item.product_id}`}>
                  <img src={resolveImageUrl(item.primary_image)} alt={item.name} loading="lazy" onError={e => { e.currentTarget.src = FALLBACK_PRODUCT_IMAGE; }} />
                </Link>
                <button type="button" className="product-wishlist-fab active" onClick={() => removeFromWishlist(item.product_id)} title="Remove from wishlist">
                  <Heart size={16} fill="currentColor" />
                </button>
              </div>
              <div className="product-card-body">
                <div className="product-brand">{item.brand} · {item.category_name}</div>
                <Link to={`/products/${item.product_id}`} className="product-title">{item.name}</Link>
                <div className="product-price-row">
                  <span className="product-price">{formatCurrency(item.price)}</span>
                  {Number(item.original_price) > Number(item.price) && (
                    <span className="product-orig-price">{formatCurrency(item.original_price)}</span>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                  <button type="button" className="btn btn-primary btn-sm" disabled={item.stock_quantity === 0} onClick={() => handleMoveToCart(item.product_id, item.name)}>
                    <ShoppingCart size={14} /> Move to Cart
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeFromWishlist(item.product_id)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
