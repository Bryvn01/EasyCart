import React, { Suspense, useEffect, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { Loading } from './components/ui';
import { Toaster } from 'react-hot-toast';
import SupportChat from './components/Chat/SupportChat';
import { usePerformance } from './hooks/usePerformance';
import { analytics } from './services/analytics';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Orders = lazy(() => import('./pages/Orders'));
const Profile = lazy(() => import('./pages/Profile'));
const Wishlist = lazy(() => import('./pages/Wishlist'));

// Admin pages - separate chunk
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ProductManager = lazy(() => import('./components/Admin/ProductManager'));

function App() {
  usePerformance();
  
  useEffect(() => {
    analytics.page('App Loaded');
  }, []);
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ThemeProvider>
              <Router>
                <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
                  <Navbar />
                  <main className="flex-1">
                    <Suspense fallback={<Loading size="lg" className="py-20" />}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/products/:id" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/admin/products" element={<AdminProducts />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/manage" element={<ProductManager />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                      </Routes>
                    </Suspense>
                  </main>
                  <Footer />
                  <SupportChat />
                  <Toaster 
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                      },
                    }}
                  />
                </div>
              </Router>
            </ThemeProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
