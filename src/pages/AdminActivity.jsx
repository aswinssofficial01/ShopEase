import { useEffect, useState } from 'react';
import { Table, Container, Card, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

/*
  AdminActivity page – displays login history for all users.
  Admins can view each user's email, name, and a list of timestamps when they logged in.
*/
function AdminActivity() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Load users directly from localStorage (same key used in AuthContext)
    const stored = localStorage.getItem('shopease_users');
    const parsed = stored ? JSON.parse(stored) : [];
    setUsers(parsed);
  }, []);

  if (!isAdmin) {
    return (
      <Container className="mt-5">
        <h3 className="text-danger">Access denied – admin only.</h3>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">User Login Activity</h4>
        </Card.Header>
        <Card.Body>
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <Table hover responsive>
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Login History</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u.id || idx}>
                    <td>{idx + 1}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      {u.loginHistory && u.loginHistory.length > 0 ? (
                        <ul className="list-unstyled mb-0">
                          {u.loginHistory.map((ts, i) => (
                            <li key={i} className="small">
                              <Badge bg="info" className="me-1">{new Date(ts).toLocaleDateString()}</Badge>
                              {new Date(ts).toLocaleTimeString()}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted">No logins</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AdminActivity;
