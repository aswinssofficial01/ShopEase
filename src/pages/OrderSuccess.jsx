import { Container, Card, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

function OrderSuccess() {
  const location = useLocation();
  const orderId = location.state?.orderId || 'Unknown';

  return (
    <Container className="py-5 d-flex justify-content-center">
      <Card className="text-center shadow-sm" style={{ maxWidth: '500px', width: '100%' }}>
        <Card.Body className="p-5">
          <div className="mb-4">
            <span style={{ fontSize: '4rem' }}>🎉</span>
          </div>
          <h2 className="fw-bold text-success mb-3">Order Placed Successfully!</h2>
          <p className="text-muted mb-4">
            Thank you for shopping with us. Your order has been received and is currently being processed.
          </p>
          <div className="bg-light p-3 rounded mb-4">
            <p className="mb-0 fw-semibold">Order ID: <span className="text-primary">{orderId}</span></p>
          </div>
          <Button as={Link} to="/products" variant="primary" size="lg" className="w-100">
            Continue Shopping
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default OrderSuccess;
