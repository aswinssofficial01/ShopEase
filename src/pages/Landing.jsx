import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import defaultProducts from '../data/products';
import ProductCard from '../components/products/ProductCard';

/* ── Feature cards data – easy to update ─────────────────────── */
const features = [
  {
    icon: '🚀',
    title: 'Express Delivery',
    desc: 'Get your orders delivered within 24 hours. Lightning-fast shipping to your doorstep.',
    color: '#6c63ff',
    bg: '#6c63ff15',
  },
  {
    icon: '🔐',
    title: 'Secure Payments',
    desc: 'Bank-grade encryption protects every transaction. Pay safely with UPI, cards & more.',
    color: '#10b981',
    bg: '#10b98115',
  },
  {
    icon: '↩️',
    title: '30-Day Returns',
    desc: 'Not satisfied? Return anything within 30 days — no questions asked, full refund.',
    color: '#f59e0b',
    bg: '#f59e0b15',
  },
  {
    icon: '🎁',
    title: 'Exclusive Deals',
    desc: 'Members get early access to flash sales, seasonal discounts & special offers.',
    color: '#ef4444',
    bg: '#ef444415',
  },
];

function Landing() {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('shopease_products_override');
    const list = saved ? JSON.parse(saved) : defaultProducts;
    setFeaturedProducts(list.slice(0, 4));
  }, []);

  return (
    <>
      {/* ═══════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════ */}
      <section className="lp-hero">
        {/* animated blobs */}
        <div className="lp-blob lp-blob-1" />
        <div className="lp-blob lp-blob-2" />

        <Container className="lp-hero-inner">
          <div className="lp-hero-content">
            {/* badge */}
            <div className="lp-hero-badge">
              <span className="lp-badge-dot" />
              New arrivals every week
            </div>

            <h1 className="lp-hero-title">
              Shop Smarter,<br />
              <span className="lp-gradient-text">Live Better</span>
            </h1>

            <p className="lp-hero-sub">
              Discover thousands of premium products at unbeatable prices.
              Fast delivery, easy returns, and secure payments — all in one place.
            </p>

            {/* CTA buttons */}
            <div className="lp-hero-btns">
              <Link to="/products" className="lp-btn lp-btn-primary">
                🛍️ Browse Products
              </Link>
              <Link to="/register" className="lp-btn lp-btn-secondary">
                ✨ Get Started Free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  style={{ marginLeft: 6 }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* trust stats */}
            <div className="lp-stats">
              <div className="lp-stat">
                <span className="lp-stat-num">10K+</span>
                <span className="lp-stat-label">Happy Customers</span>
              </div>
              <div className="lp-stat-div" />
              <div className="lp-stat">
                <span className="lp-stat-num">500+</span>
                <span className="lp-stat-label">Products</span>
              </div>
              <div className="lp-stat-div" />
              <div className="lp-stat">
                <span className="lp-stat-num">4.9★</span>
                <span className="lp-stat-label">Avg Rating</span>
              </div>
            </div>
          </div>

          {/* hero visual */}
          <div className="lp-hero-visual">
            <div className="lp-hero-card lp-hero-card-1">
              <span className="lp-hc-icon">📦</span>
              <div>
                <div className="lp-hc-title">Order Shipped!</div>
                <div className="lp-hc-sub">Arriving in 24 hours</div>
              </div>
            </div>
            <div className="lp-hero-card lp-hero-card-2">
              <span className="lp-hc-icon">🎉</span>
              <div>
                <div className="lp-hc-title">New Deal Unlocked</div>
                <div className="lp-hc-sub">Save up to 40% today</div>
              </div>
            </div>
            <div className="lp-hero-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=600&fit=crop"
                alt="Shopping"
                className="lp-hero-img"
              />
              <div className="lp-hero-img-ring" />
            </div>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES SECTION
      ═══════════════════════════════════════════ */}
      <section className="lp-features">
        <Container>
          <div className="lp-section-head">
            <h2 className="lp-section-title">Why Choose ShopEase?</h2>
            <p className="lp-section-sub">
              We go beyond just selling products — we deliver an experience.
            </p>
          </div>
          <Row className="g-4">
            {features.map((f) => (
              <Col key={f.title} sm={6} lg={3}>
                <div className="lp-feature-card" style={{ '--fc': f.color, '--fb': f.bg }}>
                  <div className="lp-feature-icon">{f.icon}</div>
                  <h5 className="lp-feature-title">{f.title}</h5>
                  <p className="lp-feature-desc">{f.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURED PRODUCTS
      ═══════════════════════════════════════════ */}
      <section className="lp-products">
        <Container>
          <div className="lp-section-head">
            <h2 className="lp-section-title">Featured Products</h2>
            <p className="lp-section-sub">
              Handpicked favourites — quality you can trust.
            </p>
          </div>
          <Row className="g-4 mb-4">
            {featuredProducts.map((product) => (
              <Col key={product.id} sm={6} lg={3}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
          <div className="text-center mt-2">
            <Link to="/products" className="lp-btn lp-btn-outline">
              View All Products →
            </Link>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════════ */}
      <section className="lp-cta">
        <Container>
          <div className="lp-cta-inner">
            <div className="lp-cta-blob" />
            <h2 className="lp-cta-title">Ready to Start Shopping?</h2>
            <p className="lp-cta-sub">
              Join thousands of happy customers. Create your free account in seconds.
            </p>
            <div className="lp-hero-btns" style={{ justifyContent: 'center' }}>
              <Link to="/register" className="lp-btn lp-btn-white">
                ✨ Create Free Account
              </Link>
              <Link to="/products" className="lp-btn lp-btn-outline-white">
                Browse First
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

export default Landing;
