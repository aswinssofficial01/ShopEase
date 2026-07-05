import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import defaultProducts from '../data/products';

const ORDERS_KEY = 'shopease_orders';
const USERS_KEY  = 'shopease_users';

/* Group orders by user email */
function groupByUser(orders) {
  return orders.reduce((acc, order) => {
    const email = order.user?.email || 'unknown';
    if (!acc[email]) acc[email] = { name: order.user?.name || email, email, orders: [] };
    acc[email].orders.push(order);
    return acc;
  }, {});
}

/* Map status -> colour tokens */
const STATUS_COLORS = {
  'Processing':       { bg: 'rgba(99,102,241,0.15)',  color: '#a5b4fc', border: 'rgba(99,102,241,0.35)' },
  'Confirmed':        { bg: 'rgba(14,165,233,0.15)',  color: '#38bdf8', border: 'rgba(14,165,233,0.35)' },
  'Shipped':          { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24', border: 'rgba(245,158,11,0.35)' },
  'Out for Delivery': { bg: 'rgba(249,115,22,0.15)',  color: '#fb923c', border: 'rgba(249,115,22,0.35)' },
  'Delivered':        { bg: 'rgba(16,185,129,0.15)',  color: '#34d399', border: 'rgba(16,185,129,0.35)' },
  'Cancelled':        { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', border: 'rgba(239,68,68,0.35)'  },
};
function statusColor(status) {
  const t = STATUS_COLORS[status] || STATUS_COLORS['Processing'];
  return { background: t.bg, color: t.color, borderColor: t.border };
}

function AdminPanel() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [users, setUsers]   = useState([]);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({});
  const [tab, setTab]       = useState('orders'); // 'orders' | 'active-users' | 'products'

  useEffect(() => {
    setOrders(JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'));
    setUsers(JSON.parse(localStorage.getItem(USERS_KEY) || '[]'));
    const savedProducts = localStorage.getItem('shopease_products_override');
    setProducts(savedProducts ? JSON.parse(savedProducts) : defaultProducts);
  }, []);

  const grouped = groupByUser(orders);

  /* Filter by search */
  const filteredEmails = Object.keys(grouped).filter((email) =>
    email.toLowerCase().includes(search.toLowerCase()) ||
    grouped[email].name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (email) =>
    setExpanded((prev) => ({ ...prev, [email]: !prev[email] }));

  /* Update an order's status in state + localStorage */
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) => {
      const updated = prev.map((o) =>
        o.id === orderId ? { ...o, status: newStatus } : o
      );
      localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  /* Save (create or update) a product in state + localStorage */
  const handleSaveProduct = (updatedProduct) => {
    let newProducts = [];
    if (products.some(p => p.id === updatedProduct.id)) {
      newProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    } else {
      newProducts = [...products, updatedProduct];
    }
    setProducts(newProducts);
    localStorage.setItem('shopease_products_override', JSON.stringify(newProducts));
    setShowProductModal(false);
    setEditingProduct(null);
  };

  /* Delete a product from state + localStorage */
  const handleDeleteProduct = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const newProducts = products.filter(p => p.id !== productId);
      setProducts(newProducts);
      localStorage.setItem('shopease_products_override', JSON.stringify(newProducts));
    }
  };

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);

  /* Active = logged in within last 30 minutes */
  const ACTIVE_MS = 30 * 60 * 1000;
  const now = Date.now();
  const activeUsers = users.filter((u) => {
    if (!u.lastLogin) return false;
    return now - new Date(u.lastLogin).getTime() < ACTIVE_MS;
  });

  return (
    <div style={S.page}>
      {/* ── Sidebar ── */}
      <aside style={S.sidebar}>
        <div style={S.sideTop}>
          <div style={S.logo}>
            <span style={{ fontSize: '1.4rem' }}>🛍️</span>
            <span style={S.logoText}>ShopEase</span>
          </div>
          <div style={S.adminBadge}>Admin Panel</div>
        </div>

        <nav style={S.nav}>
          <div
            style={{ ...S.navItem, ...(tab === 'orders' ? S.navActive : {}) }}
            onClick={() => setTab('orders')}
          >
            <span>📋</span> User Orders
          </div>
          <div
            style={{ ...S.navItem, ...(tab === 'products' ? S.navActive : {}) }}
            onClick={() => setTab('products')}
          >
            <span>📦</span> Products Catalog
          </div>
          <div
            style={{ ...S.navItem, ...(tab === 'active-users' ? S.navActive : {}) }}
            onClick={() => setTab('active-users')}
          >
            <span>🟢</span> Active Users
            {activeUsers.length > 0 && (
              <span style={S.navBadge}>{activeUsers.length}</span>
            )}
          </div>
        </nav>

        <div style={S.sideBottom}>
          <div style={S.adminInfo}>
            <div style={S.adminAvatar}>
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <div style={{ color: '#f1f5f9', fontSize: '0.85rem', fontWeight: 600 }}>
                {user?.name || 'Admin'}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={logout} style={S.logoutBtn}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={S.main}>
        {/* Header */}
        <div style={S.header}>
          <div>
            <h1 style={S.pageTitle}>
              {tab === 'orders' ? 'User Ordered History' : tab === 'active-users' ? '🟢 Active Users' : '📦 Product Catalog'}
            </h1>
            <p style={S.pageSubtitle}>
              {tab === 'orders'
                ? 'View and manage all orders placed by your customers'
                : tab === 'active-users'
                ? 'Users who logged in within the last 30 minutes'
                : 'Add, edit, or remove products from the store'}
            </p>
          </div>
          <Link to="/" style={S.storeLinkBtn}>← Back to Store</Link>
        </div>

        {/* Stats Row */}
        <div style={S.statsRow}>
          {[
            { label: 'Total Orders',   value: orders.length,       icon: '🛒', color: '#6366f1' },
            { label: 'Total Customers', value: filteredEmails.length, icon: '👥', color: '#0ea5e9' },
            { label: 'Revenue',        value: `₹${totalRevenue.toFixed(2)}`, icon: '💰', color: '#10b981' },
            { label: 'Active Now',     value: activeUsers.length,  icon: '🟢', color: '#22c55e' },
            { label: 'Total Products',  value: products.length,     icon: '📦', color: '#a855f7' },
          ].map((s) => (
            <div key={s.label} style={{ ...S.statCard, borderColor: s.color + '44' }}>
              <div style={{ ...S.statIcon, background: s.color + '22', color: s.color }}>
                {s.icon}
              </div>
              <div>
                <div style={{ ...S.statValue, color: s.color }}>{s.value}</div>
                <div style={S.statLabel}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search — only on orders tab */}
        {tab === 'orders' && (
          <div style={S.searchWrap}>
            <span style={S.searchIcon}>🔍</span>
            <input
              style={S.searchInput}
              placeholder="Search by customer name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* ── PRODUCTS CATALOG TAB ── */}
        {tab === 'products' && (
          <div>
            <div style={S.tabHeaderRow}>
              <h2 style={{color: '#f1f5f9', margin: 0, fontSize: '1.25rem', fontWeight: 700}}>Product Catalog</h2>
              <button
                id="addProductBtn"
                style={S.addProductBtn}
                onClick={() => {
                  setEditingProduct({
                    id: Date.now(),
                    name: '',
                    price: '',
                    category: '',
                    image: '',
                    description: '',
                    rating: 5.0,
                    stock: 10,
                  });
                  setShowProductModal(true);
                }}
              >
                ➕ Add Product
              </button>
            </div>
            
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    {['Product', 'Category', 'Price', 'Stock', 'Rating', 'Actions'].map((h) => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} style={S.tr}>
                      <td style={S.td}>
                        <div style={S.productInfoCell}>
                          <img src={product.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100&h=100&fit=crop'} alt={product.name} style={S.productThumb} />
                          <div>
                            <div style={S.productNameText}>{product.name || 'Unnamed Product'}</div>
                            <div style={S.productDescText}>{product.description ? product.description.substring(0, 60) + (product.description.length > 60 ? '...' : '') : 'No description'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={S.td}>
                        <span style={S.categoryBadge}>{product.category || 'Uncategorized'}</span>
                      </td>
                      <td style={S.td}>
                        <span style={S.priceText}>₹{Number(product.price || 0).toFixed(2)}</span>
                      </td>
                      <td style={S.td}>
                        <span style={{
                          ...S.stockText,
                          color: product.stock < 5 ? '#f87171' : product.stock < 15 ? '#fb923c' : '#34d399'
                        }}>
                          {product.stock} left
                        </span>
                      </td>
                      <td style={S.td}>⭐ {product.rating || 'N/A'}</td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="editProductBtn"
                            style={S.editBtn}
                            onClick={() => {
                              setEditingProduct({ ...product });
                              setShowProductModal(true);
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="deleteProductBtn"
                            style={S.deleteBtn}
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ACTIVE USERS TAB ── */}
        {tab === 'active-users' && (
          <>
            {activeUsers.length === 0 ? (
              <div style={S.empty}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💤</div>
                <p style={{ color: '#64748b', fontWeight: 600 }}>No active users right now.</p>
                <p style={{ color: '#475569', fontSize: '0.85rem' }}>Active users are those who logged in within the last 30 minutes.</p>
              </div>
            ) : (
              <div style={S.auGrid}>
                {activeUsers.map((u) => {
                  const minsAgo = Math.floor((now - new Date(u.lastLogin).getTime()) / 60000);
                  const userOrders = orders.filter((o) => o.user?.email === u.email);
                  return (
                    <div key={u.id} style={S.auCard}>
                      <div style={S.auTop}>
                        <div style={S.auAvatar}>{u.name?.charAt(0).toUpperCase() || '?'}</div>
                        <div style={S.auDot} title="Active" />
                      </div>
                      <div style={S.auName}>{u.name}</div>
                      <div style={S.auEmail}>{u.email}</div>
                      <div style={S.auMeta}>
                        <span style={S.auMetaItem}>
                          <span style={{ color: '#22c55e' }}>●</span> {minsAgo === 0 ? 'Just now' : `${minsAgo}m ago`}
                        </span>
                        <span style={S.auMetaItem}>
                          🛒 {userOrders.length} order{userOrders.length !== 1 ? 's' : ''}
                        </span>
                        <span style={{ ...S.auRole, ...(u.role === 'admin' ? S.auRoleAdmin : S.auRoleUser) }}>
                          {u.role || 'user'}
                        </span>
                      </div>
                      <div style={S.auLastLogin}>
                        Last login: {new Date(u.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          <>
        {/* User Order List */}
        {filteredEmails.length === 0 ? (
          <div style={S.empty}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📭</div>
            <p style={{ color: '#64748b' }}>No orders found.</p>
          </div>
        ) : (
          filteredEmails.map((email) => {
            const group = grouped[email];
            const isOpen = expanded[email];
            const userTotal = group.orders.reduce((s, o) => s + Number(o.total || 0), 0);
            return (
              <div key={email} style={S.userCard}>
                {/* User header / toggle */}
                <div style={S.userHeader} onClick={() => toggle(email)}>
                  <div style={S.userLeft}>
                    <div style={S.avatar}>{group.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div style={S.userName}>{group.name}</div>
                      <div style={S.userEmail}>{email}</div>
                    </div>
                  </div>
                  <div style={S.userRight}>
                    <span style={S.badge}>{group.orders.length} order{group.orders.length !== 1 ? 's' : ''}</span>
                    <span style={S.revenue}>₹{userTotal.toFixed(2)}</span>
                    <span style={{ color: '#64748b', fontSize: '1.1rem' }}>
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Orders table */}
                {isOpen && (
                  <div style={S.tableWrap}>
                    <table style={S.table}>
                      <thead>
                        <tr>
                          {['Order ID', 'Products Ordered', 'Total', 'Payment Method', 'Date', 'Status'].map((h) => (
                            <th key={h} style={S.th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {group.orders.map((order, idx) => (
                          <tr key={idx} style={S.tr}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99,102,241,0.06)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={S.td}>
                              <span style={S.orderId}>#{(order.id || idx + 1).toString().slice(-6).toUpperCase()}</span>
                            </td>
                            <td style={S.td}>
                              {order.items?.map((item, i) => (
                                <div key={i} style={S.itemRow}>
                                  <span style={S.qty}>{item.quantity}×</span>
                                  <span style={S.itemName}>{item.name}</span>
                                </div>
                              )) || <span style={{ color: '#64748b' }}>—</span>}
                            </td>
                            <td style={S.td}>
                              <span style={S.totalAmt}>₹{Number(order.total || 0).toFixed(2)}</span>
                            </td>
                            <td style={S.td}>
                              <span style={S.payment}>{order.paymentMethod || 'Credit Card'}</span>
                            </td>
                            <td style={S.td}>
                              <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                                {new Date(order.createdAt).toLocaleString()}
                              </span>
                            </td>
                            <td style={S.td}>
                              <select
                                value={order.status || 'Processing'}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                style={{
                                  ...S.statusSelect,
                                  ...statusColor(order.status || 'Processing'),
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
          </>
        )}
        {showProductModal && editingProduct && (
          <div style={S.modalOverlay}>
            <div style={S.modalCard}>
              <div style={S.modalHeader}>
                <h3 style={S.modalTitle}>{products.some(p => p.id === editingProduct.id) ? '✏️ Edit Product' : '➕ Add Product'}</h3>
                <button style={S.modalClose} onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                }}>✕</button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveProduct(editingProduct);
                }}
                style={S.modalForm}
              >
                <div style={S.formGroup}>
                  <label style={S.formLabel}>Product Name</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    style={S.formInput}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ ...S.formGroup, flex: 1 }}>
                    <label style={S.formLabel}>Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})}
                      style={S.formInput}
                    />
                  </div>
                  <div style={{ ...S.formGroup, flex: 1 }}>
                    <label style={S.formLabel}>Category</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                      style={S.formInput}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ ...S.formGroup, flex: 1 }}>
                    <label style={S.formLabel}>Stock</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})}
                      style={S.formInput}
                    />
                  </div>
                  <div style={{ ...S.formGroup, flex: 1 }}>
                    <label style={S.formLabel}>Rating (0-5)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      required
                      value={editingProduct.rating}
                      onChange={(e) => setEditingProduct({...editingProduct, rating: parseFloat(e.target.value) || 0})}
                      style={S.formInput}
                    />
                  </div>
                </div>

                <div style={S.formGroup}>
                  <label style={S.formLabel}>Image URL</label>
                  <input
                    type="url"
                    required
                    value={editingProduct.image}
                    onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                    style={S.formInput}
                  />
                </div>

                <div style={S.formGroup}>
                  <label style={S.formLabel}>Description</label>
                  <textarea
                    required
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                    style={S.formTextarea}
                  />
                </div>

                <div style={S.modalActions}>
                  <button type="button" style={S.cancelBtn} onClick={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                  }}>
                    Cancel
                  </button>
                  <button type="submit" style={S.saveBtn}>
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Styles ── */
const S = {
  page: {
    display: 'flex', minHeight: '100vh',
    background: '#0f172a', fontFamily: "'Inter', sans-serif",
  },
  /* Sidebar */
  sidebar: {
    width: '240px', minHeight: '100vh', flexShrink: 0,
    background: 'rgba(15,23,42,0.95)',
    borderRight: '1px solid rgba(99,102,241,0.15)',
    display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem',
    position: 'sticky', top: 0, height: '100vh',
  },
  sideTop: { marginBottom: '2rem' },
  logo: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' },
  logoText: { color: '#f1f5f9', fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' },
  adminBadge: {
    background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
    border: '1px solid rgba(99,102,241,0.3)',
    color: '#a5b4fc', borderRadius: '6px', padding: '0.3rem 0.7rem',
    fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
    display: 'inline-block',
  },
  nav: { flex: 1 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '0.7rem',
    padding: '0.7rem 0.9rem', borderRadius: '10px',
    color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer',
    transition: 'all 0.2s', userSelect: 'none',
  },
  navActive: {
    background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))',
    color: '#a5b4fc', fontWeight: 600,
    border: '1px solid rgba(99,102,241,0.3)',
  },
  navBadge: {
    marginLeft: 'auto', background: '#22c55e',
    color: '#fff', borderRadius: '20px', padding: '0.1rem 0.5rem',
    fontSize: '0.7rem', fontWeight: 700,
  },
  sideBottom: { borderTop: '1px solid rgba(99,102,241,0.1)', paddingTop: '1rem' },
  adminInfo: { display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.8rem' },
  adminAvatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
  },
  logoutBtn: {
    width: '100%', padding: '0.5rem', background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px',
    color: '#f87171', fontSize: '0.85rem', cursor: 'pointer',
    fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
  },
  /* Main */
  main: { flex: 1, padding: '2rem', overflowY: 'auto' },
  header: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem',
  },
  pageTitle: { color: '#f1f5f9', fontSize: '1.75rem', fontWeight: 800, margin: 0 },
  pageSubtitle: { color: '#64748b', marginTop: '0.25rem', fontSize: '0.9rem' },
  storeLinkBtn: {
    background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
    color: '#a5b4fc', borderRadius: '8px', padding: '0.5rem 1rem',
    fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600,
    transition: 'all 0.2s',
  },
  /* Stats */
  statsRow: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  statCard: {
    flex: 1, minWidth: '160px', background: 'rgba(15,23,42,0.8)',
    border: '1px solid', borderRadius: '14px', padding: '1.2rem',
    display: 'flex', alignItems: 'center', gap: '1rem',
    backdropFilter: 'blur(10px)',
  },
  statIcon: {
    width: '46px', height: '46px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.3rem', flexShrink: 0,
  },
  statValue: { fontSize: '1.4rem', fontWeight: 800, lineHeight: 1 },
  statLabel: { color: '#64748b', fontSize: '0.78rem', marginTop: '0.2rem' },
  /* Search */
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: '0.7rem',
    background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '12px', padding: '0.7rem 1rem', marginBottom: '1.5rem',
  },
  searchIcon: { fontSize: '1rem', color: '#64748b' },
  searchInput: {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    color: '#f1f5f9', fontSize: '0.9rem', fontFamily: "'Inter', sans-serif",
  },
  empty: {
    textAlign: 'center', padding: '4rem 1rem',
    background: 'rgba(15,23,42,0.6)', borderRadius: '16px',
    border: '1px solid rgba(99,102,241,0.1)',
  },
  /* Active Users grid */
  auGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
  },
  auCard: {
    background: 'rgba(15,23,42,0.85)',
    border: '1px solid rgba(34,197,94,0.25)',
    borderRadius: '16px', padding: '1.5rem 1.2rem',
    backdropFilter: 'blur(10px)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 0 20px rgba(34,197,94,0.05)',
  },
  auTop: { position: 'relative', display: 'inline-block', marginBottom: '0.8rem' },
  auAvatar: {
    width: '54px', height: '54px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '1.3rem',
  },
  auDot: {
    position: 'absolute', bottom: '2px', right: '2px',
    width: '13px', height: '13px', borderRadius: '50%',
    background: '#22c55e', border: '2px solid #0f172a',
    boxShadow: '0 0 6px #22c55e',
  },
  auName: { color: '#f1f5f9', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.15rem' },
  auEmail: { color: '#64748b', fontSize: '0.78rem', marginBottom: '0.8rem', wordBreak: 'break-all' },
  auMeta: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.8rem' },
  auMetaItem: {
    background: 'rgba(99,102,241,0.1)', color: '#94a3b8',
    borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.75rem',
    display: 'flex', alignItems: 'center', gap: '0.3rem',
  },
  auRole: { borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.73rem', fontWeight: 700 },
  auRoleAdmin: { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' },
  auRoleUser: { background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' },
  auLastLogin: { color: '#475569', fontSize: '0.75rem' },
  /* User card */
  userCard: {
    background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.15)',
    borderRadius: '14px', marginBottom: '1rem', overflow: 'hidden',
    backdropFilter: 'blur(10px)',
  },
  userHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 1.2rem', cursor: 'pointer',
    transition: 'background 0.2s',
  },
  userLeft: { display: 'flex', alignItems: 'center', gap: '0.9rem' },
  avatar: {
    width: '42px', height: '42px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '1rem', flexShrink: 0,
  },
  userName: { color: '#f1f5f9', fontWeight: 700, fontSize: '0.95rem' },
  userEmail: { color: '#64748b', fontSize: '0.8rem' },
  userRight: { display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 },
  badge: {
    background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)',
    color: '#a5b4fc', borderRadius: '20px', padding: '0.25rem 0.75rem',
    fontSize: '0.78rem', fontWeight: 600,
  },
  revenue: { color: '#10b981', fontWeight: 700, fontSize: '0.95rem' },
  /* Table */
  tableWrap: { overflowX: 'auto', borderTop: '1px solid rgba(99,102,241,0.1)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '0.7rem 1rem', color: '#64748b', fontWeight: 600,
    fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em',
    textAlign: 'left', background: 'rgba(15,23,42,0.6)', borderBottom: '1px solid rgba(99,102,241,0.1)',
  },
  tr: { transition: 'background 0.15s' },
  td: { padding: '0.8rem 1rem', borderBottom: '1px solid rgba(99,102,241,0.07)', verticalAlign: 'top' },
  orderId: { color: '#94a3b8', fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 600 },
  itemRow: { display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' },
  qty: { color: '#6366f1', fontWeight: 700, fontSize: '0.82rem' },
  itemName: { color: '#e2e8f0', fontSize: '0.85rem' },
  totalAmt: { color: '#10b981', fontWeight: 700, fontSize: '0.95rem' },
  payment: {
    background: 'rgba(14,165,233,0.15)', color: '#38bdf8',
    borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.78rem', fontWeight: 600,
  },
  statusSelect: {
    border: '1px solid',
    borderRadius: '6px', padding: '0.25rem 0.6rem',
    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    outline: 'none', appearance: 'none',
    paddingRight: '1.6rem',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.4rem center',
    transition: 'all 0.2s',
  },
  statusBadge: {
    background: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
    borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.78rem', fontWeight: 600,
    border: '1px solid rgba(99,102,241,0.3)',
  },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 999,
  },
  modalCard: {
    background: '#1e293b', border: '1px solid rgba(99,102,241,0.25)',
    borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '500px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderBottom: '1px solid rgba(99,102,241,0.1)', paddingBottom: '1rem',
    marginBottom: '1.5rem',
  },
  modalTitle: { color: '#f1f5f9', margin: 0, fontSize: '1.25rem', fontWeight: 700 },
  modalClose: {
    background: 'transparent', border: 'none', color: '#94a3b8',
    fontSize: '1.2rem', cursor: 'pointer', outline: 'none',
  },
  modalForm: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  formLabel: { color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' },
  formInput: {
    background: 'rgba(15,23,42,0.6)', border: '1px solid #334155',
    borderRadius: '8px', padding: '0.6rem 0.8rem', color: '#f1f5f9',
    fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
  },
  formTextarea: {
    background: 'rgba(15,23,42,0.6)', border: '1px solid #334155',
    borderRadius: '8px', padding: '0.6rem 0.8rem', color: '#f1f5f9',
    fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
    resize: 'vertical', minHeight: '80px',
  },
  modalActions: {
    display: 'flex', gap: '1rem', justifyContent: 'flex-end',
    borderTop: '1px solid rgba(99,102,241,0.1)', paddingTop: '1.2rem',
    marginTop: '1.2rem',
  },
  cancelBtn: {
    background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.2)',
    color: '#cbd5e1', borderRadius: '8px', padding: '0.5rem 1.2rem',
    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
  },
  saveBtn: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none',
    color: '#fff', borderRadius: '8px', padding: '0.5rem 1.2rem',
    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
  },
  tabHeaderRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '1rem',
  },
  addProductBtn: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none',
    color: '#fff', borderRadius: '8px', padding: '0.5rem 1rem',
    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
  },
  productInfoCell: { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  productThumb: { width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' },
  productNameText: { color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem' },
  productDescText: { color: '#64748b', fontSize: '0.75rem', marginTop: '0.15rem' },
  categoryBadge: {
    background: 'rgba(99,102,241,0.1)', color: '#a5b4fc',
    borderRadius: '12px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 600,
  },
  priceText: { color: '#10b981', fontWeight: 700, fontSize: '0.9rem' },
  stockText: { fontWeight: 600, fontSize: '0.82rem' },
  editBtn: {
    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
    color: '#a5b4fc', borderRadius: '6px', padding: '0.35rem 0.7rem',
    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
  },
  deleteBtn: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    color: '#f87171', borderRadius: '6px', padding: '0.35rem 0.7rem',
    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
  },
};

export default AdminPanel;
