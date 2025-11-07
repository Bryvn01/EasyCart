import React, { Suspense, useEffect, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import BottomNav from './components/BottomNav';
import BackToTop from './components/BackToTop';
import ProtectedRoute from './components/ProtectedRoute';
import StickyMiniCart from './components/StickyMiniCart';
import { Loading } from './components/ui';
import { Toaster } from 'react-hot-toast';
import SupportChat from './components/Chat/SupportChat';
import NetworkStatus from './components/NetworkStatus';
import InstallPWA from './components/InstallPWA';
import { usePerformance } from './hooks/usePerformance';

// Lazy load pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Orders = lazy(() => import('./pages/Orders'));
const Profile = lazy(() => import('./pages/Profile'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ProductManager = lazy(() => import('./components/Admin/ProductManager'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Configure React Query client with optimal settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 minutes - data stays fresh
      cacheTime: 10 * 60 * 1000,       // 10 minutes - cache retention
      refetchOnWindowFocus: false,     // Don't refetch on window focus
      refetchOnReconnect: true,        // Refetch on reconnect
      retry: 1,                         // Retry failed requests once
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
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
                  <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
                    <Navbar />
                    <main className="flex-1">
                      <Suspense fallback={
                        <div className="flex items-center justify-center min-h-[60vh]">
                          <Loading size="lg" className="py-20" />
                        </div>
                      }>
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
                {/* React Query DevTools - only in development */}
                {process.env.NODE_ENV === 'development' && (
                  <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
                )}
              </ThemeProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
