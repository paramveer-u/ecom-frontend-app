import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Zap } from 'lucide-react';
import { productService } from '../services/productService';
import { useToast } from '../context/ToastContext';
import ProductGrid from '../components/ProductGrid';
import Loading from '../components/Loading';
import { FALLBACK_PRODUCT_IMAGE, formatCurrency, resolveImageUrl } from '../utils/formatters';

export default function Home() {
  const [data, setData] = useState({
    categories: [],
    featured: [],
    trending: [],
    bestSellers: [],
    offers: [],
    recent: [],
  });
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    let active = true;
    const loadHomeData = async () => {
      try {
        const [catRes, featRes, trendRes, bestRes, offerRes, recentRes] = await Promise.all([
          productService.getCategories(),
          productService.getProducts({ featured: 'true', limit: 4 }),
          productService.getProducts({ trending: 'true', limit: 4 }),
          productService.getProducts({ bestSeller: 'true', limit: 4 }),
          productService.getProducts({ onSale: 'true', sort: 'discount', limit: 4 }),
          productService.getProducts({ sort: 'newest', limit: 4 }),
        ]);
        if (!active) return;
        setData({
          categories: catRes.data || [],
          featured: featRes.data?.products || [],
          trending: trendRes.data?.products || [],
          bestSellers: bestRes.data?.products || [],
          offers: offerRes.data?.products || [],
          recent: recentRes.data?.products || [],
        });
      } catch (err) {
        showToast(err.message || 'Failed to load catalog', 'error');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadHomeData();
    return () => {
      active = false;
    };
  }, [showToast]);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribing(true);
    try {
      const res = await productService.subscribeNewsletter(newsletterEmail);
      showToast(res.message, 'success');
      setNewsletterEmail('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return <Loading text="Loading ElectroMart storefront..." />;
  }

  const heroProduct = data.featured[0] || data.recent[0];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div>
            <div className="hero-kicker">
              <Zap size={14} /> Precision Hardware Store
            </div>
            <h1 className="hero-title">Next-Gen Electronics Built for Work &amp; Play.</h1>
            <p className="hero-desc">
              Explore flagship smartphones, OLED studio laptops, reference headphones, and esports
              gear—backed by live inventory tracking, genuine warranties, and Razorpay verified checkout.
            </p>
            <div className="hero-cta-row">
              <Link to="/products" className="btn btn-primary btn-lg">
                Browse All Electronics <ArrowRight size={17} />
              </Link>
              <Link
                to="/products?featured=true"
                className="btn btn-outline btn-lg"
                style={{ borderColor: 'rgba(255,255,255,0.28)', background: 'transparent', color: '#FFFFFF' }}
              >
                Featured Hardware
              </Link>
            </div>
            <div className="hero-metrics">
              <div className="hero-metric">
                <strong>10+</strong>
                <span>Hardware Categories</span>
              </div>
              <div className="hero-metric">
                <strong>Razorpay</strong>
                <span>HMAC Verified Pay</span>
              </div>
              <div className="hero-metric">
                <strong>Free Ship</strong>
                <span>Orders Above ₹999</span>
              </div>
            </div>
          </div>

          {heroProduct && (
            <div className="hero-showcase-card">
              <img
                src={resolveImageUrl(heroProduct.primary_image)}
                alt={heroProduct.name}
                className="hero-showcase-img"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#FF9C75', fontWeight: 700, textTransform: 'uppercase' }}>
                    Flagship Spotlight · {heroProduct.brand}
                  </div>
                  <h3 style={{ color: '#FFFFFF', fontSize: '18px', marginTop: '4px' }}>
                    {heroProduct.name}
                  </h3>
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>
                      {formatCurrency(heroProduct.price)}
                    </span>
                    {Number(heroProduct.original_price) > Number(heroProduct.price) && (
                      <span style={{ fontSize: '13px', color: '#94A3B8', textDecoration: 'line-through' }}>
                        {formatCurrency(heroProduct.original_price)}
                      </span>
                    )}
                  </div>
                </div>
                <Link to={`/products/${heroProduct.id}`} className="btn btn-primary btn-sm">
                  View Spec
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="container">
        {/* Promotional Banners */}
        <section className="promo-grid" aria-label="Promotional Highlights">
          <div className="promo-card dark">
            <div>
              <span className="badge badge-accent" style={{ marginBottom: '10px' }}>Creator Gear</span>
              <h3>OLED Laptops &amp; 4K Monitors</h3>
              <p style={{ fontSize: '14px', marginTop: '6px' }}>
                Color-calibrated workstations and high-refresh USB-C displays ready to ship.
              </p>
            </div>
            <Link to="/products?category=laptops" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>
              Shop Laptops →
            </Link>
          </div>

          <div className="promo-card">
            <div>
              <span className="badge badge-info" style={{ marginBottom: '10px' }}>Audio Lab</span>
              <h3>Studio ANC Headphones</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Save up to 23% on LDAC lossless wireless headphones and spatial earbuds.
              </p>
            </div>
            <Link to="/products?category=headphones" className="btn btn-navy btn-sm" style={{ alignSelf: 'flex-start' }}>
              Explore Audio →
            </Link>
          </div>

          <div className="promo-card">
            <div>
              <span className="badge badge-success" style={{ marginBottom: '10px' }}>Buyer Protection</span>
              <h3>Verified Stock &amp; Fast Dispatch</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Real-time inventory locking, encrypted Razorpay UPI/Cards, or Cash on Delivery.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--navy-900)', fontWeight: 600 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={15} color="#E66C3D" /> Express Dispatch
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={15} color="#E66C3D" /> Warranty
              </span>
            </div>
          </div>
        </section>

        {/* Product Categories */}
        <section style={{ marginBottom: '48px' }}>
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Departments</div>
              <h2 className="section-title">Shop by Electronics Category</h2>
            </div>
            <Link to="/products" className="btn btn-outline btn-sm">
              View All Products
            </Link>
          </div>
          <div className="category-grid">
            {data.categories.map((cat) => (
              <Link key={cat.id} to={`/products?category=${cat.slug}`} className="category-tile">
                <img
                  src={resolveImageUrl(cat.image_url)}
                  alt={cat.name}
                  className="category-tile-img"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                  }}
                />
                <div>
                  <h4>{cat.name}</h4>
                  <span>{cat.product_count} item{cat.product_count === 1 ? '' : 's'}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section style={{ marginBottom: '48px' }}>
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Curated Picks</div>
              <h2 className="section-title">Featured Hardware</h2>
            </div>
            <Link to="/products?featured=true" className="btn btn-outline btn-sm">
              See All Featured
            </Link>
          </div>
          <ProductGrid products={data.featured} />
        </section>

        {/* Trending Products */}
        <section style={{ marginBottom: '48px' }}>
          <div className="section-header">
            <div>
              <div className="section-eyebrow">In Demand</div>
              <h2 className="section-title">Trending Now</h2>
            </div>
            <Link to="/products?trending=true" className="btn btn-outline btn-sm">
              Explore Trending
            </Link>
          </div>
          <ProductGrid products={data.trending} />
        </section>

        {/* Best-Selling Products */}
        <section style={{ marginBottom: '48px' }}>
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Top Rated &amp; Proven</div>
              <h2 className="section-title">Best-Selling Products</h2>
            </div>
            <Link to="/products?sort=popularity" className="btn btn-outline btn-sm">
              View Best Sellers
            </Link>
          </div>
          <ProductGrid products={data.bestSellers} />
        </section>

        {/* Special Offers */}
        <section style={{ marginBottom: '48px' }}>
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Limited Time Markdowns</div>
              <h2 className="section-title">Special Offers</h2>
            </div>
            <Link to="/products?onSale=true" className="btn btn-outline btn-sm">
              All Offers
            </Link>
          </div>
          <ProductGrid products={data.offers} />
        </section>

        {/* Recently Added Products */}
        <section style={{ marginBottom: '48px' }}>
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Fresh Arrivals</div>
              <h2 className="section-title">Recently Added</h2>
            </div>
            <Link to="/products?sort=newest" className="btn btn-outline btn-sm">
              View Latest
            </Link>
          </div>
          <ProductGrid products={data.recent} />
        </section>

        {/* Newsletter Section */}
        <section className="newsletter-band">
          <div>
            <h3>Stay ahead on hardware drops &amp; restocks.</h3>
            <p>Subscribe for launch alerts, member pricing, and new ElectroMart arrivals.</p>
          </div>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              aria-label="Newsletter email"
            />
            <button type="submit" className="btn btn-primary" disabled={subscribing}>
              {subscribing ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
