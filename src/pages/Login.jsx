import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const MIN_PASSWORD_LENGTH = 6;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialForm = { email: '', password: '' };
const initialTouched = { email: false, password: false };

function validateEmail(email) {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Email is required';
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid email address';
  }
  return '';
}

function validatePassword(password) {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return '';
}

function validateForm(values) {
  return {
    email: validateEmail(values.email),
    password: validatePassword(values.password),
  };
}

function Login() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState(initialTouched);
  const [authError, setAuthError] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/products';

  useEffect(() => {
    setAuthError('');
  }, [form.email, form.password]);

  const showFieldError = useCallback(
    (field) => (touched[field] || submitAttempted) && errors[field],
    [touched, submitAttempted, errors],
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      if (touched[name] || submitAttempted) {
        setErrors((prev) => ({
          ...prev,
          [name]: name === 'email' ? validateEmail(value) : validatePassword(value),
        }));
      }
    },
    [touched, submitAttempted],
  );

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: name === 'email' ? validateEmail(value) : validatePassword(value),
    }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setSubmitAttempted(true);
      setTouched({ email: true, password: true });

      const fieldErrors = validateForm(form);
      setErrors(fieldErrors);

      if (fieldErrors.email || fieldErrors.password) {
        return;
      }

      const result = login(form.email.trim(), form.password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setAuthError(result.message);
      }
    },
    [form, login, navigate, from],
  );

  const currentErrors = validateForm(form);
  const hasClientErrors = Boolean(currentErrors.email || currentErrors.password);
  const isSubmitDisabled =
    !form.email.trim() || !form.password || (submitAttempted && hasClientErrors);

  return (
    <Container>
      <Card className="auth-card shadow">
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">Login</h2>
          {authError && <Alert variant="danger">{authError}</Alert>}
          <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3" controlId="loginEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={Boolean(showFieldError('email'))}
                autoComplete="email"
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="loginPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={Boolean(showFieldError('password'))}
                autoComplete="current-password"
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>
            <Button
              type="submit"
              variant="primary"
              className="w-100"
              disabled={isSubmitDisabled}
            >
              Login
            </Button>
          </Form>
          <p className="text-center mt-3 mb-0">Don’t have an account? <Link to="/register">Register</Link></p>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;
