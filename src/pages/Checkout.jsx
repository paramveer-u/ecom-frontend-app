import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import Loading from '../components/Loading';
import { FALLBACK_PRODUCT_IMAGE, formatCurrency, resolveImageUrl } from '../utils/formatters';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items: cartItems, summary, fetchCart } = useCart();
  const { showToast } = useToast();

  const buyNowItem = location.state?.buyNowItem || null;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [sandboxPayment, setSandboxPayment] = useState(null);
  const [sandboxProcessing, setSandboxProcessing] = useState(false);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrForm, setAddrForm] = useState({
    fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India', addressType: 'HOME', isDefault: false
  });

  const checkoutItems = buyNowItem
    ? [{ ...buyNowItem, line_total: Number(buyNowItem.price) * Number(buyNowItem.quantity) }]
    : cartItems;

  const checkoutSubtotal = checkoutItems.reduce((s, i) => s + Number(i.line_total || (Number(i.price || i.unit_price) * i.quantity)), 0);
  const deliveryFee = buyNowItem ? (checkoutSubtotal >= 999 ? 0 : 99) : summary.deliveryFee;
  const totalAmount = checkoutSubtotal + deliveryFee;

  useEffect(() => {
    setLoading(true);
    orderService.getAddresses()
      .then(res => {
        const addrs = res.data || [];
        setAddresses(addrs);
        const def = addrs.find(a => a.is_default);
        if (def) setSelectedAddressId(String(def.id));
        else if (addrs.length > 0) setSelectedAddressId(String(addrs[0].id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await orderService.createAddress(addrForm);
      const newAddr = res.data;
      setAddresses(prev => [...prev, newAddr]);
      setSelectedAddressId(String(newAddr.id));
      setShowAddressForm(false);
      showToast('Address added', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const initiateRazorpay = async (orderId, rzpPayload) => {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error('Razorpay SDK not loaded. Check internet connection.'));
        return;
      }
      const options = {
        key: rzpPayload.keyId,
        amount: rzpPayload.amount,
        currency: rzpPayload.currency,
        name: 'ElectroMart',
        description: `Order #${rzpPayload.orderNumber}`,
        order_id: rzpPayload.razorpayOrderId,
        handler: async function (response) {
          try {
            const verRes = await paymentService.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            resolve({ verified: true, data: verRes.data });
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: async function () {
            await paymentService.recordPaymentFailure({ razorpay_order_id: rzpPayload.razorpayOrderId }).catch(() => {});
            reject(new Error('Payment cancelled by user.'));
          }
        },
        theme: { color: '#17243B' },
        prefill: {}
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async (response) => {
        await paymentService.recordPaymentFailure({
          razorpay_order_id: rzpPayload.razorpayOrderId,
          razorpay_payment_id: response.error?.metadata?.payment_id || null,
        }).catch(() => {});
        reject(new Error(response.error?.description || 'Payment failed.'));
      });
      rzp.open();
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showToast('Please select or add a delivery address.', 'error');
      return;
    }
    if (checkoutItems.length === 0) {
      showToast('Your cart is empty.', 'error');
      return;
    }

    setPlacing(true);
    try {
      const orderPayload = {
        addressId: Number(selectedAddressId),
        paymentMethod,
      };
      if (buyNowItem) {
        orderPayload.items = [{ productId: buyNowItem.product_id, quantity: buyNowItem.quantity }];
      }

      if (paymentMethod === 'COD') {
        const res = await orderService.createOrder(orderPayload);
        await fetchCart();
        navigate('/order-success', { state: { order: res.data } });
      } else {
        // Create pending order then Razorpay order
        const orderRes = await orderService.createOrder(orderPayload);
        const pendingOrderId = orderRes.data.orderId;

        const rzpRes = await paymentService.createRazorpayOrder({ orderId: pendingOrderId });
        if (rzpRes.data?.simulated) {
          setSandboxPayment({
            orderData: orderRes.data,
            rzpPayload: rzpRes.data,
          });
          return;
        }

        const result = await initiateRazorpay(pendingOrderId, rzpRes.data);

        await fetchCart();
        navigate('/order-success', { state: { order: { ...orderRes.data, payment: result.data } } });
      }
    } catch (err) {
      showToast(err.message || 'Failed to place order.', 'error');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <Loading text="Preparing checkout..." />;

  return (
    <div className="container page-shell">
      <div className="section-eyebrow">Secure Checkout</div>
      <h1 className="section-title" style={{ marginBottom: '24px' }}>Review &amp; Place Order</h1>

      <div className="two-col-checkout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Delivery Address */}
          <div className="card card-pad">
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Delivery Address</h2>
            {addresses.length === 0 && !showAddressForm && (
              <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>No saved addresses. Add one below.</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              {addresses.map(addr => (
                <label key={addr.id} style={{ display: 'flex', gap: '12px', padding: '12px', border: `2px solid ${String(selectedAddressId) === String(addr.id) ? 'var(--accent-orange)' : 'var(--border-subtle)'}`, borderRadius: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="address" value={addr.id} checked={String(selectedAddressId) === String(addr.id)} onChange={() => setSelectedAddressId(String(addr.id))} />
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '2px' }}>{addr.full_name} · {addr.phone}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}, {addr.city}, {addr.state} - {addr.postal_code}
                    </div>
                    <span className="badge badge-neutral" style={{ marginTop: '4px' }}>{addr.address_type}</span>
                  </div>
                </label>
              ))}
            </div>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAddressForm(p => !p)}>
              {showAddressForm ? '− Cancel' : '+ Add New Address'}
            </button>
            {showAddressForm && (
              <form onSubmit={handleAddAddress} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Full Name</label><input required className="form-input" value={addrForm.fullName} onChange={e => setAddrForm({ ...addrForm, fullName: e.target.value })} /></div>
                  <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Phone</label><input required className="form-input" value={addrForm.phone} onChange={e => setAddrForm({ ...addrForm, phone: e.target.value })} /></div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Address Line 1</label><input required className="form-input" value={addrForm.addressLine1} onChange={e => setAddrForm({ ...addrForm, addressLine1: e.target.value })} /></div>
                <div className="grid-3">
                  <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">City</label><input required className="form-input" value={addrForm.city} onChange={e => setAddrForm({ ...addrForm, city: e.target.value })} /></div>
                  <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">State</label><input required className="form-input" value={addrForm.state} onChange={e => setAddrForm({ ...addrForm, state: e.target.value })} /></div>
                  <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">PIN Code</label><input required className="form-input" value={addrForm.postalCode} onChange={e => setAddrForm({ ...addrForm, postalCode: e.target.value })} /></div>
                </div>
                <button type="submit" className="btn btn-navy btn-sm" style={{ alignSelf: 'flex-start' }}>Save Address</button>
              </form>
            )}
          </div>

          {/* Payment Method */}
          <div className="card card-pad">
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Payment Method</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', gap: '12px', padding: '14px', border: `2px solid ${paymentMethod === 'RAZORPAY' ? 'var(--accent-orange)' : 'var(--border-subtle)'}`, borderRadius: '8px', cursor: 'pointer' }}>
                <input type="radio" name="payment" value="RAZORPAY" checked={paymentMethod === 'RAZORPAY'} onChange={() => setPaymentMethod('RAZORPAY')} />
                <div>
                  <div style={{ fontWeight: 700 }}>💳 Razorpay Secure Payment</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>UPI, Credit/Debit Cards, Net Banking, Wallets — HMAC SHA256 verified</div>
                </div>
              </label>
              <label style={{ display: 'flex', gap: '12px', padding: '14px', border: `2px solid ${paymentMethod === 'COD' ? 'var(--accent-orange)' : 'var(--border-subtle)'}`, borderRadius: '8px', cursor: 'pointer' }}>
                <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                <div>
                  <div style={{ fontWeight: 700 }}>🏠 Cash on Delivery</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Pay in cash when your order arrives. No extra charges.</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <aside className="card card-pad">
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Order Items ({checkoutItems.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {checkoutItems.map((item, i) => (
              <div key={item.item_id || item.product_id || i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <img
                  src={resolveImageUrl(item.primary_image || item.product_image)}
                  alt={item.name || item.product_name}
                  style={{ width: '52px', height: '44px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-subtle)', flexShrink: 0 }}
                  onError={e => { e.currentTarget.src = FALLBACK_PRODUCT_IMAGE; }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name || item.product_name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>{formatCurrency(item.line_total || (Number(item.price || item.unit_price) * item.quantity))}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Subtotal</span><span>{formatCurrency(checkoutSubtotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Delivery</span><span>{deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-display)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '4px' }}><span>Total Payable</span><span>{formatCurrency(totalAmount)}</span></div>
          </div>
          <button type="button" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '18px' }} onClick={handlePlaceOrder} disabled={placing}>
            {placing ? 'Processing...' : paymentMethod === 'COD' ? '🏠 Confirm COD Order' : '💳 Pay Now with Razorpay'}
          </button>
        </aside>
      </div>

      {/* Razorpay Sandbox Modal (used when real Razorpay keys are not set in backend/.env) */}
      {sandboxPayment && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(23, 36, 59, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div className="card card-pad" style={{ maxWidth: '420px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="badge badge-warning">Razorpay Test Sandbox</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Order #{sandboxPayment.rzpPayload.orderNumber}</span>
            </div>
            <h2 style={{ fontSize: '20px', marginBottom: '6px' }}>Complete Test Payment</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Simulated Razorpay checkout is active in development mode. Confirming will mark the order paid and deduct stock in MySQL.
            </p>
            <div style={{ background: '#F7F8FA', padding: '14px', borderRadius: '8px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Payable Amount</span>
              <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--primary-navy)' }}>
                {formatCurrency(sandboxPayment.rzpPayload.amount / 100)}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-primary btn-block"
                disabled={sandboxProcessing}
                onClick={async () => {
                  setSandboxProcessing(true);
                  try {
                    const simRes = await paymentService.simulateRazorpayPayment({
                      razorpay_order_id: sandboxPayment.rzpPayload.razorpayOrderId,
                    });
                    await fetchCart();
                    const orderData = sandboxPayment.orderData;
                    setSandboxPayment(null);
                    navigate('/order-success', { state: { order: { ...orderData, payment: simRes.data } } });
                  } catch (err) {
                    showToast(err.message || 'Payment simulation failed.', 'error');
                  } finally {
                    setSandboxProcessing(false);
                  }
                }}
              >
                {sandboxProcessing ? 'Verifying Payment...' : '✓ Simulate Successful Payment'}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-block"
                disabled={sandboxProcessing}
                onClick={async () => {
                  await paymentService.recordPaymentFailure({
                    razorpay_order_id: sandboxPayment.rzpPayload.razorpayOrderId,
                  }).catch(() => {});
                  setSandboxPayment(null);
                  showToast('Payment cancelled.', 'error');
                }}
              >
                Cancel Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
