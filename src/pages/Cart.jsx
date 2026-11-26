import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import Loading from '../components/Loading';
import { FALLBACK_PRODUCT_IMAGE, formatCurrency, resolveImageUrl } from '../utils/formatters';

export default function Cart() {
  const { items, summary, loading, updateQuantity, removeItem } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  if (loading) return <Loading text="Loading your shopping cart..." />;

  const handleQtyChange = async (itemId, nextQty) => {
    try {
      await updateQuantity(itemId, nextQty);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="container page-shell">
      <div className="section-header">
        <div>
          <div className="section-eyebrow">Your Basket</div>
          <h1 className="section-title">Shopping Cart ({summary.totalItems})</h1>
        </div>
        <Link to="/products" className="btn btn-outline btn-sm">
          Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <h3>Your ElectroMart cart is empty</h3>
          <p>Explore smartphones, laptops, studio audio, and accessories to get started.</p>
          <Link to="/products" className="btn btn-primary">
            Browse Electronics
          </Link>
        </div>
      ) : (
        <div className="two-col-checkout">
          <div className="card card-pad">
            {items.map((item) => (
              <div key={item.item_id} className="cart-item-row">
                <Link to={`/products/${item.product_id}`}>
                  <img
                    src={resolveImageUrl(item.primary_image)}
                    alt={item.name}
                    className="cart-item-img"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                    }}
                  />
                </Link>

                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {item.brand} · {item.category_name}
                  </div>
                  <Link
                    to={`/products/${item.product_id}`}
                    style={{ fontWeight: 700, fontSize: '15px', color: 'var(--navy-900)' }}
                  >
                    {item.name}
                  </Link>
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700 }}>{formatCurrency(item.price)}</span>
                    {Number(item.original_price) > Number(item.price) && (
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        {formatCurrency(item.original_price)}
                      </span>
                    )}
                    {!item.in_stock && (
                      <span className="badge badge-danger">Only {item.stock_quantity} left</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <div className="qty-stepper">
                    <button
                      type="button"
                      onClick={() => handleQtyChange(item.item_id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      disabled={item.quantity >= item.stock_quantity}
                      onClick={() => handleQtyChange(item.item_id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div style={{ minWidth: '88px', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                    {formatCurrency(item.line_total)}
                  </div>

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => removeItem(item.item_id)}
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} color="#B91C1C" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="card card-pad">
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>MRP Subtotal</span>
                <span>{formatCurrency(summary.originalSubtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                <span>Product Discount</span>
                <span>−{formatCurrency(summary.discountSavings)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Delivery Charges</span>
                <span>{summary.deliveryFee === 0 ? 'FREE' : formatCurrency(summary.deliveryFee)}</span>
              </div>
              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '12px',
                  marginTop: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '18px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                }}
              >
                <span>Total</span>
                <span>{formatCurrency(summary.totalAmount)}</span>
              </div>
            </div>

            {summary.deliveryFee > 0 && (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
                Add {formatCurrency(summary.freeDeliveryThreshold - summary.subtotal)} more for free
                express delivery.
              </p>
            )}

            <button
              type="button"
              className="btn btn-primary btn-block btn-lg"
              style={{ marginTop: '18px' }}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout <ArrowRight size={17} />
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
