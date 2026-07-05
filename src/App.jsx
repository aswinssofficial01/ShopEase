import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

import { Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';

function App() {
  return (

      <Routes>
        <Route element={<Layout/>}>
          <Route path="/" element={<Products/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/products" element={<Products/>} />
          <Route path="/products/:id" element={<ProductDetails/>} />
          <Route path="/cart" element={<Cart/>} />
          <Route path="/checkout" element={<Checkout/>} />
          <Route path="/order-success" element={<OrderSuccess/>} />
          <Route
            path="/profile"
            element={<ProtectedRoute><Profile/></ProtectedRoute>}
          />
        </Route>
        {/* Admin login - outside Layout so it gets its own full-page design */}
        <Route path="/admin-login" element={<AdminLogin />} />
        {/* Protected admin routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>

  );
}

export default App;
