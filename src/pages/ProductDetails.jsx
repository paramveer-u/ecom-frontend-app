import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Trash2, Zap } from 'lucide-react';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import ProductGrid from '../components/ProductGrid';
import Loading from '../components/Loading';
import { FALLBACK_PRODUCT_IMAGE, formatCurrency, formatDate, resolveImageUrl } from '../utils/formatters';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await productService.getProductById(id);
      const prod = res.data;
      setProduct(prod);
      setSelectedImage(prod.images?.[0]?.image_url || '');
      setQuantity(1);
      const revRes = await productService.getReviews(prod.id);
      setReviews(revRes.data || []);
    } catch (err) {
      setError(err.message || 'Product not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <Loading text="Loading product specifications..." />;
  if (error || !product) {
    return (
      <div className="container page-shell">
        <div className="empty-state">
          <h3>Product unavailable</h3>
          <p>{error}</p>
          <Link to="/products" className="btn btn-primary">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const inStock = Number(product.stock_quantity) > 0;
  const wishlisted = isInWishlist(product.id);
  const discount = Math.round(Number(product.discount_percent || 0));

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to add items to your cart', 'info');
      navigate('/login');
      return;
    }
    try {
      await addItem(product.id, quantity);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      showToast('Please sign in to proceed to checkout', 'info');
      navigate('/login');
      return;
    }
    navigate('/checkout', {
      state: {
        buyNowItem: {
          product_id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          original_price: product.original_price,
          quantity,
          primary_image: product.images?.[0]?.image_url || null,
        },
      },
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSubmittingReview(true);
    try {
      await productService.createReview({
        productId: product.id,
        rating: Number(reviewForm.rating),
        title: reviewForm.title,
        comment: reviewForm.comment,
      });
      showToast('Thank you! Your review has been published.', 'success');
      setReviewForm({ rating: 5, title: '', comment: '' });
      await loadProduct();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await productService.deleteReview(reviewId);
      showToast('Review deleted', 'info');
      await loadProduct();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="container page-shell">
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
        <Link to="/">Home</Link> /{' '}
        <Link to={`/products?category=${product.category_slug}`}>{product.category_name}</Link> /{' '}
        <span style={{ color: 'var(--navy-900)', fontWeight: 600 }}>{product.name}</span>
      </div>

      <div className="product-detail-grid">
        <div>
          <div className="gallery-main">
            <img
              src={resolveImageUrl(selectedImage)}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
              }}
            />
          </div>
          {product.images?.length > 1 && (
            <div className="gallery-thumbs">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  className={`gallery-thumb-btn ${selectedImage === img.image_url ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img.image_url)}
                >
                  <img
                    src={resolveImageUrl(img.image_url)}
                    alt={img.alt_text || product.name}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card card-pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="section-eyebrow" style={{ marginBottom: 0 }}>
              {product.brand} · SKU: {product.sku}
            </span>
            {inStock ? (
              <span className={`badge ${product.stock_quantity <= 5 ? 'badge-warning' : 'badge-success'}`}>
                {product.stock_quantity <= 5
                  ? `Low Stock (${product.stock_quantity} left)`
                  : `In Stock (${product.stock_quantity})`}
              </span>
            ) : (
              <span className="badge badge-danger">Out of Stock</span>
            )}
          </div>

          <h1 style={{ fontSize: 'clamp(22px, 2.5vw, 30px)', marginBottom: '10px' }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
            <span className="rating-pill">
              <Star size={16} fill="#E66C3D" color="#E66C3D" />
              {Number(product.rating_avg || 0).toFixed(1)}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {product.rating_count || 0} customer review{product.rating_count === 1 ? '' : 's'}
            </span>
          </div>

          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '8px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'baseline',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 700, color: 'var(--navy-900)' }}>
              {formatCurrency(product.price)}
            </span>
            {Number(product.original_price) > Number(product.price) && (
              <>
                <span style={{ fontSize: '16px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  {formatCurrency(product.original_price)}
                </span>
                {discount > 0 && <span className="badge badge-accent">Save {discount}%</span>}
              </>
            )}
          </div>

          <p style={{ color: 'var(--text-secondary)', marginBottom: '22px' }}>
            {product.description}
          </p>

          {inStock && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Quantity:</span>
              <div className="qty-stepper">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                  disabled={quantity >= product.stock_quantity}
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
              disabled={!inStock}
              onClick={handleAddToCart}
            >
              <ShoppingCart size={18} />
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>

            <button
              type="button"
              className="btn btn-navy btn-lg"
              style={{ flex: 1 }}
              disabled={!inStock}
              onClick={handleBuyNow}
            >
              <Zap size={18} />
              Buy Now
            </button>

            <button
              type="button"
              className="btn btn-outline btn-lg"
              onClick={async () => {
                if (!isAuthenticated) return navigate('/login');
                try {
                  await toggleWishlist(product.id);
                } catch (err) {
                  showToast(err.message, 'error');
                }
              }}
              aria-label="Toggle Wishlist"
            >
              <Heart size={18} fill={wishlisted ? '#E66C3D' : 'none'} color={wishlisted ? '#E66C3D' : 'currentColor'} />
            </button>
          </div>
        </div>
      </div>

      {/* Technical Specifications */}
      {product.specifications?.length > 0 && (
        <section className="card card-pad" style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Technical Specifications</h2>
          <table className="specs-table">
            <tbody>
              {product.specifications.map((spec) => (
                <tr key={spec.id}>
                  <th>{spec.spec_key}</th>
                  <td>{spec.spec_value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Customer Reviews */}
      <section className="card card-pad" style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '18px' }}>
          Customer Reviews ({reviews.length})
        </h2>

        <div className="grid-2" style={{ gap: '28px', alignItems: 'start' }}>
          <div>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>
                No reviews yet. Be the first verified buyer to review this product.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      padding: '14px',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span className="rating-pill">
                        <Star size={14} fill="#E66C3D" color="#E66C3D" /> {rev.rating}/5
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {formatDate(rev.created_at)}
                        </span>
                        {(user?.id === rev.user_id || isAdmin) && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleDeleteReview(rev.id)}
                            title="Delete review"
                          >
                            <Trash2 size={14} color="#B91C1C" />
                          </button>
                        )}
                      </div>
                    </div>
                    {rev.title && (
                      <h4 style={{ fontSize: '15px', marginBottom: '4px' }}>{rev.title}</h4>
                    )}
                    <p style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {rev.comment}
                    </p>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--navy-900)' }}>
                      — {rev.author_name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: '18px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Write a Product Review</h3>
            {!isAuthenticated ? (
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Please <Link to="/login" style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>sign in</Link> to post a review.
              </p>
            ) : (
              <form onSubmit={handleSubmitReview}>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <select
                    className="form-select"
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                  >
                    <option value="5">5 ★ — Outstanding</option>
                    <option value="4">4 ★ — Very Good</option>
                    <option value="3">3 ★ — Average</option>
                    <option value="2">2 ★ — Below Expectations</option>
                    <option value="1">1 ★ — Poor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Headline (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Summarize your experience"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Your Review</label>
                  <textarea
                    rows="3"
                    required
                    minLength={5}
                    className="form-textarea"
                    placeholder="Share build quality, performance, and battery impressions..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-navy" disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {product.relatedProducts?.length > 0 && (
        <section style={{ marginTop: '40px' }}>
          <div className="section-header">
            <div>
              <div className="section-eyebrow">More in {product.category_name}</div>
              <h2 className="section-title">Related Electronics</h2>
            </div>
          </div>
          <ProductGrid products={product.relatedProducts} />
        </section>
      )}
    </div>
  );
}
