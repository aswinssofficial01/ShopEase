import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Table, Button, Form,
  Modal, Badge, Alert, ProgressBar,
} from 'react-bootstrap';
import productsData from '../data/products';
import { useAuth } from '../context/AuthContext';

/* ─── storage keys ─────────────────────────────────────────────── */
const KEY_PRODUCTS = 'shopease_products_override';
const KEY_USERS    = 'shopease_users';
const KEY_ORDERS   = 'shopease_orders';

const getInitialProducts = () => {
  const saved = localStorage.getItem(KEY_PRODUCTS);
  return saved ? JSON.parse(saved) : productsData;
};

/* ─── mini stat card ────────────────────────────────────────────── */
function StatCard({ icon, label, value, color, sub }) {
  return (
    <Card className="owner-stat-card border-0 h-100">
      <Card.Body className="d-flex align-items-center gap-3 p-3">
        <div className="owner-stat-icon" style={{ background: color + '22', color }}>
          {icon}
        </div>
        <div className="overflow-hidden">
          <div className="fw-bold fs-4" style={{ color }}>{value}</div>
          <div className="text-muted small text-truncate">{label}</div>
          {sub && <div className="text-muted" style={{ fontSize: '0.7rem' }}>{sub}</div>}
        </div>
      </Card.Body>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
function Owner() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  /* redirect if not admin */
  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true });
    else if (!isAdmin)    navigate('/', { replace: true });
  }, [isAuthenticated, isAdmin, navigate]);

  /* ── sidebar tab ─────────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState('products');

  /* ── products ────────────────────────────────────────────────── */
  const [products, setProducts]         = useState(getInitialProducts);
  const [editProduct, setEditProduct]   = useState(null);
  const [showProdModal, setShowProdModal] = useState(false);
  const [isNew, setIsNew]               = useState(false);
  const [toast, setToast]               = useState('');

  /* ── users & orders ──────────────────────────────────────────── */
  const [users, setUsers]   = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    setUsers(JSON.parse(localStorage.getItem(KEY_USERS)  || '[]'));
    setOrders(JSON.parse(localStorage.getItem(KEY_ORDERS) || '[]'));
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY_PRODUCTS, JSON.stringify(products));
  }, [products]);

  /* ── helpers ─────────────────────────────────────────────────── */
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const openEdit = (p) => { setEditProduct({ ...p }); setIsNew(false); setShowProdModal(true); };
  const openNew  = () => {
    setEditProduct({ id: Date.now(), name: '', category: '', price: 0, stock: 0, rating: 4.0, image: '', description: '' });
    setIsNew(true);
    setShowProdModal(true);
  };
  const closeModal = () => { setEditProduct(null); setShowProdModal(false); };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditProduct((p) => ({ ...p, [name]: value }));
  };
  const saveProduct = () => {
    if (!editProduct) return;
    const formattedProduct = {
      ...editProduct,
      price: Number(editProduct.price || 0),
      stock: Number(editProduct.stock || 0),
      rating: Number(editProduct.rating || 0),
    };
    if (isNew) {
      setProducts((prev) => [...prev, formattedProduct]);
      showToast(`✅ "${formattedProduct.name}" added!`);
    } else {
      setProducts((prev) => prev.map((p) => (p.id === formattedProduct.id ? formattedProduct : p)));
      showToast(`✅ "${formattedProduct.name}" updated!`);
    }
    closeModal();
  };
  const deleteProduct = (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast(`🗑️ "${name}" deleted.`);
  };

  /* ── computed stats ──────────────────────────────────────────── */
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const lowStock     = products.filter((p) => Number(p.stock) < 10).length;
  const categories   = [...new Set(products.map((p) => p.category))];

  /* ── SIDEBAR MENU ────────────────────────────────────────────── */
  const menuItems = [
    { key: 'products',  icon: '📦', label: 'Products'  },
  ];

  /* ══════════════════════════════════════════════════════════════
     SECTION: Dashboard overview
  ══════════════════════════════════════════════════════════════ */
  const renderDashboard = () => (
    <>
      <h5 className="owner-section-title">📊 Overview</h5>
      <Row className="g-3 mb-4">
        <Col xs={6} xl={3}>
          <StatCard icon="📦" label="Total Products" value={products.length} color="#4e73df" />
        </Col>
        <Col xs={6} xl={3}>
          <StatCard icon="👥" label="Registered Users" value={users.length} color="#1cc88a" />
        </Col>
        <Col xs={6} xl={3}>
          <StatCard icon="🛒" label="Total Orders" value={orders.length} color="#f6c23e" />
        </Col>
        <Col xs={6} xl={3}>
          <StatCard icon="💰" label="Revenue" value={`₹${totalRevenue.toFixed(0)}`} color="#e74a3b"
            sub={`${orders.length} orders`} />
        </Col>
      </Row>

      {/* Category breakdown */}
      <Row className="g-3 mb-4">
        <Col lg={7}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-3">
              <h6 className="fw-bold mb-0">📂 Products by Category</h6>
            </Card.Header>
            <Card.Body>
              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat).length;
                const pct   = Math.round((count / products.length) * 100);
                return (
                  <div key={cat} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="small fw-semibold">{cat}</span>
                      <span className="small text-muted">{count} items ({pct}%)</span>
                    </div>
                    <ProgressBar now={pct} style={{ height: 8, borderRadius: 8 }} />
                  </div>
                );
              })}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-3">
              <h6 className="fw-bold mb-0">⚠️ Alerts</h6>
            </Card.Header>
            <Card.Body className="d-flex flex-column gap-2">
              {lowStock > 0 ? (
                <Alert variant="warning" className="py-2 mb-0">
                  <strong>{lowStock}</strong> product(s) have low stock (&lt;10 units).{' '}
                  <span
                    className="text-primary"
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => setActiveTab('products')}
                  >
                    View
                  </span>
                </Alert>
              ) : (
                <Alert variant="success" className="py-2 mb-0">All products have sufficient stock ✅</Alert>
              )}
              {users.length === 0 ? (
                <Alert variant="info" className="py-2 mb-0">No users registered yet.</Alert>
              ) : (
                <Alert variant="success" className="py-2 mb-0">
                  <strong>{users.length}</strong> user(s) registered ✅
                </Alert>
              )}
              {orders.length === 0 && (
                <Alert variant="info" className="py-2 mb-0">No orders placed yet.</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent users quick view */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0">👥 Recent Users</h6>
          <Button size="sm" variant="outline-primary" onClick={() => setActiveTab('users')}>
            View All
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          {users.length === 0 ? (
            <p className="text-center text-muted py-3 mb-0">No users yet.</p>
          ) : (
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {users.slice(-5).reverse().map((u) => (
                  <tr key={u.id}>
                    <td className="fw-semibold">{u.name}</td>
                    <td className="text-muted small">{u.email}</td>
                    <td><Badge bg={u.role === 'admin' ? 'danger' : 'primary'}>{u.role || 'user'}</Badge></td>
                    <td className="text-muted small">{new Date(u.joinedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </>
  );

  /* ══════════════════════════════════════════════════════════════
     SECTION: Products
  ══════════════════════════════════════════════════════════════ */
  const renderProducts = () => (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="owner-section-title mb-0">📦 Manage Products</h5>
        <Button variant="primary" size="sm" onClick={openNew}>+ Add Product</Button>
      </div>
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id}>
                    <td className="text-muted small">{i + 1}</td>
                    <td>
                      <img src={p.image} alt={p.name}
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                    </td>
                    <td className="fw-semibold">{p.name}</td>
                    <td><Badge bg="secondary">{p.category}</Badge></td>
                    <td className="text-success fw-bold">₹{Number(p.price).toFixed(2)}</td>
                    <td>
                      <Badge bg={Number(p.stock) < 10 ? 'danger' : 'success'}>{p.stock}</Badge>
                    </td>
                    <td>⭐ {p.rating}</td>
                    <td className="text-center">
                      <Button variant="outline-success" size="sm" className="me-1" onClick={() => openEdit(p)}>
                        Edit
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => deleteProduct(p.id, p.name)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </>
  );

  /* ══════════════════════════════════════════════════════════════
     SECTION: Users
  ══════════════════════════════════════════════════════════════ */
  const renderUsers = () => (
    <>
      <h5 className="owner-section-title">👥 Registered Users</h5>
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {users.length === 0 ? (
            <p className="text-center text-muted py-4">No users registered yet.</p>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id}>
                      <td className="text-muted small">{i + 1}</td>
                      <td className="fw-semibold">{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <Badge bg={u.role === 'admin' ? 'danger' : 'primary'}>
                          {u.role || 'user'}
                        </Badge>
                      </td>
                      <td className="text-muted small">
                        {new Date(u.joinedAt).toLocaleDateString('en-IN', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );

  /* ══════════════════════════════════════════════════════════════
     SECTION: Orders
  ══════════════════════════════════════════════════════════════ */
  const renderOrders = () => (
    <>
      <h5 className="owner-section-title">🛒 Orders</h5>
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {orders.length === 0 ? (
            <div className="text-center py-5">
              <div className="fs-1">📋</div>
              <p className="text-muted mt-2">No orders yet. Orders will appear here after customers checkout.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr><th>#</th><th>User</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {orders.map((o, idx) => (
                    <tr key={idx}>
                      <td className="text-muted small">{idx + 1}</td>
                      <td>{o.user?.email || 'guest'}</td>
                      <td>{o.items?.length ?? '-'}</td>
                      <td className="text-success fw-bold">₹{Number(o.total ?? 0).toFixed(2)}</td>
                      <td className="text-muted small">{new Date(o.createdAt).toLocaleString()}</td>
                      <td><Badge bg="info">Processing</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );

  /* ══════════════════════════════════════════════════════════════
     MODAL: Add / Edit product
  ══════════════════════════════════════════════════════════════ */
  const renderModal = () => (
    <Modal show={showProdModal} onHide={closeModal} centered size="lg">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          {isNew ? '➕ Add New Product' : `✏️ Edit — ${editProduct?.name}`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {editProduct && (
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label className="fw-semibold small">Product Name</Form.Label>
                <Form.Control name="name" value={editProduct.name} onChange={handleChange} placeholder="e.g. Wireless Headphones" />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-semibold small">Category</Form.Label>
                <Form.Control name="category" value={editProduct.category} onChange={handleChange} placeholder="e.g. Electronics" />
              </Col>
              <Col md={4}>
                <Form.Label className="fw-semibold small">Price (₹)</Form.Label>
                <Form.Control type="number" step="0.01" min="0" name="price" value={editProduct.price} onChange={handleChange} />
              </Col>
              <Col md={4}>
                <Form.Label className="fw-semibold small">Stock</Form.Label>
                <Form.Control type="number" min="0" name="stock" value={editProduct.stock} onChange={handleChange} />
              </Col>
              <Col md={4}>
                <Form.Label className="fw-semibold small">Rating (0–5)</Form.Label>
                <Form.Control type="number" step="0.1" min="0" max="5" name="rating" value={editProduct.rating} onChange={handleChange} />
              </Col>
              <Col md={12}>
                <Form.Label className="fw-semibold small">Image URL</Form.Label>
                <Form.Control name="image" value={editProduct.image} onChange={handleChange} placeholder="https://..." />
              </Col>
              <Col md={12}>
                <Form.Label className="fw-semibold small">Description</Form.Label>
                <Form.Control as="textarea" rows={3} name="description" value={editProduct.description} onChange={handleChange} placeholder="Short product description..." />
              </Col>
            </Row>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button variant="light" onClick={closeModal}>Cancel</Button>
        <Button variant="primary" onClick={saveProduct}>
          {isNew ? 'Add Product' : 'Save Changes'}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  /* ══════════════════════════════════════════════════════════════
     MAIN RENDER
  ══════════════════════════════════════════════════════════════ */
  if (!isAdmin) return null; // redirecting in useEffect

  return (
    <div className="owner-shell">
      {/* ── SIDEBAR ── */}
      <aside className="owner-sidebar">
        <div className="owner-brand">
          <span className="owner-brand-icon">👑</span>
          <div>
            <div className="fw-bold text-white" style={{ fontSize: '1rem', lineHeight: 1.2 }}>
              Owner Panel
            </div>
            <div className="text-white-50" style={{ fontSize: '0.72rem' }}>
              {user?.name || 'Admin'}
            </div>
          </div>
        </div>

        <nav className="owner-nav">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`owner-nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => setActiveTab(item.key)}
            >
              <span className="owner-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="owner-sidebar-footer">
          <button className="owner-nav-item w-100" onClick={() => navigate('/')}>
            <span className="owner-nav-icon">🏪</span>
            <span>View Store</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="owner-main">
        {/* top bar */}
        <div className="owner-topbar">
          <div>
            <h4 className="mb-0 fw-bold">
              {menuItems.find((m) => m.key === activeTab)?.icon}{' '}
              {menuItems.find((m) => m.key === activeTab)?.label}
            </h4>
            <p className="text-muted mb-0 small">ShopEase Owner Dashboard</p>
          </div>
          <Badge bg="danger" className="px-3 py-2 fs-6">👑 Owner</Badge>
        </div>

        {/* toast */}
        {toast && (
          <Alert variant="success" className="py-2 mb-3">
            {toast}
          </Alert>
        )}

        {/* content */}
        <div className="owner-content">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'products'  && renderProducts()}
          {activeTab === 'users'     && renderUsers()}
          {activeTab === 'orders'    && renderOrders()}
        </div>
      </main>

      {/* modal */}
      {renderModal()}
    </div>
  );
}

export default Owner;
