import { Container, Card, Row, Col, Badge, Table } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';

function Profile() {
  const { user } = useAuth();
  const { cartItems, cartTotal } = useCart();
  const [userOrders, setUserOrders] = useState([]);

  useEffect(() => {
    const allOrders = JSON.parse(localStorage.getItem('shopease_orders') || '[]');
    const myOrders = allOrders.filter(o => o.user?.email === user.email);
    // Sort by newest first
    myOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setUserOrders(myOrders);
  }, [user.email]);

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Container>
      <h1 className="mb-4">My Profile</h1>
      <Row className="g-4">
        <Col md={4}>
          <Card className="shadow-sm text-center">
            <Card.Body className="py-5">
              <div className="profile-avatar rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                {initials}
              </div>
              <h3>{user.name}</h3>
              <p className="text-muted">{user.email}</p>
              <Badge bg={user.role === 'admin' ? 'danger' : 'success'}>
                {user.role || 'user'}
              </Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header>Account Details</Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col sm={4} className="text-muted">
                  Full Name
                </Col>
                <Col sm={8}>{user.name}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4} className="text-muted">
                  Email
                </Col>
                <Col sm={8}>{user.email}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4} className="text-muted">
                  Role
                </Col>
                <Col sm={8}>
                  <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                    {user.role || 'user'}
                  </Badge>
                </Col>
              </Row>
              <Row>
                <Col sm={4} className="text-muted">
                  Member Since
                </Col>
                <Col sm={8}>
                  {new Date(user.joinedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Header>Order Summary</Card.Header>
            <Card.Body>
              <Row>
                <Col sm={4} className="text-muted">
                  Items in Cart
                </Col>
                <Col sm={8}>{cartItems.length}</Col>
              </Row>
              <Row className="mt-3">
                <Col sm={4} className="text-muted">
                  Cart Total
                </Col>
                <Col sm={8} className="fw-bold text-primary">
                  ₹{cartTotal.toFixed(2)}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mt-4">
            <Card.Header>Order History</Card.Header>
            <Card.Body className="p-0">
              {userOrders.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  You haven't placed any orders yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userOrders.map(order => (
                        <tr key={order.id}>
                          <td className="fw-semibold text-primary">{order.id}</td>
                          <td className="text-muted small">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="text-success fw-bold">₹{Number(order.total).toFixed(2)}</td>
                          <td>
                            <Badge bg={order.status === 'Processing' ? 'info' : 'success'}>
                              {order.status || 'Processing'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Profile;
