const products = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 79.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    description:
      'Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear sound quality. Perfect for music lovers and professionals.',
    rating: 4.5,
    stock: 25,
  },
  {
    id: 2,
    name: 'Smart Watch',
    price: 199.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
    description:
      'Feature-rich smartwatch with health tracking, GPS, heart rate monitor, and water resistance. Stay connected and healthy on the go.',
    rating: 4.7,
    stock: 18,
  },
  {
    id: 3,
    name: 'Leather Backpack',
    price: 89.99,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
    description:
      'Handcrafted genuine leather backpack with multiple compartments, laptop sleeve, and adjustable straps. Stylish and functional for everyday use.',
    rating: 4.3,
    stock: 30,
  },
  {
    id: 4,
    name: 'Running Shoes',
    price: 129.99,
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
    description:
      'Lightweight running shoes with responsive cushioning and breathable mesh upper. Engineered for comfort during long runs and daily workouts.',
    rating: 4.6,
    stock: 40,
  },
  {
    id: 5,
    name: 'Coffee Maker',
    price: 59.99,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=300&fit=crop',
    description:
      'Programmable drip coffee maker with thermal carafe, brew strength control, and auto shut-off. Start your mornings with the perfect cup.',
    rating: 4.2,
    stock: 15,
  },
  {
    id: 6,
    name: 'Bluetooth Speaker',
    price: 49.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop',
    description:
      'Portable Bluetooth speaker with 360-degree sound, 12-hour playtime, and IPX7 waterproof rating. Take your music anywhere.',
    rating: 4.4,
    stock: 35,
  },
  {
    id: 7,
    name: 'Yoga Mat',
    price: 34.99,
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=300&fit=crop',
    description:
      'Non-slip eco-friendly yoga mat with extra cushioning and carrying strap. Ideal for yoga, pilates, and floor exercises.',
    rating: 4.1,
    stock: 50,
  },
  {
    id: 8,
    name: 'Desk Lamp',
    price: 39.99,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop',
    description:
      'Modern LED desk lamp with adjustable brightness, color temperature control, and USB charging port. Reduce eye strain while working.',
    rating: 4.0,
    stock: 22,
  },
];

export const getProductById = (id) =>
  products.find((product) => product.id === Number(id));

export default products;
