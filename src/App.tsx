import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/layouts/Header';
import { Footer } from '@/components/layouts/Footer';
import { CartProvider } from '@/contexts/CartContext';
import { AdminProvider } from '@/contexts/AdminContext';

import routes from './routes';

const App: React.FC = () => {
  return (
    <Router>
      <AdminProvider>
        <CartProvider>
          <IntersectObserver />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                {routes.map((route, index) => (
                  <Route key={index} path={route.path} element={route.element} />
                ))}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster />
        </CartProvider>
      </AdminProvider>
    </Router>
  );
};

export default App;
