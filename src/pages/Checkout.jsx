import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    address: '',
    city: '',
    zip: '',
    paymentMethod: 'Credit Card',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [error, setError] = useState('');

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!shippingInfo.fullName || !shippingInfo.address || !shippingInfo.city || !shippingInfo.zip) {
      setError('Please fill in all shipping details.');
      return;
    }
    
    // Construct Order
    const newOrder = {
      id: 'ORD-' + Math.floor(Math.random() * 100000000),
      user: {
        email: user?.email || 'guest',
        name: shippingInfo.fullName,
      },
      items: cartItems,
      total: cartTotal,
      createdAt: new Date().toISOString(),
      status: 'Processing',
      paymentMethod: shippingInfo.paymentMethod,
      shippingAddress: {
        address: shippingInfo.address,
        city: shippingInfo.city,
        zip: shippingInfo.zip
      }
    };

    // Save to LocalStorage
    const LOCAL_ORDERS_KEY = 'shopease_orders';
    const existingOrders = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify([...existingOrders, newOrder]));

    // Clear cart and redirect
    clearCart();
    navigate('/order-success', { state: { orderId: newOrder.id } });
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Checkout</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Row>
        <Col md={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header><h5 className="mb-0">Shipping & Billing Information</h5></Card.Header>
            <Card.Body>
              <Form onSubmit={handlePlaceOrder}>
                <h6 className="fw-bold mb-3">Shipping Address</h6>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control type="text" name="fullName" value={shippingInfo.fullName} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control type="text" name="address" value={shippingInfo.address} onChange={handleChange} required />
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City</Form.Label>
                      <Form.Control type="text" name="city" value={shippingInfo.city} onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>ZIP Code</Form.Label>
                      <Form.Control type="text" name="zip" value={shippingInfo.zip} onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                </Row>
                
                <h6 className="fw-bold mt-4 mb-3">Payment Method</h6>
                <Form.Group className="mb-4">
                  <Form.Select name="paymentMethod" value={shippingInfo.paymentMethod} onChange={handleChange}>
                    <option value="Credit Card">Credit/Debit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="GPay">Google Pay (GPay)</option>
                    <option value="Paytm">Paytm</option>
                    <option value="PhonePe">PhonePe</option>
                    <option value="Razorpay">Razorpay</option>
                    <option value="PayPal">PayPal</option>
                    <option value="BHIM UPI">BHIM UPI</option>
                    <option value="SuperMoney UPI">SuperMoney UPI</option>
                    <option value="Amazon Pay">Amazon Pay</option>
                  </Form.Select>
                </Form.Group>

                {shippingInfo.paymentMethod === 'Credit Card' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Card Number</Form.Label>
                      <Form.Control type="text" placeholder="1234 5678 9101 1121" name="cardNumber" value={shippingInfo.cardNumber} onChange={handleChange} />
                    </Form.Group>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Expiry Date</Form.Label>
                          <Form.Control type="text" placeholder="MM/YY" name="expiry" value={shippingInfo.expiry} onChange={handleChange} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>CVV</Form.Label>
                          <Form.Control type="text" placeholder="123" name="cvv" value={shippingInfo.cvv} onChange={handleChange} />
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}

                {shippingInfo.paymentMethod !== 'Credit Card' && (
                  <Alert variant="info" className="small">
                    You will be redirected to the securely hosted <strong>{shippingInfo.paymentMethod}</strong> portal to complete your payment after clicking "Place Order".
                  </Alert>
                )}

                <Button variant="success" type="submit" size="lg" className="w-100 mt-3">
                  Place Order
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Header><h5 className="mb-0">Order Summary</h5></Card.Header>
            <ListGroup variant="flush">
              {cartItems.map(item => (
                <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold">{item.name}</div>
                    <small className="text-muted">Qty: {item.quantity}</small>
                  </div>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </ListGroup.Item>
              ))}
              <ListGroup.Item className="d-flex justify-content-between align-items-center fw-bold fs-5 bg-light">
                <span>Total</span>
                <span className="text-success">₹{cartTotal.toFixed(2)}</span>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Checkout;
