import { Link } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import CartItem from '../components/cart/CartItem';

function Cart() {
  const { cartItems, cartTotal, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <Container className="text-center py-5">
        <h2>Your Cart is Empty</h2>
        <p className="text-muted mb-4">Add some products to get started!</p>
        <Button as={Link} to="/products" variant="primary">
          Browse Products
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Shopping Cart</h1>
        <Button variant="outline-danger" size="sm" onClick={clearCart}>
          Clear Cart
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          {cartItems.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </Card.Body>
        <Card.Footer className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-0">
              Total: <span className="text-primary">₹{cartTotal.toFixed(2)}</span>
            </h4>
          </div>
          <div className="d-flex gap-2">
            <Button as={Link} to="/products" variant="outline-primary">
              Continue Shopping
            </Button>
            <Button as={Link} to="/checkout" variant="success">
              Checkout
            </Button>
          </div>
        </Card.Footer>
      </Card>
    </Container>
  );
}

export default Cart;
