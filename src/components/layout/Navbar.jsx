import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen]     = useState(false);
  const [dropOpen, setDropOpen]     = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const dropRef = useRef(null);

  /* scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* close mobile menu on route change */
  useEffect(() => { setMenuOpen(false); setDropOpen(false); }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/products', label: 'Products', end: false },
  ].filter(Boolean);

  return (
    <>
      <nav className={`nav2-bar ${scrolled ? 'nav2-scrolled' : ''}`}>
        <div className="nav2-inner">

          {/* ── Brand ── */}
          <Link to="/" className="nav2-brand">
            <span className="nav2-brand-icon">🛍️</span>
            <span className="nav2-brand-text">
              Shop<span className="nav2-brand-accent">Ease</span>
            </span>
          </Link>

          {/* ── Desktop Links ── */}
          <ul className="nav2-links">
            {navLinks.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `nav2-link ${isActive ? 'nav2-link--active' : ''}`
                  }
                >
                  {label}
                  <span className="nav2-link-bar" />
                </NavLink>
              </li>
            ))}
          </ul>

          {/* ── Right actions ── */}
          <div className="nav2-actions">

            {/* Cart */}
            <Link to="/cart" className="nav2-icon-btn" title="Cart">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartCount > 0 && (
                <span className="nav2-cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </Link>

            {isAuthenticated ? (
              /* User dropdown */
              <div className="nav2-drop-wrap" ref={dropRef}>
                <button
                  className="nav2-avatar-btn"
                  onClick={() => setDropOpen((p) => !p)}
                  aria-expanded={dropOpen}
                  title={user?.name}
                >
                  <span className="nav2-avatar">{initials}</span>
                  <svg
                    className={`nav2-chevron ${dropOpen ? 'nav2-chevron--open' : ''}`}
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {dropOpen && (
                  <div className="nav2-dropdown">
                    {/* User info header */}
                    <div className="nav2-drop-header">
                      <div className="nav2-drop-avatar">{initials}</div>
                      <div>
                        <div className="nav2-drop-name">{user?.name}</div>
                        <div className="nav2-drop-email">{user?.email}</div>
                      </div>
                    </div>

                    <div className="nav2-drop-divider" />

                    <Link to="/profile" className="nav2-drop-item">
                      <span>👤</span> My Profile
                    </Link>
                    <Link to="/cart" className="nav2-drop-item">
                      <span>🛒</span> My Cart
                      {cartCount > 0 && (
                        <span className="nav2-drop-badge">{cartCount}</span>
                      )}
                    </Link>



                    <div className="nav2-drop-divider" />
                    <button className="nav2-drop-item nav2-drop-item--danger w-100" onClick={handleLogout}>
                      <span>🚪</span> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Guest buttons */
              <div className="nav2-guest-btns">
                <Link to="/login"    className="nav2-btn nav2-btn--ghost">Login</Link>
                <Link to="/register" className="nav2-btn nav2-btn--solid">Sign Up</Link>
                <Link to="/admin-login" className="nav2-btn" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', borderColor: 'transparent' }}>Admin</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className={`nav2-hamburger ${menuOpen ? 'nav2-hamburger--open' : ''}`}
              onClick={() => setMenuOpen((p) => !p)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <div className={`nav2-mobile ${menuOpen ? 'nav2-mobile--open' : ''}`}>
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav2-mobile-link ${isActive ? 'nav2-mobile-link--active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
          <NavLink to="/cart" className="nav2-mobile-link">
            🛒 Cart {cartCount > 0 && <span className="nav2-drop-badge">{cartCount}</span>}
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/profile" className="nav2-mobile-link">👤 Profile</NavLink>
              <button className="nav2-mobile-link nav2-mobile-link--danger w-100" onClick={handleLogout}>
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login"    className="nav2-mobile-link">Login</NavLink>
              <NavLink to="/register" className="nav2-mobile-link">Sign Up</NavLink>
            </>
          )}
        </div>
      </nav>

      {/* spacer so content doesn't hide under sticky nav */}
      <div style={{ height: '68px' }} />
    </>
  );
}

export default Navbar;
