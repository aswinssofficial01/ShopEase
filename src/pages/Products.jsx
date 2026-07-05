import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup } from 'react-bootstrap';
import defaultProducts from '../data/products';
import ProductCard from '../components/products/ProductCard';

function Products() {
  const [productsList, setProductsList] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const saved = localStorage.getItem('shopease_products_override');
    setProductsList(saved ? JSON.parse(saved) : defaultProducts);
  }, []);

  const categories = ['All', ...new Set(productsList.map((p) => p.category))];

  const filteredProducts = productsList.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || product.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <Container>
      <h1 className="mb-4">Our Products</h1>

      <Row className="mb-4 g-3">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {filteredProducts.length === 0 ? (
        <p className="text-center text-muted py-5">No products found matching your criteria.</p>
      ) : (
        <Row className="g-4">
          {filteredProducts.map((product) => (
            <Col key={product.id} sm={6} lg={4} xl={3}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default Products;
