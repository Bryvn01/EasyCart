import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import BottomNav from './components/BottomNav';
import BackToTop from './components/BackToTop';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import StickyMiniCart from './components/StickyMiniCart';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import { Loading } from './components/ui';
import { Toaster } from 'react-hot-toast';
import SupportChat from './components/Chat/SupportChat';
import NetworkStatus from './components/NetworkStatus';
import InstallPWA from './components/InstallPWA';
import { usePerformance } from './hooks/usePerformance';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import AdminProducts from './pages/AdminProducts';
import AdminDashboard from './pages/AdminDashboard';
import ProductManager from './components/Admin/ProductManager';
import NotFound from './pages/NotFound';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  usePerformance();

  useEffect(() => {
  // analytics.page('App Loaded');
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ThemeProvider>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <ScrollToTop />
                <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
                  <Navbar />
                  <main className="flex-1">
                    <Suspense fallback={<Loading size="lg" className="py-20" />}>
                      <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/products/:id" element={<ProductDetail />} />
                        <Route path="/cart" element={
                          <ProtectedRoute>
                            <Cart />
                          </ProtectedRoute>
                        } />
                        <Route path="/orders" element={
                          <ProtectedRoute>
                            <Orders />
                          </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        } />
                        <Route path="/wishlist" element={
                          <ProtectedRoute>
                            <Wishlist />
                          </ProtectedRoute>
                        } />
                        <Route path="/admin/products" element={
                          <ProtectedRoute requireAdmin={true}>
                            <AdminProducts />
                          </ProtectedRoute>
                        } />
                        <Route path="/admin/dashboard" element={
                          <ProtectedRoute requireAdmin={true}>
                            <AdminDashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/admin/manage" element={
                          <ProtectedRoute requireAdmin={true}>
                            <ProductManager />
                          </ProtectedRoute>
                        } />
                        <Route path="/admin" element={
                          <ProtectedRoute requireAdmin={true}>
                            <AdminDashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </main>
                  <Footer />
                  <BottomNav />
                  <StickyMiniCart />
                  <BackToTop />
                  <SupportChat />
                  <NetworkStatus />
                  <InstallPWA />
                  <PWAInstallPrompt />
                  <OfflineIndicator />
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                        padding: '16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                      },
                      success: {
                        duration: 3000,
                        iconTheme: {
                          primary: '#10b981',
                          secondary: '#fff',
                        },
                      },
                      error: {
                        duration: 4000,
                        iconTheme: {
                          primary: '#ef4444',
                          secondary: '#fff',
                        },
                      },
                      loading: {
                        iconTheme: {
                          primary: '#3b82f6',
                          secondary: '#fff',
                        },
                      },
                    }}
                  />
                </div>
              </Router>
            </ThemeProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
