import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <HomePage />,
  },
  {
    name: 'Products',
    path: '/products',
    element: <ProductsPage />,
  },
  {
    name: 'Product Detail',
    path: '/products/:slug',
    element: <ProductDetailPage />,
  },
  {
    name: 'Cart',
    path: '/cart',
    element: <CartPage />,
  },
  {
    name: 'Checkout',
    path: '/checkout',
    element: <CheckoutPage />,
  },
  {
    name: 'About',
    path: '/about',
    element: <AboutPage />,
  },
  {
    name: 'Contact',
    path: '/contact',
    element: <ContactPage />,
  },
  {
    name: 'Admin',
    path: '/admin',
    element: <AdminPage />,
  },
];

export default routes;
