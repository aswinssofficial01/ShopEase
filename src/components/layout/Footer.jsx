import { Container } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container className="text-center">
        <p className="mb-1">&copy; {new Date().getFullYear()} ShopEase. All rights reserved.</p>
        <small className="text-muted">Your one-stop shop for quality products.</small>
      </Container>
    </footer>
  );
}

export default Footer;
