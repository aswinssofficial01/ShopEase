import { Row, Col, Button, Form } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';

function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <Row className="align-items-center border-bottom py-3">
      <Col xs={3} md={2}>
        <img
          src={item.image}
          alt={item.name}
          className="img-fluid rounded"
          style={{ maxHeight: '80px', objectFit: 'cover' }}
        />
      </Col>
      <Col xs={9} md={4}>
        <h6 className="mb-0">{item.name}</h6>
        <small className="text-muted">₹{item.price.toFixed(2)} each</small>
      </Col>
      <Col xs={6} md={3} className="mt-2 mt-md-0">
        <Form.Select
          size="sm"
          value={item.quantity}
          onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
          style={{ maxWidth: '80px' }}
        >
          {[...Array(10)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </Form.Select>
      </Col>
      <Col xs={4} md={2} className="text-md-end mt-2 mt-md-0">
        <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
      </Col>
      <Col xs={2} md={1} className="text-end mt-2 mt-md-0">
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => removeFromCart(item.id)}
        >
          &times;
        </Button>
      </Col>
    </Row>
  );
}

export default CartItem;
