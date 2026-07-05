import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Badge } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleViewDetails = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isAuthenticated) {
      // Redirect to login page and save the product details page path to state.from
      navigate('/login', { state: { from: { pathname: `/products/${product.id}` } } });
    } else {
      navigate(`/products/${product.id}`);
    }
  };

  const handleAddToCart = (e) => {
    if (e) {
      e.stopPropagation();
    }
    if (!isAuthenticated) {
      // Redirect to login page and save the current products page to state.from
      navigate('/login', { state: { from: location } });
      return;
    }
    addToCart(product);
  };

  return (
    <Card 
      className="product-card h-100 shadow-sm"
      onClick={handleViewDetails}
      style={{ cursor: 'pointer' }}
    >
      <Card.Img
        variant="top"
        src={product.image}
        alt={product.name}
        className="product-image"
      />
      <Card.Body className="d-flex flex-column">
        <Badge bg="secondary" className="mb-2 align-self-start">
          {product.category}
        </Badge>
        <Card.Title className="mb-2">{product.name}</Card.Title>
        <p className="fs-5 fw-bold text-primary mb-3">₹{Number(product.price).toFixed(2)}</p>
        <div className="d-grid gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
          <Button variant="primary" size="sm" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;
