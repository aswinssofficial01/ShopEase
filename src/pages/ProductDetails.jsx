import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import defaultProducts from '../data/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('shopease_products_override');
    const list = saved ? JSON.parse(saved) : defaultProducts;
    const found = list.find((p) => p.id === Number(id));
    setProduct(found || null);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <p>Loading...</p>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="text-center py-5" style={{ background: 'linear-gradient(135deg, #f0f4ff, #e0e8ff)', borderRadius: '12px', padding: '40px' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Product Not Found</h2>
        <p className="text-muted" style={{ marginBottom: '30px', fontSize: '1.1rem' }}>Oops! We couldn’t locate the product you’re looking for. It might have been removed or the link is incorrect.</p>
        <Button variant="primary" size="lg" style={{ padding: '12px 30px' }} onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Container>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  const maxQuantity = Math.min(product.stock, 10);

  return (
    <Container className="py-4">
      <Button as={Link} to="/products" variant="link" className="mb-3 ps-0">
        &larr; Back to Products
      </Button>

      {added && (
        <Alert variant="success" dismissible onClose={() => setAdded(false)}>
          {product.name} added to cart!
        </Alert>
      )}

      <Row className="g-4 align-items-start">
        <Col lg={6}>
          <div className="detail-image-wrapper rounded shadow bg-light p-3">
            <img
              src={product.image}
              alt={product.name}
              className="detail-image"
            />
          </div>
        </Col>
        <Col lg={6}>
          <h1 className="mb-3">{product.name}</h1>
          <p className="display-6 text-primary fw-bold mb-4">
            ₹{Number(product.price).toFixed(2)}
          </p>
          <p className="lead text-muted mb-4">{product.description}</p>

          {maxQuantity > 0 && (
            <div className="d-flex align-items-center gap-3 mb-4">
              <label htmlFor="quantity" className="fw-semibold mb-0">
                Quantity:
              </label>
              <select
                id="quantity"
                className="form-select"
                style={{ width: '90px' }}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              >
                {[...Array(maxQuantity)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            Add to Cart
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default ProductDetails;
